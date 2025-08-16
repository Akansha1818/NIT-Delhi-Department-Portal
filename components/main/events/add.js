'use client';

import { useState } from 'react';
import { CalendarDays, Plus, Trash, Info } from 'lucide-react';
import { toast } from 'sonner';
import TiptapEditor from '@/components/TiptapEditor';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';

export default function AddEvents({ category }) {
    const [formData, setFormData] = useState({
        title: '',
        coordinators: '',
        startDate: '',
        lastDate: '',
        venue: '',
        description: '',
        organizedBy: '',
    });

    const [banner, setBanner] = useState(null);
    const [brochure, setBrochure] = useState(null);
    const [eventImages, setEventImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
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
        setEventImages((prev) => [...prev, ...formatted]);
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files).filter((file) =>
            file.type.startsWith('image/')
        );
        const formatted = files.map((file) => ({
            file,
            preview: URL.createObjectURL(file),
        }));
        setEventImages((prev) => [...prev, ...formatted]);
    };

    const removeImage = (index) => {
        setEventImages((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuccess(false);

        if (category !== 'Upcoming' && eventImages.length < 4) {
            toast.warning('Please upload at least 4 event images');
            return;
        }

        setLoading(true);

        const form = new FormData();
        Object.entries(formData).forEach(([key, val]) => {
            form.append(key, val);
        });
        form.append('category', category);
        form.append('status', 'Live');
        if (banner) form.append('banner', banner);
        if (brochure) form.append('brochure', brochure);
        eventImages.forEach(({ file }) => form.append('eventImages', file));

        try {
            const res = await fetch('/api/events', {
                method: 'POST',
                body: form,
            });

            if (res.ok) {
                toast.success('Event submitted successfully!');
                setFormData({
                    title: '',
                    coordinators: '',
                    startDate: '',
                    lastDate: '',
                    venue: '',
                    description: '',
                    organizedBy: '',
                });
                setBanner(null);
                setBrochure(null);
                setEventImages([]);
                setSuccess(true);
            } else {
                toast.error('Failed to submit event');
            }
        } catch (err) {
            console.error(err);
            toast.error('An error occurred while submitting');
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="w-full mx-auto">
            <div className="flex items-center gap-3 mb-4">
                <CalendarDays className="text-[#7f5af0]" size={28} />
                <h2 className="text-2xl font-bold text-[#1a1830]">Add New {category} Event</h2>
            </div>

            <form className="space-y-6 shadow-md border border-gray-200 px-5 py-5 rounded-xl" onSubmit={handleSubmit}>
                {/* Basic Inputs */}
                <div className="grid md:grid-cols-2 gap-4">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-semibold mb-1 text-[#1a1830]">
                            Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 rounded-md border"
                        />
                    </div>

                    {/* Coordinators */}
                    <div>
                        <label className="block text-sm font-semibold mb-1 text-[#1a1830]">
                            Coordinators (comma-separated) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="coordinators"
                            value={formData.coordinators}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 rounded-md border"
                        />
                    </div>
                </div>

                {/* Dates */}
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold mb-1 text-[#1a1830]">
                            Start Date <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            name="startDate"
                            value={formData.startDate}
                            onChange={handleChange}
                            required
                            className="w-full p-2 border rounded-md"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-1 text-[#1a1830]">
                            Last Date
                        </label>
                        <input
                            type="date"
                            name="lastDate"
                            value={formData.lastDate}
                            onChange={handleChange}
                            className="w-full p-2 border rounded-md"
                        />
                    </div>
                </div>

                {/* Poster & Venue */}
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold mb-1 text-[#1a1830]">
                            Event Poster <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setBanner(e.target.files[0])}
                            required
                            className="w-full p-2 border rounded-md"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-1 text-[#1a1830]">
                            Venue <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="venue"
                            value={formData.venue}
                            onChange={handleChange}
                            required
                            className="w-full p-2 border rounded-md"
                        />
                    </div>
                </div>

                {/* Description */}
                <label className="block text-sm font-semibold mb-1 text-[#1a1830]">
                    Description <span className="text-red-500">*</span>
                </label>
                <TiptapEditor required value={formData.description} onChange={(val) => setFormData({ ...formData, description: val })} />

                {/* Brochure & Organizer */}
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold mb-1 text-[#1a1830]">
                            Brochure <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={(e) => setBrochure(e.target.files[0])}
                            required
                            className="w-full p-2 border rounded-md"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-1 text-[#1a1830]">
                            Organized By <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="organizedBy"
                            value={formData.organizedBy}
                            onChange={handleChange}
                            required
                            className="w-full p-2 border rounded-md"
                        />
                    </div>
                </div>

                {/* Event Images Section */}
                {category !== 'Upcoming' && (
                    <div>
                        <label className="flex items-center gap-2 text-sm font-semibold mb-1 text-[#1a1830]">
                            Event Images (at least 4)
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

                        <div
                            className="border-2 border-dashed border-gray-300 p-6 rounded-md text-center bg-muted hover:bg-muted/50 transition"
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
                            {eventImages.map((img, index) => (
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
                                        <Trash className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#7f5af0] text-white font-semibold py-3 rounded-md hover:bg-[#6e4be4] transition-all duration-200"
                >
                    {loading ? 'Submitting...' : 'Submit Event'}
                </button>
            </form>
        </div>
    );
}
