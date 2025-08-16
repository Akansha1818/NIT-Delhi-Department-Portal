// Force Node.js runtime (since using mongoose and non-edge safe packages)
export const runtime = "nodejs";

import GoogleProvider from "next-auth/providers/google";
import connectDB from "@/lib/db";
import { getDbAndDCModel } from "@/lib/getDbModel";

export const authOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
    ],
    pages: {
        signIn: "/",
        error: "/",
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,

    callbacks: {
        async jwt({ token, user }) {
            if (user?.email) {
                try {
                    await connectDB();
                    const { Dc } = getDbAndDCModel();
                    const allowedUser = await Dc.findOne({ email: user.email });

                    if (!allowedUser) {
                        console.error("[AUTH ERROR] Unauthorized user:", user.email);
                        throw new Error("Unauthorized user");
                    }

                    token.email = user.email;
                    token.name = user.name;
                    token.picture = user.image;
                    token.department = allowedUser.department;
                } catch (err) {
                    console.error("[JWT CALLBACK ERROR]:", err?.message || err);
                    throw new Error("Authentication failed");
                }
            }
            return token;
        },

        async session({ session, token }) {
            if (token?.email) {
                session.user = {
                    email: token.email,
                    name: token.name,
                    image: token.picture,
                    department: token.department,
                };
            } else {
                session.user = null;
            }
            return session;
        },
    },
};