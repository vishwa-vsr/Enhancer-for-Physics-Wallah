import { useEffect, useState } from 'preact/hooks';
import { Toggle } from '@shared/components/Toggle';
import { FeatureRow } from '@shared/components/FeatureRow';
import { Stepper } from '@shared/components/Stepper';
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
  autoHideControls,
  autoHideDelay,
  autoHideWhenPaused,
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

function FocusTogglesSection() {
  const handleHotkeyFocus = (e: Event) => {
    (e.target as HTMLInputElement).value = 'Press key...';
  };

  const handleHotkeyDown = (
    keyType: 'keyChat' | 'keyTimeline' | 'keyNotes' | 'keyDoubt' | 'keyFullscreen' | 'keyExit',
    e: KeyboardEvent,
  ) => {
    e.preventDefault();
    if (['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) return;
    if (e.key === 'Backspace' || e.key === 'Delete') {
      if (keyType === 'keyChat') keyChat.value = '';
      else if (keyType === 'keyTimeline') keyTimeline.value = '';
      else if (keyType === 'keyNotes') keyNotes.value = '';
      else if (keyType === 'keyDoubt') keyDoubt.value = '';
      else if (keyType === 'keyFullscreen') keyFullscreen.value = '';
      else if (keyType === 'keyExit') keyExit.value = '';
      saveSetting(keyType, '');
      (e.target as HTMLInputElement).blur();
      return;
    }
    const boundKey = e.key === ' ' ? 'Space' : e.key;
    if (keyType === 'keyChat') keyChat.value = boundKey;
    else if (keyType === 'keyTimeline') keyTimeline.value = boundKey;
    else if (keyType === 'keyNotes') keyNotes.value = boundKey;
    else if (keyType === 'keyDoubt') keyDoubt.value = boundKey;
    else if (keyType === 'keyFullscreen') keyFullscreen.value = boundKey;
    else if (keyType === 'keyExit') keyExit.value = boundKey;
    saveSetting(keyType, boundKey);
    (e.target as HTMLInputElement).blur();
  };

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
              class={`${styles.shortcutInput} ${hideDoubt.value ? styles.shortcutDisabled : ''}`}
              value={keyDoubt.value}
              disabled={hideDoubt.value}
              title={
                hideDoubt.value
                  ? 'Shortcut disabled because Doubt Q&A is hidden'
                  : 'Doubt shortcut key (Backspace to clear)'
              }
              onFocus={handleHotkeyFocus}
              onBlur={() => {
                if (keyDoubt.value === 'Press key...') keyDoubt.value = 'd';
              }}
              onKeyDown={(e) => handleHotkeyDown('keyDoubt', e as unknown as KeyboardEvent)}
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
        <FeatureRow label="Hide Live Chat">
          <div class={styles.rowControls}>
            <input
              type="text"
              readonly
              class={`${styles.shortcutInput} ${hideChat.value ? styles.shortcutDisabled : ''}`}
              value={keyChat.value}
              disabled={hideChat.value}
              title={
                hideChat.value
                  ? 'Shortcut disabled because Live Chat is hidden'
                  : 'Chat shortcut key (Backspace to clear)'
              }
              onFocus={handleHotkeyFocus}
              onBlur={() => {
                if (keyChat.value === 'Press key...') keyChat.value = 'c';
              }}
              onKeyDown={(e) => handleHotkeyDown('keyChat', e as unknown as KeyboardEvent)}
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
        <FeatureRow label="Hide Study Notes">
          <div class={styles.rowControls}>
            <input
              type="text"
              readonly
              class={`${styles.shortcutInput} ${hideNotes.value ? styles.shortcutDisabled : ''}`}
              value={keyNotes.value}
              disabled={hideNotes.value}
              title={
                hideNotes.value
                  ? 'Shortcut disabled because Study Notes is hidden'
                  : 'Study Notes shortcut key (Backspace to clear)'
              }
              onFocus={handleHotkeyFocus}
              onBlur={() => {
                if (keyNotes.value === 'Press key...') keyNotes.value = 'n';
              }}
              onKeyDown={(e) => handleHotkeyDown('keyNotes', e as unknown as KeyboardEvent)}
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
        <FeatureRow label="Hide Note Timeline">
          <div class={styles.rowControls}>
            <input
              type="text"
              readonly
              class={`${styles.shortcutInput} ${hideNoteTimeline.value ? styles.shortcutDisabled : ''}`}
              value={keyTimeline.value}
              disabled={hideNoteTimeline.value}
              title={
                hideNoteTimeline.value
                  ? 'Shortcut disabled because Note Timeline is hidden'
                  : 'Note Timeline shortcut key (Backspace to clear)'
              }
              onFocus={handleHotkeyFocus}
              onBlur={() => {
                if (keyTimeline.value === 'Press key...') keyTimeline.value = 't';
              }}
              onKeyDown={(e) => handleHotkeyDown('keyTimeline', e as unknown as KeyboardEvent)}
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
            <select
              class={styles.finishTimeFormatSelect}
              value={finishTimeFormat.value}
              onChange={(e) => {
                const val = (e.target as HTMLSelectElement).value as FinishTimeFormat;
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
              onChange={(v) => {
                showFinishTime.value = v;
                saveSetting('showFinishTime', v);
              }}
              ariaLabel="Toggle Show Finish Time"
            />
          </div>
        </FeatureRow>
        <div class={styles.subSectionDivider} />
        <FeatureRow label="Toggle Fullscreen">
          <input
            type="text"
            readonly
            class={styles.shortcutInput}
            value={keyFullscreen.value}
            title="Fullscreen shortcut key (Backspace to clear)"
            onFocus={handleHotkeyFocus}
            onBlur={() => {
              if (keyFullscreen.value === 'Press key...') keyFullscreen.value = 'f';
            }}
            onKeyDown={(e) => handleHotkeyDown('keyFullscreen', e as unknown as KeyboardEvent)}
            aria-label="Fullscreen Shortcut Key"
          />
        </FeatureRow>
        <FeatureRow label="Quick Exit Class">
          <input
            type="text"
            readonly
            class={styles.shortcutInput}
            value={keyExit.value}
            title="Quick Exit shortcut key (Backspace to clear)"
            onFocus={handleHotkeyFocus}
            onBlur={() => {
              if (keyExit.value === 'Press key...') keyExit.value = 'e';
            }}
            onKeyDown={(e) => handleHotkeyDown('keyExit', e as unknown as KeyboardEvent)}
            aria-label="Quick Exit Shortcut Key"
          />
        </FeatureRow>
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
