export const runtime = "nodejs";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import { getDbAndAboutModel } from "@/lib/getDbModel";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

const getSessionAndModel = async () => {
    await connectDB();
    const session = await getServerSession(authOptions);

    const department = session?.user?.department;
    if (!session || !department) {
        throw new Error("Unauthorized or missing session info");
    }

    return getDbAndAboutModel(department);
};

export async function DELETE(req) {
    try {
        const { searchParams } = new URL(req.url);
        const imageId = searchParams.get("id");

        if (!imageId) {
            return NextResponse.json(
                { success: false, message: "Image ID is required" },
                { status: 400 }
            );
        }

        const { About, gfs } = await getSessionAndModel();

        const objectId = new mongoose.Types.ObjectId(imageId);

        // Delete file from GridFS
        await gfs.delete(objectId);

        // Remove reference from About document(s)
        await About.updateMany(
            { eventImageIds: imageId },
            { $pull: { eventImageIds: imageId } }
        );

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("Image DELETE error:", err);
        return NextResponse.json(
            { success: false, message: "Failed to delete image" },
            { status: 500 }
        );
    }
}
