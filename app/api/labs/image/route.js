import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import { getDbAndLabModel } from "@/lib/getDbModel";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

const getSessionAndModel = async () => {
    await connectDB();
    const session = await getServerSession(authOptions);
    const department = session?.user?.department;

    if (!department) {
        throw new Error("Unauthorized or missing department");
    }

    return getDbAndLabModel(department); // returns { db, Lab, gfs, bucketName }
};

export async function DELETE(req) {
    try {
        const { searchParams } = new URL(req.url);
        const imageId = searchParams.get("id");

        if (!imageId || !mongoose.Types.ObjectId.isValid(imageId)) {
            return NextResponse.json({ success: false, message: "Invalid or missing image ID" }, { status: 400 });
        }

        const { Lab, gfs } = await getSessionAndModel();

        // Delete file from GridFS
        await gfs.delete(new mongoose.Types.ObjectId(imageId));

        // Remove image ID from all lab documents (labImageIds array)
        await Lab.updateMany(
            { labImageIds: imageId },
            { $pull: { labImageIds: imageId } }
        );

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("Lab image delete error:", err);
        return NextResponse.json({ success: false, message: "Failed to delete image" }, { status: 500 });
    }
}

// ✅ Add this to avoid build crash
export async function GET() {
    return NextResponse.json({ message: "GET not implemented" }, { status: 405 });
}
