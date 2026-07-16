"use client";

import { useRef, useState } from "react";

interface ProductImageManagerProps {
  images: string[];
  onChange: (images: string[]) => void;
  label?: string;
}

async function uploadImage(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Upload failed");
  }

  const result = await response.json();
  const secureUrl = result.secure_url || result.url;

  if (!secureUrl) {
    throw new Error("Upload did not return a file URL");
  }

  return secureUrl as string;
}

export default function ProductImageManager({ images, onChange, label = "Product Images" }: ProductImageManagerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const openPicker = () => {
    inputRef.current?.click();
  };

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) {
      return;
    }

    setUploading(true);

    try {
      const uploadedImages = await Promise.all(Array.from(fileList).map((file) => uploadImage(file)));
      onChange([...images, ...uploadedImages]);
    } catch (error) {
      console.error("Image upload failed:", error);
      alert("One or more images could not be uploaded. Please try again.");
    } finally {
      setUploading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  const removeImage = (index: number) => {
    onChange(images.filter((_, currentIndex) => currentIndex !== index));
  };

  const setPrimaryImage = (index: number) => {
    if (index === 0) {
      return;
    }

    const nextImages = [...images];
    const [selectedImage] = nextImages.splice(index, 1);
    nextImages.unshift(selectedImage);
    onChange(nextImages);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(event) => void handleFiles(event.target.files)}
        className="hidden"
      />

      <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4">
        <button
          type="button"
          onClick={openPicker}
          disabled={uploading}
          className="mb-4 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {uploading ? "Uploading..." : images.length > 0 ? "Add More Images" : "Upload Images"}
        </button>

        {images.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-sm text-gray-500">
            Add multiple product photos. The first image will be used as the primary image.
          </div>
        ) : (
          <div className="space-y-3">
            <div className="overflow-x-auto pb-1">
              <div className="flex gap-3 min-w-max">
                {images.map((image, index) => (
                  <div key={`${image}-${index}`} className="relative group w-28 shrink-0">
                    <button
                      type="button"
                      onClick={() => setPrimaryImage(index)}
                      className="block h-28 w-28 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
                      title={index === 0 ? "Primary image" : "Set as primary"}
                    >
                      <img src={image} alt={`Product preview ${index + 1}`} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    </button>

                    {index === 0 && (
                      <span className="absolute left-2 top-2 rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                        Primary
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute right-2 top-2 rounded-full bg-black/70 px-2 py-1 text-[10px] font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-xs text-gray-500">Click a thumbnail to make it the main image customers see first.</p>
          </div>
        )}
      </div>
    </div>
  );
}