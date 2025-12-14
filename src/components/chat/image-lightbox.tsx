"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { X } from "lucide-react";

// Dynamic import to reduce initial bundle size
const Lightbox = dynamic(() => import("yet-another-react-lightbox"), {
  ssr: false,
});

// Import CSS for lightbox
import "yet-another-react-lightbox/styles.css";

interface ImageLightboxProps {
  images: Array<{
    src: string;
    alt?: string;
    width?: number;
    height?: number;
  }>;
  index?: number;
  className?: string;
}

export function ImageLightbox({
  images,
  index = 0,
  className = "",
}: ImageLightboxProps) {
  const [open, setOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(index);

  const slides = images.map((img) => ({
    src: img.src,
    alt: img.alt || "",
    width: img.width || 1920,
    height: img.height || 1080,
  }));

  return (
    <>
      {images.map((image, idx) => (
        <div
          key={idx}
          className={`relative cursor-pointer group ${className}`}
          onClick={() => {
            setCurrentIndex(idx);
            setOpen(true);
          }}
        >
          <Image
            src={image.src}
            alt={image.alt || `Image ${idx + 1}`}
            width={image.width || 400}
            height={image.height || 300}
            className="rounded-lg object-cover hover:opacity-90 transition-opacity"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg" />
        </div>
      ))}

      {open && (
        <Lightbox
          open={open}
          close={() => setOpen(false)}
          index={currentIndex}
          slides={slides}
          carousel={{ finite: images.length <= 1 }}
          render={{
            buttonPrev: images.length <= 1 ? () => null : undefined,
            buttonNext: images.length <= 1 ? () => null : undefined,
          }}
        />
      )}
    </>
  );
}

interface MessageImageProps {
  src: string;
  alt?: string;
  className?: string;
}

export function MessageImage({ src, alt, className }: MessageImageProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        className={`relative cursor-pointer group max-w-sm ${className}`}
        onClick={() => setOpen(true)}
      >
        <Image
          src={src}
          alt={alt || "Message image"}
          width={400}
          height={300}
          className="rounded-lg object-cover hover:opacity-90 transition-opacity"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded-full p-2">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
              />
            </svg>
          </div>
        </div>
      </div>

      {open && (
        <Lightbox
          open={open}
          close={() => setOpen(false)}
          slides={[{ src, alt: alt || "Message image" }]}
          carousel={{ finite: true }}
          render={{
            buttonPrev: () => null,
            buttonNext: () => null,
          }}
        />
      )}
    </>
  );
}
