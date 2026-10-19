import React, { useEffect, useRef } from 'react';

export interface ScrollCanvasBackgroundProps {
  mode?: 'scroll' | 'loop';
}

const TOTAL_FRAMES = 120;
const CELL_SIZE = 9;
const CONTRAST = 158;
// Contrast adjustment factor: (259 * (contrast + 255)) / (255 * (259 - contrast))
const CONTRAST_FACTOR = (259 * (CONTRAST + 255)) / (255 * (259 - CONTRAST));

// 4x4 Bayer Matrix for ordered dither
const BAYER_4X4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

export const ScrollCanvasBackground: React.FC<ScrollCanvasBackgroundProps> = ({ mode = 'scroll' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const currentFrameRef = useRef<number>(0);
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Offscreen canvas for sampling down to cell grid
    const sampleCanvas = document.createElement('canvas');
    const sampleCtx = sampleCanvas.getContext('2d', { willReadFrequently: true });

    let isDestroyed = false;

    // Handle canvas sizing
    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    // Preload the 120 frames
    const images: HTMLImageElement[] = [];
    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      const frameNum = String(i).padStart(3, '0');
      img.src = `/scroll-frames/frame_${frameNum}.webp`;
      images.push(img);
    }
    imagesRef.current = images;

    // Draw the 21st.dev Dither effect pipeline
    function renderPipeline() {
      if (!canvas || !sampleCtx || isDestroyed) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const idx = currentFrameRef.current;
      let img = imagesRef.current[idx];

      // Fallback to nearest loaded frame to eliminate flickering
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
          rafIdRef.current = requestAnimationFrame(renderPipeline);
          return;
        }
      }

      const w = canvas.width;
      const h = canvas.height;
      if (w === 0 || h === 0) return;

      const cols = Math.ceil(w / CELL_SIZE);
      const rows = Math.ceil(h / CELL_SIZE);

      if (sampleCanvas.width !== cols || sampleCanvas.height !== rows) {
        sampleCanvas.width = cols;
        sampleCanvas.height = rows;
      }

      // 1. Cover sampling into the grid
      const imgRatio = img.width / img.height;
      const gridRatio = cols / rows;
      let sw: number;
      let sh: number;
      let sx: number;
      let sy: number;

      if (gridRatio > imgRatio) {
        sw = cols;
        sh = cols / imgRatio;
        sx = 0;
        sy = (rows - sh) / 2;
      } else {
        sw = rows * imgRatio;
        sh = rows;
        sx = (cols - sw) / 2;
        sy = 0;
      }

      sampleCtx.clearRect(0, 0, cols, rows);
      sampleCtx.drawImage(img, sx, sy, sw, sh);
      const imgData = sampleCtx.getImageData(0, 0, cols, rows);
      const data = imgData.data;

      // 2. Clear output canvas
      ctx.clearRect(0, 0, w, h);

      // Calmer shimmer animation time
      const time = performance.now() * 0.0018;

      // 3. Render 21st.dev Dither cells in clean monochrome silver with 75% reduced intensity
      for (let r = 0; r < rows; r++) {
        const bayerRow = BAYER_4X4[r % 4];
        const cy = r * CELL_SIZE + CELL_SIZE / 2;

        for (let c = 0; c < cols; c++) {
          const pixelIdx = (r * cols + c) * 4;
          let red = data[pixelIdx];
          let green = data[pixelIdx + 1];
          let blue = data[pixelIdx + 2];

          // Step A: Contrast boost (contrast: 158)
          red = Math.min(255, Math.max(0, CONTRAST_FACTOR * (red - 128) + 128));
          green = Math.min(255, Math.max(0, CONTRAST_FACTOR * (green - 128) + 128));
          blue = Math.min(255, Math.max(0, CONTRAST_FACTOR * (blue - 128) + 128));

          // Step B: Cell luminance (0 to 1)
          const lum = (0.299 * red + 0.587 * green + 0.114 * blue) / 255;

          // Step C: Subtle, gentle shimmer wave
          const shimmer = Math.sin(time + c * 0.25 + r * 0.3) * Math.cos(time * 0.6 - c * 0.15) * 0.06;
          const animLum = Math.min(1, Math.max(0, lum + shimmer));

          // Step D: Bayer 4x4 dither threshold
          const threshold = bayerRow[c % 4] / 16;
          if (animLum < threshold * 0.45) continue;

          // Step E: Delicate constellation dot size (scaled down)
          const radius = Math.max(0.65, (CELL_SIZE / 3.8) * Math.min(1.0, animLum * 1.1));
          const cx = c * CELL_SIZE + CELL_SIZE / 2;

          // Step F: Clean Silver Monochrome with 70-80% reduced opacity (0.06 to 0.24)
          const alpha = 0.06 + animLum * 0.18;
          ctx.fillStyle = `rgba(224, 235, 248, ${alpha.toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(cx, cy, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      rafIdRef.current = requestAnimationFrame(renderPipeline);
    }

    // Start the render loop
    rafIdRef.current = requestAnimationFrame(renderPipeline);

    // Mode-specific frame advancement:
    // 1. Auto-loop mode for subpages (/faq, /blog, /privacy)
    let loopInterval: ReturnType<typeof setInterval> | null = null;
    if (mode === 'loop') {
      loopInterval = setInterval(() => {
        currentFrameRef.current = (currentFrameRef.current + 1) % TOTAL_FRAMES;
      }, 66); // ~15 fps playback loop
    }

    // 2. Scroll mode for home page
    const handleScroll = () => {
      if (mode !== 'scroll') return;
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const progress = Math.min(1, Math.max(0, scrollY / maxScroll));
      currentFrameRef.current = Math.min(TOTAL_FRAMES - 1, Math.max(0, Math.floor(progress * (TOTAL_FRAMES - 1))));
    };

    if (mode === 'scroll') {
      window.addEventListener('scroll', handleScroll, { passive: true });
      const lenis = window.__lenis;
      if (lenis) {
        lenis.on('scroll', handleScroll);
      }
      handleScroll();
    }

    return () => {
      isDestroyed = true;
      window.removeEventListener('resize', updateCanvasSize);
      if (mode === 'scroll') {
        window.removeEventListener('scroll', handleScroll);
        const lenis = window.__lenis;
        if (lenis) {
          lenis.off('scroll', handleScroll);
        }
      }
      if (loopInterval) {
        clearInterval(loopInterval);
      }
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [mode]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full object-cover pointer-events-none z-0"
    />
  );
};
