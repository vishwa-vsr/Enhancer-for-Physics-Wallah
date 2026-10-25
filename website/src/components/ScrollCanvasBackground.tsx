import React, { useEffect, useRef } from 'react';

const TOTAL_FRAMES = 120;

export const ScrollCanvasBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const targetFrameFloatRef = useRef<number>(0);
  const smoothFrameFloatRef = useRef<number>(0);
  const isAnimatingRef = useRef<boolean>(false);
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Helper: get safe loaded image or nearest fallback
    function getSafeImage(idx: number): HTMLImageElement | null {
      const safeIdx = Math.min(TOTAL_FRAMES - 1, Math.max(0, idx));
      let img = imagesRef.current[safeIdx];
      if (img && img.complete && img.naturalWidth > 0) {
        return img;
      }
      for (let offset = 1; offset < TOTAL_FRAMES; offset++) {
        const prev = imagesRef.current[safeIdx - offset];
        if (prev && prev.complete && prev.naturalWidth > 0) return prev;
        const next = imagesRef.current[safeIdx + offset];
        if (next && next.complete && next.naturalWidth > 0) return next;
      }
      return null;
    }

    // Helper: draw single image to cover full canvas
    function drawImageCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, alpha: number) {
      const w = canvas!.width;
      const h = canvas!.height;
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

      ctx.globalAlpha = alpha;
      ctx.drawImage(img, renderX, renderY, renderW, renderH);
    }

    // Cross-fade dissolve between the two nearest picture frames
    function drawBlendedFrame(floatPos: number) {
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const clampedPos = Math.min(TOTAL_FRAMES - 1, Math.max(0, floatPos));
      const baseIdx = Math.floor(clampedPos);
      const frac = clampedPos - baseIdx;
      const nextIdx = Math.min(TOTAL_FRAMES - 1, baseIdx + 1);

      const baseImg = getSafeImage(baseIdx);
      if (!baseImg) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (frac < 0.015 || baseIdx === nextIdx) {
        // Pure single frame
        drawImageCover(ctx, baseImg, 1.0);
      } else {
        const nextImg = getSafeImage(nextIdx);
        // Base image drawn solid
        drawImageCover(ctx, baseImg, 1.0);
        // Next image cross-faded smoothly on top based on exact scroll fraction
        if (nextImg) {
          drawImageCover(ctx, nextImg, frac);
        }
      }

      ctx.globalAlpha = 1.0;
    }

    // Set canvas dimensions and redraw current position
    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      drawBlendedFrame(smoothFrameFloatRef.current);
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    // Preload clean video frames
    const images: HTMLImageElement[] = [];
    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      const frameNum = String(i).padStart(3, '0');
      img.src = `/scroll-frames/frame_${frameNum}.webp`;

      if (i === 0) {
        img.onload = () => {
          drawBlendedFrame(0);
        };
      }
      images.push(img);
    }
    imagesRef.current = images;

    // Smooth gliding loop: ONLY runs while scrubbing, stops completely when idle
    function startGlideLoop() {
      if (isAnimatingRef.current) return;
      isAnimatingRef.current = true;

      function tick() {
        const target = targetFrameFloatRef.current;
        const current = smoothFrameFloatRef.current;
        const diff = target - current;

        // When difference is tiny, snap to target and go completely to sleep (STILL when idle)
        if (Math.abs(diff) < 0.005) {
          smoothFrameFloatRef.current = target;
          drawBlendedFrame(target);
          isAnimatingRef.current = false;
          rafIdRef.current = null;
          return;
        }

        // Smooth damping: glides with responsive cushion
        smoothFrameFloatRef.current += diff * 0.16;
        drawBlendedFrame(smoothFrameFloatRef.current);

        rafIdRef.current = requestAnimationFrame(tick);
      }

      rafIdRef.current = requestAnimationFrame(tick);
    }

    // 2-Way Ping-Pong scroll mapping:
    // 0% -> 50% scroll: plays forward (frame 0 -> 119)
    // 50% -> 100% scroll: plays in reverse (frame 119 -> 0)
    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const progress = Math.min(1, Math.max(0, scrollY / maxScroll));

      let targetPos: number;
      if (progress <= 0.5) {
        // Forward journey on top half of page (0 to 119)
        const subProgress = progress / 0.5;
        targetPos = subProgress * (TOTAL_FRAMES - 1);
      } else {
        // Reverse journey on bottom half of page (119 down to 0)
        const subProgress = (progress - 0.5) / 0.5;
        targetPos = (1 - subProgress) * (TOTAL_FRAMES - 1);
      }

      targetFrameFloatRef.current = targetPos;
      startGlideLoop();
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
      isAnimatingRef.current = false;
    };
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
      {/* 2-Way Ping-Pong Canvas with Sub-Pixel Cross-Fade Dissolve */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* Subtle dark tint overlay for crisp text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#021422]/60 via-[#021422]/45 to-[#021422]/70 pointer-events-none" />
    </div>
  );
};

export default ScrollCanvasBackground;
