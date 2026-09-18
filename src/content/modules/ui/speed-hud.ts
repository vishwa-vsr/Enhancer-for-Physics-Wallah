import { state, sanitizeSnapPoints } from '../../state';
import { findPWToolbar } from '../distractions/elements';
import { applyDistractorsState } from '../distractions/focus-css';
import { stepSpeed, saveSpeed } from '../video/controller';
import { updateFinishTime } from './finish-time';
import { getSSCurrentState } from '../audio/skip-silence';

const MIN_SPEED = 0.5;
const MAX_SPEED = 4.0;

function formatSpeed(speed: number): string {
  return speed.toFixed(2).replace(/0$/, '');
}

function parseTypedSpeed(value: string): number | null {
  const normalized = value.trim().replace(/x$/i, '').trim();
  if (!normalized) return null;

  const parsed = Number(normalized);
  if (!Number.isFinite(parsed)) return null;

  const clamped = Math.min(MAX_SPEED, Math.max(MIN_SPEED, parsed));
  return Math.round(clamped * 100) / 100;
}

function setExpanded(container: HTMLElement, expanded: boolean): void {
  if (expanded) {
    container.classList.remove('pwc-escape-collapsed');
  }
  container.classList.toggle('pwc-expanded', expanded);
  container.querySelectorAll<HTMLButtonElement>('.pwc-speed-badge').forEach((trigger) => {
    trigger.setAttribute('aria-expanded', String(expanded));
  });
}

function setBadgeEditing(container: HTMLElement, editing: boolean): void {
  const badge = container.querySelector<HTMLButtonElement>('.pwc-speed-badge');
  const input = container.querySelector<HTMLInputElement>('.pwc-speed-badge-input');
  if (!badge || !input) return;

  container.classList.toggle('pwc-speed-editing', editing);
  badge.hidden = editing;
  input.hidden = !editing;
}

function collapseOnEscape(container: HTMLElement): void {
  if (state.alwaysExpandWidget) return;
  container.classList.add('pwc-escape-collapsed');
  setExpanded(container, false);
}

// Equal-distance 4-point segmented slider interpolation functions
// Points: [p0, p1, p2, p3] mapped at 0%, 33.3333%, 66.6667%, 100%
export function speedToSliderPercent(speed: number | string, points?: number[]): number {
  const pts = points && points.length === 4 ? points : [1.0, 1.5, 2.0, 2.5];
  const s = typeof speed === 'number' ? speed : parseFloat(speed);
  if (isNaN(s) || s <= pts[0]) return 0;
  if (s >= pts[3]) return 100;
  if (s <= pts[1]) {
    const span = pts[1] - pts[0];
    const frac = span > 0 ? (s - pts[0]) / span : 0;
    return frac * (100 / 3);
  }
  if (s <= pts[2]) {
    const span = pts[2] - pts[1];
    const frac = span > 0 ? (s - pts[1]) / span : 0;
    return 100 / 3 + frac * (100 / 3);
  }
  const span = pts[3] - pts[2];
  const frac = span > 0 ? (s - pts[2]) / span : 0;
  return 200 / 3 + frac * (100 / 3);
}

export function sliderPercentToSpeed(pct: number | string, points?: number[]): number {
  const pts = points && points.length === 4 ? points : [1.0, 1.5, 2.0, 2.5];
  const p = Math.max(0, Math.min(100, typeof pct === 'number' ? pct : parseFloat(pct)));
  let raw = pts[0];
  if (p <= 0) {
    raw = pts[0];
  } else if (p >= 100) {
    raw = pts[3];
  } else if (p <= 100 / 3) {
    const frac = p / (100 / 3);
    raw = pts[0] + frac * (pts[1] - pts[0]);
  } else if (p <= 200 / 3) {
    const frac = (p - 100 / 3) / (100 / 3);
    raw = pts[1] + frac * (pts[2] - pts[1]);
  } else {
    const frac = (p - 200 / 3) / (100 / 3);
    raw = pts[2] + frac * (pts[3] - pts[2]);
  }
  return Math.round(raw * 10) / 10;
}

