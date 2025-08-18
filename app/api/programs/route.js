import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import { getDbAndProgramModel } from "@/lib/getDbModel";
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

const getSessionAndModel = async () => {
  await connectDB();
  const session = await getServerSession(authOptions);
  const department = session?.user?.department;
  if (!department) throw new Error("Unauthorized or missing department");
  return getDbAndProgramModel(department); // returns { db, Program }
};

// ===========================
// Helper: Save uploaded file
// ===========================
async function saveFile(file, department) {
  if (!file || file.size === 0) {
    throw new Error('No file provided');
  }

  // Create upload directory if it doesn't exist
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'programs', department);
  await mkdir(uploadDir, { recursive: true });

  // Generate unique filename
  const timestamp = Date.now();
  const originalName = file.name;
  const extension = path.extname(originalName);
  const nameWithoutExt = path.basename(originalName, extension);
  const uniqueFilename = `${nameWithoutExt}_${timestamp}${extension}`;
  
  const filepath = path.join(uploadDir, uniqueFilename);
  
  // Convert file to buffer and save
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  await writeFile(filepath, buffer);
  
  // Return relative path for storing in database
  const relativePath = `/uploads/programs/${department}/${uniqueFilename}`;
  
  return {
    filename: originalName,
    filepath: relativePath,
    uploadDate: new Date()
  };
}

// ===========================
// GET - Fetch all programs
// ===========================
export async function GET() {
  try {
    const { Program } = await getSessionAndModel();
    const programs = await Program.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, programs });
  } catch (err) {
    console.error('GET error:', err);
    return NextResponse.json({ success: false, message: 'Failed to fetch programs' }, { status: 500 });
  }
}

// ===========================
// Helper: Parse FormData into nested object with file handling
// ===========================
async function parseFormDataWithFiles(form, department) {
  const data = {
    no_of_students: { Male: '', Female: '' },
    no_of_seats: { josaa: '', csab: '', dasa: '' },
    scheme: []
  };

  // First pass: collect all non-file data and identify scheme structure
  const schemeFiles = new Map(); // Map to store files by index
  const schemeTitles = new Map(); // Map to store titles by index

  for (const [key, value] of form.entries()) {
    if (key.startsWith("no_of_students[")) {
      const field = key.match(/no_of_students\[(.+)\]/)[1];
      data.no_of_students[field] = value;
    } else if (key.startsWith("no_of_seats[")) {
      const field = key.match(/no_of_seats\[(.+)\]/)[1];
      data.no_of_seats[field] = value;
    } else if (key.startsWith("scheme[")) {
      const match = key.match(/scheme\[(\d+)\]\[(.+)\]/);
      if (match) {
        const index = parseInt(match[1], 10);
        const field = match[2]; // "title" or "file"
        
        if (field === 'title') {
          schemeTitles.set(index, value);
        } else if (field === 'file') {
          schemeFiles.set(index, value);
        }
      }
    } else {
      data[key] = value;
    }
  }

  // Second pass: process scheme data with file uploads
  const schemeIndices = [...new Set([...schemeTitles.keys(), ...schemeFiles.keys()])].sort((a, b) => a - b);
  
  for (const index of schemeIndices) {
    const title = schemeTitles.get(index);
    const file = schemeFiles.get(index);
    
    if (!title || !file) {
      throw new Error(`Missing title or file for scheme item ${index}`);
    }

    // Validate file type (PDF only)
    if (!file.type.includes('pdf')) {
      throw new Error(`File at scheme ${index} must be a PDF. Got: ${file.type}`);
    }

    // Save the file and get file info
    const fileInfo = await saveFile(file, department);
    
    data.scheme[index] = {
      title: title,
      filename: fileInfo.filename,
      filepath: fileInfo.filepath,
      uploadDate: fileInfo.uploadDate
    };
  }

  return data;
}

// ===========================
// POST - Add a new program
// ===========================
export async function POST(req) {
  try {
    const { Program } = await getSessionAndModel();
    const session = await getServerSession(authOptions);
    const department = session?.user?.department;
    
    const form = await req.formData();
    const body = await parseFormDataWithFiles(form, department);

    console.log("Received program data:", body);

    const { title, category, no_of_students, no_of_seats, scheme } = body;

    // Validation
    if (
      !title || !category ||
      !no_of_students?.Male || !no_of_students?.Female ||
      !no_of_seats?.josaa || !no_of_seats?.csab || !no_of_seats?.dasa ||
      !Array.isArray(scheme) || scheme.length === 0 ||
      scheme.some(s => !s.title || !s.filename || !s.filepath)
    ) {
      return NextResponse.json({ error: 'Missing required fields or files' }, { status: 400 });
    }

    const newProgram = new Program(body);
    await newProgram.save();

    return NextResponse.json({ message: 'Program added successfully', program: newProgram }, { status: 201 });
  } catch (err) {
    console.error('Error adding program:', err);
    return NextResponse.json({ 
      error: err.message || 'Server error',
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    }, { status: 500 });
  }
}

