import { useEffect, useState } from 'preact/hooks';
import { Toggle } from '@shared/components/Toggle';
import { FeatureRow } from '@shared/components/FeatureRow';
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
          <Toggle
            checked={hideDoubt.value}
            onChange={(v) => {
              hideDoubt.value = v;
              saveSetting('hideDoubt', v);
            }}
          />
        </FeatureRow>
        <FeatureRow label="Hide Live Chat">
          <Toggle
            checked={hideChat.value}
            onChange={(v) => {
              hideChat.value = v;
              saveSetting('hideChat', v);
            }}
          />
        </FeatureRow>
        <FeatureRow label="Hide Study Notes">
          <Toggle
            checked={hideNotes.value}
            onChange={(v) => {
              hideNotes.value = v;
              saveSetting('hideNotes', v);
            }}
          />
        </FeatureRow>
        <FeatureRow label="Hide Note Timeline">
          <Toggle
            checked={hideNoteTimeline.value}
            onChange={(v) => {
              hideNoteTimeline.value = v;
              saveSetting('hideNoteTimeline', v);
            }}
          />
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
      </div>
    </section>
  );
}
