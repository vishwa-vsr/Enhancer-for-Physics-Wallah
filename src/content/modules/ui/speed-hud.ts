import { state, sanitizeSnapPoints } from '../../state';
import { findPWToolbar } from '../distractions/elements';
import { applyDistractorsState } from '../distractions/focus-css';
import { stepSpeed, saveSpeed } from '../video/controller';
import { updateFinishTime } from './finish-time';
import { getSSCurrentState } from '../audio/skip-silence';

// Equal-distance 4-point segmented slider interpolation functions
// Points: [p0, p1, p2, p3] mapped at 0%, 33.3333%, 66.6667%, 100%
export function speedToSliderPercent(speed: number | string, points?: number[]): number {
  const pts = points && points.length === 4 ? points : [1.0, 2.0, 3.0, 4.0];
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
  const pts = points && points.length === 4 ? points : [1.0, 2.0, 3.0, 4.0];
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
      container.classList.add('pwc-expanded');
    } else {
      container.classList.remove('pwc-always-expanded');
      container.classList.remove('pwc-expanded');
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
  if (!slider) return;

  updateSliderBackground(slider, state.currentSpeed);

  let mouseLeaveTimer: any = null;
  container.addEventListener('mouseenter', () => {
    if (mouseLeaveTimer) {
      clearTimeout(mouseLeaveTimer);
      mouseLeaveTimer = null;
    }
    container.classList.add('pwc-expanded');
  });

  container.addEventListener('mouseleave', () => {
    if (state.alwaysExpandWidget) return;
    mouseLeaveTimer = setTimeout(() => {
      container.classList.remove('pwc-expanded');
    }, 250);
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
    saveSpeed(val);
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
      e.preventDefault();
      const val = stepSpeed(e.deltaY < 0 ? 1 : -1);
      slider.value = String(Math.round(speedToSliderPercent(val, state.snapPoints) * 10));
      updateSliderBackground(slider, val);
      saveSpeed(val);
    },
    { passive: false }
  );
}

// Programmatically construct the speedometer control without innerHTML
export function buildSpeedControl(container: HTMLElement): void {
  container.textContent = '';

  // Create button
  const btn = document.createElement('button');
  btn.className = 'pwc-speed-btn';
  btn.type = 'button';
  btn.setAttribute('title', 'Playback Speed');

  // Create SVG using document.createElementNS for SVGs
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '2.2');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');

  const path = document.createElementNS(svgNS, 'path');
  path.setAttribute('d', 'M6 18A8 8 0 1 1 18 18');
  svg.appendChild(path);

  const line = document.createElementNS(svgNS, 'line');
  line.setAttribute('class', 'pwc-needle');
  line.setAttribute('x1', '12');
  line.setAttribute('y1', '14');
  line.setAttribute('x2', '15');
  line.setAttribute('y2', '9');
  line.style.transformOrigin = '12px 14px';
  line.style.transition = 'transform 0.12s cubic-bezier(0.4, 0, 0.2, 1)';
  svg.appendChild(line);

  const circle = document.createElementNS(svgNS, 'circle');
  circle.setAttribute('cx', '12');
  circle.setAttribute('cy', '14');
  circle.setAttribute('r', '1.5');
  circle.setAttribute('fill', 'currentColor');
  svg.appendChild(circle);

  btn.appendChild(svg);

  // Create badge
  const badge = document.createElement('span');
  badge.className = 'pwc-speed-badge';
  badge.textContent = `${state.currentSpeed.toFixed(1)}x`;
  btn.appendChild(badge);

  container.appendChild(btn);

  // Create slider container
  const sliderContainer = document.createElement('div');
  sliderContainer.className = 'pwc-speed-slider-container';

  const sliderWrapper = document.createElement('div');
  sliderWrapper.className = 'pwc-slider-wrapper';

  const input = document.createElement('input');
  input.type = 'range';
  input.className = 'pwc-speed-slider';
  input.min = '0';
  input.max = '1000';
  input.step = '1';
  input.value = String(Math.round(speedToSliderPercent(state.currentSpeed, state.snapPoints) * 10));
  sliderWrapper.appendChild(input);

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

  const toolbar = findPWToolbar();
  if (toolbar) {
    const existingContainer = document.getElementById('pwc-speed-control') as HTMLElement | null;
    if (!existingContainer) {
      const container = document.createElement('div');
      container.id = 'pwc-speed-control';
      container.className = 'pwc-speed-container';
      buildSpeedControl(container);

      if (toolbar.firstChild) {
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
    badge.textContent = `${state.currentSpeed.toFixed(1)}x`;
  });

  document.querySelectorAll<HTMLInputElement>('.pwc-speed-slider').forEach((slider) => {
    const pct = speedToSliderPercent(state.currentSpeed, state.snapPoints);
    slider.value = String(Math.round(pct * 10));
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

  // Update needle rotation based on current speed
  const pct = (state.currentSpeed - 0.5) / (4.0 - 0.5);
  const angle = -110 + pct * 220; // range from -110deg to 110deg
  document.querySelectorAll<SVGElement>('.pwc-needle').forEach((needle) => {
    needle.style.transform = `rotate(${angle}deg)`;
  });

  // Update lecture finish time badge
  updateFinishTime();
}
