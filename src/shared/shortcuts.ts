export const RESERVED_PLAYER_KEYS: ReadonlySet<string> = new Set([
  'arrowleft',
  'arrowright',
  'arrowup',
  'arrowdown',
  ' ',
  'space',
  'spacebar',
  'enter',
  'escape',
  'tab',
]);

export function isReservedPlayerKey(key: string): boolean {
  if (!key) return false;
  return RESERVED_PLAYER_KEYS.has(key.toLowerCase());
}

export function getReservedShortcutWarning(key: string): string | null {
  if (!isReservedPlayerKey(key)) return null;
  const lower = key.toLowerCase();
  if (lower === 'arrowleft') {
    return 'Left Arrow is reserved for skipping back 10s in the video player.';
  }
  if (lower === 'arrowright') {
    return 'Right Arrow is reserved for skipping ahead 10s in the video player.';
  }
  if (lower === 'arrowup' || lower === 'arrowdown') {
    return 'Up/Down Arrow keys are reserved for the video player.';
  }
  if (lower === ' ' || lower === 'space' || lower === 'spacebar') {
    return 'Spacebar is reserved for Play/Pause and Hold-to-Speed-Up.';
  }
  return `${key} is reserved for player navigation.`;
}

export function sanitizeSpeedShortcut(value: unknown, fallback: string): string {
  if (value === '') return '';
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  if (trimmed.length !== 1 || isReservedPlayerKey(trimmed)) return fallback;
  return trimmed.toLowerCase();
}

export function resolveSafeSpeedShortcuts(
  raw: {
    keySpeedUp?: unknown;
    keySlowDown?: unknown;
    keyReset?: unknown;
  },
  reservedFocusKeys: Iterable<string>,
): {
  keySpeedUp: string;
  keySlowDown: string;
  keyReset: string;
} {
  const usedKeys = new Set<string>();
  for (const k of reservedFocusKeys) {
    const normalized = k.trim().toLowerCase();
    if (normalized) usedKeys.add(normalized);
  }

  const pickKey = (candidateRaw: unknown, preferredDefault: string): string => {
    if (candidateRaw === '') return '';
    const sanitized = sanitizeSpeedShortcut(candidateRaw, '');
    if (sanitized && !usedKeys.has(sanitized)) {
      usedKeys.add(sanitized);
      return sanitized;
    }
    const candidates = [preferredDefault, 'h', 'j', 'l', '[', ']', ',', '.'];
    const chosen = candidates.find((c) => !usedKeys.has(c)) || preferredDefault;
    usedKeys.add(chosen);
    return chosen;
  };

  return {
    keySpeedUp: pickKey(raw.keySpeedUp, 'h'),
    keySlowDown: pickKey(raw.keySlowDown, 'j'),
    keyReset: pickKey(raw.keyReset, 'l'),
  };
}
