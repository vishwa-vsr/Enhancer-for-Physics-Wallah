import { state } from '../../state';
import {
  findPWToolbar,
  isInsidePreferredToolbar,
  preventFocusSteal,
  setHidden,
} from '../distractions/elements';
import { getActiveVideo } from '../video/detector';
import {
  isSSEngineRunning,
  getSSCurrentState,
  getSSLastVolumeLevel,
  getSSSessionSaved,
  toggleSkipSilence,
  wakeUpSSEngine,
} from '../audio/skip-silence';

let ssVisualizerInterval: ReturnType<typeof setInterval> | null = null;

// Format milliseconds to compact human-readable time saved string for the player toolbar
export function formatTimeSaved(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  if (totalSeconds < 60) return totalSeconds + 's';
  const minutes = Math.floor(totalSeconds / 60);
  if (minutes < 100) return minutes + 'm';
  const hours = Math.floor(minutes / 60);
  return hours + 'h';
}

// Build and inject the Skip Silence toggle button + visualizer + status into the player toolbar
export function injectSkipSilenceButton(): void {
  if (!state.extensionEnabled) {
    const existing = document.getElementById('pwc-ss-container');
    if (existing) existing.remove();
    return;
  }

  let container = document.getElementById('pwc-ss-container');
  if (container && isInsidePreferredToolbar(container)) {
    updateSkipSilenceUI();
    return;
  }
  if (container) {
    container.remove();
    container = null;
  }

  const toolbar = findPWToolbar();
  if (!toolbar) return;

  if (!container) {
    container = document.createElement('div');
    container.id = 'pwc-ss-container';
    container.className = 'pwc-ss-container';

    // Toggle button
    const btn = document.createElement('button');
    btn.id = 'pwc-ss-toggle';
    btn.className = 'pwc-ss-toggle';
    btn.type = 'button';
    preventFocusSteal(btn);
    btn.setAttribute('title', 'Skip Silence (Beta)');

    // Waveform SVG icon
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');

    // Soundwave with forward skip icon
    const bar1 = document.createElementNS(svgNS, 'line');
    bar1.setAttribute('x1', '3');
    bar1.setAttribute('y1', '10');
    bar1.setAttribute('x2', '3');
    bar1.setAttribute('y2', '14');
    svg.appendChild(bar1);

    const bar2 = document.createElementNS(svgNS, 'line');
    bar2.setAttribute('x1', '7');
    bar2.setAttribute('y1', '6');
    bar2.setAttribute('x2', '7');
    bar2.setAttribute('y2', '18');
    svg.appendChild(bar2);

    const bar3 = document.createElementNS(svgNS, 'line');
    bar3.setAttribute('x1', '11');
    bar3.setAttribute('y1', '3');
    bar3.setAttribute('x2', '11');
    bar3.setAttribute('y2', '21');
    svg.appendChild(bar3);

    const chevron = document.createElementNS(svgNS, 'polyline');
    chevron.setAttribute('points', '15 8 19 12 15 16');
    svg.appendChild(chevron);

    const endLine = document.createElementNS(svgNS, 'line');
    endLine.setAttribute('x1', '21');
    endLine.setAttribute('y1', '8');
    endLine.setAttribute('x2', '21');
    endLine.setAttribute('y2', '16');
    svg.appendChild(endLine);

    btn.appendChild(svg);
    container.appendChild(btn);

    // Equalizer visualizer (5 bars)
    const vizContainer = document.createElement('div');
    vizContainer.className = 'pwc-ss-visualizer';
    vizContainer.id = 'pwc-ss-visualizer';
    for (let i = 0; i < 5; i++) {
      const bar = document.createElement('div');
      bar.className = 'pwc-ss-bar';
      vizContainer.appendChild(bar);
    }
    container.appendChild(vizContainer);

    // Status text
    const statusText = document.createElement('span');
    statusText.className = 'pwc-ss-status';
    statusText.id = 'pwc-ss-status';
    statusText.textContent = '';
    container.appendChild(statusText);

    // Insert after speed control
    const speedControl = document.getElementById('pwc-speed-control');
    if (speedControl && speedControl.nextSibling) {
      toolbar.insertBefore(container, speedControl.nextSibling);
    } else if (toolbar.children.length > 1) {
      toolbar.insertBefore(container, toolbar.children[1]);
    } else {
      toolbar.appendChild(container);
    }

    // Click handler
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      btn.blur();
      const isRunning = isSSEngineRunning();
      const video = getActiveVideo();

      // If enabled but stalled while video is playing:
      // Direct click on the button IS a direct user gesture! Wake up audio immediately!
      if (state.skipSilenceEnabled && !isRunning && video && !video.paused) {
        wakeUpSSEngine();
        return;
      }

      toggleSkipSilence(!state.skipSilenceEnabled);
    });
  }

  updateSkipSilenceUI();
}

