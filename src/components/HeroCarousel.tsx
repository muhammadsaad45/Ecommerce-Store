"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const slides = [
  {
    id: 1,
    title: "Next-Gen Tech is Here",
    subtitle: "Discover our new arrivals of premium gadgets.",
    image: "https://images.unsplash.com/photo-1550009158-9ebf6d17369b?q=80&w=1200",
  },
  {
    id: 2,
    title: "Summer Sale on Audio",
    subtitle: "Up to 40% off on selected headphones and speakers.",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1200",
  },
  {
    id: 3,
    title: "Work From Home Essentials",
    subtitle: "Upgrade your home office with top-tier gear.",
    image: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?q=80&w=1200",
  }
];

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);

  // Automatically switch slides every 3 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative h-[400px] md:h-[550px] w-full overflow-hidden mb-12">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === current ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          {/* Background Image with a dark overlay so text is readable */}
          <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-center px-8 md:px-16 text-white">
            <h2 className="text-4xl md:text-6xl font-extrabold mb-4 drop-shadow-md">
              {slide.title}
            </h2>
            <p className="text-lg md:text-xl mb-8 max-w-xl drop-shadow-md">
              {slide.subtitle}
            </p>
            <Link 
              href="#catalog" 
              className="bg-white text-black px-8 py-3 rounded-full font-bold w-max hover:bg-gray-200 transition-colors shadow-lg"
            >
              Shop Now
            </Link>
          </div>
        </div>
      ))}
      
      {/* Navigation Dots at the bottom */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center space-x-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === current ? "bg-white" : "bg-white/50 hover:bg-white/75"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}