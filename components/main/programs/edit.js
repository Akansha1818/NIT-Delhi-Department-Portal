"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Trash2, Pencil, Plus, FileText } from "lucide-react";
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
      scheme:
        program.scheme?.map((scheme) => ({
          ...scheme,
          // Keep existing file info, don't add new file object
          fileName: scheme.filename, // Use the original filename from DB
          pdfUrl: scheme.filepath, // Use the filepath from DB
          file: null, // No new file initially
        })) || [],
      no_of_students: program.no_of_students || { Male: "", Female: "" },
      no_of_seats: program.no_of_seats || { josaa: "", csab: "", dasa: "" },
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

  const handleFileChange = (index, file) => {
    const updatedSchemes = [...editedData.scheme];
    updatedSchemes[index].file = file;
    updatedSchemes[index].fileName = file.name;
    setEditedData((prev) => ({ ...prev, scheme: updatedSchemes }));
  };

  const addScheme = () => {
    setEditedData((prev) => ({
      ...prev,
      scheme: [
        ...(prev.scheme || []),
        { title: "", file: null, fileName: "", pdfUrl: "" },
      ],
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

      // Handle basic fields (strings)
      const basicFields = ["title", "category", "PSO", "PEO", "PO"];
      basicFields.forEach((field) => {
        if (editedData[field] !== undefined) {
          formData.append(field, editedData[field]);
        }
      });

      // Handle nested objects with bracket notation
      // Number of students
      if (editedData.no_of_students) {
        formData.append("no_of_students[Male]", editedData.no_of_students.Male);
        formData.append(
          "no_of_students[Female]",
          editedData.no_of_students.Female
        );
      }

      // Number of seats
      if (editedData.no_of_seats) {
        formData.append("no_of_seats[josaa]", editedData.no_of_seats.josaa);
        formData.append("no_of_seats[csab]", editedData.no_of_seats.csab);
        formData.append("no_of_seats[dasa]", editedData.no_of_seats.dasa);
      }

      // Handle schemes
      if (editedData.scheme && editedData.scheme.length > 0) {
        editedData.scheme.forEach((scheme, idx) => {
          // Always append the title
          formData.append(`scheme[${idx}][title]`, scheme.title || "");

          // Handle file upload
          if (scheme.file) {
            // New file uploaded
            formData.append(`scheme[${idx}][file]`, scheme.file);
          } else {
            // No new file, create empty file to maintain structure
            // The backend will handle preserving existing file info
            formData.append(`scheme[${idx}][file]`, new File([], ""));
          }
        });
      }

      const res = await axios.patch(`/api/programs?id=${editingId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) {
        toast.success("Updated successfully");
        setEditingId(null);
        setEditedData({});
        fetchPrograms();
      } else {
        toast.error("Update failed");
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Update request failed");
    } finally {
      setUpdating(false);
    }
  };

  const filteredPrograms = programs.filter((e) => {
    const matchCategory = e.category?.toLowerCase() === category?.toLowerCase();
    const matchSearch = e.title
      ?.toLowerCase()
      .includes(filters.search.toLowerCase());
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
              <Card
                key={program._id}
                className="shadow-md border border-gray-200"
              >
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
                          setEditedData({
                            ...editedData,
                            title: e.target.value,
                          })
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
                            Male
                          </label>
                          <input
                            type="number"
                            value={editedData.no_of_students.Male}
                            onChange={(e) =>
                              handleNestedChange(
                                "no_of_students",
                                "Male",
                                Number(e.target.value)
                              )
                            }
                            className="w-full p-2 border rounded"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-1 text-[#1a1830]">
                            Female
                          </label>
                          <input
                            type="number"
                            value={editedData.no_of_students.Female}
                            onChange={(e) =>
                              handleNestedChange(
                                "no_of_students",
                                "Female",
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

                    {/* Schemes with PDF Upload */}
                    <div className="space-y-3">
                      <label className="block text-sm font-semibold mb-1 text-[#1a1830]">
                        Scheme Documents
                      </label>
                      {(editedData.scheme || []).map((item, index) => (
                        <div
                          key={index}
                          className="border rounded-lg p-4 space-y-3"
                        >
                          {/* Scheme Title */}
                          <div>
                            <label className="block text-xs font-medium mb-1 text-gray-600">
                              Scheme Title
                            </label>
                            <input
                              type="text"
                              value={item.title}
                              onChange={(e) =>
                                handleSchemeChange(
                                  index,
                                  "title",
                                  e.target.value
                                )
                              }
                              placeholder="Enter scheme title"
                              className="w-full p-2 border rounded"
                              required
                            />
                          </div>

                          {/* PDF Upload */}
                          <div>
                            <label className="block text-xs font-medium mb-1 text-gray-600">
                              Upload PDF Document
                            </label>
                            <div className="flex items-center gap-3">
                              <input
                                type="file"
                                accept="application/pdf"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    handleFileChange(index, file);
                                  }
                                }}
                                className="flex-1 p-2 border rounded file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                              />

                              {/* Show current file or existing PDF */}
                              {item.file && (
                                <div className="flex items-center gap-2 text-sm text-green-600">
                                  <FileText size={16} />
                                  <span>New: {item.file.name}</span>
                                </div>
                              )}
                              {/* Show existing PDF link if no new file selected */}
                              {!item.file && item.fileName && (
                                <a
                                  href={item.pdfUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm underline"
                                >
                                  <FileText size={16} />
                                  Current: {item.fileName}
                                </a>
                              )}
                            </div>
                          </div>

                          {/* Remove Scheme Button */}
                          {editedData.scheme.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeScheme(index)}
                              className="flex items-center gap-2 text-red-600 hover:text-red-800 text-sm"
                            >
                              <Trash2 size={16} />
                              Remove Scheme
                            </button>
                          )}
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={addScheme}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
                      >
                        <Plus size={16} />
                        Add Scheme Document
                      </button>
                    </div>

                    {/* Tiptap Editors */}
                    <label className="block text-sm font-semibold mb-1 text-[#1a1830]">
                      Programme Specific Outcomes (PSO)
                    </label>
                    <TiptapEditor
                      required
                      value={editedData.PSO}
                      onChange={(val) =>
                        setEditedData({ ...editedData, PSO: val })
                      }
                    />

                    <label className="block text-sm font-semibold mb-1 text-[#1a1830]">
                      Programme Educational Objectives (PEO)
                    </label>
                    <TiptapEditor
                      required
                      value={editedData.PEO}
                      onChange={(val) =>
                        setEditedData({ ...editedData, PEO: val })
                      }
                    />

                    <label className="block text-sm font-semibold mb-1 text-[#1a1830]">
                      Programme Outcomes (PO)
                    </label>
                    <TiptapEditor
                      required
                      value={editedData.PO}
                      onChange={(val) =>
                        setEditedData({ ...editedData, PO: val })
                      }
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
