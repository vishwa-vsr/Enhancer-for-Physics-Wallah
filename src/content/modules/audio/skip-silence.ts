import { AudioGraph, SilenceState, PWCEnhancedVideoElement, PWCEnhancedWindow } from '../../types';
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
    this._batch = 1024;
    this.port.onmessage = (e) => {
      if (typeof e.data === 'boolean') {
        this._enabled = e.data;
      } else if (e.data && typeof e.data === 'object') {
        if (e.data.enabled !== undefined) this._enabled = e.data.enabled;
        if (e.data.lowCpu !== undefined) this._batch = e.data.lowCpu ? 2400 : 1024;
      }
    };
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
    // Report every ~1024 samples (~23ms) or ~2400 samples (~54ms in Low CPU mode)
    if (this._count >= Math.ceil(this._batch / samples.length)) {
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
let ssSourceNode: MediaElementAudioSourceNode | MediaStreamAudioSourceNode | null = null;
let ssWorkletNode: AudioWorkletNode | null = null;
let ssAnalyserNode: AnalyserNode | null = null;
let ssAnalyserInterval: ReturnType<typeof setInterval> | null = null;
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

export function getSSSourceNode(): MediaElementAudioSourceNode | MediaStreamAudioSourceNode | null {
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
export function getEffectiveThresholds(): {
  silenceThresholdDb: number;
  speechThresholdDb: number;
} {
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
  const maxHistory = state.skipSilenceLowCpu ? 240 : 470;
  if (ssVolumeHistory.length > maxHistory) {
    ssVolumeHistory.shift();
  }
  // Recalculate roughly once every ~23 samples (~500ms) or ~46 samples in Low CPU mode
  const calcInterval = state.skipSilenceLowCpu ? 46 : 23;
  ssSamplesSinceCalc++;
  if (ssSamplesSinceCalc >= calcInterval && ssVolumeHistory.length >= Math.min(47, maxHistory)) {
    ssSamplesSinceCalc = 0;
    const sorted = ssVolumeHistory.slice().sort((a, b) => a - b);
    const p15Index = Math.floor(sorted.length * 0.15);
    const noiseFloor = sorted[p15Index];
    // 15th percentile noise floor + 3dB margin, clamped within realistic boundaries (-60dB to -20dB)
    ssCalculatedNoiseFloorDb = Math.max(-60, Math.min(-20, Math.round((noiseFloor + 3) * 10) / 10));
  }
}

// Global shared AudioContext singleton per page lifecycle
let sharedAudioContext: AudioContext | null = null;

export function getSharedAudioContext(): AudioContext {
  const win = window as unknown as PWCEnhancedWindow;
  if (win.__pwcAudioContext && win.__pwcAudioContext.state !== 'closed') {
    sharedAudioContext = win.__pwcAudioContext;
  }
  if (!sharedAudioContext || sharedAudioContext.state === 'closed') {
    const AudioCtxClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    sharedAudioContext = new AudioCtxClass();
    win.__pwcAudioContext = sharedAudioContext;
    resumeAudioContextOnInteraction(sharedAudioContext);
  }
  return sharedAudioContext;
}

// Unified wake-up helper that unlocks AudioContext and starts Skip Silence if stalled
export function wakeUpSSEngine(): void {
  try {
    const ctx = getSharedAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
  } catch (_e) {}

  if (state.skipSilenceEnabled && !isSSEngineRunning()) {
    const vid = getActiveVideo();
    if (vid && !vid.paused) {
      ssInit();
    }
  }
}

// Global user-gesture unlock listener that continuously keeps AudioContext awake and kicks stalled engine
let gestureUnlockInitialized = false;
export function initGlobalGestureUnlock(): void {
  if (gestureUnlockInitialized) return;
  gestureUnlockInitialized = true;
  document.addEventListener('pointerdown', wakeUpSSEngine, { capture: true });
  document.addEventListener('keydown', wakeUpSSEngine, { capture: true });
}

// Helper to ensure AudioContext stays awake across browser autoplay policies
export function resumeAudioContextOnInteraction(audioCtx: AudioContext): void {
  if (!audioCtx || audioCtx.state !== 'suspended') return;
  audioCtx.resume().catch(() => {});
  const resumeFn = () => {
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
  };
  document.addEventListener('pointerdown', resumeFn, { once: true, capture: true });
  document.addEventListener('keydown', resumeFn, { once: true, capture: true });
}

export function startAnalyserLoop(analyser: AnalyserNode): void {
  stopAnalyserLoop();
  const buffer = new Float32Array(analyser.fftSize);
  const intervalMs = state.skipSilenceLowCpu ? 55 : 25;
  ssAnalyserInterval = setInterval(() => {
    if (!ssEngineRunning || isUserHoldingSpace()) return;
    const video =
      ssConnectedVideo && ssConnectedVideo.isConnected ? ssConnectedVideo : getActiveVideo();
    if (!video || video.paused || video.ended || video.readyState < 2) {
      ssIsSilentNow = false;
      ssSilentMsAccumulated = 0;
      return;
    }
    analyser.getFloatTimeDomainData(buffer);
    let sum = 0;
    for (let i = 0; i < buffer.length; i++) {
      sum += buffer[i] * buffer[i];
    }
    const rms = Math.sqrt(sum / buffer.length);
    ssLastVolumeLevel = rms;
    const db = rmsToDb(rms);
    ssLastVolumeDb = db;
    ssProcessVolume(db);
  }, intervalMs);
}

export function stopAnalyserLoop(): void {
  if (ssAnalyserInterval) {
    clearInterval(ssAnalyserInterval);
    ssAnalyserInterval = null;
  }
}

// Permanent Audio Graph cache per HTMLMediaElement (WeakMap + DOM property fallback)
const videoAudioGraphs = new WeakMap<HTMLVideoElement, AudioGraph>();
const videoInitPromises = new WeakMap<HTMLVideoElement, Promise<AudioGraph | null>>();

export function getCachedAudioGraph(video: HTMLVideoElement): AudioGraph | null {
  if (!video) return null;
  const enhancedVideo = video as PWCEnhancedVideoElement;
  return videoAudioGraphs.get(video) || enhancedVideo._pwcAudioGraph || null;
}

// Safely creates or reuses the audio processing pipeline for a given video
async function getOrCreateAudioGraph(video: HTMLVideoElement): Promise<AudioGraph | null> {
  const cached = getCachedAudioGraph(video);
  if (cached && cached.context && cached.context.state !== 'closed') return cached;

  const existingPromise = videoInitPromises.get(video);
  if (existingPromise) return existingPromise;

  const initPromise = (async (): Promise<AudioGraph | null> => {
    try {
      const audioCtx = getSharedAudioContext();
      initGlobalGestureUnlock();

      // Ensure AudioContext is resumed immediately
      if (audioCtx.state === 'suspended') {
        audioCtx.resume().catch(() => {});
      }

      // Check if this video element already has an attached sourceNode or AudioGraph
      const enhancedVideo = video as PWCEnhancedVideoElement;
      let sourceNode: MediaElementAudioSourceNode | MediaStreamAudioSourceNode | null =
        enhancedVideo._pwcSourceNode || null;
      let isStream = enhancedVideo._pwcIsStreamSource || false;

      if (sourceNode && sourceNode.context !== audioCtx) {
        sourceNode = null;
        enhancedVideo._pwcSourceNode = null;
        enhancedVideo._pwcAudioGraph = null;
      }

      if (!sourceNode) {
        try {
          sourceNode = audioCtx.createMediaElementSource(video);
          enhancedVideo._pwcSourceNode = sourceNode;
          enhancedVideo._pwcIsStreamSource = false;
        } catch (sourceErr: unknown) {
          const err = sourceErr as Error;
          if (
            err.name === 'InvalidStateError' ||
            (err.message && err.message.includes('already connected'))
          ) {
            console.warn(
              'PW Control: Video element was already connected to an audio source node. Attempting stream fallback...',
            );
            const existingGraph = enhancedVideo._pwcAudioGraph || videoAudioGraphs.get(video);
            if (existingGraph && existingGraph.context === audioCtx) return existingGraph;

            // Fall back to captureStream() which bypasses Chromium's single-connection lock
            const captureFn = enhancedVideo.captureStream || enhancedVideo.mozCaptureStream;
            if (typeof captureFn === 'function') {
              try {
                const stream: MediaStream = captureFn.call(video);
                if (stream) {
                  sourceNode = audioCtx.createMediaStreamSource(stream);
                  isStream = true;
                  enhancedVideo._pwcSourceNode = sourceNode;
                  enhancedVideo._pwcIsStreamSource = true;
                  console.info(
                    'PW Control: Successfully attached using MediaStreamAudioSourceNode fallback.',
                  );
                }
              } catch (streamErr: unknown) {
                console.warn(
                  'PW Control: captureStream fallback failed:',
                  (streamErr as Error)?.message,
                );
              }
            }
          }
          if (!sourceNode) {
            throw sourceErr;
          }
        }
      }

      let delayNode: DelayNode | null = null;
      let gainNode: GainNode | null = null;

      // Only route to destination if using MediaElementAudioSourceNode.
      // With captureStream, the video element naturally plays to speakers; routing to destination causes echo!
      if (!isStream) {
        delayNode = audioCtx.createDelay(1.0);
        delayNode.delayTime.value = 0.06;

        gainNode = audioCtx.createGain();
        gainNode.gain.value = 1.0;

        sourceNode.connect(delayNode);
        delayNode.connect(gainNode);
        gainNode.connect(audioCtx.destination);
      } else {
        // Silent drain: route through gain = 0 to audio destination.
        // Guarantees Chromium's pull-based Web Audio engine continuously pumps samples
        // to our analyzer/worklet without creating any audible double-sound / echo!
        const silentDrain = audioCtx.createGain();
        silentDrain.gain.value = 0.0;
        sourceNode.connect(silentDrain);
        silentDrain.connect(audioCtx.destination);
      }

      let workletNode: AudioWorkletNode | null = null;
      let analyserNode: AnalyserNode | null = null;

      // Try AudioWorklet first, then gracefully fall back to native AnalyserNode
      try {
        const blob = new Blob([VOLUME_PROCESSOR_CODE], { type: 'application/javascript' });
        const workletUrl = URL.createObjectURL(blob);
        await audioCtx.audioWorklet.addModule(workletUrl);
        URL.revokeObjectURL(workletUrl);

        workletNode = new AudioWorkletNode(audioCtx, 'pwc-volume-processor');
        sourceNode.connect(workletNode);
      } catch (workletErr: unknown) {
        console.info(
          'PW Control: Using native AnalyserNode volume meter (AudioWorklet fallback):',
          (workletErr as Error)?.message,
        );
        analyserNode = audioCtx.createAnalyser();
        analyserNode.fftSize = 256;
        sourceNode.connect(analyserNode);
      }

      const graph: AudioGraph = {
        context: audioCtx,
        sourceNode: sourceNode,
        delayNode: delayNode,
        gainNode: gainNode,
        workletNode: workletNode,
        analyserNode: analyserNode,
        isStream: isStream,
      };

      videoAudioGraphs.set(video, graph);
      enhancedVideo._pwcAudioGraph = graph;
      return graph;
    } catch (e: unknown) {
      console.warn('PW Control: AudioGraph creation error:', (e as Error)?.message);
      return null;
    } finally {
      videoInitPromises.delete(video);
    }
  })();

  videoInitPromises.set(video, initPromise);
  return initPromise;
}

// Initialize or resume the audio pipeline for skip silence
export async function ssInit(): Promise<void> {
  const video = getActiveVideo();
  if (!video || video.paused || ssInitializing) return;

  ssInitializing = true;
  try {
    const graph = await getOrCreateAudioGraph(video);
    if (!graph) {
      ssInitializing = false;
      updateSkipSilenceUI();
      return;
    }

    // Ensure AudioContext is resumed safely
    resumeAudioContextOnInteraction(graph.context);

    // Point current engine references to this active video's graph
    ssAudioContext = graph.context;
    ssSourceNode = graph.sourceNode;
    ssDelayNode = graph.delayNode || null;
    ssGainNode = graph.gainNode || null;
    ssWorkletNode = graph.workletNode || null;
    ssAnalyserNode = graph.analyserNode || null;
    ssConnectedVideo = video;

    if (ssWorkletNode) {
      stopAnalyserLoop();
      ssWorkletNode.port.postMessage({ enabled: true, lowCpu: !!state.skipSilenceLowCpu });
      ssWorkletNode.port.onmessage = (event) => {
        if (!ssEngineRunning || isUserHoldingSpace()) return;
        ssLastVolumeLevel = event.data;
        const db = rmsToDb(event.data);
        ssLastVolumeDb = db;
        ssProcessVolume(db);
      };
    } else if (ssAnalyserNode) {
      startAnalyserLoop(ssAnalyserNode);
    }

    ssEngineRunning = true;
    ssCurrentState = 'speech';
    ssIsSilentNow = false;
    ssSilentMsAccumulated = 0;
    ssInitializing = false;
    updateSkipSilenceUI();
    manageSSVisualizerInterval();
  } catch (err: unknown) {
    const error = err as Error;
    ssInitializing = false;
    ssEngineRunning = false;
    console.warn('PW Control: Skip Silence init failed:', error.message);
    if (
      error.name === 'NotSupportedError' ||
      (error.message && (error.message.includes('CORS') || error.message.includes('cross-origin')))
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

  stopAnalyserLoop();

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
    const video = getActiveVideo();
    if (video && !video.paused) {
      ssInit();
    } else {
      updateSkipSilenceUI();
    }
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

// Synchronize low-CPU sensor mode in real-time
export function syncSSLowCpuMode(isLowCpu: boolean): void {
  if (ssWorkletNode) {
    ssWorkletNode.port.postMessage({ lowCpu: isLowCpu });
  } else if (ssAnalyserNode && ssEngineRunning) {
    startAnalyserLoop(ssAnalyserNode);
  }
}
