"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import AddAbout from "./add";
import EditAbout from "./edit";

export default function AboutPage() {
    const [loading, setLoading] = useState(true);
    const [hodData, setHodData] = useState();

    useEffect(() => {
        const fetchHodData = async () => {
            try {
                const res = await fetch("/api/about");
                const data = await res.json();
                if (data) {
                    setHodData(data);
                    console.log("Fetched HOD data:", data);
                }
            } catch (error) {
                console.error("Failed to fetch HOD info:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHodData();
    }, []);

    return (
        <div className="min-h-screen">
            <div className="mx-auto space-y-6">
                <h1 className="text-3xl font-bold text-[#212178] tracking-tight">
                    About Page - HOD Info Manager
                </h1>

                <div className="h-px w-full bg-gray-300 mx-auto" />

                {loading ? (
                    <div className="flex items-center justify-center py-20 text-gray-500">
                        <Loader2 className="animate-spin mr-2" /> Loading HOD Info...
                    </div>
                ) : hodData ? (
                    <EditAbout data={hodData} />
                ) : (
                    <AddAbout />
                )}
            </div>
        </div>
    );
}
