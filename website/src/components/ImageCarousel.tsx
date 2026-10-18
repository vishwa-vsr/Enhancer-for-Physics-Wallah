import React, { useState } from 'react';
import { Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';

export interface CarouselSlide {
  src?: string;
}

interface ImageCarouselProps {
  slides: CarouselSlide[];
  className?: string;
}

export const ImageCarousel: React.FC<ImageCarouselProps> = ({
  slides,
  className = '',
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [brokenImages, setBrokenImages] = useState<Record<number, boolean>>({});

  if (!slides || slides.length === 0) return null;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const currentSlide = slides[currentIndex];
  const isBroken = brokenImages[currentIndex] || !currentSlide?.src;

  return (
    <div
      className={`relative my-6 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] shadow-xl ${className}`}
    >
      {/* Slide Image or Minimal Frame - object-contain ensures zero cropping */}
      <div className="relative w-full aspect-[16/10] sm:aspect-video flex items-center justify-center bg-[#010c14]/70 p-2 sm:p-4">
        {!isBroken && currentSlide.src ? (
          <img
            src={currentSlide.src}
            alt=""
            onError={() =>
              setBrokenImages((prev) => ({ ...prev, [currentIndex]: true }))
            }
            className="w-full h-full object-contain rounded-xl transition-opacity duration-300"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-muted-foreground/60 p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.04] text-muted-foreground mb-1">
              <ImageIcon className="h-6 w-6 text-indigo-300/60" />
            </div>
          </div>
        )}
      </div>

      {/* Navigation Arrows with identical liquid-glass rounded-xl UI like GitHub and About buttons */}
      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous image"
            className="!absolute left-3.5 top-1/2 -translate-y-1/2 z-20 liquid-glass p-2.5 rounded-xl text-white hover:scale-105 active:scale-95 transition-all shadow-lg border border-white/10 flex items-center justify-center cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>

          <button
            type="button"
            onClick={handleNext}
            aria-label="Next image"
            className="!absolute right-3.5 top-1/2 -translate-y-1/2 z-20 liquid-glass p-2.5 rounded-xl text-white hover:scale-105 active:scale-95 transition-all shadow-lg border border-white/10 flex items-center justify-center cursor-pointer"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>

          {/* Dots Indicator with matching glass styling */}
          <div className="!absolute bottom-3.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 p-1.5 rounded-xl liquid-glass border border-white/10 shadow-lg">
            {slides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`transition-all rounded-full cursor-pointer ${
                  currentIndex === idx
                    ? 'w-6 h-1.5 bg-indigo-400'
                    : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
