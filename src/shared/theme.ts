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
