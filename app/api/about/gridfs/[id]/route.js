export const runtime = "nodejs";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { getDbAndAboutModel } from "@/lib/getDbModel";

const getSessionAndModel = async () => {
  await connectDB();
  const session = await getServerSession(authOptions);

  const department = session?.user?.department;
  if (!session || !department) {
    throw new Error("Unauthorized or missing department");
  }

  return getDbAndAboutModel(department);
};

export async function GET(req, { params }) {
  try {
    const { id } = params;

    if (!id) {
      return new NextResponse("Missing file ID", { status: 400 });
    }

    const { db, gfs, bucketName } = await getSessionAndModel();
    const fileId = new mongoose.Types.ObjectId(id);

    const file = await db
      .collection(`${bucketName}.files`)
      .findOne({ _id: fileId });

    if (!file) {
      return new NextResponse("File not found", { status: 404 });
    }

    const stream = gfs.openDownloadStream(fileId);

    const headers = new Headers();
    headers.set("Content-Type", file.contentType || "application/octet-stream");
    headers.set("Content-Disposition", `inline; filename="${file.filename}"`);

    return new Response(stream, { headers });
  } catch (err) {
    console.error("Error in GridFS [id] GET route:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
