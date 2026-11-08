import { useState, useRef, useEffect } from 'preact/hooks';
import { Toggle } from '@shared/components/Toggle';
import { FeatureRow } from '@shared/components/FeatureRow';
import { Stepper } from '@shared/components/Stepper';
import { ShortcutInput } from '@shared/components/ShortcutInput';
import { CollapsibleSubOption } from '@shared/components/CollapsibleSubOption';
import { saveSetting } from '@shared/storage';
import {
  preferredSpeed,
  snapPoints,
  hideSpeed,
  alwaysExpandWidget,
  enableHotkeys,
  volumeScrollEnabled,
  volumeScrollMouseStep,
  volumeScrollTrackpadStep,
  showVolumeBubble,
  volumeBubbleDelay,
  holdSpaceSpeedUp,
  holdSpaceSpeed,
  keySpeedUp,
  keySlowDown,
  keyReset,
  autoPauseOnHide,
  getReservedShortcutWarning,
  findConflictingShortcut,
} from '@popup/store';
import styles from './SpeedTab.module.css';

// Segmented 4-point slider interpolation math (exact port from popup.js)
function speedToSliderPercent(speed: number, points: number[]): number {
  const pts = points.length === 4 ? points : [1.0, 1.5, 2.0, 2.5];
  const s = speed;
  if (s <= pts[0]) return 0;
  if (s >= pts[3]) return 100;
  if (s <= pts[1]) {
    const span = pts[1] - pts[0];
    const frac = span > 0 ? (s - pts[0]) / span : 0;
    return frac * (100 / 3);
  }
  if (s <= pts[2]) {
    const span = pts[2] - pts[1];
    const frac = span > 0 ? (s - pts[1]) / span : 0;
    return 100 / 3 + frac * (100 / 3);
  }
  const span = pts[3] - pts[2];
  const frac = span > 0 ? (s - pts[2]) / span : 0;
  return 200 / 3 + frac * (100 / 3);
}

function sliderPercentToSpeed(pct: number, points: number[]): number {
  const pts = points.length === 4 ? points : [1.0, 1.5, 2.0, 2.5];
  const p = Math.max(0, Math.min(100, pct));
  if (p <= 0) return pts[0];
  if (p >= 100) return pts[3];
  if (p <= 100 / 3) {
    const frac = p / (100 / 3);
    return pts[0] + frac * (pts[1] - pts[0]);
  }
  if (p <= 200 / 3) {
    const frac = (p - 100 / 3) / (100 / 3);
    return pts[1] + frac * (pts[2] - pts[1]);
  }
  const frac = (p - 200 / 3) / (100 / 3);
  return pts[2] + frac * (pts[3] - pts[2]);
}

function sanitizeAndSortSnapPoints(raw: number[]): number[] {
  const vals = raw.map((v) => {
    let n = isNaN(v) ? 1.0 : v;
    if (n < 0.5) n = 0.5;
    if (n > 4.0) n = 4.0;
    return Math.round(n * 10) / 10;
  });

  vals.sort((a, b) => a - b);

  for (let i = 1; i < vals.length; i++) {
    if (vals[i] <= vals[i - 1]) {
      vals[i] = Math.min(4.0, Math.round((vals[i - 1] + 0.1) * 10) / 10);
    }
  }
  for (let i = vals.length - 2; i >= 0; i--) {
    if (vals[i] >= vals[i + 1]) {
      vals[i] = Math.max(0.5, Math.round((vals[i + 1] - 0.1) * 10) / 10);
    }
  }
  return vals;
}

type SpeedKeyType = 'keySpeedUp' | 'keySlowDown' | 'keyReset';

