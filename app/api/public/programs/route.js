import connectDB from "@/lib/db";
import { getDbAndProgramModel } from "@/lib/getDbModel";
import { NextResponse } from "next/server";

const corsHeaders = {
  'Access-Control-Allow-Origin': 'http://localhost:3001',
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

    const { Program } = await getDbAndProgramModel(department);

    // Fetch the latest program
    const data = await Program.find().sort({ createdAt: -1 });
    // console.log("Program data:", data);

    return NextResponse.json(data, { status: 200, headers: corsHeaders });
  } catch (err) {
    console.error("Program GET error:", err);
    return NextResponse.json(
      { error: "Failed to fetch program information" },
      { status: 500, headers: corsHeaders }
    );
  }
}
