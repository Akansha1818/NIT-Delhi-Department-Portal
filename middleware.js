import { NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";

export default withAuth(
    function middleware() {
        return NextResponse.next();
    },
    {
        callbacks: {
            authorized({ token }) {
                if (token) return true
            },
        },
        pages: {
            signIn: "/?error=unauthorized",
            error: "/?error=unauthorized",
        },
    }
);

export const config = {
    matcher: [
        "/departmentportal/:path*"
    ],
};