"use client";

import { PencilLine, Plus } from "lucide-react";
import { useState } from "react";
import AddEvents from "./add";
import EditEvents from "./edit";

const eventTabs = [
    "STCs",
    "FDPs",
    "Workshops",
    "Seminars",
    "Expert Talks",
    "Conferences",
    "Upcoming",
];

export default function EventsPage() {
    const [activeTab, setActiveTab] = useState(0);
    const [mode, setMode] = useState("edit"); // 'edit' or 'add'

    const category = eventTabs[activeTab];

    const renderTabContent = () => {
        if (mode === "add") return <AddEvents category={category} />;
        if (mode === "edit") return <EditEvents category={category} />;
    };

    return (
        <div className="min-h-screen">
            <div className="mx-auto space-y-6">
                {/* Header with Mode Toggle */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <h1 className="text-3xl font-bold text-[#212178] tracking-tight">Events Manager</h1>
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

                {/* Tabs */}
                <div className="relative">
                    <div className="hidden md:flex flex-wrap gap-2 rounded-md">
                        {eventTabs.map((tab, index) => (
                            <button
                                key={index}
                                onClick={() => setActiveTab(index)}
                                className={`px-5 py-2 rounded-md text-sm font-medium transition ${activeTab === index
                                        ? "bg-[#212178] text-white"
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
                            {eventTabs.map((tab, index) => (
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
