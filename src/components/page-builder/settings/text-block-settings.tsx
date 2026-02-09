"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { TextStyle } from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import CharacterCount from "@tiptap/extension-character-count";
import type {
  TextBlockWidgetSettings,
  TextBlockToolbarPreset,
} from "@/lib/page-builder/types";
import { DEFAULT_TEXT_BLOCK_SETTINGS } from "@/lib/page-builder/defaults";
import {
  SelectInput,
  NumberInput,
  ColorInput,
  TextInput,
  ToggleSwitch,
} from "@/app/admin/appearance/landing-page/components/ui/form-controls";
import { AccordionSection } from "@/app/admin/appearance/landing-page/components/ui/accordion-section";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
// Note: Button was removed as it's not used currently
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Link as LinkIcon,
  Quote,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Heading1,
  Heading2,
  Heading3,
  Undo,
  Redo,
  RemoveFormatting,
  Type,
} from "lucide-react";

interface TextBlockWidgetSettingsPanelProps {
  settings: Partial<TextBlockWidgetSettings>;
  onChange: (settings: TextBlockWidgetSettings) => void;
  activeTab: "content" | "style" | "advanced";
}

// Deep merge helper
function deepMerge<T>(target: T, source: Partial<T>): T {
  const result = { ...target } as T;
  for (const key in source) {
    const sourceValue = source[key];
    const targetValue = (target as Record<string, unknown>)[key];
    if (
      sourceValue &&
      typeof sourceValue === "object" &&
      !Array.isArray(sourceValue)
    ) {
      (result as Record<string, unknown>)[key] = deepMerge(
        (targetValue || {}) as Record<string, unknown>,
        sourceValue as Record<string, unknown>
      );
    } else if (sourceValue !== undefined) {
      (result as Record<string, unknown>)[key] = sourceValue;
    }
  }
  return result;
}

// Toolbar button component
function ToolbarButton({
  onClick,
  isActive = false,
  disabled = false,
  children,
  title,
}: {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "p-1.5 rounded transition-colors",
        isActive
          ? "bg-orange-500/30 text-orange-400"
          : "text-slate-400 hover:text-white hover:bg-slate-700",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      {children}
    </button>
  );
}

