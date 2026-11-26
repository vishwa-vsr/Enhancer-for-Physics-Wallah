/** Clamps a numeric value between min and max. */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/** Validates, clamps (0.5x–4.0x), and sorts a 4-item slider snap-point tuple. */
export function sanitizeSnapPoints(points: unknown): number[] {
  if (!Array.isArray(points) || points.length !== 4) {
    return [1.0, 1.5, 2.0, 2.5];
  }
  const vals = points.map((v) => {
    const n = parseFloat(String(v));
    return Math.round(clamp(isNaN(n) ? 1.0 : n, 0.5, 4.0) * 10) / 10;
  });

  vals.sort((a, b) => a - b);

  for (let i = 1; i < vals.length; i++) {
    if (vals[i] <= vals[i - 1]) {
      vals[i] = Math.min(4.0, Math.round((vals[i - 1] + 0.1) * 10) / 10);
    }
  }
  for (let i = vals.length - 2; i >= 0; i--) {
    if (vals[i] >= vals[i + 1]) {
      vals[i] = Math.max(0.5, Math.round((vals[i + 1] - 0.1) * 10) / 10);
    }
  }
  return vals;
}

/** Formats milliseconds of saved silence time in detailed popup or compact toolbar form. */
export function formatTimeSaved(ms: number, compact = false): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  if (totalSeconds < 60) return `${totalSeconds}s`;
  const minutes = Math.floor(totalSeconds / 60);
  if (compact) {
    return minutes < 100 ? `${minutes}m` : `${Math.floor(minutes / 60)}h`;
  }
  if (minutes < 60) return `${minutes}m ${totalSeconds % 60}s`;
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}
