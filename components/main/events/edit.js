"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Loader2, Trash2, Pencil, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import TiptapEditor from '@/components/TiptapEditor';
import { toast } from 'sonner';

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
                        <div className="h-5 w-32 bg-gray-200 rounded" />
                        <div className="h-5 w-16 bg-gray-200 rounded-full" />
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

export default function EditEvents({ category }) {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [filters, setFilters] = useState({ search: "", monthYear: "" });
    const [editedData, setEditedData] = useState({});
    const [newImages, setNewImages] = useState([]);
    const [newBanner, setNewBanner] = useState(null);
    const [newBrochure, setNewBrochure] = useState(null);
    const [bannerLoading, setBannerLoading] = useState(true);
    const [brochureLoading, setBrochureLoading] = useState(true);
    const [showPreview, setShowPreview] = useState(false);
    const [updating, setUpdating] = useState(false);
 
    useEffect(() => { fetchEvents(); }, []);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const res = await axios.get("/api/events");
            setEvents(res.data.events || []);
            toast.success("Events loaded successfully");
        } catch {
            toast.error("Error loading events");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Delete this event?")) return;
        try {
            const res = await fetch(`/api/events?id=${id}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) {
                toast.success("Deleted successfully");
                fetchEvents();
            } else toast.error("Failed to delete");
        } catch {
            toast.error("Delete failed");
        }
    };

    const handleEdit = (event) => {
        setEditingId(event._id);
        setEditedData({ ...event });
        setNewImages([]);
        setNewBanner(null);
        setNewBrochure(null);
        setBannerLoading(true);
        setBrochureLoading(true);
        setShowPreview(false);
    };

    const handleImageDelete = async (imageId) => {
        try {
            const res = await axios.delete(`/api/events/image?id=${imageId}`);
            if (res.data.success) {
                toast.success("Image deleted");

                setEditedData((prev) => ({
                    ...prev,
                    eventImageIds: prev.eventImageIds?.filter((id) => id !== imageId)
                }));
            } else {
                toast.error("Failed to delete image");
            }
        } catch {
            toast.error("Image delete failed");
        }
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

    const handleUpdate = async () => {
        const totalImages = editedData.eventImageIds?.length + newImages.length;
        if (category !== 'Upcoming' && totalImages < 4) {
            toast.warning('Please upload at least 4 event images');
            return;
        }

        try {
            setUpdating(true);
            const formData = new FormData();
            Object.entries(editedData).forEach(([key, value]) => {
                if (Array.isArray(value)) {
                    formData.append(key, value.join(","));
                } else {
                    formData.append(key, value);
                }
            });

            if (editedData.eventImageIds?.length) {
                formData.append("orderedImageIds", editedData.eventImageIds.join(","));
            }

            newImages.forEach((imgObj) => {
                if (imgObj.file) {
                    formData.append("eventImages", imgObj.file);
                }
            });

            if (newBanner) formData.append("banner", newBanner);
            if (newBrochure) formData.append("brochure", newBrochure);

            const res = await axios.patch(`/api/events?id=${editingId}`, formData);
            if (res.data.success) {
                toast.success("Updated successfully");
                setEditingId(null);
                fetchEvents();
            } else toast.error("Update failed");
        } catch {
            toast.error("Update request failed");
        } finally {
            setUpdating(false);
            setNewImages([]);
            setNewBanner(null);
            setNewBrochure(null);
            setBannerLoading(true);
            setBrochureLoading(true);
        }
    };

    const filteredEvents = events.filter((e) => {
        const matchCategory =
            e.category?.toLowerCase() === category?.toLowerCase();

        const matchSearch =
            e.title?.toLowerCase().includes(filters.search.toLowerCase()) ||
            e.coordinators?.join(", ").toLowerCase().includes(filters.search.toLowerCase());

        const eventDate = new Date(e.startdate);
        const matchMonth = filters.month
            ? eventDate.toLocaleString("default", { month: "long" }) === filters.month
            : true;

        const matchYear = filters.year
            ? eventDate.getFullYear().toString() === filters.year
            : true;

        const matchStatus =
            filters.status ? e.status === filters.status : true;

        return matchCategory && matchSearch && matchMonth && matchYear && matchStatus;
    });

    return (
        <div className="space-y-6 mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-2xl font-bold">Manage {category} Events</h1>
                <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                    <Select
                        value={filters.status}
                        onValueChange={(value) =>
                            setFilters({ ...filters, status: value === "all" ? "" : value })
                        }
                    >
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="Live">Live</SelectItem>
                            <SelectItem value="Archived">Archived</SelectItem>
                        </SelectContent>
                    </Select>
                    <Input
                        placeholder="Search title or coordinator..."
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    />
                    <Select
                        value={filters.month}
                        onValueChange={(value) =>
                            setFilters({ ...filters, month: value === "all" ? "" : value })
                        }
                    >
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="All Months" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            {[
                                "January", "February", "March", "April", "May", "June",
                                "July", "August", "September", "October", "November", "December"
                            ].map((month) => (
                                <SelectItem key={month} value={month}>{month}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select
                        value={filters.year}
                        onValueChange={(value) =>
                            setFilters({ ...filters, year: value === "all" ? "" : value })
                        }
                    >
                        <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="All Years" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            {Array.from({ length: 10 }, (_, i) => {
                                const year = (new Date().getFullYear() - i).toString();
                                return <SelectItem key={year} value={year}>{year}</SelectItem>;
                            })}
                        </SelectContent>
                    </Select>
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
                    {filteredEvents.length === 0 ? (
                        <div className="text-gray-500 text-left">No {category} events found. Please add events.</div>
                    ) : (
                        filteredEvents.map((event) => (
                            <Card key={event._id} className="shadow-md border border-gray-200">
                                <CardHeader className="flex flex-row justify-between items-center">
                                    <div>
                                        <div className="flex flex-row gap-2">
                                            <h3 className="font-semibold text-xl text-gray-800">{event.title}</h3>
                                            <div
                                                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold
                                                    ${event.status === "Live" ? "bg-green-100 text-green-800" : "bg-red-200 text-gray-700"}
                                                `}
                                            >
                                                {event.status}
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-500">
                                            {event.venue} •{" "}
                                            {new Date(event.startdate).toLocaleDateString("en-IN", {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric",
                                            })}
                                            {event.lasttdate
                                                ? ` – ${new Date(event.lasttdate).toLocaleDateString("en-IN", {
                                                    day: "numeric",
                                                    month: "short",
                                                    year: "numeric",
                                                })}`
                                                : ""}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Coordinators: {event.coordinators?.join(", ")}
                                        </p>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <Pencil className="text-blue-500 cursor-pointer" onClick={() => handleEdit(event)} />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Edit event</p>
                                            </TooltipContent>
                                        </Tooltip>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <Trash2 className="text-red-500 cursor-pointer" onClick={() => handleDelete(event._id)} />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Delete event</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>

                                </CardHeader>
                                {editingId === event._id && (
                                    <CardContent className="flex flex-col gap-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            {/* Input Fields */}
                                            <Field required label="Title">
                                                <Input required value={editedData.title} onChange={(e) => setEditedData({ ...editedData, title: e.target.value })} />
                                            </Field>

                                            <Field required label="Venue">
                                                <Input required value={editedData.venue} onChange={(e) => setEditedData({ ...editedData, venue: e.target.value })} />
                                            </Field>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                            <Field required label="Start Date">
                                                <Input required type="date" value={editedData.startdate?.slice(0, 10) || ""} onChange={(e) => setEditedData({ ...editedData, startdate: e.target.value })} />
                                            </Field>

                                            <Field label="End Date">
                                                <Input type="date" value={editedData.lasttdate?.slice(0, 10) || ""} onChange={(e) => setEditedData({ ...editedData, lasttdate: e.target.value })} />
                                            </Field>

                                            <Field label="Status">
                                                <Select
                                                    value={editedData.status}
                                                    onValueChange={(val) => setEditedData({ ...editedData, status: val })}
                                                >
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Select status" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Live">Live</SelectItem>
                                                        <SelectItem value="Archived">Archived</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </Field>
                                        </div>

                                        <Field required label="Organized By">
                                            <Input required value={editedData.organizedBy} onChange={(e) => setEditedData({ ...editedData, organizedBy: e.target.value })} />
                                        </Field>

                                        <Field required label="Coordinators">
                                            <Input
                                                required
                                                value={editedData.coordinators?.join(", ")}
                                                onChange={(e) => setEditedData({ ...editedData, coordinators: e.target.value.split(",").map((v) => v.trim()) })}
                                            />
                                        </Field>

                                        <Field required label="Description">
                                            <TiptapEditor
                                                required
                                                value={editedData.description}
                                                onChange={(val) => setEditedData({ ...editedData, description: val })}
                                            />
                                        </Field>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            {/* Brochure */}
                                            <Field required label="Brochure">
                                                <div className="relative w-full h-20 mt-5">
                                                    {brochureLoading && (
                                                        event.brochureId ? (
                                                            <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-10 rounded">
                                                                <Loader2 className="animate-spin text-gray-600 w-6 h-6" />
                                                            </div>
                                                        ) : (
                                                            <div className="text-gray-500 text-center col-span-full">No brochure uploaded.</div>
                                                        )
                                                    )}
                                                    {event.brochureId && (
                                                        <a
                                                            href={`/api/events/gridfs/${event.brochureId}`}
                                                            target="_blank"
                                                            className={`inline-block transition-opacity duration-300 ${brochureLoading ? "opacity-0" : "opacity-100"
                                                                }`}
                                                        >
                                                            <img
                                                                src="/pdf.png"
                                                                alt="Brochure"
                                                                className="w-20 inline-block mr-2"
                                                                onLoad={() => setBrochureLoading(false)}
                                                                onError={() => setBrochureLoading(false)}
                                                            />
                                                        </a>
                                                    )}
                                                </div>
                                                <Input required className="mt-5" type="file" accept=".pdf" onChange={(e) => setNewBrochure(e.target.files[0])} />
                                            </Field>

                                            {/* Banner */}
                                            <Field required label="Event Poster">
                                                <div className="relative w-20 h-20 mt-5">
                                                    {bannerLoading && (
                                                        event.bannerId ? (
                                                            <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-10 rounded">
                                                                <Loader2 className="animate-spin text-gray-600 w-6 h-6" />
                                                            </div>
                                                        ) : (
                                                            <div className="w-full text-gray-500 text-center col-span-full">No poster uploaded.</div>
                                                        )
                                                    )}
                                                    {event.bannerId && (
                                                        <img
                                                            src={`/api/events/gridfs/${event.bannerId}`}
                                                            onLoad={() => setBannerLoading(false)}
                                                            onError={() => setBannerLoading(false)}
                                                            onClick={() => setShowPreview(true)}
                                                            className={`inline-block object-contain rounded transition-opacity duration-300 ${bannerLoading ? "opacity-0" : "opacity-100"
                                                                }`}
                                                        />
                                                    )}

                                                    {showPreview && (
                                                        <div
                                                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-100"
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
                                                                    src={`/api/events/gridfs/${event.bannerId}`}
                                                                    alt="Full Preview"
                                                                    className="w-full h-auto object-contain"
                                                                />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                                <Input required className="mt-5" type="file" accept="image/*" onChange={(e) => setNewBanner(e.target.files[0])} />
                                            </Field>
                                        </div>

                                        {category === "Upcoming" ? (
                                            ""
                                        ) : (
                                            < div className="mt-5 md:col-span-2">
                                                <label className="text-sm font-medium flex items-center gap-2 mb-5">
                                                    Event Images (at least 4 images required)
                                                </label>
                                                {editedData.eventImageIds?.length > 0 ? (
                                                    <DndContext
                                                        collisionDetection={closestCenter}
                                                        onDragEnd={(e) => {
                                                            const { active, over } = e;
                                                            if (!over || active.id === over.id) return;

                                                            const oldIndex = editedData.eventImageIds.indexOf(active.id);
                                                            const newIndex = editedData.eventImageIds.indexOf(over.id);

                                                            const reordered = arrayMove(editedData.eventImageIds, oldIndex, newIndex);
                                                            setEditedData((prev) => ({
                                                                ...prev,
                                                                eventImageIds: reordered
                                                            }));
                                                        }}
                                                    >
                                                        <SortableContext
                                                            items={editedData.eventImageIds}
                                                            strategy={verticalListSortingStrategy}
                                                        >
                                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-2">
                                                                {editedData.eventImageIds?.map((imgId) => (
                                                                    <SortableImage
                                                                        key={imgId}
                                                                        id={imgId}
                                                                        src={`/api/events/gridfs/${imgId}`}
                                                                        onRemove={() => handleImageDelete(imgId)}
                                                                    />
                                                                ))}
                                                            </div>
                                                        </SortableContext>
                                                    </DndContext>
                                                ) : (
                                                    <div className="text-gray-500 text-center col-span-full">No images uploaded.</div>
                                                )
                                                }

                                                <div
                                                    className="border-2 border-dashed border-gray-300 p-6 rounded-md text-center bg-muted hover:bg-muted/50 transition mt-5"
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

                                                {/* Preview Thumbnails */}
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
                                        )}

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

// Utility Field wrapper with label & icon
function Field({ label, children, required = false }) {
    return (
        <div className="flex flex-col gap-2">
            <label className="text-sm font-medium flex items-center gap-2">{label} {required && <span className="text-red-500">*</span>}</label>
            {children}
        </div>
    );
}
