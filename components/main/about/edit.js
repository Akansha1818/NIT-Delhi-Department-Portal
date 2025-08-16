'use client';

import { useState } from 'react';
import { Toaster, toast } from 'sonner';
import TiptapEditor from '@/components/TiptapEditor';
import { Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EditAbout({ data }) {
    const [formData, setFormData] = useState({
        hod_name: data.data.hod_name || '',
        hod_message: data.data.hod_message || '',
        hod_imageId: data.data.hod_imageId || null,
    });

    const [hodImage, setHodImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [imageLoading, setImageLoading] = useState(true);
    const [showPreview, setShowPreview] = useState(false);

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleImageChange = (e) => {
        setHodImage(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const form = new FormData();
        form.append('hod_name', formData.hod_name);
        form.append('hod_message', formData.hod_message);
        if (hodImage) form.append('hod_image', hodImage);

        try {
            const res = await fetch(`/api/about?id=${data.data._id}`, {
                method: 'PATCH',
                body: form,
            });

            if (res.ok) {
                toast.success('HOD details updated successfully!');
                const newRes = await fetch("/api/about");
                const newData = await newRes.json();
                setFormData({
                    hod_name: newData.data.hod_name || '',
                    hod_message: newData.data.hod_message || '',
                    hod_imageId: newData.data.hod_imageId || null,
                });
            } else {
                toast.error('Failed to update details');
            }
        } catch (err) {
            console.error(err);
            toast.error('An error occurred');
        }

        setLoading(false);
    };

    return (
        <div className="mx-auto bg-white">
            <Toaster richColors position="top-center" />

            <form className="space-y-5" onSubmit={handleSubmit}>
                <label className="block text-sm font-semibold mb-1 text-[#1a1830]">
                    HOD Name <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    name="hod_name"
                    value={formData.hod_name}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                    required
                />

                <label className="block text-sm font-semibold mb-1 text-[#1a1830]">
                    HOD Message <span className="text-red-500">*</span>
                </label>
                <TiptapEditor required value={formData.hod_message} onChange={(val) => setFormData({ ...formData, hod_message: val })} />

                <label className="block text-sm font-semibold mb-1 text-[#1a1830]">
                    Change Image 
                </label>
                <div className="relative w-20 h-20 mt-5">
                    {imageLoading && (
                        formData.hod_imageId ? (
                            <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-10 rounded">
                                <Loader2 className="animate-spin text-gray-600 w-6 h-6" />
                            </div>
                        ) : (
                            <div className="w-full text-gray-500 text-center col-span-full">No image uploaded.</div>
                        )
                    )}
                    {formData.hod_imageId && (
                        <img
                            src={`/api/about/gridfs/${formData.hod_imageId}`}
                            onLoad={() => setImageLoading(false)}
                            onError={() => setImageLoading(false)}
                            onClick={() => setShowPreview(true)}
                            className={`inline-block object-contain rounded transition-opacity duration-300 ${imageLoading ? "opacity-0" : "opacity-100"
                                }`}
                        />
                    )}

                    {showPreview && (
                        <div
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-100"
                            onClick={() => setShowPreview(false)}
                        >
                            <div
                                className="relative w-[60%] max-w-5xl bg-white rounded-md overflow-hidden shadow-xl"
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
                                    src={`/api/about/gridfs/${formData.hod_imageId}`}
                                    alt="Full Preview"
                                    className="w-full h-auto object-contain"
                                />
                            </div>
                        </div>
                    )}
                </div>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full p-2 border rounded"
                />

                <div className="md:col-span-2">
                    <Button className="mt-2" onClick={handleSubmit} disabled={loading}>
                        {loading ? "Updating..." : "Update"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
