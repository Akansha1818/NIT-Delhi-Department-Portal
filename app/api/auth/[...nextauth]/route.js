export const runtime = "nodejs";

import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// Initialize NextAuth handler with options
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };