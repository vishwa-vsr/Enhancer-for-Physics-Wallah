import { Fragment } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import { Toggle } from '@shared/components/Toggle';
import { FeatureRow } from '@shared/components/FeatureRow';
import { Stepper } from '@shared/components/Stepper';
import { SelectDropdown } from '@shared/components/SelectDropdown';
import { ShortcutInput } from '@shared/components/ShortcutInput';
import { CollapsibleSubOption } from '@shared/components/CollapsibleSubOption';
import { saveSetting } from '@shared/storage';
import type { FinishTimeFormat, PopupSettings } from '@shared/types';
import {
  hideAskAI,
  hideDoubt,
  hideChat,
  hideNotes,
  hideNoteTimeline,
  hideTimeLine,
  hideTimeText,
  hideSetting,
  enableInstantHide,
  autoSkipPromoAds,
  blockRecordedPolls,
  enableSlideViewer,
  keySlideViewer,
  nativePdfViewer,
  lectureTimeEnabled,
  showFinishTime,
  finishTimeFormat,
  showLiveCatchUp,
  keyChat,
  keyTimeline,
  keyNotes,
  keyDoubt,
  keyFullscreen,
  keyExit,
  enableFocusShortcuts,
  enableKeyChat,
  enableKeyTimeline,
  enableKeyNotes,
  enableKeyDoubt,
  enableKeyFullscreen,
  enableKeyExit,
  allowShortcutsWhenHidden,
  showShortcutAlerts,
  autoHideControls,
  autoHideDelay,
  autoHideWhenPaused,
  getReservedShortcutWarning,
  findConflictingShortcut,
} from '@popup/store';
import shared from '../../popupShared.module.css';
import styles from './FocusTab.module.css';

type LockStatus = 'unknown' | 'active' | 'inactive' | 'unavailable';
type BoolSignal = { value: boolean };
type StrSignal = { value: string };

const cardClass = `${shared.settingsGroupCard} ${styles.focusSettingsCard}`;
const sectionTitleClass = `${shared.sectionTitle} ${styles.focusSectionTitle}`;

function BoolFeatureRow({
  label,
  sublabel,
  sig,
  settingKey,
  ariaLabel,
}: {
  label: string;
  sublabel?: string;
  sig: BoolSignal;
  settingKey: keyof PopupSettings;
  ariaLabel?: string;
}) {
  return (
    <FeatureRow label={label} sublabel={sublabel}>
      <Toggle
        checked={sig.value}
        onChange={(v) => {
          sig.value = v;
          saveSetting(settingKey, v);
        }}
        ariaLabel={ariaLabel ?? `Toggle ${label}`}
      />
    </FeatureRow>
  );
}

const DISTRACTION_TOGGLES: Array<{
  label: string;
  sig: BoolSignal;
  settingKey: keyof PopupSettings;
}> = [
  { label: 'Instant Hide Button', sig: enableInstantHide, settingKey: 'enableInstantHide' },
  { label: 'Hide Live Chat', sig: hideChat, settingKey: 'hideChat' },
  { label: 'Hide Doubt Q&A', sig: hideDoubt, settingKey: 'hideDoubt' },
  { label: "Hide 'Ask AI'", sig: hideAskAI, settingKey: 'hideAskAI' },
  { label: 'Hide Study Notes', sig: hideNotes, settingKey: 'hideNotes' },
  { label: 'Hide Note Timeline', sig: hideNoteTimeline, settingKey: 'hideNoteTimeline' },
  { label: 'Hide Timeline Line', sig: hideTimeLine, settingKey: 'hideTimeLine' },
  { label: 'Hide Time Display', sig: hideTimeText, settingKey: 'hideTimeText' },
  { label: 'Hide Settings Icon', sig: hideSetting, settingKey: 'hideSetting' },
];

type FocusKeyType =
  'keyChat' | 'keyTimeline' | 'keyNotes' | 'keyDoubt' | 'keyFullscreen' | 'keyExit';

