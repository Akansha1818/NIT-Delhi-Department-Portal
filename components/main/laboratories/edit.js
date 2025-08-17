"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
    Trash2, Pencil, Plus, MapPin, Info, X, Trash
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import TiptapEditor from '@/components/TiptapEditor';
import { Toaster, toast } from 'sonner';

import { DndContext, closestCenter } from "@dnd-kit/core"
import {
    arrayMove,
    SortableContext,
    verticalListSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"

function SkeletonEventCard() {
    return (
        <Card className="shadow-md border border-gray-200 animate-pulse">
            <CardHeader className="flex flex-row justify-between items-center">
                <div className="space-y-2 w-full">
                    {/* Title and Status */}
                    <div className="flex flex-row gap-2 items-center">
                        <div className="h-5 w-40 bg-gray-200 rounded" />
                        {/* <div className="h-5 w-16 bg-gray-200 rounded-full" /> */}
                    </div>

                    {/* Date and Venue */}
                    <div className="h-4 w-48 bg-gray-200 rounded" />

                    {/* Coordinators */}
                    <div className="h-4 w-64 bg-gray-200 rounded" />
                </div>

                {/* Actions (Edit/Delete) */}
                <div className="flex items-center space-x-3">
                    <div className="h-6 w-6 bg-gray-200 rounded" />
                    <div className="h-6 w-6 bg-gray-200 rounded" />
                </div>
            </CardHeader>
        </Card>
    );
}

function SortableImage({ id, src, onRemove }) {
    const [showPreview, setShowPreview] = useState(false);
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} className="relative border rounded-lg p-2 shadow-sm bg-white">
            <div className="flex flex-row items-center justify-between">
                <Tooltip>
                    <TooltipTrigger>
                        <div {...listeners} className="mb-2 cursor-grab text-gray-400 hover:text-gray-600">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                            </svg>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Drag to reorder</p>
                    </TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger>
                        <p onClick={() => onRemove(id)} className="bg-red-100 hover:bg-red-200 rounded-full p-1 cursor-pointer mb-2">
                            <Trash2 size={16} className="text-red-600" />
                        </p>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Delete this image</p>
                    </TooltipContent>
                </Tooltip>
            </div>
            <img
                src={src}
                className="w-full rounded-md object-contain cursor-pointer hover:opacity-80 transition"
                onClick={() => setShowPreview(true)}
            />
            {showPreview && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                    onClick={() => setShowPreview(false)}
                >
                    <div
                        className="relative w-[80%] max-w-5xl bg-white rounded-md overflow-hidden shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <button
                            className="absolute top-2 right-2 z-10 text-white bg-black/60 hover:bg-black/80 p-1 rounded-full"
                            onClick={() => setShowPreview(false)}
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Image Preview */}
                        <img
                            src={src}
                            alt="Full Preview"
                            className="w-full h-auto object-contain"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export default function EditLabs() {
    const [labs, setLabs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [filters, setFilters] = useState({ search: "" });
    const [editedData, setEditedData] = useState({});
    const [newImages, setNewImages] = useState([]);
    const [updating, setUpdating] = useState(false);

    useEffect(() => { fetchLabs(); }, []);

    const fetchLabs = async () => {
        try {
            setLoading(true);
            const res = await axios.get("/api/labs");
            setLabs(res.data.labs || []);
        } catch {
            toast.error("Error loading labs");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Delete this lab?")) return;
        try {
            const res = await fetch(`/api/labs?id=${id}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) {
                toast.success("Deleted successfully");
                fetchLabs();
            } else toast.error("Failed to delete");
        } catch {
            toast.error("Delete failed");
        }
    };

    const handleEdit = (lab) => {
        setEditingId(lab._id);
        setEditedData({ ...lab });
        setNewImages([]);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files).filter((file) =>
            file.type.startsWith('image/')
        );
        const formatted = files.map((file) => ({
            file,
            preview: URL.createObjectURL(file),
        }));
        setNewImages((prev) => [...prev, ...formatted]);
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files).filter((file) =>
            file.type.startsWith('image/')
        );
        const formatted = files.map((file) => ({
            file,
            preview: URL.createObjectURL(file),
        }));
        setNewImages((prev) => [...prev, ...formatted]);
    };

    const removeImage = (index) => {
        setNewImages((prev) => prev.filter((_, i) => i !== index));
    };

    const handleImageDelete = async (imageId) => {
        try {
            const res = await axios.delete(`/api/labs/image?id=${imageId}`);
            if (res.data.success) {
                toast.success("Image deleted");

                setEditedData((prev) => ({
                    ...prev,
                    labImageIds: prev.labImageIds?.filter((id) => id !== imageId)
                }));
            } else {
                toast.error("Failed to delete image");
            }
        } catch {
            toast.error("Image delete failed");
        }
    };

    // ========== Dynamic Objectives ==========
    const handleObjectiveChange = (index, value) => {
        const updated = [...editedData.objectives];
        updated[index] = value;
        setEditedData({ ...editedData, objectives: updated });
    };

    const handleAddObjective = () => {
        setEditedData((prev) => ({
            ...prev,
            objectives: [...prev.objectives, ''],
        }));
    };

    const handleRemoveObjective = (index) => {
        const updated = [...editedData.objectives];
        updated.splice(index, 1);
        setEditedData({ ...editedData, objectives: updated });
    };

    // Hardware
    const handleHardwareChange = (index, field, value) => {
        const updated = [...editedData.hardware_details];
        updated[index][field] = value;
        setEditedData(prev => ({ ...prev, hardware_details: updated }));
    };

    const handleHardwareSpecChange = (index, specIndex, value) => {
        const updated = [...editedData.hardware_details];
        updated[index].specifications[specIndex] = value;
        setEditedData(prev => ({ ...prev, hardware_details: updated }));
    };

    const addHardware = () => {
        setEditedData(prev => ({
            ...prev,
            hardware_details: [...prev.hardware_details, { component: '', specifications: [''], quantity: '' }],
        }));
    };

    const removeHardware = (index) => {
        const updated = [...editedData.hardware_details];
        updated.splice(index, 1);
        setEditedData(prev => ({ ...prev, hardware_details: updated }));
    };

    const addHardwareSpec = (index) => {
        const updated = [...editedData.hardware_details];
        updated[index].specifications.push('');
        setEditedData(prev => ({ ...prev, hardware_details: updated }));
    };

    const removeHardwareSpec = (index, specIndex) => {
        const updated = [...editedData.hardware_details];
        updated[index].specifications.splice(specIndex, 1);
        setEditedData(prev => ({ ...prev, hardware_details: updated }));
    };

    // Software
    const handleSoftwareChange = (index, field, value) => {
        const updated = [...editedData.software_details];
        updated[index][field] = value;
        setEditedData(prev => ({ ...prev, software_details: updated }));
    };

    const handleSoftwareSpecChange = (index, specIndex, value) => {
        const updated = [...editedData.software_details];
        updated[index].specifications[specIndex] = value;
        setEditedData(prev => ({ ...prev, software_details: updated }));
    };

    const addSoftware = () => {
        setEditedData(prev => ({
            ...prev,
            software_details: [...prev.software_details, { component: '', specifications: [''], quantity: '' }],
        }));
    };

    const removeSoftware = (index) => {
        const updated = [...editedData.software_details];
        updated.splice(index, 1);
        setEditedData(prev => ({ ...prev, software_details: updated }));
    };

    const addSoftwareSpec = (index) => {
        const updated = [...editedData.software_details];
        updated[index].specifications.push('');
        setEditedData(prev => ({ ...prev, software_details: updated }));
    };

    const removeSoftwareSpec = (index, specIndex) => {
        const updated = [...editedData.software_details];
        updated[index].specifications.splice(specIndex, 1);
        setEditedData(prev => ({ ...prev, software_details: updated }));
    };

    const handleUpdate = async () => {
        const totalImages = editedData.labImageIds?.length + newImages.length;
        if (totalImages < 1) {
            toast.warning('Please upload at least 1 lab image');
            return;
        }

        try {
            setUpdating(true);
            const formData = new FormData();
            Object.entries(editedData).forEach(([key, value]) => {
                if (Array.isArray(value)) {
                    if (key === "hardware_details" || key === "software_details") {
                        formData.append(key, JSON.stringify(value));
                    } else {
                        formData.append(key, value.join(";"));
                    }
                } else {
                    formData.append(key, value);
                }
            });

            if (editedData.labImageIds?.length) {
                formData.append("orderedImageIds", editedData.labImageIds.join(","));
            }

            newImages.forEach((imgObj) => {
                if (imgObj.file) {
                    formData.append("labImages", imgObj.file);
                }
            });

            const res = await axios.patch(`/api/labs?id=${editingId}`, formData);
            if (res.data.success) {
                toast.success("Updated successfully");
                setEditingId(null);
                fetchLabs();
            } else toast.error("Update failed");
        } catch {
            toast.error("Update request failed");
        } finally {
            setUpdating(false);
            setNewImages([]);
        }
    };

    const filteredLabs = labs.filter((e) => {
        const matchSearch =
            e.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
            e.coordinators?.join(", ").toLowerCase().includes(filters.search.toLowerCase());

        return matchSearch;
    });


    return (
        <div className="space-y-6 mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-2xl font-bold">Manage Existing Labs</h1>
                <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                    <Input
                        placeholder="Search labs by name or coordinator..."
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        className="w-80"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col gap-4 py-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <SkeletonEventCard key={i} />
                    ))}
                </div>
            ) : (
                <div className="grid gap-6">
                    {filteredLabs.length === 0 ? (
                        <div className="text-gray-500 text-left">No labs found. Please add labs.</div>
                    ) : (
                        filteredLabs.map((lab) => (
                            <Card key={lab._id} className="shadow-md border border-gray-200">
                                <CardHeader className="flex flex-row justify-between items-center">
                                    <div>
                                        <h3 className="font-semibold text-xl text-gray-800">{lab.name}</h3>
                                        <p className="text-sm text-gray-500">
                                            {lab.address ?
                                                `${lab.address}` : ``
                                            }

                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {lab.coordinators.length > 1 ? `Coordinators` : `Coordinator`} : {lab.coordinators?.join(", ")}
                                        </p>

                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <Pencil className="text-blue-500 cursor-pointer" onClick={() => handleEdit(lab)} />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Edit lab</p>
                                            </TooltipContent>
                                        </Tooltip>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <Trash2 className="text-red-500 cursor-pointer" onClick={() => handleDelete(lab._id)} />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Delete lab</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>

                                </CardHeader>
                                {editingId === lab._id && (
                                    <CardContent className="flex flex-col gap-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            {/* Input Fields */}
                                            <Field required label="Name">
                                                <Input required value={editedData.name} onChange={(e) => setEditedData({ ...editedData, name: e.target.value })} />
                                            </Field>

                                            <Field required label="Coordinators">
                                                <Input
                                                    value={editedData.coordinators?.join(", ")}
                                                    required
                                                    onChange={(e) => setEditedData({ ...editedData, coordinators: e.target.value.split(",").map((v) => v.trim()) })}
                                                />
                                            </Field>

                                            <Field required label="Technical Staff">
                                                <Input
                                                    value={editedData.technical_staff?.join(", ")}
                                                    required
                                                    onChange={(e) => setEditedData({ ...editedData, technical_staff: e.target.value.split(",").map((v) => v.trim()) })}
                                                />
                                            </Field>

                                            <Field required label="Lab Address">
                                                <Input required value={editedData.address} onChange={(e) => setEditedData({ ...editedData, address: e.target.value })} />
                                            </Field>

                                            <Field required label="Specialization">
                                                <Input required value={editedData.specialization} onChange={(e) => setEditedData({ ...editedData, specialization: e.target.value })} />
                                            </Field>

                                            <Field label="Lab WebPage URL">
                                                <Input value={editedData.webpageURL} onChange={(e) => setEditedData({ ...editedData, webpageURL: e.target.value })} />
                                            </Field>

                                        </div>

                                        <Field required label="Description">
                                            <TiptapEditor
                                                required
                                                value={editedData.description}
                                                onChange={(val) => setEditedData({ ...editedData, description: val })}
                                            />
                                        </Field>

                                        <DynamicTextareaList
                                            title="Objectives"
                                            required
                                            data={editedData.objectives}
                                            onChange={handleObjectiveChange}
                                            onAdd={handleAddObjective}
                                            onRemove={handleRemoveObjective}
                                        />

                                        <label className="block text-lg font-bold mb-2 text-[#1a1830] flex items-center gap-2 underline">Infrastructure Details</label>
                                        {/* Seating */}
                                        <Field required label="Seating Capacity" icon={<MapPin size={16} />}>
                                            <Input required value={editedData.capacity} onChange={(e) => setEditedData({ ...editedData, capacity: e.target.value })} />
                                        </Field>

                                        {/* Hardware Section */}
                                        <label className="block text-sm font-semibold mb-2 text-[#1a1830] flex items-center gap-2 underline">Hardware Details</label>
                                        {editedData.hardware_details.map((hardware, index) => (
                                            <div key={index} className="relative border p-4 rounded-md bg-gray-50 space-y-4">
                                                <div className="grid md:grid-cols-2 gap-4 mt-2">
                                                    <InputField
                                                        label="Component Name"
                                                        name={`hardware_component_${index}`}
                                                        value={hardware.component}
                                                        required
                                                        onChange={(e) => handleHardwareChange(index, 'component', e.target.value)}
                                                    />
                                                    <InputField
                                                        label="Quantity"
                                                        type="number"
                                                        name={`hardware_quantity_${index}`}
                                                        required
                                                        value={hardware.quantity}
                                                        onChange={(e) => handleHardwareChange(index, 'quantity', e.target.value)}
                                                    />
                                                </div>
                                                <DynamicPointList
                                                    title="Specifications"
                                                    data={hardware.specifications}
                                                    onChange={(i, val) => handleHardwareSpecChange(index, i, val)}
                                                    onAdd={() => addHardwareSpec(index)}
                                                    required
                                                    onRemove={(i) => removeHardwareSpec(index, i)}
                                                />
                                                {editedData.hardware_details.length > 1 && (
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <button
                                                                type="button"
                                                                onClick={() => removeHardware(index)}
                                                                className="absolute top-0 right-0 mr-1 mt-1 flex items-center gap-2 bg-red-100 p-2 rounded-full text-red-500 hover:bg-red-200"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Remove this component</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                )}
                                            </div>
                                        ))}
                                        <button type="button" onClick={addHardware} className="text-[#212178] flex items-center gap-2 font-medium">
                                            <Plus size={18} /> Add Hardware
                                        </button>

                                        {/* Software Section */}
                                        <label className="block text-sm font-semibold mb-2 text-[#1a1830] flex items-center gap-2 underline">Software Details</label>
                                        {editedData.software_details.map((software, index) => (
                                            <div key={index} className="relative border p-4 rounded-md bg-gray-50 space-y-4">
                                                <div className="grid md:grid-cols-2 gap-4 mt-2">
                                                    <InputField
                                                        label="Component Name"
                                                        name={`software_component_${index}`}
                                                        value={software.component || ''}
                                                        onChange={(e) => handleSoftwareChange(index, 'component', e.target.value)}
                                                    />
                                                    <InputField
                                                        label="Quantity"
                                                        type="number"
                                                        name={`software_quantity_${index}`}
                                                        value={software.quantity || ''}
                                                        onChange={(e) => handleSoftwareChange(index, 'quantity', e.target.value)}
                                                    />
                                                </div>
                                                <DynamicPointList
                                                    title="Specifications"
                                                    data={software.specifications}
                                                    onChange={(i, val) => handleSoftwareSpecChange(index, i, val)}
                                                    onAdd={() => addSoftwareSpec(index)}
                                                    onRemove={(i) => removeSoftwareSpec(index, i)}
                                                />
                                                {editedData.software_details.length > 1 && (
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <button
                                                                type="button"
                                                                onClick={() => removeSoftware(index)}
                                                                className="absolute top-0 right-0 mr-1 mt-1 flex items-center gap-2 bg-red-100 p-2 rounded-full text-red-500 hover:bg-red-200"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Remove this component</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                )}
                                            </div>
                                        ))}
                                        <button type="button" onClick={addSoftware} className="text-[#212178] flex items-center gap-2 font-medium">
                                            <Plus size={18} /> Add Software
                                        </button>

                                        < div className=" mt-3 md:col-span-2">
                                            <label className="flex items-center gap-2 text-sm font-semibold mb-4 text-[#1a1830]">
                                                Lab Images (at least 1 image required)
                                                <Tooltip>
                                                    <TooltipTrigger>
                                                        <Info className="w-4 h-4 text-gray-500 cursor-pointer" />
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Recommended aspect ratio: 3.3 : 1 (approx.)</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                                <span className="text-red-500">*</span>
                                            </label>

                                            {editedData.labImageIds?.length > 0 ? (

                                                <DndContext
                                                    collisionDetection={closestCenter}
                                                    onDragEnd={(e) => {
                                                        const { active, over } = e;
                                                        if (!over || active.id === over.id) return;

                                                        const oldIndex = editedData.labImageIds.indexOf(active.id);
                                                        const newIndex = editedData.labImageIds.indexOf(over.id);

                                                        const reordered = arrayMove(editedData.labImageIds, oldIndex, newIndex);
                                                        setEditedData((prev) => ({
                                                            ...prev,
                                                            labImageIds: reordered
                                                        }));
                                                    }}
                                                >
                                                    <SortableContext
                                                        items={editedData.labImageIds}
                                                        strategy={verticalListSortingStrategy}
                                                    >
                                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-2">
                                                            {editedData.labImageIds?.map((imgId) => (
                                                                <SortableImage
                                                                    key={imgId}
                                                                    id={imgId}
                                                                    src={`/api/labs/gridfs/${imgId}`}
                                                                    onRemove={() => handleImageDelete(imgId)}
                                                                />
                                                            ))}
                                                        </div>
                                                    </SortableContext>
                                                </DndContext>
                                            )

                                                : (
                                                    <div className="text-gray-500 text-center col-span-full">No images uploaded.</div>
                                                )}

                                            <div
                                                className="border-2 border-dashed border-gray-300 p-6 mt-4 rounded-md text-center bg-muted hover:bg-muted/50 transition"
                                                onDrop={handleDrop}
                                                onDragOver={(e) => e.preventDefault()}
                                            >
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    multiple
                                                    onChange={handleImageUpload}
                                                    className="hidden"
                                                    id="multi-upload"
                                                />
                                                <label htmlFor="multi-upload" className="cursor-pointer text-blue-600 hover:underline">
                                                    Drag or choose files
                                                </label>
                                                <p className="text-sm text-gray-500 mt-2">PNG, JPG (Max 5MB each)</p>
                                            </div>

                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                                                {newImages.map((img, index) => (
                                                    <div key={index} className="relative group border rounded overflow-hidden">
                                                        <img
                                                            src={img.preview}
                                                            alt={`preview-${index}`}
                                                            className="w-full h-32 object-contain"
                                                        />
                                                        <button
                                                            className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-full hover:bg-black/80"
                                                            onClick={() => removeImage(index)}
                                                            type="button"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="md:col-span-2">
                                            <Button className="mt-2" onClick={handleUpdate} disabled={updating}>
                                                {updating ? "Updating..." : "Update"}
                                            </Button>
                                        </div>

                                    </CardContent>
                                )}
                            </Card>
                        ))
                    )}
                </div>
            )
            }
        </div >
    );
}

function Field({ label, icon, children, required = false }) {
    return (
        <div className="flex flex-col gap-2">
            <label className="text-sm font-medium flex items-center gap-2">{label} {required && <span className="text-red-500">*</span>}</label>
            {children}
        </div>
    );
}

function InputField({ label, icon, name, value, onChange, type = 'text', required = false }) {
    return (
        <div>
            <label className="block text-sm font-semibold mb-1 text-[#1a1830] flex items-center gap-2">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                required={required}
                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#212178]"
            />
        </div>
    );
}

function DynamicPointList({ title, icon, data, onChange, onAdd, onRemove, required = false }) {
    return (
        <div>
            <label className="block text-sm font-semibold mb-1 text-[#1a1830] flex items-center gap-2">
                {title} {required && <span className="text-red-500">*</span>}
            </label>
            <div className="space-y-3">
                {data.map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                        <input
                            type="text"
                            value={item}
                            onChange={(e) => onChange(idx, e.target.value)}
                            className="w-full px-3 py-2 border rounded-md"
                            required={required}
                        />
                        {data.length > 1 && (
                            <button
                                type="button"
                                onClick={() => onRemove(idx)}
                                className="text-red-500 hover:text-red-700"
                            >
                                <Trash2 size={18} />
                            </button>
                        )}
                    </div>
                ))}
                <button
                    type="button"
                    onClick={onAdd}
                    className="mt-2 text-[#212178] flex items-center gap-2 font-medium"
                >
                    <Plus size={18} /> Add Point
                </button>
            </div>
        </div>
    );
}

function DynamicTextareaList({ title, data, onChange, onAdd, onRemove, required = false }) {
    return (
        <div>
            <label className="block text-sm font-semibold mb-1 text-[#1a1830] flex items-center gap-2">
                {title} {required && <span className="text-red-500">*</span>}
            </label>
            <div className="space-y-3">
                {data.map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                        <textarea
                            value={item}
                            onChange={(e) => onChange(idx, e.target.value)}
                            className="w-full px-3 py-2 border rounded-md resize-none"
                            rows={3}
                            required={required}
                        />
                        {data.length > 1 && (
                            <button
                                type="button"
                                onClick={() => onRemove(idx)}
                                className="text-red-500 hover:text-red-700 mt-1"
                            >
                                <Trash size={18} />
                            </button>
                        )}
                    </div>
                ))}
                <button
                    type="button"
                    onClick={onAdd}
                    className="mt-2 text-[#212178] flex items-center gap-2 font-medium"
                >
                    <Plus size={18} /> Add Point
                </button>
            </div>
        </div>
    );
}