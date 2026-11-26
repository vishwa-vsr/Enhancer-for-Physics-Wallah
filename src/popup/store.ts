import { signal } from '@preact/signals';
import {
  DEFAULT_SETTINGS,
  FinishTimeFormat,
  PopupSettings,
  ReviewPromptStatus,
  VideoQuality,
} from '@shared/types';
import { loadSettings, onSettingsChanged, saveSettings } from '@shared/storage';
import {
  getReservedShortcutWarning,
  resolveSafeSpeedShortcuts,
  sanitizeSpeedShortcut,
} from '@shared/shortcuts';

export { getReservedShortcutWarning, sanitizeSpeedShortcut };

// ===== Speed & Quality signals =====
export const preferredSpeed = signal(DEFAULT_SETTINGS.preferredSpeed);
export const constantVideoQuality = signal(DEFAULT_SETTINGS.constantVideoQuality);
export const preferredQuality = signal<VideoQuality>(DEFAULT_SETTINGS.preferredQuality);
export const snapPoints = signal<number[]>([...DEFAULT_SETTINGS.snapPoints]);

// ===== Focus toggle signals (match chrome.storage keys exactly) =====
export const hideAskAI = signal(DEFAULT_SETTINGS.hideAskAI);
export const hideDoubt = signal(DEFAULT_SETTINGS.hideDoubt);
export const hideChat = signal(DEFAULT_SETTINGS.hideChat);
export const hideNotes = signal(DEFAULT_SETTINGS.hideNotes);
export const hideNoteTimeline = signal(DEFAULT_SETTINGS.hideNoteTimeline);
export const hideTimeLine = signal(DEFAULT_SETTINGS.hideTimeLine);
export const hideTimeText = signal(DEFAULT_SETTINGS.hideTimeText);
export const hideSpeed = signal(DEFAULT_SETTINGS.hideSpeed);
export const hideQuality = signal(DEFAULT_SETTINGS.hideQuality);
export const hideSetting = signal(DEFAULT_SETTINGS.hideSetting);
export const enableInstantHide = signal(DEFAULT_SETTINGS.enableInstantHide);
export const autoSkipPromoAds = signal(DEFAULT_SETTINGS.autoSkipPromoAds);
export const blockRecordedPolls = signal(DEFAULT_SETTINGS.blockRecordedPolls);
export const enableSlideViewer = signal(DEFAULT_SETTINGS.enableSlideViewer);
export const keySlideViewer = signal(DEFAULT_SETTINGS.keySlideViewer);
export const autoPauseOnHide = signal(DEFAULT_SETTINGS.autoPauseOnHide);

// ===== Shortcut signals =====
export const enableHotkeys = signal(DEFAULT_SETTINGS.enableHotkeys);
export const speedScrollEnabled = signal(DEFAULT_SETTINGS.speedScrollEnabled);
export const volumeScrollEnabled = signal(DEFAULT_SETTINGS.volumeScrollEnabled);
export const volumeScrollMouseStep = signal(DEFAULT_SETTINGS.volumeScrollMouseStep);
export const volumeScrollTrackpadStep = signal(DEFAULT_SETTINGS.volumeScrollTrackpadStep);
export const showVolumeBubble = signal(DEFAULT_SETTINGS.showVolumeBubble);
export const volumeBubbleDelay = signal(DEFAULT_SETTINGS.volumeBubbleDelay);
export const holdSpaceSpeedUp = signal(DEFAULT_SETTINGS.holdSpaceSpeedUp);
export const holdSpaceSpeed = signal(DEFAULT_SETTINGS.holdSpaceSpeed);
export const keySpeedUp = signal(DEFAULT_SETTINGS.keySpeedUp);
export const keySlowDown = signal(DEFAULT_SETTINGS.keySlowDown);
export const keyReset = signal(DEFAULT_SETTINGS.keyReset);
export const alwaysExpandWidget = signal(DEFAULT_SETTINGS.alwaysExpandWidget);
export const lectureTimeEnabled = signal(DEFAULT_SETTINGS.lectureTimeEnabled);
export const showFinishTime = signal(DEFAULT_SETTINGS.showFinishTime);
export const finishTimeFormat = signal<FinishTimeFormat>(DEFAULT_SETTINGS.finishTimeFormat);
export const showLiveCatchUp = signal(DEFAULT_SETTINGS.showLiveCatchUp);

