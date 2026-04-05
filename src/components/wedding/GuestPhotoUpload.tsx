"use client";

import { useState, useEffect, useRef } from "react";
import { Camera, Upload, X } from "lucide-react";

interface GuestPhoto {
  id: string;
  uploaderName: string | null;
  caption: string | null;
  photoData: string;
  createdAt: string;
}

interface Props {
  websiteId: string;
  primaryColor: string;
  accentColor: string;
  initialPhotos: GuestPhoto[];
}

// Resize image client-side to max 800px, returns data URI
async function resizeImage(file: File, maxPx = 800): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target?.result as string;
      img.onload = () => {
        const scale = Math.min(1, maxPx / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w; canvas.height = h;
        canvas.getContext("2d")?.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.8));
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function GuestPhotoUpload({ websiteId, primaryColor, accentColor, initialPhotos }: Props) {
  const [photos, setPhotos] = useState<GuestPhoto[]>(initialPhotos);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploaderName, setUploaderName] = useState("");
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(`/api/guest-photos/${websiteId}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.photos) setPhotos(d.photos); })
      .catch(() => {});
  }, [websiteId]);

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("Please select an image file."); return; }
    setError("");
    try {
      const resized = await resizeImage(file);
      setPreview(resized);
    } catch {
      setError("Failed to process image. Please try another file.");
    }
    if (fileRef.current) fileRef.current.value = "";
  }

  function clearPreview() {
    setPreview(null);
    setCaption("");
    setError("");
  }

  async function upload() {
    if (!preview) return;
    setUploading(true);
    setError("");
    try {
      const res = await fetch(`/api/guest-photos/${websiteId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          photoData: preview,
          uploaderName: uploaderName.trim() || null,
          caption: caption.trim() || null,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error || "Upload failed.");
        return;
      }
      const data = await res.json();
      setPhotos(prev => [data.photo, ...prev]);
      setPreview(null);
      setCaption("");
      setSuccessMsg("Photo shared!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  const formatDate = (iso: string) => {
    try { return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" }); }
    catch { return ""; }
  };

  return (
    <section id="photos" style={{ background: accentColor }} className="py-16 px-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-light text-center mb-2" style={{ color: primaryColor }}>
          Share Your Photos
        </h2>
        <p className="text-gray-500 text-center text-sm mb-8">Upload your favorite moments from our celebration</p>

        {/* Upload area */}
        <div className="bg-white rounded-2xl p-6 shadow-sm max-w-lg mx-auto mb-10">
          {!preview ? (
            <label className="flex flex-col items-center gap-3 py-8 border-2 border-dashed rounded-xl cursor-pointer hover:bg-gray-50 transition-colors"
              style={{ borderColor: primaryColor + "40" }}>
              <div className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: accentColor }}>
                <Camera className="w-6 h-6" style={{ color: primaryColor }} />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700">Click to select a photo</p>
                <p className="text-xs text-gray-400 mt-0.5">JPG, PNG, WEBP — max 5MB (auto-resized)</p>
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
            </label>
          ) : (
            <div className="space-y-3">
              {/* Preview */}
              <div className="relative rounded-xl overflow-hidden bg-gray-100 aspect-video">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  onClick={clearPreview}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Uploader name */}
              <input
                value={uploaderName}
                onChange={e => setUploaderName(e.target.value)}
                placeholder="Your name (optional)"
                maxLength={100}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
              />

              {/* Caption */}
              <input
                value={caption}
                onChange={e => setCaption(e.target.value)}
                placeholder="Add a caption… (optional)"
                maxLength={200}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
              />

              {error && <p className="text-xs text-red-500">{error}</p>}

              <div className="flex gap-2">
                <button
                  onClick={clearPreview}
                  className="flex-1 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={upload}
                  disabled={uploading}
                  className="flex-1 py-2 text-sm text-white font-medium rounded-lg flex items-center justify-center gap-1.5 disabled:opacity-60 transition-opacity"
                  style={{ background: primaryColor }}
                >
                  {uploading ? (
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  ) : (
                    <Upload className="w-3.5 h-3.5" />
                  )}
                  {uploading ? "Uploading…" : "Share Photo"}
                </button>
              </div>
            </div>
          )}

          {successMsg && (
            <p className="text-center text-sm font-medium mt-3" style={{ color: primaryColor }}>
              {successMsg}
            </p>
          )}
          {!preview && error && <p className="text-xs text-red-500 text-center mt-2">{error}</p>}
        </div>

        {/* Photo grid */}
        {photos.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {photos.map(photo => (
              <div
                key={photo.id}
                className="rounded-xl overflow-hidden bg-white shadow-sm cursor-pointer hover:shadow-md transition-shadow group"
                onClick={() => setLightboxSrc(photo.photoData)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.photoData} alt={photo.caption || "Guest photo"} className="w-full aspect-square object-cover" />
                {(photo.uploaderName || photo.caption) && (
                  <div className="px-2.5 py-2">
                    {photo.uploaderName && <p className="text-xs font-semibold text-gray-700 truncate">{photo.uploaderName}</p>}
                    {photo.caption && <p className="text-xs text-gray-400 truncate">{photo.caption}</p>}
                    <p className="text-[10px] text-gray-300 mt-0.5">{formatDate(photo.createdAt)}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxSrc && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setLightboxSrc(null)}
        >
          <button
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30 transition-colors"
            onClick={() => setLightboxSrc(null)}
          >
            <X className="w-5 h-5" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightboxSrc}
            alt="Full size"
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </section>
  );
}
