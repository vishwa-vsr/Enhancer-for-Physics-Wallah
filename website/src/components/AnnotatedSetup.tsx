import React, { useState, useRef, useEffect, useCallback } from 'react';
import { PopupMockupCard } from './PopupMockupCard';

interface AnnotatedSetupProps {
  slug: string;
  intro: string;
  points: { label: string; text: string }[];
}

interface LinePath {
  d: string;
}

// Maps each feature's point index to the exact matching row index in PopupMockupCard
const ROW_MAPPINGS: Record<string, number[]> = {
  // Point 0: Enable Skip Silence -> Row 0 (Enable Skip Silence)
  // Point 1: Silence Speed -> Row 2 (Silence Speed)
  // Point 2: Auto Noise Calibration -> Row 3 (Auto Noise Calibration)
  'skip-silence': [0, 2, 3],

  // Point 0: Constant Video Quality -> Row 0
  // Point 1: Default Video Quality -> Row 1
  // Point 2: Hide Quality Widget -> Row 2
  'constant-720p-hd': [0, 1, 2],

  // Point 0: Enable Keyboard Hotkeys -> Row 0
  // Point 1: Speed Up (H) -> Row 1
  // Point 2: Slow Down (J) -> Row 2
  // Point 3: Reset Speed (L) -> Row 3
  'keyboard-shortcuts': [0, 1, 2, 3],

  // Point 0: Hide Live Chat -> Row 0
  // Point 1: Hide Doubt Box & Ask AI -> Row 1
  // Point 2: Hide Notes Icon -> Row 3
  'focus-mode': [0, 1, 3],

  // Point 0: Show Finish Time -> Row 0
  // Point 1: Finish Time Format -> Row 1
  'finish-clock': [0, 1],

  // Point 0: Auto-pause on Tab Switch -> Row 0
  // Point 1: Seamless Resume -> Row 0
  'smart-tab-auto-pause': [0, 0],
};

