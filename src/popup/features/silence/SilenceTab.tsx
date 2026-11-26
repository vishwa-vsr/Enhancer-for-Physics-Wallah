import { Toggle } from '@shared/components/Toggle';
import { FeatureRow } from '@shared/components/FeatureRow';
import { Stepper } from '@shared/components/Stepper';
import { SelectDropdown } from '@shared/components/SelectDropdown';
import { CollapsibleSubOption } from '@shared/components/CollapsibleSubOption';
import { saveSetting } from '@shared/storage';
import type { PopupSettings, VideoQuality } from '@shared/types';
import { clamp, formatTimeSaved } from '@shared/utils';
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
} from '@popup/store';
import shared from '../../popupShared.module.css';
import styles from './SilenceTab.module.css';

const VIDEO_QUALITY_OPTIONS = [
  { value: '720p', label: '720p (High)' },
  { value: '480p', label: '480p (Standard)' },
  { value: '360p', label: '360p (Medium)' },
  { value: '240p', label: '240p (Data Saver)' },
  { value: 'auto', label: 'Auto (PW Default)' },
];

function SubToggleRow({
  label,
  sig,
  settingKey,
  ariaLabel,
}: {
  label: string;
  sig: { value: boolean };
  settingKey: keyof PopupSettings;
  ariaLabel: string;
}) {
  return (
    <div class={shared.featureConfigRow}>
      <label
        class={shared.configLabel}
        style={{ cursor: 'pointer', userSelect: 'none' }}
        onClick={() => {
          const nextVal = !sig.value;
          sig.value = nextVal;
          saveSetting(settingKey, nextVal);
        }}
      >
        {label}
      </label>
      <Toggle
        checked={sig.value}
        onChange={(val) => {
          sig.value = val;
          saveSetting(settingKey, val);
        }}
        ariaLabel={ariaLabel}
      />
    </div>
  );
}

export function SilenceTab() {
  const handleResetTimeSaved = () => {
    skipSilenceTimeSaved.value = 0;
    saveSetting('skipSilenceTimeSaved', 0);
  };

  return (
    <div class={styles.mediaContainer}>
      {/* Video Quality Card */}
      <section class={styles.qualitySection} aria-label="Video Quality Settings">
        <h2 class={shared.sectionTitle}>Video Quality</h2>
        <div class={shared.settingsGroupCard}>
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
            <div class={shared.featureConfigRow}>
              <span class={shared.configLabel}>Default Video Quality</span>
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

            <SubToggleRow
              label="Hide Quality Widget"
              sig={hideQuality}
              settingKey="hideQuality"
              ariaLabel="Toggle Hide Quality Widget"
            />
          </CollapsibleSubOption>
        </div>
      </section>

      {/* Ear Protection Card (Issue #6) */}
      <section class={styles.qualitySection} aria-label="Ear Protection Settings">
        <h2 class={shared.sectionTitle}>Ear Protection</h2>
        <div class={shared.settingsGroupCard}>
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
        <h2 class={shared.sectionTitle}>Skip Silence</h2>

        <div class={shared.settingsGroupCard}>
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
            <div class={shared.featureConfigRow}>
              <span class={shared.configLabel}>Silence Speed</span>
              <Stepper
                className={shared.stepperCard}
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

            <SubToggleRow
              label="Auto Noise Calibration"
              sig={skipSilenceDynamicThreshold}
              settingKey="skipSilenceDynamicThreshold"
              ariaLabel="Toggle Auto Noise Calibration"
            />

            <CollapsibleSubOption isOpen={!skipSilenceDynamicThreshold.value}>
              <div
                class={`${shared.settingRowGroup} ${styles.settingRowGroup}`}
                id="ss-manual-sensitivity-card"
              >
                <div class={shared.featureConfigRow}>
                  <span class={shared.configLabel}>Silence Threshold</span>
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
                      '--percent': `${clamp(((skipSilenceThreshold.value - -60) / 40) * 100, 0, 100)}%`,
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

            <div class={shared.featureConfigRow}>
              <span class={shared.configLabel}>Min. Silence</span>
              <Stepper
                className={shared.stepperCard}
                value={skipSilenceMinDuration.value}
                min={0.3}
                max={3.0}
                step={0.1}
                unit="s"
                onChange={(val) => {
                  const rounded = Math.round(val * 10) / 10;
                  skipSilenceMinDuration.value = rounded;
                  saveSetting('skipSilenceMinDuration', rounded);
                }}
              />
            </div>

            <SubToggleRow
              label="Mute During Silence"
              sig={skipSilenceMute}
              settingKey="skipSilenceMute"
              ariaLabel="Toggle Mute During Silence"
            />
            <SubToggleRow
              label="Low CPU / Battery Saver"
              sig={skipSilenceLowCpu}
              settingKey="skipSilenceLowCpu"
              ariaLabel="Toggle Low CPU Battery Saver"
            />

            <div class={`${shared.featureConfigRow} ${styles.ssTimeSavedCard}`}>
              <span class={shared.configLabel}>Time Saved</span>
              <div class={styles.ssTimeSavedGroup}>
                <span class={styles.ssTimeSavedValue} id="ss-time-saved">
                  {formatTimeSaved(skipSilenceTimeSaved.value)}
                </span>
                <button
                  type="button"
                  class={shared.resetSpeedBtn}
                  id="ss-reset-btn"
                  onClick={handleResetTimeSaved}
                  title="Reset Time Saved"
                  aria-label="Reset Time Saved"
                >
                  <svg
                    class={shared.resetIcon}
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
