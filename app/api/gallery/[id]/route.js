// app/api/gallery/[id]/route.js
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/lib/auth"; // Adjust path as needed
import connectDB from '@/lib/db';
import Gallery from '@/models/Gallery';
import mongoose from 'mongoose';

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    await connectDB();

    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid image ID' }, 
        { status: 400 }
      );
    }
    
    const deletedImage = await Gallery.findOneAndDelete({
      _id: id,
      user: session.user.email
    });
    
    if (!deletedImage) {
      return NextResponse.json(
        { error: 'Image not found or unauthorized' }, 
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { message: 'Image deleted successfully' }, 
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting image:', error);
    return NextResponse.json(
      { error: 'Failed to delete image' }, 
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    await connectDB();

    const { id } = await params;
    const body = await request.json();
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid image ID' }, 
        { status: 400 }
      );
    }
    
    const { eventName, eventDate, place, time } = body;
    
    if (!eventName || !eventDate) {
      return NextResponse.json(
        { error: 'Missing required fields: eventName, eventDate' }, 
        { status: 400 }
      );
    }
    
    const updatedImage = await Gallery.findOneAndUpdate(
      { _id: id, user: session.user.email },
      {
        eventName: eventName.trim(),
        eventDate,
        place: place?.trim() || '',
        time: time?.trim() || '',
      },
      { new: true, runValidators: true }
    );
    
    if (!updatedImage) {
      return NextResponse.json(
        { error: 'Image not found or unauthorized' }, 
        { status: 404 }
      );
    }
    
    return NextResponse.json(updatedImage, { status: 200 });
  } catch (error) {
    console.error('Error updating image:', error);
    return NextResponse.json(
      { error: 'Failed to update image' }, 
      { status: 500 }
    );
  }
}