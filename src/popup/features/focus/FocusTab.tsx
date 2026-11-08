import { useEffect, useRef, useState } from 'preact/hooks';
import { Toggle } from '@shared/components/Toggle';
import { FeatureRow } from '@shared/components/FeatureRow';
import { Stepper } from '@shared/components/Stepper';
import { SelectDropdown } from '@shared/components/SelectDropdown';
import { ShortcutInput } from '@shared/components/ShortcutInput';
import { CollapsibleSubOption } from '@shared/components/CollapsibleSubOption';
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
  hideNextLecture,
  hideNextChapter,
  hideAttemptDPP,
  enableInstantHide,
  autoSkipPromoAds,
  blockRecordedPolls,
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
      {/* 1. Focus Lock Card */}
      <FocusLockSection
        lockUnavailable={lockUnavailable}
        lockActive={lockActive}
        onToggle={handleToggleLock}
      />

      {/* 2. Auto-Hide Controls Card (Directly below Focus Lock) */}
      <AutoHideSection />

      {/* 3. Distraction Cleaners Card */}
      <DistractionsSection />

      {/* 4. Smart Lecture Tools Card */}
      <SmartToolsSection />

      {/* 5. Keyboard Shortcuts Card */}
      <ShortcutsSection />
    </>
  );
}

/* =========================================================================
   1. FOCUS LOCK SECTION (Retains sublabel for live status feedback)
   ========================================================================= */
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

/* =========================================================================
   2. AUTO-HIDE CONTROLS SECTION
   ========================================================================= */
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
        <CollapsibleSubOption isOpen={autoHideControls.value}>
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
        </CollapsibleSubOption>
      </div>
    </section>
  );
}

/* =========================================================================
   3. DISTRACTION CLEANERS SECTION
   ========================================================================= */
function DistractionsSection() {
  return (
    <section aria-label="Distraction Cleaners">
      <h2 class={styles.sectionTitle}>Distraction Cleaners</h2>
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
        <FeatureRow label="Hide Live Chat">
          <Toggle
            checked={hideChat.value}
            onChange={(v) => {
              hideChat.value = v;
              saveSetting('hideChat', v);
            }}
            ariaLabel="Toggle Hide Live Chat"
          />
        </FeatureRow>
        <FeatureRow label="Hide Doubt Q&A">
          <Toggle
            checked={hideDoubt.value}
            onChange={(v) => {
              hideDoubt.value = v;
              saveSetting('hideDoubt', v);
            }}
            ariaLabel="Toggle Hide Doubt Q&A"
          />
        </FeatureRow>
        <FeatureRow label="Hide 'Ask AI'">
          <Toggle
            checked={hideAskAI.value}
            onChange={(v) => {
              hideAskAI.value = v;
              saveSetting('hideAskAI', v);
            }}
            ariaLabel="Toggle Hide 'Ask AI'"
          />
        </FeatureRow>
        <FeatureRow label="Hide Study Notes">
          <Toggle
            checked={hideNotes.value}
            onChange={(v) => {
              hideNotes.value = v;
              saveSetting('hideNotes', v);
            }}
            ariaLabel="Toggle Hide Study Notes"
          />
        </FeatureRow>
        <FeatureRow label="Hide Attempt DPP">
          <Toggle
            checked={hideAttemptDPP.value}
            onChange={(v) => {
              hideAttemptDPP.value = v;
              saveSetting('hideAttemptDPP', v);
            }}
            ariaLabel="Toggle Hide Attempt DPP"
          />
        </FeatureRow>
        <FeatureRow label="Hide Next Lecture">
          <Toggle
            checked={hideNextLecture.value}
            onChange={(v) => {
              hideNextLecture.value = v;
              saveSetting('hideNextLecture', v);
            }}
            ariaLabel="Toggle Hide Next Lecture"
          />
        </FeatureRow>
        <FeatureRow label="Hide Next Chapter">
          <Toggle
            checked={hideNextChapter.value}
            onChange={(v) => {
              hideNextChapter.value = v;
              saveSetting('hideNextChapter', v);
            }}
            ariaLabel="Toggle Hide Next Chapter"
          />
        </FeatureRow>
        <FeatureRow label="Hide Note Timeline">
          <Toggle
            checked={hideNoteTimeline.value}
            onChange={(v) => {
              hideNoteTimeline.value = v;
              saveSetting('hideNoteTimeline', v);
            }}
            ariaLabel="Toggle Hide Note Timeline"
          />
        </FeatureRow>
        <FeatureRow label="Hide Timeline Line">
          <Toggle
            checked={hideTimeLine.value}
            onChange={(v) => {
              hideTimeLine.value = v;
              saveSetting('hideTimeLine', v);
            }}
            ariaLabel="Toggle Hide Timeline Line"
          />
        </FeatureRow>
        <FeatureRow label="Hide Time Display">
          <Toggle
            checked={hideTimeText.value}
            onChange={(v) => {
              hideTimeText.value = v;
              saveSetting('hideTimeText', v);
            }}
            ariaLabel="Toggle Hide Time Display"
          />
        </FeatureRow>
        <FeatureRow label="Hide Settings Icon">
          <Toggle
            checked={hideSetting.value}
            onChange={(v) => {
              hideSetting.value = v;
              saveSetting('hideSetting', v);
            }}
            ariaLabel="Toggle Hide Settings Icon"
          />
        </FeatureRow>
      </div>
    </section>
  );
}