// Dynamically redraw tick marks inside player UI at exact equal distances (0%, 33.33%, 66.67%, 100%)
export function updatePlayerTicks(points?: number[]): void {
  state.snapPoints = sanitizeSnapPoints(points || state.snapPoints);
  const stops = [0, 100 / 3, 200 / 3, 100];
  document.querySelectorAll<HTMLElement>('.pwc-slider-ticks').forEach((ticksContainer) => {
    ticksContainer.textContent = '';
    state.snapPoints.forEach((pt, index) => {
      const pct =
        stops[index] !== undefined ? stops[index] : (index / (state.snapPoints.length - 1)) * 100;
      const tickLabel = document.createElement('span');
      tickLabel.className = 'pwc-tick-label';
      tickLabel.style.left = `${pct}%`;
      tickLabel.textContent = `${pt.toFixed(1).replace(/\.0$/, '')}x`;
      ticksContainer.appendChild(tickLabel);
    });
  });
  updateUI();
}

export function applyAlwaysExpandState(targetContainer?: HTMLElement | null): void {
  const container = targetContainer || document.getElementById('pwc-speed-control');
  if (container) {
    if (state.alwaysExpandWidget) {
      container.classList.add('pwc-always-expanded');
      setExpanded(container, true);
    } else {
      const wasAlwaysExpanded = container.classList.contains('pwc-always-expanded');
      container.classList.remove('pwc-always-expanded');
      if (wasAlwaysExpanded) setExpanded(container, false);
    }
  }
}

// Update the progress track background of the range input dynamically
export function updateSliderBackground(slider: HTMLInputElement | null, _val?: number): void {
  if (!slider) return;
  slider.style.setProperty('background', '#ffffff', 'important');
}