// Separate Tiptap Editor Component to isolate editor state
function TiptapEditorWrapper({
  content,
  onContentChange,
  toolbar,
  minHeight,
  maxHeight,
  charLimit,
}: {
  content: string;
  onContentChange: (html: string) => void;
  toolbar: TextBlockToolbarPreset;
  minHeight: number;
  maxHeight: number;
  charLimit?: number;
}) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-400 underline",
        },
      }),
      TextStyle,
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      CharacterCount.configure({
        limit: charLimit || undefined,
      }),
    ],
    content: content,
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm max-w-none focus:outline-none p-4",
          "prose-headings:text-slate-900 prose-p:text-slate-700",
          "prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline",
          "prose-blockquote:border-orange-500 prose-blockquote:text-slate-600",
          "prose-ul:text-slate-700 prose-ol:text-slate-700"
        ),
        style: `min-height: ${minHeight}px; max-height: ${maxHeight}px; overflow-y: auto; background-color: white;`,
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onContentChange(html);
    },
    immediatelyRender: false, // Prevent SSR issues
  });

  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Enter URL", previousUrl || "https://");

    if (url === null) return;

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  if (!isMounted) {
    return (
      <div className="rounded-lg border border-slate-700 overflow-hidden bg-slate-900">
        <div className="p-4 text-slate-500 text-sm flex items-center gap-2">
          <Type className="h-4 w-4" />
          Loading editor...
        </div>
      </div>
    );
  }

  if (!editor) {
    return (
      <div className="rounded-lg border border-slate-700 overflow-hidden bg-slate-900">
        <div className="p-4 text-slate-500 text-sm flex items-center gap-2">
          <Type className="h-4 w-4" />
          Initializing editor...
        </div>
      </div>
    );
  }

  // Render toolbar based on preset
  const renderToolbar = () => {
    // Minimal toolbar
    if (toolbar === "minimal") {
      return (
        <div className="flex items-center gap-1 p-2 border-b border-slate-700 bg-slate-800/50">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive("bold")}
            title="Bold"
          >
            <Bold className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive("italic")}
            title="Italic"
          >
            <Italic className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={setLink} isActive={editor.isActive("link")} title="Link">
            <LinkIcon className="h-4 w-4" />
          </ToolbarButton>
        </div>
      );
    }

    // Basic toolbar
    if (toolbar === "basic") {
      return (
        <div className="flex items-center gap-1 p-2 border-b border-slate-700 bg-slate-800/50 flex-wrap">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive("bold")}
            title="Bold"
          >
            <Bold className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive("italic")}
            title="Italic"
          >
            <Italic className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive("underline")}
            title="Underline"
          >
            <UnderlineIcon className="h-4 w-4" />
          </ToolbarButton>
          <div className="w-px h-5 bg-slate-700 mx-1" />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive("bulletList")}
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive("orderedList")}
            title="Ordered List"
          >
            <ListOrdered className="h-4 w-4" />
          </ToolbarButton>
          <div className="w-px h-5 bg-slate-700 mx-1" />
          <ToolbarButton onClick={setLink} isActive={editor.isActive("link")} title="Link">
            <LinkIcon className="h-4 w-4" />
          </ToolbarButton>
        </div>
      );
    }

    // Full toolbar
    if (toolbar === "full") {
      return (
        <div className="flex items-center gap-1 p-2 border-b border-slate-700 bg-slate-800/50 flex-wrap">
          {/* Undo/Redo */}
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Undo"
          >
            <Undo className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Redo"
          >
            <Redo className="h-4 w-4" />
          </ToolbarButton>
          <div className="w-px h-5 bg-slate-700 mx-1" />

          {/* Headings */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            isActive={editor.isActive("heading", { level: 1 })}
            title="Heading 1"
          >
            <Heading1 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor.isActive("heading", { level: 2 })}
            title="Heading 2"
          >
            <Heading2 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            isActive={editor.isActive("heading", { level: 3 })}
            title="Heading 3"
          >
            <Heading3 className="h-4 w-4" />
          </ToolbarButton>
          <div className="w-px h-5 bg-slate-700 mx-1" />

          {/* Text Formatting */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive("bold")}
            title="Bold"
          >
            <Bold className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive("italic")}
            title="Italic"
          >
            <Italic className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive("underline")}
            title="Underline"
          >
            <UnderlineIcon className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive("strike")}
            title="Strikethrough"
          >
            <Strikethrough className="h-4 w-4" />
          </ToolbarButton>
          <div className="w-px h-5 bg-slate-700 mx-1" />

          {/* Alignment */}
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            isActive={editor.isActive({ textAlign: "left" })}
            title="Align Left"
          >
            <AlignLeft className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            isActive={editor.isActive({ textAlign: "center" })}
            title="Align Center"
          >
            <AlignCenter className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            isActive={editor.isActive({ textAlign: "right" })}
            title="Align Right"
          >
            <AlignRight className="h-4 w-4" />
          </ToolbarButton>
          <div className="w-px h-5 bg-slate-700 mx-1" />

          {/* Lists */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive("bulletList")}
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive("orderedList")}
            title="Ordered List"
          >
            <ListOrdered className="h-4 w-4" />
          </ToolbarButton>
          <div className="w-px h-5 bg-slate-700 mx-1" />

          {/* Block Elements */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive("blockquote")}
            title="Blockquote"
          >
            <Quote className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={setLink} isActive={editor.isActive("link")} title="Link">
            <LinkIcon className="h-4 w-4" />
          </ToolbarButton>
          <div className="w-px h-5 bg-slate-700 mx-1" />

          {/* Clear Formatting */}
          <ToolbarButton
            onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
            title="Clear Formatting"
          >
            <RemoveFormatting className="h-4 w-4" />
          </ToolbarButton>
        </div>
      );
    }

    // Standard toolbar (default)
    return (
      <div className="flex items-center gap-1 p-2 border-b border-slate-700 bg-slate-800/50 flex-wrap">
        {/* Headings */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive("heading", { level: 2 })}
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive("heading", { level: 3 })}
          title="Heading 3"
        >
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>
        <div className="w-px h-5 bg-slate-700 mx-1" />

        {/* Text Formatting */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive("underline")}
          title="Underline"
        >
          <UnderlineIcon className="h-4 w-4" />
        </ToolbarButton>
        <div className="w-px h-5 bg-slate-700 mx-1" />

        {/* Lists */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive("bulletList")}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive("orderedList")}
          title="Ordered List"
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
        <div className="w-px h-5 bg-slate-700 mx-1" />

        {/* Block Elements */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive("blockquote")}
          title="Blockquote"
        >
          <Quote className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={setLink} isActive={editor.isActive("link")} title="Link">
          <LinkIcon className="h-4 w-4" />
        </ToolbarButton>
      </div>
    );
  };

  return (
    <div className="rounded-lg border border-slate-700 overflow-hidden bg-slate-900">
      {renderToolbar()}
      <EditorContent editor={editor} />
      {charLimit && (
        <div className="p-2 border-t border-slate-700 text-xs text-slate-500">
          {editor.storage.characterCount?.characters()} / {charLimit} characters
        </div>
      )}
    </div>
  );
}

