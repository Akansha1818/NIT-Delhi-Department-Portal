import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import { getDbAndLabModel } from "@/lib/getDbModel";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function GET(_req, { params }) {
  try {
    const id = params?.id;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return new NextResponse("Invalid or missing file ID", { status: 400 });
    }

    await connectDB();

    const session = await getServerSession(authOptions);
    const department = session?.user?.department;

    if (!department) {
      return new NextResponse("Unauthorized or missing department", { status: 401 });
    }

    const { bucketName, gfs, db } = await getDbAndLabModel(department);
    const fileId = new mongoose.Types.ObjectId(id);

    const file = await db.collection(`${bucketName}.files`).findOne({ _id: fileId });

    if (!file) {
      return new NextResponse("File not found", { status: 404 });
    }

    const stream = gfs.openDownloadStream(fileId);
    const headers = new Headers();
    headers.set("Content-Type", file.contentType || "application/octet-stream");

    return new Response(stream, { headers });
  } catch (err) {
    console.error("GridFS GET error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