// ===========================
// DELETE - Delete program
// ===========================
export async function DELETE(req) {
  try {
    const { Program } = await getSessionAndModel();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing ID" }, { status: 400 });
    }

    const deleted = await Program.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: "Program not found" }, { status: 404 });
    }

    // TODO: Optionally delete associated files from filesystem
    // You might want to add file cleanup logic here

    return NextResponse.json({ success: true, message: "Program deleted" }, { status: 200 });
  } catch (err) {
    console.error("DELETE error:", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

// ===========================
// PATCH - Update program
// ===========================
export async function PATCH(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing ID" }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    const department = session?.user?.department;
    const formData = await req.formData();
    const updates = {};

    // Check what's being updated
    const hasSchemeUpdates = [...formData.keys()].some(key => key.startsWith("scheme["));
    const hasStudentsUpdates = [...formData.keys()].some(key => key.startsWith("no_of_students["));
    const hasSeatsUpdates = [...formData.keys()].some(key => key.startsWith("no_of_seats["));

    // Handle basic fields (non-nested)
    for (const [key, value] of formData.entries()) {
      if (!key.startsWith("scheme[") && !key.startsWith("no_of_students[") && !key.startsWith("no_of_seats[")) {
        updates[key] = value;
      }
    }

    // Only parse nested objects if they're actually being updated
    if (hasStudentsUpdates || hasSeatsUpdates || hasSchemeUpdates) {
      // Initialize the nested objects in updates
      if (hasStudentsUpdates) {
        updates.no_of_students = { Male: '', Female: '' };
      }
      if (hasSeatsUpdates) {
        updates.no_of_seats = { josaa: '', csab: '', dasa: '' };
      }

      // Parse the nested data
      for (const [key, value] of formData.entries()) {
        if (key.startsWith("no_of_students[") && hasStudentsUpdates) {
          const field = key.match(/no_of_students\[(.+)\]/)[1];
          updates.no_of_students[field] = value;
        } else if (key.startsWith("no_of_seats[") && hasSeatsUpdates) {
          const field = key.match(/no_of_seats\[(.+)\]/)[1];
          updates.no_of_seats[field] = value;
        }
      }

      // Handle scheme updates if present
      if (hasSchemeUpdates) {
        const schemeFiles = new Map();
        const schemeTitles = new Map();

        for (const [key, value] of formData.entries()) {
          if (key.startsWith("scheme[")) {
            const match = key.match(/scheme\[(\d+)\]\[(.+)\]/);
            if (match) {
              const index = parseInt(match[1], 10);
              const field = match[2];
              
              if (field === 'title') {
                schemeTitles.set(index, value);
              } else if (field === 'file') {
                schemeFiles.set(index, value);
              }
            }
          }
        }

        // Process scheme data
        const schemeIndices = [...new Set([...schemeTitles.keys(), ...schemeFiles.keys()])].sort((a, b) => a - b);
        updates.scheme = [];
        
        for (const index of schemeIndices) {
          const title = schemeTitles.get(index);
          const file = schemeFiles.get(index);
          
          if (!title) {
            throw new Error(`Missing title for scheme item ${index}`);
          }

          if (file && file.size > 0) {
            // New file uploaded
            if (!file.type.includes('pdf')) {
              throw new Error(`File at scheme ${index} must be a PDF. Got: ${file.type}`);
            }
            const fileInfo = await saveFile(file, department);
            updates.scheme[index] = {
              title: title,
              filename: fileInfo.filename,
              filepath: fileInfo.filepath,
              uploadDate: fileInfo.uploadDate
            };
          } else {
            // No new file, keep existing file info but update title
            // We need to get the existing program to preserve file info
            const { Program } = await getSessionAndModel();
            const existingProgram = await Program.findById(id);
            
            if (existingProgram && existingProgram.scheme[index]) {
              updates.scheme[index] = {
                title: title,
                filename: existingProgram.scheme[index].filename,
                filepath: existingProgram.scheme[index].filepath,
                uploadDate: existingProgram.scheme[index].uploadDate
              };
            } else {
              throw new Error(`Missing file for new scheme item ${index}`);
            }
          }
        }
      }
    }

    const { Program } = await getSessionAndModel();

    // Use findByIdAndUpdate with validation disabled for partial updates
    const updated = await Program.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: false, // Disable validation for partial updates
    });

    if (!updated) {
      return NextResponse.json({ success: false, error: "Program not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Program updated", program: updated });
  } catch (err) {
    console.error("PATCH error:", err);
    return NextResponse.json({ 
      success: false, 
      error: err.message || "Server error",
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    }, { status: 500 });
  }
}