export function TextBlockWidgetSettingsPanel({
  settings: partialSettings,
  onChange,
  activeTab,
}: TextBlockWidgetSettingsPanelProps) {
  // Deep merge with defaults
  const settings: TextBlockWidgetSettings = useMemo(
    () => deepMerge(DEFAULT_TEXT_BLOCK_SETTINGS, partialSettings as Partial<TextBlockWidgetSettings>),
    [partialSettings]
  );

  // Update nested properties helpers
  const updateEditor = useCallback(
    <K extends keyof TextBlockWidgetSettings["editor"]>(
      key: K,
      value: TextBlockWidgetSettings["editor"][K]
    ) => {
      onChange({
        ...settings,
        editor: { ...settings.editor, [key]: value },
      });
    },
    [onChange, settings]
  );

  const updateTypography = useCallback(
    <K extends keyof TextBlockWidgetSettings["typography"]>(
      key: K,
      value: TextBlockWidgetSettings["typography"][K]
    ) => {
      onChange({
        ...settings,
        typography: { ...settings.typography, [key]: value },
      });
    },
    [onChange, settings]
  );

  const updateContainer = useCallback(
    <K extends keyof TextBlockWidgetSettings["container"]>(
      key: K,
      value: TextBlockWidgetSettings["container"][K]
    ) => {
      onChange({
        ...settings,
        container: { ...settings.container, [key]: value },
      });
    },
    [onChange, settings]
  );

  const updateLists = useCallback(
    <K extends keyof TextBlockWidgetSettings["lists"]>(
      key: K,
      value: TextBlockWidgetSettings["lists"][K]
    ) => {
      onChange({
        ...settings,
        lists: { ...settings.lists, [key]: value },
      });
    },
    [onChange, settings]
  );

  const updateBlockquote = useCallback(
    <K extends keyof TextBlockWidgetSettings["blockquote"]>(
      key: K,
      value: TextBlockWidgetSettings["blockquote"][K]
    ) => {
      onChange({
        ...settings,
        blockquote: { ...settings.blockquote, [key]: value },
      });
    },
    [onChange, settings]
  );

  const updateDropCap = useCallback(
    <K extends keyof TextBlockWidgetSettings["dropCap"]>(
      key: K,
      value: TextBlockWidgetSettings["dropCap"][K]
    ) => {
      onChange({
        ...settings,
        dropCap: { ...settings.dropCap, [key]: value },
      });
    },
    [onChange, settings]
  );

  const updateColumns = useCallback(
    <K extends keyof NonNullable<TextBlockWidgetSettings["columns"]>>(
      key: K,
      value: NonNullable<TextBlockWidgetSettings["columns"]>[K]
    ) => {
      onChange({
        ...settings,
        columns: { ...settings.columns, [key]: value } as TextBlockWidgetSettings["columns"],
      });
    },
    [onChange, settings]
  );

  const updateAnimation = useCallback(
    <K extends keyof NonNullable<TextBlockWidgetSettings["animation"]>["entrance"]>(
      key: K,
      value: NonNullable<TextBlockWidgetSettings["animation"]>["entrance"][K]
    ) => {
      onChange({
        ...settings,
        animation: {
          ...settings.animation,
          entrance: {
            ...settings.animation?.entrance,
            [key]: value,
          } as NonNullable<TextBlockWidgetSettings["animation"]>["entrance"],
        },
      });
    },
    [onChange, settings]
  );

  const updateAdvanced = useCallback(
    <K extends keyof NonNullable<TextBlockWidgetSettings["advanced"]>>(
      key: K,
      value: NonNullable<TextBlockWidgetSettings["advanced"]>[K]
    ) => {
      onChange({
        ...settings,
        advanced: { ...settings.advanced, [key]: value } as TextBlockWidgetSettings["advanced"],
      });
    },
    [onChange, settings]
  );

  const handleContentChange = useCallback(
    (html: string) => {
      if (html !== settings.content) {
        onChange({ ...settings, content: html });
      }
    },
    [onChange, settings]
  );

  // Content Tab - Tiptap Editor
  if (activeTab === "content") {
    return (
      <div className="space-y-4">
        {/* Toolbar Preset */}
        <SelectInput
          label="Toolbar Style"
          value={settings.editor.toolbar}
          onChange={(v) => updateEditor("toolbar", v as TextBlockToolbarPreset)}
          options={[
            { value: "minimal", label: "Minimal (Bold, Italic, Link)" },
            { value: "basic", label: "Basic (Formatting + Lists)" },
            { value: "standard", label: "Standard (Recommended)" },
            { value: "full", label: "Full (All Features)" },
          ]}
        />

        {/* Tiptap Editor */}
        <div className="space-y-2">
          <Label className="text-xs text-slate-400">Content</Label>
          <TiptapEditorWrapper
            content={settings.content}
            onContentChange={handleContentChange}
            toolbar={settings.editor.toolbar}
            minHeight={settings.editor.minHeight}
            maxHeight={settings.editor.maxHeight || 400}
            charLimit={settings.editor.charLimit}
          />
        </div>

        {/* Editor Settings */}
        <AccordionSection title="Editor Options" defaultOpen={false}>
          <div className="space-y-3">
            <NumberInput
              label="Min Height"
              value={settings.editor.minHeight}
              onChange={(v) => updateEditor("minHeight", v)}
              min={100}
              max={600}
              step={50}
              unit="px"
            />
            <NumberInput
              label="Max Height"
              value={settings.editor.maxHeight || 400}
              onChange={(v) => updateEditor("maxHeight", v)}
              min={200}
              max={1000}
              step={50}
              unit="px"
            />
            <NumberInput
              label="Character Limit"
              value={settings.editor.charLimit || 0}
              onChange={(v) => updateEditor("charLimit", v > 0 ? v : undefined)}
              min={0}
              max={10000}
              step={100}
              description="0 = no limit"
            />
            <TextInput
              label="Placeholder"
              value={settings.editor.placeholder || ""}
              onChange={(v) => updateEditor("placeholder", v || undefined)}
              placeholder="Start writing..."
            />
          </div>
        </AccordionSection>
      </div>
    );
  }

  // Style Tab
  if (activeTab === "style") {
    return (
      <div className="space-y-4">
        {/* Typography */}
        <AccordionSection title="Typography" defaultOpen>
          <div className="space-y-3">
            <TextInput
              label="Font Family"
              value={settings.typography.fontFamily || ""}
              onChange={(v) => updateTypography("fontFamily", v || undefined)}
              placeholder="Inter, system-ui, sans-serif"
              description="Leave empty to inherit from theme"
            />
            <div className="grid grid-cols-2 gap-3">
              <NumberInput
                label="Font Size"
                value={settings.typography.fontSize}
                onChange={(v) => updateTypography("fontSize", v)}
                min={12}
                max={32}
                step={1}
                unit="px"
              />
              <NumberInput
                label="Line Height"
                value={settings.typography.lineHeight}
                onChange={(v) => updateTypography("lineHeight", v)}
                min={1}
                max={3}
                step={0.1}
              />
            </div>
            <NumberInput
              label="Letter Spacing"
              value={settings.typography.letterSpacing || 0}
              onChange={(v) => updateTypography("letterSpacing", v || undefined)}
              min={-2}
              max={10}
              step={0.5}
              unit="px"
            />
            <ColorInput
              label="Text Color"
              value={settings.typography.color}
              onChange={(v) => updateTypography("color", v)}
            />
          </div>
        </AccordionSection>

        {/* Link Styling */}
        <AccordionSection title="Links">
          <div className="space-y-3">
            <ColorInput
              label="Link Color"
              value={settings.typography.linkColor}
              onChange={(v) => updateTypography("linkColor", v)}
            />
            <ColorInput
              label="Link Hover Color"
              value={settings.typography.linkHoverColor}
              onChange={(v) => updateTypography("linkHoverColor", v)}
            />
            <ToggleSwitch
              label="Show Underline"
              checked={settings.typography.linkUnderline}
              onChange={(v: boolean) => updateTypography("linkUnderline", v)}
            />
          </div>
        </AccordionSection>

        {/* Container */}
        <AccordionSection title="Container">
          <div className="space-y-3">
            {/* Background Type */}
            <SelectInput
              label="Background Type"
              value={settings.container.backgroundType || "solid"}
              onChange={(v) => {
                const newType = v as "solid" | "gradient";
                onChange({
                  ...settings,
                  container: {
                    ...settings.container,
                    backgroundType: newType,
                    // Initialize gradient background defaults when switching to gradient
                    ...(newType === "gradient" && !settings.container.gradientBackground
                      ? {
                          gradientBackground: {
                            colors: ["#1e1b4b", "#0f172a"],
                            angle: 135,
                          },
                        }
                      : {}),
                  },
                });
              }}
              options={[
                { value: "solid", label: "Solid" },
                { value: "gradient", label: "Gradient" },
              ]}
            />
            {/* Solid background color */}
            {(settings.container.backgroundType || "solid") === "solid" && (
              <ColorInput
                label="Background Color"
                value={settings.container.backgroundColor || "transparent"}
                onChange={(v) =>
                  updateContainer("backgroundColor", v === "transparent" ? undefined : v)
                }
              />
            )}
            {/* Gradient background colors */}
            {settings.container.backgroundType === "gradient" && (
              <>
                <div className="space-y-2">
                  <Label className="text-xs text-slate-400">Gradient Colors</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <ColorInput
                      label="From"
                      value={settings.container.gradientBackground?.colors?.[0] || "#1e1b4b"}
                      onChange={(v) =>
                        onChange({
                          ...settings,
                          container: {
                            ...settings.container,
                            gradientBackground: {
                              colors: [v, settings.container.gradientBackground?.colors?.[1] || "#0f172a"],
                              angle: settings.container.gradientBackground?.angle || 135,
                            },
                          },
                        })
                      }
                    />
                    <ColorInput
                      label="To"
                      value={settings.container.gradientBackground?.colors?.[1] || "#0f172a"}
                      onChange={(v) =>
                        onChange({
                          ...settings,
                          container: {
                            ...settings.container,
                            gradientBackground: {
                              colors: [settings.container.gradientBackground?.colors?.[0] || "#1e1b4b", v],
                              angle: settings.container.gradientBackground?.angle || 135,
                            },
                          },
                        })
                      }
                    />
                  </div>
                </div>
                <NumberInput
                  label="Gradient Angle"
                  value={settings.container.gradientBackground?.angle || 135}
                  onChange={(v) =>
                    onChange({
                      ...settings,
                      container: {
                        ...settings.container,
                        gradientBackground: {
                          colors: settings.container.gradientBackground?.colors || ["#1e1b4b", "#0f172a"],
                          angle: v,
                        },
                      },
                    })
                  }
                  min={0}
                  max={360}
                  step={15}
                  unit="deg"
                />
              </>
            )}
            <NumberInput
              label="Padding"
              value={settings.container.padding}
              onChange={(v) => updateContainer("padding", v)}
              min={0}
              max={64}
              step={4}
              unit="px"
            />
            <NumberInput
              label="Border Radius"
              value={settings.container.borderRadius}
              onChange={(v) => updateContainer("borderRadius", v)}
              min={0}
              max={32}
              step={2}
              unit="px"
            />
            {/* Gradient Border */}
            <ToggleSwitch
              label="Gradient Border"
              checked={settings.container.gradientBorder?.enabled || false}
              onChange={(v: boolean) =>
                onChange({
                  ...settings,
                  container: {
                    ...settings.container,
                    gradientBorder: {
                      enabled: v,
                      colors: settings.container.gradientBorder?.colors || ["#f97316", "#8b5cf6"],
                      angle: settings.container.gradientBorder?.angle || 135,
                    },
                    // Initialize border width when enabling, clear border when disabling
                    ...(v && !settings.container.border
                      ? {
                          border: {
                            width: 2,
                            color: "#f97316",
                            style: "solid" as const,
                          },
                        }
                      : !v
                        ? { border: undefined }
                        : {}),
                  },
                })
              }
            />
            {settings.container.gradientBorder?.enabled && (
              <>
                <div className="space-y-2">
                  <Label className="text-xs text-slate-400">Border Gradient Colors</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <ColorInput
                      label="From"
                      value={settings.container.gradientBorder?.colors?.[0] || "#f97316"}
                      onChange={(v) =>
                        onChange({
                          ...settings,
                          container: {
                            ...settings.container,
                            gradientBorder: {
                              enabled: true,
                              colors: [v, settings.container.gradientBorder?.colors?.[1] || "#8b5cf6"],
                              angle: settings.container.gradientBorder?.angle || 135,
                            },
                          },
                        })
                      }
                    />
                    <ColorInput
                      label="To"
                      value={settings.container.gradientBorder?.colors?.[1] || "#8b5cf6"}
                      onChange={(v) =>
                        onChange({
                          ...settings,
                          container: {
                            ...settings.container,
                            gradientBorder: {
                              enabled: true,
                              colors: [settings.container.gradientBorder?.colors?.[0] || "#f97316", v],
                              angle: settings.container.gradientBorder?.angle || 135,
                            },
                          },
                        })
                      }
                    />
                  </div>
                </div>
                <NumberInput
                  label="Border Gradient Angle"
                  value={settings.container.gradientBorder?.angle || 135}
                  onChange={(v) =>
                    onChange({
                      ...settings,
                      container: {
                        ...settings.container,
                        gradientBorder: {
                          enabled: true,
                          colors: settings.container.gradientBorder?.colors || ["#f97316", "#8b5cf6"],
                          angle: v,
                        },
                      },
                    })
                  }
                  min={0}
                  max={360}
                  step={15}
                  unit="deg"
                />
                <NumberInput
                  label="Border Width"
                  value={settings.container.border?.width || 2}
                  onChange={(v) =>
                    onChange({
                      ...settings,
                      container: {
                        ...settings.container,
                        border: {
                          width: v,
                          color: settings.container.border?.color || "#f97316",
                          style: settings.container.border?.style || "solid",
                        },
                      },
                    })
                  }
                  min={1}
                  max={6}
                  step={1}
                  unit="px"
                />
              </>
            )}
            <SelectInput
              label="Shadow"
              value={settings.container.shadow || "none"}
              onChange={(v) =>
                updateContainer("shadow", v as "none" | "sm" | "md" | "lg")
              }
              options={[
                { value: "none", label: "None" },
                { value: "sm", label: "Small" },
                { value: "md", label: "Medium" },
                { value: "lg", label: "Large" },
              ]}
            />
            <NumberInput
              label="Max Width"
              value={settings.container.maxWidth || 0}
              onChange={(v) => updateContainer("maxWidth", v > 0 ? v : undefined)}
              min={0}
              max={1400}
              step={50}
              unit="px"
              description="0 = full width"
            />
          </div>
        </AccordionSection>

        {/* Paragraph */}
        <AccordionSection title="Paragraphs">
          <NumberInput
            label="Paragraph Spacing"
            value={settings.paragraphSpacing}
            onChange={(v) => onChange({ ...settings, paragraphSpacing: v })}
            min={0}
            max={48}
            step={4}
            unit="px"
          />
        </AccordionSection>

        {/* Lists */}
        <AccordionSection title="Lists">
          <div className="space-y-3">
            <SelectInput
              label="Bullet Style"
              value={settings.lists.bulletStyle}
              onChange={(v) =>
                updateLists("bulletStyle", v as "disc" | "circle" | "square" | "none")
              }
              options={[
                { value: "disc", label: "Disc" },
                { value: "circle", label: "Circle" },
                { value: "square", label: "Square" },
                { value: "none", label: "None" },
              ]}
            />
            <ColorInput
              label="Bullet Color"
              value={settings.lists.bulletColor || settings.typography.color}
              onChange={(v) => updateLists("bulletColor", v)}
            />
            <SelectInput
              label="Number Style"
              value={settings.lists.numberStyle}
              onChange={(v) =>
                updateLists(
                  "numberStyle",
                  v as
                    | "decimal"
                    | "lower-alpha"
                    | "upper-alpha"
                    | "lower-roman"
                    | "upper-roman"
                )
              }
              options={[
                { value: "decimal", label: "1, 2, 3" },
                { value: "lower-alpha", label: "a, b, c" },
                { value: "upper-alpha", label: "A, B, C" },
                { value: "lower-roman", label: "i, ii, iii" },
                { value: "upper-roman", label: "I, II, III" },
              ]}
            />
            <NumberInput
              label="Indentation"
              value={settings.lists.indentation}
              onChange={(v) => updateLists("indentation", v)}
              min={0}
              max={64}
              step={4}
              unit="px"
            />
          </div>
        </AccordionSection>

        {/* Blockquote */}
        <AccordionSection title="Blockquote">
          <div className="space-y-3">
            <ColorInput
              label="Border Color"
              value={settings.blockquote.borderColor}
              onChange={(v) => updateBlockquote("borderColor", v)}
            />
            <NumberInput
              label="Border Width"
              value={settings.blockquote.borderWidth}
              onChange={(v) => updateBlockquote("borderWidth", v)}
              min={1}
              max={10}
              step={1}
              unit="px"
            />
            <ColorInput
              label="Background"
              value={settings.blockquote.backgroundColor || "transparent"}
              onChange={(v) =>
                updateBlockquote(
                  "backgroundColor",
                  v === "transparent" ? undefined : v
                )
              }
            />
            <SelectInput
              label="Font Style"
              value={settings.blockquote.fontStyle}
              onChange={(v) =>
                updateBlockquote("fontStyle", v as "normal" | "italic")
              }
              options={[
                { value: "normal", label: "Normal" },
                { value: "italic", label: "Italic" },
              ]}
            />
            <NumberInput
              label="Padding"
              value={settings.blockquote.padding}
              onChange={(v) => updateBlockquote("padding", v)}
              min={0}
              max={48}
              step={4}
              unit="px"
            />
          </div>
        </AccordionSection>

        {/* Drop Cap */}
        <AccordionSection title="Drop Cap">
          <div className="space-y-3">
            <ToggleSwitch
              label="Enable Drop Cap"
              checked={settings.dropCap.enabled}
              onChange={(v: boolean) => updateDropCap("enabled", v)}
            />
            {settings.dropCap.enabled && (
              <>
                <NumberInput
                  label="Size (Lines)"
                  value={settings.dropCap.size}
                  onChange={(v) => updateDropCap("size", v)}
                  min={2}
                  max={5}
                  step={1}
                />
                <ColorInput
                  label="Color"
                  value={settings.dropCap.color || settings.typography.color}
                  onChange={(v) => updateDropCap("color", v)}
                />
                <TextInput
                  label="Font Family"
                  value={settings.dropCap.fontFamily || ""}
                  onChange={(v) => updateDropCap("fontFamily", v || undefined)}
                  placeholder="Inherit from text"
                />
              </>
            )}
          </div>
        </AccordionSection>

        {/* Columns */}
        <AccordionSection title="Multi-Column Layout">
          <div className="space-y-3">
            <ToggleSwitch
              label="Enable Columns"
              checked={settings.columns?.enabled || false}
              onChange={(v: boolean) => updateColumns("enabled", v)}
            />
            {settings.columns?.enabled && (
              <>
                <SelectInput
                  label="Column Count"
                  value={String(settings.columns?.count || 2)}
                  onChange={(v) => updateColumns("count", Number(v) as 1 | 2 | 3)}
                  options={[
                    { value: "1", label: "1 Column" },
                    { value: "2", label: "2 Columns" },
                    { value: "3", label: "3 Columns" },
                  ]}
                />
                <NumberInput
                  label="Column Gap"
                  value={settings.columns?.gap || 32}
                  onChange={(v) => updateColumns("gap", v)}
                  min={0}
                  max={64}
                  step={4}
                  unit="px"
                />
                <ToggleSwitch
                  label="Show Divider"
                  checked={settings.columns?.divider?.show || false}
                  onChange={(v: boolean) =>
                    updateColumns("divider", {
                      ...settings.columns?.divider,
                      show: v,
                      color: settings.columns?.divider?.color || "#334155",
                      width: settings.columns?.divider?.width || 1,
                    })
                  }
                />
                {settings.columns?.divider?.show && (
                  <>
                    <ColorInput
                      label="Divider Color"
                      value={settings.columns?.divider?.color || "#334155"}
                      onChange={(v) =>
                        updateColumns("divider", {
                          ...settings.columns?.divider,
                          show: true,
                          color: v,
                          width: settings.columns?.divider?.width || 1,
                        })
                      }
                    />
                    <NumberInput
                      label="Divider Width"
                      value={settings.columns?.divider?.width || 1}
                      onChange={(v) =>
                        updateColumns("divider", {
                          ...settings.columns?.divider,
                          show: true,
                          color: settings.columns?.divider?.color || "#334155",
                          width: v,
                        })
                      }
                      min={1}
                      max={5}
                      step={1}
                      unit="px"
                    />
                  </>
                )}
              </>
            )}
          </div>
        </AccordionSection>
      </div>
    );
  }

  // Advanced Tab
  if (activeTab === "advanced") {
    return (
      <div className="space-y-4">
        {/* Entrance Animation */}
        <AccordionSection title="Entrance Animation" defaultOpen>
          <div className="space-y-3">
            <ToggleSwitch
              label="Enable Animation"
              checked={settings.animation?.entrance?.enabled || false}
              onChange={(v: boolean) => updateAnimation("enabled", v)}
            />
            {settings.animation?.entrance?.enabled && (
              <>
                <SelectInput
                  label="Animation Type"
                  value={settings.animation?.entrance?.type || "fade"}
                  onChange={(v) =>
                    updateAnimation(
                      "type",
                      v as "none" | "fade" | "fade-up" | "fade-down" | "slide-up"
                    )
                  }
                  options={[
                    { value: "none", label: "None" },
                    { value: "fade", label: "Fade" },
                    { value: "fade-up", label: "Fade Up" },
                    { value: "fade-down", label: "Fade Down" },
                    { value: "slide-up", label: "Slide Up" },
                  ]}
                />
                <NumberInput
                  label="Duration"
                  value={settings.animation?.entrance?.duration || 600}
                  onChange={(v) => updateAnimation("duration", v)}
                  min={100}
                  max={2000}
                  step={100}
                  unit="ms"
                />
                <NumberInput
                  label="Delay"
                  value={settings.animation?.entrance?.delay || 0}
                  onChange={(v) => updateAnimation("delay", v)}
                  min={0}
                  max={2000}
                  step={100}
                  unit="ms"
                />
              </>
            )}
          </div>
        </AccordionSection>

        {/* Visibility */}
        <AccordionSection title="Visibility">
          <div className="space-y-3">
            <ToggleSwitch
              label="Hide on Desktop"
              checked={settings.advanced?.hideOnDesktop || false}
              onChange={(v: boolean) => updateAdvanced("hideOnDesktop", v)}
            />
            <ToggleSwitch
              label="Hide on Tablet"
              checked={settings.advanced?.hideOnTablet || false}
              onChange={(v: boolean) => updateAdvanced("hideOnTablet", v)}
            />
            <ToggleSwitch
              label="Hide on Mobile"
              checked={settings.advanced?.hideOnMobile || false}
              onChange={(v: boolean) => updateAdvanced("hideOnMobile", v)}
            />
          </div>
        </AccordionSection>

        {/* Custom CSS */}
        <AccordionSection title="Custom CSS">
          <div className="space-y-3">
            <TextInput
              label="Custom Class"
              value={settings.advanced?.customClass || ""}
              onChange={(v) => updateAdvanced("customClass", v || undefined)}
              placeholder="my-custom-class"
            />
            <TextInput
              label="Custom ID"
              value={settings.advanced?.customId || ""}
              onChange={(v) => updateAdvanced("customId", v || undefined)}
              placeholder="my-text-block-id"
            />
          </div>
        </AccordionSection>
      </div>
    );
  }

  return null;
}

export default TextBlockWidgetSettingsPanel;
