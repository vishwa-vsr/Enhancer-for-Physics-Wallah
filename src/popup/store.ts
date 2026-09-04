import { signal } from '@preact/signals';
import { FinishTimeFormat, ReviewPromptStatus, VideoQuality } from '@shared/types';
import { loadSettings, onSettingsChanged } from '@shared/storage';

// ===== Speed & Quality signals =====
export const preferredSpeed = signal(1.0);
export const constantVideoQuality = signal(false);
export const preferredQuality = signal<VideoQuality>('720p');
export const snapPoints = signal<number[]>([1.0, 2.0, 3.0, 4.0]);

// ===== Focus toggle signals (match chrome.storage keys exactly) =====
export const hideAskAI = signal(false);
export const hideDoubt = signal(false);
export const hideChat = signal(false);
export const hideNotes = signal(false);
export const hideNoteTimeline = signal(false);
export const hideSpeed = signal(false);
export const hideQuality = signal(true);
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

// ===== Skip Silence signals =====
export const skipSilenceEnabled = signal(false);
export const skipSilenceSilenceSpeed = signal(3.0);
export const skipSilenceThreshold = signal(-40);
export const skipSilenceDynamicThreshold = signal(true);
export const skipSilenceMute = signal(false);
export const skipSilenceTimeSaved = signal(0);
export const skipSilenceMinDuration = signal(0.5);

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
  snapPoints.value = Array.isArray(s.snapPoints) ? s.snapPoints : [1, 2, 3, 4];

  hideAskAI.value = !!s.hideAskAI;
  hideDoubt.value = !!s.hideDoubt;
  hideChat.value = !!s.hideChat;
  hideNotes.value = !!s.hideNotes;
  hideNoteTimeline.value = !!s.hideNoteTimeline;
  hideSpeed.value = !!s.hideSpeed;
  hideQuality.value = s.hideQuality !== undefined ? !!s.hideQuality : true;
  hideSetting.value = !!s.hideSetting;
  hideTimeLine.value = !!s.hideTimeLine;
  hideTimeText.value = !!s.hideTimeText;
  enableInstantHide.value = !!s.enableInstantHide;
  autoPauseOnHide.value = !!s.autoPauseOnHide;

  enableHotkeys.value = !!s.enableHotkeys;
  disableScroll.value = !!s.disableScroll;
  holdSpaceSpeedUp.value = !!s.holdSpaceSpeedUp;
  holdSpaceSpeed.value = s.holdSpaceSpeed ?? 2.0;
  keySpeedUp.value = s.keySpeedUp || 'h';
  keySlowDown.value = s.keySlowDown || 'j';
  keyReset.value = s.keyReset || 'l';
  alwaysExpandWidget.value = !!s.alwaysExpandWidget;
  showFinishTime.value = s.showFinishTime !== false; // defaults to true
  finishTimeFormat.value = s.finishTimeFormat || 'minimal';

  skipSilenceEnabled.value = !!s.skipSilenceEnabled;
  skipSilenceSilenceSpeed.value = s.skipSilenceSilenceSpeed ?? 3.0;
  skipSilenceThreshold.value = s.skipSilenceThreshold ?? -40;
  skipSilenceDynamicThreshold.value = s.skipSilenceDynamicThreshold !== false; // defaults to true
  skipSilenceMute.value = !!s.skipSilenceMute;
  skipSilenceTimeSaved.value = s.skipSilenceTimeSaved ?? 0;
  skipSilenceMinDuration.value = s.skipSilenceMinDuration ?? 0.5;

  installDate.value = s.installDate || 0;
  reviewPromptStatus.value = s.reviewPromptStatus || 'pending';
  reviewPromptNextShowTime.value = s.reviewPromptNextShowTime || 0;

  // Listen for real-time updates from content script (e.g., time saved or quality)
  onSettingsChanged((changes) => {
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
  });

  isLoading.value = false;
}
