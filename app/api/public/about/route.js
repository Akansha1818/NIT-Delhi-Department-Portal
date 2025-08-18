import connectDB from "@/lib/db";
import { getDbAndAboutModel } from "@/lib/getDbModel";
import { NextResponse } from "next/server";

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

        const { About } = getDbAndAboutModel(department);
        const data = await About.findOne().sort({ createdAt: -1 });

        return NextResponse.json(data, { status: 200, headers: corsHeaders });

    } catch (err) {
        console.error("About GET error:", err);
        return NextResponse.json(
            { error: "Failed to fetch about information" },
            { status: 500, headers: corsHeaders }
        );
    }
}
