import { AudioGraph, ContentState } from '../../types';
import { state } from '../../state';
import { getActiveVideo } from '../video/detector';
import { getCachedAudioGraph } from './skip-silence';
import { VOLUME_BOOSTER_DEFAULT, sanitizeVolumeBoosterLevel } from '../../../shared/audio';

/**
 * Returns true when Volume Booster is actively amplifying audio above 100%.
 */
export function isVolumeBoosterActive(targetState: ContentState = state): boolean {
  return (
    targetState.extensionEnabled &&
    targetState.volumeBoosterEnabled &&
    sanitizeVolumeBoosterLevel(targetState.volumeBoosterLevel, VOLUME_BOOSTER_DEFAULT) > 100
  );
}

/**
 * Computes the linear GainNode multiplier for the current Volume Booster settings.
 * Returns 1.0 (transparent unity gain) when disabled or when the extension is off.
 */
export function getEffectiveVolumeBoosterGain(targetState: ContentState = state): number {
  if (!targetState.extensionEnabled || !targetState.volumeBoosterEnabled) {
    return 1.0;
  }
  const levelPercent = sanitizeVolumeBoosterLevel(
    targetState.volumeBoosterLevel,
    VOLUME_BOOSTER_DEFAULT,
  );
  return levelPercent / 100;
}

/**
 * Smoothly applies Volume Booster gain to the given AudioGraph
 * using exponential ramping (setTargetAtTime) to avoid clicks or pops.
 */
export function applyVolumeBoosterToGraph(graph: AudioGraph | null): void {
  if (!graph || !graph.context || graph.context.state === 'closed') return;
  const { context, boosterGainNode } = graph;
  if (!boosterGainNode) return;

  const now = context.currentTime;
  const timeConstant = 0.025; // 25ms smooth exponential ramp
  const targetGain = getEffectiveVolumeBoosterGain();

  boosterGainNode.gain.setTargetAtTime(targetGain, now, timeConstant);
}

/**
 * Synchronizes Volume Booster gain across the active video's audio graph.
 */
export function syncVolumeBooster(): void {
  const video = getActiveVideo();
  if (!video) return;

  const graph = getCachedAudioGraph(video);
  if (graph) {
    applyVolumeBoosterToGraph(graph);
  }
}
