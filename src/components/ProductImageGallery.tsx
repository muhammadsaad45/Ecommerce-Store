"use client";

import { useMemo, useState } from "react";

interface ProductImageGalleryProps {
  images: string[];
  alt: string;
  stock: number;
}

export default function ProductImageGallery({ images, alt, stock }: ProductImageGalleryProps) {
  const galleryImages = useMemo(() => images.filter((image) => typeof image === "string" && image.trim()), [images]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [zoomEnabled, setZoomEnabled] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [pointerPosition, setPointerPosition] = useState({ x: 50, y: 50 });

  if (galleryImages.length === 0) {
    return (
      <div className="bg-gray-50 rounded-3xl p-8 flex items-center justify-center border border-gray-100 relative overflow-hidden min-h-[32rem]">
        {stock <= 0 && (
          <div className="absolute top-6 right-6 bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider z-10 shadow-sm">
            Out of Stock
          </div>
        )}
        <div className="text-sm text-gray-500">No product images available.</div>
      </div>
    );
  }

  const activeIndex = Math.min(selectedIndex, galleryImages.length - 1);
  const activeImage = galleryImages[activeIndex] || galleryImages[0];

  const previousImage = () => {
    setSelectedIndex((currentIndex) => (currentIndex === 0 ? galleryImages.length - 1 : currentIndex - 1));
  };

  const nextImage = () => {
    setSelectedIndex((currentIndex) => (currentIndex === galleryImages.length - 1 ? 0 : currentIndex + 1));
  };

  const handlePointerMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!zoomEnabled) {
      return;
    }

    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * 100;
    const y = ((event.clientY - bounds.top) / bounds.height) * 100;

    setPointerPosition({
      x: Math.min(100, Math.max(0, x)),
      y: Math.min(100, Math.max(0, y)),
    });
  };

  return (
    <>
      {zoomEnabled && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[1px]" />
      )}

      <div className={`space-y-4 ${zoomEnabled ? "relative z-50" : "relative"}`}>
      <div className="relative overflow-visible">
      <div className="bg-gray-50 rounded-3xl p-5 sm:p-8 border border-gray-100 relative overflow-visible">
        {stock <= 0 && (
          <div className="absolute top-6 right-6 bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider z-10 shadow-sm">
            Out of Stock
          </div>
        )}

        <div
          className={`relative group aspect-square overflow-hidden rounded-2xl bg-white ${zoomEnabled ? "cursor-zoom-in" : "cursor-default"}`}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          onMouseMove={handlePointerMove}
        >
          <img
            src={activeImage}
            alt={`${alt} ${activeIndex + 1}`}
            className="h-full w-full object-contain mix-blend-multiply"
          />

          {galleryImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={previousImage}
                className="absolute left-3 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white opacity-0 shadow-lg backdrop-blur-sm transition-all duration-300 group-hover:opacity-100 hover:bg-white/25"
                aria-label="Previous image"
              >
                <svg className="h-5 w-5 drop-shadow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <button
                type="button"
                onClick={nextImage}
                className="absolute right-3 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white opacity-0 shadow-lg backdrop-blur-sm transition-all duration-300 group-hover:opacity-100 hover:bg-white/25"
                aria-label="Next image"
              >
                <svg className="h-5 w-5 drop-shadow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </button>

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                {activeIndex + 1} / {galleryImages.length}
              </div>
            </>
          )}

          <button
            type="button"
            onClick={() => setZoomEnabled((current) => !current)}
            className={`absolute bottom-4 right-4 z-10 rounded-full px-4 py-2 text-sm font-semibold shadow-lg backdrop-blur transition-all duration-300 ${
              zoomEnabled ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-white/90 text-gray-800 hover:bg-white"
            }`}
          >
            {zoomEnabled ? "Close Zoom" : "Zoom"}
          </button>

        </div>

        {zoomEnabled && isHovering && (
          <div className="pointer-events-none absolute left-[calc(100%+1.5rem)] top-0 z-[60] block h-[34rem] w-[34rem] overflow-hidden rounded-3xl border border-white/40 bg-black/85 shadow-2xl lg:h-[38rem] lg:w-[38rem] xl:h-[40rem] xl:w-[40rem]">
            <div
              className="h-full w-full"
              style={{
                backgroundImage: `url(${activeImage})`,
                backgroundRepeat: "no-repeat",
                backgroundSize: "340%",
                backgroundPosition: `${pointerPosition.x}% ${pointerPosition.y}%`,
              }}
            />
          </div>
        )}
        </div>
      </div>

      {galleryImages.length > 1 && (
        <div className="overflow-x-auto pb-1">
          <div className="flex gap-3 snap-x snap-mandatory">
            {galleryImages.map((image, index) => (
              <button
                key={`${image}-${index}`}
                type="button"
                onClick={() => setSelectedIndex(index)}
                className={`relative h-20 w-20 flex-none snap-start overflow-hidden rounded-xl border bg-white shadow-sm transition-all duration-300 ${
                  index === activeIndex ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-200 hover:border-gray-300"
                }`}
                aria-label={`View image ${index + 1}`}
              >
                <img src={image} alt={`${alt} thumbnail ${index + 1}`} className="h-full w-full object-cover transition-transform duration-500 hover:scale-110" />
              </button>
            ))}
          </div>
        </div>
      )}
      </div>
    </>
  );
}