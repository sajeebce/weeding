"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import { TiptapToolbar } from "@/components/page-builder/widgets/content/tiptap-toolbar";
import { cn } from "@/lib/utils";

interface FaqRichEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  charLimit?: number;
  minHeight?: number;
}

export function FaqRichEditor({
  content,
  onChange,
  placeholder = "Write your answer here...",
  charLimit = 5000,
  minHeight = 200,
}: FaqRichEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-primary underline" },
      }),
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Placeholder.configure({ placeholder }),
      CharacterCount.configure({ limit: charLimit }),
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  const charCount = editor?.storage.characterCount?.characters() ?? 0;

  return (
    <div className="rounded-lg border border-input">
      <TiptapToolbar editor={editor} preset="basic" />
      <EditorContent
        editor={editor}
        className={cn(
          "prose prose-sm max-w-none px-4 py-3",
          "prose-headings:font-semibold prose-p:my-1 prose-ul:my-1 prose-ol:my-1",
          "[&_.tiptap]:outline-none [&_.tiptap]:min-h-[var(--editor-min-h)]",
          "[&_.tiptap_p.is-editor-empty:first-child::before]:text-muted-foreground",
          "[&_.tiptap_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]",
          "[&_.tiptap_p.is-editor-empty:first-child::before]:float-left",
          "[&_.tiptap_p.is-editor-empty:first-child::before]:h-0",
          "[&_.tiptap_p.is-editor-empty:first-child::before]:pointer-events-none",
        )}
        style={{ "--editor-min-h": `${minHeight}px` } as React.CSSProperties}
      />
      <div className="flex items-center justify-between border-t px-3 py-1.5 text-xs text-muted-foreground">
        <span>
          {charCount} / {charLimit} characters
        </span>
        {charCount > charLimit * 0.9 && (
          <span className="text-amber-500">Approaching limit</span>
        )}
      </div>
    </div>
  );
}
