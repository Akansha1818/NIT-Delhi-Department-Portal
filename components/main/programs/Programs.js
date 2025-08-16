"use client";

import { PencilLine, Plus } from "lucide-react";
import { useState } from "react";
import AddPrograms from "./add";
import EditPrograms from "./edit";

const programTabs = [
    "Undergraduate",
    "Postgraduate",
    "PhD",
    "PDF",
];

export default function ProgramsPage() {
    const [activeTab, setActiveTab] = useState(0);
    const [mode, setMode] = useState("edit"); // 'edit' or 'add'

    const category = programTabs[activeTab];

    const renderTabContent = () => {
        if (mode === "add") return <AddPrograms category={category} />;
        if (mode === "edit") return <EditPrograms category={category} />;
    };

    return (
        <div className="min-h-screen">
            <div className="mx-auto space-y-6">
                {/* Header with Mode Toggle */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <h1 className="text-3xl font-bold text-[#212178] tracking-tight">Programs Manager</h1>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setMode("edit")}
                            className={`flex items-center gap-1 px-4 py-2 rounded-md text-sm font-medium transition ${mode === "edit"
                                    ? "bg-[#7f5af0] text-white"
                                    : "bg-white border border-gray-300 text-gray-700"
                                }`}
                        >
                            <PencilLine size={16} /> Edit
                        </button>
                        <button
                            onClick={() => setMode("add")}
                            className={`flex items-center gap-1 px-4 py-2 rounded-md text-sm font-medium transition ${mode === "add"
                                    ? "bg-[#7f5af0] text-white"
                                    : "bg-white border border-gray-300 text-gray-700"
                                }`}
                        >
                            <Plus size={16} /> Add
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="relative">
                    <div className="hidden md:flex flex-wrap gap-2 rounded-md">
                        {programTabs.map((tab, index) => (
                            <button
                                key={index}
                                onClick={() => setActiveTab(index)}
                                className={`px-5 py-2 rounded-md text-sm font-medium transition ${activeTab === index
                                        ? "bg-[#7f5af0] text-white"
                                        : "bg-white border border-gray-200 hover:bg-gray-100"
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Mobile Select */}
                    <div className="md:hidden">
                        <select
                            value={activeTab}
                            onChange={(e) => setActiveTab(Number(e.target.value))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md"
                        >
                            {programTabs.map((tab, index) => (
                                <option key={index} value={index}>
                                    {tab}
                                </option>
                            ))}
                        </select>
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
