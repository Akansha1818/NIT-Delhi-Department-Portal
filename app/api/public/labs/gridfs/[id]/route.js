export const runtime = "nodejs";

import connectDB from "@/lib/db";
import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { getDbAndLabModel } from "@/lib/getDbModel";

const corsHeaders = {
  "Access-Control-Allow-Origin": "http://localhost:3001",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-department",
};

// Handle CORS preflight
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function GET(req, { params }) {
  try {
    const { id } = params;
    const { searchParams } = new URL(req.url);
    const department = searchParams.get("department"); // ✅ Read from URL

    if (!id || !department) {
      return new NextResponse("Missing file ID or department", { status: 400 });
    }

    await connectDB(); // Ensure DB is connected
    const { db, gfs, bucketName } = await getDbAndLabModel(department); // ✅ Pass department

    const fileId = new mongoose.Types.ObjectId(id);
    const file = await db.collection(`${bucketName}.files`).findOne({ _id: fileId });

    if (!file) {
      return new NextResponse("File not found", { status: 404 });
    }

    const stream = gfs.openDownloadStream(fileId);

    const headers = new Headers(corsHeaders);
    headers.set("Content-Type", file.contentType || "application/octet-stream");
    headers.set("Content-Disposition", `inline; filename="${file.filename}"`);

    return new Response(stream, { headers });
  } catch (err) {
    console.error("Error in /api/public/labs/gridfs/[id] route:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}