// Bind mouse drag and scroll wheel events to a speed control container
export function setupUIEventListeners(container: HTMLElement): void {
  const slider = container.querySelector<HTMLInputElement>('.pwc-speed-slider');
  const badge = container.querySelector<HTMLButtonElement>('.pwc-speed-badge');
  const speedInput = container.querySelector<HTMLInputElement>('.pwc-speed-badge-input');
  if (!slider || !badge || !speedInput) return;

  updateSliderBackground(slider, state.currentSpeed);

  let mouseLeaveTimer: ReturnType<typeof setTimeout> | null = null;

  const resetTypedSpeed = () => {
    speedInput.value = formatSpeed(state.currentSpeed);
    speedInput.removeAttribute('aria-invalid');
  };

  const commitTypedSpeed = (): boolean => {
    const speed = parseTypedSpeed(speedInput.value);
    if (speed === null) {
      speedInput.setAttribute('aria-invalid', 'true');
      return false;
    }

    speedInput.removeAttribute('aria-invalid');
    speedInput.value = formatSpeed(speed);
    saveSpeed(speed);
    return true;
  };

  const closeEditing = (focusBadge = false) => {
    setBadgeEditing(container, false);
    if (focusBadge) {
      badge.focus();
    } else {
      badge.blur();
    }
  };

  const cancelAndCloseEditing = (focusBadge = false) => {
    resetTypedSpeed();
    closeEditing(focusBadge);
  };

  const saveAndCloseEditing = (focusBadge = false) => {
    if (!commitTypedSpeed()) {
      resetTypedSpeed();
    }
    closeEditing(focusBadge);
  };

  container.addEventListener('mouseenter', () => {
    if (mouseLeaveTimer) {
      clearTimeout(mouseLeaveTimer);
      mouseLeaveTimer = null;
    }
    setExpanded(container, true);
  });

  container.addEventListener('mouseleave', () => {
    container.classList.remove('pwc-escape-collapsed');
    if (state.alwaysExpandWidget) return;
    mouseLeaveTimer = setTimeout(() => {
      if (container.classList.contains('pwc-speed-editing')) saveAndCloseEditing();
      setExpanded(container, false);
    }, 250);
  });

  badge.addEventListener('click', () => {
    setExpanded(container, true);
    speedInput.value = formatSpeed(state.currentSpeed);
    setBadgeEditing(container, true);
    speedInput.focus();
    speedInput.select();
  });

  badge.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      badge.click();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      collapseOnEscape(container);
    }
  });

  slider.addEventListener('input', (e: Event) => {
    const target = e.target as HTMLInputElement;
    if (state.skipSilenceEnabled && getSSCurrentState() === 'silence') {
      const pct = speedToSliderPercent(state.currentSpeed, state.snapPoints);
      target.value = String(Math.round(pct * 10));
      return;
    }
    const percent = parseFloat(target.value) / 10;
    let val = sliderPercentToSpeed(percent, state.snapPoints);

    // Magnetic attraction snapping effect within ~2.2% of any snap point
    const snapPercents = [0, 100 / 3, 200 / 3, 100];
    for (let i = 0; i < snapPercents.length; i++) {
      if (Math.abs(percent - snapPercents[i]) <= 2.2) {
        val = state.snapPoints[i];
        break;
      }
    }

    updateSliderBackground(slider, val);
    target.setAttribute('aria-valuetext', `${formatSpeed(val)}x`);
    saveSpeed(val);
  });

  speedInput.addEventListener('input', () => {
    speedInput.removeAttribute('aria-invalid');
  });

  speedInput.addEventListener('focus', () => {
    setExpanded(container, true);
  });

  speedInput.addEventListener('keydown', (e: KeyboardEvent) => {
    e.stopPropagation();

    if (e.key === 'Enter') {
      e.preventDefault();
      if (commitTypedSpeed()) {
        closeEditing(false);
      } else {
        speedInput.select();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelAndCloseEditing(false);
      collapseOnEscape(container);
    }
  });

  speedInput.addEventListener('blur', (e: FocusEvent) => {
    if (speedInput.hidden) return;
    saveAndCloseEditing();

    const nextTarget = e.relatedTarget;
    if (!(nextTarget instanceof Node) || !container.contains(nextTarget)) {
      setExpanded(container, false);
    }
  });

  slider.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      collapseOnEscape(container);
    }
  });

  container.addEventListener(
    'wheel',
    (e: WheelEvent) => {
      if (
        !state.extensionEnabled ||
        state.disableScroll ||
        (state.skipSilenceEnabled && getSSCurrentState() === 'silence')
      )
        return;
      if (e.target === speedInput) return;
      e.preventDefault();
      const val = stepSpeed(e.deltaY < 0 ? 1 : -1);
      slider.value = String(Math.round(speedToSliderPercent(val, state.snapPoints) * 10));
      updateSliderBackground(slider, val);
      saveSpeed(val);
    },
    { passive: false },
  );
}

// Programmatically construct the speedometer control without innerHTML
export function buildSpeedControl(container: HTMLElement): void {
  container.textContent = '';

  // Speed badge doubles as the precise-entry trigger

  // Make the existing speed badge the precise-entry trigger.
  const badge = document.createElement('button');
  badge.type = 'button';
  badge.className = 'pwc-speed-badge';
  badge.dataset.editHint = 'Click to edit';
  badge.setAttribute('aria-label', 'Click to edit playback speed');
  badge.setAttribute('aria-expanded', 'false');
  badge.textContent = `${formatSpeed(state.currentSpeed)}x`;
  container.appendChild(badge);

  const speedInput = document.createElement('input');
  speedInput.type = 'text';
  speedInput.className = 'pwc-speed-badge-input';
  speedInput.inputMode = 'decimal';
  speedInput.autocomplete = 'off';
  speedInput.spellcheck = false;
  speedInput.hidden = true;
  speedInput.value = formatSpeed(state.currentSpeed);
  speedInput.setAttribute('aria-label', `Playback speed, ${MIN_SPEED} to ${MAX_SPEED}`);
  container.appendChild(speedInput);

  // Create slider container
  const sliderContainer = document.createElement('div');
  sliderContainer.className = 'pwc-speed-slider-container';

  const sliderWrapper = document.createElement('div');
  sliderWrapper.className = 'pwc-slider-wrapper';

  const slider = document.createElement('input');
  slider.type = 'range';
  slider.className = 'pwc-speed-slider';
  slider.min = '0';
  slider.max = '1000';
  slider.step = '1';
  slider.value = String(
    Math.round(speedToSliderPercent(state.currentSpeed, state.snapPoints) * 10),
  );
  slider.setAttribute('aria-label', 'Playback speed slider');
  slider.setAttribute('aria-valuetext', `${formatSpeed(state.currentSpeed)}x`);
  sliderWrapper.appendChild(slider);

  const ticks = document.createElement('div');
  ticks.className = 'pwc-slider-ticks';

  // Add ticks dynamically at equal distances (0%, 33.33%, 66.67%, 100%)
  const stops = [0, 100 / 3, 200 / 3, 100];
  state.snapPoints.forEach((pt, index) => {
    const pct =
      stops[index] !== undefined ? stops[index] : (index / (state.snapPoints.length - 1)) * 100;
    const tickLabel = document.createElement('span');
    tickLabel.className = 'pwc-tick-label';
    tickLabel.style.left = `${pct}%`;
    tickLabel.textContent = `${pt.toFixed(1).replace(/\.0$/, '')}x`;
    ticks.appendChild(tickLabel);
  });

  sliderWrapper.appendChild(ticks);
  sliderContainer.appendChild(sliderWrapper);
  container.appendChild(sliderContainer);
  applyAlwaysExpandState(container);
}

