'use client';

import { useState } from 'react';
import { Pencil, User, Plus, Trash } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import TiptapEditor from '@/components/TiptapEditor';

export default function AddAbout({ category }) {
    const [formData, setFormData] = useState({
        hod_name: '',
        hod_message: '',
    });

    const [loading, setLoading] = useState(false);
    const [hod_image, setHodImage] = useState(null);

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const form = new FormData();
        form.append('hod_name', formData.hod_name);
        form.append('hod_message', formData.hod_message);

        if (hod_image) form.append('hod_image', hod_image);

        try {
            const res = await fetch('/api/about', {
                method: 'POST',
                body: form,
            });

            if (res.ok) {
                toast.success('Hod details added successfully!');
                setFormData({
                    hod_name: '',
                    hod_message: '',
                });
                setHodImage(null);
            } else {
                toast.error('Failed to add program');
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
                <label className="block text-sm font-semibold mb-1 text-[#1a1830] items-center gap-2">
                    HOD Name <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    name="hod_name"
                    value={formData.hod_name}
                    onChange={handleChange}
                    placeholder=""
                    required
                    className="w-full p-2 border rounded"
                />

                {/* Students Count */}
                <label className="block text-sm font-semibold mb-1 text-[#1a1830] items-center gap-2">
                    HOD Message <span className="text-red-500">*</span>
                </label>
                <TiptapEditor required value={formData.hod_message} onChange={(val) => setFormData({ ...formData, hod_message: val })} />

                {/* Seats */}
                <label className="block text-sm font-semibold mb-1 text-[#1a1830] items-center gap-2">
                    HOD Image <span className="text-red-500">*</span>
                </label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setHodImage(e.target.files[0])}
                    className="w-full p-2 border rounded"
                    required
                />

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#212178] text-white py-3 rounded hover:bg-[#6e4be4]"
                >
                    {loading ? 'Submitting...' : 'Submit Program'}
                </button>
            </form>
        </div>
    );
}
