"use client";
import SessionLayoutWrapper from "@/components/SessionLayoutWrapper";
import { toast } from "sonner";
import { signOut, useSession } from "next-auth/react";

export default function Page() {
    const { data: session } = useSession();

    return (
        <SessionLayoutWrapper session={session}>
            <div className="min-h-screen space-y-6">
                <h2 className="text-3xl font-bold text-[#212178]">R&D Dashboard</h2>
                {/* coming soon */}
                <p className="text-gray-600 text-center flex justify-center items-center h-[50vh]">Coming Soon...</p>
            </div>
        </SessionLayoutWrapper>
    );
}