// Inject floating widget directly inside the player's controls container
export function injectSpeedControl(): void {
  if (!state.extensionEnabled) {
    const container = document.getElementById('pwc-speed-control');
    if (container) container.remove();
    return;
  }

  const existingContainer = document.getElementById('pwc-speed-control') as HTMLElement | null;
  if (existingContainer && existingContainer.isConnected) {
    applyAlwaysExpandState(existingContainer);
    return;
  }

  const toolbar = findPWToolbar();
  if (toolbar) {
    if (!existingContainer) {
      const container = document.createElement('div');
      container.id = 'pwc-speed-control';
      container.className = 'pwc-speed-container';
      buildSpeedControl(container);

      const finishBadge = toolbar.querySelector('#pwc-finish-time-badge');
      if (finishBadge && finishBadge.nextSibling) {
        toolbar.insertBefore(container, finishBadge.nextSibling);
      } else if (toolbar.firstChild) {
        toolbar.insertBefore(container, toolbar.firstChild);
      } else {
        toolbar.appendChild(container);
      }
      setupUIEventListeners(container);
      applyAlwaysExpandState(container);
    } else {
      applyAlwaysExpandState(existingContainer);
    }
    applyDistractorsState();
  }
}

// Update speed badges, slider values, tick highlights, and needle angles in the UI
export function updateUI(): void {
  document.querySelectorAll<HTMLElement>('.pwc-speed-badge').forEach((badge) => {
    badge.textContent = `${formatSpeed(state.currentSpeed)}x`;
  });

  document.querySelectorAll<HTMLInputElement>('.pwc-speed-badge-input').forEach((input) => {
    if (document.activeElement !== input) {
      input.value = formatSpeed(state.currentSpeed);
      input.removeAttribute('aria-invalid');
    }
  });

  document.querySelectorAll<HTMLInputElement>('.pwc-speed-slider').forEach((slider) => {
    const pct = speedToSliderPercent(state.currentSpeed, state.snapPoints);
    slider.value = String(Math.round(pct * 10));
    slider.setAttribute('aria-valuetext', `${formatSpeed(state.currentSpeed)}x`);
    updateSliderBackground(slider, state.currentSpeed);
  });

  document.querySelectorAll<HTMLElement>('.pwc-tick-label').forEach((label) => {
    const valText = (label.textContent || '').replace('x', '');
    const val = parseFloat(valText);
    if (!isNaN(val) && Math.abs(state.currentSpeed - val) < 0.06) {
      label.classList.add('pwc-active-tick');
    } else {
      label.classList.remove('pwc-active-tick');
    }
  });

  // Update lecture finish time badge
  updateFinishTime();
}
