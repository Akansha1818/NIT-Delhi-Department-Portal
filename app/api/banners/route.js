import connectDB from "@/lib/db";
import { getDbAndBannerModel } from "@/lib/getDbModel";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { Readable } from "stream";
import Busboy from "busboy";
import mongoose from "mongoose";

// ==========================
// POST - Upload New Banners
// ==========================
export async function POST(req) {
  await connectDB();
  const session = await getServerSession(authOptions);
  const department = session?.user?.department;
  if (!department) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { db, Banner } = getDbAndBannerModel(department);
  const gfs = new mongoose.mongo.GridFSBucket(db, { bucketName: "banners" });

  const headers = Object.fromEntries(req.headers);
  const uploads = [];
  let oldBannerCount = await Banner.countDocuments();
  let fileIndex = 0;

  const busboy = Busboy({ headers });

  busboy.on("file", (fieldname, fileStream, actualFilename, encoding, mimetype) => {
    const safeFilename = `${Date.now()}-${actualFilename}`;
    const uploadStream = gfs.openUploadStream(safeFilename, {
      contentType: mimetype || "image/png",
    });
    fileStream.pipe(uploadStream);

    const promise = new Promise((res, rej) => {
      uploadStream.on("finish", async () => {
        try {
          const order = oldBannerCount + fileIndex + 1;
          await Banner.create({ filename: safeFilename, order });
          fileIndex++;
          res();
        } catch (err) {
          rej(err);
        }
      });
      uploadStream.on("error", rej);
    });

    uploads.push(promise);
  });

  try {
    const readable = Readable.fromWeb(req.body);
    readable.pipe(busboy);
  } catch (err) {
    console.error("Busboy streaming error:", err);
    return NextResponse.json({ error: "Invalid stream" }, { status: 400 });
  }

  return new Promise((resolve, reject) => {
    busboy.on("finish", async () => {
      try {
        await Promise.all(uploads);
        resolve(NextResponse.json({ message: "Uploaded banners successfully" }, { status: 201 }));
      } catch (err) {
        console.error("Banner upload failed:", err);
        reject(NextResponse.json({ error: "Upload failed" }, { status: 500 }));
      }
    });
  });
}

// ========================
// GET - Fetch All Banners
// ========================
export async function GET() {
  await connectDB();
  const session = await getServerSession(authOptions);
  const department = session?.user?.department;
  if (!department) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { db, Banner } = getDbAndBannerModel(department);
  const gfs = new mongoose.mongo.GridFSBucket(db, { bucketName: "banners" });

  try {
    const banners = await Banner.find().sort({ order: 1 });
    const images = await Promise.all(
      banners.map((b) =>
        new Promise((resolve, reject) => {
          const chunks = [];
          const stream = gfs.openDownloadStreamByName(b.filename);
          stream.on("data", (chunk) => chunks.push(chunk));
          stream.on("end", () => {
            const base64 = Buffer.concat(chunks).toString("base64");
            resolve({
              _id: b._id,
              imageData: `data:image/jpeg;base64,${base64}`,
              order: b.order,
            });
          });
          stream.on("error", reject);
        })
      )
    );
    return NextResponse.json(images, { status: 200 });
  } catch (err) {
    console.error("Banner fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch banners" }, { status: 500 });
  }
}

// ==========================
// DELETE - Remove a Banner
// ==========================
export async function DELETE(req) {
  await connectDB();
  const session = await getServerSession(authOptions);
  const department = session?.user?.department;
  if (!department) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { db, Banner } = getDbAndBannerModel(department);
  const gfs = new mongoose.mongo.GridFSBucket(db, { bucketName: "banners" });

  try {
    const url = new URL(req.url, `http://${req.headers.get("host")}`);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const banner = await Banner.findById(id);
    if (!banner) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const files = await db.collection("banners.files").find({ filename: banner.filename }).toArray();
    for (const file of files) await gfs.delete(file._id);

    await Banner.deleteOne({ _id: id });

    return NextResponse.json({ message: "Deleted" }, { status: 200 });
  } catch (err) {
    console.error("Banner delete error:", err);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}

// ==========================
// PATCH - Update Banner Order
// ==========================
export async function PATCH(req) {
  await connectDB();
  const session = await getServerSession(authOptions);
  const department = session?.user?.department;
  if (!department) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { Banner } = getDbAndBannerModel(department);

  try {
    const updates = await req.json(); // Array of { _id, order }
    const promises = updates.map((b) =>
      Banner.findByIdAndUpdate(b._id, { order: b.order })
    );
    await Promise.all(promises);
    return NextResponse.json({ message: "Order updated successfully" }, { status: 200 });
  } catch (err) {
    console.error("Banner order update error:", err);
    return NextResponse.json({ error: "Order update failed" }, { status: 500 });
  }
}
