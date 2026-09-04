// ===== Theme & Format Types =====
export type ThemeMode = 'light' | 'dark';
export type FinishTimeFormat = 'minimal' | 'clock' | 'full';
export type SilenceState = 'idle' | 'speech' | 'silence';
export type VideoQuality = 'auto' | '720p' | '480p' | '360p' | '240p';

// ===== Hide / Focus Settings =====
export interface HideSettings {
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
}

// ===== Full Content Script State =====
export interface ContentState {
  // Speed & Quality controls
  currentSpeed: number;
  constantVideoQuality: boolean;
  preferredQuality: VideoQuality;
  snapPoints: number[];

  // Focus & Distraction toggles
  hideSettings: HideSettings;
  enableInstantHide: boolean;

  // Shortcuts & UI settings
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
  skipSilenceThreshold: number;
  skipSilenceDynamicThreshold: boolean;
  skipSilenceMute: boolean;
  skipSilenceTimeSaved: number;
  skipSilenceMinDuration: number;

  // Extension status
  extensionEnabled: boolean;
}

// ===== Audio Graph Cache Interface =====
export interface AudioGraph {
  context: AudioContext;
  sourceNode: MediaElementAudioSourceNode;
  delayNode: DelayNode;
  gainNode: GainNode;
  workletNode: AudioWorkletNode;
}

// ===== State Change Listener Type =====
export type StateChangeListener = (state: ContentState, changedKeys: string[]) => void;
