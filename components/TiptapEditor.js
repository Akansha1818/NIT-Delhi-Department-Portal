"use client";

import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import ListItem from "@tiptap/extension-list-item";

import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    Strikethrough,
    List,
    ListOrdered,
    Undo2,
    Redo2,
} from "lucide-react";

export default function TiptapEditor({ value, onChange }) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                bulletList: true,
                orderedList: true,
                listItem: false,
            }),
            BulletList,
            OrderedList,
            ListItem,
            Underline,
            TextAlign.configure({ types: ["heading", "paragraph"] }),
        ],
        content: value || "",
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        immediatelyRender: false, // ✅ Required for SSR safety
    });


    // 🔁 Sync external `value` into the editor
    useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            editor.commands.setContent(value || "");
        }
    }, [value, editor]);

    if (!editor) return null;

    return (
        <div className="border border-gray-300 rounded-md overflow-hidden">
            {/* Toolbar */}
            <div className="flex flex-wrap gap-2 p-2 border-b bg-gray-50">
                <ToolbarButton
                    icon={<Bold size={16} />}
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    active={editor.isActive("bold")}
                />
                <ToolbarButton
                    icon={<Italic size={16} />}
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    active={editor.isActive("italic")}
                />
                <ToolbarButton
                    icon={<UnderlineIcon size={16} />}
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    active={editor.isActive("underline")}
                />
                <ToolbarButton
                    icon={<Strikethrough size={16} />}
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    active={editor.isActive("strike")}
                />
                <ToolbarButton
                    icon={<List size={16} />}
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    active={editor.isActive("bulletList")}
                />
                <ToolbarButton
                    icon={<ListOrdered size={16} />}
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    active={editor.isActive("orderedList")}
                />
                <ToolbarButton
                    icon={<Undo2 size={16} />}
                    onClick={() => editor.chain().focus().undo().run()}
                />
                <ToolbarButton
                    icon={<Redo2 size={16} />}
                    onClick={() => editor.chain().focus().redo().run()}
                />
            </div>

            {/* Editor */}
            <EditorContent
                editor={editor}
                className="text-coder prose prose-sm max-w-none min-h-[160px] rich-text p-4"
                required
            />
        </div>
    );
}

function ToolbarButton({ icon, onClick, active }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`p-1 rounded hover:bg-gray-200 ${active ? "bg-gray-300" : ""}`}
        >
            {icon}
        </button>
    );
}
