"use client";

import {
  PencilLine,
  Plus,
  Upload,
  Trash2,
  Calendar,
  MapPin,
  Clock,
  Image as ImageIcon,
  X,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import ImageGallery from "react-image-gallery";
import "react-image-gallery/styles/css/image-gallery.css";
import SessionLayoutWrapper from "@/components/SessionLayoutWrapper";
import { useSession } from "next-auth/react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "#000",
  boxShadow: 24,
  p: 2,
  width: "100%",
  height: "100%",
};

function AddGallery({ session }) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    eventName: "",
    eventDate: "",
    place: "",
    time: "",
  });

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFiles = (files) => {
    const imageFiles = Array.from(files).filter((file) =>
      file.type.startsWith("image/")
    );

    if (imageFiles.length !== files.length) {
      toast.error("Only image files are allowed!");
    }

    if (imageFiles.length > 0) {
      setSelectedFiles((prev) => [...prev, ...imageFiles]);
      toast.success(`${imageFiles.length} image${imageFiles.length > 1 ? 's' : ''} selected`);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const removeSelectedFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    toast.success("Image removed from selection");
  };

  const uploadImages = async () => {
    if (!session) {
      toast.error("You must be logged in to upload images!");
      return;
    }

    if (selectedFiles.length === 0) {
      toast.error("Please select images to upload");
      return;
    }

    if (!formData.eventName || !formData.eventDate) {
      toast.error("Please fill in event name and date");
      return;
    }

    setUploading(true);
    const uploadPromise = new Promise(async (resolve, reject) => {
      try {
        const uploadPromises = selectedFiles.map((file) => {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async (e) => {
              try {
                const fileBase64 = e.target.result;
                const newImage = {
                  url: fileBase64,
                  name: file.name,
                  size: (file.size / (1024 * 1024)).toFixed(2) + " MB",
                  ...formData,
                  user: session.user.email,
                };

                const res = await fetch("/api/gallery", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(newImage),
                });

                if (!res.ok) throw new Error("Upload failed");
                const saved = await res.json();
                resolve(saved);
              } catch (error) {
                reject(error);
              }
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        });

        await Promise.all(uploadPromises);
        setSelectedFiles([]);
        setFormData({ eventName: "", eventDate: "", place: "", time: "" });
        resolve();
      } catch (error) {
        console.error("Upload error:", error);
        reject(error);
      } finally {
        setUploading(false);
      }
    });

    toast.promise(uploadPromise, {
      loading: "Uploading images...",
      success: `${selectedFiles.length} image${selectedFiles.length > 1 ? "s" : ""} uploaded successfully!`,
      error: "Upload failed",
    });
  };

  return (
    <div className="space-y-6">
      {!session ? (
        <div className="text-center py-12">
          <p className="text-red-500 text-lg font-medium">
            Please log in to add images.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Name *
              </label>
              <input
                type="text"
                placeholder="Enter event name"
                value={formData.eventName}
                onChange={(e) =>
                  setFormData({ ...formData, eventName: e.target.value })
                }
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-[#212178] focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Date *
              </label>
              <input
                type="date"
                value={formData.eventDate}
                onChange={(e) =>
                  setFormData({ ...formData, eventDate: e.target.value })
                }
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-[#212178] focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Place
              </label>
              <input
                type="text"
                placeholder="Enter location"
                value={formData.place}
                onChange={(e) =>
                  setFormData({ ...formData, place: e.target.value })
                }
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-[#212178] focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time
              </label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) =>
                  setFormData({ ...formData, time: e.target.value })
                }
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-[#212178] focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Drag & Drop Upload */}
          <div
            className={`relative border-2 border-dashed rounded-md p-8 text-center transition-all ${
              dragActive
                ? "border-[#212178] bg-purple-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-700 mb-2">
              Drop your images here, or click to browse <span className="text-sm font-normal text-gray-600">(1920x1080px recommended)</span>
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Supports: JPG, JPEG, PNG, GIF (Max 10MB each)
            </p>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-[#212178] text-white px-6 py-2 rounded-md hover:bg-[#212178]/90 transition-colors font-medium"
            >
              Browse Files
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>

          {/* Preview Selected Images */}
          {selectedFiles.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Selected Images ({selectedFiles.length})
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square bg-gray-100 rounded-md overflow-hidden">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      onClick={() => removeSelectedFile(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <p className="text-xs text-gray-500 mt-1 truncate">
                      {file.name}
                    </p>
                  </div>
                ))}
              </div>

              <button
                onClick={uploadImages}
                disabled={uploading}
                className="bg-green-600 text-white px-8 py-2 rounded-md hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading
                  ? "Uploading..."
                  : `Upload ${selectedFiles.length} Image${
                      selectedFiles.length > 1 ? "s" : ""
                    }`}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function SortableGalleryItem({ id, img, index, onRemove, onView, session }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="group bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg hover:border-purple-300 transition-all duration-300"
    >
      <div className="flex flex-row items-center justify-between p-2">
        <Tooltip>
          <TooltipTrigger>
            <div
              {...listeners}
              className="cursor-grab text-gray-400 hover:text-gray-600"
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

        {session && (
          <Tooltip>
            <TooltipTrigger>
              <button
                onClick={() => onRemove(img._id)}
                className="bg-red-100 hover:bg-red-200 rounded-full p-1 cursor-pointer"
              >
                <Trash2 size={16} className="text-red-600" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Delete this image</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      <div className="aspect-video bg-gray-100 overflow-hidden relative">
        <img
          src={img.url}
          alt={img.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
          <div
            className="bg-[#212178] text-white px-4 py-2 rounded-full font-medium shadow-lg cursor-pointer hover:bg-[#212178] transition-colors"
            onClick={() => onView(index)}
          >
            View Image
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-3 text-lg">
          {img.eventName}
        </h3>

        <div className="space-y-2 mb-4">
          {img.eventDate && (
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="w-4 h-4 mr-2 text-[#212178]" />
              {img.eventDate}
            </div>
          )}
          {img.place && (
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="w-4 h-4 mr-2 text-green-500" />
              {img.place}
            </div>
          )}
          {img.time && (
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="w-4 h-4 mr-2 text-orange-500" />
              {img.time}
            </div>
          )}
        </div>

        {!session && (
          <div className="w-full bg-gray-50 text-gray-500 px-4 py-2 rounded-md flex items-center justify-center text-sm">
            Login required to manage images
          </div>
        )}
      </div>
    </div>
  );
}
function EditGallery({ session }) {
  const [gallery, setGallery] = useState([]);
  const [initialOrder, setInitialOrder] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [startIndex, setStartIndex] = useState(0);
  const hasShownToast = useRef(false);

  const fetchGallery = async () => {
    setLoading(true);
    try {
      if (!session) {
        return;
      }

      const res = await fetch("/api/gallery");
      if (!res.ok) throw new Error("Failed to fetch gallery");
      
      const data = await res.json();
      
      const sortedData = data
        .map((item) => ({
          ...item,
          order: item.order || 0,
        }))
        .sort((a, b) => a.order - b.order);
      
      setGallery(sortedData);
      setInitialOrder(sortedData.map((item) => item._id));
      
      if (!hasShownToast.current) {
        toast.success("Gallery loaded successfully!");
        hasShownToast.current = true;
      }
    } catch (error) {
      console.error("Fetch error:", error);
      if (!hasShownToast.current) {
        toast.error("Failed to load gallery");
        hasShownToast.current = true;
      }
    } finally {
      if (session) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (session) {
      setLoading(false);
    } else {
      setLoading(true);
    }
  }, [session]);

  useEffect(() => {
    fetchGallery();
  }, [session]);

  const deleteImage = async (id) => {
    if (!session) {
      toast.error("You must be logged in to delete images!");
      return;
    }

    if (!confirm("Are you sure you want to delete this image?")) return;

    const deletePromise = new Promise(async (resolve, reject) => {
      try {
        const res = await fetch(`/api/gallery/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Delete failed");
        
        setGallery((prev) => prev.filter((img) => img._id !== id));
        resolve();
      } catch (error) {
        console.error("Delete error:", error);
        reject(error);
      }
    });

    toast.promise(deletePromise, {
      loading: "Deleting image...",
      success: "Image deleted successfully!",
      error: "Failed to delete image",
    });
  };

  const handleDragEnd = (event) => {
    if (!session) {
      toast.error("You must be logged in to reorder images!");
      return;
    }

    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = gallery.findIndex((item) => item._id === active.id);
    const newIndex = gallery.findIndex((item) => item._id === over.id);

    const newOrder = arrayMove(gallery, oldIndex, newIndex).map((item, idx) => ({
      ...item,
      order: idx + 1,
    }));

    setGallery(newOrder);
  };

  const handleUpdateOrder = async () => {
    if (!session) {
      toast.error("You must be logged in to update order!");
      return;
    }

    try {
      const payload = gallery.map(({ _id, order }) => ({ _id, order }));
      const res = await fetch("/api/gallery/reorder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to update order");
      
      toast.success("Order updated successfully!");
      setInitialOrder(gallery.map((item) => item._id));
    } catch (err) {
      console.error(err);
      toast.error("Failed to update order");
    }
  };

  const isOrderChanged = () => {
    return JSON.stringify(gallery.map((item) => item._id)) !== JSON.stringify(initialOrder);
  };

  function SkeletonCard() {
    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden animate-pulse">
        {/* Image placeholder */}
        <div className="aspect-video bg-gray-300"></div>
        
        {/* Content area */}
        <div className="p-4 space-y-3">
          {/* Event name placeholder */}
          <div className="h-6 bg-gray-300 rounded w-3/4"></div>
          
          {/* Event details placeholders */}
          <div className="space-y-2">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-gray-300 rounded mr-2"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-gray-300 rounded mr-2"></div>
              <div className="h-4 bg-gray-300 rounded w-2/3"></div>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-gray-300 rounded mr-2"></div>
              <div className="h-4 bg-gray-300 rounded w-1/3"></div>
            </div>
          </div>
          
          {/* Delete button placeholder */}
          <div className="h-10 bg-gray-300 rounded-md w-full"></div>
        </div>
      </div>
    );
  }

  const handleOpen = (index) => {
    setStartIndex(index);
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const images = gallery.map((item) => ({
    original: item.url,
    thumbnail: item.url,
    description: `${item.eventDate} | ${item.place}`,
  }));

  return (
    <div className="space-y-6">
      {(!session || loading) ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : gallery.length === 0 ? (
        <div className="text-center py-12">
          <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No images uploaded yet</p>
          <p className="text-sm text-gray-400 mt-2">
            Switch to "Add Images" tab to upload your first images
          </p>
        </div>
      ) : (
        <>
          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext
              items={gallery.map((item) => item._id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {gallery.map((img, index) => (
                  <SortableGalleryItem
                    key={img._id}
                    id={img._id}
                    img={img}
                    index={index}
                    onRemove={deleteImage}
                    onView={handleOpen}
                    session={session}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {session && isOrderChanged() && (
            <button
              onClick={handleUpdateOrder}
              className="mt-4 px-6 py-2 rounded bg-[#212178] text-white hover:bg-[#212178] transition-colors font-medium"
            >
              Save Order
            </button>
          )}

          <Modal open={open} onClose={handleClose}>
            <Box sx={modalStyle}>
              <IconButton
                sx={{
                  position: "absolute",
                  top: 10,
                  right: 10,
                  color: "#fff",
                  zIndex: 10,
                }}
                onClick={handleClose}
              >
                <CloseIcon />
              </IconButton>
              <ImageGallery
                items={images}
                startIndex={startIndex}
                showThumbnails={true}
                showFullscreenButton={false}
                showPlayButton={false}
              />
            </Box>
          </Modal>
        </>
      )}
    </div>
  );
}

export default function GalleryPage() {
  const [mode, setMode] = useState("edit");
  const { data: session } = useSession();

  useEffect(() => {
    if (!session && mode === "add") {
      setMode("edit");
    }
  }, [session, mode]);

  const renderContent = () => {
    if (mode === "add") return <AddGallery session={session} />;
    if (mode === "edit") return <EditGallery session={session} />;
  };

  return (
    <SessionLayoutWrapper session={session}>
      <div className="min-h-screen p-6">
        <div className="mx-auto space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h1 className="text-3xl font-bold text-[#212178] tracking-tight">
              Gallery Manager
            </h1>
            <div className="flex gap-2">
              <button
                onClick={() => setMode("edit")}
                className={`flex items-center gap-1 px-4 py-2 rounded-md text-sm font-medium transition ${
                  mode === "edit"
                    ? "bg-[#212178] text-white"
                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <PencilLine size={16} /> View & Edit
              </button>
              <button
                onClick={() => {
                  if (!session) {
                    toast.error("Please log in to add images!");
                    return;
                  }
                  setMode("add");
                }}
                className={`flex items-center gap-1 px-4 py-2 rounded-md text-sm font-medium transition ${
                  mode === "add"
                    ? "bg-[#212178] text-white"
                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                } ${!session ? "opacity-60 cursor-not-allowed" : ""}`}
                disabled={!session}
              >
                <Plus size={16} /> Add Images
              </button>
            </div>
          </div>

          <div className="h-px w-full bg-gray-300" />

          <div className="bg-white rounded-md border border-gray-200 p-6">
            {renderContent()}
          </div>
        </div>
      </div>
    </SessionLayoutWrapper>
  );
}