import { AudioGraph, SilenceState } from '../../types';
import { state, safeSetSettings } from '../../state';
import { getActiveVideo } from '../video/detector';
import { setVideoPlaybackRate } from '../video/controller';
import { showInfoToast } from '../ui/toast';
import { isUserHoldingSpace } from '../shortcuts/space-hold';
import { updateSkipSilenceUI, manageSSVisualizerInterval } from '../ui/silence-hud';
import { updateUI } from '../ui/speed-hud';

// Inline AudioWorklet processor code for skip silence volume detection
export const VOLUME_PROCESSOR_CODE = `
class VolumeProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this._rms = 0;
    this._count = 0;
    this._enabled = true;
    this.port.onmessage = (e) => { this._enabled = e.data; };
  }
  process(inputs, outputs) {
    const input = inputs[0];
    if (!input || !input.length) return true;
    const samples = input[0];
    if (!samples) return true;
    let sum = 0;
    for (let i = 0; i < samples.length; i++) {
      sum += samples[i] * samples[i];
    }
    this._rms += sum / samples.length;
    this._count += 1;
    // Report every ~1024 samples (~23ms at 44.1kHz)
    if (this._count >= Math.ceil(1024 / samples.length)) {
      if (this._enabled) {
        this.port.postMessage(Math.sqrt(this._rms / this._count));
      }
      this._rms = 0;
      this._count = 0;
    }
    return true;
  }
}
registerProcessor('pwc-volume-processor', VolumeProcessor);
`;

// Engine state
let ssAudioContext: AudioContext | null = null;
let ssSourceNode: MediaElementAudioSourceNode | null = null;
let ssWorkletNode: AudioWorkletNode | null = null;
let ssDelayNode: DelayNode | null = null;
let ssGainNode: GainNode | null = null;
let ssConnectedVideo: HTMLVideoElement | null = null;
let ssCurrentState: SilenceState = 'idle';
let ssIsSilentNow = false;
let ssSilenceStartTime = 0;
let ssSilentMsAccumulated = 0;
const ssVolumeHistory: number[] = [];
let ssCalculatedNoiseFloorDb = -45;
let ssSamplesSinceCalc = 0;
let ssLastVolumeLevel = 0;
let ssLastVolumeDb = -100;
let ssEngineRunning = false;
let ssInitializing = false;
let skipSilenceSessionSaved = 0;
let ssSaveTimer: ReturnType<typeof setTimeout> | null = null;

export function getSSSilenceStartTime(): number {
  return ssSilenceStartTime;
}

export function getSSLastVolumeDb(): number {
  return ssLastVolumeDb;
}

export function getSSSourceNode(): MediaElementAudioSourceNode | null {
  return ssSourceNode;
}

export function getSSDelayNode(): DelayNode | null {
  return ssDelayNode;
}

export function isSSEngineRunning(): boolean {
  return ssEngineRunning;
}

export function getSSCurrentState(): SilenceState {
  return ssCurrentState;
}

export function getSSLastVolumeLevel(): number {
  return ssLastVolumeLevel;
}

export function getSSSessionSaved(): number {
  return skipSilenceSessionSaved;
}

export function resetSSSessionSaved(): void {
  skipSilenceSessionSaved = 0;
}

export function getSSConnectedVideo(): HTMLVideoElement | null {
  return ssConnectedVideo;
}

export function getSSAudioContext(): AudioContext | null {
  return ssAudioContext;
}

export function getSSGainNode(): GainNode | null {
  return ssGainNode;
}

// Convert raw RMS to Decibels (dB), clamped between -100dB and 0dB
export function rmsToDb(rms: number): number {
  if (!rms || rms <= 0.000001) return -100;
  const db = 20 * Math.log10(rms);
  return Math.max(-100, Math.min(0, Math.round(db * 10) / 10));
}

