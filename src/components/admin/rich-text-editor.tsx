"use client";

import LinkExtension from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";

/** Normalize empty TipTap output so external sync does not fight the editor. */
function normalizeTipTapHtml(html: string): string {
  const s = (html ?? "").trim();
  if (!s) return "";
  if (/^<p>\s*<\/p>$/i.test(s)) return "";
  if (/^<p><br[^>]*><\/p>$/i.test(s)) return "";
  return s;
}

function RichTextToolbar({ editor, compact }: { editor: Editor; compact?: boolean }) {
  const btn =
    "rounded px-2 py-1 text-xs font-medium border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none";
  const active = "bg-slate-900 text-white border-slate-900 hover:bg-slate-800";

  const setLink = () => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = typeof window !== "undefined" ? window.prompt("Link URL", prev ?? "https://") : null;
    if (url === null) return;
    const trimmed = url.trim();
    if (trimmed === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: trimmed }).run();
  };

  return (
    <div
      className={`flex flex-wrap gap-1 border-b border-slate-100 bg-slate-50/90 px-2 py-1.5 ${compact ? "" : "sm:px-3"}`}
      role="toolbar"
      aria-label="Formatting"
    >
      <button
        type="button"
        className={`${btn} ${editor.isActive("bold") ? active : ""}`}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        B
      </button>
      <button
        type="button"
        className={`${btn} italic ${editor.isActive("italic") ? active : ""}`}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        I
      </button>
      <button
        type="button"
        className={`${btn} ${editor.isActive("underline") ? active : ""}`}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        U
      </button>
      <button
        type="button"
        className={`${btn} ${editor.isActive("strike") ? active : ""}`}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        S
      </button>
      <span className="w-px bg-slate-200 mx-0.5 self-stretch my-0.5" aria-hidden />
      <button
        type="button"
        className={`${btn} ${editor.isActive("heading", { level: 2 }) ? active : ""}`}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        H2
      </button>
      <button
        type="button"
        className={`${btn} ${editor.isActive("heading", { level: 3 }) ? active : ""}`}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        H3
      </button>
      <button
        type="button"
        className={`${btn} ${editor.isActive("bulletList") ? active : ""}`}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        •
      </button>
      <button
        type="button"
        className={`${btn} ${editor.isActive("orderedList") ? active : ""}`}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        1.
      </button>
      <button
        type="button"
        className={`${btn} ${editor.isActive("blockquote") ? active : ""}`}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        “”
      </button>
      <button
        type="button"
        className={`${btn} ${editor.isActive("codeBlock") ? active : ""}`}
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
      >
        Code
      </button>
      <button type="button" className={btn} onClick={setLink}>
        Link
      </button>
      <button
        type="button"
        className={btn}
        onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
      >
        Clear
      </button>
    </div>
  );
}

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  compact,
  "aria-labelledby": ariaLabelledby,
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  compact?: boolean;
  "aria-labelledby"?: string;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Underline,
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: "noopener noreferrer",
          class: "text-indigo-700 underline underline-offset-2",
        },
      }),
      Placeholder.configure({
        placeholder: placeholder ?? "Write…",
      }),
    ],
    content: value || "",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: `tiptap ${compact ? "focus:outline-none min-h-[72px] px-2 py-2 text-xs leading-relaxed text-slate-900 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5" : "focus:outline-none min-h-[260px] px-3 py-3 text-sm leading-relaxed text-slate-900 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6"}`,
        ...(ariaLabelledby ? { "aria-labelledby": ariaLabelledby } : {}),
      },
    },
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML());
    },
  });

  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    const incoming = normalizeTipTapHtml(value ?? "");
    const current = normalizeTipTapHtml(editor.getHTML());
    if (incoming === current) return;
    editor.commands.setContent(value || "", false);
  }, [value, editor]);

  const minH = compact ? "min-h-[72px]" : "min-h-[260px]";

  return (
    <div className="rounded-lg border border-slate-300 bg-white overflow-hidden shadow-sm">
      {editor ? <RichTextToolbar editor={editor} compact={compact} /> : null}
      <div className="border-t border-slate-100">
        {!editor ? (
          <div className={`animate-pulse bg-slate-50 ${minH}`} aria-hidden />
        ) : (
          <EditorContent editor={editor} />
        )}
      </div>
    </div>
  );
}
