"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import "suneditor/dist/css/suneditor.min.css";

const SunEditor = dynamic(() => import("suneditor-react"), {
  ssr: false,
});

interface SunEditorWrapperProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  height?: string;
  onImageUploadBefore?: (files: File[], info: any, uploadHandler: any) => void;
}

export function SunEditorWrapper({
  value,
  onChange,
  placeholder = "Write your content here...",
  height = "400px",
}: SunEditorWrapperProps) {
  function handleImageUploadBefore(files: File[], info: any, uploadHandler: any) {
    Promise.all(
      files.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) throw new Error("Upload failed");
        const data = await res.json();
        return {
          result: [
            {
              url: data.url,
              name: file.name,
              size: file.size,
            },
          ],
        };
      })
    )
      .then((responses) => {
        uploadHandler(responses[0]);
      })
      .catch((error) => {
        console.error("Image upload error:", error);
        uploadHandler({
          errorMessage: "Image upload failed",
        });
      });

    return undefined;
  }

  return (
    <SunEditor
      setContents={value}
      onChange={onChange}
      placeholder={placeholder}
      height={height}
      setOptions={{
        buttonList: [
          ["undo", "redo"],
          ["font", "fontSize", "formatBlock"],
          ["bold", "underline", "italic", "strike", "subscript", "superscript"],
          ["fontColor", "hiliteColor"],
          ["removeFormat"],
          ["outdent", "indent"],
          ["align", "horizontalRule", "list", "table"],
          ["link", "image", "video"],
          ["fullScreen", "showBlocks", "codeView"],
          ["preview"],
        ],
        formats: ["p", "div", "h1", "h2", "h3", "h4", "h5", "h6"],
        font: [
          "Arial",
          "Comic Sans MS",
          "Courier New",
          "Impact",
          "Georgia",
          "Tahoma",
          "Trebuchet MS",
          "Verdana",
        ],
      }}
      onImageUploadBefore={handleImageUploadBefore}
    />
  );
}
