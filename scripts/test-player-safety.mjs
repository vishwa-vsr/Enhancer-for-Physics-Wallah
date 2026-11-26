import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import esbuild from 'esbuild';
import { JSDOM } from 'jsdom';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

console.log('--- Running Pre-Build Video Player Safety Tests ---');

// ============================================================================
// Layer 1: Source Code Static Guardrails
// ============================================================================
console.log('[Test 1/2] Checking observer.ts for dangerous watcher patterns...');

const observerPath = path.join(rootDir, 'src/content/modules/dom/observer.ts');
const observerCode = fs.readFileSync(observerPath, 'utf8');

// Guard 1: Never allow attributes: true on document.documentElement with subtree: true
const hasDangerousRootAttributes =
  /observer\.observe\s*\(\s*document\.documentElement\s*,\s*\{[^}]*attributes\s*:\s*true/s.test(
    observerCode,
  ) ||
  /attributes\s*:\s*true[^}]*observer\.observe\s*\(\s*document\.documentElement/s.test(
    observerCode,
  );

if (hasDangerousRootAttributes) {
  console.error(
    'FAIL: Found dangerous "attributes: true" watching on document.documentElement!\n' +
      'Watching all attribute changes across the entire page causes infinite loops with video players.',
  );
  process.exit(1);
}

// Guard 2: Ensure self-injected pwc elements are filtered before treating drawer as relevant
const pwcFilterIdx = observerCode.indexOf('Skip mutations where only pwc elements were added');
const timelineDrawerIdx = observerCode.indexOf('Always treat timeline drawer mounts');

if (pwcFilterIdx === -1 || timelineDrawerIdx === -1 || pwcFilterIdx > timelineDrawerIdx) {
  console.error(
    'FAIL: Injected pwc element filter must run before timeline drawer checks in startDomObserver!\n' +
      'Otherwise, injecting badges into cards will trigger recursive mutation loops.',
  );
  process.exit(1);
}

// Guard 3: Ensure every key in DEFAULT_HIDE_SETTINGS is requested by safeGetSettings()
const sharedTypesPath = path.join(rootDir, 'src/shared/types.ts');
const sharedTypesCode = fs.readFileSync(sharedTypesPath, 'utf8');
const hideMatch = sharedTypesCode.match(/export const DEFAULT_HIDE_SETTINGS[\s\S]*?=\s*\{([\s\S]*?)\};/);
if (!hideMatch) {
  console.error('FAIL: Could not locate DEFAULT_HIDE_SETTINGS in src/shared/types.ts.');
  process.exit(1);
}
const defaultHideKeys = [...hideMatch[1].matchAll(/^\s*([a-zA-Z0-9_]+)\s*:/gm)].map((m) => m[1]);
let requestedStorageKeys = [];
const stateBuild = esbuild.buildSync({
  entryPoints: [path.join(rootDir, 'src/content/state.ts')],
  bundle: true,
  write: false,
  target: 'chrome90',
  format: 'cjs',
});
const stateModule = { exports: {} };
new Function('exports', 'module', stateBuild.outputFiles[0].text)(
  stateModule.exports,
  stateModule,
);
globalThis.chrome = {
  runtime: { id: 'safety-test' },
  storage: {
    local: {
      get: (keys) => {
        requestedStorageKeys = Array.isArray(keys) ? keys : [];
      },
    },
  },
};
stateModule.exports.safeGetSettings(() => {});
delete globalThis.chrome;
const safeGetKeys = new Set(requestedStorageKeys);
const missingHideKeys = defaultHideKeys.filter((k) => !safeGetKeys.has(k));
if (missingHideKeys.length > 0) {
  console.error(
    `FAIL: DEFAULT_HIDE_SETTINGS keys missing from safeGetSettings() in state.ts: ${missingHideKeys.join(', ')}`,
  );
  process.exit(1);
}

console.log('PASS: Static watcher and settings guardrails passed.');

// ============================================================================
// Layer 2: Live Video Player Simulation in JSDOM
// ============================================================================
console.log('[Test 2/2] Simulating lecture video playback in JSDOM...');

// Build content.js in-memory
let contentBundle;
try {
  const result = esbuild.buildSync({
    entryPoints: [path.join(rootDir, 'src/content/index.ts')],
    bundle: true,
    write: false,
    target: 'chrome90',
    format: 'iife',
  });
  contentBundle = result.outputFiles[0].text;
} catch (err) {
  console.error('FAIL: Could not build content script for simulation:', err);
  process.exit(1);
}

const html = `<!DOCTYPE html>
<html>
<head><title>Physics Wallah - Watch</title></head>
<body>
  <div id="video-player-container">
    <div class="video-js vjs-waiting">
      <video id="my-video" class="vjs-tech" src="blob:http://example.com/test"></video>
      <div id="interactive-layer-wrapper">
        <div class="player-header"><button aria-label="Back">Back</button></div>
        <div id="player-footer-controls">
          <div class="player-footer">
            <div id="footer-left-section"></div>
            <div id="footer-right-section">
              <button title="Add note">Note</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;

const dom = new JSDOM(html, {
  url: 'https://www.pw.live/watch/?batchSlug=test-batch&batchSubjectId=test-subject',
  runScripts: 'dangerously',
});

const win = dom.window;

win.chrome = {
  runtime: { id: 'safety-test-id', getURL: (p) => p },
  storage: {
    local: {
      get: (keys, cb) =>
        cb({
          extensionEnabled: true,
          enableSlideViewer: true,
          autoHideControls: true,
        }),
      set: (obj, cb) => cb && cb(),
    },
    onChanged: { addListener: () => {} },
  },
};

win.HTMLMediaElement.prototype.play = () => Promise.resolve();
win.HTMLMediaElement.prototype.pause = () => {};

let throttledCallCount = 0;
const origSetTimeout = win.setTimeout;
win.setTimeout = function (fn, delay) {
  if (typeof fn === 'function' && delay === 150) {
    throttledCallCount++;
    if (throttledCallCount > 10) {
      console.error(
        `FAIL: Runaway loop detected! throttledMonitor scheduled ${throttledCallCount} times during initial load.`,
      );
      process.exit(1);
    }
  }
  return origSetTimeout.apply(this, arguments);
};

// Evaluate content script
try {
  win.eval(contentBundle);
} catch (err) {
  console.error('FAIL: Content script threw during startup:', err);
  process.exit(1);
}

// Simulate browser events
const video = win.document.querySelector('video');
const player = win.document.querySelector('.video-js');

video.dispatchEvent(new win.Event('loadstart'));
video.dispatchEvent(new win.Event('play'));
video.dispatchEvent(new win.Event('timeupdate'));
player.className = 'video-js vjs-waiting vjs-seeking';

// Allow any microtasks / timers to cycle
await new Promise((resolve) => setTimeout(resolve, 350));

if (throttledCallCount > 5) {
  console.error(
    `FAIL: Video player triggered ${throttledCallCount} monitor calls. Normal threshold is <= 5.`,
  );
  process.exit(1);
}

console.log(
  `PASS: Video player simulation completed with healthy activity (${throttledCallCount} cycles).`,
);

// ============================================================================
// Layer 3: Regression Checks for Timeline/Time Hiding & Speed Wheel Guards
// ============================================================================
console.log('[Test 3/3] Verifying hideTimeLine, hideTimeText, and speed wheel behavior...');

const featureHtml = `<!DOCTYPE html>
<html>
<head><title>Physics Wallah - Watch</title></head>
<body>
  <div id="video-player-container">
    <div class="video-js">
      <video id="my-video" class="vjs-tech" src="blob:http://example.com/test"></video>
      <div id="interactive-layer-wrapper">
        <div id="player-footer-controls">
          <div id="progress-placeholder">
            <div class="flex items-center">
              <div id="current-time-placeholder"><div class="vjs-current-time"><span class="vjs-control-text">Current Time </span><span class="vjs-current-time-display">7:10</span></div></div>
              <div id="total-time-placeholder">/<div class="vjs-duration"><span class="vjs-control-text">Duration </span><span class="vjs-duration-display">44:19</span></div></div>
            </div>
            <div id="progress-control" class="vjs-progress-control"></div>
          </div>
          <div class="player-footer">
            <div id="footer-left-section"></div>
            <div id="footer-right-section">
              <button id="setting-icon">Settings</button>
              <button aria-label="Full screen">Fullscreen</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;

const featureDom = new JSDOM(featureHtml, {
  url: 'https://www.pw.live/watch/?batchSlug=test-batch&batchSubjectId=test-subject',
  runScripts: 'dangerously',
});
const fWin = featureDom.window;
fWin.HTMLMediaElement.prototype.play = () => Promise.resolve();
fWin.HTMLMediaElement.prototype.pause = () => {};
fWin.chrome = {
  runtime: { id: 'feature-test-id', getURL: (p) => p },
  storage: {
    local: {
      get: (keys, cb) => {
        const keyList = Array.isArray(keys) ? keys : [];
        if (!keyList.includes('hideTimeLine') || !keyList.includes('hideTimeText')) {
          throw new Error('safeGetSettings missed hideTimeLine or hideTimeText');
        }
        cb({
          extensionEnabled: true,
          preferredSpeed: 1.0,
          speedScrollEnabled: true,
          hideTimeLine: true,
          hideTimeText: true,
        });
      },
      set: (obj, cb) => cb && cb(),
    },
    onChanged: { addListener: () => {} },
  },
};

fWin.eval(contentBundle);
await new Promise((resolve) => setTimeout(resolve, 100));

const fDoc = fWin.document;
const progressEl = fDoc.getElementById('progress-control');
const curTimeEl = fDoc.getElementById('current-time-placeholder');
const totTimeEl = fDoc.getElementById('total-time-placeholder');
const speedContainer = fDoc.getElementById('pwc-speed-control');
const fVideo = fDoc.querySelector('video');

if (
  !fDoc.documentElement.classList.contains('pwc-hide-timeline') ||
  progressEl?.style.display !== 'none'
) {
  console.error('FAIL: hideTimeLine did not hide #progress-control on startup!');
  process.exit(1);
}

if (
  !fDoc.documentElement.classList.contains('pwc-hide-timetext') ||
  curTimeEl?.style.display !== 'none' ||
  totTimeEl?.style.display !== 'none'
) {
  console.error(
    'FAIL: hideTimeText did not hide #current-time-placeholder and #total-time-placeholder (including "/")!',
  );
  process.exit(1);
}

if (!speedContainer) {
  console.error('FAIL: #pwc-speed-control was not injected!');
  process.exit(1);
}

// Horizontal wheel must NOT adjust speed
speedContainer.dispatchEvent(
  new fWin.WheelEvent('wheel', { deltaX: 120, deltaY: 0, bubbles: true, cancelable: true }),
);
if (Math.abs(fVideo.playbackRate - 1.0) > 0.01) {
  console.error(`FAIL: Horizontal wheel changed playbackRate to ${fVideo.playbackRate}`);
  process.exit(1);
}

// Ctrl+wheel (zoom) must NOT adjust speed
speedContainer.dispatchEvent(
  new fWin.WheelEvent('wheel', { deltaY: -120, ctrlKey: true, bubbles: true, cancelable: true }),
);
if (Math.abs(fVideo.playbackRate - 1.0) > 0.01) {
  console.error(`FAIL: Ctrl+wheel changed playbackRate to ${fVideo.playbackRate}`);
  process.exit(1);
}

// Mouse wheel up increases speed by 0.1x
speedContainer.dispatchEvent(
  new fWin.WheelEvent('wheel', { deltaY: -120, bubbles: true, cancelable: true }),
);
if (Math.abs(fVideo.playbackRate - 1.1) > 0.01) {
  console.error(`FAIL: Mouse wheel up expected 1.1x, got ${fVideo.playbackRate}`);
  process.exit(1);
}

// Mouse wheel down decreases speed back to 1.0x
speedContainer.dispatchEvent(
  new fWin.WheelEvent('wheel', { deltaY: 120, bubbles: true, cancelable: true }),
);
if (Math.abs(fVideo.playbackRate - 1.0) > 0.01) {
  console.error(`FAIL: Mouse wheel down expected 1.0x, got ${fVideo.playbackRate}`);
  process.exit(1);
}

// Small trackpad micro-scroll should accumulate without instant jitter, then step at threshold
speedContainer.dispatchEvent(
  new fWin.WheelEvent('wheel', { deltaY: -10, bubbles: true, cancelable: true }),
);
if (Math.abs(fVideo.playbackRate - 1.0) > 0.01) {
  console.error(`FAIL: Tiny trackpad scroll (-10px) jumped immediately to ${fVideo.playbackRate}`);
  process.exit(1);
}
speedContainer.dispatchEvent(
  new fWin.WheelEvent('wheel', { deltaY: -20, bubbles: true, cancelable: true }),
);
if (Math.abs(fVideo.playbackRate - 1.1) > 0.01) {
  console.error(
    `FAIL: Accumulated trackpad scroll (-30px) expected 1.1x, got ${fVideo.playbackRate}`,
  );
  process.exit(1);
}

console.log('PASS: Timeline/time hiding and speed wheel regression tests passed.');
console.log('--- All Safety Tests Passed Cleanly! ---\n');
