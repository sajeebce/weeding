"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Upload, X, Loader2, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  description?: string;
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
  previewClassName?: string;
  showUrlInput?: boolean;
}

export function ImageUpload({
  value,
  onChange,
  label,
  description,
  accept = "image/*",
  maxSize = 10,
  className,
  previewClassName,
  showUrlInput = true,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [urlMode, setUrlMode] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      toast.error(`File size too large. Maximum ${maxSize}MB allowed.`);
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "hero");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      onChange(data.url);
      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to upload image");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  function handleUrlSubmit() {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
      setUrlInput("");
      setUrlMode(false);
    }
  }

  function handleRemove() {
    onChange("");
  }

  // Normalize URL - add https:// if missing from domain-like URLs
  const normalizeImageUrl = (url: string): string => {
    if (!url || url.trim() === "") return "";
    // Already a relative path
    if (url.startsWith("/")) return url;
    // Already has protocol
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    // Looks like a domain (contains . and no spaces) - add https://
    if (url.includes(".") && !url.includes(" ")) {
      return `https://${url}`;
    }
    return url;
  };

  // Check if URL is valid for Image component
  const isValidImageUrl = (url: string): boolean => {
    if (!url || url.trim() === "") return false;
    // Check if it's a relative path starting with /
    if (url.startsWith("/")) return true;
    // Check if it's a valid absolute URL
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const normalizedValue = normalizeImageUrl(value);
  const hasValidImage = normalizedValue && isValidImageUrl(normalizedValue);

  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label>{label}</Label>}

      {hasValidImage ? (
        // Preview with remove button
        <div className={cn("relative group", previewClassName)}>
          <div className="relative aspect-video w-full max-w-sm rounded-lg border overflow-hidden bg-muted">
            <Image
              src={normalizedValue}
              alt="Preview"
              fill
              className="object-contain"
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        // Upload area
        <div className="space-y-3">
          {!urlMode ? (
            <div
              className={cn(
                "relative flex flex-col items-center justify-center w-full max-w-sm h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
                uploading
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
              )}
              onClick={() => !uploading && fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept={accept}
                onChange={handleFileChange}
                disabled={uploading}
              />

              {uploading ? (
                <>
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                  <p className="mt-2 text-sm text-muted-foreground">Uploading...</p>
                </>
              ) : (
                <>
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    Click to upload image
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Max {maxSize}MB
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="flex gap-2 max-w-sm">
              <Input
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/image.png"
                onKeyDown={(e) => e.key === "Enter" && handleUrlSubmit()}
              />
              <Button type="button" size="sm" onClick={handleUrlSubmit}>
                Add
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setUrlMode(false)}
              >
                Cancel
              </Button>
            </div>
          )}

          {showUrlInput && !urlMode && (
            <Button
              type="button"
              variant="link"
              size="sm"
              className="text-xs p-0 h-auto"
              onClick={() => setUrlMode(true)}
            >
              Or enter image URL
            </Button>
          )}
        </div>
      )}

      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
