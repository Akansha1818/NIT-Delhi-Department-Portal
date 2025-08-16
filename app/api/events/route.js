export const runtime = "nodejs";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import { getDbAndEventModel } from "@/lib/getDbModel";
import Busboy from "busboy";
import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { Readable } from "stream";

const getSessionAndModel = async () => {
  await connectDB();
  const session = await getServerSession(authOptions);
  const department = session?.user?.department;
  if (!session || !department) throw new Error("Unauthorized or missing department");
  return getDbAndEventModel(department);
};

// ==========================
// GET - Fetch Events
// ==========================
export async function GET() {
  try {
    const { Event } = await getSessionAndModel();
    const events = await Event.find().sort({ startdate: -1 });
    return NextResponse.json({ success: true, events });
  } catch (err) {
    console.error("GET error:", err);
    return NextResponse.json({ success: false, message: "Failed to fetch events" }, { status: 500 });
  }
}

// ==========================
// POST - Create Event
// ==========================
export async function POST(req) {
  try {
    const { Event, gfs } = await getSessionAndModel();
    const headers = Object.fromEntries(req.headers);
    const busboy = Busboy({ headers });
    const filePromises = [];
    const eventFields = {};

    busboy.on("file", (field, fileStream, filename, _, mimetype) => {
      const safeFilename = `${Date.now()}-${filename}`;
      const uploadStream = gfs.openUploadStream(safeFilename, { contentType: mimetype });
      fileStream.pipe(uploadStream);

      const p = new Promise((res, rej) => {
        uploadStream.on("finish", () => res({ field, id: uploadStream.id }));
        uploadStream.on("error", rej);
      });
      filePromises.push(p);
    });

    busboy.on("field", (name, val) => {
      eventFields[name] = val;
    });

    const stream = Readable.fromWeb(req.body);
    stream.pipe(busboy);

    const results = await new Promise((res, rej) => {
      busboy.on("finish", () => Promise.all(filePromises).then(res).catch(rej));
    });

    const fileMap = results.reduce((map, { field, id }) => {
      if (!map[field]) map[field] = [];
      map[field].push(id);
      return map;
    }, {});

    const coords = eventFields.coordinators?.split(",").map(s => s.trim()).filter(Boolean) || [];

    const eventDoc = new Event({
      title: eventFields.title,
      status: eventFields.status,
      category: eventFields.category,
      coordinators: coords,
      startdate: eventFields.startDate ? new Date(eventFields.startDate) : null,
      lasttDate: eventFields.lastDate ? new Date(eventFields.lastDate) : null,
      venue: eventFields.venue,
      organizedBy: eventFields.organizedBy,
      description: eventFields.description,
      bannerId: fileMap.banner?.[0] || null,
      brochureId: fileMap.brochure?.[0] || null,
      eventImageIds: fileMap.eventImages || [],
    });

    await eventDoc.save();
    return NextResponse.json({ success: true, event: eventDoc });
  } catch (err) {
    console.error("POST error:", err);
    return NextResponse.json({ success: false, message: "Upload failed" }, { status: 500 });
  }
}

// ==========================
// DELETE - Remove Event
// ==========================
export async function DELETE(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ success: false, message: "ID required" }, { status: 400 });

  try {
    const { Event, gfs } = await getSessionAndModel();
    const event = await Event.findById(id);
    if (!event) return NextResponse.json({ success: false, message: "Event not found" }, { status: 404 });

    const fileIds = [event.bannerId, event.brochureId, ...(event.eventImageIds || [])].filter(Boolean);
    for (const fid of fileIds) {
      try {
        await gfs.delete(new mongoose.Types.ObjectId(fid));
      } catch (e) {
        console.warn(`File delete warning for ID ${fid}:`, e.message);
      }
    }

    await Event.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE error:", err);
    return NextResponse.json({ success: false, message: "Delete failed" }, { status: 500 });
  }
}

// ==========================
// PATCH - Update Event
// ==========================
export async function PATCH(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ success: false, message: "ID required" }, { status: 400 });

  try {
    const { Event, gfs } = await getSessionAndModel();
    const headers = Object.fromEntries(req.headers);
    const busboy = Busboy({ headers });
    const filePromises = [];
    const fields = {};

    busboy.on("file", (field, fileStream, filename, _, mimetype) => {
      const safeFilename = `${Date.now()}-${filename}`;
      const uploadStream = gfs.openUploadStream(safeFilename, { contentType: mimetype });
      fileStream.pipe(uploadStream);

      const p = new Promise((res, rej) => {
        uploadStream.on("finish", () => res({ field, id: uploadStream.id }));
        uploadStream.on("error", rej);
      });
      filePromises.push(p);
    });

    busboy.on("field", (name, val) => {
      fields[name] = val;
    });

    const stream = Readable.fromWeb(req.body);
    stream.pipe(busboy);

    const results = await new Promise((res, rej) => {
      busboy.on("finish", () => Promise.all(filePromises).then(res).catch(rej));
    });

    const fileMap = results.reduce((map, { field, id }) => {
      if (!map[field]) map[field] = [];
      map[field].push(id);
      return map;
    }, {});

    const event = await Event.findById(id);
    if (!event) return NextResponse.json({ success: false, message: "Event not found" }, { status: 404 });

    event.title = fields.title || event.title;
    event.status = fields.status || event.status;
    event.venue = fields.venue || event.venue;
    event.organizedBy = fields.organizedBy || event.organizedBy;
    event.description = fields.description || event.description;
    event.startdate = fields.startdate ? new Date(fields.startdate) : event.startdate;
    event.lasttdate = fields.lasttdate ? new Date(fields.lasttdate) : event.lasttdate;
    event.coordinators = fields.coordinators
      ? fields.coordinators.split(",").map((s) => s.trim())
      : event.coordinators;

    if (fileMap.banner?.[0]) {
      if (event.bannerId) await gfs.delete(new mongoose.Types.ObjectId(event.bannerId));
      event.bannerId = fileMap.banner[0];
    }

    if (fileMap.brochure?.[0]) {
      if (event.brochureId) await gfs.delete(new mongoose.Types.ObjectId(event.brochureId));
      event.brochureId = fileMap.brochure[0];
    }

    if (fields.orderedImageIds) {
      event.eventImageIds = fields.orderedImageIds
        .split(",")
        .map((id) => new mongoose.Types.ObjectId(id));
    }

    if (fileMap.eventImages?.length) {
      event.eventImageIds.push(...fileMap.eventImages);
    }

    await event.save();
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PATCH error:", err);
    return NextResponse.json({ success: false, message: "Update failed" }, { status: 500 });
  }
}
