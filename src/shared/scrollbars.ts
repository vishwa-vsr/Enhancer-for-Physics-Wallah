import { signal } from '@preact/signals';
import { loadSettings, saveSetting, onSettingsChanged } from './storage';

export const showDashboardScrollbars = signal<boolean>(true);
export const showPopupScrollbar = signal<boolean>(true);

export function applyDashboardScrollbars(show: boolean): void {
  if (show) {
    document.body.classList.add('show-dashboard-scrollbars');
    document.body.classList.remove('hide-dashboard-scrollbars');
  } else {
    document.body.classList.add('hide-dashboard-scrollbars');
    document.body.classList.remove('show-dashboard-scrollbars');
  }
}

export function applyPopupScrollbar(show: boolean): void {
  if (show) {
    document.body.classList.add('show-popup-scrollbar');
    document.body.classList.remove('hide-popup-scrollbar');
  } else {
    document.body.classList.add('hide-popup-scrollbar');
    document.body.classList.remove('show-popup-scrollbar');
  }
}

export async function initDashboardScrollbars(): Promise<void> {
  const settings = await loadSettings();
  const show = settings.showDashboardScrollbars ?? true;
  showDashboardScrollbars.value = show;
  applyDashboardScrollbars(show);

  const popupShow = settings.showPopupScrollbar ?? true;
  showPopupScrollbar.value = popupShow;

  onSettingsChanged((changes) => {
    if (changes.showDashboardScrollbars !== undefined) {
      showDashboardScrollbars.value = changes.showDashboardScrollbars;
      applyDashboardScrollbars(changes.showDashboardScrollbars);
    }
    if (changes.showPopupScrollbar !== undefined) {
      showPopupScrollbar.value = changes.showPopupScrollbar;
    }
  });
}

export async function initPopupScrollbars(): Promise<void> {
  const settings = await loadSettings();
  const show = settings.showPopupScrollbar ?? true;
  showPopupScrollbar.value = show;
  applyPopupScrollbar(show);

  onSettingsChanged((changes) => {
    if (changes.showPopupScrollbar !== undefined) {
      showPopupScrollbar.value = changes.showPopupScrollbar;
      applyPopupScrollbar(changes.showPopupScrollbar);
    }
  });
}

export function toggleDashboardScrollbars(val: boolean): void {
  showDashboardScrollbars.value = val;
  saveSetting('showDashboardScrollbars', val);
  applyDashboardScrollbars(val);
}

export function togglePopupScrollbar(val: boolean): void {
  showPopupScrollbar.value = val;
  saveSetting('showPopupScrollbar', val);
  applyPopupScrollbar(val);
}
