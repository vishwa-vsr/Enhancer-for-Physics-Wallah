import { ComponentChildren } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';
import styles from './DatePicker.module.css';

interface DatePickerProps {
  value?: string; // Stored in YYYY-MM-DD format
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  inline?: boolean;
  renderTrigger?: (props: {
    isOpen: boolean;
    toggle: () => void;
    formattedDate: string;
    clear: (e?: Event) => void;
  }) => ComponentChildren;
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const MONTH_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const WEEK_DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function formatIsoToDisplay(iso?: string): string {
  if (!iso) return '';
  const parts = iso.split('-');
  if (parts.length === 3) {
    const [y, m, d] = parts;
    return `${d.padStart(2, '0')}-${m.padStart(2, '0')}-${y}`;
  }
  return iso;
}

function padZero(num: number): string {
  return num < 10 ? `0${num}` : `${num}`;
}

function toIsoString(year: number, month: number, day: number): string {
  return `${year}-${padZero(month + 1)}-${padZero(day)}`;
}

export const DatePicker = ({
  value = '',
  onChange,
  placeholder = 'dd-mm-yyyy',
  disabled = false,
  inline = false,
  renderTrigger,
}: DatePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [placement, setPlacement] = useState<'top' | 'bottom'>('top');
  const [horizontalAlign, setHorizontalAlign] = useState<'left' | 'right'>('left');
  const [view, setView] = useState<'day' | 'month' | 'year'>('day');

  // Parse initial selected date or default to today
  const today = new Date();
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth();
  const todayDate = today.getDate();
  const todayIso = toIsoString(todayYear, todayMonth, todayDate);

  let parsedYear = todayYear;
  let parsedMonth = todayMonth;

  if (value) {
    const parts = value.split('-');
    if (parts.length === 3) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      if (!isNaN(y) && !isNaN(m)) {
        parsedYear = y;
        parsedMonth = m;
      }
    }
  }

  const [viewYear, setViewYear] = useState<number>(parsedYear);
  const [viewMonth, setViewMonth] = useState<number>(parsedMonth);

  const containerRef = useRef<HTMLDivElement>(null);