// Update the skip silence UI elements
export function updateSkipSilenceUI(): void {
  const container = document.getElementById('pwc-ss-container');
  if (!container) return;

  setHidden(container, !state.extensionEnabled || state.hideSettings.hideSkipSilence);

  const btn = document.getElementById('pwc-ss-toggle');
  const viz = document.getElementById('pwc-ss-visualizer');
  const status = document.getElementById('pwc-ss-status');

  const isRunning = isSSEngineRunning();
  const currentState = getSSCurrentState();
  const lastLevel = getSSLastVolumeLevel();
  const sessionSaved = getSSSessionSaved();
  const activeVid = getActiveVideo();
  const isActivelyPlaying = Boolean(activeVid && !activeVid.paused && !activeVid.ended);

  if (btn) {
    btn.classList.toggle('active', state.skipSilenceEnabled);
    btn.classList.toggle(
      'speech',
      state.skipSilenceEnabled && isActivelyPlaying && currentState === 'speech',
    );
    btn.classList.toggle(
      'silence',
      state.skipSilenceEnabled && isActivelyPlaying && currentState === 'silence',
    );
    if (!state.skipSilenceEnabled) {
      btn.setAttribute('title', 'Skip Silence: Off (Click to enable)');
    } else if (isRunning) {
      btn.setAttribute('title', 'Skip Silence: Active (Click to disable)');
    } else {
      if (isActivelyPlaying) {
        btn.setAttribute('title', 'Skip Silence: Click button or video to activate');
      } else {
        btn.setAttribute('title', 'Skip Silence: Ready (Play video to start)');
      }
    }
  }

  if (viz) {
    viz.classList.toggle('active', state.skipSilenceEnabled);
    viz.classList.toggle(
      'silence',
      state.skipSilenceEnabled && isActivelyPlaying && currentState === 'silence',
    );
    const bars = viz.querySelectorAll<HTMLElement>('.pwc-ss-bar');
    if (state.skipSilenceEnabled && isRunning && isActivelyPlaying && currentState === 'speech') {
      const baseHeight = Math.min(lastLevel * 500, 1); // Normalize to 0-1
      bars.forEach((bar) => {
        const variation = 0.3 + Math.random() * 0.7;
        const h = Math.max(3, baseHeight * variation * 16);
        bar.style.height = h + 'px';
      });
    } else {
      bars.forEach((bar) => {
        bar.style.height = '3px';
      });
    }
  }

  if (status) {
    status.classList.toggle('active', state.skipSilenceEnabled);
    if (!state.skipSilenceEnabled) {
      status.textContent = '';
    } else if (isActivelyPlaying && currentState === 'silence') {
      status.textContent = 'Skipping';
      status.style.color = '#fb923c';
    } else {
      status.textContent = 'Saved ' + formatTimeSaved(sessionSaved);
      status.style.color = '#4ade80';
    }
  }
}

// Managed periodic UI update for skip silence visualizer (active only when running)
export function manageSSVisualizerInterval(): void {
  const isRunning = isSSEngineRunning();
  if (state.skipSilenceEnabled && isRunning) {
    if (!ssVisualizerInterval) {
      ssVisualizerInterval = setInterval(() => {
        if (state.skipSilenceEnabled && isSSEngineRunning()) {
          updateSkipSilenceUI();
        } else if (ssVisualizerInterval) {
          clearInterval(ssVisualizerInterval);
          ssVisualizerInterval = null;
        }
      }, 250);
    }
  } else if (ssVisualizerInterval) {
    clearInterval(ssVisualizerInterval);
    ssVisualizerInterval = null;
  }
}
