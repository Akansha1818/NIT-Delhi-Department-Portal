import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import { getDbAndProgramModel } from "@/lib/getDbModel";

const getSessionAndModel = async () => {
  await connectDB();
  const session = await getServerSession(authOptions);
  const department = session?.user?.department;
  if (!department) throw new Error("Unauthorized or missing department");
  return getDbAndProgramModel(department); // returns { db, Program }
};

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
// Helper: Parse FormData into nested object
// ===========================
function parseFormData(form) {
  const data = {
    no_of_students: { Male: '', Female: '' },
    no_of_seats: { josaa: '', csab: '', dasa: '' },
    scheme: []
  };

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
        const field = match[2];
        if (!data.scheme[index]) data.scheme[index] = { title: '', url: '' };
        data.scheme[index][field] = value;
      }
    } else {
      data[key] = value;
    }
  }
  return data;
}

// ===========================
// POST - Add a new program
// ===========================
export async function POST(req) {
  try {
    const { Program } = await getSessionAndModel();
    const form = await req.formData();
    const body = parseFormData(form);

    console.log("Received program data:", body);

    const { title, category, no_of_students, no_of_seats, scheme } = body;

    if (
      !title || !category ||
      !no_of_students?.Male || !no_of_students?.Female ||
      !no_of_seats?.josaa || !no_of_seats?.csab || !no_of_seats?.dasa ||
      !Array.isArray(scheme)
    ) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newProgram = new Program(body);
    await newProgram.save();

    return NextResponse.json({ message: 'Program added successfully' }, { status: 201 });
  } catch (err) {
    console.error('Error adding program:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
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

    const formData = await req.formData();
    const updates = {};

    for (const [key, value] of formData.entries()) {
      if (["no_of_students", "no_of_seats", "scheme"].includes(key)) {
        try {
          updates[key] = JSON.parse(value); // Convert string back to object/array
        } catch (e) {
          console.warn(`Failed to parse ${key}:`, value);
          updates[key] = value; // fallback
        }
      } else {
        updates[key] = value;
      }
    }

    const { Program } = await getSessionAndModel();

    const updated = await Program.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return NextResponse.json({ success: false, error: "Program not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Program updated", program: updated });
  } catch (err) {
    console.error("PATCH error:", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}