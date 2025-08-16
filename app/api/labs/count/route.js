// app/api/labs/count/route.js
import connectDB from "@/lib/db";
import { getDbAndLabModel } from "@/lib/getDbModel";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  await connectDB();

  const session = await getServerSession(authOptions);
  const department = session?.user?.department;
  if (!department) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { Lab } = getDbAndLabModel(department);

  try {
    const count = await Lab.countDocuments();
    return NextResponse.json({ count }, { status: 200 });
  } catch (err) {
    console.error("Failed to countdLabs:", err);
    return NextResponse.json({ error: "Failed to fetch count" }, { status: 500 });
  }
}