const FOCUS_SHORTCUT_ROWS: Array<{
  keyType: FocusKeyType;
  label: string;
  keySig: StrSignal;
  enableSig: BoolSignal;
  enableKey: keyof PopupSettings;
  hideSig?: BoolSignal;
  keyAria: string;
  toggleAria: string;
  defaultTitle: string;
  hiddenMsg?: string;
}> = [
  {
    keyType: 'keyChat',
    label: 'Live Chat',
    keySig: keyChat,
    enableSig: enableKeyChat,
    enableKey: 'enableKeyChat',
    hideSig: hideChat,
    keyAria: 'Live Chat Shortcut Key',
    toggleAria: 'Toggle Live Chat Shortcut',
    defaultTitle: 'Chat shortcut key (Backspace to clear)',
    hiddenMsg: 'Shortcut disabled because Live Chat is hidden',
  },
  {
    keyType: 'keyDoubt',
    label: 'Doubt Q&A',
    keySig: keyDoubt,
    enableSig: enableKeyDoubt,
    enableKey: 'enableKeyDoubt',
    hideSig: hideDoubt,
    keyAria: 'Doubt Shortcut Key',
    toggleAria: 'Toggle Doubt Q&A Shortcut',
    defaultTitle: 'Doubt shortcut key (Backspace to clear)',
    hiddenMsg: 'Shortcut disabled because Doubt Q&A is hidden',
  },
  {
    keyType: 'keyNotes',
    label: 'Study Notes',
    keySig: keyNotes,
    enableSig: enableKeyNotes,
    enableKey: 'enableKeyNotes',
    hideSig: hideNotes,
    keyAria: 'Study Notes Shortcut Key',
    toggleAria: 'Toggle Study Notes Shortcut',
    defaultTitle: 'Study Notes shortcut key (Backspace to clear)',
    hiddenMsg: 'Shortcut disabled because Study Notes is hidden',
  },
  {
    keyType: 'keyTimeline',
    label: 'Note Timeline',
    keySig: keyTimeline,
    enableSig: enableKeyTimeline,
    enableKey: 'enableKeyTimeline',
    hideSig: hideNoteTimeline,
    keyAria: 'Note Timeline Shortcut Key',
    toggleAria: 'Toggle Note Timeline Shortcut',
    defaultTitle: 'Note Timeline shortcut key (Backspace to clear)',
    hiddenMsg: 'Shortcut disabled because Note Timeline is hidden',
  },
  {
    keyType: 'keyFullscreen',
    label: 'Full Screen',
    keySig: keyFullscreen,
    enableSig: enableKeyFullscreen,
    enableKey: 'enableKeyFullscreen',
    keyAria: 'Full Screen Shortcut Key',
    toggleAria: 'Toggle Full Screen Shortcut',
    defaultTitle: 'Full Screen shortcut key (Backspace to clear)',
  },
  {
    keyType: 'keyExit',
    label: 'Quick Exit Class',
    keySig: keyExit,
    enableSig: enableKeyExit,
    enableKey: 'enableKeyExit',
    keyAria: 'Quick Exit Shortcut Key',
    toggleAria: 'Toggle Quick Exit Shortcut',
    defaultTitle: 'Quick Exit shortcut key (Backspace to clear)',
  },
];

// Ask the lecture tab (frame hosting the video) about the Focus Lock session.
// Uses runtime messaging so no extra permissions are required.
function sendFocusLockMessage(action: 'get' | 'toggle'): Promise<LockStatus> {
  return new Promise((resolve) => {
    if (typeof chrome === 'undefined' || !chrome.tabs || !chrome.tabs.query) {
      resolve('unavailable');
      return;
    }
    try {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tabId = tabs && tabs[0] && tabs[0].id;
        if (tabId === undefined || !chrome.tabs.sendMessage) {
          resolve('unavailable');
          return;
        }
        try {
          chrome.tabs.sendMessage(tabId, { type: 'PWC_FOCUS_LOCK', action }, (res) => {
            if (chrome.runtime.lastError || !res || !res.ok) {
              resolve('unavailable');
              return;
            }
            resolve(res.active ? 'active' : 'inactive');
          });
        } catch {
          resolve('unavailable');
        }
      });
    } catch {
      resolve('unavailable');
    }
  });
}

const FINISH_TIME_FORMAT_OPTIONS = [
  { value: 'clock', label: 'Simple' },
  { value: 'full', label: 'Detailed' },
];

