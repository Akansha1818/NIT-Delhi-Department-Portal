export const runtime = "nodejs";

import { NextResponse } from "next/server";
import Busboy from "busboy";
import { Readable } from "stream";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import { getDbAndAboutModel } from "@/lib/getDbModel";

// Get session and dynamic DB model
const getSessionAndModel = async () => {
  await connectDB();
  const session = await getServerSession(authOptions);
  const department = session?.user?.department;

  if (!session || !session.user || !department) {
    throw new Error("Unauthorized or missing department");
  }

  return getDbAndAboutModel(department);
};

export async function GET() {
  try {
    const { About } = await getSessionAndModel();
    const data = await About.findOne().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("GET error:", err);
    return NextResponse.json(
      { success: false, message: "Error fetching HOD info" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const { About, gfs } = await getSessionAndModel();

    const headers = Object.fromEntries(req.headers.entries());
    const busboy = Busboy({ headers });

    const filePromises = [];
    const aboutFields = {};

    busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
      const safeFilename = `${Date.now()}-${filename}`;
      const uploadStream = gfs.openUploadStream(safeFilename, { contentType: mimetype });

      file.pipe(uploadStream);

      filePromises.push(
        new Promise((res, rej) => {
          uploadStream.on("finish", () => res({ field: fieldname, id: uploadStream.id }));
          uploadStream.on("error", rej);
        })
      );
    });

    busboy.on("field", (name, val) => {
      aboutFields[name] = val;
    });

    const stream = Readable.fromWeb(req.body);
    stream.pipe(busboy);

    const results = await new Promise((resolve, reject) => {
      busboy.on("finish", () => {
        Promise.all(filePromises).then(resolve).catch(reject);
      });
    });

    const fileMap = results.reduce((map, { field, id }) => {
      map[field] = id;
      return map;
    }, {});

    const newAbout = await About.create({
      hod_name: aboutFields.hod_name,
      hod_message: aboutFields.hod_message,
      hod_imageId: fileMap.hod_image || null,
    });

    return NextResponse.json({ success: true, data: newAbout });
  } catch (err) {
    console.error("POST error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to create HOD info" },
      { status: 500 }
    );
  }
}

export async function PATCH(req) {
  try {
    const { About, gfs } = await getSessionAndModel();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, message: "Missing ID" }, { status: 400 });
    }

    const headers = Object.fromEntries(req.headers.entries());
    const busboy = Busboy({ headers });

    const filePromises = [];
    const updateFields = {};

    busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
      const safeFilename = `${Date.now()}-${filename}`;
      const uploadStream = gfs.openUploadStream(safeFilename, { contentType: mimetype });

      file.pipe(uploadStream);

      filePromises.push(
        new Promise((res, rej) => {
          uploadStream.on("finish", () => res({ field: fieldname, id: uploadStream.id }));
          uploadStream.on("error", rej);
        })
      );
    });

    busboy.on("field", (name, val) => {
      updateFields[name] = val;
    });

    const stream = Readable.fromWeb(req.body);
    stream.pipe(busboy);

    const results = await new Promise((resolve, reject) => {
      busboy.on("finish", () => {
        Promise.all(filePromises).then(resolve).catch(reject);
      });
    });

    const fileMap = results.reduce((map, { field, id }) => {
      map[field] = id;
      return map;
    }, {});

    const updated = await About.findByIdAndUpdate(
      id,
      {
        hod_name: updateFields.hod_name,
        hod_message: updateFields.hod_message,
        ...(fileMap.hod_image && { hod_imageId: fileMap.hod_image }),
      },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Record not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    console.error("PATCH error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to update HOD info" },
      { status: 500 }
    );
  }
}
