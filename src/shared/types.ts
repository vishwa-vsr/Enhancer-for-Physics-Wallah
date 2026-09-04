// ===== Theme & Format Types =====
export type ThemeMode = 'light' | 'dark';
export type FinishTimeFormat = 'minimal' | 'clock' | 'full';
export type ReviewPromptStatus = 'pending' | 'reviewed' | 'dismissed_permanently';
export type VideoQuality = 'auto' | '720p' | '480p' | '360p' | '240p';

// ===== All chrome.storage keys used by the popup =====
export interface PopupSettings {
  // Speed controls
  preferredSpeed: number;
  constantVideoQuality: boolean;
  preferredQuality: VideoQuality;
  snapPoints: number[]; // Array of 4 snap point values, e.g. [1.0, 2.0, 3.0, 4.0]

  // Focus toggles (hide UI elements on PW)
  hideAskAI: boolean;
  hideDoubt: boolean;
  hideChat: boolean;
  hideNotes: boolean;
  hideNoteTimeline: boolean;
  hideSpeed: boolean;
  hideQuality: boolean;
  hideSetting: boolean;
  hideTimeLine: boolean;
  hideTimeText: boolean;
  enableInstantHide: boolean;

  // Shortcut & control settings
  enableHotkeys: boolean;
  disableScroll: boolean;
  holdSpaceSpeedUp: boolean;
  holdSpaceSpeed: number;
  alwaysExpandWidget: boolean;
  showFinishTime: boolean;
  finishTimeFormat: FinishTimeFormat;
  keySpeedUp: string;
  keySlowDown: string;
  keyReset: string;
  autoPauseOnHide: boolean;

  // Skip Silence settings
  skipSilenceEnabled: boolean;
  skipSilenceSilenceSpeed: number;
  skipSilenceThreshold: number; // dB value, e.g. -40
  skipSilenceDynamicThreshold: boolean;
  skipSilenceMute: boolean;
  skipSilenceTimeSaved: number; // milliseconds
  skipSilenceMinDuration: number; // seconds, e.g. 0.5

  // Extension state
  extensionEnabled: boolean;
  themeMode: ThemeMode;

  // Review prompt
  installDate: number; // Unix timestamp
  reviewPromptStatus: ReviewPromptStatus;
  reviewPromptNextShowTime: number; // Unix timestamp
}

// ===== Defaults matching existing popup.js behavior =====
export const DEFAULT_SETTINGS: PopupSettings = {
  preferredSpeed: 1.0,
  constantVideoQuality: false,
  preferredQuality: '720p',
  snapPoints: [1.0, 2.0, 3.0, 4.0],

  hideAskAI: false,
  hideDoubt: false,
  hideChat: false,
  hideNotes: false,
  hideNoteTimeline: false,
  hideSpeed: false,
  hideQuality: true,
  hideSetting: false,
  hideTimeLine: false,
  hideTimeText: false,
  enableInstantHide: false,

  enableHotkeys: false,
  disableScroll: false,
  holdSpaceSpeedUp: false,
  holdSpaceSpeed: 2.0,
  alwaysExpandWidget: false,
  showFinishTime: true,
  finishTimeFormat: 'minimal',
  keySpeedUp: 'h',
  keySlowDown: 'j',
  keyReset: 'l',
  autoPauseOnHide: false,

  skipSilenceEnabled: false,
  skipSilenceSilenceSpeed: 3.0,
  skipSilenceThreshold: -40,
  skipSilenceDynamicThreshold: true,
  skipSilenceMute: false,
  skipSilenceTimeSaved: 0,
  skipSilenceMinDuration: 0.5,

  extensionEnabled: true,
  themeMode: 'dark',

  installDate: 0,
  reviewPromptStatus: 'pending',
  reviewPromptNextShowTime: 0,
};