// ===== Focus shortcuts signals (Issue #14) =====
export const enableFocusShortcuts = signal(DEFAULT_SETTINGS.enableFocusShortcuts);
export const enableKeyChat = signal(DEFAULT_SETTINGS.enableKeyChat);
export const enableKeyTimeline = signal(DEFAULT_SETTINGS.enableKeyTimeline);
export const enableKeyNotes = signal(DEFAULT_SETTINGS.enableKeyNotes);
export const enableKeyDoubt = signal(DEFAULT_SETTINGS.enableKeyDoubt);
export const enableKeyFullscreen = signal(DEFAULT_SETTINGS.enableKeyFullscreen);
export const enableKeyExit = signal(DEFAULT_SETTINGS.enableKeyExit);
export const keyChat = signal(DEFAULT_SETTINGS.keyChat);
export const keyTimeline = signal(DEFAULT_SETTINGS.keyTimeline);
export const keyNotes = signal(DEFAULT_SETTINGS.keyNotes);
export const keyDoubt = signal(DEFAULT_SETTINGS.keyDoubt);
export const keyFullscreen = signal(DEFAULT_SETTINGS.keyFullscreen);
export const keyExit = signal(DEFAULT_SETTINGS.keyExit);
export const allowShortcutsWhenHidden = signal(DEFAULT_SETTINGS.allowShortcutsWhenHidden);
export const showShortcutAlerts = signal(DEFAULT_SETTINGS.showShortcutAlerts);

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

// ===== Auto-hide signals =====
export const autoHideControls = signal(DEFAULT_SETTINGS.autoHideControls);
export const autoHideDelay = signal(DEFAULT_SETTINGS.autoHideDelay);
export const autoHideWhenPaused = signal(DEFAULT_SETTINGS.autoHideWhenPaused);

// ===== Skip Silence signals =====
export const skipSilenceEnabled = signal(DEFAULT_SETTINGS.skipSilenceEnabled);
export const skipSilenceActive = signal(DEFAULT_SETTINGS.skipSilenceActive);
export const skipSilenceSilenceSpeed = signal(DEFAULT_SETTINGS.skipSilenceSilenceSpeed);
export const skipSilenceThreshold = signal(DEFAULT_SETTINGS.skipSilenceThreshold);
export const skipSilenceDynamicThreshold = signal(DEFAULT_SETTINGS.skipSilenceDynamicThreshold);
export const skipSilenceMute = signal(DEFAULT_SETTINGS.skipSilenceMute);
export const skipSilenceTimeSaved = signal(DEFAULT_SETTINGS.skipSilenceTimeSaved);
export const skipSilenceMinDuration = signal(DEFAULT_SETTINGS.skipSilenceMinDuration);
export const skipSilenceLowCpu = signal(DEFAULT_SETTINGS.skipSilenceLowCpu);

// ===== Ear Protection signal (Issue #6) =====
export const volumeBalancerEnabled = signal(DEFAULT_SETTINGS.volumeBalancerEnabled);

// ===== Review prompt & onboarding signals =====
export const installDate = signal(DEFAULT_SETTINGS.installDate);
export const reviewPromptStatus = signal<ReviewPromptStatus>(DEFAULT_SETTINGS.reviewPromptStatus);
export const reviewPromptNextShowTime = signal(DEFAULT_SETTINGS.reviewPromptNextShowTime);
export const hasSeenRefreshPrompt = signal(DEFAULT_SETTINGS.hasSeenRefreshPrompt);

// ===== UI state signals =====
export const activeTab = signal('speed-tab');
export const isLoading = signal(true);

