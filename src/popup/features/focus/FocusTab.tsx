import { useEffect, useRef, useState } from 'preact/hooks';
import { Toggle } from '@shared/components/Toggle';
import { FeatureRow } from '@shared/components/FeatureRow';
import { Stepper } from '@shared/components/Stepper';
import { SelectDropdown } from '@shared/components/SelectDropdown';
import { saveSetting } from '@shared/storage';
import type { FinishTimeFormat } from '@shared/types';
import {
  hideAskAI,
  hideDoubt,
  hideChat,
  hideNotes,
  hideNoteTimeline,
  hideSetting,
  hideTimeLine,
  hideTimeText,
  enableInstantHide,
  showFinishTime,
  finishTimeFormat,
  keyChat,
  keyTimeline,
  keyNotes,
  keyDoubt,
  keyFullscreen,
  keyExit,
  allowShortcutsWhenHidden,
  autoHideControls,
  autoHideDelay,
  autoHideWhenPaused,
  getReservedShortcutWarning,
  findConflictingShortcut,
} from '@popup/store';
import styles from './FocusTab.module.css';

type LockStatus = 'unknown' | 'active' | 'inactive' | 'unavailable';

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
              // No lecture content script on the active tab.
              resolve('unavailable');
              return;
            }
            resolve(res.active ? 'active' : 'inactive');
          });
        } catch (_err) {
          resolve('unavailable');
        }
      });
    } catch (_err) {
      resolve('unavailable');
    }
  });
}

const FINISH_TIME_FORMAT_OPTIONS = [
  { value: 'minimal', label: 'Minimal (Time Only)' },
  { value: 'clock', label: 'Clock with Label' },
  { value: 'full', label: 'Full (Clock + Left)' },
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
      <FocusLockSection
        lockUnavailable={lockUnavailable}
        lockActive={lockActive}
        onToggle={handleToggleLock}
      />
      <FocusTogglesSection />
      <AutoHideSection />
    </>
  );
}

interface FocusLockSectionProps {
  lockUnavailable: boolean;
  lockActive: boolean;
  onToggle: () => void;
}

function FocusLockSection({ lockUnavailable, lockActive, onToggle }: FocusLockSectionProps) {
  return (
    <section aria-label="Focus Lock Settings">
      <h2 class={styles.sectionTitle}>Focus Lock</h2>
      <div class={styles.settingsGroupCard}>
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
            onChange={onToggle}
            ariaLabel="Toggle Focus Lock"
          />
        </FeatureRow>
      </div>
    </section>
  );
}

type FocusKeyType =
  'keyChat' | 'keyTimeline' | 'keyNotes' | 'keyDoubt' | 'keyFullscreen' | 'keyExit';

const FOCUS_KEY_SIGNALS: Record<FocusKeyType, { value: string }> = {
  keyChat,
  keyTimeline,
  keyNotes,
  keyDoubt,
  keyFullscreen,
  keyExit,
};

