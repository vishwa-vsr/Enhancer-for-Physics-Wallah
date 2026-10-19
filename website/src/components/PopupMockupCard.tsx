import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface PopupMockupCardProps {
  slug: string;
  activeRowIdx?: number;
  onHoverRow?: (idx: number | null) => void;
}

// 100% Accurate Interactive Toggle Switch matching src/shared/components/Toggle.module.css & tokens.css
const InteractiveToggle: React.FC<{ initialChecked?: boolean }> = ({ initialChecked = true }) => {
  const [checked, setChecked] = useState(initialChecked);

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={(e) => {
        e.stopPropagation();
        setChecked(!checked);
      }}
      className="relative inline-flex items-center flex-shrink-0 cursor-pointer select-none transition-colors focus:outline-none"
      style={{
        width: '42px',
        height: '24px',
        borderRadius: '9999px',
        backgroundColor: checked ? '#6c63ff' : '#2c3444',
      }}
    >
      <div
        className="rounded-full bg-white shadow-sm transition-transform duration-200 ease-out"
        style={{
          width: '18px',
          height: '18px',
          marginLeft: '3px',
          transform: checked ? 'translateX(18px)' : 'translateX(0)',
        }}
      />
    </button>
  );
};

// 100% Accurate Interactive Stepper matching Image 4 (purple speed text)
const InteractiveStepper: React.FC<{ initialValue?: number; step?: number; min?: number; max?: number }> = ({
  initialValue = 2.5,
  step = 0.1,
  min = 1.0,
  max = 6.0,
}) => {
  const [val, setVal] = useState(initialValue);

  const handleMinus = (e: React.MouseEvent) => {
    e.stopPropagation();
    setVal((prev) => Math.max(min, Math.round((prev - step) * 10) / 10));
  };

  const handlePlus = (e: React.MouseEvent) => {
    e.stopPropagation();
    setVal((prev) => Math.min(max, Math.round((prev + step) * 10) / 10));
  };

  return (
    <div
      className="inline-flex items-center gap-2 select-none px-3 py-1.5"
      style={{
        backgroundColor: '#232a37',
        borderRadius: '8px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      <button
        type="button"
        onClick={handleMinus}
        className="flex items-center justify-center font-bold hover:text-white transition-colors focus:outline-none cursor-pointer"
        style={{ width: '20px', height: '20px', color: '#8e9bb0', fontSize: '16px' }}
      >
        −
      </button>
      <span
        className="font-mono font-semibold select-none"
        style={{ color: '#9b95ff', fontSize: '13.5px', minWidth: '36px', textAlign: 'center' }}
      >
        {val.toFixed(1)}x
      </span>
      <button
        type="button"
        onClick={handlePlus}
        className="flex items-center justify-center font-bold hover:text-white transition-colors focus:outline-none cursor-pointer"
        style={{ width: '20px', height: '20px', color: '#8e9bb0', fontSize: '16px' }}
      >
        +
      </button>
    </div>
  );
};

// 100% Accurate Floating SelectDropdown matching Image 2 & SelectDropdown.tsx
const InteractiveDropdown: React.FC<{
  options: { value: string; label: string }[];
  initialValue: string;
}> = ({ options, initialValue }) => {
  const [selected, setSelected] = useState(initialValue);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('pointerdown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('pointerdown', handleOutsideClick);
    };
  }, [isOpen]);

  const currentLabel = options.find((o) => o.value === selected)?.label || selected;

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="inline-flex items-center justify-between gap-2.5 px-3.5 py-1.5 select-none transition-all hover:brightness-105 focus:outline-none cursor-pointer"
        style={{
          backgroundColor: '#232a37',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          color: '#f8fafc',
          fontSize: '13px',
          fontWeight: 500,
        }}
      >
        <span>{currentLabel}</span>
        <ChevronDown
          className="transition-transform duration-200"
          style={{
            width: '14px',
            height: '14px',
            color: '#8e9bb0',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        />
      </button>

      {/* Floating Menu Popover (overflow-visible, high z-index) */}
      {isOpen && (
        <div
          className="absolute right-0 top-full mt-1.5 w-48 rounded-xl z-[999] p-1.5 flex flex-col gap-0.5 border shadow-2xl"
          style={{
            backgroundColor: '#191e28',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.65), 0 2px 6px rgba(0, 0, 0, 0.4)',
          }}
        >
          {options.map((opt) => {
            const isSelected = opt.value === selected;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelected(opt.value);
                  setIsOpen(false);
                }}
                className="flex items-center justify-between w-full px-2.5 py-2 rounded-lg text-left text-xs transition-colors cursor-pointer"
                style={{
                  backgroundColor: isSelected ? 'rgba(108, 99, 255, 0.15)' : 'transparent',
                  color: isSelected ? '#6c63ff' : '#f8fafc',
                  fontWeight: isSelected ? 600 : 400,
                }}
              >
                <span>{opt.label}</span>
                {isSelected && <Check style={{ width: '14px', height: '14px', color: '#6c63ff' }} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

// 100% Accurate Hotkey Input matching src/popup/features/speed/SpeedTab.module.css
const StaticHotkeyInput: React.FC<{ value: string }> = ({ value }) => (
  <div
    className="px-3.5 py-1.5 select-none font-mono text-center font-semibold"
    style={{
      backgroundColor: '#232a37',
      color: '#9b95ff',
      borderRadius: '8px',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      fontSize: '13px',
      minWidth: '36px',
    }}
  >
    {value}
  </div>
);

const VIDEO_QUALITY_OPTIONS = [
  { value: '720p', label: '720p (High)' },
  { value: '480p', label: '480p (Standard)' },
  { value: '360p', label: '360p (Medium)' },
  { value: '240p', label: '240p (Data Saver)' },
  { value: 'auto', label: 'Auto (PW Default)' },
];

const FINISH_TIME_FORMAT_OPTIONS = [
  { value: 'minimal', label: 'Minimal (Time Only)' },
  { value: 'clock', label: 'Clock with Label' },
  { value: 'full', label: 'Full (Clock + Left)' },
];

export const PopupMockupCard: React.FC<PopupMockupCardProps> = ({ slug, activeRowIdx, onHoverRow }) => {
  const getRowStyle = (idx: number, isFirst: boolean, isLast: boolean) => {
    const isHighlighted = activeRowIdx === idx;
    return {
      borderBottom: isLast ? 'none' : '1px solid rgba(255, 255, 255, 0.05)',
      backgroundColor: isHighlighted ? 'rgba(108, 99, 255, 0.15)' : 'transparent',
      boxShadow: isHighlighted ? 'inset 3px 0 0 #6c63ff' : 'none',
      borderTopLeftRadius: isFirst ? '16px' : '0',
      borderTopRightRadius: isFirst ? '16px' : '0',
      borderBottomLeftRadius: isLast ? '16px' : '0',
      borderBottomRightRadius: isLast ? '16px' : '0',
      transition: 'background-color 0.2s, box-shadow 0.2s',
    };
  };

  const renderCard = () => {
    switch (slug) {
      case 'skip-silence':
        return (
          <div className="w-full max-w-[440px] select-none font-sans">
            <h3
              className="uppercase tracking-wider font-bold mb-2 pl-1"
              style={{ color: '#8e9bb0', fontSize: '12px', letterSpacing: '0.06em' }}
            >
              Skip Silence
            </h3>
            <div
              className="flex flex-col relative"
              style={{
                backgroundColor: '#191e28',
                borderRadius: '16px',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.04)',
              }}
            >
              {/* Row 0: Enable Skip Silence */}
              <div
                data-row-index={0}
                onMouseEnter={() => onHoverRow?.(0)}
                onMouseLeave={() => onHoverRow?.(null)}
                className="flex items-center justify-between px-4 py-3.5 cursor-pointer"
                style={getRowStyle(0, true, false)}
              >
                <div>
                  <div style={{ color: '#f8fafc', fontSize: '14px', fontWeight: 500 }}>
                    Enable Skip Silence
                  </div>
                </div>
                <InteractiveToggle initialChecked={true} />
              </div>

              {/* Row 1: Hide Skip Silence Icon */}
              <div
                data-row-index={1}
                onMouseEnter={() => onHoverRow?.(1)}
                onMouseLeave={() => onHoverRow?.(null)}
                className="flex items-center justify-between px-4 py-3.5 cursor-pointer"
                style={getRowStyle(1, false, false)}
              >
                <div>
                  <div style={{ color: '#f8fafc', fontSize: '14px', fontWeight: 500 }}>
                    Hide Skip Silence Icon
                  </div>
                </div>
                <InteractiveToggle initialChecked={false} />
              </div>

              {/* Row 2: Silence Speed */}
              <div
                data-row-index={2}
                onMouseEnter={() => onHoverRow?.(2)}
                onMouseLeave={() => onHoverRow?.(null)}
                className="flex items-center justify-between px-4 py-3.5 cursor-pointer"
                style={getRowStyle(2, false, false)}
              >
                <div>
                  <div style={{ color: '#f8fafc', fontSize: '14px', fontWeight: 500 }}>
                    Silence Speed
                  </div>
                </div>
                <InteractiveStepper initialValue={2.5} />
              </div>

              {/* Row 3: Auto Noise Calibration */}
              <div
                data-row-index={3}
                onMouseEnter={() => onHoverRow?.(3)}
                onMouseLeave={() => onHoverRow?.(null)}
                className="flex items-center justify-between px-4 py-3.5 cursor-pointer"
                style={getRowStyle(3, false, true)}
              >
                <div>
                  <div style={{ color: '#f8fafc', fontSize: '14px', fontWeight: 500 }}>
                    Auto Noise Calibration
                  </div>
                </div>
                <InteractiveToggle initialChecked={true} />
              </div>
            </div>
          </div>
        );

      case 'constant-720p-hd':
        return (
          <div className="w-full max-w-[440px] select-none font-sans">
            <h3
              className="uppercase tracking-wider font-bold mb-2 pl-1"
              style={{ color: '#8e9bb0', fontSize: '12px', letterSpacing: '0.06em' }}
            >
              Video Quality
            </h3>
            <div
              className="flex flex-col relative"
              style={{
                backgroundColor: '#191e28',
                borderRadius: '16px',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.04)',
              }}
            >
              {/* Row 0: Constant Video Quality */}
              <div
                data-row-index={0}
                onMouseEnter={() => onHoverRow?.(0)}
                onMouseLeave={() => onHoverRow?.(null)}
                className="flex items-center justify-between px-4 py-3.5 cursor-pointer"
                style={getRowStyle(0, true, false)}
              >
                <div>
                  <div style={{ color: '#f8fafc', fontSize: '14px', fontWeight: 500 }}>
                    Constant Video Quality
                  </div>
                </div>
                <InteractiveToggle initialChecked={true} />
              </div>

              {/* Row 1: Default Video Quality */}
              <div
                data-row-index={1}
                onMouseEnter={() => onHoverRow?.(1)}
                onMouseLeave={() => onHoverRow?.(null)}
                className="flex items-center justify-between px-4 py-3.5 cursor-pointer"
                style={getRowStyle(1, false, false)}
              >
                <div>
                  <div style={{ color: '#f8fafc', fontSize: '14px', fontWeight: 500 }}>
                    Default Video Quality
                  </div>
                </div>
                <InteractiveDropdown options={VIDEO_QUALITY_OPTIONS} initialValue="720p" />
              </div>

              {/* Row 2: Hide Quality Widget */}
              <div
                data-row-index={2}
                onMouseEnter={() => onHoverRow?.(2)}
                onMouseLeave={() => onHoverRow?.(null)}
                className="flex items-center justify-between px-4 py-3.5 cursor-pointer"
                style={getRowStyle(2, false, true)}
              >
                <div>
                  <div style={{ color: '#f8fafc', fontSize: '14px', fontWeight: 500 }}>
                    Hide Quality Widget
                  </div>
                </div>
                <InteractiveToggle initialChecked={true} />
              </div>
            </div>
          </div>
        );

      case 'keyboard-shortcuts':
        return (
          <div className="w-full max-w-[440px] select-none font-sans">
            <h3
              className="uppercase tracking-wider font-bold mb-2 pl-1"
              style={{ color: '#8e9bb0', fontSize: '12px', letterSpacing: '0.06em' }}
            >
              Extra Controls
            </h3>
            <div
              className="flex flex-col relative"
              style={{
                backgroundColor: '#191e28',
                borderRadius: '16px',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.04)',
              }}
            >
              {/* Row 0: Enable Keyboard Hotkeys */}
              <div
                data-row-index={0}
                onMouseEnter={() => onHoverRow?.(0)}
                onMouseLeave={() => onHoverRow?.(null)}
                className="flex items-center justify-between px-4 py-3.5 cursor-pointer"
                style={getRowStyle(0, true, false)}
              >
                <div>
                  <div style={{ color: '#f8fafc', fontSize: '14px', fontWeight: 500 }}>
                    Enable Keyboard Hotkeys
                  </div>
                </div>
                <InteractiveToggle initialChecked={true} />
              </div>

              {/* Row 1: Speed Up Key */}
              <div
                data-row-index={1}
                onMouseEnter={() => onHoverRow?.(1)}
                onMouseLeave={() => onHoverRow?.(null)}
                className="flex items-center justify-between px-4 py-3 cursor-pointer"
                style={getRowStyle(1, false, false)}
              >
                <div>
                  <div style={{ color: '#8e9bb0', fontSize: '13px' }}>Speed Up</div>
                </div>
                <StaticHotkeyInput value="H" />
              </div>

              {/* Row 2: Slow Down Key */}
              <div
                data-row-index={2}
                onMouseEnter={() => onHoverRow?.(2)}
                onMouseLeave={() => onHoverRow?.(null)}
                className="flex items-center justify-between px-4 py-3 cursor-pointer"
                style={getRowStyle(2, false, false)}
              >
                <div>
                  <div style={{ color: '#8e9bb0', fontSize: '13px' }}>Slow Down</div>
                </div>
                <StaticHotkeyInput value="J" />
              </div>

              {/* Row 3: Reset Speed */}
              <div
                data-row-index={3}
                onMouseEnter={() => onHoverRow?.(3)}
                onMouseLeave={() => onHoverRow?.(null)}
                className="flex items-center justify-between px-4 py-3 cursor-pointer"
                style={getRowStyle(3, false, true)}
              >
                <div>
                  <div style={{ color: '#8e9bb0', fontSize: '13px' }}>Reset Speed</div>
                </div>
                <StaticHotkeyInput value="L" />
              </div>
            </div>
          </div>
        );

      case 'focus-mode':
        return (
          <div className="w-full max-w-[440px] select-none font-sans">
            <h3
              className="uppercase tracking-wider font-bold mb-2 pl-1"
              style={{ color: '#8e9bb0', fontSize: '12px', letterSpacing: '0.06em' }}
            >
              On-Screen Toggles
            </h3>
            <div
              className="flex flex-col relative"
              style={{
                backgroundColor: '#191e28',
                borderRadius: '16px',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.04)',
              }}
            >
              {/* Row 0: Hide Live Chat */}
              <div
                data-row-index={0}
                onMouseEnter={() => onHoverRow?.(0)}
                onMouseLeave={() => onHoverRow?.(null)}
                className="flex items-center justify-between px-4 py-3.5 cursor-pointer"
                style={getRowStyle(0, true, false)}
              >
                <div>
                  <div style={{ color: '#f8fafc', fontSize: '14px', fontWeight: 500 }}>
                    Hide Live Chat
                  </div>
                </div>
                <InteractiveToggle initialChecked={true} />
              </div>

              {/* Row 1: Hide Doubt Box */}
              <div
                data-row-index={1}
                onMouseEnter={() => onHoverRow?.(1)}
                onMouseLeave={() => onHoverRow?.(null)}
                className="flex items-center justify-between px-4 py-3.5 cursor-pointer"
                style={getRowStyle(1, false, false)}
              >
                <div>
                  <div style={{ color: '#f8fafc', fontSize: '14px', fontWeight: 500 }}>
                    Hide Doubt Box
                  </div>
                </div>
                <InteractiveToggle initialChecked={true} />
              </div>

              {/* Row 2: Hide Ask AI */}
              <div
                data-row-index={2}
                onMouseEnter={() => onHoverRow?.(2)}
                onMouseLeave={() => onHoverRow?.(null)}
                className="flex items-center justify-between px-4 py-3.5 cursor-pointer"
                style={getRowStyle(2, false, false)}
              >
                <div>
                  <div style={{ color: '#f8fafc', fontSize: '14px', fontWeight: 500 }}>
                    Hide Ask AI
                  </div>
                </div>
                <InteractiveToggle initialChecked={true} />
              </div>

              {/* Row 3: Hide Notes Icon */}
              <div
                data-row-index={3}
                onMouseEnter={() => onHoverRow?.(3)}
                onMouseLeave={() => onHoverRow?.(null)}
                className="flex items-center justify-between px-4 py-3.5 cursor-pointer"
                style={getRowStyle(3, false, true)}
              >
                <div>
                  <div style={{ color: '#f8fafc', fontSize: '14px', fontWeight: 500 }}>
                    Hide Notes
                  </div>
                </div>
                <InteractiveToggle initialChecked={true} />
              </div>
            </div>
          </div>
        );

      case 'finish-clock':
        return (
          <div className="w-full max-w-[440px] select-none font-sans">
            <h3
              className="uppercase tracking-wider font-bold mb-2 pl-1"
              style={{ color: '#8e9bb0', fontSize: '12px', letterSpacing: '0.06em' }}
            >
              Finish Time
            </h3>
            <div
              className="flex flex-col relative"
              style={{
                backgroundColor: '#191e28',
                borderRadius: '16px',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.04)',
              }}
            >
              {/* Row 0: Show Finish Time */}
              <div
                data-row-index={0}
                onMouseEnter={() => onHoverRow?.(0)}
                onMouseLeave={() => onHoverRow?.(null)}
                className="flex items-center justify-between px-4 py-3.5 cursor-pointer"
                style={getRowStyle(0, true, false)}
              >
                <div>
                  <div style={{ color: '#f8fafc', fontSize: '14px', fontWeight: 500 }}>
                    Show Finish Time
                  </div>
                  <div style={{ color: '#8e9bb0', fontSize: '12px', marginTop: '2px' }}>
                    Calculates wall-clock completion
                  </div>
                </div>
                <InteractiveToggle initialChecked={true} />
              </div>

              {/* Row 1: Format */}
              <div
                data-row-index={1}
                onMouseEnter={() => onHoverRow?.(1)}
                onMouseLeave={() => onHoverRow?.(null)}
                className="flex items-center justify-between px-4 py-3.5 cursor-pointer"
                style={getRowStyle(1, false, true)}
              >
                <div>
                  <div style={{ color: '#f8fafc', fontSize: '14px', fontWeight: 500 }}>
                    Finish Time Format
                  </div>
                </div>
                <InteractiveDropdown options={FINISH_TIME_FORMAT_OPTIONS} initialValue="clock" />
              </div>
            </div>
          </div>
        );

      case 'smart-tab-auto-pause':
        return (
          <div className="w-full max-w-[440px] select-none font-sans">
            <h3
              className="uppercase tracking-wider font-bold mb-2 pl-1"
              style={{ color: '#8e9bb0', fontSize: '12px', letterSpacing: '0.06em' }}
            >
              Extra Controls
            </h3>
            <div
              className="flex flex-col relative"
              style={{
                backgroundColor: '#191e28',
                borderRadius: '16px',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.04)',
              }}
            >
              {/* Row 0: Auto-pause on Tab Switch */}
              <div
                data-row-index={0}
                onMouseEnter={() => onHoverRow?.(0)}
                onMouseLeave={() => onHoverRow?.(null)}
                className="flex items-center justify-between px-4 py-3.5 cursor-pointer"
                style={getRowStyle(0, true, false)}
              >
                <div>
                  <div style={{ color: '#f8fafc', fontSize: '14px', fontWeight: 500 }}>
                    Auto-pause on Tab Switch
                  </div>
                </div>
                <InteractiveToggle initialChecked={true} />
              </div>

              {/* Row 1: Disable Scroll Wheel Adjust */}
              <div
                data-row-index={1}
                onMouseEnter={() => onHoverRow?.(1)}
                onMouseLeave={() => onHoverRow?.(null)}
                className="flex items-center justify-between px-4 py-3.5 cursor-pointer"
                style={getRowStyle(1, false, true)}
              >
                <div>
                  <div style={{ color: '#f8fafc', fontSize: '14px', fontWeight: 500 }}>
                    Disable Scroll Wheel Adjust
                  </div>
                </div>
                <InteractiveToggle initialChecked={false} />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return <div className="my-2 overflow-visible">{renderCard()}</div>;
};