const BOOLEAN_SIGNALS: Array<[keyof PopupSettings, { value: boolean }, boolean]> = [
  ['constantVideoQuality', constantVideoQuality, false],
  ['hideAskAI', hideAskAI, false],
  ['hideDoubt', hideDoubt, false],
  ['hideChat', hideChat, false],
  ['hideNotes', hideNotes, false],
  ['hideNoteTimeline', hideNoteTimeline, false],
  ['hideTimeLine', hideTimeLine, false],
  ['hideTimeText', hideTimeText, false],
  ['hideSpeed', hideSpeed, false],
  ['hideQuality', hideQuality, true],
  ['hideSetting', hideSetting, false],
  ['enableInstantHide', enableInstantHide, false],
  ['autoSkipPromoAds', autoSkipPromoAds, false],
  ['blockRecordedPolls', blockRecordedPolls, false],
  ['enableSlideViewer', enableSlideViewer, true],
  ['autoPauseOnHide', autoPauseOnHide, false],
  ['enableHotkeys', enableHotkeys, false],
  ['speedScrollEnabled', speedScrollEnabled, true],
  ['volumeScrollEnabled', volumeScrollEnabled, false],
  ['showVolumeBubble', showVolumeBubble, true],
  ['holdSpaceSpeedUp', holdSpaceSpeedUp, false],
  ['alwaysExpandWidget', alwaysExpandWidget, false],
  ['lectureTimeEnabled', lectureTimeEnabled, true],
  ['showFinishTime', showFinishTime, true],
  ['showLiveCatchUp', showLiveCatchUp, true],
  ['enableFocusShortcuts', enableFocusShortcuts, false],
  ['enableKeyChat', enableKeyChat, true],
  ['enableKeyTimeline', enableKeyTimeline, true],
  ['enableKeyNotes', enableKeyNotes, true],
  ['enableKeyDoubt', enableKeyDoubt, true],
  ['enableKeyFullscreen', enableKeyFullscreen, true],
  ['enableKeyExit', enableKeyExit, true],
  ['allowShortcutsWhenHidden', allowShortcutsWhenHidden, false],
  ['showShortcutAlerts', showShortcutAlerts, true],
  ['autoHideControls', autoHideControls, false],
  ['autoHideWhenPaused', autoHideWhenPaused, false],
  ['skipSilenceEnabled', skipSilenceEnabled, false],
  ['skipSilenceActive', skipSilenceActive, false],
  ['skipSilenceDynamicThreshold', skipSilenceDynamicThreshold, true],
  ['skipSilenceMute', skipSilenceMute, false],
  ['skipSilenceLowCpu', skipSilenceLowCpu, false],
  ['volumeBalancerEnabled', volumeBalancerEnabled, false],
  ['hasSeenRefreshPrompt', hasSeenRefreshPrompt, false],
];

const NULLISH_SIGNALS: Array<[keyof PopupSettings, { value: unknown }, unknown]> = [
  ['volumeScrollMouseStep', volumeScrollMouseStep, 5],
  ['volumeScrollTrackpadStep', volumeScrollTrackpadStep, 2],
  ['volumeBubbleDelay', volumeBubbleDelay, 0.4],
  ['holdSpaceSpeed', holdSpaceSpeed, 2.0],
  ['autoHideDelay', autoHideDelay, 0.8],
  ['skipSilenceSilenceSpeed', skipSilenceSilenceSpeed, 6.0],
  ['skipSilenceThreshold', skipSilenceThreshold, -40],
  ['skipSilenceTimeSaved', skipSilenceTimeSaved, 0],
  ['skipSilenceMinDuration', skipSilenceMinDuration, 0.5],
  ['keyChat', keyChat, 'c'],
  ['keyTimeline', keyTimeline, 't'],
  ['keyNotes', keyNotes, 'n'],
  ['keyDoubt', keyDoubt, 'd'],
  ['keyFullscreen', keyFullscreen, 'f'],
  ['keyExit', keyExit, 'e'],
];