// Converts or clamps manual threshold to dB (-60dB to -20dB)
export function manualThresholdToDb(val: number): number {
  if (typeof val === 'number' && val < 0) {
    return Math.max(-60, Math.min(-20, val));
  }
  // Fallback if legacy 1-100 scale: 1 -> -60dB, 100 -> -20dB
  const legacy = Math.max(1, Math.min(100, val || 30));
  return Math.round(-60 + ((legacy - 1) / 99) * 40);
}

// Calculate effective thresholds with 3dB Hysteresis (Schmitt Trigger)
export function getEffectiveThresholds(): { silenceThresholdDb: number; speechThresholdDb: number } {
  let baseDb: number;
  if (state.skipSilenceDynamicThreshold) {
    baseDb = ssCalculatedNoiseFloorDb;
  } else {
    baseDb = manualThresholdToDb(state.skipSilenceThreshold);
  }
  // Hysteresis: drop below baseDb to enter silence, rise above baseDb + 3dB to exit silence
  return {
    silenceThresholdDb: baseDb,
    speechThresholdDb: baseDb + 3,
  };
}

// Rolling volume history buffer for dynamic noise-floor auto-calibration (~10s history)
export function updateDynamicNoiseFloor(db: number): void {
  if (!Number.isFinite(db)) return;
  ssVolumeHistory.push(db);
  if (ssVolumeHistory.length > 470) {
    ssVolumeHistory.shift();
  }
  // Recalculate roughly once every ~23 samples (~500ms)
  ssSamplesSinceCalc++;
  if (ssSamplesSinceCalc >= 23 && ssVolumeHistory.length >= 47) {
    ssSamplesSinceCalc = 0;
    const sorted = ssVolumeHistory.slice().sort((a, b) => a - b);
    const p15Index = Math.floor(sorted.length * 0.15);
    const noiseFloor = sorted[p15Index];
    // 15th percentile noise floor + 3dB margin, clamped within realistic boundaries (-60dB to -20dB)
    ssCalculatedNoiseFloorDb = Math.max(-60, Math.min(-20, Math.round((noiseFloor + 3) * 10) / 10));
  }
}

// Helper to ensure AudioContext stays awake across browser autoplay policies
export function resumeAudioContextOnInteraction(audioCtx: AudioContext): void {
  if (!audioCtx || audioCtx.state !== 'suspended') return;
  audioCtx.resume();
  const resumeFn = () => {
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  };
  document.addEventListener('pointerdown', resumeFn, { once: true, capture: true });
  document.addEventListener('keydown', resumeFn, { once: true, capture: true });
}

// Permanent Audio Graph cache per HTMLMediaElement (WeakMap + DOM property fallback)
const videoAudioGraphs = new WeakMap<HTMLVideoElement, AudioGraph>();

export function getCachedAudioGraph(video: HTMLVideoElement): AudioGraph | null {
  if (!video) return null;
  return videoAudioGraphs.get(video) || (video as any)._pwcAudioGraph || null;
}

