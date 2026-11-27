import { Toggle } from '@shared/components/Toggle';
import { FeatureRow } from '@shared/components/FeatureRow';
import { Stepper } from '@shared/components/Stepper';
import { SelectDropdown } from '@shared/components/SelectDropdown';
import { CollapsibleSubOption } from '@shared/components/CollapsibleSubOption';
import { saveSetting } from '@shared/storage';
import {
  VOLUME_BOOSTER_MAX,
  VOLUME_BOOSTER_MIN,
  VOLUME_BOOSTER_PRESETS,
  VOLUME_BOOSTER_STEP,
  sanitizeVolumeBoosterLevel,
} from '@shared/audio';
import type { VideoQuality } from '@shared/types';
import {
  skipSilenceEnabled,
  skipSilenceSilenceSpeed,
  skipSilenceThreshold,
  skipSilenceDynamicThreshold,
  skipSilenceMute,
  skipSilenceTimeSaved,
  skipSilenceMinDuration,
  skipSilenceLowCpu,
  constantVideoQuality,
  preferredQuality,
  hideQuality,
  skipSilenceActive,
  volumeBalancerEnabled,
  volumeBoosterEnabled,
  volumeBoosterLevel,
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

const VIDEO_QUALITY_OPTIONS = [
  { value: '720p', label: '720p (High)' },
  { value: '480p', label: '480p (Standard)' },
  { value: '360p', label: '360p (Medium)' },
  { value: '240p', label: '240p (Data Saver)' },
  { value: 'auto', label: 'Auto (PW Default)' },
];

export function SilenceTab() {
  const handleResetTimeSaved = () => {
    skipSilenceTimeSaved.value = 0;
    saveSetting('skipSilenceTimeSaved', 0);
  };

  const handleVolumeBoostChange = (rawLevel: number) => {
    const sanitized = sanitizeVolumeBoosterLevel(rawLevel, VOLUME_BOOSTER_MIN);
    volumeBoosterLevel.value = sanitized;
    saveSetting('volumeBoosterLevel', sanitized);
  };

  const boostPercentFill = Math.max(
    0,
    Math.min(
      100,
      ((volumeBoosterLevel.value - VOLUME_BOOSTER_MIN) /
        (VOLUME_BOOSTER_MAX - VOLUME_BOOSTER_MIN)) *
        100,
    ),
  );

  return (
    <div class={styles.mediaContainer}>
      {/* Video Quality Card */}
      <section class={styles.qualitySection} aria-label="Video Quality Settings">
        <h2 class={styles.sectionTitle}>Video Quality</h2>
        <div class={styles.settingsGroupCard}>
          <FeatureRow label="Constant Video Quality">
            <Toggle
              checked={constantVideoQuality.value}
              onChange={(val) => {
                constantVideoQuality.value = val;
                saveSetting('constantVideoQuality', val);
              }}
              ariaLabel="Toggle Constant Video Quality"
            />
          </FeatureRow>

          <CollapsibleSubOption isOpen={constantVideoQuality.value}>
            <div class={styles.featureConfigRow}>
              <span class={styles.configLabel}>Default Video Quality</span>
              <SelectDropdown
                size="sm"
                options={VIDEO_QUALITY_OPTIONS}
                value={preferredQuality.value}
                onChange={(val) => {
                  const quality = val as VideoQuality;
                  preferredQuality.value = quality;
                  saveSetting('preferredQuality', quality);
                }}
                ariaLabel="Default Video Quality"
              />
            </div>

            <div class={styles.featureConfigRow}>
              <label
                class={styles.configLabel}
                style={{ cursor: 'pointer', userSelect: 'none' }}
                onClick={() => {
                  const nextVal = !hideQuality.value;
                  hideQuality.value = nextVal;
                  saveSetting('hideQuality', nextVal);
                }}
              >
                Hide Quality Widget
              </label>
              <Toggle
                checked={hideQuality.value}
                onChange={(val) => {
                  hideQuality.value = val;
                  saveSetting('hideQuality', val);
                }}
                ariaLabel="Toggle Hide Quality Widget"
              />
            </div>
          </CollapsibleSubOption>
        </div>
      </section>

      {/* Volume Booster Card */}
      <section class={styles.qualitySection} aria-label="Volume Booster Settings">
        <h2 class={styles.sectionTitle}>Volume Booster</h2>
        <div class={styles.settingsGroupCard}>
          <FeatureRow
            label="Enable Volume Booster"
            sublabel={
              volumeBoosterEnabled.value
                ? volumeBoosterLevel.value > VOLUME_BOOSTER_MIN
                  ? `Boosting audio to ${volumeBoosterLevel.value}%`
                  : 'Normal volume (100%)'
                : 'Amplify quiet lectures up to 500%'
            }
          >
            <Toggle
              checked={volumeBoosterEnabled.value}
              onChange={(val) => {
                volumeBoosterEnabled.value = val;
                saveSetting('volumeBoosterEnabled', val);
              }}
              ariaLabel="Toggle Volume Booster"
            />
          </FeatureRow>

          <CollapsibleSubOption isOpen={volumeBoosterEnabled.value}>
            <div class={styles.settingRowGroup} id="vb-controls-card">
              <div class={styles.featureConfigRow}>
                <span class={styles.configLabel}>Boost Level</span>
                <div class={styles.vbValueGroup}>
                  <button
                    type="button"
                    class={`${styles.settingsToggleBtn} ${styles.resetSpeedBtn} ${styles.vbResetBtn}`}
                    id="vb-reset-btn"
                    onClick={() => handleVolumeBoostChange(VOLUME_BOOSTER_MIN)}
                    title="Reset boost to 100%"
                    aria-label="Reset Volume Boost to 100%"
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
                  <span class={styles.ssSensitivityValue} id="vb-level-value">
                    {volumeBoosterLevel.value}%
                  </span>
                </div>
              </div>

              <div class={styles.ssSensitivityRow}>
                <span class={styles.ssRangeLabel}>{VOLUME_BOOSTER_MIN}%</span>
                <input
                  type="range"
                  id="vb-level-slider"
                  class={styles.ssThresholdSlider}
                  min={VOLUME_BOOSTER_MIN}
                  max={VOLUME_BOOSTER_MAX}
                  step={VOLUME_BOOSTER_STEP}
                  value={volumeBoosterLevel.value}
                  style={{ '--percent': `${boostPercentFill}%` }}
                  onInput={(e) => {
                    const val = Number((e.target as HTMLInputElement).value);
                    handleVolumeBoostChange(val);
                  }}
                  aria-label="Volume Boost Level Slider"
                />
                <span class={styles.ssRangeLabel}>{VOLUME_BOOSTER_MAX}%</span>
              </div>

              <div class={styles.vbPresetsRow} role="group" aria-label="Volume Boost Presets">
                {VOLUME_BOOSTER_PRESETS.map((preset) => {
                  const isActive = volumeBoosterLevel.value === preset;
                  return (
                    <button
                      key={preset}
                      type="button"
                      class={`${styles.vbPresetBtn} ${isActive ? styles.vbPresetBtnActive : ''}`}
                      aria-pressed={isActive}
                      onClick={() => handleVolumeBoostChange(preset)}
                    >
                      {preset}%
                    </button>
                  );
                })}
              </div>

              {volumeBoosterLevel.value > 300 && (
                <div class={styles.vbWarningRow} role="status">
                  High boost levels may distort speakers. Enable Ear Protection below to tame loud
                  peaks.
                </div>
              )}
            </div>
          </CollapsibleSubOption>
        </div>
      </section>

      {/* Ear Protection Card (Issue #6) */}
      <section class={styles.qualitySection} aria-label="Ear Protection Settings">
        <h2 class={styles.sectionTitle}>Ear Protection</h2>
        <div class={styles.settingsGroupCard}>
          <FeatureRow label="Enable Ear Protection" sublabel="Stops sudden loud shouting">
            <Toggle
              checked={volumeBalancerEnabled.value}
              onChange={(val) => {
                volumeBalancerEnabled.value = val;
                saveSetting('volumeBalancerEnabled', val);
              }}
              ariaLabel="Toggle Ear Protection"
            />
          </FeatureRow>
        </div>
      </section>

      {/* Skip Silence Card */}
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
                skipSilenceActive.value = false;
                saveSetting('skipSilenceActive', false);
              }}
              ariaLabel="Toggle Skip Silence"
            />
          </FeatureRow>

          <CollapsibleSubOption isOpen={skipSilenceEnabled.value}>
            {/* Silence Speed Stepper */}
            <div class={styles.featureConfigRow}>
              <span class={styles.configLabel}>Silence Speed</span>
              <Stepper
                className={styles.stepperCard}
                value={skipSilenceSilenceSpeed.value}
                min={1.5}
                max={16.0}
                step={0.5}
                unit="x"
                onChange={(val) => {
                  skipSilenceSilenceSpeed.value = val;
                  saveSetting('skipSilenceSilenceSpeed', val);
                }}
              />
            </div>

            {/* Auto Noise Calibration */}
            <div class={styles.featureConfigRow}>
              <label
                class={styles.configLabel}
                style={{ cursor: 'pointer', userSelect: 'none' }}
                onClick={() => {
                  const nextVal = !skipSilenceDynamicThreshold.value;
                  skipSilenceDynamicThreshold.value = nextVal;
                  saveSetting('skipSilenceDynamicThreshold', nextVal);
                }}
              >
                Auto Noise Calibration
              </label>
              <Toggle
                checked={skipSilenceDynamicThreshold.value}
                onChange={(val) => {
                  skipSilenceDynamicThreshold.value = val;
                  saveSetting('skipSilenceDynamicThreshold', val);
                }}
                ariaLabel="Toggle Auto Noise Calibration"
              />
            </div>

            {/* Silence Threshold Slider (Manual) */}
            <CollapsibleSubOption isOpen={!skipSilenceDynamicThreshold.value}>
              <div class={styles.settingRowGroup} id="ss-manual-sensitivity-card">
                <div class={styles.featureConfigRow}>
                  <span class={styles.configLabel}>Silence Threshold</span>
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
                    style={{
                      '--percent': `${Math.max(0, Math.min(100, ((skipSilenceThreshold.value - -60) / 40) * 100))}%`,
                    }}
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
            </CollapsibleSubOption>

            {/* Minimum Silence Duration */}
            <div class={styles.featureConfigRow}>
              <span class={styles.configLabel}>Min. Silence</span>
              <Stepper
                className={styles.stepperCard}
                value={skipSilenceMinDuration.value}
                min={0.3}
                max={3.0}
                step={0.1}
                unit="s"
                onChange={(val) => {
                  const clamped = Math.round(val * 10) / 10;
                  skipSilenceMinDuration.value = clamped;
                  saveSetting('skipSilenceMinDuration', clamped);
                }}
              />
            </div>

            {/* Mute During Silence */}
            <div class={styles.featureConfigRow}>
              <label
                class={styles.configLabel}
                style={{ cursor: 'pointer', userSelect: 'none' }}
                onClick={() => {
                  const nextVal = !skipSilenceMute.value;
                  skipSilenceMute.value = nextVal;
                  saveSetting('skipSilenceMute', nextVal);
                }}
              >
                Mute During Silence
              </label>
              <Toggle
                checked={skipSilenceMute.value}
                onChange={(val) => {
                  skipSilenceMute.value = val;
                  saveSetting('skipSilenceMute', val);
                }}
                ariaLabel="Toggle Mute During Silence"
              />
            </div>

            {/* Low CPU / Battery Saver Mode */}
            <div class={styles.featureConfigRow}>
              <label
                class={styles.configLabel}
                style={{ cursor: 'pointer', userSelect: 'none' }}
                onClick={() => {
                  const nextVal = !skipSilenceLowCpu.value;
                  skipSilenceLowCpu.value = nextVal;
                  saveSetting('skipSilenceLowCpu', nextVal);
                }}
              >
                Low CPU / Battery Saver
              </label>
              <Toggle
                checked={skipSilenceLowCpu.value}
                onChange={(val) => {
                  skipSilenceLowCpu.value = val;
                  saveSetting('skipSilenceLowCpu', val);
                }}
                ariaLabel="Toggle Low CPU Battery Saver"
              />
            </div>

            {/* Time Saved Display */}
            <div class={`${styles.featureConfigRow} ${styles.ssTimeSavedCard}`}>
              <span class={styles.configLabel}>Time Saved</span>
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
              </div>
            </div>
          </CollapsibleSubOption>
        </div>

        <div class={styles.ssConflictTip}>
          <span class={styles.ssTipIcon}>💡</span>
          <span class={styles.ssTipText}>
            <strong>Tip:</strong> If Skip Silence doesn't activate, check if another sound or volume
            booster extension is running.
          </span>
        </div>
      </section>
    </div>
  );
}
