import { AudioGraph, VolumeBalancerMode } from '../../types';
import { state } from '../../state';
import { getActiveVideo } from '../video/detector';
import { getCachedAudioGraph } from './skip-silence';

export interface VolumeBalancerPreset {
  threshold: number; // Decibels (dB)
  knee: number;      // Decibels (dB)
  ratio: number;     // Compression ratio
  attack: number;    // Seconds
  release: number;   // Seconds
  makeupGain: number;// Linear gain multiplier
}

// Tuned for pure ear protection without sacrificing voice quality.
// Normal talking (around -24dB to -14dB) is 100% untouched and crystal clear.
// Only sudden loud shouting/screaming (spiking above -12dB) is clamped by the ceiling.
export const VOLUME_BALANCER_PRESETS: Record<VolumeBalancerMode, VolumeBalancerPreset> = {
  balanced: {
    threshold: -12,
    knee: 8,
    ratio: 16,
    attack: 0.002,
    release: 0.12,
    makeupGain: 1.0,
  },
  gentle: {
    threshold: -10,
    knee: 10,
    ratio: 12,
    attack: 0.003,
    release: 0.15,
    makeupGain: 1.0,
  },
  max: {
    threshold: -14,
    knee: 6,
    ratio: 20,
    attack: 0.001,
    release: 0.10,
    makeupGain: 1.0,
  },
};

/**
 * Smoothly applies ear protection settings to the given AudioGraph
 * using browser audio parameter ramping (setTargetAtTime) to prevent
 * audible clicks, pops, or audio stutters.
 */
export function applyVolumeBalancerToGraph(graph: AudioGraph | null): void {
  if (!graph || !graph.context || graph.context.state === 'closed') return;
  const { context, compressorNode, balancerGainNode } = graph;
  if (!compressorNode || !balancerGainNode) return;

  const now = context.currentTime;
  const timeConstant = 0.025; // 25ms smooth exponential ramp

  if (!state.volumeBalancerEnabled || !state.extensionEnabled) {
    // Neutral transparent pass-through: 100% natural, untouched audio
    compressorNode.threshold.setTargetAtTime(0, now, timeConstant);
    compressorNode.knee.setTargetAtTime(0, now, timeConstant);
    compressorNode.ratio.setTargetAtTime(1, now, timeConstant);
    compressorNode.attack.setTargetAtTime(0.003, now, timeConstant);
    compressorNode.release.setTargetAtTime(0.25, now, timeConstant);
    balancerGainNode.gain.setTargetAtTime(1.0, now, timeConstant);
    return;
  }

  const preset =
    VOLUME_BALANCER_PRESETS[state.volumeBalancerMode] || VOLUME_BALANCER_PRESETS.balanced;

  compressorNode.threshold.setTargetAtTime(preset.threshold, now, timeConstant);
  compressorNode.knee.setTargetAtTime(preset.knee, now, timeConstant);
  compressorNode.ratio.setTargetAtTime(preset.ratio, now, timeConstant);
  compressorNode.attack.setTargetAtTime(preset.attack, now, timeConstant);
  compressorNode.release.setTargetAtTime(preset.release, now, timeConstant);
  balancerGainNode.gain.setTargetAtTime(preset.makeupGain, now, timeConstant);
}

/**
 * Synchronizes volume balancer parameters across the active video's audio graph.
 */
export function syncVolumeBalancer(): void {
  const video = getActiveVideo();
  if (!video) return;

  const graph = getCachedAudioGraph(video);
  if (graph) {
    applyVolumeBalancerToGraph(graph);
  }
}
