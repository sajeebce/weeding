"use client";

import { FileIcon, Download, File, FileText, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DocumentPreviewProps {
  fileName: string;
  fileSize?: number;
  fileUrl: string;
  mimeType?: string;
  className?: string;
}

export function DocumentPreview({
  fileName,
  fileSize,
  fileUrl,
  mimeType,
  className = "",
}: DocumentPreviewProps) {
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "Unknown size";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = () => {
    if (!mimeType) return <File className="h-8 w-8" />;

    if (mimeType.includes("pdf")) {
      return <FileText className="h-8 w-8 text-red-500" />;
    }
    if (
      mimeType.includes("word") ||
      mimeType.includes("document") ||
      mimeType.includes("msword")
    ) {
      return <FileText className="h-8 w-8 text-blue-500" />;
    }
    if (
      mimeType.includes("sheet") ||
      mimeType.includes("excel") ||
      mimeType.includes("csv")
    ) {
      return <FileText className="h-8 w-8 text-green-500" />;
    }
    if (mimeType.includes("zip") || mimeType.includes("rar")) {
      return <Archive className="h-8 w-8 text-yellow-500" />;
    }
    return <FileIcon className="h-8 w-8 text-gray-500" />;
  };

  const getFileExtension = () => {
    const parts = fileName.split(".");
    if (parts.length > 1) {
      return parts[parts.length - 1].toUpperCase();
    }
    return "FILE";
  };

  return (
    <div
      className={`flex items-center gap-3 p-4 border rounded-lg bg-muted/50 hover:bg-muted transition-colors max-w-sm ${className}`}
    >
      <div className="flex-shrink-0">{getFileIcon()}</div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{fileName}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{getFileExtension()}</span>
          {fileSize && (
            <>
              <span>•</span>
              <span>{formatFileSize(fileSize)}</span>
            </>
          )}
        </div>
      </div>

      <Button
        size="icon"
        variant="ghost"
        className="flex-shrink-0"
        asChild
      >
        <a
          href={fileUrl}
          download={fileName}
          target="_blank"
          rel="noopener noreferrer"
          title="Download file"
        >
          <Download className="h-4 w-4" />
        </a>
      </Button>
    </div>
  );
}

interface AttachmentPreviewProps {
  fileName: string;
  fileUrl: string;
  fileSize?: number;
  mimeType?: string;
}

export function AttachmentPreview({
  fileName,
  fileUrl,
  fileSize,
  mimeType,
}: AttachmentPreviewProps) {
  const isImage =
    mimeType?.startsWith("image/") ||
    /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(fileName);

  if (isImage) {
    return null; // Images are handled by ImageLightbox component
  }

  return (
    <DocumentPreview
      fileName={fileName}
      fileUrl={fileUrl}
      fileSize={fileSize}
      mimeType={mimeType}
    />
  );
}
