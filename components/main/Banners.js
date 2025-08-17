"use client"

import { useEffect, useState, useRef } from "react"
import axios from "axios"
import { X, Upload, Trash2 } from "lucide-react"
import { toast } from "sonner"
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

function SkeletonCard() {
    return (
        <div className="border rounded-lg p-2 shadow-sm bg-white animate-pulse space-y-3">
            <div className="flex flex-row items-center justify-between">
                <div className="w-5 h-5 bg-gray-300 rounded" />
                <div className="w-5 h-5 bg-gray-300 rounded" />
            </div>
            <div className="w-full h-40 bg-gray-300 rounded-md" />
        </div>
    )
}

function SortableItem({ id, banner, index, onRemove }) {
    const [showPreview, setShowPreview] = useState(false)
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    return (
        <>
            <div
                ref={setNodeRef}
                style={style}
                {...attributes}
                className="relative border rounded-lg p-2 shadow-sm bg-white"
            >
                <div className="flex flex-row items-center justify-between">
                    <Tooltip>
                        <TooltipTrigger>
                            <div
                                {...listeners}
                                className="mb-2 cursor-grab text-gray-400 hover:text-gray-600"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                    stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M4 8h16M4 16h16" />
                                </svg>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Drag to reorder</p>
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger>
                            <p
                                onClick={() => onRemove && onRemove(banner._id)}
                                className="bg-red-100 hover:bg-red-200 rounded-full p-1 cursor-pointer mb-2"
                            >
                                <Trash2 size={16} className="text-red-600" />
                            </p>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Delete this banner</p>
                        </TooltipContent>
                    </Tooltip>
                </div>

                <img
                    src={banner.preview}
                    alt={`Banner ${index}`}
                    className="w-full rounded-md object-contain cursor-pointer hover:opacity-80 transition"
                    onClick={() => setShowPreview(true)}
                />
            </div>

            {showPreview && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                    onClick={() => setShowPreview(false)}
                >
                    <div
                        className="relative w-[80%] max-w-5xl bg-white rounded-md overflow-hidden shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            className="absolute top-2 right-2 z-10 text-white bg-black/60 hover:bg-black/80 p-1 rounded-full"
                            onClick={() => setShowPreview(false)}
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <img
                            src={banner.preview}
                            alt="Full Preview"
                            className="w-full h-auto object-contain"
                        />
                    </div>
                </div>
            )}
        </>
    )
}