function FocusTogglesSection() {
  const [activeHotkeyField, setActiveHotkeyField] = useState<FocusKeyType | null>(null);
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

  useEffect(() => {
    return () => {
      clearNoticeTimer();
    };
  }, []);

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

  const getShortcutDisplayValue = (keyType: FocusKeyType): string =>
    activeHotkeyField === keyType ? 'Press key...' : FOCUS_KEY_SIGNALS[keyType].value;

  const handleHotkeyFocus = (keyType: FocusKeyType) => {
    clearNoticeTimer();
    setHotkeyNotice(null);
    setActiveHotkeyField(keyType);
  };

  const handleHotkeyBlur = (keyType: FocusKeyType) => {
    setActiveHotkeyField((prev) => (prev === keyType ? null : prev));
  };

  const handleHotkeyDown = (keyType: FocusKeyType, e: KeyboardEvent) => {
    e.preventDefault();
    if (['Control', 'Shift', 'Alt', 'Meta', 'CapsLock'].includes(e.key)) return;

    const input = e.target as HTMLInputElement;
    const currentSignal = FOCUS_KEY_SIGNALS[keyType];

    const reservedWarning = getReservedShortcutWarning(e.key);
    if (reservedWarning) {
      setActiveHotkeyField(null);
      showHotkeyNotice(keyType, reservedWarning);
      input.blur();
      return;
    }

    if (e.key === 'Backspace' || e.key === 'Delete') {
      currentSignal.value = '';
      setActiveHotkeyField(null);
      saveSetting(keyType, '');
      showHotkeyNotice(keyType, null);
      input.blur();
      return;
    }

    // Only allow single alphanumeric keys (A-Z, 0-9), keeping Spacebar reserved
    if (/^[a-zA-Z0-9]$/.test(e.key)) {
      const boundKey = e.key.toLowerCase();
      const conflict = findConflictingShortcut(keyType, boundKey);
      if (conflict) {
        setActiveHotkeyField(null);
        showHotkeyNotice(keyType, `"${boundKey.toUpperCase()}" is already used by ${conflict}.`);
        input.blur();
        return;
      }
      currentSignal.value = boundKey;
      setActiveHotkeyField(null);
      saveSetting(keyType, boundKey);
      showHotkeyNotice(keyType, null);
      input.blur();
      return;
    }

    setActiveHotkeyField(null);
    showHotkeyNotice(keyType, 'Please press a single letter (A–Z) or number (0–9).');
    input.blur();
  };

  const renderRowNotice = (keyType: FocusKeyType) => {
    if (!hotkeyNotice || hotkeyNotice.keyType !== keyType) return null;
    return (
      <div class={styles.hotkeyNotice} role="status" aria-live="polite">
        {hotkeyNotice.message}
      </div>
    );
  };

  const isShortcutDisabled = (isHidden: boolean): boolean =>
    isHidden && !allowShortcutsWhenHidden.value;
  const doubtShortcutDisabled = isShortcutDisabled(hideDoubt.value);
  const chatShortcutDisabled = isShortcutDisabled(hideChat.value);
  const notesShortcutDisabled = isShortcutDisabled(hideNotes.value);
  const timelineShortcutDisabled = isShortcutDisabled(hideNoteTimeline.value);

  return (
    <section>
      <h2 class={styles.sectionTitle}>Focus Toggles</h2>
      <div class={styles.settingsGroupCard}>
        <FeatureRow label="Instant Hide Button">
          <Toggle
            checked={enableInstantHide.value}
            onChange={(v) => {
              enableInstantHide.value = v;
              saveSetting('enableInstantHide', v);
            }}
            ariaLabel="Toggle Instant Hide Button"
          />
        </FeatureRow>
        <FeatureRow label="Hide 'Ask AI'">
          <Toggle
            checked={hideAskAI.value}
            onChange={(v) => {
              hideAskAI.value = v;
              saveSetting('hideAskAI', v);
            }}
          />
        </FeatureRow>
        <FeatureRow label="Hide Doubt Q&A">
          <div class={styles.rowControls}>
            <input
              type="text"
              readonly
              class={`${styles.shortcutInput} ${doubtShortcutDisabled ? styles.shortcutDisabled : ''}`}
              value={getShortcutDisplayValue('keyDoubt')}
              disabled={doubtShortcutDisabled}
              title={
                doubtShortcutDisabled
                  ? 'Shortcut disabled because Doubt Q&A is hidden'
                  : 'Doubt shortcut key (Backspace to clear)'
              }
              onFocus={() => handleHotkeyFocus('keyDoubt')}
              onBlur={() => handleHotkeyBlur('keyDoubt')}
              onKeyDown={(e) => handleHotkeyDown('keyDoubt', e)}
              aria-label="Doubt Shortcut Key"
            />
            <Toggle
              checked={hideDoubt.value}
              onChange={(v) => {
                hideDoubt.value = v;
                saveSetting('hideDoubt', v);
              }}
            />
          </div>
        </FeatureRow>
        {renderRowNotice('keyDoubt')}
        <FeatureRow label="Hide Live Chat">
          <div class={styles.rowControls}>
            <input
              type="text"
              readonly
              class={`${styles.shortcutInput} ${chatShortcutDisabled ? styles.shortcutDisabled : ''}`}
              value={getShortcutDisplayValue('keyChat')}
              disabled={chatShortcutDisabled}
              title={
                chatShortcutDisabled
                  ? 'Shortcut disabled because Live Chat is hidden'
                  : 'Chat shortcut key (Backspace to clear)'
              }
              onFocus={() => handleHotkeyFocus('keyChat')}
              onBlur={() => handleHotkeyBlur('keyChat')}
              onKeyDown={(e) => handleHotkeyDown('keyChat', e)}
              aria-label="Live Chat Shortcut Key"
            />
            <Toggle
              checked={hideChat.value}
              onChange={(v) => {
                hideChat.value = v;
                saveSetting('hideChat', v);
              }}
            />
          </div>
        </FeatureRow>
        {renderRowNotice('keyChat')}
        <FeatureRow label="Hide Study Notes">
          <div class={styles.rowControls}>
            <input
              type="text"
              readonly
              class={`${styles.shortcutInput} ${notesShortcutDisabled ? styles.shortcutDisabled : ''}`}
              value={getShortcutDisplayValue('keyNotes')}
              disabled={notesShortcutDisabled}
              title={
                notesShortcutDisabled
                  ? 'Shortcut disabled because Study Notes is hidden'
                  : 'Study Notes shortcut key (Backspace to clear)'
              }
              onFocus={() => handleHotkeyFocus('keyNotes')}
              onBlur={() => handleHotkeyBlur('keyNotes')}
              onKeyDown={(e) => handleHotkeyDown('keyNotes', e)}
              aria-label="Study Notes Shortcut Key"
            />
            <Toggle
              checked={hideNotes.value}
              onChange={(v) => {
                hideNotes.value = v;
                saveSetting('hideNotes', v);
              }}
            />
          </div>
        </FeatureRow>
        {renderRowNotice('keyNotes')}
        <FeatureRow label="Hide Note Timeline">
          <div class={styles.rowControls}>
            <input
              type="text"
              readonly
              class={`${styles.shortcutInput} ${timelineShortcutDisabled ? styles.shortcutDisabled : ''}`}
              value={getShortcutDisplayValue('keyTimeline')}
              disabled={timelineShortcutDisabled}
              title={
                timelineShortcutDisabled
                  ? 'Shortcut disabled because Note Timeline is hidden'
                  : 'Note Timeline shortcut key (Backspace to clear)'
              }
              onFocus={() => handleHotkeyFocus('keyTimeline')}
              onBlur={() => handleHotkeyBlur('keyTimeline')}
              onKeyDown={(e) => handleHotkeyDown('keyTimeline', e)}
              aria-label="Note Timeline Shortcut Key"
            />
            <Toggle
              checked={hideNoteTimeline.value}
              onChange={(v) => {
                hideNoteTimeline.value = v;
                saveSetting('hideNoteTimeline', v);
              }}
            />
          </div>
        </FeatureRow>
        {renderRowNotice('keyTimeline')}
        <FeatureRow label="Hide Settings Icon">
          <Toggle
            checked={hideSetting.value}
            onChange={(v) => {
              hideSetting.value = v;
              saveSetting('hideSetting', v);
            }}
          />
        </FeatureRow>
        <FeatureRow label="Hide Timeline Line">
          <Toggle
            checked={hideTimeLine.value}
            onChange={(v) => {
              hideTimeLine.value = v;
              saveSetting('hideTimeLine', v);
            }}
          />
        </FeatureRow>
        <FeatureRow label="Hide Time Display">
          <Toggle
            checked={hideTimeText.value}
            onChange={(v) => {
              hideTimeText.value = v;
              saveSetting('hideTimeText', v);
            }}
          />
        </FeatureRow>
        <FeatureRow label="Show Finish Time">
          <div class={styles.finishTimeControls}>
            <SelectDropdown
              size="sm"
              options={FINISH_TIME_FORMAT_OPTIONS}
              value={finishTimeFormat.value}
              onChange={(val) => {
                const format = val as FinishTimeFormat;
                finishTimeFormat.value = format;
                saveSetting('finishTimeFormat', format);
              }}
              ariaLabel="Finish Time Format"
            />
            <Toggle
              checked={showFinishTime.value}
              onChange={(v) => {
                showFinishTime.value = v;
                saveSetting('showFinishTime', v);
              }}
              ariaLabel="Toggle Show Finish Time"
            />
          </div>
        </FeatureRow>
        <div class={styles.subSectionDivider} />
        <FeatureRow label="Allow Shortcuts When Hidden">
          <Toggle
            checked={allowShortcutsWhenHidden.value}
            onChange={(v) => {
              allowShortcutsWhenHidden.value = v;
              saveSetting('allowShortcutsWhenHidden', v);
            }}
            ariaLabel="Toggle Allow Shortcuts When Hidden"
          />
        </FeatureRow>
        <FeatureRow label="Toggle Fullscreen">
          <input
            type="text"
            readonly
            class={styles.shortcutInput}
            value={getShortcutDisplayValue('keyFullscreen')}
            title="Fullscreen shortcut key (Backspace to clear)"
            onFocus={() => handleHotkeyFocus('keyFullscreen')}
            onBlur={() => handleHotkeyBlur('keyFullscreen')}
            onKeyDown={(e) => handleHotkeyDown('keyFullscreen', e)}
            aria-label="Fullscreen Shortcut Key"
          />
        </FeatureRow>
        {renderRowNotice('keyFullscreen')}
        <FeatureRow label="Quick Exit Class">
          <input
            type="text"
            readonly
            class={styles.shortcutInput}
            value={getShortcutDisplayValue('keyExit')}
            title="Quick Exit shortcut key (Backspace to clear)"
            onFocus={() => handleHotkeyFocus('keyExit')}
            onBlur={() => handleHotkeyBlur('keyExit')}
            onKeyDown={(e) => handleHotkeyDown('keyExit', e)}
            aria-label="Quick Exit Shortcut Key"
          />
        </FeatureRow>
        {renderRowNotice('keyExit')}
      </div>
    </section>
  );
}

function AutoHideSection() {
  return (
    <section aria-label="Auto-Hide Controls">
      <h2 class={styles.sectionTitle}>Auto-Hide Controls</h2>
      <div class={styles.settingsGroupCard}>
        <FeatureRow label="Auto-Hide Controls & Cursor">
          <Toggle
            checked={autoHideControls.value}
            onChange={(v) => {
              autoHideControls.value = v;
              saveSetting('autoHideControls', v);
            }}
            ariaLabel="Toggle Auto-Hide Controls & Cursor"
          />
        </FeatureRow>
        {autoHideControls.value && (
          <>
            <div class={styles.featureConfigRow}>
              <span class={styles.configLabel}>Inactivity Delay</span>
              <Stepper
                className={styles.stepperCard}
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
            <FeatureRow label="Also Hide When Paused">
              <Toggle
                checked={autoHideWhenPaused.value}
                onChange={(v) => {
                  autoHideWhenPaused.value = v;
                  saveSetting('autoHideWhenPaused', v);
                }}
                ariaLabel="Toggle Auto-Hide When Paused"
              />
            </FeatureRow>
          </>
        )}
      </div>
    </section>
  );
}