// Initialize or resume the audio pipeline for skip silence
export async function ssInit(): Promise<void> {
  const video = getActiveVideo();
  if (!video || ssInitializing) return;

  ssInitializing = true;
  try {
    let graph = getCachedAudioGraph(video);

    if (!graph) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtxClass();

      // Create worklet from inline code via Blob URL
      const blob = new Blob([VOLUME_PROCESSOR_CODE], { type: 'application/javascript' });
      const workletUrl = URL.createObjectURL(blob);
      await audioCtx.audioWorklet.addModule(workletUrl);
      URL.revokeObjectURL(workletUrl);

      // Create source node once per video element
      const sourceNode = audioCtx.createMediaElementSource(video);

      // Create delay node for lookahead buffer (60ms)
      const delayNode = audioCtx.createDelay(1.0);
      delayNode.delayTime.value = 0.06;

      // Create gain node for muting during silence
      const gainNode = audioCtx.createGain();
      gainNode.gain.value = 1.0;

      // Create worklet node for volume analysis
      const workletNode = new AudioWorkletNode(audioCtx, 'pwc-volume-processor');

      // Audio routing:
      // video -> source -> delay -> gain -> destination (speakers)
      // video -> source -> workletNode (volume analysis, no output)
      sourceNode.connect(delayNode);
      delayNode.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      sourceNode.connect(workletNode);

      graph = {
        context: audioCtx,
        sourceNode: sourceNode,
        delayNode: delayNode,
        gainNode: gainNode,
        workletNode: workletNode,
      };

      videoAudioGraphs.set(video, graph);
      (video as any)._pwcAudioGraph = graph;
    }

    // Ensure AudioContext is resumed
    resumeAudioContextOnInteraction(graph.context);

    // Point current engine references to this active video's graph
    ssAudioContext = graph.context;
    ssSourceNode = graph.sourceNode;
    ssDelayNode = graph.delayNode;
    ssGainNode = graph.gainNode;
    ssWorkletNode = graph.workletNode;
    ssConnectedVideo = video;

    // Enable worklet message reporting
    ssWorkletNode.port.postMessage(true);
    ssWorkletNode.port.onmessage = (event) => {
      if (!ssEngineRunning || isUserHoldingSpace()) return;
      ssLastVolumeLevel = event.data;
      const db = rmsToDb(event.data);
      ssLastVolumeDb = db;
      ssProcessVolume(db);
    };

    ssEngineRunning = true;
    ssCurrentState = 'speech';
    ssIsSilentNow = false;
    ssSilentMsAccumulated = 0;
    ssInitializing = false;
    updateSkipSilenceUI();
    manageSSVisualizerInterval();
  } catch (err: any) {
    ssInitializing = false;
    ssEngineRunning = false;
    console.warn('PW Control: Skip Silence init failed:', err.message);
    if (
      err.name === 'NotSupportedError' ||
      (err.message && (err.message.includes('CORS') || err.message.includes('cross-origin')))
    ) {
      showInfoToast('Skip Silence: Video source blocked (CORS)');
    }
    ssDestroy();
  }
}

// Smoothly enter silence state (exponential fade out)
export function ssEnterSilence(): void {
  if (state.skipSilenceMute && ssGainNode && ssAudioContext) {
    const now = ssAudioContext.currentTime;
    ssGainNode.gain.cancelScheduledValues(now);
    ssGainNode.gain.setTargetAtTime(0, now, 0.015);
  }
}

// Smoothly exit silence state (restore speed + exponential fade in)
export function ssExitSilence(): void {
  const normalSpeed = state.extensionEnabled ? state.currentSpeed : 1.0;
  setVideoPlaybackRate(normalSpeed);
  if (ssGainNode && ssAudioContext) {
    const now = ssAudioContext.currentTime;
    ssGainNode.gain.cancelScheduledValues(now);
    ssGainNode.gain.setTargetAtTime(1, now, 0.04);
  }
  updateUI();
}

// Disable the skip silence engine (never disconnect source to prevent re-creation errors)
export function ssDestroy(): void {
  ssEngineRunning = false;
  ssCurrentState = 'idle';
  ssIsSilentNow = false;
  ssSilentMsAccumulated = 0;

  // Stop worklet processing
  if (ssWorkletNode) {
    try {
      ssWorkletNode.port.postMessage(false);
    } catch (_e) {
      // Ignored: worklet already terminated
    }
  }

  // Unmute gain node so audio is completely normal
  if (ssGainNode && ssAudioContext) {
    try {
      ssGainNode.gain.cancelScheduledValues(ssAudioContext.currentTime);
      ssGainNode.gain.setValueAtTime(1.0, ssAudioContext.currentTime);
    } catch (_e) {
      // Ignored: context already closed
    }
  }

  // Restore normal playback speed
  const video = getActiveVideo();
  if (video && !isUserHoldingSpace()) {
    const normalSpeed = state.extensionEnabled ? state.currentSpeed : 1.0;
    if (video.playbackRate !== normalSpeed) {
      setVideoPlaybackRate(normalSpeed);
    }
  }
  scheduleSkipSilenceSave(true);
  manageSSVisualizerInterval();
  updateSkipSilenceUI();
}

