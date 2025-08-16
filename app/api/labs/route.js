export const runtime = "nodejs";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import { getDbAndLabModel } from "@/lib/getDbModel";
import Busboy from "busboy";
import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { Readable } from "stream";

const getSessionAndModel = async () => {
  await connectDB();
  const session = await getServerSession(authOptions);
  const department = session?.user?.department;
  if (!department) throw new Error("Unauthorized or missing department");
  return getDbAndLabModel(department);
};

// ============ GET ============
export async function GET() {
  try {
    const { Lab } = await getSessionAndModel();
    const labs = await Lab.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, labs });
  } catch (err) {
    console.error("GET error:", err);
    return NextResponse.json({ success: false, message: "Failed to fetch labs" }, { status: 500 });
  }
}

// ============ POST ============
export async function POST(req) {
  try {
    const { Lab, gfs } = await getSessionAndModel();
    const headers = Object.fromEntries(req.headers.entries());
    const busboy = Busboy({ headers });
    const filePromises = [];
    const labFields = {};

    busboy.on("file", (field, fileStream, filename, _enc, mimetype) => {
      const safeFilename = `${Date.now()}-${filename}`;
      const uploadStream = gfs.openUploadStream(safeFilename, { contentType: mimetype });
      fileStream.pipe(uploadStream);

      filePromises.push(
        new Promise((res, rej) => {
          uploadStream.on("finish", () => res({ field, id: uploadStream.id }));
          uploadStream.on("error", rej);
        })
      );
    });

    busboy.on("field", (name, val) => {
      labFields[name] = val;
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

    const newLab = new Lab({
      name: labFields.name,
      coordinators: labFields.coordinators?.split(",").map(s => s.trim()) || [],
      technical_staff: labFields.technical_staff?.split(",").map(s => s.trim()) || [],
      address: labFields.address,
      specialization: labFields.specialization,
      webpageURL: labFields.webpageURL || "",
      description: labFields.description,
      objectives: labFields.objectives?.split(";").map(s => s.trim()) || [],
      capacity: parseInt(labFields.capacity),
      hardware_details: labFields.hardware_details ? JSON.parse(labFields.hardware_details) : [],
      software_details: labFields.software_details ? JSON.parse(labFields.software_details) : [],
      labImageIds: fileMap.labImages || [],
    });

    console.log("New Lab Data:", newLab);

    await newLab.save();
    return NextResponse.json({ success: true, lab: newLab });
  } catch (err) {
    console.error("POST error:", err);
    return NextResponse.json({ success: false, message: "Upload failed" }, { status: 500 });
  }
}

// ============ DELETE ============
export async function DELETE(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ success: false, message: "Valid ID required" }, { status: 400 });
  }

  try {
    const { Lab, gfs } = await getSessionAndModel();
    const lab = await Lab.findById(id);
    if (!lab) return NextResponse.json({ success: false, message: "Lab not found" }, { status: 404 });

    const fileIds = lab.labImageIds || [];
    for (const fid of fileIds) {
      try {
        await gfs.delete(new mongoose.Types.ObjectId(fid));
      } catch (e) {
        console.warn(`Error deleting image ${fid}:`, e.message);
      }
    }

    await Lab.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE error:", err);
    return NextResponse.json({ success: false, message: "Delete failed" }, { status: 500 });
  }
}

// ============ PATCH ============
export async function PATCH(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ success: false, message: "Valid ID required" }, { status: 400 });
  }

  try {
    const { Lab, gfs } = await getSessionAndModel();
    const headers = Object.fromEntries(req.headers.entries());
    const busboy = Busboy({ headers });
    const filePromises = [];
    const fields = {};

    busboy.on("file", (field, fileStream, filename, _enc, mimetype) => {
      const safeFilename = `${Date.now()}-${filename}`;
      const uploadStream = gfs.openUploadStream(safeFilename, { contentType: mimetype });
      fileStream.pipe(uploadStream);

      filePromises.push(
        new Promise((res, rej) => {
          uploadStream.on("finish", () => res({ field, id: uploadStream.id }));
          uploadStream.on("error", rej);
        })
      );
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

    const lab = await Lab.findById(id);
    if (!lab) return NextResponse.json({ success: false, message: "Lab not found" }, { status: 404 });

    if (fields.name) lab.name = fields.name;
    if (fields.address) lab.address = fields.address;
    if (fields.specialization) lab.specialization = fields.specialization;
    if (fields.description) lab.description = fields.description;
    if (fields.capacity) lab.capacity = parseInt(fields.capacity);
    if (fields.webpageURL) lab.webpageURL = fields.webpageURL;

    if (fields.coordinators)
      lab.coordinators = fields.coordinators.split(",").map((s) => s.trim());

    if (fields.technical_staff)
      lab.technical_staff = fields.technical_staff.split(",").map((s) => s.trim());

    if (fields.objectives)
      lab.objectives = fields.objectives.split(";").map((s) => s.trim());

    if (fields.hardware_details)
      lab.hardware_details = JSON.parse(fields.hardware_details);

    if (fields.software_details)
      lab.software_details = JSON.parse(fields.software_details);

    if (fields.orderedImageIds) {
      lab.labImageIds = fields.orderedImageIds
        .split(",")
        .map((id) => new mongoose.Types.ObjectId(id));
    }

    if (fileMap.labImages?.length) {
      lab.labImageIds.push(...fileMap.labImages);
    }

    await lab.save();
    return NextResponse.json({ success: true, updated: lab });
  } catch (err) {
    console.error("PATCH error:", err);
    return NextResponse.json({ success: false, message: "Update failed" }, { status: 500 });
  }
}