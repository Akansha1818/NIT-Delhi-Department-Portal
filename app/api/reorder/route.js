import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/lib/auth"; // Adjust path as needed
// Import your database connection/model here
// import { connectToDatabase } from '@/lib/mongodb';
// import Gallery from '@/models/Gallery';

// For App Router (Next.js 13+)
export async function PATCH(request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    // Parse request body
    const reorderData = await request.json();
    
    // Validate the payload
    if (!Array.isArray(reorderData)) {
      return NextResponse.json(
        { error: 'Invalid payload - Expected array of objects' },
        { status: 400 }
      );
    }

    // Validate each item in the array
    for (const item of reorderData) {
      if (!item._id || typeof item.order !== 'number') {
        return NextResponse.json(
          { error: 'Invalid payload - Each item must have _id and order' },
          { status: 400 }
        );
      }
    }

    // Connect to database (adjust based on your setup)
    await connectToDatabase();

    // Update each gallery item's order
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