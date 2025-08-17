
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/lib/auth"; 
import connectDB from '@/lib/db';
import Gallery from '@/models/Gallery';

export async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    const reorderData = await request.json();
    
    if (!Array.isArray(reorderData)) {
      return NextResponse.json(
        { error: 'Invalid payload - Expected array of objects' },
        { status: 400 }
      );
    }

    for (const item of reorderData) {
      if (!item._id || typeof item.order !== 'number') {
        return NextResponse.json(
          { error: 'Invalid payload - Each item must have _id and order' },
          { status: 400 }
        );
      }
    }

    await connectDB();

    const updatePromises = reorderData.map(async (item) => {
      // Using MongoDB/Mongoose
      return await Gallery.findByIdAndUpdate(
        item._id,
        { 
          order: item.order,
          updatedAt: new Date()
        },
        { 
          new: true,
          runValidators: true
        }
      );
    });

    // Execute all updates
    const results = await Promise.all(updatePromises);

    return NextResponse.json({
      success: true,
      message: 'Gallery order updated successfully',
      updatedItems: results.length,
      data: results
    });

  } catch (error) {
    console.error('Gallery reorder error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

