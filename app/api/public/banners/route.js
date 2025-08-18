import connectDB from "@/lib/db";
import { getDbAndBannerModel } from "@/lib/getDbModel";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

const corsHeaders = {
    'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGINS?.split(",").join(","),
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-department',
};

export async function OPTIONS() {
    return new Response(null, {
        status: 204,
        headers: corsHeaders,
    });
}

export async function GET(req) {
    try {
        await connectDB();

        const department = req.headers.get("x-department");
        if (!department) {
            return NextResponse.json(
                { error: "Unauthorized: Missing department" },
                { status: 401, headers: corsHeaders }
            );
        }

        const { db, Banner } = getDbAndBannerModel(department);
        const gfs = new mongoose.mongo.GridFSBucket(db, { bucketName: "banners" });

        const banners = await Banner.find().sort({ order: 1 });

        const images = await Promise.all(
            banners.map((b) => {
                return new Promise((resolve, reject) => {
                    if (!b.filename) {
                        return resolve({
                            _id: b._id,
                            imageData: null,
                            order: b.order,
                        });
                    }

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
                    stream.on("error", (err) => {
                        console.error(`Error reading ${b.filename}:`, err.message);
                        resolve({
                            _id: b._id,
                            imageData: null,
                            order: b.order,
                        });
                    });
                });
            })
        );

        return NextResponse.json(images, { status: 200, headers: corsHeaders });
    } catch (err) {
        console.error("Banner GET error:", err);
        return NextResponse.json(
            { error: "Failed to fetch banners" },
            { status: 500, headers: corsHeaders }
        );
    }
}
