import { signal, computed } from '@preact/signals';
import { ThemeMode } from './types';
import { loadSettings, saveSetting } from './storage';

export const themeMode = signal<ThemeMode>('dark');
export const isLightTheme = computed(() => themeMode.value === 'light');

export function applyThemeToBody(mode: ThemeMode): void {
  if (mode === 'light') {
    document.body.classList.add('light-theme');
  } else {
    document.body.classList.remove('light-theme');
  }
}

export async function initTheme(): Promise<void> {
  const settings = await loadSettings();
  themeMode.value = settings.themeMode;
  applyThemeToBody(settings.themeMode);
}

export function toggleTheme(): void {
  const newMode = themeMode.value === 'light' ? 'dark' : 'light';
  themeMode.value = newMode;
  saveSetting('themeMode', newMode);
  applyThemeToBody(newMode);
}

/**
 * Calculates a softer/lighter shade of a hex color (e.g. for child chapter icons).
 */
export function getLightShade(hex: string, percent: number = 28): string {
  if (!hex || !hex.startsWith('#')) return hex || '#6366f1';
  const clean = hex.replace('#', '');
  if (clean.length === 6) {
    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);
    const factor = percent / 100;
    const newR = Math.min(255, Math.round(r + (255 - r) * factor));
    const newG = Math.min(255, Math.round(g + (255 - g) * factor));
    const newB = Math.min(255, Math.round(b + (255 - b) * factor));
    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  }
  return hex;
}

/**
 * Returns an rgba string from a hex code for subtle glowing background tints.
 */
export function getAlphaColor(hex: string, alpha: number = 0.12): string {
  if (!hex || !hex.startsWith('#')) return `rgba(107, 127, 215, ${alpha})`;
  const clean = hex.replace('#', '');
  if (clean.length === 6) {
    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return `rgba(107, 127, 215, ${alpha})`;
}