// Process volume level on worklet tick cadence (zero setTimeout reliance)
export function ssProcessVolume(db: number): void {
  const video = getActiveVideo();
  if (!video || video.paused || video.ended || video.readyState < 2) {
    ssIsSilentNow = false;
    ssSilentMsAccumulated = 0;
    return;
  }

  updateDynamicNoiseFloor(db);
  const { silenceThresholdDb, speechThresholdDb } = getEffectiveThresholds();
  const windowMs = ssAudioContext ? (1024 / ssAudioContext.sampleRate) * 1000 : 23.2;

  // Hysteresis detection
  if (ssIsSilentNow) {
    if (db > speechThresholdDb) {
      ssIsSilentNow = false;
    }
  } else {
    if (db < silenceThresholdDb) {
      ssIsSilentNow = true;
    }
  }

  if (ssIsSilentNow) {
    const prevSilentMs = ssSilentMsAccumulated;
    ssSilentMsAccumulated += windowMs;

    const minSilenceMs = Math.round(state.skipSilenceMinDuration * 1000);
    if (ssSilentMsAccumulated >= minSilenceMs) {
      if (ssCurrentState !== 'silence') {
        ssCurrentState = 'silence';
        ssSilenceStartTime = Date.now();
        ssEnterSilence();
        updateSkipSilenceUI();
      }

      // Tick-based speed ramp over 200ms (zero setInterval)
      const baseSpeed = state.extensionEnabled ? state.currentSpeed : 1.0;
      if (!isUserHoldingSpace() && prevSilentMs < minSilenceMs + 200) {
        const progress = Math.min((ssSilentMsAccumulated - minSilenceMs) / 200, 1);
        const targetSpeed = baseSpeed + (state.skipSilenceSilenceSpeed - baseSpeed) * progress;
        setVideoPlaybackRate(targetSpeed);
      }

      // Track time saved in memory
      const saved = windowMs * (1 - baseSpeed / state.skipSilenceSilenceSpeed);
      state.skipSilenceTimeSaved += saved;
      skipSilenceSessionSaved += saved;
      scheduleSkipSilenceSave();
    }
  } else {
    ssSilentMsAccumulated = 0;
    if (ssCurrentState === 'silence') {
      ssCurrentState = 'speech';
      if (!isUserHoldingSpace()) {
        ssExitSilence();
      }
      updateSkipSilenceUI();
    }
  }
}

// Throttled storage persistence for time saved (max once every 10 seconds or on pause)
export function scheduleSkipSilenceSave(forceImmediate = false): void {
  if (forceImmediate) {
    if (ssSaveTimer) {
      clearTimeout(ssSaveTimer);
      ssSaveTimer = null;
    }
    safeSetSettings({ skipSilenceTimeSaved: Math.round(state.skipSilenceTimeSaved) });
    return;
  }
  if (!ssSaveTimer) {
    ssSaveTimer = setTimeout(() => {
      ssSaveTimer = null;
      safeSetSettings({ skipSilenceTimeSaved: Math.round(state.skipSilenceTimeSaved) });
    }, 10000);
  }
}

// Toggle skip silence on/off
export function toggleSkipSilence(enable: boolean): void {
  state.skipSilenceEnabled = enable;
  safeSetSettings({ skipSilenceEnabled: enable });
  if (enable) {
    ssInit();
  } else {
    ssDestroy();
  }
}

// Reset silence states when video is paused or ended
export function onSSVideoPause(): void {
  ssIsSilentNow = false;
  ssSilentMsAccumulated = 0;
  scheduleSkipSilenceSave(true);
  if (ssCurrentState === 'silence') {
    ssCurrentState = 'idle';
    if (!isUserHoldingSpace()) {
      ssExitSilence();
    }
    updateSkipSilenceUI();
  }
}
