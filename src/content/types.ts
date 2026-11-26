import type {
  FinishTimeFormat,
  HideSettings,
  PopupSettings,
  ThemeMode,
  VideoQuality,
} from '../shared/types';

export type { FinishTimeFormat, HideSettings, ThemeMode, VideoQuality };

export type SilenceState = 'idle' | 'speech' | 'silence';

type PopupOnlyStateKey =
  | 'preferredSpeed'
  | keyof HideSettings
  | 'showDashboardScrollbars'
  | 'showPopupScrollbar'
  | 'installDate'
  | 'reviewPromptStatus'
  | 'reviewPromptNextShowTime'
  | 'hasSeenRefreshPrompt';

// ===== Full Content Script State =====
export interface ContentState extends Omit<PopupSettings, PopupOnlyStateKey> {
  currentSpeed: number;
  hideSettings: HideSettings;
}

// ===== Audio Graph Cache Interface =====
export interface AudioGraph {
  context: AudioContext;
  sourceNode: MediaElementAudioSourceNode | MediaStreamAudioSourceNode;
  delayNode?: DelayNode | null;
  compressorNode?: DynamicsCompressorNode | null;
  balancerGainNode?: GainNode | null;
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
