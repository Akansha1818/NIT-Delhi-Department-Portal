export const runtime = "nodejs";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import { getDbAndEventModel } from "@/lib/getDbModel";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

const getSessionAndModel = async () => {
    await connectDB();
    const session = await getServerSession(authOptions);
    const department = session?.user?.department;
    if (!session || !department) {
        throw new Error("Unauthorized or missing session info");
    }
    return getDbAndEventModel(department);
};

export async function DELETE(req) {
    const { searchParams } = new URL(req.url);
    const imageId = searchParams.get("id");

    if (!imageId || !mongoose.Types.ObjectId.isValid(imageId)) {
        return NextResponse.json({ success: false, message: "Valid image ID is required" }, { status: 400 });
    }

    try {
        const { gfs, Event } = await getSessionAndModel();
        const fileObjectId = new mongoose.Types.ObjectId(imageId);

        // Delete image from GridFS
        await gfs.delete(fileObjectId);

        // Remove reference from all event documents
        await Event.updateMany(
            { eventImageIds: fileObjectId },
            { $pull: { eventImageIds: fileObjectId } }
        );

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("Image DELETE error:", err);
        return NextResponse.json({ success: false, message: "Failed to delete image" }, { status: 500 });
    }
}