export const AnnotatedSetup: React.FC<AnnotatedSetupProps> = ({ slug, intro, points }) => {
  const [activeHoverIdx, setActiveHoverIdx] = useState<number | null>(null);
  const [lines, setLines] = useState<(LinePath | null)[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const cardWrapperRef = useRef<HTMLDivElement>(null);
  const pointRefs = useRef<(HTMLDivElement | null)[]>([]);
  const anchorRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const updateLines = useCallback(() => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const mapping = ROW_MAPPINGS[slug] || points.map((_, i) => i);

    const calculatedLines = points.map((_, ptIdx) => {
      const ptEl = anchorRefs.current[ptIdx];
      const ptContainerEl = pointRefs.current[ptIdx];
      const targetRowIdx = mapping[ptIdx] ?? ptIdx;
      const rowEl = cardWrapperRef.current?.querySelector(
        `[data-row-index="${targetRowIdx}"]`
      ) as HTMLElement | null;

      if (!ptEl || !rowEl || !ptContainerEl) return null;

      const ptRect = ptEl.getBoundingClientRect();
      const ptContainerRect = ptContainerEl.getBoundingClientRect();
      const rowRect = rowEl.getBoundingClientRect();

      // Start line right at the point title on the left
      const x1 = ptRect.right - containerRect.left + 6;
      const y1 = ptRect.top + ptRect.height / 2 - containerRect.top;

      // End line exactly at the outer left edge of the card row
      const x2 = rowRect.left - containerRect.left;
      const y2 = rowRect.top + rowRect.height / 2 - containerRect.top;

      // Find the rightmost boundary of this point's text so the horizontal line
      // clears the entire description before making any diagonal angle
      const textRightEdge = ptContainerRect.right - containerRect.left;

      const dx = x2 - x1;
      if (dx <= 12) {
        return { d: `M ${x1} ${y1} L ${x2} ${y2}` };
      }

      // If virtually aligned horizontally, straight horizontal line
      if (Math.abs(y1 - y2) < 4) {
        return { d: `M ${x1} ${y1} L ${x2} ${y2}` };
      }

      // Angled Blueprint Line:
      // 1. Starts horizontal at the title and stays horizontal until safely past the text
      // 2. Angles diagonally across the column gap
      // 3. Lands horizontally into the card row
      const minClearanceX = Math.max(x1 + 24, textRightEdge + 14);
      const break1 = Math.min(x2 - 40, minClearanceX);
      const break2 = Math.min(x2 - 16, break1 + Math.max(24, (x2 - break1) * 0.55));

      return {
        d: `M ${x1} ${y1} L ${break1} ${y1} L ${break2} ${y2} L ${x2} ${y2}`,
      };
    });

    setLines(calculatedLines);
  }, [slug, points]);

  useEffect(() => {
    updateLines();

    window.addEventListener('resize', updateLines);

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
      ro = new ResizeObserver(() => {
        updateLines();
      });
      ro.observe(containerRef.current);
      if (cardWrapperRef.current) {
        ro.observe(cardWrapperRef.current);
      }
    }

    const timer = setTimeout(updateLines, 100);
    const timer2 = setTimeout(updateLines, 400);

    return () => {
      window.removeEventListener('resize', updateLines);
      ro?.disconnect();
      clearTimeout(timer);
      clearTimeout(timer2);
    };
  }, [updateLines]);

  const handleHoverRow = (rowIdx: number | null) => {
    if (rowIdx === null) {
      setActiveHoverIdx(null);
      return;
    }
    const mapping = ROW_MAPPINGS[slug] || points.map((_, i) => i);
    const foundPtIdx = mapping.indexOf(rowIdx);
    if (foundPtIdx !== -1) {
      setActiveHoverIdx(foundPtIdx);
    }
  };

  const mapping = ROW_MAPPINGS[slug] || points.map((_, i) => i);
  const activeRowIdx = activeHoverIdx !== null ? mapping[activeHoverIdx] : undefined;

  return (
    <div className="w-full">
      <p className="text-sm sm:text-base text-muted-foreground mb-6 leading-relaxed">
        {intro}
      </p>

      {/* Desktop Blueprint Layout (Screens >= 768px): Tight text list + Angled Connector Lines + Enlarged Card */}
      <div ref={containerRef} className="hidden md:block relative my-10">
        <div className="grid grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Tight list of clean text points (no cards, no border boxes, no glow, no 1-2-3 numbers) */}
          <div className="col-span-5 lg:col-span-6 flex flex-col justify-center space-y-6 lg:space-y-8">
            {points.map((pt, idx) => {
              const isHovered = activeHoverIdx === idx;
              return (
                <div
                  key={idx}
                  ref={(el) => {
                    pointRefs.current[idx] = el;
                  }}
                  onMouseEnter={() => setActiveHoverIdx(idx)}
                  onMouseLeave={() => setActiveHoverIdx(null)}
                  className="group cursor-pointer select-none transition-opacity duration-200"
                  style={{
                    opacity: activeHoverIdx !== null && !isHovered ? 0.45 : 1,
                  }}
                >
                  <div className="inline-flex items-center gap-2">
                    <h4
                      className="text-base lg:text-lg font-semibold tracking-tight transition-colors duration-200"
                      style={{
                        color: isHovered ? '#9b95ff' : '#f8fafc',
                      }}
                    >
                      {pt.label}
                    </h4>
                    {/* Anchor point element right next to the title text */}
                    <span
                      ref={(el) => {
                        anchorRefs.current[idx] = el;
                      }}
                      className="inline-block w-1 h-1 shrink-0 opacity-0 pointer-events-none"
                    />
                  </div>
                  <p
                    className="text-xs sm:text-sm mt-1.5 leading-relaxed max-w-md transition-colors duration-200"
                    style={{
                      color: isHovered ? '#ffffff' : '#94a3b8',
                    }}
                  >
                    {pt.text}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Right Column: Enlarged 100% Accurate Extension Settings Card */}
          <div className="col-span-7 lg:col-span-6 flex justify-end">
            <div ref={cardWrapperRef} className="w-full max-w-[450px]">
              <PopupMockupCard
                slug={slug}
                activeRowIdx={activeRowIdx}
                onHoverRow={handleHoverRow}
              />
            </div>
          </div>
        </div>

        {/* SVG Canvas for Clean Angled Connector Lines (No Dots, No Glow) */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
          style={{ zIndex: 10 }}
        >
          {lines.map((line, idx) => {
            if (!line) return null;
            const isHovered = activeHoverIdx === idx;
            return (
              <path
                key={idx}
                d={line.d}
                fill="none"
                stroke={isHovered ? '#8b85ff' : '#6c63ff'}
                strokeWidth={isHovered ? 2 : 1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  opacity: activeHoverIdx !== null ? (isHovered ? 1 : 0.25) : 0.7,
                  transition: 'stroke 0.2s, stroke-width 0.2s, opacity 0.2s',
                }}
              />
            );
          })}
        </svg>
      </div>

      {/* Mobile Layout (Screens < 768px): Clean unboxed points with Popup Mockup underneath */}
      <div className="block md:hidden space-y-6">
        <div className="space-y-4">
          {points.map((pt, idx) => (
            <div key={idx} className="pb-3 border-b border-white/5 last:border-b-0">
              <h4 className="text-sm font-semibold text-white">{pt.label}</h4>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                {pt.text}
              </p>
            </div>
          ))}
        </div>

        <div className="pt-2">
          <PopupMockupCard slug={slug} />
        </div>
      </div>
    </div>
  );
};