const SHORTCUT_SANITIZE_DEFAULTS: Record<'keySpeedUp' | 'keySlowDown' | 'keyReset', [typeof keySpeedUp, string]> = {
  keySpeedUp: [keySpeedUp, 'h'],
  keySlowDown: [keySlowDown, 'j'],
  keyReset: [keyReset, 'l'],
};

function applyCustomPopupChange(key: keyof PopupSettings, val: unknown): void {
  if (key === 'preferredSpeed' && val !== undefined) preferredSpeed.value = val as number;
  else if (key === 'preferredQuality') preferredQuality.value = (val as VideoQuality) || '720p';
  else if (key === 'snapPoints')
    snapPoints.value = Array.isArray(val) ? (val as number[]) : [1.0, 1.5, 2.0, 2.5];
  else if (key === 'keySlideViewer') keySlideViewer.value = (val as string) || 't';
  else if (key === 'finishTimeFormat')
    finishTimeFormat.value = val === 'full' ? 'full' : 'clock';
  else if (key === 'installDate') installDate.value = (val as number) || 0;
  else if (key === 'reviewPromptStatus')
    reviewPromptStatus.value = (val as ReviewPromptStatus) || 'pending';
  else if (key === 'reviewPromptNextShowTime') reviewPromptNextShowTime.value = (val as number) || 0;
  else if (key in SHORTCUT_SANITIZE_DEFAULTS) {
    const [sig, fallback] = SHORTCUT_SANITIZE_DEFAULTS[key as keyof typeof SHORTCUT_SANITIZE_DEFAULTS];
    sig.value = sanitizeSpeedShortcut(val, fallback);
  }
}

// Load all settings from chrome.storage into signals
export async function initStore() {
  const s = await loadSettings();

  for (const [key, sig, defaultTrue] of BOOLEAN_SIGNALS) {
    sig.value = defaultTrue ? s[key] !== false : !!s[key];
  }
  for (const [key, sig, fallback] of NULLISH_SIGNALS) {
    sig.value = s[key] ?? fallback;
  }
  for (const key of [
    'preferredSpeed',
    'preferredQuality',
    'snapPoints',
    'keySlideViewer',
    'finishTimeFormat',
    'installDate',
    'reviewPromptStatus',
    'reviewPromptNextShowTime',
  ] as const) {
    applyCustomPopupChange(key, s[key]);
  }

  const resolvedSpeedKeys = resolveSafeSpeedShortcuts(s, [
    keyChat.value,
    keyTimeline.value,
    keyNotes.value,
    keyDoubt.value,
    keyFullscreen.value,
    keyExit.value,
  ]);
  const shortcutCleanup: Partial<PopupSettings> = {};
  for (const k of ['keySpeedUp', 'keySlowDown', 'keyReset'] as const) {
    const sig = SHORTCUT_SANITIZE_DEFAULTS[k][0];
    sig.value = resolvedSpeedKeys[k];
    if (s[k] !== sig.value) shortcutCleanup[k] = sig.value;
  }
  if (Object.keys(shortcutCleanup).length > 0) {
    saveSettings(shortcutCleanup);
  }

  // Listen for real-time updates from content script (e.g., time saved or quality)
  onSettingsChanged((changes) => {
    for (const [key, sig, defaultTrue] of BOOLEAN_SIGNALS) {
      if (changes[key] !== undefined) {
        sig.value = defaultTrue && key !== 'hideQuality' ? changes[key] !== false : !!changes[key];
      }
    }
    for (const [key, sig] of NULLISH_SIGNALS) {
      if (changes[key] !== undefined) {
        sig.value = changes[key];
      }
    }
    for (const key of Object.keys(changes) as (keyof PopupSettings)[]) {
      if (changes[key] !== undefined) {
        applyCustomPopupChange(key, changes[key]);
      }
    }
  });

  isLoading.value = false;
}
