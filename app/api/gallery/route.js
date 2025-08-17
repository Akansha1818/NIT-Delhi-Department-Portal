// app/api/gallery/route.js
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/lib/auth"; 
import connectDB from '@/lib/db';
import Gallery from '@/models/Gallery';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    await connectDB();

    const images = await Gallery.find({ user: session.user.email })
      .sort({ order: 1, eventDate: -1 }) 
      .lean();
    
    return NextResponse.json(images, { status: 200 });
  } catch (error) {
    console.error('Error fetching gallery:', error);
    return NextResponse.json(
      { error: 'Failed to fetch gallery images' }, 
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();
    const { eventName, eventDate, place, time, url, name, size } = body;
    
    if (!eventName || !eventDate || !url || !name) {
      return NextResponse.json(
        { error: 'Missing required fields: eventName, eventDate, url, name' }, 
        { status: 400 }
      );
    }

    const maxOrderItem = await Gallery.findOne({ user: session.user.email })
      .sort({ order: -1 })
      .select('order');
    
    const nextOrder = (maxOrderItem?.order || 0) + 1;
    
    const newImage = new Gallery({
      eventName: eventName.trim(),
      eventDate,
      place: place?.trim() || '',
      time: time?.trim() || '',
      url,
      name,
      size: size || '',
      user: session.user.email,
      order: nextOrder
    });
    
    const savedImage = await newImage.save();
    
    return NextResponse.json(savedImage, { status: 201 });
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' }, 
      { status: 500 }
    );
  }
}