import React, { useEffect, useRef } from 'react';

const TOTAL_FRAMES = 120;
const BASE_SPEED = 24; // ~10 seconds for a full forward-and-back cycle (0 -> 119 -> 0)
const MAX_BOOST = 40;  // Gentle maximum speed cap when scrolling rapidly

export const ScrollCanvasBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const currentRenderedIdxRef = useRef<number>(0);
  const exactPosRef = useRef<number>(0);
  const directionRef = useRef<number>(1); // 1 = forward, -1 = reverse
  const scrollBoostRef = useRef<number>(0);
  const lastTimeRef = useRef<number | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const lastScrollYRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Draw a specific clean video frame onto the canvas (covering the viewport)
    function renderFrame(idx: number) {
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      let img = imagesRef.current[idx];

      // If requested frame isn't loaded yet, display nearest loaded frame to eliminate flickering
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
    }

    // Set canvas dimensions and redraw current frame
    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      renderFrame(currentRenderedIdxRef.current);
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
          renderFrame(0);
        };
      }
      images.push(img);
    }
    imagesRef.current = images;

    // Continuous 60fps Ambient Loop with Gentle Scroll Acceleration
    function tick(now: number) {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = now;
      }
      const dt = Math.min(0.08, (now - lastTimeRef.current) / 1000); // delta time in seconds (clamped to prevent huge jumps)
      lastTimeRef.current = now;

      // Soft easing near boundaries so the reverse point feels gentle like a pendulum
      const pos = exactPosRef.current;
      const distToBoundary = Math.min(pos, TOTAL_FRAMES - 1 - pos);
      const boundaryEase = distToBoundary < 14
        ? Math.max(0.4, Math.sin((distToBoundary / 14) * (Math.PI / 2)))
        : 1.0;

      // Current playback speed (baseline + decaying scroll boost)
      const currentSpeed = (BASE_SPEED + scrollBoostRef.current) * boundaryEase;
      scrollBoostRef.current *= 0.94; // Decay boost smoothly back to 0

      // Advance frame position
      let nextPos = pos + directionRef.current * currentSpeed * dt;

      // Turn around smoothly at the ends
      if (nextPos >= TOTAL_FRAMES - 1) {
        nextPos = TOTAL_FRAMES - 1;
        directionRef.current = -1;
      } else if (nextPos <= 0) {
        nextPos = 0;
        directionRef.current = 1;
      }
      exactPosRef.current = nextPos;

      // Render updated frame
      const frameIdx = Math.min(TOTAL_FRAMES - 1, Math.max(0, Math.round(nextPos)));
      if (frameIdx !== currentRenderedIdxRef.current) {
        currentRenderedIdxRef.current = frameIdx;
        renderFrame(frameIdx);
      }

      rafIdRef.current = requestAnimationFrame(tick);
    }

    rafIdRef.current = requestAnimationFrame(tick);

    // Scroll listener: gently boosts playback speed when user scrolls
    lastScrollYRef.current = window.scrollY || document.documentElement.scrollTop;
    const handleScroll = () => {
      const currentY = window.scrollY || document.documentElement.scrollTop;
      const delta = Math.abs(currentY - lastScrollYRef.current);
      lastScrollYRef.current = currentY;

      // Add gentle acceleration proportional to scroll movement
      if (delta > 0) {
        scrollBoostRef.current = Math.min(MAX_BOOST, scrollBoostRef.current + delta * 0.16);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Connect with Lenis smooth scroll instance if active
    const lenis = window.__lenis;
    if (lenis) {
      lenis.on('scroll', handleScroll);
    }

    // Auto-pause when user leaves tab (conserves 100% battery/CPU in background)
    const handleVisibility = () => {
      if (document.hidden) {
        if (rafIdRef.current !== null) {
          cancelAnimationFrame(rafIdRef.current);
          rafIdRef.current = null;
        }
        lastTimeRef.current = null;
      } else {
        lastTimeRef.current = null;
        if (rafIdRef.current === null) {
          rafIdRef.current = requestAnimationFrame(tick);
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('visibilitychange', handleVisibility);
      if (lenis) {
        lenis.off('scroll', handleScroll);
      }
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
      {/* 100% fluid 60fps continuous ambient loop with gentle scroll acceleration */}
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