/* =========================================================================
   4. SMART LECTURE TOOLS SECTION
   ========================================================================= */
function SmartToolsSection() {
  return (
    <section aria-label="Smart Lecture Tools">
      <h2 class={styles.sectionTitle}>Smart Lecture Tools</h2>
      <div class={styles.settingsGroupCard}>
        <FeatureRow label="Auto-Skip Promo Ads">
          <Toggle
            checked={autoSkipPromoAds.value}
            onChange={(v) => {
              autoSkipPromoAds.value = v;
              saveSetting('autoSkipPromoAds', v);
            }}
            ariaLabel="Toggle Auto-Skip Promo Ads"
          />
        </FeatureRow>
        <FeatureRow label="Block Recorded Poll Popups">
          <Toggle
            checked={blockRecordedPolls.value}
            onChange={(v) => {
              blockRecordedPolls.value = v;
              saveSetting('blockRecordedPolls', v);
            }}
            ariaLabel="Toggle Block Recorded Poll Popups"
          />
        </FeatureRow>
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
  );
}

/* =========================================================================
   5. KEYBOARD SHORTCUTS SECTION
   ========================================================================= */
type FocusKeyType =
  'keyChat' | 'keyTimeline' | 'keyNotes' | 'keyDoubt' | 'keyFullscreen' | 'keyExit';

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

  const validateKey = (keyType: FocusKeyType) => (candidateKey: string) => {
    const reservedWarning = getReservedShortcutWarning(candidateKey);
    if (reservedWarning) return reservedWarning;
    const conflict = findConflictingShortcut(keyType, candidateKey);
    if (conflict) return `"${candidateKey.toUpperCase()}" is already used by ${conflict}.`;
    return null;
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

  const chatKeyDisabled = !enableKeyChat.value || isShortcutDisabled(hideChat.value);
  const doubtKeyDisabled = !enableKeyDoubt.value || isShortcutDisabled(hideDoubt.value);
  const notesKeyDisabled = !enableKeyNotes.value || isShortcutDisabled(hideNotes.value);
  const timelineKeyDisabled =
    !enableKeyTimeline.value || isShortcutDisabled(hideNoteTimeline.value);
  const fullscreenKeyDisabled = !enableKeyFullscreen.value;
  const exitKeyDisabled = !enableKeyExit.value;

  return (
    <section aria-label="Keyboard Shortcuts">
      <h2 class={styles.sectionTitle}>Keyboard Shortcuts</h2>
      <div class={styles.settingsGroupCard}>
        <FeatureRow label="Enable Keyboard Shortcuts">
          <Toggle
            checked={enableFocusShortcuts.value}
            onChange={(v) => {
              enableFocusShortcuts.value = v;
              saveSetting('enableFocusShortcuts', v);
            }}
            ariaLabel="Toggle Enable Keyboard Shortcuts"
          />
        </FeatureRow>

        <CollapsibleSubOption isOpen={enableFocusShortcuts.value}>
          <div class={styles.shortcutsExpandBox}>
            <FeatureRow label="Allow Shortcuts When Icon is Hidden">
              <Toggle
                checked={allowShortcutsWhenHidden.value}
                onChange={(v) => {
                  allowShortcutsWhenHidden.value = v;
                  saveSetting('allowShortcutsWhenHidden', v);
                }}
                ariaLabel="Toggle Allow Shortcuts When Icon is Hidden"
              />
            </FeatureRow>

            <FeatureRow label="Live Chat">
              <div class={styles.rowControls}>
                <ShortcutInput
                  value={keyChat.value}
                  onChange={(v) => {
                    keyChat.value = v;
                    saveSetting('keyChat', v);
                  }}
                  disabled={chatKeyDisabled}
                  validate={validateKey('keyChat')}
                  onNotice={(msg) => showHotkeyNotice('keyChat', msg)}
                  className={styles.focusShortcutInput}
                  ariaLabel="Live Chat Shortcut Key"
                  title={
                    !enableKeyChat.value
                      ? 'Shortcut is toggled off'
                      : isShortcutDisabled(hideChat.value)
                        ? 'Shortcut disabled because Live Chat is hidden'
                        : 'Chat shortcut key (Backspace to clear)'
                  }
                />
                <Toggle
                  checked={enableKeyChat.value}
                  onChange={(v) => {
                    enableKeyChat.value = v;
                    saveSetting('enableKeyChat', v);
                  }}
                  ariaLabel="Toggle Live Chat Shortcut"
                />
              </div>
            </FeatureRow>
            {renderRowNotice('keyChat')}

            <FeatureRow label="Doubt Q&A">
              <div class={styles.rowControls}>
                <ShortcutInput
                  value={keyDoubt.value}
                  onChange={(v) => {
                    keyDoubt.value = v;
                    saveSetting('keyDoubt', v);
                  }}
                  disabled={doubtKeyDisabled}
                  validate={validateKey('keyDoubt')}
                  onNotice={(msg) => showHotkeyNotice('keyDoubt', msg)}
                  className={styles.focusShortcutInput}
                  ariaLabel="Doubt Shortcut Key"
                  title={
                    !enableKeyDoubt.value
                      ? 'Shortcut is toggled off'
                      : isShortcutDisabled(hideDoubt.value)
                        ? 'Shortcut disabled because Doubt Q&A is hidden'
                        : 'Doubt shortcut key (Backspace to clear)'
                  }
                />
                <Toggle
                  checked={enableKeyDoubt.value}
                  onChange={(v) => {
                    enableKeyDoubt.value = v;
                    saveSetting('enableKeyDoubt', v);
                  }}
                  ariaLabel="Toggle Doubt Q&A Shortcut"
                />
              </div>
            </FeatureRow>
            {renderRowNotice('keyDoubt')}

            <FeatureRow label="Study Notes">
              <div class={styles.rowControls}>
                <ShortcutInput
                  value={keyNotes.value}
                  onChange={(v) => {
                    keyNotes.value = v;
                    saveSetting('keyNotes', v);
                  }}
                  disabled={notesKeyDisabled}
                  validate={validateKey('keyNotes')}
                  onNotice={(msg) => showHotkeyNotice('keyNotes', msg)}
                  className={styles.focusShortcutInput}
                  ariaLabel="Study Notes Shortcut Key"
                  title={
                    !enableKeyNotes.value
                      ? 'Shortcut is toggled off'
                      : isShortcutDisabled(hideNotes.value)
                        ? 'Shortcut disabled because Study Notes is hidden'
                        : 'Study Notes shortcut key (Backspace to clear)'
                  }
                />
                <Toggle
                  checked={enableKeyNotes.value}
                  onChange={(v) => {
                    enableKeyNotes.value = v;
                    saveSetting('enableKeyNotes', v);
                  }}
                  ariaLabel="Toggle Study Notes Shortcut"
                />
              </div>
            </FeatureRow>
            {renderRowNotice('keyNotes')}

            <FeatureRow label="Note Timeline">
              <div class={styles.rowControls}>
                <ShortcutInput
                  value={keyTimeline.value}
                  onChange={(v) => {
                    keyTimeline.value = v;
                    saveSetting('keyTimeline', v);
                  }}
                  disabled={timelineKeyDisabled}
                  validate={validateKey('keyTimeline')}
                  onNotice={(msg) => showHotkeyNotice('keyTimeline', msg)}
                  className={styles.focusShortcutInput}
                  ariaLabel="Note Timeline Shortcut Key"
                  title={
                    !enableKeyTimeline.value
                      ? 'Shortcut is toggled off'
                      : isShortcutDisabled(hideNoteTimeline.value)
                        ? 'Shortcut disabled because Note Timeline is hidden'
                        : 'Note Timeline shortcut key (Backspace to clear)'
                  }
                />
                <Toggle
                  checked={enableKeyTimeline.value}
                  onChange={(v) => {
                    enableKeyTimeline.value = v;
                    saveSetting('enableKeyTimeline', v);
                  }}
                  ariaLabel="Toggle Note Timeline Shortcut"
                />
              </div>
            </FeatureRow>
            {renderRowNotice('keyTimeline')}

            <FeatureRow label="Full Screen">
              <div class={styles.rowControls}>
                <ShortcutInput
                  value={keyFullscreen.value}
                  onChange={(v) => {
                    keyFullscreen.value = v;
                    saveSetting('keyFullscreen', v);
                  }}
                  disabled={fullscreenKeyDisabled}
                  validate={validateKey('keyFullscreen')}
                  onNotice={(msg) => showHotkeyNotice('keyFullscreen', msg)}
                  className={styles.focusShortcutInput}
                  ariaLabel="Full Screen Shortcut Key"
                  title={
                    !enableKeyFullscreen.value
                      ? 'Shortcut is toggled off'
                      : 'Full Screen shortcut key (Backspace to clear)'
                  }
                />
                <Toggle
                  checked={enableKeyFullscreen.value}
                  onChange={(v) => {
                    enableKeyFullscreen.value = v;
                    saveSetting('enableKeyFullscreen', v);
                  }}
                  ariaLabel="Toggle Full Screen Shortcut"
                />
              </div>
            </FeatureRow>
            {renderRowNotice('keyFullscreen')}

            <FeatureRow label="Quick Exit Class">
              <div class={styles.rowControls}>
                <ShortcutInput
                  value={keyExit.value}
                  onChange={(v) => {
                    keyExit.value = v;
                    saveSetting('keyExit', v);
                  }}
                  disabled={exitKeyDisabled}
                  validate={validateKey('keyExit')}
                  onNotice={(msg) => showHotkeyNotice('keyExit', msg)}
                  className={styles.focusShortcutInput}
                  ariaLabel="Quick Exit Shortcut Key"
                  title={
                    !enableKeyExit.value
                      ? 'Shortcut is toggled off'
                      : 'Quick Exit shortcut key (Backspace to clear)'
                  }
                />
                <Toggle
                  checked={enableKeyExit.value}
                  onChange={(v) => {
                    enableKeyExit.value = v;
                    saveSetting('enableKeyExit', v);
                  }}
                  ariaLabel="Toggle Quick Exit Shortcut"
                />
              </div>
            </FeatureRow>
            {renderRowNotice('keyExit')}
          </div>
        </CollapsibleSubOption>
      </div>
    </section>
  );
}
