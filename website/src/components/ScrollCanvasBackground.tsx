import React, { useEffect, useRef } from 'react';

const TOTAL_FRAMES = 120;

export const ScrollCanvasBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const targetFrameRef = useRef<number>(0);
  const smoothFrameRef = useRef<number>(0);
  const currentRenderedIdxRef = useRef<number>(0);
  const isAnimatingRef = useRef<boolean>(false);
  const rafIdRef = useRef<number | null>(null);

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

    // Smooth gliding loop: animates gently between scroll ticks
    function startAnimationLoop() {
      if (isAnimatingRef.current) return;
      isAnimatingRef.current = true;

      function tick() {
        const target = targetFrameRef.current;
        const current = smoothFrameRef.current;
        const diff = target - current;

        // When difference is tiny, snap to exact target and pause the loop to conserve battery
        if (Math.abs(diff) < 0.04) {
          smoothFrameRef.current = target;
          const targetInt = Math.min(TOTAL_FRAMES - 1, Math.max(0, Math.round(target)));
          if (targetInt !== currentRenderedIdxRef.current) {
            currentRenderedIdxRef.current = targetInt;
            renderFrame(targetInt);
          }
          isAnimatingRef.current = false;
          rafIdRef.current = null;
          return;
        }

        // Adaptive smoothing: crisp and responsive for slow scrolls (0.13), faster catch-up for rapid flicks
        const damping = Math.abs(diff) > 15 ? 0.24 : 0.13;
        smoothFrameRef.current += diff * damping;

        const nextInt = Math.min(TOTAL_FRAMES - 1, Math.max(0, Math.round(smoothFrameRef.current)));
        if (nextInt !== currentRenderedIdxRef.current) {
          currentRenderedIdxRef.current = nextInt;
          renderFrame(nextInt);
        }

        rafIdRef.current = requestAnimationFrame(tick);
      }

      rafIdRef.current = requestAnimationFrame(tick);
    }

    // Scroll calculation: calculates exact target frame position
    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const progress = Math.min(1, Math.max(0, scrollY / maxScroll));
      targetFrameRef.current = progress * (TOTAL_FRAMES - 1);
      startAnimationLoop();
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
      {/* Pure, clean 60fps video canvas with smooth gliding momentum */}
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
