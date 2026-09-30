import { signal } from '@preact/signals';
import { FinishTimeFormat, PopupSettings, ReviewPromptStatus, VideoQuality } from '@shared/types';
import { loadSettings, onSettingsChanged, saveSettings } from '@shared/storage';
import {
  getReservedShortcutWarning,
  resolveSafeSpeedShortcuts,
  sanitizeSpeedShortcut,
} from '@shared/shortcuts';

export { getReservedShortcutWarning, sanitizeSpeedShortcut };

// ===== Speed & Quality signals =====
export const preferredSpeed = signal(1.0);
export const constantVideoQuality = signal(false);
export const preferredQuality = signal<VideoQuality>('720p');
export const snapPoints = signal<number[]>([1.0, 1.5, 2.0, 2.5]);

// ===== Focus toggle signals (match chrome.storage keys exactly) =====
export const hideAskAI = signal(false);
export const hideDoubt = signal(false);
export const hideChat = signal(false);
export const hideNotes = signal(false);
export const hideNoteTimeline = signal(false);
export const hideSpeed = signal(false);
export const hideQuality = signal(true);
export const hideSkipSilence = signal(false);
export const hideSetting = signal(false);
export const hideTimeLine = signal(false);
export const hideTimeText = signal(false);
export const enableInstantHide = signal(false);
export const autoPauseOnHide = signal(false);

// ===== Shortcut signals =====
export const enableHotkeys = signal(false);
export const disableScroll = signal(false);
export const holdSpaceSpeedUp = signal(false);
export const holdSpaceSpeed = signal(2.0);
export const keySpeedUp = signal('h');
export const keySlowDown = signal('j');
export const keyReset = signal('l');
export const alwaysExpandWidget = signal(false);
export const showFinishTime = signal(true);
export const finishTimeFormat = signal<FinishTimeFormat>('minimal');

// ===== Focus shortcuts signals (Issue #14) =====
export const keyChat = signal('c');
export const keyTimeline = signal('t');
export const keyNotes = signal('n');
export const keyDoubt = signal('d');
export const keyFullscreen = signal('f');
export const keyExit = signal('e');
export const allowShortcutsWhenHidden = signal(false);

export type ShortcutKeyId =
  | 'keySpeedUp'
  | 'keySlowDown'
  | 'keyReset'
  | 'keyDoubt'
  | 'keyChat'
  | 'keyNotes'
  | 'keyTimeline'
  | 'keyFullscreen'
  | 'keyExit';

const ALL_SHORTCUT_ENTRIES: Array<{
  id: ShortcutKeyId;
  label: string;
  signal: { value: string };
}> = [
  { id: 'keySpeedUp', label: 'Speed Up', signal: keySpeedUp },
  { id: 'keySlowDown', label: 'Slow Down', signal: keySlowDown },
  { id: 'keyReset', label: 'Reset Speed', signal: keyReset },
  { id: 'keyDoubt', label: 'Doubt Q&A', signal: keyDoubt },
  { id: 'keyChat', label: 'Live Chat', signal: keyChat },
  { id: 'keyNotes', label: 'Study Notes', signal: keyNotes },
  { id: 'keyTimeline', label: 'Note Timeline', signal: keyTimeline },
  { id: 'keyFullscreen', label: 'Toggle Fullscreen', signal: keyFullscreen },
  { id: 'keyExit', label: 'Quick Exit Class', signal: keyExit },
];

export function findConflictingShortcut(
  currentId: ShortcutKeyId,
  candidateKey: string,
): string | null {
  const normalized = candidateKey.trim().toLowerCase();
  if (!normalized) return null;
  for (const entry of ALL_SHORTCUT_ENTRIES) {
    if (entry.id === currentId) continue;
    const existing = entry.signal.value.trim().toLowerCase();
    if (existing && existing === normalized) {
      return entry.label;
    }
  }
  return null;
}

// ===== Auto-hide controls & cursor signals (Issue #14) =====
export const autoHideControls = signal(false);
export const autoHideDelay = signal(0.8);
export const autoHideWhenPaused = signal(false);

