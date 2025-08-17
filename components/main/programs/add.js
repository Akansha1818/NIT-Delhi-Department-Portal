'use client';

import { useState } from 'react';
import { Pencil, Plus, Trash } from 'lucide-react';
import { toast } from 'sonner';
import TiptapEditor from '@/components/TiptapEditor';

export default function AddPrograms({ category }) {
    const [formData, setFormData] = useState({
        title: '',
        no_of_students: {
            Male: '',
            Female: '',
        },
        no_of_seats: {
            josaa: '',
            csab: '',
            dasa: '',
        },
        scheme: [
            {
                title: '',
                url: '',
            },
        ],
        PSO: '',
        PEO: '',
        PO: '',
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleNestedChange = (section, key, value) => {
        setFormData((prev) => ({
            ...prev,
            [section]: {
                ...prev[section],
                [key]: value,
            },
        }));
    };

    const handleSchemeChange = (index, field, value) => {
        const updatedSchemes = [...formData.scheme];
        updatedSchemes[index][field] = value;
        setFormData((prev) => ({ ...prev, scheme: updatedSchemes }));
    };

    const addScheme = () => {
        setFormData((prev) => ({
            ...prev,
            scheme: [...prev.scheme, { title: '', url: '' }],
        }));
    };

    const removeScheme = (index) => {
        const updatedSchemes = [...formData.scheme];
        updatedSchemes.splice(index, 1);
        setFormData((prev) => ({ ...prev, scheme: updatedSchemes }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const form = new FormData();

            // Append simple fields
            form.append('title', formData.title);
            form.append('category', category);

            // Append nested fields
            form.append('no_of_students[Male]', formData.no_of_students.Male);
            form.append('no_of_students[Female]', formData.no_of_students.Female);

            form.append('no_of_seats[josaa]', formData.no_of_seats.josaa);
            form.append('no_of_seats[csab]', formData.no_of_seats.csab);
            form.append('no_of_seats[dasa]', formData.no_of_seats.dasa);

            // Append scheme array
            formData.scheme.forEach((item, index) => {
                form.append(`scheme[${index}][title]`, item.title);
                form.append(`scheme[${index}][url]`, item.url);
            });

            form.append('PSO', formData.PSO);
            form.append('PEO', formData.PEO);
            form.append('PO', formData.PO);

            const res = await fetch('/api/programs', {
                method: 'POST',
                body: form,
            });

            if (res.ok) {
                toast.success('Program added successfully!');
                setFormData({
                    title: '',
                    no_of_students: { Male: '', Female: '' },
                    no_of_seats: { josaa: '', csab: '', dasa: '' },
                    scheme: [{ title: '', url: '' }],
                    PSO: '',
                    PEO: '',
                    PO: '',
                });
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
        <div className="mx-auto">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Pencil size={20} /> Add {category} Program
            </h2>
            <form className="space-y-6 shadow-md border border-gray-200 px-5 py-5 rounded-xl" onSubmit={handleSubmit}>
                <label className="block text-sm font-semibold mb-1 text-[#1a1830] items-center gap-2">
                    Title <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Program Title"
                    required
                    className="w-full p-2 border rounded"
                />

                {/* Students Count */}
                <label className="block text-sm font-semibold mb-1 text-[#1a1830] items-center">
                    Number of Students :
                </label>
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="block text-sm font-semibold mb-1 text-[#1a1830] items-center">
                            Male <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            value={formData.no_of_students.Male}
                            onChange={(e) => handleNestedChange('no_of_students', 'Male', Number(e.target.value))}
                            placeholder="Number of Male"
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1 text-[#1a1830] items-center">
                            Female <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            value={formData.no_of_students.Female}
                            onChange={(e) => handleNestedChange('no_of_students', 'Female', Number(e.target.value))}
                            placeholder="Number of Female"
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>
                </div>

                {/* Seats */}
                <label className="block text-sm font-semibold mb-1 text-[#1a1830] items-center">
                    Number of Seats :
                </label>
                <div className="grid grid-cols-3 gap-2">
                    <div>
                        <label className="block text-sm font-semibold mb-1 text-[#1a1830] items-center">
                            JoSAA <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            value={formData.no_of_seats.josaa}
                            onChange={(e) => handleNestedChange('no_of_seats', 'josaa', Number(e.target.value))}
                            placeholder="JoSAA Seats"
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-1 text-[#1a1830] items-center">
                            CSAB <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            value={formData.no_of_seats.csab}
                            onChange={(e) => handleNestedChange('no_of_seats', 'csab', Number(e.target.value))}
                            placeholder="CSAB Seats"
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1 text-[#1a1830] items-center">
                            DASA <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            value={formData.no_of_seats.dasa}
                            onChange={(e) => handleNestedChange('no_of_seats', 'dasa', Number(e.target.value))}
                            placeholder="DASA Seats"
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>
                </div>

                {/* Schemes */}
                <div className="space-y-3">
                    <label className="block text-sm font-semibold mb-1 text-[#1a1830] items-center">
                        Scheme  <span className="text-red-500">*</span>
                    </label>
                    {formData.scheme.map((item, index) => (
                        <div key={index} className="flex gap-2 items-center">
                            <input
                                type="text"
                                value={item.title}
                                onChange={(e) => handleSchemeChange(index, 'title', e.target.value)}
                                placeholder="Scheme Title"
                                className="flex-1 p-2 border rounded"
                                required
                            />
                            <input
                                type="text"
                                value={item.url}
                                onChange={(e) => handleSchemeChange(index, 'url', e.target.value)}
                                placeholder="Scheme URL"
                                className="flex-1 p-2 border rounded"
                                required
                            />
                            {formData.scheme.length > 1 && (
                                <button type="button" onClick={() => removeScheme(index)} className="text-red-600">
                                    <Trash size={18} />
                                </button>
                            )}
                        </div>
                    ))}
                    <button type="button" onClick={addScheme} className="flex items-center gap-1 text-blue-600 mt-2">
                        <Plus size={16} /> Add Scheme
                    </button>
                </div>

                <label className="block text-sm font-semibold mb-1 text-[#1a1830] items-center gap-2">
                    Programme Specific Outcomes (PSO)
                </label>
                <TiptapEditor required value={formData.PSO} onChange={(val) => setFormData({ ...formData, PSO: val })} />

                <label className="block text-sm font-semibold mb-1 text-[#1a1830] items-center gap-2">
                    Programme Educational Objectives (PEO)
                </label>
                <TiptapEditor required value={formData.PEO} onChange={(val) => setFormData({ ...formData, PEO: val })} />

                <label className="block text-sm font-semibold mb-1 text-[#1a1830] items-center gap-2">
                    Programme Outcomes (PO)
                </label>
                <TiptapEditor required value={formData.PO} onChange={(val) => setFormData({ ...formData, PO: val })} />

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
