"use client";

import { PencilLine, Plus } from "lucide-react";
import { useState } from "react";
import AddLabs from "./add";
import EditLabs from "./edit";

const eventTabs = [
    "STCs",
    "FDPs",
    "Workshops",
    "Seminars",
    "Expert Talks",
    "Conferences",
    "Upcoming",
];

export default function LabsPage() {
    const [activeTab, setActiveTab] = useState(0);
    const [mode, setMode] = useState("edit"); // 'edit' or 'add'

    const category = eventTabs[activeTab];

    const renderTabContent = () => {
        if (mode === "add") return <AddLabs />;
        if (mode === "edit") return <EditLabs />;
    };

    return (
        <div className="min-h-screen">
            <div className="mx-auto space-y-6">
                {/* Header with Mode Toggle */}
                <div className="flex flex-col md:flex-row md:justify-between md:items-center md: gap-4">
                    <h1 className="text-3xl font-bold text-[#212178] tracking-tight">Laboratories Manager</h1>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setMode("edit")}
                            className={`flex items-center gap-1 px-4 py-2 rounded-md text-sm font-medium transition ${mode === "edit"
                                    ? "bg-[#212178] text-white"
                                    : "bg-white border border-gray-300 text-gray-700"
                                }`}
                        >
                            <PencilLine size={16} /> Edit
                        </button>
                        <button
                            onClick={() => setMode("add")}
                            className={`flex items-center gap-1 px-4 py-2 rounded-md text-sm font-medium transition ${mode === "add"
                                    ? "bg-[#212178] text-white"
                                    : "bg-white border border-gray-300 text-gray-700"
                                }`}
                        >
                            <Plus size={16} /> Add
                        </button>
                    </div>
                </div>

                <div className="h-px w-[100%] bg-gray-300 mx-auto" />

                {/* Content */}
                <div className="">
                    {renderTabContent()}
                </div>
            </div>
        </div>
    );
}
