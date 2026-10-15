import { useState, useEffect, useRef } from 'preact/hooks';
import styles from './ColorPicker.module.css';

interface ColorPickerProps {
  value?: string;
  onChange: (hex: string) => void;
  presets?: string[];
  align?: 'left' | 'right';
  className?: string;
}

const DEFAULT_PRESETS = [
  '#6366f1', // Indigo
  '#3b82f6', // Blue
  '#10b981', // Emerald
  '#eab308', // Amber
  '#f97316', // Orange
  '#ef4444', // Red
  '#ec4899', // Pink
  '#8b5cf6', // Violet
];

// ---------------------------------------------------------------------------
// Color Math (HSV <-> RGB <-> HEX)
// ---------------------------------------------------------------------------

function hsvToRgb(h: number, s: number, v: number): { r: number; g: number; b: number } {
  const c = v * s;
  const hh = (((h % 360) + 360) % 360) / 60;
  const x = c * (1 - Math.abs((hh % 2) - 1));
  let r = 0,
    g = 0,
    b = 0;
  if (hh < 1) {
    r = c;
    g = x;
    b = 0;
  } else if (hh < 2) {
    r = x;
    g = c;
    b = 0;
  } else if (hh < 3) {
    r = 0;
    g = c;
    b = x;
  } else if (hh < 4) {
    r = 0;
    g = x;
    b = c;
  } else if (hh < 5) {
    r = x;
    g = 0;
    b = c;
  } else {
    r = c;
    g = 0;
    b = x;
  }
  const m = v - c;
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

function rgbToHsv(r: number, g: number, b: number): { h: number; s: number; v: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const v = max;
  const d = max - min;
  const s = max === 0 ? 0 : d / max;
  let h = 0;
  if (d > 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s, v };
}

function parseHex(hex: string): { r: number; g: number; b: number } | null {
  const clean = hex.trim().replace(/^#/, '');
  if (!/^[0-9a-fA-F]{3}$|^[0-9a-fA-F]{6}$/.test(clean)) return null;
  let full = clean;
  if (clean.length === 3) {
    full = clean
      .split('')
      .map((c) => c + c)
      .join('');
  }
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) =>
    Math.max(0, Math.min(255, Math.round(n)))
      .toString(16)
      .padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toLowerCase();
}

interface EyeDropperType {
  open: () => Promise<{ sRGBHex: string }>;
}

export function ColorPicker({
  value = '#6366f1',
  onChange,
  presets = DEFAULT_PRESETS,
  align = 'left',
  className = '',
}: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const satValRef = useRef<HTMLDivElement>(null);
  const hueRef = useRef<HTMLDivElement>(null);

  // Parse incoming value to HSV
  const initialRgb = parseHex(value) || { r: 99, g: 102, b: 241 };
  const initialHsv = rgbToHsv(initialRgb.r, initialRgb.g, initialRgb.b);

  const [h, setH] = useState(initialHsv.h);
  const [s, setS] = useState(initialHsv.s);
  const [v, setV] = useState(initialHsv.v);
  const [draftHex, setDraftHex] = useState(value.toUpperCase().replace(/^#/, ''));
  const [hasEyeDropper, setHasEyeDropper] = useState(false);

  const [isDraggingSatVal, setIsDraggingSatVal] = useState(false);
  const [isDraggingHue, setIsDraggingHue] = useState(false);

  // Check EyeDropper support
  useEffect(() => {
    setHasEyeDropper(typeof window !== 'undefined' && 'EyeDropper' in window);
  }, []);

  // Sync state if external value changes
  useEffect(() => {
    const rgb = parseHex(value);
    if (rgb) {
      const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
      // Preserve hue if saturation or value is 0
      if (hsv.s > 0 && hsv.v > 0) {
        setH(hsv.h);
      }
      setS(hsv.s);
      setV(hsv.v);
      setDraftHex(value.toUpperCase().replace(/^#/, ''));
    }
  }, [value]);

  // Click outside & Escape key listeners
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Saturation / Value updates
  const handleSatValPointer = (clientX: number, clientY: number) => {
    if (!satValRef.current) return;
    const rect = satValRef.current.getBoundingClientRect();
    const nextS = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const nextV = Math.max(0, Math.min(1, 1 - (clientY - rect.top) / rect.height));

    setS(nextS);
    setV(nextV);

    const rgb = hsvToRgb(h, nextS, nextV);
    const newHex = rgbToHex(rgb.r, rgb.g, rgb.b);
    setDraftHex(newHex.toUpperCase().replace(/^#/, ''));
    onChange(newHex);
  };

  // Hue updates
  const handleHuePointer = (clientX: number) => {
    if (!hueRef.current) return;
    const rect = hueRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const nextH = Math.round(x * 360);

    setH(nextH);

    const rgb = hsvToRgb(nextH, s, v);
    const newHex = rgbToHex(rgb.r, rgb.g, rgb.b);
    setDraftHex(newHex.toUpperCase().replace(/^#/, ''));
    onChange(newHex);
  };

  // Hex input commit
  const handleHexCommit = (hexStr: string) => {
    const rgb = parseHex(hexStr);
    if (rgb) {
      const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
      setH(hsv.h);
      setS(hsv.s);
      setV(hsv.v);
      const formatted = rgbToHex(rgb.r, rgb.g, rgb.b);
      setDraftHex(formatted.toUpperCase().replace(/^#/, ''));
      onChange(formatted);
    } else {
      // Revert if invalid
      setDraftHex(value.toUpperCase().replace(/^#/, ''));
    }
  };

  // Eyedropper API
  const handleEyeDropper = async () => {
    const EyeDropperCtor = (
      window as unknown as { EyeDropper?: { new (): EyeDropperType } }
    ).EyeDropper;
    if (EyeDropperCtor) {
      try {
        const eyeDropper = new EyeDropperCtor();
        const result = await eyeDropper.open();
        if (result && result.sRGBHex) {
          handleHexCommit(result.sRGBHex);
        }
      } catch {
        // User cancelled picker
      }
    }
  };

  const currentColorHex = value.toLowerCase();
  const currentHueColor = `hsl(${h}, 100%, 50%)`;

  return (
    <div ref={containerRef} class={`${styles.container} ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        class={`${styles.trigger} ${isOpen ? styles.triggerOpen : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Pick color"
        title="Choose a custom color"
      >
        <span class={styles.swatchPreview} style={{ backgroundColor: currentColorHex }} />
        <span class={styles.hexLabel}>{value.toUpperCase()}</span>
        <span class={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            width="12"
            height="12"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </button>

      {/* Popover Panel */}
      {isOpen && (
        <div
          class={styles.popover}
          style={{ [align === 'right' ? 'right' : 'left']: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* 2D Saturation / Value Box */}
          <div
            ref={satValRef}
            class={styles.satValBox}
            onPointerDown={(e) => {
              setIsDraggingSatVal(true);
              (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
              handleSatValPointer(e.clientX, e.clientY);
            }}
            onPointerMove={(e) => {
              if (isDraggingSatVal) {
                handleSatValPointer(e.clientX, e.clientY);
              }
            }}
            onPointerUp={(e) => {
              setIsDraggingSatVal(false);
              try {
                (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
              } catch {
                // Ignore
              }
            }}
          >
            <div
              class={styles.satValGradient}
              style={{
                background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, ${currentHueColor})`,
              }}
            />
            <div
              class={styles.satValThumb}
              style={{
                left: `${s * 100}%`,
                top: `${(1 - v) * 100}%`,
                backgroundColor: currentColorHex,
              }}
            />
          </div>

          {/* Hue Slider */}
          <div
            ref={hueRef}
            class={styles.hueSlider}
            onPointerDown={(e) => {
              setIsDraggingHue(true);
              (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
              handleHuePointer(e.clientX);
            }}
            onPointerMove={(e) => {
              if (isDraggingHue) {
                handleHuePointer(e.clientX);
              }
            }}
            onPointerUp={(e) => {
              setIsDraggingHue(false);
              try {
                (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
              } catch {
                // Ignore
              }
            }}
          >
            <div
              class={styles.hueThumb}
              style={{
                left: `${(h / 360) * 100}%`,
                backgroundColor: currentHueColor,
              }}
            />
          </div>

          {/* Bottom Controls: Hex Input & Eyedropper */}
          <div class={styles.bottomControls}>
            <div class={styles.hexInputWrapper}>
              <span class={styles.hexPrefix}>#</span>
              <input
                type="text"
                class={styles.hexInput}
                maxLength={6}
                value={draftHex}
                onInput={(e) => {
                  const inputVal = (e.target as HTMLInputElement).value;
                  setDraftHex(inputVal);
                  if (/^[0-9a-fA-F]{6}$/.test(inputVal)) {
                    handleHexCommit(inputVal);
                  }
                }}
                onBlur={() => handleHexCommit(draftHex)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleHexCommit(draftHex);
                    (e.currentTarget as HTMLInputElement).blur();
                  }
                }}
              />
            </div>

            {hasEyeDropper && (
              <button
                type="button"
                class={styles.eyedropperBtn}
                title="Pick color from screen"
                onClick={handleEyeDropper}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  width="14"
                  height="14"
                >
                  <path d="m14 7 3 3m-9 9-5 2 2-5L17.5 4.5a2.121 2.121 0 0 1 3 3L8 20z" />
                </svg>
              </button>
            )}
          </div>

          {/* Quick-Pick Presets */}
          {presets && presets.length > 0 && (
            <div class={styles.presetsRow}>
              {presets.map((preset) => {
                const isSelected = preset.toLowerCase() === currentColorHex;
                return (
                  <button
                    key={preset}
                    type="button"
                    class={`${styles.presetDot} ${isSelected ? styles.presetDotActive : ''}`}
                    style={{ backgroundColor: preset }}
                    title={preset}
                    onClick={() => {
                      handleHexCommit(preset);
                    }}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ColorPicker;
