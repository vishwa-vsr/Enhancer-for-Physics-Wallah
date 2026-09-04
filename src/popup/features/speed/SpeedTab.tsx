import { useState, useRef, useEffect } from 'preact/hooks';
import { Toggle } from '@shared/components/Toggle';
import { FeatureRow } from '@shared/components/FeatureRow';
import { Stepper } from '@shared/components/Stepper';
import { saveSetting } from '@shared/storage';
import {
  preferredSpeed, constantVideoQuality, preferredQuality, snapPoints, hideSpeed, hideQuality, alwaysExpandWidget,
  showFinishTime, finishTimeFormat, enableHotkeys, disableScroll,
  holdSpaceSpeedUp, holdSpaceSpeed, enableInstantHide,
  keySpeedUp, keySlowDown, keyReset,
} from '@popup/store';
import styles from './SpeedTab.module.css';

// Segmented 4-point slider interpolation math (exact port from popup.js)
function speedToSliderPercent(speed: number, points: number[]): number {
  const pts = points.length === 4 ? points : [1.0, 2.0, 3.0, 4.0];
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
    return (100 / 3) + frac * (100 / 3);
  }
  const span = pts[3] - pts[2];
  const frac = span > 0 ? (s - pts[2]) / span : 0;
  return (200 / 3) + frac * (100 / 3);
}