export function FocusTab() {
  const [lockStatus, setLockStatus] = useState<LockStatus>('unknown');

  useEffect(() => {
    let mounted = true;
    sendFocusLockMessage('get').then((status) => {
      if (mounted) setLockStatus(status);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const handleToggleLock = async () => {
    const status = await sendFocusLockMessage('toggle');
    setLockStatus(status);
  };

  const lockUnavailable = lockStatus === 'unavailable';
  const lockActive = lockStatus === 'active';

  return (
    <>
      <section aria-label="Focus Lock Settings">
        <h2 class={sectionTitleClass}>Focus Lock</h2>
        <div class={cardClass}>
          <FeatureRow
            label="Strict Study Session"
            sublabel={
              lockUnavailable
                ? 'Open a lecture video to start'
                : lockActive
                  ? 'Running — pauses if you leave full screen'
                  : 'Plays full screen & pauses if you leave'
            }
            disabled={lockUnavailable}
          >
            <Toggle
              checked={lockActive}
              disabled={lockUnavailable}
              onChange={handleToggleLock}
              ariaLabel="Toggle Focus Lock"
            />
          </FeatureRow>
        </div>
      </section>

      <section aria-label="Auto-Hide Controls">
        <h2 class={sectionTitleClass}>Auto-Hide Controls</h2>
        <div class={cardClass}>
          <BoolFeatureRow
            label="Auto-Hide Controls & Cursor"
            sig={autoHideControls}
            settingKey="autoHideControls"
          />
          <CollapsibleSubOption isOpen={autoHideControls.value}>
            <div class={shared.featureConfigRow}>
              <span class={shared.configLabel}>Inactivity Delay</span>
              <Stepper
                className={shared.stepperCard}
                value={autoHideDelay.value}
                min={0.5}
                max={5.0}
                step={0.1}
                unit="s"
                onChange={(v) => {
                  autoHideDelay.value = v;
                  saveSetting('autoHideDelay', v);
                }}
              />
            </div>
            <BoolFeatureRow
              label="Also Hide When Paused"
              sig={autoHideWhenPaused}
              settingKey="autoHideWhenPaused"
            />
          </CollapsibleSubOption>
        </div>
      </section>

      <section aria-label="Distraction Cleaners">
        <h2 class={sectionTitleClass}>Distraction Cleaners</h2>
        <div class={cardClass}>
          {DISTRACTION_TOGGLES.map((item) => (
            <BoolFeatureRow
              key={item.settingKey}
              label={item.label}
              sig={item.sig}
              settingKey={item.settingKey}
            />
          ))}
        </div>
      </section>

      <section aria-label="Smart Lecture Tools">
        <h2 class={sectionTitleClass}>Smart Lecture Tools</h2>
        <div class={cardClass}>
          <BoolFeatureRow
            label="Auto-Skip Promo Ads"
            sig={autoSkipPromoAds}
            settingKey="autoSkipPromoAds"
          />
          <BoolFeatureRow
            label="Block Recorded Poll Popups"
            sig={blockRecordedPolls}
            settingKey="blockRecordedPolls"
          />
          <BoolFeatureRow
            label="Timeline Slide Viewer (Fullscreen)"
            sig={enableSlideViewer}
            settingKey="enableSlideViewer"
          />
          <CollapsibleSubOption isOpen={enableSlideViewer.value}>
            <div class={shared.featureConfigRow}>
              <span class={shared.configLabel}>Current Slide in Fullscreen</span>
              <div class={styles.rowControls}>
                <span class={styles.modifierBadge}>Shift +</span>
                <ShortcutInput
                  className={styles.focusShortcutInput}
                  value={keySlideViewer.value}
                  onChange={(key) => {
                    keySlideViewer.value = key;
                    saveSetting('keySlideViewer', key);
                  }}
                  title="Shortcut to open current slide in fullscreen (default: T)"
                  ariaLabel="Current Slide in Fullscreen Shortcut Key"
                />
              </div>
            </div>
          </CollapsibleSubOption>
          <BoolFeatureRow
            label="Native Browser PDF Viewer"
            sublabel="Bypass PW PDF viewer & open notes directly in browser"
            sig={nativePdfViewer}
            settingKey="nativePdfViewer"
          />
          <FeatureRow label="Lecture Finish Time">
            <div class={styles.finishTimeControls}>
              <SelectDropdown
                size="sm"
                options={FINISH_TIME_FORMAT_OPTIONS}
                value={finishTimeFormat.value === 'full' ? 'full' : 'clock'}
                onChange={(val) => {
                  const format = val as FinishTimeFormat;
                  finishTimeFormat.value = format;
                  saveSetting('finishTimeFormat', format);
                }}
                ariaLabel="Lecture Finish Time Format"
              />
              <Toggle
                checked={lectureTimeEnabled.value}
                onChange={(v) => {
                  lectureTimeEnabled.value = v;
                  saveSetting('lectureTimeEnabled', v);
                  showFinishTime.value = v;
                  saveSetting('showFinishTime', v);
                  showLiveCatchUp.value = v;
                  saveSetting('showLiveCatchUp', v);
                }}
                ariaLabel="Toggle Lecture Finish Time"
              />
            </div>
          </FeatureRow>
        </div>
      </section>

      <ShortcutsSection />
    </>
  );
}

function ShortcutsSection() {
  const [hotkeyNotice, setHotkeyNotice] = useState<{
    keyType: FocusKeyType;
    message: string;
  } | null>(null);
  const noticeTimerRef = useRef<number | null>(null);

  const clearNoticeTimer = () => {
    if (noticeTimerRef.current) {
      clearTimeout(noticeTimerRef.current);
      noticeTimerRef.current = null;
    }
  };

  useEffect(() => () => clearNoticeTimer(), []);

  const showHotkeyNotice = (keyType: FocusKeyType, message: string | null) => {
    clearNoticeTimer();
    if (!message) {
      setHotkeyNotice(null);
      return;
    }
    setHotkeyNotice({ keyType, message });
    noticeTimerRef.current = window.setTimeout(() => {
      setHotkeyNotice(null);
      noticeTimerRef.current = null;
    }, 3600);
  };

  const validateKey = (keyType: FocusKeyType) => (candidateKey: string) => {
    const reservedWarning = getReservedShortcutWarning(candidateKey);
    if (reservedWarning) return reservedWarning;
    const conflict = findConflictingShortcut(keyType, candidateKey);
    if (conflict) return `"${candidateKey.toUpperCase()}" is already used by ${conflict}.`;
    return null;
  };

  return (
    <section aria-label="Keyboard Shortcuts">
      <h2 class={sectionTitleClass}>Keyboard Shortcuts</h2>
      <div class={cardClass}>
        <BoolFeatureRow
          label="Enable Keyboard Shortcuts"
          sig={enableFocusShortcuts}
          settingKey="enableFocusShortcuts"
        />

        <CollapsibleSubOption isOpen={enableFocusShortcuts.value}>
          <div class={styles.shortcutsExpandBox}>
            <BoolFeatureRow
              label="Show On-Screen Shortcut Alerts"
              sig={showShortcutAlerts}
              settingKey="showShortcutAlerts"
            />
            <BoolFeatureRow
              label="Allow Shortcuts When Icon is Hidden"
              sig={allowShortcutsWhenHidden}
              settingKey="allowShortcutsWhenHidden"
            />

            {FOCUS_SHORTCUT_ROWS.map((row) => {
              const hiddenBlocked = row.hideSig
                ? row.hideSig.value && !allowShortcutsWhenHidden.value
                : false;
              const disabled = !row.enableSig.value || hiddenBlocked;
              const title = !row.enableSig.value
                ? 'Shortcut is toggled off'
                : hiddenBlocked && row.hiddenMsg
                  ? row.hiddenMsg
                  : row.defaultTitle;

              return (
                <Fragment key={row.keyType}>
                  <FeatureRow label={row.label}>
                    <div class={styles.rowControls}>
                      <ShortcutInput
                        value={row.keySig.value}
                        onChange={(v) => {
                          row.keySig.value = v;
                          saveSetting(row.keyType, v);
                        }}
                        disabled={disabled}
                        validate={validateKey(row.keyType)}
                        onNotice={(msg) => showHotkeyNotice(row.keyType, msg)}
                        className={styles.focusShortcutInput}
                        ariaLabel={row.keyAria}
                        title={title}
                      />
                      <Toggle
                        checked={row.enableSig.value}
                        onChange={(v) => {
                          row.enableSig.value = v;
                          saveSetting(row.enableKey, v);
                        }}
                        ariaLabel={row.toggleAria}
                      />
                    </div>
                  </FeatureRow>
                  {hotkeyNotice?.keyType === row.keyType && (
                    <div
                      class={`${shared.hotkeyNotice} ${styles.focusHotkeyNotice}`}
                      role="status"
                      aria-live="polite"
                    >
                      {hotkeyNotice.message}
                    </div>
                  )}
                </Fragment>
              );
            })}
          </div>
        </CollapsibleSubOption>
      </div>
    </section>
  );
}
