"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Trash2, Pencil, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import TiptapEditor from "@/components/TiptapEditor";
import { toast } from "sonner";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";

function SkeletonProgramCard() {
    return (
        <Card className="shadow-md border border-gray-200 animate-pulse">
            <CardHeader className="flex flex-row justify-between items-center">
                <div className="space-y-2 w-2/3">
                    <div className="h-6 w-40 bg-gray-200 rounded" />
                </div>
                <div className="flex items-center space-x-3">
                    <div className="h-6 w-6 bg-gray-200 rounded" />
                    <div className="h-6 w-6 bg-gray-200 rounded" />
                </div>
            </CardHeader>
        </Card>
    );
}

export default function EditPrograms({ category }) {
    const [programs, setPrograms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [filters, setFilters] = useState({ search: "" });
    const [editedData, setEditedData] = useState({});
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        fetchPrograms();
    }, []);

    const fetchPrograms = async () => {
        try {
            setLoading(true);
            const res = await axios.get("/api/programs");
            setPrograms(res.data.programs || []);
        } catch {
            toast.error("Error loading programs");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Delete this program?")) return;
        try {
            const res = await fetch(`/api/programs?id=${id}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) {
                toast.success("Deleted successfully");
                fetchPrograms();
            } else toast.error("Failed to delete");
        } catch {
            toast.error("Delete failed");
        }
    };

    const handleEdit = (program) => {
        setEditingId(program._id);
        setEditedData({
            ...program,
            scheme: program.scheme || [],
            no_of_students: program.no_of_students || { boys: 0, girls: 0 },
            no_of_seats: program.no_of_seats || { josaa: 0, csab: 0, dasa: 0 },
        });
    };

    const handleNestedChange = (section, key, value) => {
        setEditedData((prev) => ({
            ...prev,
            [section]: {
                ...prev[section],
                [key]: value,
            },
        }));
    };

    const handleSchemeChange = (index, field, value) => {
        const updatedSchemes = [...editedData.scheme];
        updatedSchemes[index][field] = value;
        setEditedData((prev) => ({ ...prev, scheme: updatedSchemes }));
    };

    const addScheme = () => {
        setEditedData((prev) => ({
            ...prev,
            scheme: [...(prev.scheme || []), { title: "", url: "" }],
        }));
    };

    const removeScheme = (index) => {
        const updatedSchemes = [...editedData.scheme];
        updatedSchemes.splice(index, 1);
        setEditedData((prev) => ({ ...prev, scheme: updatedSchemes }));
    };

    const handleUpdate = async () => {
        try {
            setUpdating(true);
            const formData = new FormData();
            Object.entries(editedData).forEach(([key, value]) => {
                if (Array.isArray(value)) {
                    formData.append(key, JSON.stringify(value));
                } else if (typeof value === "object") {
                    formData.append(key, JSON.stringify(value));
                } else {
                    formData.append(key, value);
                }
            });

            const res = await axios.patch(`/api/programs?id=${editingId}`, formData);
            if (res.data.success) {
                toast.success("Updated successfully");
                setEditingId(null);
                fetchPrograms();
            } else toast.error("Update failed");
        } catch {
            toast.error("Update request failed");
        } finally {
            setUpdating(false);
        }
    };

    const filteredPrograms = programs.filter((e) => {
        const matchCategory = e.category?.toLowerCase() === category?.toLowerCase();
        const matchSearch = e.title?.toLowerCase().includes(filters.search.toLowerCase());
        return matchSearch && matchCategory;
    });

    return (
        <div className="space-y-6 mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-2xl font-bold">Manage {category} programs</h1>
                <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                    <Input
                        placeholder="Search programs by name..."
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        className="w-80"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col gap-4 py-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <SkeletonProgramCard key={i} />
                    ))}
                </div>
            ) : (
                <div className="grid gap-6">
                    {filteredPrograms.length === 0 ? (
                        <div className="text-gray-500 text-left">
                            No programs found. Please add programs.
                        </div>
                    ) : (
                        filteredPrograms.map((program) => (
                            <Card key={program._id} className="shadow-md border border-gray-200">
                                <CardHeader className="flex flex-row justify-between items-center">
                                    <div>
                                        <h3 className="font-semibold text-xl text-gray-800">
                                            {program.title}
                                        </h3>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <Pencil
                                                    className="text-blue-500 cursor-pointer"
                                                    onClick={() => handleEdit(program)}
                                                />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Edit program</p>
                                            </TooltipContent>
                                        </Tooltip>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <Trash2
                                                    className="text-red-500 cursor-pointer"
                                                    onClick={() => handleDelete(program._id)}
                                                />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Delete program</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>
                                </CardHeader>

                                {editingId === program._id && (
                                    <CardContent className="flex flex-col gap-4">
                                        <Field programel="Title">
                                            <Input
                                                required
                                                value={editedData.title}
                                                onChange={(e) =>
                                                    setEditedData({ ...editedData, title: e.target.value })
                                                }
                                            />
                                        </Field>

                                        {/* Students */}
                                        <div>
                                            <label className="block text-sm font-semibold text-[#1a1830]">
                                                Number of Students:
                                            </label>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                <div>
                                                    <label className="block text-sm font-semibold mb-1 text-[#1a1830]">
                                                        Boys
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={editedData.no_of_students.boys}
                                                        onChange={(e) =>
                                                            handleNestedChange(
                                                                "no_of_students",
                                                                "boys",
                                                                Number(e.target.value)
                                                            )
                                                        }
                                                        className="w-full p-2 border rounded"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold mb-1 text-[#1a1830]">
                                                        Girls
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={editedData.no_of_students.girls}
                                                        onChange={(e) =>
                                                            handleNestedChange(
                                                                "no_of_students",
                                                                "girls",
                                                                Number(e.target.value)
                                                            )
                                                        }
                                                        className="w-full p-2 border rounded"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Seats */}
                                        <div>
                                            <label className="block text-sm font-semibold mb-1 text-[#1a1830]">
                                                Number of Seats:
                                            </label>
                                            <div className="grid grid-cols-3 gap-2">
                                                {["josaa", "csab", "dasa"].map((seat) => (
                                                    <div key={seat}>
                                                        <label className="block text-sm font-semibold mb-1 text-[#1a1830] capitalize">
                                                            {seat}
                                                        </label>
                                                        <input
                                                            type="number"
                                                            value={editedData.no_of_seats[seat]}
                                                            onChange={(e) =>
                                                                handleNestedChange(
                                                                    "no_of_seats",
                                                                    seat,
                                                                    Number(e.target.value)
                                                                )
                                                            }
                                                            className="w-full p-2 border rounded"
                                                            required
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Schemes */}
                                        <div className="space-y-3">
                                            <label className="block text-sm font-semibold mb-1 text-[#1a1830]">
                                                Scheme
                                            </label>
                                            {(editedData.scheme || []).map((item, index) => (
                                                <div key={index} className="flex gap-2 items-center">
                                                    <input
                                                        type="text"
                                                        value={item.title}
                                                        onChange={(e) =>
                                                            handleSchemeChange(index, "title", e.target.value)
                                                        }
                                                        placeholder="Scheme Title"
                                                        className="flex-1 p-2 border rounded"
                                                        required
                                                    />
                                                    <input
                                                        type="text"
                                                        value={item.url}
                                                        onChange={(e) =>
                                                            handleSchemeChange(index, "url", e.target.value)
                                                        }
                                                        placeholder="Scheme URL"
                                                        className="flex-1 p-2 border rounded"
                                                        required
                                                    />
                                                    {editedData.scheme.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeScheme(index)}
                                                            className="text-red-600"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                            <button
                                                type="button"
                                                onClick={addScheme}
                                                className="flex items-center gap-1 text-blue-600 mt-2"
                                            >
                                                <Plus size={16} /> Add Scheme
                                            </button>
                                        </div>

                                        {/* Tiptap Editors */}
                                        <label className="block text-sm font-semibold mb-1 text-[#1a1830]">
                                            Programme Specific Outcomes (PSO)
                                        </label>
                                        <TiptapEditor
                                            required
                                            value={editedData.PSO}
                                            onChange={(val) => setEditedData({ ...editedData, PSO: val })}
                                        />

                                        <label className="block text-sm font-semibold mb-1 text-[#1a1830]">
                                            Programme Educational Objectives (PEO)
                                        </label>
                                        <TiptapEditor
                                            required
                                            value={editedData.PEO}
                                            onChange={(val) => setEditedData({ ...editedData, PEO: val })}
                                        />

                                        <label className="block text-sm font-semibold mb-1 text-[#1a1830]">
                                            Programme Outcomes (PO)
                                        </label>
                                        <TiptapEditor
                                            required
                                            value={editedData.PO}
                                            onChange={(val) => setEditedData({ ...editedData, PO: val })}
                                        />

                                        <div className="md:col-span-2">
                                            <Button
                                                className="mt-2"
                                                onClick={handleUpdate}
                                                disabled={updating}
                                            >
                                                {updating ? "Updating..." : "Update"}
                                            </Button>
                                        </div>
                                    </CardContent>
                                )}
                            </Card>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

// Field wrapper
function Field({ programel, children }) {
    return (
        <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold flex items-center gap-2">
                {programel}
            </label>
            {children}
        </div>
    );
}
