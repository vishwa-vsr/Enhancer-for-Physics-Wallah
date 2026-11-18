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
    observerCode
  ) ||
  /attributes\s*:\s*true[^}]*observer\.observe\s*\(\s*document\.documentElement/s.test(
    observerCode
  );

if (hasDangerousRootAttributes) {
  console.error(
    'FAIL: Found dangerous "attributes: true" watching on document.documentElement!\n' +
      'Watching all attribute changes across the entire page causes infinite loops with video players.'
  );
  process.exit(1);
}

// Guard 2: Ensure self-injected pwc elements are filtered before treating drawer as relevant
const pwcFilterIdx = observerCode.indexOf('Skip mutations where only pwc elements were added');
const timelineDrawerIdx = observerCode.indexOf('Always treat timeline drawer mounts');

if (pwcFilterIdx === -1 || timelineDrawerIdx === -1 || pwcFilterIdx > timelineDrawerIdx) {
  console.error(
    'FAIL: Injected pwc element filter must run before timeline drawer checks in startDomObserver!\n' +
      'Otherwise, injecting badges into cards will trigger recursive mutation loops.'
  );
  process.exit(1);
}

console.log('PASS: Static watcher guardrails passed.');

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
        `FAIL: Runaway loop detected! throttledMonitor scheduled ${throttledCallCount} times during initial load.`
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
    `FAIL: Video player triggered ${throttledCallCount} monitor calls. Normal threshold is <= 5.`
  );
  process.exit(1);
}

console.log(
  `PASS: Video player simulation completed with healthy activity (${throttledCallCount} cycles).`
);
console.log('--- All Safety Tests Passed Cleanly! ---\n');