export function SpeedTab() {
  const [editorOpen, setEditorOpen] = useState(false);
  const [hotkeyNotice, setHotkeyNotice] = useState<string | null>(null);
  const noticeTimerRef = useRef<number | null>(null);
  const sliderRef = useRef<HTMLInputElement>(null);
  const speedValueRef = useRef<HTMLSpanElement>(null);
  const isDraggingRef = useRef(false);
  const draggedSpeedRef = useRef(preferredSpeed.value);

  const pts = snapPoints.value;
  const speed = preferredSpeed.value;
  const percent = speedToSliderPercent(speed, pts);

  useEffect(() => {
    if (sliderRef.current && !isDraggingRef.current) {
      sliderRef.current.style.setProperty('--percent', `${percent}%`);
    }
    if (speedValueRef.current && !isDraggingRef.current) {
      speedValueRef.current.textContent = `${speed.toFixed(1)}x`;
    }
    draggedSpeedRef.current = speed;
  }, [percent, speed]);

  const clearNoticeTimer = () => {
    if (noticeTimerRef.current) {
      clearTimeout(noticeTimerRef.current);
      noticeTimerRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      clearNoticeTimer();
    };
  }, []);

  const showHotkeyNotice = (message: string | null) => {
    clearNoticeTimer();
    setHotkeyNotice(message);
    if (message) {
      noticeTimerRef.current = window.setTimeout(() => {
        setHotkeyNotice(null);
        noticeTimerRef.current = null;
      }, 3600);
    }
  };

  const toggleEditor = () => {
    setEditorOpen((prev) => !prev);
  };

  const handleSliderInput = (e: Event) => {
    isDraggingRef.current = true;
    const target = e.target as HTMLInputElement;
    const pct = parseFloat(target.value) / 10;
    let val = sliderPercentToSpeed(pct, pts);

    // Magnetic snapping within ~1.8% of any snap point
    const snapPercents = [0, 100 / 3, 200 / 3, 100];
    for (let i = 0; i < snapPercents.length; i++) {
      if (Math.abs(pct - snapPercents[i]) <= 1.8) {
        val = pts[i];
        break;
      }
    }

    const actualPct = speedToSliderPercent(val, pts);
    target.style.setProperty('--percent', `${actualPct}%`);
    const rounded = Math.round(val * 10) / 10;
    draggedSpeedRef.current = rounded;
    if (speedValueRef.current) {
      speedValueRef.current.textContent = `${rounded.toFixed(1)}x`;
    }
  };

  const handleSliderChange = (e: Event) => {
    isDraggingRef.current = false;
    const target = e.target as HTMLInputElement;
    const pct = parseFloat(target.value) / 10;
    let val = sliderPercentToSpeed(pct, pts);

    const snapPercents = [0, 100 / 3, 200 / 3, 100];
    for (let i = 0; i < snapPercents.length; i++) {
      if (Math.abs(pct - snapPercents[i]) <= 1.8) {
        val = pts[i];
        break;
      }
    }

    const finalVal = Math.round(val * 10) / 10;
    preferredSpeed.value = finalVal;
    saveSetting('preferredSpeed', finalVal);
  };

  const resetSpeed = () => {
    preferredSpeed.value = 1.0;
    saveSetting('preferredSpeed', 1.0);
  };

  const handleSnapInputChange = (index: number, valStr: string) => {
    const parsed = parseFloat(valStr);
    if (isNaN(parsed)) return;
    const newPts = [...pts];
    newPts[index] = parsed;
    const sanitized = sanitizeAndSortSnapPoints(newPts);
    snapPoints.value = sanitized;
    saveSetting('snapPoints', sanitized);
  };

  const resetSnapDefaults = () => {
    const defaults = [1.0, 1.5, 2.0, 2.5];
    snapPoints.value = defaults;
    saveSetting('snapPoints', defaults);
  };

  const validateSpeedKey = (keyType: SpeedKeyType) => (candidateKey: string) => {
    const reservedWarning = getReservedShortcutWarning(candidateKey);
    if (reservedWarning) return reservedWarning;
    const conflict = findConflictingShortcut(keyType, candidateKey);
    if (conflict) return `"${candidateKey.toUpperCase()}" is already used by ${conflict}.`;
    return null;
  };

  const tickPositions = [0, 100 / 3, 200 / 3, 100];

  return (
    <div>
      {/* === 1. Speed Controls HUD Card === */}
      <section class={styles.hudSection}>
        <div class={styles.hudHeader}>
          <span class={styles.hudTitle}>Video Speed</span>
          <div class={styles.hudControlsGroup}>
            <button
              type="button"
              class={styles.resetSpeedBtn}
              onClick={resetSpeed}
              title="Reset speed to 1.0x"
              aria-label="Reset speed"
            >
              <svg
                class={styles.resetIcon}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
              </svg>
            </button>
            <button
              type="button"
              class={styles.settingsToggleBtn}
              onClick={toggleEditor}
              aria-expanded={editorOpen ? 'true' : 'false'}
              title="Customize Speed Snap Points"
              aria-label="Customize Speed Snap Points"
            >
              <svg
                class={styles.settingsIcon}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </button>
            <span ref={speedValueRef} class={styles.hudValue}>
              {speed.toFixed(1)}x
            </span>
          </div>
        </div>

        <div class={styles.sliderWrapper}>
          <input
            ref={sliderRef}
            type="range"
            min="0"
            max="1000"
            step="1"
            value={Math.round(percent * 10)}
            onInput={handleSliderInput}
            onChange={handleSliderChange}
            onPointerUp={() => {
              isDraggingRef.current = false;
            }}
            class={styles.speedSlider}
            aria-label="Playback Speed Slider"
          />
          <div class={styles.ticksRow}>
            {pts.map((pt, i) => (
              <span
                key={i}
                class={styles.tickLabel}
                style={{ left: `${tickPositions[i]}%` }}
                onClick={() => {
                  preferredSpeed.value = pt;
                  saveSetting('preferredSpeed', pt);
                }}
              >
                {pt.toFixed(1).replace(/\.0$/, '')}x
              </span>
            ))}
          </div>
        </div>

        {/* Snap Points Collapsible Editor with Smooth 2-way Animation */}
        <CollapsibleSubOption isOpen={editorOpen} variant="hud">
          <div class={styles.presetsEditorSection}>
            <div class={styles.presetEditorHeader}>
              <span class={styles.presetEditorTitle}>Edit Snap Points</span>
              <button
                type="button"
                class={styles.snapResetDefaultsBtn}
                onClick={resetSnapDefaults}
                title="Reset Snap Points to 1.0x, 1.5x, 2.0x, 2.5x"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="11"
                  height="11"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                </svg>
                Reset
              </button>
            </div>
            <div class={styles.presetsEditorGrid}>
              {pts.map((pt, i) => (
                <div key={i} class={styles.presetEditBox}>
                  <span class={styles.presetLabel}>Pt {i + 1}</span>
                  <div class={styles.snapInputWrapper}>
                    <input
                      type="number"
                      min="0.5"
                      max="4.0"
                      step="0.1"
                      value={pt.toFixed(1)}
                      class={styles.snapEditInput}
                      onChange={(e) =>
                        handleSnapInputChange(i, (e.target as HTMLInputElement).value)
                      }
                    />
                    <span class={styles.snapUnit}>x</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CollapsibleSubOption>

        {/* Integrated Speed Widget Footer Row & Sub-option */}
        <div class={styles.hudFooterRow}>
          <label
            class={styles.hudFooterTitle}
            onClick={() => {
              const nextHidden = !hideSpeed.value;
              hideSpeed.value = nextHidden;
              saveSetting('hideSpeed', nextHidden);
            }}
          >
            Show Speed Widget
          </label>
          <Toggle
            checked={!hideSpeed.value}
            onChange={(v) => {
              hideSpeed.value = !v;
              saveSetting('hideSpeed', !v);
            }}
            ariaLabel="Toggle Show Speed Widget"
          />
        </div>

        <CollapsibleSubOption isOpen={!hideSpeed.value} variant="hud">
          <div class={styles.hudSubRow}>
            <label
              class={styles.configLabel}
              style={{ cursor: 'pointer', userSelect: 'none' }}
              onClick={() => {
                alwaysExpandWidget.value = !alwaysExpandWidget.value;
                saveSetting('alwaysExpandWidget', alwaysExpandWidget.value);
              }}
            >
              Always Expand Speed Bar
            </label>
            <Toggle
              checked={alwaysExpandWidget.value}
              onChange={(v) => {
                alwaysExpandWidget.value = v;
                saveSetting('alwaysExpandWidget', v);
              }}
              ariaLabel="Toggle Always Expand Speed Bar"
            />
          </div>
        </CollapsibleSubOption>
      </section>

      {/* === 2. Extra Controls Card === */}
      <section class={styles.shortcutsSection}>
        <h2 class={styles.sectionTitle}>Extra Controls</h2>
        <div class={styles.settingsGroupCard}>
          <div class={styles.settingRowGroup}>
            <FeatureRow label="Speed Keyboard Shortcuts">
              <Toggle
                checked={enableHotkeys.value}
                onChange={(v) => {
                  enableHotkeys.value = v;
                  saveSetting('enableHotkeys', v);
                }}
                ariaLabel="Toggle Speed Keyboard Shortcuts"
              />
            </FeatureRow>
            <CollapsibleSubOption isOpen={enableHotkeys.value}>
              <div class={styles.hotkeysEditor}>
                <div class={styles.inputRow}>
                  <span class={styles.inputLabel}>Speed Up</span>
                  <ShortcutInput
                    value={keySpeedUp.value}
                    onChange={(v) => {
                      keySpeedUp.value = v;
                      saveSetting('keySpeedUp', v);
                    }}
                    validate={validateSpeedKey('keySpeedUp')}
                    onNotice={showHotkeyNotice}
                    title="Speed Up shortcut key (Backspace to clear, default: H)"
                    ariaLabel="Speed Up Hotkey"
                  />
                </div>
                <div class={styles.inputRow}>
                  <span class={styles.inputLabel}>Slow Down</span>
                  <ShortcutInput
                    value={keySlowDown.value}
                    onChange={(v) => {
                      keySlowDown.value = v;
                      saveSetting('keySlowDown', v);
                    }}
                    validate={validateSpeedKey('keySlowDown')}
                    onNotice={showHotkeyNotice}
                    title="Slow Down shortcut key (Backspace to clear, default: J)"
                    ariaLabel="Slow Down Hotkey"
                  />
                </div>
                <div class={styles.inputRow}>
                  <span class={styles.inputLabel}>Reset Speed</span>
                  <ShortcutInput
                    value={keyReset.value}
                    onChange={(v) => {
                      keyReset.value = v;
                      saveSetting('keyReset', v);
                    }}
                    validate={validateSpeedKey('keyReset')}
                    onNotice={showHotkeyNotice}
                    title="Reset Speed shortcut key (Backspace to clear, default: L)"
                    ariaLabel="Reset Speed Hotkey"
                  />
                </div>
              </div>
              {hotkeyNotice && (
                <div class={styles.hotkeyNotice} role="status" aria-live="polite">
                  {hotkeyNotice}
                </div>
              )}
            </CollapsibleSubOption>
          </div>

          <div class={styles.settingRowGroup}>
            <FeatureRow label="Hold Space to Speed Up">
              <Toggle
                checked={holdSpaceSpeedUp.value}
                onChange={(v) => {
                  holdSpaceSpeedUp.value = v;
                  saveSetting('holdSpaceSpeedUp', v);
                }}
                ariaLabel="Toggle Hold Space"
              />
            </FeatureRow>
            <CollapsibleSubOption isOpen={holdSpaceSpeedUp.value}>
              <div class={styles.featureConfigRow}>
                <span class={styles.configLabel}>Speed Up Rate</span>
                <Stepper
                  className={styles.stepperCard}
                  value={holdSpaceSpeed.value}
                  min={1.1}
                  max={4.0}
                  step={0.1}
                  unit="x"
                  onChange={(v) => {
                    holdSpaceSpeed.value = v;
                    saveSetting('holdSpaceSpeed', v);
                  }}
                />
              </div>
            </CollapsibleSubOption>
          </div>

          <FeatureRow label="Auto-pause on Tab Switch">
            <Toggle
              checked={autoPauseOnHide.value}
              onChange={(v) => {
                autoPauseOnHide.value = v;
                saveSetting('autoPauseOnHide', v);
              }}
              ariaLabel="Toggle Auto-pause on Tab Switch"
            />
          </FeatureRow>
        </div>
      </section>

      {/* === 3. Volume Scroll Card === */}
      <section class={styles.shortcutsSection}>
        <h2 class={styles.sectionTitle}>Volume Scroll</h2>
        <div class={styles.settingsGroupCard}>
          <div class={styles.settingRowGroup}>
            <FeatureRow label="Scroll to Adjust Volume">
              <Toggle
                checked={volumeScrollEnabled.value}
                onChange={(v) => {
                  volumeScrollEnabled.value = v;
                  saveSetting('volumeScrollEnabled', v);
                }}
                ariaLabel="Toggle Scroll to Adjust Volume"
              />
            </FeatureRow>
            <CollapsibleSubOption isOpen={volumeScrollEnabled.value}>
              <div class={styles.featureConfigRow}>
                <span class={styles.configLabel}>Mouse Sensy</span>
                <Stepper
                  className={styles.stepperCard}
                  value={volumeScrollMouseStep.value}
                  min={1}
                  max={30}
                  step={1}
                  unit=""
                  onChange={(v) => {
                    const clamped = Math.max(1, Math.min(30, Math.round(v)));
                    volumeScrollMouseStep.value = clamped;
                    saveSetting('volumeScrollMouseStep', clamped);
                  }}
                />
              </div>
              <div class={styles.featureConfigRow}>
                <span class={styles.configLabel}>Trackpad Sensy</span>
                <Stepper
                  className={styles.stepperCard}
                  value={volumeScrollTrackpadStep.value}
                  min={1}
                  max={10}
                  step={1}
                  unit=""
                  onChange={(v) => {
                    const clamped = Math.max(1, Math.min(10, Math.round(v)));
                    volumeScrollTrackpadStep.value = clamped;
                    saveSetting('volumeScrollTrackpadStep', clamped);
                  }}
                />
              </div>
              <div class={styles.featureConfigRow}>
                <label
                  class={styles.configLabel}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                  onClick={() => {
                    showVolumeBubble.value = !showVolumeBubble.value;
                    saveSetting('showVolumeBubble', showVolumeBubble.value);
                  }}
                >
                  Show Volume Bubble
                </label>
                <Toggle
                  checked={showVolumeBubble.value}
                  onChange={(v) => {
                    showVolumeBubble.value = v;
                    saveSetting('showVolumeBubble', v);
                  }}
                  ariaLabel="Toggle Show Volume Bubble"
                />
              </div>
              <CollapsibleSubOption isOpen={showVolumeBubble.value}>
                <div class={styles.featureConfigRow}>
                  <span class={styles.configLabel}>Disappear Delay</span>
                  <Stepper
                    className={styles.stepperCard}
                    value={volumeBubbleDelay.value}
                    min={0.2}
                    max={2.0}
                    step={0.1}
                    unit="s"
                    onChange={(v) => {
                      const clamped = Math.round(v * 10) / 10;
                      volumeBubbleDelay.value = clamped;
                      saveSetting('volumeBubbleDelay', clamped);
                    }}
                  />
                </div>
              </CollapsibleSubOption>
            </CollapsibleSubOption>
          </div>
        </div>
      </section>
    </div>
  );
}