function sliderPercentToSpeed(pct: number, points: number[]): number {
  const pts = points.length === 4 ? points : [1.0, 2.0, 3.0, 4.0];
  const p = Math.max(0, Math.min(100, pct));
  if (p <= 0) return pts[0];
  if (p >= 100) return pts[3];
  if (p <= (100 / 3)) {
    const frac = p / (100 / 3);
    return pts[0] + frac * (pts[1] - pts[0]);
  }
  if (p <= (200 / 3)) {
    const frac = (p - (100 / 3)) / (100 / 3);
    return pts[1] + frac * (pts[2] - pts[1]);
  }
  const frac = (p - (200 / 3)) / (100 / 3);
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

export function SpeedTab() {
  const [editorState, setEditorState] = useState<'closed' | 'expanded' | 'collapsing'>('closed');
  const collapseTimerRef = useRef<number | null>(null);
  const sliderRef = useRef<HTMLInputElement>(null);

  const pts = snapPoints.value;
  const speed = preferredSpeed.value;
  const percent = speedToSliderPercent(speed, pts);

  useEffect(() => {
    if (sliderRef.current) {
      sliderRef.current.style.setProperty('--percent', `${percent}%`);
    }
  }, [percent]);

  const toggleEditor = () => {
    if (collapseTimerRef.current) {
      clearTimeout(collapseTimerRef.current);
      collapseTimerRef.current = null;
    }
    if (editorState === 'expanded') {
      setEditorState('collapsing');
      collapseTimerRef.current = window.setTimeout(() => {
        setEditorState('closed');
        collapseTimerRef.current = null;
      }, 220);
    } else {
      setEditorState('expanded');
    }
  };

  const handleSliderInput = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const pct = parseFloat(target.value) / 10;
    let val = sliderPercentToSpeed(pct, pts);

    // Magnetic snapping within ~2.2% of any snap point
    const snapPercents = [0, 100 / 3, 200 / 3, 100];
    for (let i = 0; i < snapPercents.length; i++) {
      if (Math.abs(pct - snapPercents[i]) <= 2.2) {
        val = pts[i];
        break;
      }
    }

    const actualPct = speedToSliderPercent(val, pts);
    target.style.setProperty('--percent', `${actualPct}%`);
    preferredSpeed.value = Math.round(val * 10) / 10;
  };

  const handleSliderChange = () => {
    saveSetting('preferredSpeed', preferredSpeed.value);
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
    const defaults = [1.0, 2.0, 3.0, 4.0];
    snapPoints.value = defaults;
    saveSetting('snapPoints', defaults);
  };

  const handleHotkeyFocus = (e: Event) => {
    (e.target as HTMLInputElement).value = 'Press key...';
  };

  const handleHotkeyDown = (keyType: 'keySpeedUp' | 'keySlowDown' | 'keyReset', e: KeyboardEvent) => {
    e.preventDefault();
    if (['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) return;
    const boundKey = e.key === ' ' ? 'Space' : e.key;
    if (keyType === 'keySpeedUp') {
      keySpeedUp.value = boundKey;
      saveSetting('keySpeedUp', boundKey);
    } else if (keyType === 'keySlowDown') {
      keySlowDown.value = boundKey;
      saveSetting('keySlowDown', boundKey);
    } else if (keyType === 'keyReset') {
      keyReset.value = boundKey;
      saveSetting('keyReset', boundKey);
    }
    (e.target as HTMLInputElement).blur();
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
              <svg class={styles.resetIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
              </svg>
            </button>
            <button
              type="button"
              class={styles.settingsToggleBtn}
              onClick={toggleEditor}
              aria-expanded={editorState === 'expanded' ? 'true' : 'false'}
              title="Customize Speed Snap Points"
              aria-label="Customize Speed Snap Points"
            >
              <svg class={styles.settingsIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </button>
            <span class={styles.hudValue}>{speed.toFixed(1)}x</span>
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
        <div
          class={`${styles.presetsEditorContainer} ${
            editorState === 'expanded' ? styles.expanded : editorState === 'collapsing' ? styles.collapsing : ''
          }`}
        >
          <div class={styles.presetsEditorSection}>
            <div class={styles.presetEditorHeader}>
              <span class={styles.presetEditorTitle}>Edit Snap Points</span>
              <button
                type="button"
                class={styles.snapResetDefaultsBtn}
                onClick={resetSnapDefaults}
                title="Reset Snap Points to 1.0x, 2.0x, 3.0x, 4.0x"
              >
                <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
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
                      onChange={(e) => handleSnapInputChange(i, (e.target as HTMLInputElement).value)}
                    />
                    <span class={styles.snapUnit}>x</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Integrated Speed Widget Footer Rows */}
        <div class={styles.hudFooterRow}>
          <label class={styles.hudFooterTitle} onClick={() => { hideSpeed.value = !hideSpeed.value; saveSetting('hideSpeed', hideSpeed.value); }}>
            Hide Speed Widget
          </label>
          <Toggle
            checked={hideSpeed.value}
            onChange={(v) => { hideSpeed.value = v; saveSetting('hideSpeed', v); }}
            ariaLabel="Toggle Hide Speed Widget"
          />
        </div>

        <div class={styles.hudFooterRow}>
          <label class={styles.hudFooterTitle} onClick={() => { alwaysExpandWidget.value = !alwaysExpandWidget.value; saveSetting('alwaysExpandWidget', alwaysExpandWidget.value); }}>
            Always Expand Speed Bar
          </label>
          <Toggle
            checked={alwaysExpandWidget.value}
            onChange={(v) => { alwaysExpandWidget.value = v; saveSetting('alwaysExpandWidget', v); }}
            ariaLabel="Toggle Always Expand Speed Bar"
          />
        </div>

        <div class={styles.hudFooterRow}>
          <label class={styles.hudFooterTitle} onClick={() => { constantVideoQuality.value = !constantVideoQuality.value; saveSetting('constantVideoQuality', constantVideoQuality.value); }}>
            Constant Video Quality <span class={styles.newBadge}>NEW</span>
          </label>
          <Toggle
            checked={constantVideoQuality.value}
            onChange={(v) => { constantVideoQuality.value = v; saveSetting('constantVideoQuality', v); }}
            ariaLabel="Toggle Constant Video Quality"
          />
        </div>

        <div class={`${styles.hudFooterRow} ${!constantVideoQuality.value ? styles.disabledRow : ''}`}>
          <label class={styles.hudFooterTitle}>
            Default Video Quality
          </label>
          <div class={styles.finishTimeControls}>
            <select
              class={styles.finishTimeFormatSelect}
              disabled={!constantVideoQuality.value}
              value={preferredQuality.value}
              onChange={(e) => {
                const val = (e.target as HTMLSelectElement).value as typeof preferredQuality.value;
                preferredQuality.value = val;
                saveSetting('preferredQuality', val);
              }}
              aria-label="Default Video Quality"
            >
              <option value="720p">720p (High)</option>
              <option value="480p">480p (Standard)</option>
              <option value="360p">360p (Medium)</option>
              <option value="240p">240p (Data Saver)</option>
              <option value="auto">Auto (PW Default)</option>
            </select>
          </div>
        </div>

        <div class={`${styles.hudFooterRow} ${!constantVideoQuality.value ? styles.disabledRow : ''}`}>
          <label class={styles.hudFooterTitle} onClick={() => { if (constantVideoQuality.value) { hideQuality.value = !hideQuality.value; saveSetting('hideQuality', hideQuality.value); } }}>
            Hide Quality Widget
          </label>
          <Toggle
            checked={hideQuality.value}
            onChange={(v) => { if (constantVideoQuality.value) { hideQuality.value = v; saveSetting('hideQuality', v); } }}
            ariaLabel="Toggle Hide Quality Widget"
          />
        </div>

        <div class={styles.hudFooterRow}>
          <label class={styles.hudFooterTitle} onClick={() => { showFinishTime.value = !showFinishTime.value; saveSetting('showFinishTime', showFinishTime.value); }}>
            Show Finish Time
          </label>
          <div class={styles.finishTimeControls}>
            <select
              class={styles.finishTimeFormatSelect}
              value={finishTimeFormat.value}
              onChange={(e) => {
                const val = (e.target as HTMLSelectElement).value as typeof finishTimeFormat.value;
                finishTimeFormat.value = val;
                saveSetting('finishTimeFormat', val);
              }}
              aria-label="Finish Time Format"
            >
              <option value="minimal">Minimal (Time Only)</option>
              <option value="clock">Clock with Label</option>
              <option value="full">Full (Clock + Left)</option>
            </select>
            <Toggle
              checked={showFinishTime.value}
              onChange={(v) => { showFinishTime.value = v; saveSetting('showFinishTime', v); }}
              ariaLabel="Toggle Show Finish Time"
            />
          </div>
        </div>
      </section>

      {/* === 2. Shortcuts & Controls Card === */}
      <section class={styles.shortcutsSection}>
        <h2 class={styles.sectionTitle}>Shortcuts & Controls</h2>
        <div class={styles.settingsGroupCard}>
          <div class={styles.settingRowGroup}>
            <FeatureRow label="Enable Keyboard Hotkeys">
              <Toggle
                checked={enableHotkeys.value}
                onChange={(v) => { enableHotkeys.value = v; saveSetting('enableHotkeys', v); }}
                ariaLabel="Toggle Keyboard Hotkeys"
              />
            </FeatureRow>
            {enableHotkeys.value && (
              <div class={styles.hotkeysEditor}>
                <div class={styles.inputRow}>
                  <span class={styles.inputLabel}>Speed Up</span>
                  <input
                    type="text"
                    readonly
                    class={styles.hotkeyInput}
                    value={keySpeedUp.value}
                    onFocus={handleHotkeyFocus}
                    onBlur={() => { if (keySpeedUp.value === 'Press key...') keySpeedUp.value = 'h'; }}
                    onKeyDown={(e) => handleHotkeyDown('keySpeedUp', e as unknown as KeyboardEvent)}
                    aria-label="Speed Up Hotkey"
                  />
                </div>
                <div class={styles.inputRow}>
                  <span class={styles.inputLabel}>Slow Down</span>
                  <input
                    type="text"
                    readonly
                    class={styles.hotkeyInput}
                    value={keySlowDown.value}
                    onFocus={handleHotkeyFocus}
                    onBlur={() => { if (keySlowDown.value === 'Press key...') keySlowDown.value = 'j'; }}
                    onKeyDown={(e) => handleHotkeyDown('keySlowDown', e as unknown as KeyboardEvent)}
                    aria-label="Slow Down Hotkey"
                  />
                </div>
                <div class={styles.inputRow}>
                  <span class={styles.inputLabel}>Reset Speed</span>
                  <input
                    type="text"
                    readonly
                    class={styles.hotkeyInput}
                    value={keyReset.value}
                    onFocus={handleHotkeyFocus}
                    onBlur={() => { if (keyReset.value === 'Press key...') keyReset.value = 'l'; }}
                    onKeyDown={(e) => handleHotkeyDown('keyReset', e as unknown as KeyboardEvent)}
                    aria-label="Reset Speed Hotkey"
                  />
                </div>
              </div>
            )}
          </div>

          <FeatureRow label="Disable Scroll Wheel Adjust">
            <Toggle
              checked={disableScroll.value}
              onChange={(v) => { disableScroll.value = v; saveSetting('disableScroll', v); }}
              ariaLabel="Toggle Scroll Wheel Adjust"
            />
          </FeatureRow>

          <div class={styles.settingRowGroup}>
            <FeatureRow label="Hold Space to Speed Up">
              <Toggle
                checked={holdSpaceSpeedUp.value}
                onChange={(v) => { holdSpaceSpeedUp.value = v; saveSetting('holdSpaceSpeedUp', v); }}
                ariaLabel="Toggle Hold Space"
              />
            </FeatureRow>
            {holdSpaceSpeedUp.value && (
              <div class={styles.featureConfigRow}>
                <span class={styles.configLabel}>Speed Up Rate</span>
                <Stepper
                  value={holdSpaceSpeed.value}
                  min={1.1}
                  max={4.0}
                  step={0.1}
                  unit="x"
                  onChange={(v) => { holdSpaceSpeed.value = v; saveSetting('holdSpaceSpeed', v); }}
                />
              </div>
            )}
          </div>

          <FeatureRow label="Instant Hide Button">
            <Toggle
              checked={enableInstantHide.value}
              onChange={(v) => { enableInstantHide.value = v; saveSetting('enableInstantHide', v); }}
              ariaLabel="Toggle Instant Hide Button"
            />
          </FeatureRow>
        </div>
      </section>
    </div>
  );
}
