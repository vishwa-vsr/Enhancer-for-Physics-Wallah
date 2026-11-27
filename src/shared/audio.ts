export const VOLUME_BOOSTER_MIN = 100;
export const VOLUME_BOOSTER_MAX = 500;
export const VOLUME_BOOSTER_DEFAULT = 150;
export const VOLUME_BOOSTER_STEP = 5;
export const VOLUME_BOOSTER_PRESETS = [100, 150, 200, 300, 500] as const;

export function sanitizeVolumeBoosterLevel(
  value: unknown,
  fallback = VOLUME_BOOSTER_DEFAULT,
): number {
  if (
    value === null ||
    value === undefined ||
    typeof value === 'boolean' ||
    typeof value === 'object' ||
    (typeof value === 'string' && value.trim() === '')
  ) {
    return fallback;
  }
  const num = Number(value);
  if (!Number.isFinite(num)) {
    return fallback;
  }
  return Math.max(VOLUME_BOOSTER_MIN, Math.min(VOLUME_BOOSTER_MAX, Math.round(num)));
}