export default function BannerForm() {
    const [banners, setBanners] = useState([])
    const [oldBanners, setOldBanners] = useState([])
    const [initialOrder, setInitialOrder] = useState([])
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)
    const [showPreview, setShowPreview] = useState(false)

    const hasShownToast = useRef(false)

    useEffect(() => {
        fetchBanners()
    }, [])

    const fetchBanners = async () => {
        try {
            setFetching(true)
            const res = await axios.get("/api/banners")
            const sorted = res.data
                .map((banner) => ({
                    file: null,
                    preview: banner.imageData,
                    _id: banner._id,
                    order: banner.order || 0,
                }))
                .sort((a, b) => a.order - b.order)

            setOldBanners(sorted)
            setInitialOrder(sorted.map((b) => b._id))
            if (!hasShownToast.current) {
                toast.success("Banners loaded successfully")
                hasShownToast.current = true
            }
        } catch (error) {
            if (!hasShownToast.current) {
                toast.error("Failed to fetch banners")
                hasShownToast.current = true
            }
            console.error("Fetch error:", error)
        } finally {
            setFetching(false)
        }
    }

    const handleRemoveOldBanner = async (id) => {
        try {
            await axios.delete(`/api/banners?id=${id}`)
            setOldBanners(oldBanners.filter((b) => b._id !== id))
            toast.success("Banner removed")
        } catch (err) {
            console.error("DELETE error:", err)
            toast.error("Failed to remove banner")
        }
    }

    const handleSubmit = async () => {
        if (!banners.length) {
            toast.warning("No new banners selected")
            return
        }

        const formData = new FormData()
        banners.forEach((banner, i) => {
            formData.append("banners", banner.file)
            formData.append("orders", i)
        })

        setLoading(true)
        try {
            const res = await fetch("/api/banners", {
                method: "POST",
                body: formData,
            })

            if (res.ok) {
                toast.success("Banners uploaded successfully!")
                setBanners([])
                fetchBanners()
            } else {
                toast.error("Upload failed")
            }
        } catch (err) {
            console.error(err)
            toast.error("Upload failed")
        } finally {
            setLoading(false)
        }
    }

    const handleDragEnd = (event) => {
        const { active, over } = event
        if (!over || active.id === over.id) return

        const oldIndex = oldBanners.findIndex((item) => item._id === active.id)
        const newIndex = oldBanners.findIndex((item) => item._id === over.id)

        const newOrder = arrayMove(oldBanners, oldIndex, newIndex).map((item, idx) => ({
            ...item,
            order: idx + 1,
        }))

        setOldBanners(newOrder)
    }

    const handleUpdateOrder = async () => {
        try {
            const payload = oldBanners.map(({ _id, order }) => ({ _id, order }))
            await axios.patch("/api/banners", payload)
            toast.success("Order updated")
            setInitialOrder(oldBanners.map((b) => b._id))
        } catch (err) {
            console.error(err)
            toast.error("Failed to update order")
        }
    }

    const isOrderChanged = () => {
        return JSON.stringify(oldBanners.map((b) => b._id)) !== JSON.stringify(initialOrder)
    }

    return (
        <div className="min-h-screen space-y-6">
            <h2 className="text-3xl font-bold text-[#212178]">Manage Banners</h2>

            {fetching ? (
                <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <SkeletonCard key={i} />
                    ))}
                </div>
            ) : (
                <>
                    {oldBanners.length === 0 ? (
                        <p className="text-center text-gray-500 italic">No banners found. Please add new ones below.</p>
                    ) : (
                        <>
                            <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                <SortableContext
                                    items={oldBanners.map((b) => b._id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {oldBanners.map((banner, i) => (
                                            <SortableItem
                                                key={banner._id}
                                                id={banner._id}
                                                banner={banner}
                                                index={i}
                                                onRemove={handleRemoveOldBanner}
                                            />
                                        ))}
                                    </div>
                                </SortableContext>
                            </DndContext>

                            {isOrderChanged() && (
                                <button
                                    onClick={handleUpdateOrder}
                                    className="mt-3 px-6 py-2 rounded bg-[#212178] text-white"
                                >
                                    Save Order
                                </button>
                            )}
                        </>
                    )}
                </>
            )}

            {/* Upload Section */}
            <div className="border-t pt-6">
                <div className="mb-4">
                    <h2 className="text-3xl font-bold text-[#212178]">Add New Banners</h2>
                </div>

                <div className="border-2 border-dashed border-gray-300 p-6 rounded-md text-center bg-muted hover:bg-muted/50 transition">
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => {
                            const files = Array.from(e.target.files)
                            const newBanners = files.map((file) => ({
                                file,
                                preview: URL.createObjectURL(file),
                            }))
                            setBanners((prev) => [...prev, ...newBanners])
                        }}
                        className="hidden"
                        id="multi-upload"
                    />
                    <label htmlFor="multi-upload" className="cursor-pointer text-blue-600 hover:underline">
                        Drag or choose files 
                    </label>
                    <br />
                    <span className="text-sm font-normal text-gray-600">(567x1868px recommended)</span>
                    <p className="text-sm text-gray-500 mt-2">PNG, JPG, max 5MB each</p>
                </div>

                {banners.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-6">
                        {banners.map((banner, i) => (
                            <div key={i} className="relative group border rounded-lg overflow-hidden">
                                <img
                                    src={banner.preview}
                                    alt={`Preview ${i}`}
                                    className="w-full h-32 object-contain bg-white"
                                    onClick={() => setShowPreview(banner.preview)}
                                />
                                <button
                                    className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-full hover:bg-black/80"
                                    onClick={() =>
                                        setBanners(banners.filter((_, index) => index !== i))
                                    }
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {showPreview && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                        onClick={() => setShowPreview(false)}
                    >
                        <div
                            className="relative w-[80%] max-w-5xl bg-white rounded-md overflow-hidden shadow-xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                className="absolute top-2 right-2 z-10 text-white bg-black/60 hover:bg-black/80 p-1 rounded-full"
                                onClick={() => setShowPreview(false)}
                            >
                                <X className="w-5 h-5" />
                            </button>
                            <img
                                src={showPreview}
                                alt="Full Preview"
                                className="w-full h-auto object-contain"
                            />
                        </div>
                    </div>
                )}

                {banners.length > 0 && banners[0].file && (
                    <div className="pt-4">
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="flex w-45 justify-center items-center gap-2 px-6 py-2 bg-[#212178] text-white rounded"
                        >
                            <Upload />
                            {loading ? "Uploading..." : "Upload"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}