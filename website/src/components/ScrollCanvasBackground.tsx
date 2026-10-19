import React, { useEffect, useRef } from 'react';

const TOTAL_FRAMES = 120;

export const ScrollCanvasBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const currentFrameRef = useRef<number>(0);
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas dimensions
    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      renderFrame();
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    // Preload frames
    const images: HTMLImageElement[] = [];
    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      const frameNum = String(i).padStart(3, '0');
      img.src = `/scroll-frames/frame_${frameNum}.webp`;

      if (i === 0) {
        img.onload = () => {
          renderFrame();
        };
      }
      images.push(img);
    }
    imagesRef.current = images;

    // Draw the active frame to the canvas (covering the viewport)
    function renderFrame() {
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const idx = currentFrameRef.current;
      let img = imagesRef.current[idx];

      // If requested frame isn't loaded yet, find the nearest loaded frame to prevent flickering
      if (!img || !img.complete || img.naturalWidth === 0) {
        let fallback: HTMLImageElement | null = null;
        for (let offset = 1; offset < TOTAL_FRAMES; offset++) {
          const prev = imagesRef.current[idx - offset];
          if (prev && prev.complete && prev.naturalWidth > 0) {
            fallback = prev;
            break;
          }
          const next = imagesRef.current[idx + offset];
          if (next && next.complete && next.naturalWidth > 0) {
            fallback = next;
            break;
          }
        }
        if (fallback) {
          img = fallback;
        } else {
          return;
        }
      }

      const w = canvas.width;
      const h = canvas.height;
      const imgRatio = img.width / img.height;
      const canvasRatio = w / h;

      let renderW: number;
      let renderH: number;
      let renderX: number;
      let renderY: number;

      if (canvasRatio > imgRatio) {
        renderW = w;
        renderH = w / imgRatio;
        renderX = 0;
        renderY = (h - renderH) / 2;
      } else {
        renderW = h * imgRatio;
        renderH = h;
        renderX = (w - renderW) / 2;
        renderY = 0;
      }

      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(img, renderX, renderY, renderW, renderH);
      rafIdRef.current = null;
    }

    // Map the whole page scroll (top of Hero to bottom of Footer) to frame 0 -> 119
    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const progress = Math.min(1, Math.max(0, scrollY / maxScroll));
      const targetIndex = Math.min(TOTAL_FRAMES - 1, Math.max(0, Math.floor(progress * (TOTAL_FRAMES - 1))));

      if (targetIndex !== currentFrameRef.current) {
        currentFrameRef.current = targetIndex;
        if (rafIdRef.current === null) {
          rafIdRef.current = requestAnimationFrame(renderFrame);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Connect with Lenis smooth scroll instance if active
    const lenis = window.__lenis;
    if (lenis) {
      lenis.on('scroll', handleScroll);
    }

    // Initial render
    handleScroll();

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      window.removeEventListener('scroll', handleScroll);
      if (lenis) {
        lenis.off('scroll', handleScroll);
      }
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full object-cover pointer-events-none z-0"
    />
  );
};