  // Sync view when opened or when value changes
  useEffect(() => {
    if (value) {
      const parts = value.split('-');
      if (parts.length === 3) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        if (!isNaN(y) && !isNaN(m)) {
          setViewYear(y);
          setViewMonth(m);
        }
      }
    }
  }, [value, isOpen]);

  // Compute smart placement (open upwards if near bottom of screen) and horizontal alignment
  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      // If space below is less than 320px and there is room above, flip up
      if (spaceBelow < 320 && spaceAbove > spaceBelow) {
        setPlacement('top');
      } else {
        setPlacement('bottom');
      }

      // Check if popup would extend past the right edge of viewport
      if (rect.left + 295 > window.innerWidth) {
        setHorizontalAlign('right');
      } else {
        setHorizontalAlign('left');
      }
    }
  }, [isOpen]);

  // Handle clicking outside to close
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setView('day');
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setView('day');
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const toggleOpen = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
    setView('day');
  };

  const handleClear = (e?: Event) => {
    e?.stopPropagation();
    onChange('');
    setIsOpen(false);
    setView('day');
  };

  const handleToday = (e: Event) => {
    e.stopPropagation();
    onChange(todayIso);
    setViewYear(todayYear);
    setViewMonth(todayMonth);
    setIsOpen(false);
    setView('day');
  };

  const handlePrev = (e: Event) => {
    e.stopPropagation();
    if (view === 'day') {
      if (viewMonth === 0) {
        setViewMonth(11);
        setViewYear(viewYear - 1);
      } else {
        setViewMonth(viewMonth - 1);
      }
    } else if (view === 'month') {
      setViewYear(viewYear - 1);
    } else if (view === 'year') {
      setViewYear(viewYear - 12);
    }
  };

  const handleNext = (e: Event) => {
    e.stopPropagation();
    if (view === 'day') {
      if (viewMonth === 11) {
        setViewMonth(0);
        setViewYear(viewYear + 1);
      } else {
        setViewMonth(viewMonth + 1);
      }
    } else if (view === 'month') {
      setViewYear(viewYear + 1);
    } else if (view === 'year') {
      setViewYear(viewYear + 12);
    }
  };

  const handleTitleClick = (e: Event) => {
    e.stopPropagation();
    if (view === 'day') setView('month');
    else if (view === 'month') setView('year');
    else setView('day');
  };

  // Generate calendar day cells
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  const calendarDays: Array<{
    dayNumber: number;
    monthOffset: -1 | 0 | 1;
    iso: string;
    isCurrentMonth: boolean;
    isToday: boolean;
    isSelected: boolean;
  }> = [];

  // 1. Previous month trailing days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const prevMonthIdx = viewMonth === 0 ? 11 : viewMonth - 1;
    const prevYear = viewMonth === 0 ? viewYear - 1 : viewYear;
    const iso = toIsoString(prevYear, prevMonthIdx, day);
    calendarDays.push({
      dayNumber: day,
      monthOffset: -1,
      iso,
      isCurrentMonth: false,
      isToday: iso === todayIso,
      isSelected: iso === value,
    });
  }

  // 2. Current month days
  for (let d = 1; d <= daysInCurrentMonth; d++) {
    const iso = toIsoString(viewYear, viewMonth, d);
    calendarDays.push({
      dayNumber: d,
      monthOffset: 0,
      iso,
      isCurrentMonth: true,
      isToday: iso === todayIso,
      isSelected: iso === value,
    });
  }

  // 3. Next month leading days (use 35 cells if it fits in 5 rows, else 42)
  const totalSlots = calendarDays.length > 35 ? 42 : 35;
  const remainingCells = totalSlots - calendarDays.length;
  for (let d = 1; d <= remainingCells; d++) {
    const nextMonthIdx = viewMonth === 11 ? 0 : viewMonth + 1;
    const nextYear = viewMonth === 11 ? viewYear + 1 : viewYear;
    const iso = toIsoString(nextYear, nextMonthIdx, d);
    calendarDays.push({
      dayNumber: d,
      monthOffset: 1,
      iso,
      isCurrentMonth: false,
      isToday: iso === todayIso,
      isSelected: iso === value,
    });
  }

  // Year range for 'year' view
  const yearStart = Math.floor(viewYear / 12) * 12;
  const yearsList = Array.from({ length: 12 }, (_, i) => yearStart + i);

  return (
    <div
      class={`${styles.datePickerContainer} ${inline ? styles.inlineContainer : ''}`}
      ref={containerRef}
    >
      {renderTrigger ? (
        renderTrigger({
          isOpen,
          toggle: toggleOpen,
          formattedDate: formatIsoToDisplay(value),
          clear: handleClear,
        })
      ) : (
        /* Input Control Box */
        <div class={styles.inputControl} onClick={toggleOpen}>
          <input
            type="text"
            class={styles.input}
            placeholder={placeholder}
            value={formatIsoToDisplay(value)}
            readOnly
            disabled={disabled}
          />

          <div class={styles.iconControls}>
            {value && !disabled && (
              <button
                type="button"
                class={`${styles.iconBtn} ${styles.clearIconBtn}`}
                onClick={handleClear}
                title="Clear date"
                aria-label="Clear date"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  width="15"
                  height="15"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}

            <button
              type="button"
              class={styles.iconBtn}
              onClick={(e) => {
                e.stopPropagation();
                toggleOpen();
              }}
              disabled={disabled}
              title="Open calendar"
              aria-label="Open calendar"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                width="16"
                height="16"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Floating Calendar Popup */}
      {isOpen && (
        <div
          class={`${styles.popup} ${
            placement === 'top' ? styles.popupTop : styles.popupBottom
          } ${
            horizontalAlign === 'right' ? styles.popupAlignRight : styles.popupAlignLeft
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div class={styles.header}>
            <button type="button" class={styles.viewTitleBtn} onClick={handleTitleClick}>
              <span>
                {view === 'day' && `${MONTH_NAMES[viewMonth]}, ${viewYear}`}
                {view === 'month' && `${viewYear}`}
                {view === 'year' && `${yearStart} - ${yearStart + 11}`}
              </span>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                width="13"
                height="13"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            <div class={styles.navGroup}>
              <button
                type="button"
                class={styles.navBtn}
                onClick={handlePrev}
                aria-label="Previous"
                title="Previous"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  width="16"
                  height="16"
                >
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>

              <button
                type="button"
                class={styles.navBtn}
                onClick={handleNext}
                aria-label="Next"
                title="Next"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  width="16"
                  height="16"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          </div>

          {/* 1. Day View */}
          {view === 'day' && (
            <>
              {/* Day of Week Labels */}
              <div class={styles.weekdaysGrid}>
                {WEEK_DAYS.map((d) => (
                  <span key={d} class={styles.weekdayLabel}>
                    {d}
                  </span>
                ))}
              </div>

              {/* Day Cells Grid */}
              <div class={styles.daysGrid}>
                {calendarDays.map((cell) => {
                  let cellClasses = styles.dayCell;
                  if (!cell.isCurrentMonth) cellClasses += ` ${styles.dayOtherMonth}`;
                  if (cell.isToday) cellClasses += ` ${styles.dayToday}`;
                  if (cell.isSelected) cellClasses += ` ${styles.daySelected}`;

                  return (
                    <button
                      key={cell.iso}
                      type="button"
                      class={cellClasses}
                      onClick={(e) => {
                        e.stopPropagation();
                        onChange(cell.iso);
                        setIsOpen(false);
                      }}
                    >
                      <span class={styles.dayText}>{cell.dayNumber}</span>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* 2. Month View */}
          {view === 'month' && (
            <div class={styles.selectionGrid}>
              {MONTH_SHORT.map((name, idx) => (
                <button
                  key={name}
                  type="button"
                  class={`${styles.gridItemBtn} ${
                    Boolean(value) && idx === parsedMonth && viewYear === parsedYear
                      ? styles.gridItemSelected
                      : ''
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setViewMonth(idx);
                    setView('day');
                  }}
                >
                  <span class={styles.dayText}>{name}</span>
                </button>
              ))}
            </div>
          )}

          {/* 3. Year View */}
          {view === 'year' && (
            <div class={styles.selectionGrid}>
              {yearsList.map((y) => (
                <button
                  key={y}
                  type="button"
                  class={`${styles.gridItemBtn} ${
                    Boolean(value) && y === parsedYear ? styles.gridItemSelected : ''
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setViewYear(y);
                    setView('month');
                  }}
                >
                  <span class={styles.dayText}>{y}</span>
                </button>
              ))}
            </div>
          )}

          {/* Footer Shortcuts */}
          <div class={styles.footer}>
            <button
              type="button"
              class={`${styles.footerBtn} ${styles.clearFooterBtn}`}
              onClick={handleClear}
            >
              Clear
            </button>
            <button
              type="button"
              class={`${styles.footerBtn} ${styles.todayFooterBtn}`}
              onClick={handleToday}
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
