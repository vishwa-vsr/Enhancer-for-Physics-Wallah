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

  // Focus shortcuts (Issue #14)
  keyChat: string;
  keyTimeline: string;
  keyNotes: string;
  keyDoubt: string;
  keyFullscreen: string;
  keyExit: string;

  // Auto-hide controls & cursor (Issue #14)
  autoHideControls: boolean;
  autoHideDelay: number;
  autoHideWhenPaused: boolean;

  // Skip Silence settings
  skipSilenceEnabled: boolean;
  skipSilenceSilenceSpeed: number;
  skipSilenceThreshold: number;
  skipSilenceDynamicThreshold: boolean;
  skipSilenceMute: boolean;
  skipSilenceTimeSaved: number;
  skipSilenceMinDuration: number;
  skipSilenceLowCpu: boolean;

  // Extension status
  extensionEnabled: boolean;
  themeMode: ThemeMode;
}

// ===== Audio Graph Cache Interface =====
export interface AudioGraph {
  context: AudioContext;
  sourceNode: MediaElementAudioSourceNode | MediaStreamAudioSourceNode;
  delayNode?: DelayNode | null;
  gainNode?: GainNode | null;
  workletNode?: AudioWorkletNode | null;
  analyserNode?: AnalyserNode | null;
  isStream?: boolean;
}

// ===== State Change Listener Type =====
export type StateChangeListener = (state: ContentState, changedKeys: string[]) => void;

// ===== DOM & Window Extension Types for Audio Caching =====
export interface PWCEnhancedVideoElement extends HTMLVideoElement {
  _pwcSourceNode?: MediaElementAudioSourceNode | MediaStreamAudioSourceNode | null;
  _pwcAudioGraph?: AudioGraph | null;
  _pwcIsStreamSource?: boolean;
  captureStream?: () => MediaStream;
  mozCaptureStream?: () => MediaStream;
}

export interface PWCEnhancedWindow extends Window {
  __pwcAudioContext?: AudioContext | null;
}
