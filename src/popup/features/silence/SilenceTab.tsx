import { Toggle } from '@shared/components/Toggle';
import { FeatureRow } from '@shared/components/FeatureRow';
import { Stepper } from '@shared/components/Stepper';
import { saveSetting } from '@shared/storage';
import {
  skipSilenceEnabled,
  skipSilenceSilenceSpeed,
  skipSilenceThreshold,
  skipSilenceDynamicThreshold,
  skipSilenceMute,
  skipSilenceTimeSaved,
  skipSilenceMinDuration,
} from '@popup/store';
import styles from './SilenceTab.module.css';

function formatTimeSaved(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  if (totalSeconds < 60) return totalSeconds + 's';
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes < 60) return minutes + 'm ' + seconds + 's';
  const hours = Math.floor(minutes / 60);
  const remMinutes = minutes % 60;
  return hours + 'h ' + remMinutes + 'm';
}

export function SilenceTab() {
  const handleResetTimeSaved = () => {
    skipSilenceTimeSaved.value = 0;
    saveSetting('skipSilenceTimeSaved', 0);
  };

  return (
    <section class={styles.silenceSection} aria-label="Skip Silence Settings">
      <h2 class={styles.sectionTitle}>Skip Silence</h2>

      <div class={styles.settingsGroupCard}>
        {/* Master Toggle */}
        <FeatureRow label="Enable Skip Silence" htmlFor="ss-enable-toggle">
          <Toggle
            checked={skipSilenceEnabled.value}
            onChange={(val) => {
              skipSilenceEnabled.value = val;
              saveSetting('skipSilenceEnabled', val);
            }}
            ariaLabel="Toggle Skip Silence"
          />
        </FeatureRow>

        {/* Silence Speed Stepper */}
        <FeatureRow label="Silence Speed">
          <Stepper
            value={skipSilenceSilenceSpeed.value}
            min={1.5}
            max={6.0}
            step={0.1}
            unit="x"
            onChange={(val) => {
              skipSilenceSilenceSpeed.value = val;
              saveSetting('skipSilenceSilenceSpeed', val);
            }}
          />
        </FeatureRow>

        {/* Auto Noise Calibration */}
        <FeatureRow label="Auto Noise Calibration" htmlFor="ss-auto-toggle">
          <Toggle
            checked={skipSilenceDynamicThreshold.value}
            onChange={(val) => {
              skipSilenceDynamicThreshold.value = val;
              saveSetting('skipSilenceDynamicThreshold', val);
            }}
            ariaLabel="Toggle Auto Noise Calibration"
          />
        </FeatureRow>

        {/* Silence Threshold Slider (Manual) */}
        {!skipSilenceDynamicThreshold.value && (
          <div class={styles.settingRowGroup} id="ss-manual-sensitivity-card">
            <div class={styles.featureRow}>
              <div class={styles.featureInfo}>
                <span class={styles.featureTitle}>Silence Threshold</span>
              </div>
              <span class={styles.ssSensitivityValue} id="ss-sensitivity-value">
                {skipSilenceThreshold.value} dB
              </span>
            </div>
            <div class={styles.ssSensitivityRow}>
              <span class={styles.ssRangeLabel}>Strict</span>
              <input
                type="range"
                id="ss-threshold-slider"
                class={styles.ssThresholdSlider}
                min="-60"
                max="-20"
                step="1"
                value={skipSilenceThreshold.value}
                onInput={(e) => {
                  const val = Number((e.target as HTMLInputElement).value);
                  skipSilenceThreshold.value = val;
                  saveSetting('skipSilenceThreshold', val);
                }}
                aria-label="Silence Threshold Slider"
              />
              <span class={styles.ssRangeLabel}>Aggressive</span>
            </div>
          </div>
        )}

        {/* Minimum Silence Duration */}
        <FeatureRow label="Min. Silence (sec)" htmlFor="ss-min-duration">
          <div class={styles.ssMinDurationGroup}>
            <input
              type="number"
              id="ss-min-duration"
              class={styles.ssMinDurationInput}
              min="0.3"
              max="3.0"
              step="0.1"
              value={skipSilenceMinDuration.value}
              onChange={(e) => {
                let val = Number((e.target as HTMLInputElement).value);
                if (isNaN(val) || val < 0.3) val = 0.3;
                if (val > 3.0) val = 3.0;
                val = Math.round(val * 10) / 10;
                skipSilenceMinDuration.value = val;
                saveSetting('skipSilenceMinDuration', val);
              }}
              aria-label="Minimum Silence Duration"
            />
          </div>
        </FeatureRow>

        {/* Mute During Silence */}
        <FeatureRow label="Mute During Silence" htmlFor="ss-mute-toggle">
          <Toggle
            checked={skipSilenceMute.value}
            onChange={(val) => {
              skipSilenceMute.value = val;
              saveSetting('skipSilenceMute', val);
            }}
            ariaLabel="Toggle Mute During Silence"
          />
        </FeatureRow>

        {/* Time Saved Display */}
        <div class={`${styles.featureRow} ${styles.ssTimeSavedCard}`}>
          <div class={styles.featureInfo}>
            <span class={styles.featureTitle}>Time Saved</span>
          </div>
          <div class={styles.ssTimeSavedGroup}>
            <span class={styles.ssTimeSavedValue} id="ss-time-saved">
              {formatTimeSaved(skipSilenceTimeSaved.value)}
            </span>
            <button
              type="button"
              class={`${styles.settingsToggleBtn} ${styles.resetSpeedBtn}`}
              id="ss-reset-btn"
              onClick={handleResetTimeSaved}
              title="Reset Time Saved"
              aria-label="Reset Time Saved"
            >
              <svg class={styles.resetIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
