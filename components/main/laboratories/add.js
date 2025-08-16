'use client';

import { useState } from 'react';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Plus, Trash, FlaskConical, Info } from 'lucide-react';
import { toast } from 'sonner';
import TiptapEditor from "@/components/TiptapEditor";

export default function AddLabs() {
    const [formData, setFormData] = useState({
        name: '',
        coordinators: '',
        technical_staff: '',
        address: '',
        specialization: '',
        webpageURL: '',
        description: '',
        objectives: [''],
        capacity: '',
        hardware_details: [{
            component: '',
            specifications: [''],
            quantity: '',
        }],
        software_details: [{
            component: '',
            specifications: [''],
            quantity: '',
        }],
    });

    const [labImages, setLabImages] = useState([]);
    const [loading, setLoading] = useState(false);

    // Input change
    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    // Objective handling
    const handleObjectiveChange = (index, value) => {
        const updated = [...formData.objectives];
        updated[index] = value;
        setFormData(prev => ({ ...prev, objectives: updated }));
    };

    const handleAddObjective = () => {
        setFormData(prev => ({
            ...prev,
            objectives: [...prev.objectives, ''],
        }));
    };

    const handleRemoveObjective = (index) => {
        const updated = [...formData.objectives];
        updated.splice(index, 1);
        setFormData(prev => ({ ...prev, objectives: updated }));
    };

    // Hardware
    const handleHardwareChange = (index, field, value) => {
        const updated = [...formData.hardware_details];
        updated[index][field] = value;
        setFormData(prev => ({ ...prev, hardware_details: updated }));
    };

    const handleHardwareSpecChange = (index, specIndex, value) => {
        const updated = [...formData.hardware_details];
        updated[index].specifications[specIndex] = value;
        setFormData(prev => ({ ...prev, hardware_details: updated }));
    };

    const addHardware = () => {
        setFormData(prev => ({
            ...prev,
            hardware_details: [...prev.hardware_details, { component: '', specifications: [''], quantity: '' }],
        }));
    };

    const removeHardware = (index) => {
        const updated = [...formData.hardware_details];
        updated.splice(index, 1);
        setFormData(prev => ({ ...prev, hardware_details: updated }));
    };

    const addHardwareSpec = (index) => {
        const updated = [...formData.hardware_details];
        updated[index].specifications.push('');
        setFormData(prev => ({ ...prev, hardware_details: updated }));
    };

    const removeHardwareSpec = (index, specIndex) => {
        const updated = [...formData.hardware_details];
        updated[index].specifications.splice(specIndex, 1);
        setFormData(prev => ({ ...prev, hardware_details: updated }));
    };

    // Software
    const handleSoftwareChange = (index, field, value) => {
        const updated = [...formData.software_details];
        updated[index][field] = value;
        setFormData(prev => ({ ...prev, software_details: updated }));
    };

    const handleSoftwareSpecChange = (index, specIndex, value) => {
        const updated = [...formData.software_details];
        updated[index].specifications[specIndex] = value;
        setFormData(prev => ({ ...prev, software_details: updated }));
    };

    const addSoftware = () => {
        setFormData(prev => ({
            ...prev,
            software_details: [...prev.software_details, { component: '', specifications: [''], quantity: '' }],
        }));
    };

    const removeSoftware = (index) => {
        const updated = [...formData.software_details];
        updated.splice(index, 1);
        setFormData(prev => ({ ...prev, software_details: updated }));
    };

    const addSoftwareSpec = (index) => {
        const updated = [...formData.software_details];
        updated[index].specifications.push('');
        setFormData(prev => ({ ...prev, software_details: updated }));
    };

    const removeSoftwareSpec = (index, specIndex) => {
        const updated = [...formData.software_details];
        updated[index].specifications.splice(specIndex, 1);
        setFormData(prev => ({ ...prev, software_details: updated }));
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
        setLabImages((prev) => [...prev, ...formatted]);
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files).filter((file) =>
            file.type.startsWith('image/')
        );
        const formatted = files.map((file) => ({
            file,
            preview: URL.createObjectURL(file),
        }));
        setLabImages((prev) => [...prev, ...formatted]);
    };

    const removeImage = (index) => {
        setLabImages((prev) => prev.filter((_, i) => i !== index));
    };

    // Submit handler
    const handleSubmit = async (e) => {
        e.preventDefault();

        const form = new FormData();

        if (labImages.length < 1) {
            toast.warning('Please upload at least 1 lab images');
            return;
        }

        setLoading(true);

        Object.entries(formData).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                if (key === "hardware_details" || key === "software_details") {
                    form.append(key, JSON.stringify(value));
                } else {
                    form.append(key, value.join(';'));
                }
            } else {
                form.append(key, value);
            }
        });

        labImages.forEach(({ file }) => form.append('labImages', file));

        try {
            const res = await fetch('/api/labs', {
                method: 'POST',
                body: form,
            });

            if (res.ok) {
                toast.success('Lab submitted successfully!');
                setFormData({
                    name: '',
                    coordinators: '',
                    technical_staff: '',
                    address: '',
                    specialization: '',
                    webpageURL: '',
                    description: '',
                    objectives: [''],
                    capacity: '',
                    hardware_details: [{
                        component: '',
                        specifications: [''],
                        quantity: '',
                    }],
                    software_details: [{
                        component: '',
                        specifications: [''],
                        quantity: '',
                    }],
                });
                setLabImages([]);
            } else {
                toast.error('Failed to submit lab');
            }
        } catch (err) {
            console.error(err);
            toast.error('Error occurred while submitting');
        }

        setLoading(false);
    };

    return (
        <div className="w-full mx-auto">

            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
                <FlaskConical className="text-[#7f5af0]" size={28} />
                <h2 className="text-2xl font-bold text-[#1a1830]">Add New Lab</h2>
            </div>

            {/* Form */}
            <form className="space-y-6 shadow-md border border-gray-200 px-5 py-5 rounded-xl" onSubmit={handleSubmit}>
                <div className="grid md:grid-cols-2 gap-4">
                    <InputField label="Lab Name" name="name" value={formData.name} onChange={handleChange} required />
                    <InputField label="Coordinators (comma-separated)" name="coordinators" value={formData.coordinators} onChange={handleChange} required />
                    <InputField label="Technical Staffs (comma-separated)" name="technical_staff" value={formData.technical_staff} onChange={handleChange} required />
                    <InputField label="Lab Address" name="address" value={formData.address} onChange={handleChange} required />
                    <InputField label="Specialization" name="specialization" value={formData.specialization} onChange={handleChange} required />
                    <InputField label="Lab WebPage URL" name="webpageURL" value={formData.webpageURL} onChange={handleChange} />
                </div>

                <LabelledEditor label="Description" value={formData.description} onChange={(val) => setFormData({ ...formData, description: val })} required />

                {/* Objectives */}
                <DynamicTextareaList
                    title="Objectives"
                    data={formData.objectives}
                    onChange={handleObjectiveChange}
                    onAdd={handleAddObjective}
                    onRemove={handleRemoveObjective}
                    required
                />

                <label className="block text-lg font-bold mb-2 text-[#1a1830] flex items-center gap-2 underline">Infrastructure Details</label>
                {/* Seating */}
                <InputField label="Seating Capacity" name="capacity" type="number" value={formData.capacity} onChange={handleChange} required />

                {/* Hardware Section */}
                <label className="block text-sm font-semibold mb-2 text-[#1a1830] flex items-center gap-2 underline">
                    Hardware Details
                </label>
                {formData.hardware_details.map((hardware, index) => (
                    <div key={index} className="relative border p-4 rounded-md bg-gray-50 mb-4 space-y-3">
                        {/* Two-field Grid: Component Name & Quantity */}
                        <div className="grid md:grid-cols-2 gap-4 mt-2">
                            <InputField
                                label="Component Name"
                                name={`hardware_component_${index}`}
                                value={hardware.component}
                                required
                                onChange={(e) => handleHardwareChange(index, "component", e.target.value)}
                            />
                            <InputField
                                label="Quantity"
                                type="number"
                                name={`hardware_quantity_${index}`}
                                value={hardware.quantity}
                                required
                                onChange={(e) => handleHardwareChange(index, "quantity", e.target.value)}
                            />
                        </div>

                        {/* Dynamic Specifications List */}
                        <DynamicPointList
                            title="Specifications"
                            data={hardware.specifications}
                            onChange={(i, val) => handleHardwareSpecChange(index, i, val)}
                            onAdd={() => addHardwareSpec(index)}
                            onRemove={(i) => removeHardwareSpec(index, i)}
                            required
                        />

                        {/* Remove Hardware Component */}
                        {formData.hardware_details.length > 1 && (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        type="button"
                                        onClick={() => removeHardware(index)}
                                        className="absolute top-0 right-0 mr-1 mt-1 flex items-center gap-2 bg-red-100 p-2 rounded-full text-red-500 hover:bg-red-200"
                                    >
                                        <Trash size={16} />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Remove this component</p>
                                </TooltipContent>
                            </Tooltip>
                        )}
                    </div>
                ))}
                <button type="button" onClick={addHardware} className="text-[#7f5af0] flex items-center gap-2 font-medium">
                    <Plus size={18} /> Add Hardware
                </button>

                {/* Software Section */}
                <label className="block text-sm font-semibold mb-2 text-[#1a1830] flex items-center gap-2 underline">Software Details</label>
                {formData.software_details.map((software, index) => (
                    <div key={index} className="relative border p-4 rounded-md bg-gray-50 mb-4 space-y-4">
                        <div className="grid md:grid-cols-2 gap-4 mt-2">
                            <InputField
                                label="Component Name"
                                name={`software_component_${index}`}
                                value={software.component}
                                onChange={(e) => handleSoftwareChange(index, 'component', e.target.value)}
                            />
                            <InputField
                                label="Quantity"
                                type="number"
                                name={`software_quantity_${index}`}
                                value={software.quantity}
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
                        {formData.software_details.length > 1 && (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        type="button"
                                        onClick={() => removeSoftware(index)}
                                        className="absolute top-0 right-0 mr-1 mt-1 flex items-center gap-2 bg-red-100 p-2 rounded-full text-red-500 hover:bg-red-200"
                                    >
                                        <Trash size={16} />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Remove this component</p>
                                </TooltipContent>
                            </Tooltip>
                        )}
                    </div>
                ))}
                <button type="button" onClick={addSoftware} className="text-[#7f5af0] flex items-center gap-2 font-medium">
                    <Plus size={18} /> Add Software
                </button>

                {/* Images */}
                <div>
                    <label className="flex items-center gap-2 text-sm font-semibold mb-1 text-[#1a1830]">
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
                        {labImages.map((img, index) => (
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

                {/* Submit */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#7f5af0] text-white font-semibold py-3 rounded-md hover:bg-[#6e4be4] transition-all duration-200"
                >
                    {loading ? 'Submitting...' : 'Submit Lab'}
                </button>
            </form>
        </div>
    );

}

function InputField({ label, name, value, onChange, type = 'text', required = false }) {
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
                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#7f5af0]"
            />
        </div>
    );
}

function LabelledEditor({ label, value, onChange }) {
    return (
        <div>
            <label className="block text-sm font-semibold mb-1 text-[#1a1830] flex items-center gap-2">
                {label} <span className="text-red-500">*</span>
            </label>
            <TiptapEditor value={value} onChange={onChange} required />
        </div>
    );
}

function DynamicPointList({ title, data, onChange, onAdd, onRemove, required = false }) {
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
                                <Trash size={18} />
                            </button>
                        )}
                    </div>
                ))}
                <button
                    type="button"
                    onClick={onAdd}
                    className="mt-2 text-[#7f5af0] flex items-center gap-2 font-medium"
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
                    <div key={idx} className="flex gap-2 items-start">
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
                    className="mt-2 text-[#7f5af0] flex items-center gap-2 font-medium"
                >
                    <Plus size={18} /> Add Point
                </button>
            </div>
        </div>
    );
}