// ===== Skip Silence signals =====
export const skipSilenceEnabled = signal(false);
export const skipSilenceSilenceSpeed = signal(3.0);
export const skipSilenceThreshold = signal(-40);
export const skipSilenceDynamicThreshold = signal(true);
export const skipSilenceMute = signal(false);
export const skipSilenceTimeSaved = signal(0);
export const skipSilenceMinDuration = signal(0.5);
export const skipSilenceLowCpu = signal(false);

// ===== Review prompt signals =====
export const installDate = signal(0);
export const reviewPromptStatus = signal<ReviewPromptStatus>('pending');
export const reviewPromptNextShowTime = signal(0);

// ===== UI state (not persisted to storage) =====
export const activeTab = signal('speed-tab');
export const isLoading = signal(true);

// Load all settings from chrome.storage into signals
export async function initStore() {
  const s = await loadSettings();

  preferredSpeed.value = s.preferredSpeed;
  constantVideoQuality.value = !!s.constantVideoQuality;
  preferredQuality.value = s.preferredQuality || '720p';
  snapPoints.value = Array.isArray(s.snapPoints) ? s.snapPoints : [1.0, 1.5, 2.0, 2.5];

  hideAskAI.value = !!s.hideAskAI;
  hideDoubt.value = !!s.hideDoubt;
  hideChat.value = !!s.hideChat;
  hideNotes.value = !!s.hideNotes;
  hideNoteTimeline.value = !!s.hideNoteTimeline;
  hideSpeed.value = !!s.hideSpeed;
  hideQuality.value = s.hideQuality !== undefined ? !!s.hideQuality : true;
  hideSkipSilence.value = !!s.hideSkipSilence;
  hideSetting.value = !!s.hideSetting;
  hideTimeLine.value = !!s.hideTimeLine;
  hideTimeText.value = !!s.hideTimeText;
  enableInstantHide.value = !!s.enableInstantHide;
  autoPauseOnHide.value = !!s.autoPauseOnHide;

  enableHotkeys.value = !!s.enableHotkeys;
  disableScroll.value = !!s.disableScroll;
  holdSpaceSpeedUp.value = !!s.holdSpaceSpeedUp;
  holdSpaceSpeed.value = s.holdSpaceSpeed ?? 2.0;

  alwaysExpandWidget.value = !!s.alwaysExpandWidget;
  showFinishTime.value = s.showFinishTime !== false; // defaults to true
  finishTimeFormat.value = s.finishTimeFormat || 'minimal';

  keyChat.value = s.keyChat ?? 'c';
  keyTimeline.value = s.keyTimeline ?? 't';
  keyNotes.value = s.keyNotes ?? 'n';
  keyDoubt.value = s.keyDoubt ?? 'd';
  keyFullscreen.value = s.keyFullscreen ?? 'f';
  keyExit.value = s.keyExit ?? 'e';
  allowShortcutsWhenHidden.value = !!s.allowShortcutsWhenHidden;

  const resolvedSpeedKeys = resolveSafeSpeedShortcuts(s, [
    keyChat.value,
    keyTimeline.value,
    keyNotes.value,
    keyDoubt.value,
    keyFullscreen.value,
    keyExit.value,
  ]);
  keySpeedUp.value = resolvedSpeedKeys.keySpeedUp;
  keySlowDown.value = resolvedSpeedKeys.keySlowDown;
  keyReset.value = resolvedSpeedKeys.keyReset;

  const shortcutCleanup: Partial<PopupSettings> = {};
  if (s.keySpeedUp !== keySpeedUp.value) {
    shortcutCleanup.keySpeedUp = keySpeedUp.value;
  }
  if (s.keySlowDown !== keySlowDown.value) {
    shortcutCleanup.keySlowDown = keySlowDown.value;
  }
  if (s.keyReset !== keyReset.value) {
    shortcutCleanup.keyReset = keyReset.value;
  }
  if (Object.keys(shortcutCleanup).length > 0) {
    saveSettings(shortcutCleanup);
  }

  autoHideControls.value = !!s.autoHideControls;
  autoHideDelay.value = s.autoHideDelay ?? 0.8;
  autoHideWhenPaused.value = !!s.autoHideWhenPaused;

  skipSilenceEnabled.value = !!s.skipSilenceEnabled;
  skipSilenceSilenceSpeed.value = s.skipSilenceSilenceSpeed ?? 3.0;
  skipSilenceThreshold.value = s.skipSilenceThreshold ?? -40;
  skipSilenceDynamicThreshold.value = s.skipSilenceDynamicThreshold !== false; // defaults to true
  skipSilenceMute.value = !!s.skipSilenceMute;
  skipSilenceTimeSaved.value = s.skipSilenceTimeSaved ?? 0;
  skipSilenceMinDuration.value = s.skipSilenceMinDuration ?? 0.5;
  skipSilenceLowCpu.value = !!s.skipSilenceLowCpu;

  installDate.value = s.installDate || 0;
  reviewPromptStatus.value = s.reviewPromptStatus || 'pending';
  reviewPromptNextShowTime.value = s.reviewPromptNextShowTime || 0;

  // Listen for real-time updates from content script (e.g., time saved or quality)
  onSettingsChanged((changes) => {
    if (changes.finishTimeFormat !== undefined) {
      finishTimeFormat.value = (changes.finishTimeFormat as FinishTimeFormat) || 'minimal';
    }
    if (changes.keySpeedUp !== undefined) {
      keySpeedUp.value = sanitizeSpeedShortcut(changes.keySpeedUp, 'h');
    }
    if (changes.keySlowDown !== undefined) {
      keySlowDown.value = sanitizeSpeedShortcut(changes.keySlowDown, 'j');
    }
    if (changes.keyReset !== undefined) {
      keyReset.value = sanitizeSpeedShortcut(changes.keyReset, 'l');
    }
    if (changes.keyChat !== undefined) keyChat.value = changes.keyChat;
    if (changes.keyTimeline !== undefined) keyTimeline.value = changes.keyTimeline;
    if (changes.keyNotes !== undefined) keyNotes.value = changes.keyNotes;
    if (changes.keyDoubt !== undefined) keyDoubt.value = changes.keyDoubt;
    if (changes.keyFullscreen !== undefined) keyFullscreen.value = changes.keyFullscreen;
    if (changes.keyExit !== undefined) keyExit.value = changes.keyExit;
    if (changes.allowShortcutsWhenHidden !== undefined) {
      allowShortcutsWhenHidden.value = !!changes.allowShortcutsWhenHidden;
    }
    if (changes.autoHideControls !== undefined) autoHideControls.value = !!changes.autoHideControls;
    if (changes.autoHideDelay !== undefined) autoHideDelay.value = changes.autoHideDelay;
    if (changes.autoHideWhenPaused !== undefined)
      autoHideWhenPaused.value = !!changes.autoHideWhenPaused;
    if (changes.skipSilenceTimeSaved !== undefined) {
      skipSilenceTimeSaved.value = changes.skipSilenceTimeSaved;
    }
    if (changes.preferredQuality !== undefined) {
      preferredQuality.value = changes.preferredQuality;
    }
    if (changes.constantVideoQuality !== undefined) {
      constantVideoQuality.value = !!changes.constantVideoQuality;
    }
    if (changes.hideQuality !== undefined) {
      hideQuality.value = !!changes.hideQuality;
    }
    if (changes.hideSkipSilence !== undefined) {
      hideSkipSilence.value = !!changes.hideSkipSilence;
    }
    if (changes.installDate !== undefined) {
      installDate.value = (changes.installDate as number) || 0;
    }
    if (changes.reviewPromptStatus !== undefined) {
      reviewPromptStatus.value = (changes.reviewPromptStatus as ReviewPromptStatus) || 'pending';
    }
    if (changes.reviewPromptNextShowTime !== undefined) {
      reviewPromptNextShowTime.value = (changes.reviewPromptNextShowTime as number) || 0;
    }
  });

  isLoading.value = false;
}
