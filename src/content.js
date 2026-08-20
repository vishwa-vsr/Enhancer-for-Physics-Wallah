(function () {

  let currentSpeed = 1.0;
  let activeVideo = null;
  let isSettingRate = false;
  let toastTimeout = null;
  let isModifyingDOM = false;
  let extensionEnabled = true;

  // New Caching and Feature states
  let enableInstantHide = false;
  let enablePiP = true;
  let cachedVideo = null;
  let cachedSettingsBtn = null;
  let cachedFullscreenBtn = null;
  let cachedTimeline = null;
  let cachedTimeTexts = null;
  let cachedNativeSpeedBadges = null;
  let lastCollapsedTime = 0;

  // Custom hotkey and snap point configurations
  let enableHotkeys = false;
  let disableScroll = false;
  let keySpeedUp = 'h';
  let keySlowDown = 'j';
  let keyReset = 'l';
  let snapPoints = [1.0, 2.0, 3.0, 4.0];

  // Hold Space to Speed Up configuration
  let holdSpaceSpeedUp = false;
  let holdSpaceSpeed = 2.0;
  let spacePressTimer = null;
  let isHoldingSpace = false;
  let speedBeforeHold = 1.0;
  let isPointerHoldingOnPlayer = false;
  let alwaysExpandWidget = false;

  // Skip Silence configuration
  let skipSilenceEnabled = false;
  let skipSilenceMode = 'speedup'; // 'speedup' or 'hardskip'
  let skipSilenceSpeechSpeed = 1.0;
  let skipSilenceSilenceSpeed = 3.0;
  let skipSilenceThreshold = -40; // Manual threshold in dB (-60dB to -20dB)
  let skipSilenceDynamicThreshold = true; // Auto-calculate threshold from noise floor
  let skipSilenceMute = false;
  let skipSilenceTimeSaved = 0; // milliseconds
  let skipSilenceSessionSaved = 0; // per-session ms
  let skipSilenceMinDuration = 0.5; // minimum silence in seconds before skipping (0.3-3.0)

  // Skip Silence engine state (internal)
  let ssAudioContext = null;
  let ssSourceNode = null;
  let ssWorkletNode = null;
  let ssDelayNode = null;
  let ssGainNode = null;
  let ssConnectedVideo = null; // Track which video the audio pipeline is connected to
  let ssCurrentState = 'idle'; // 'idle', 'speech', 'silence'
  let ssIsSilentNow = false;
  let ssSilenceStartTime = 0;
  let ssSilentMsAccumulated = 0; // Tick-based silence accumulator (bypasses setTimeout throttling)
  let ssVolumeHistory = []; // Rolling buffer of volume levels (dB) for ~10 seconds (~470 entries)
  let ssCalculatedNoiseFloorDb = -45; // Auto-calculated noise floor threshold in dB
  let ssSamplesSinceCalc = 0;
  let ssLastVolumeLevel = 0;
  let ssLastVolumeDb = -100;
  let ssEngineRunning = false;
  let ssInitializing = false;

  // Inline AudioWorklet processor code for skip silence volume detection
  const VOLUME_PROCESSOR_CODE = `
class VolumeProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this._rms = 0;
    this._count = 0;
    this._enabled = true;
    this.port.onmessage = (e) => { this._enabled = e.data; };
  }
  process(inputs, outputs) {
    const input = inputs[0];
    if (!input || !input.length) return true;
    const samples = input[0];
    if (!samples) return true;
    let sum = 0;
    for (let i = 0; i < samples.length; i++) {
      sum += samples[i] * samples[i];
    }
    this._rms += sum / samples.length;
    this._count += 1;
    // Report every ~1024 samples (~23ms at 44.1kHz)
    if (this._count >= Math.ceil(1024 / samples.length)) {
      if (this._enabled) {
        this.port.postMessage(Math.sqrt(this._rms / this._count));
      }
      this._rms = 0;
      this._count = 0;
    }
    return true;
  }
}
registerProcessor('pwc-volume-processor', VolumeProcessor);
`;

  // Convert raw RMS to Decibels (dB), clamped between -100dB and 0dB
  function rmsToDb(rms) {
    if (!rms || rms <= 0.000001) return -100;
    const db = 20 * Math.log10(rms);
    return Math.max(-100, Math.min(0, Math.round(db * 10) / 10));
  }

  // Converts or clamps manual threshold to dB (-60dB to -20dB)
  function manualThresholdToDb(val) {
    if (typeof val === 'number' && val < 0) {
      return Math.max(-60, Math.min(-20, val));
    }
    // Fallback if legacy 1-100 scale: 1 -> -60dB, 100 -> -20dB
    const legacy = Math.max(1, Math.min(100, val || 30));
    return Math.round(-60 + ((legacy - 1) / 99) * 40);
  }

  // Calculate effective thresholds with 3dB Hysteresis (Schmitt Trigger)
  function getEffectiveThresholds() {
    let baseDb;
    if (skipSilenceDynamicThreshold) {
      baseDb = ssCalculatedNoiseFloorDb;
    } else {
      baseDb = manualThresholdToDb(skipSilenceThreshold);
    }
    // Hysteresis: drop below baseDb to enter silence, rise above baseDb + 3dB to exit silence
    return {
      silenceThresholdDb: baseDb,
      speechThresholdDb: baseDb + 3
    };
  }

  // Rolling volume history buffer for dynamic noise-floor auto-calibration (~10s history)
  function updateDynamicNoiseFloor(db) {
    if (!Number.isFinite(db)) return;
    ssVolumeHistory.push(db);
    if (ssVolumeHistory.length > 470) {
      ssVolumeHistory.shift();
    }
    // Recalculate roughly once every ~23 samples (~500ms)
    ssSamplesSinceCalc++;
    if (ssSamplesSinceCalc >= 23 && ssVolumeHistory.length >= 47) {
      ssSamplesSinceCalc = 0;
      const sorted = ssVolumeHistory.slice().sort((a, b) => a - b);
      const p15Index = Math.floor(sorted.length * 0.15);
      const noiseFloor = sorted[p15Index];
      // 15th percentile noise floor + 3dB margin, clamped within realistic boundaries (-60dB to -20dB)
      ssCalculatedNoiseFloorDb = Math.max(-60, Math.min(-20, Math.round((noiseFloor + 3) * 10) / 10));
    }
  }

  // Helper to ensure AudioContext stays awake across browser autoplay policies
  function resumeAudioContextOnInteraction(audioCtx) {
    if (!audioCtx || audioCtx.state !== 'suspended') return;
    audioCtx.resume();
    const resumeFn = () => {
      if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
    };
    document.addEventListener('pointerdown', resumeFn, { once: true, capture: true });
    document.addEventListener('keydown', resumeFn, { once: true, capture: true });
  }

  // Permanent Audio Graph cache per HTMLMediaElement (WeakMap + DOM property fallback)
  const videoAudioGraphs = new WeakMap();

  function getCachedAudioGraph(video) {
    if (!video) return null;
    return videoAudioGraphs.get(video) || video._pwcAudioGraph || null;
  }

  // Initialize or resume the audio pipeline for skip silence
  async function ssInit() {
    const video = getActiveVideo();
    if (!video || ssInitializing) return;

    ssInitializing = true;
    try {
      let graph = getCachedAudioGraph(video);

      if (!graph) {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

        // Create worklet from inline code via Blob URL
        const blob = new Blob([VOLUME_PROCESSOR_CODE], { type: 'application/javascript' });
        const workletUrl = URL.createObjectURL(blob);
        await audioCtx.audioWorklet.addModule(workletUrl);
        URL.revokeObjectURL(workletUrl);

        // Create source node once per video element
        const sourceNode = audioCtx.createMediaElementSource(video);

        // Create delay node for lookahead buffer (60ms)
        const delayNode = audioCtx.createDelay(1.0);
        delayNode.delayTime.value = 0.06;

        // Create gain node for muting during silence
        const gainNode = audioCtx.createGain();
        gainNode.gain.value = 1.0;

        // Create worklet node for volume analysis
        const workletNode = new AudioWorkletNode(audioCtx, 'pwc-volume-processor');

        // Audio routing:
        // video -> source -> delay -> gain -> destination (speakers)
        // video -> source -> workletNode (volume analysis, no output)
        sourceNode.connect(delayNode);
        delayNode.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        sourceNode.connect(workletNode);

        graph = {
          context: audioCtx,
          sourceNode: sourceNode,
          delayNode: delayNode,
          gainNode: gainNode,
          workletNode: workletNode
        };

        videoAudioGraphs.set(video, graph);
        video._pwcAudioGraph = graph;
      }

      // Ensure AudioContext is resumed
      resumeAudioContextOnInteraction(graph.context);

      // Point current engine references to this active video's graph
      ssAudioContext = graph.context;
      ssSourceNode = graph.sourceNode;
      ssDelayNode = graph.delayNode;
      ssGainNode = graph.gainNode;
      ssWorkletNode = graph.workletNode;
      ssConnectedVideo = video;

      // Enable worklet message reporting
      ssWorkletNode.port.postMessage(true);
      ssWorkletNode.port.onmessage = (event) => {
        if (!ssEngineRunning || isHoldingSpace) return;
        ssLastVolumeLevel = event.data;
        const db = rmsToDb(event.data);
        ssLastVolumeDb = db;
        ssProcessVolume(db);
      };

      ssEngineRunning = true;
      ssCurrentState = 'speech';
      ssIsSilentNow = false;
      ssSilentMsAccumulated = 0;
      ssInitializing = false;
      updateSkipSilenceUI();
    } catch (err) {
      ssInitializing = false;
      ssEngineRunning = false;
      console.warn('PW Control: Skip Silence init failed:', err.message);
      if (err.name === 'NotSupportedError' || err.message.includes('CORS') || err.message.includes('cross-origin')) {
        showInfoToast('Skip Silence: Video source blocked (CORS)');
      }
      ssDestroy();
    }
  }

  // Safely set video playback rate without event loop oscillation
  function setVideoPlaybackRate(rate) {
    const video = getActiveVideo();
    if (!video) return;
    const clamped = Math.round(rate * 100) / 100;
    if (Math.abs(video.playbackRate - clamped) > 0.02) {
      isSettingRate = true;
      video.playbackRate = clamped;
      setTimeout(() => { isSettingRate = false; }, 30);
    }
  }

  // Smoothly enter silence state (exponential fade out)
  function ssEnterSilence() {
    if (skipSilenceMute && ssGainNode && ssAudioContext) {
      const now = ssAudioContext.currentTime;
      ssGainNode.gain.cancelScheduledValues(now);
      ssGainNode.gain.setTargetAtTime(0, now, 0.015);
    }
  }

  // Smoothly exit silence state (restore speed + exponential fade in)
  function ssExitSilence() {
    setVideoPlaybackRate(skipSilenceSpeechSpeed);
    if (ssGainNode && ssAudioContext) {
      const now = ssAudioContext.currentTime;
      ssGainNode.gain.cancelScheduledValues(now);
      ssGainNode.gain.setTargetAtTime(1, now, 0.04);
    }
  }

  // Disable the skip silence engine (never disconnect source to prevent re-creation errors)
  function ssDestroy() {
    ssEngineRunning = false;
    ssCurrentState = 'idle';
    ssIsSilentNow = false;
    ssSilentMsAccumulated = 0;

    // Stop worklet processing
    if (ssWorkletNode) {
      try {
        ssWorkletNode.port.postMessage(false);
      } catch (e) {}
    }

    // Unmute gain node so audio is completely normal
    if (ssGainNode && ssAudioContext) {
      try {
        ssGainNode.gain.cancelScheduledValues(ssAudioContext.currentTime);
        ssGainNode.gain.setValueAtTime(1.0, ssAudioContext.currentTime);
      } catch (e) {}
    }

    // Restore normal playback speed
    const video = getActiveVideo();
    if (video && !isHoldingSpace) {
      const normalSpeed = extensionEnabled ? currentSpeed : 1.0;
      if (video.playbackRate !== normalSpeed) {
        setVideoPlaybackRate(normalSpeed);
      }
    }
    updateSkipSilenceUI();
  }

  // Process volume level on worklet tick cadence (zero setTimeout reliance)
  function ssProcessVolume(db) {
    updateDynamicNoiseFloor(db);
    const { silenceThresholdDb, speechThresholdDb } = getEffectiveThresholds();
    const windowMs = ssAudioContext ? (1024 / ssAudioContext.sampleRate) * 1000 : 23.2;

    // Hysteresis detection
    if (ssIsSilentNow) {
      if (db > speechThresholdDb) {
        ssIsSilentNow = false;
      }
    } else {
      if (db < silenceThresholdDb) {
        ssIsSilentNow = true;
      }
    }

    if (ssIsSilentNow) {
      const prevSilentMs = ssSilentMsAccumulated;
      ssSilentMsAccumulated += windowMs;

      const minSilenceMs = Math.round(skipSilenceMinDuration * 1000);
      if (ssSilentMsAccumulated >= minSilenceMs) {
        if (ssCurrentState !== 'silence') {
          ssCurrentState = 'silence';
          ssSilenceStartTime = Date.now();
          ssEnterSilence();
          updateSkipSilenceUI();
        }

        // Tick-based speed ramp over 200ms (zero setInterval)
        if (prevSilentMs < minSilenceMs + 200) {
          const progress = Math.min((ssSilentMsAccumulated - minSilenceMs) / 200, 1);
          const targetSpeed = skipSilenceSpeechSpeed + (skipSilenceSilenceSpeed - skipSilenceSpeechSpeed) * progress;
          setVideoPlaybackRate(targetSpeed);
        }

        // Track time saved
        const saved = windowMs * (1 - (skipSilenceSpeechSpeed / skipSilenceSilenceSpeed));
        skipSilenceTimeSaved += saved;
        skipSilenceSessionSaved += saved;
        safeSetSettings({ skipSilenceTimeSaved: Math.round(skipSilenceTimeSaved) });
      }
    } else {
      ssSilentMsAccumulated = 0;
      if (ssCurrentState === 'silence') {
        ssCurrentState = 'speech';
        ssExitSilence();
        updateSkipSilenceUI();
      }
    }
  }

  // Toggle skip silence on/off
  function toggleSkipSilence(enable) {
    skipSilenceEnabled = enable;
    safeSetSettings({ skipSilenceEnabled: enable });
    if (enable) {
      ssInit();
    } else {
      ssDestroy();
    }
  }

  // Format milliseconds to human-readable time saved string
  function formatTimeSaved(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    if (totalSeconds < 60) return totalSeconds + 's';
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    if (minutes < 60) return minutes + 'm ' + seconds + 's';
    const hours = Math.floor(minutes / 60);
    const remMinutes = minutes % 60;
    return hours + 'h ' + remMinutes + 'm';
  }

  // Build and inject the Skip Silence toggle button + visualizer + status into the player toolbar
  function injectSkipSilenceButton() {
    if (!extensionEnabled) {
      const existing = document.getElementById('pwc-ss-container');
      if (existing) existing.remove();
      return;
    }

    const toolbar = findPWToolbar();
    if (!toolbar) return;

    let container = document.getElementById('pwc-ss-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'pwc-ss-container';
      container.className = 'pwc-ss-container';

      // Toggle button
      const btn = document.createElement('button');
      btn.id = 'pwc-ss-toggle';
      btn.className = 'pwc-ss-toggle';
      btn.type = 'button';
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

      // Speaker with X (muted/silence icon)
      const path1 = document.createElementNS(svgNS, 'path');
      path1.setAttribute('d', 'M11 5L6 9H2v6h4l5 4V5z');
      svg.appendChild(path1);
      const line1 = document.createElementNS(svgNS, 'line');
      line1.setAttribute('x1', '23');
      line1.setAttribute('y1', '9');
      line1.setAttribute('x2', '17');
      line1.setAttribute('y2', '15');
      svg.appendChild(line1);
      const line2 = document.createElementNS(svgNS, 'line');
      line2.setAttribute('x1', '17');
      line2.setAttribute('y1', '9');
      line2.setAttribute('x2', '23');
      line2.setAttribute('y2', '15');
      svg.appendChild(line2);

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
        toggleSkipSilence(!skipSilenceEnabled);
      });
    }

    updateSkipSilenceUI();
  }

  // Update the skip silence UI elements
  function updateSkipSilenceUI() {
    const container = document.getElementById('pwc-ss-container');
    if (!container) return;

    const btn = document.getElementById('pwc-ss-toggle');
    const viz = document.getElementById('pwc-ss-visualizer');
    const status = document.getElementById('pwc-ss-status');

    if (btn) {
      btn.classList.toggle('active', skipSilenceEnabled);
      btn.classList.toggle('speech', skipSilenceEnabled && ssCurrentState === 'speech');
      btn.classList.toggle('silence', skipSilenceEnabled && ssCurrentState === 'silence');
    }

    if (viz) {
      viz.classList.toggle('active', skipSilenceEnabled && ssEngineRunning);
      viz.classList.toggle('silence', ssCurrentState === 'silence');
      // Update bar heights based on volume level
      if (skipSilenceEnabled && ssEngineRunning) {
        const bars = viz.querySelectorAll('.pwc-ss-bar');
        const baseHeight = Math.min(ssLastVolumeLevel * 500, 1); // Normalize to 0-1
        bars.forEach((bar, i) => {
          const variation = 0.3 + Math.random() * 0.7;
          const h = Math.max(3, baseHeight * variation * 16);
          bar.style.height = h + 'px';
        });
      }
    }

    if (status) {
      if (!skipSilenceEnabled) {
        status.textContent = '';
        status.style.display = 'none';
      } else if (ssCurrentState === 'silence') {
        status.textContent = 'Skipping...';
        status.style.display = '';
        status.style.color = '#fb923c';
      } else if (ssCurrentState === 'speech') {
        if (skipSilenceSessionSaved > 0) {
          status.textContent = 'Saved ' + formatTimeSaved(skipSilenceSessionSaved);
        } else {
          status.textContent = 'Listening...';
        }
        status.style.display = '';
        status.style.color = '#4ade80';
      } else {
        status.textContent = '';
        status.style.display = 'none';
      }
    }
  }

  // Periodic UI update for skip silence visualizer (4fps is enough for visual feedback)
  setInterval(() => {
    if (skipSilenceEnabled && ssEngineRunning) {
      updateSkipSilenceUI();
    }
  }, 250);

  function applyAlwaysExpandState(targetContainer) {
    const container = targetContainer || document.getElementById('pwc-speed-control');
    if (container) {
      if (alwaysExpandWidget) {
        container.classList.add('pwc-always-expanded');
        container.classList.add('pwc-expanded');
      } else {
        container.classList.remove('pwc-always-expanded');
        container.classList.remove('pwc-expanded');
      }
    }
  }



  // Helper to step speed up or down by 0.1, clamped to 0.5–4.0
  function stepSpeed(direction) {
    let val = direction > 0
      ? Math.min(4.0, currentSpeed + 0.1)
      : Math.max(0.5, currentSpeed - 0.1);
    return Math.round(val * 10) / 10;
  }

  // Helper to hide or show an element with !important
  function setHidden(el, shouldHide) {
    if (shouldHide) {
      el.style.setProperty('display', 'none', 'important');
    } else {
      el.style.removeProperty('display');
    }
  }

  // Helper to check if a leaf element is a native speed badge (e.g. "1.1x" next to the timer)
  function isNativeSpeedBadge(el) {
    if (el.children.length !== 0) return false;
    const text = (el.textContent || '').trim();
    if (!/^\d+(\.\d+)?x$/i.test(text)) return false;
    const className = el.getAttribute('class') || '';
    const id = el.id || '';
    const isSelf = id.includes('pwc-') || className.includes('pwc-');
    return !isSelf && !isDrawingToolbarElement(el);
  }

  // Toggle mapping keys to documentElement class names
  const classMap = {
    hideAskAI: 'pwc-hide-askai',
    hideDoubt: 'pwc-hide-doubt',
    hideChat: 'pwc-hide-chat',
    hideNotes: 'pwc-hide-notes',
    hideNoteTimeline: 'pwc-hide-notetimeline',
    hideSpeed: 'pwc-hide-speed',
    hideSetting: 'pwc-hide-setting',
    hideTimeLine: 'pwc-hide-timeline',
    hideTimeText: 'pwc-hide-timetext'
  };

  // Hiding toggle states
  let hideSettings = {
    hideAskAI: false,
    hideDoubt: false,
    hideChat: false,
    hideNotes: false,
    hideNoteTimeline: false,
    hideSpeed: false,
    hideSetting: false,
    hideTimeLine: false,
    hideTimeText: false
  };

  // Helper to safely access chrome storage without throwing context invalidated exceptions
  function safeGetSettings(callback) {
    if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.id || !chrome.storage || !chrome.storage.local) {
      return;
    }
    try {
      chrome.storage.local.get(
        ['preferredSpeed', 'hideAskAI', 'hideDoubt', 'hideChat', 'hideNotes', 'hideNoteTimeline', 'hideSpeed', 'hideSetting', 'hideTimeLine', 'hideTimeText', 'enableInstantHide', 'enableHotkeys', 'disableScroll', 'holdSpaceSpeedUp', 'holdSpaceSpeed', 'alwaysExpandWidget', 'keySpeedUp', 'keySlowDown', 'keyReset', 'snapPoints', 'extensionEnabled', 'enablePiP', 'skipSilenceEnabled', 'skipSilenceMode', 'skipSilenceSpeechSpeed', 'skipSilenceSilenceSpeed', 'skipSilenceThreshold', 'skipSilenceDynamicThreshold', 'skipSilenceMute', 'skipSilenceTimeSaved', 'skipSilenceMinDuration'], 
        function (result) {
          try {
            if (chrome.runtime && chrome.runtime.id) {
              callback(result);
            }
          } catch (e) {}
        }
      );
    } catch (err) {}
  }

  // Helper to safely write chrome storage without throwing context invalidated exceptions
  function safeSetSettings(data) {
    if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.id || !chrome.storage || !chrome.storage.local) {
      return;
    }
    try {
      chrome.storage.local.set(data, function () {
        // Read lastError to suppress orphaned context developer warnings in console
        const lastError = chrome.runtime.lastError;
      });
    } catch (err) {}
  }

  // Dynamically redraw tick marks inside player UI using safe DOM APIs
  function updatePlayerTicks(points) {
    document.querySelectorAll('.pwc-slider-ticks').forEach(ticksContainer => {
      ticksContainer.textContent = '';
      points.forEach(pt => {
        const pct = ((pt - 0.5) / 3.5) * 100;
        const tickLabel = document.createElement('span');
        tickLabel.className = 'pwc-tick-label';
        tickLabel.style.left = `${pct}%`;
        tickLabel.textContent = `${pt.toFixed(1).replace(/\.0$/, '')}x`;
        ticksContainer.appendChild(tickLabel);
      });
    });
  }

  // Load initial settings safely
  safeGetSettings(function (result) {
    extensionEnabled = result.extensionEnabled !== false;
    if (result.preferredSpeed) {
      currentSpeed = parseFloat(result.preferredSpeed);
      applySpeedToActiveVideo();
    }
    for (const key in hideSettings) {
      if (result.hasOwnProperty(key)) {
        hideSettings[key] = !!result[key];
      }
    }

    enablePiP = result.enablePiP !== false;
    enableInstantHide = !!result.enableInstantHide;
    enableHotkeys = !!result.enableHotkeys;
    disableScroll = !!result.disableScroll;
    holdSpaceSpeedUp = !!result.holdSpaceSpeedUp;
    holdSpaceSpeed = result.holdSpaceSpeed !== undefined ? parseFloat(result.holdSpaceSpeed) : 2.0;
    alwaysExpandWidget = !!result.alwaysExpandWidget;
    keySpeedUp = result.keySpeedUp || 'h';
    keySlowDown = result.keySlowDown || 'j';
    keyReset = result.keyReset || 'l';

    applyAlwaysExpandState();

    if (activeVideo) {
      activeVideo.autoPictureInPicture = enablePiP;
    }

    if (result.snapPoints && Array.isArray(result.snapPoints) && result.snapPoints.length === 4) {
      snapPoints = result.snapPoints.map(v => parseFloat(v));
    }

    applySettingsHTML(hideSettings);
    applyDistractorsState();

    skipSilenceEnabled = !!result.skipSilenceEnabled;
    skipSilenceMode = result.skipSilenceMode || 'speedup';
    skipSilenceSpeechSpeed = result.skipSilenceSpeechSpeed !== undefined ? parseFloat(result.skipSilenceSpeechSpeed) : 1.0;
    skipSilenceSilenceSpeed = result.skipSilenceSilenceSpeed !== undefined ? parseFloat(result.skipSilenceSilenceSpeed) : 3.0;
    skipSilenceThreshold = result.skipSilenceThreshold !== undefined ? parseInt(result.skipSilenceThreshold) : -40;
    skipSilenceDynamicThreshold = result.skipSilenceDynamicThreshold !== false;
    skipSilenceMute = !!result.skipSilenceMute;
    skipSilenceTimeSaved = result.skipSilenceTimeSaved || 0;
    skipSilenceMinDuration = result.skipSilenceMinDuration !== undefined ? parseFloat(result.skipSilenceMinDuration) : 0.5;

    if (skipSilenceEnabled) {
      ssInit();
    }
  });

  // Listen for storage changes from the settings popup
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id && chrome.storage && chrome.storage.onChanged) {
    try {
      chrome.storage.onChanged.addListener(function (changes, area) {
        try {
          if (!chrome.runtime || !chrome.runtime.id) return;
          if (area === 'local') {
            let changed = false;
            if (changes.hasOwnProperty('extensionEnabled')) {
              extensionEnabled = changes.extensionEnabled.newValue !== false;
              changed = true;
            }
            for (const key in hideSettings) {
              if (changes.hasOwnProperty(key)) {
                hideSettings[key] = !!changes[key].newValue;
                changed = true;
              }
            }

            // Sync hotkey bindings in real-time
            if (changes.hasOwnProperty('enableInstantHide')) {
              enableInstantHide = !!changes.enableInstantHide.newValue;
              changed = true;
            }
            if (changes.hasOwnProperty('enablePiP')) {
              enablePiP = changes.enablePiP.newValue !== false;
              if (activeVideo) {
                activeVideo.autoPictureInPicture = enablePiP;
              }
              changed = true;
            }
            if (changes.hasOwnProperty('enableHotkeys')) {
              enableHotkeys = !!changes.enableHotkeys.newValue;
            }
            if (changes.hasOwnProperty('disableScroll')) {
              disableScroll = !!changes.disableScroll.newValue;
            }
            if (changes.hasOwnProperty('holdSpaceSpeedUp')) {
              holdSpaceSpeedUp = !!changes.holdSpaceSpeedUp.newValue;
            }
            if (changes.hasOwnProperty('holdSpaceSpeed')) {
              holdSpaceSpeed = changes.holdSpaceSpeed.newValue !== undefined ? parseFloat(changes.holdSpaceSpeed.newValue) : 2.0;
            }
            if (changes.hasOwnProperty('keySpeedUp')) {
              keySpeedUp = changes.keySpeedUp.newValue;
            }
            if (changes.hasOwnProperty('keySlowDown')) {
              keySlowDown = changes.keySlowDown.newValue;
            }
            if (changes.hasOwnProperty('alwaysExpandWidget')) {
              alwaysExpandWidget = !!changes.alwaysExpandWidget.newValue;
              applyAlwaysExpandState();
            }
            if (changes.hasOwnProperty('keyReset')) {
              keyReset = changes.keyReset.newValue;
            }
            if (changes.hasOwnProperty('skipSilenceEnabled')) {
              const wasEnabled = skipSilenceEnabled;
              skipSilenceEnabled = !!changes.skipSilenceEnabled.newValue;
              if (skipSilenceEnabled && !wasEnabled) {
                ssInit();
              } else if (!skipSilenceEnabled && wasEnabled) {
                ssDestroy();
              }
            }
            if (changes.hasOwnProperty('skipSilenceSpeechSpeed')) {
              skipSilenceSpeechSpeed = parseFloat(changes.skipSilenceSpeechSpeed.newValue) || 1.0;
              if (ssEngineRunning && ssCurrentState === 'speech') {
                setVideoPlaybackRate(skipSilenceSpeechSpeed);
              }
            }
            if (changes.hasOwnProperty('skipSilenceSilenceSpeed')) {
              skipSilenceSilenceSpeed = parseFloat(changes.skipSilenceSilenceSpeed.newValue) || 3.0;
              if (ssEngineRunning && ssCurrentState === 'silence') {
                setVideoPlaybackRate(skipSilenceSilenceSpeed);
              }
            }
            if (changes.hasOwnProperty('skipSilenceThreshold')) {
              skipSilenceThreshold = parseInt(changes.skipSilenceThreshold.newValue) || -40;
            }
            if (changes.hasOwnProperty('skipSilenceDynamicThreshold')) {
              skipSilenceDynamicThreshold = changes.skipSilenceDynamicThreshold.newValue !== false;
            }
            if (changes.hasOwnProperty('skipSilenceMute')) {
              skipSilenceMute = !!changes.skipSilenceMute.newValue;
              if (ssGainNode && ssAudioContext) {
                if (skipSilenceMute && ssCurrentState === 'silence') {
                  ssGainNode.gain.setTargetAtTime(0, ssAudioContext.currentTime, 0.01);
                } else {
                  ssGainNode.gain.setTargetAtTime(1, ssAudioContext.currentTime, 0.01);
                }
              }
            }
            if (changes.hasOwnProperty('skipSilenceTimeSaved')) {
              skipSilenceTimeSaved = changes.skipSilenceTimeSaved.newValue || 0;
            }
            if (changes.hasOwnProperty('skipSilenceMinDuration')) {
              skipSilenceMinDuration = parseFloat(changes.skipSilenceMinDuration.newValue) || 0.5;
            }



            // Sync custom snap points in real-time
            if (changes.hasOwnProperty('snapPoints')) {
              snapPoints = (changes.snapPoints.newValue || [1.0, 2.0, 3.0, 4.0]).map(v => parseFloat(v));
              updatePlayerTicks(snapPoints);
            }

            // Sync preferredSpeed value changes in real-time
            if (changes.hasOwnProperty('preferredSpeed')) {
              currentSpeed = parseFloat(changes.preferredSpeed.newValue);
              applySpeedToActiveVideo();
            }

            if (changed) {
              applySettingsHTML(hideSettings);
              applyDistractorsState();
              setTimeout(() => {
                window.dispatchEvent(new Event('resize'));
              }, 50);
            }
          }
        } catch (e) {}
      });
    } catch (err) {}
  }

  // Apply layout class tags to documentElement for zero-flicker hiding
  function applySettingsHTML(settings) {
    const root = document.documentElement;

    Object.keys(classMap).forEach(key => {
      const className = classMap[key];
      const isEnabled = extensionEnabled && (settings[key] === true);
      if (isEnabled) {
        root.classList.add(className);
      } else {
        root.classList.remove(className);
      }
    });
  }

  // Helper to find video elements in the document and all shadow roots recursively
  function findVideos(root = document) {
    let videos = [];
    if (!root) return videos;
    try {
      if (root.querySelectorAll) {
        videos = Array.from(root.querySelectorAll('video'));
        const all = root.querySelectorAll('*');
        for (let i = 0; i < all.length; i++) {
          const el = all[i];
          if (el.shadowRoot) {
            videos = videos.concat(findVideos(el.shadowRoot));
          }
          try {
            if (el.contentDocument) {
              videos = videos.concat(findVideos(el.contentDocument));
            }
          } catch (e) {}
        }
      }
    } catch (e) {}
    return videos;
  }

  // Helper to find the active video element (selects the video with largest display area)
  function getActiveVideo() {
    // If a video is currently in Picture-in-Picture, it is definitely the active one!
    if (document.pictureInPictureElement) {
      cachedVideo = document.pictureInPictureElement;
      return document.pictureInPictureElement;
    }

    const videos = findVideos(document);
    if (videos.length === 0) {
      cachedVideo = null;
      return null;
    }

    // Force unlock Picture-in-Picture on all videos found
    videos.forEach(v => {
      if (v.hasAttribute('disablepictureinpicture')) {
        v.removeAttribute('disablepictureinpicture');
      }
      v.disablePictureInPicture = false;
    });

    if (videos.length === 1) {
      cachedVideo = videos[0];
      return videos[0];
    }
    
    let mainVideo = videos[0];
    let maxArea = -1;
    for (const v of videos) {
      const rect = v.getBoundingClientRect ? v.getBoundingClientRect() : { width: v.offsetWidth, height: v.offsetHeight };
      const isVisible = (rect && (rect.width > 0 || rect.height > 0)) || v.offsetWidth > 0 || v.offsetHeight > 0;
      if (!isVisible) continue;

      const area = (rect.width || v.videoWidth || v.clientWidth || 0) * (rect.height || v.videoHeight || v.clientHeight || 0);
      if (area > maxArea) {
        maxArea = area;
        mainVideo = v;
      }
    }
    cachedVideo = mainVideo;
    return mainVideo;
  }

  // Helper to traverse up and find the actual clickable control button container
  function getControlButton(el) {
    if (!el) return null;
    let current = el;
    while (current && current !== document.body) {
      const tagName = current.tagName.toLowerCase();
      const role = current.getAttribute('role');
      const className = current.getAttribute('class') || '';
      
      if (
        tagName === 'button' || 
        role === 'button' || 
        (className.includes('btn') || className.includes('button') || className.includes('control'))
      ) {
        return current;
      }
      current = current.parentNode;
    }
    return el;
  }

  // Checks if an element is part of the custom whiteboard / drawing toolbar
  function isDrawingToolbarElement(el) {
    let current = el;
    while (current && current !== document.body) {
      const className = (current.getAttribute('class') || '').toLowerCase();
      const id = (current.id || '').toLowerCase();
      
      if (className.includes('dashboard') || id.includes('dashboard') || className.includes('page-manager')) {
        return false;
      }
      if (/canvas|draw|paint|board|palette/i.test(className + ' ' + id)) {
        return true;
      }
      current = current.parentNode || current.host;
    }
    return false;
  }

  // Find settings button recursively, piercing Shadow DOMs and ignoring drawing boards
  function findSettingsButton() {
    if (cachedSettingsBtn && cachedSettingsBtn.isConnected) {
      return cachedSettingsBtn;
    }
    const video = getActiveVideo();
    if (!video) return null;

    const exact = document.getElementById('setting-icon');
    if (exact) {
      cachedSettingsBtn = exact;
      return exact;
    }

    const playerContainer = document.getElementById('video-player-container') || video.closest('.video-player-app') || video.parentElement;
    if (!playerContainer) return null;

    let el = playerContainer.querySelector(
      '[class*="setting" i], [id*="setting" i], [title*="setting" i], ' +
      '[class*="gear" i], [class*="config" i], [class*="quality" i]'
    );
    if (el) {
      const btn = getControlButton(el);
      if (btn && !isDrawingToolbarElement(btn)) {
        cachedSettingsBtn = btn;
        return btn;
      }
    }

    const found = scanShadowForSettings(playerContainer);
    if (found) {
      cachedSettingsBtn = found;
    }
    return found;
  }

  function scanShadowForSettings(root) {
    const allElements = root.querySelectorAll('*');
    for (const item of allElements) {
      if (item.shadowRoot) {
        let el = item.shadowRoot.querySelector(
          '[class*="setting" i], [id*="setting" i], [title*="setting" i], ' +
          '[class*="gear" i], [class*="config" i], [class*="quality" i]'
        );
        if (el && !isDrawingToolbarElement(el)) return getControlButton(el);
        const found = scanShadowForSettings(item.shadowRoot);
        if (found) return found;
      }
    }
    return null;
  }

  // Find fullscreen button recursively, piercing Shadow DOMs and ignoring drawing boards
  function findFullscreenButton() {
    if (cachedFullscreenBtn && cachedFullscreenBtn.isConnected) {
      return cachedFullscreenBtn;
    }
    const video = getActiveVideo();
    if (!video) return null;

    const settingsBtn = findSettingsButton();
    if (settingsBtn) {
      const settingsWrapper = settingsBtn.closest('.flex-col') || settingsBtn.parentNode.parentNode;
      if (settingsWrapper && settingsWrapper.nextElementSibling) {
        const fsSvg = settingsWrapper.nextElementSibling.querySelector('svg');
        if (fsSvg) {
          cachedFullscreenBtn = fsSvg;
          return fsSvg;
        }
      }
    }

    const playerContainer = document.getElementById('video-player-container') || video.closest('.video-player-app') || video.parentElement;
    if (!playerContainer) return null;

    let el = playerContainer.querySelector(
      '[class*="fullscreen" i], [id*="fullscreen" i], [title*="fullscreen" i], ' +
      '[class*="full-screen" i], [id*="full-screen" i], [title*="full-screen" i]'
    );
    if (el) {
      const btn = getControlButton(el);
      if (btn && !isDrawingToolbarElement(btn)) {
        cachedFullscreenBtn = btn;
        return btn;
      }
    }

    const found = scanShadowForFullscreen(playerContainer);
    if (found) {
      cachedFullscreenBtn = found;
    }
    return found;
  }

  // Helper to scan shadow DOM recursively for fullscreen buttons
  function scanShadowForFullscreen(root) {
    const allElements = root.querySelectorAll('*');
    for (const item of allElements) {
      if (item.shadowRoot) {
        let el = item.shadowRoot.querySelector(
          '[class*="fullscreen" i], [id*="fullscreen" i], [title*="fullscreen" i], ' +
          '[class*="full-screen" i], [id*="full-screen" i], [title*="full-screen" i]'
        );
        if (el && !isDrawingToolbarElement(el)) return getControlButton(el);
        const found = scanShadowForFullscreen(item.shadowRoot);
        if (found) return found;
      }
    }
    return null;
  }

  // Helper to traverse up from a control button and find the actual main toolbar container
  function getToolbarContainer(el) {
    if (!el) return null;
    let current = el;
    while (current && current !== document.body) {
      const parent = current.parentNode;
      if (parent) {
        if (parent.children.length >= 3) {
          return parent;
        }
      }
      current = parent;
    }
    return el.parentNode;
  }


  // Find native speed pills (like "1.1x") located next to the time display
  function findNativeSpeedBadges() {
    if (cachedNativeSpeedBadges && cachedNativeSpeedBadges.length > 0 && cachedNativeSpeedBadges.every(el => el.isConnected)) {
      return cachedNativeSpeedBadges;
    }
    const video = getActiveVideo();
    if (!video) return [];

    const playerContainer = document.getElementById('video-player-container') || video.closest('.video-player-app') || video.parentElement;
    if (!playerContainer) return [];

    let list = [];
    const elements = playerContainer.querySelectorAll('*');
    for (const el of elements) {
      if (isNativeSpeedBadge(el)) {
        list.push(el);
      }
      if (el.shadowRoot) {
        list = list.concat(scanShadowForNativeSpeed(el.shadowRoot));
      }
    }
    cachedNativeSpeedBadges = list;
    return list;
  }

  // Helper to scan shadow DOM recursively for native speed labels
  function scanShadowForNativeSpeed(root) {
    let list = [];
    const elements = root.querySelectorAll('*');
    for (const el of elements) {
      if (isNativeSpeedBadge(el)) {
        list.push(el);
      }
      if (el.shadowRoot) {
        list = list.concat(scanShadowForNativeSpeed(el.shadowRoot));
      }
    }
    return list;
  }

  // Identify the category of any matched distractor element using structural attributes
  // IMPORTANT: We only match against class, id, title, aria-label, and short text labels.
  // We do NOT match against innerHTML or full textContent because those contain child
  // HTML tags (like <line>, <polyline>) and unrelated nested text that cause false matches.
  function getDistractorType(el) {
    // Use getAttribute instead of dot-property access because SVG elements
    // return weird objects for .className and .title in some browsers (like Brave).
    const className = (el.getAttribute('class') || '').toLowerCase();
    const id = (el.id || '').toLowerCase();
    const title = (el.getAttribute('title') || '').toLowerCase();
    const ariaLabel = (el.getAttribute('aria-label') || '').toLowerCase();
    
    // Safety check: Never match the dashboard or main page manager layouts
    if (className.includes('dashboard') || id.includes('dashboard') || className.includes('page-manager')) {
      return null;
    }

    // Structural attributes are safe to match broadly
    const attrs = `${className} ${id} ${title} ${ariaLabel}`;
    
    // Only use textContent for leaf elements (no children) to avoid matching nested junk
    const isLeaf = el.children.length === 0;
    const leafText = isLeaf ? (el.textContent || '').trim().toLowerCase() : '';

    // 1. Ask AI feature
    if (attrs.includes('ask ai') || attrs.includes('askai') || attrs.includes('ask-ai') || /\bai\b/.test(attrs)) {
      return 'askai';
    }
    if (leafText === 'ask ai') return 'askai';

    // 2. Notes / Study materials — PW Live uses title="Add note" on its notes button
    if (/\bnote(s)?\b/.test(attrs) || attrs.includes('study') || attrs.includes('pdf') || attrs.includes('attachment')) {
      return 'notes';
    }
    if (isLeaf && (leafText === 'notes' || leafText === 'study notes' || leafText === 'add note')) return 'notes';



    // 4. Doubt / Q&A controls
    if (attrs.includes('doubt') || attrs.includes('qna') || attrs.includes('question')) {
      return 'doubt';
    }
    if (isLeaf && (leafText === 'doubt' || leafText === 'q&a')) return 'doubt';

    // 5. Chat / Comments
    if (attrs.includes('chat') || attrs.includes('comment')) {
      return 'chat';
    }
    if (isLeaf && leafText === 'chat') return 'chat';

    // 6. Note Timeline controls (avoid matching video progress timeline seekbar)
    if (!className.includes('progress') && !className.includes('play-progress') && !id.includes('video-progress')) {
      if (className.includes('timeline') || id.includes('timeline') || title.includes('timeline') || ariaLabel.includes('timeline')) {
        return 'notetimeline';
      }
    }

    return null;
  }

  // Helper to check the element and its shallow children for classification.
  // IMPORTANT: We only go 2 levels deep (children + grandchildren). Going deeper
  // with querySelectorAll('*') caused false positives because buried elements like
  // VideoJS's "Caption Settings Dialog" would match 'caption' and misclassify
  // unrelated toolbar buttons as CC controls.
  function checkElementOrChildType(el) {
    const type = getDistractorType(el);
    if (type) return type;
    
    // Check direct children (level 1)
    for (const child of el.children) {
      const t = getDistractorType(child);
      if (t) return t;
      // Check grandchildren (level 2)
      for (const grandchild of child.children) {
        const t2 = getDistractorType(grandchild);
        if (t2) return t2;
      }
    }
    return null;
  }

  // Programmatically construct the speedometer control without innerHTML
  function buildSpeedControl(container) {
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
    badge.textContent = `${currentSpeed.toFixed(1)}x`;
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
    input.min = '0.5';
    input.max = '4.0';
    input.step = '0.1';
    input.value = currentSpeed;
    sliderWrapper.appendChild(input);

    const ticks = document.createElement('div');
    ticks.className = 'pwc-slider-ticks';
    
    // Add ticks dynamically
    snapPoints.forEach(pt => {
      const pct = ((pt - 0.5) / 3.5) * 100;
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

  // Bulletproof PW Control Bar Finder: locates bottom control bar regardless of layout changes
  function findPWToolbar() {
    const fRight = document.getElementById('footer-right-section');
    if (fRight) return fRight;

    const video = getActiveVideo();
    if (!video) return null;

    const root = (video.getRootNode && video.getRootNode()) || document;
    const playerContainer = document.getElementById('video-player-container') ||
      video.closest('.video-player-app') ||
      video.closest('[class*="video-player" i]') ||
      video.closest('[class*="player" i]') ||
      video.parentElement ||
      root;

    if (!playerContainer || !playerContainer.querySelectorAll) return null;

    // Scan all containers holding 3 or more control buttons/icons near the bottom of the player
    const candidates = Array.from(playerContainer.querySelectorAll('div, section, footer, nav'));
    const toolbars = candidates.filter(div => {
      const btns = div.querySelectorAll('button, svg, [role="button"], [class*="icon" i]');
      return btns.length >= 3 && div.offsetWidth > 80;
    });

    if (toolbars.length > 0) {
      toolbars.sort((a, b) => a.querySelectorAll('*').length - b.querySelectorAll('*').length);
      return toolbars[0];
    }

    const settingsBtn = findSettingsButton();
    const fullscreenBtn = findFullscreenButton();
    const refBtn = settingsBtn || fullscreenBtn;
    if (refBtn) {
      return getToolbarContainer(refBtn);
    }

    return null;
  }

  // Inject floating widget directly inside the player's controls container
  function injectSpeedControl() {
    if (!extensionEnabled) {
      const container = document.getElementById('pwc-speed-control');
      if (container) container.remove();
      return;
    }

    const toolbar = findPWToolbar();
    if (toolbar) {
      const existingContainer = document.getElementById('pwc-speed-control');
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



  // Display a visual warning/info toast overlay inside the player using safe DOM APIs
  function showInfoToast(text) {
    const video = getActiveVideo();
    if (!video) return;
    const playerContainer = video.parentElement;
    if (!playerContainer) return;

    let toast = playerContainer.querySelector('#pwc-speed-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'pwc-speed-toast';
      toast.className = 'pwc-speed-toast';
      playerContainer.appendChild(toast);
    }

    toast.textContent = '';

    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', '#eaaa2e');
    svg.setAttribute('stroke-width', '2.2');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');

    const path = document.createElementNS(svgNS, 'path');
    path.setAttribute('d', 'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z');
    svg.appendChild(path);

    const line = document.createElementNS(svgNS, 'line');
    line.setAttribute('x1', '12');
    line.setAttribute('y1', '9');
    line.setAttribute('x2', '12');
    line.setAttribute('y2', '13');
    svg.appendChild(line);

    const circle = document.createElementNS(svgNS, 'circle');
    circle.setAttribute('cx', '12');
    circle.setAttribute('cy', '17');
    circle.setAttribute('r', '0.5');
    circle.setAttribute('fill', 'currentColor');
    svg.appendChild(circle);

    toast.appendChild(svg);

    const span = document.createElement('span');
    span.textContent = text;
    toast.appendChild(span);

    if (toastTimeout) {
      clearTimeout(toastTimeout);
    }

    toast.classList.remove('pwc-toast-visible');
    toast.offsetHeight; 
    toast.classList.add('pwc-toast-visible');

    toastTimeout = setTimeout(() => {
      toast.classList.remove('pwc-toast-visible');
    }, 1800);
  }

  // Helper to find the video timeline progress bar
  function findTimeline() {
    if (cachedTimeline && cachedTimeline.isConnected) {
      return cachedTimeline;
    }
    const video = getActiveVideo();
    if (!video) return null;
    const playerContainer = document.getElementById('video-player-container') || video.closest('.video-player-app') || video.parentElement;
    if (!playerContainer) return null;
    const el = playerContainer.querySelector(
      '.vjs-progress-control, .vjs-progress-holder, ' +
      '[class*="progress-control" i], [class*="progress-bar" i], ' +
      '[class*="seekbar" i], [class*="seek-bar" i]'
    );
    if (el) {
      const className = el.getAttribute('class') || '';
      if (className.includes('pwc-')) return null;
      cachedTimeline = el;
      return el;
    }
    return null;
  }

  // Helper to find video time and duration texts
  function findTimeTexts() {
    if (cachedTimeTexts && cachedTimeTexts.length > 0 && cachedTimeTexts.every(el => el.isConnected)) {
      return cachedTimeTexts;
    }
    const video = getActiveVideo();
    if (!video) return [];
    const playerContainer = document.getElementById('video-player-container') || video.closest('.video-player-app') || video.parentElement;
    if (!playerContainer) return [];
    
    const elements = playerContainer.querySelectorAll(
      '.vjs-current-time, .vjs-duration, .vjs-time-divider, .vjs-remaining-time, .vjs-time-control, ' +
      '[class*="time-display" i], [class*="time-text" i], ' +
      '[class*="current-time" i], [class*="duration" i], [class*="video-time" i], ' +
      '.current-time, .duration, .time-display, .time-text'
    );

    const list = Array.from(elements).filter(el => {
      // 1. Exclude our own extension's speedometer UI elements
      const className = el.getAttribute('class') || '';
      const id = el.id || '';
      if (className.includes('pwc-') || id.includes('pwc-')) {
        return false;
      }

      // 2. Exclude elements that contain interactive buttons or SVGs
      // (Time texts are flat labels; they don't contain button icons or setting controls)
      if (el.querySelector('button') || el.querySelector('svg') || el.querySelector('[role="button"]')) {
        return false;
      }

      // 3. Exclude major layout/wrapper sections (we only want the leaf labels)
      if (el.querySelectorAll('div').length > 5) {
        return false;
      }

      // 4. Ensure it contains actual time numbers (e.g. "0:00", "2:31", "/ 2:06:36")
      // or it is a specific VideoJS time class
      const text = (el.textContent || '').trim();
      const isVjsTime = className.includes('vjs-current-time') || 
                        className.includes('vjs-duration') || 
                        className.includes('vjs-time-divider') || 
                        className.includes('vjs-remaining-time') || 
                        className.includes('vjs-time-control');

      if (isVjsTime) {
        return true;
      }

      // If it's a generic element, it must have text matching digit:digit or divider
      const hasTimePattern = /^\s*[\d\s:\-/|]+\s*$/.test(text) && /\d+:\d+/.test(text);
      const isDivider = text === '/' || text === '|' || text === '-';

      return hasTimePattern || isDivider;
    });

    cachedTimeTexts = list;
    return list;
  }

  // Helper to hide separators (like "/" text nodes or span dividers) next to time elements
  function hideTimeSeparators(timeElement, shouldHide) {
    if (!timeElement) return;
    const parent = timeElement.parentElement;
    if (!parent) return;

    const childNodes = Array.from(parent.childNodes);
    childNodes.forEach(node => {
      if (node.nodeType === 3) { // Text Node
        const text = node.textContent.trim();
        if (text === '/' || text === '|' || text === '-') {
          if (shouldHide) {
            if (node.originalText === undefined) {
              node.originalText = node.textContent;
            }
            node.textContent = '';
          } else {
            if (node.originalText !== undefined) {
              node.textContent = node.originalText;
            }
          }
        }
      } else if (node.nodeType === 1) { // Element Node
        const text = node.textContent.trim();
        const className = node.getAttribute('class') || '';
        const id = node.id || '';
        const isSelf = className.includes('pwc-') || id.includes('pwc-');
        
        if (!isSelf && (text === '/' || text === '|' || text === '-')) {
          setHidden(node, shouldHide);
        }
      }
    });
  }

  // Hide or restore distracting elements depending on settings.
  // We use a unified, robust settings-offset positional mapping to identify toolbar buttons,
  // falling back to attribute classification. This is highly reliable across all browsers.
  function applyDistractorsState() {
    const activeSettings = {};
    for (const key in hideSettings) {
      activeSettings[key] = extensionEnabled && hideSettings[key];
    }

    const video = getActiveVideo();
    if (video) {
      const settingsBtn = findSettingsButton();
      if (settingsBtn) {
        setHidden(settingsBtn, activeSettings.hideSetting);
      }
      const fullscreenBtn = findFullscreenButton();
      const refBtn = settingsBtn || fullscreenBtn;

      if (refBtn) {
        const parent = getToolbarContainer(refBtn);
        if (parent) {
          const siblings = Array.from(parent.children);
          
          // Filter out our own injected speed control, pip button, and non-element nodes
          const nativeButtons = siblings.filter(el => {
            return el.nodeType === 1 && el.id !== 'pwc-speed-control' && el.id !== 'pwc-pip-btn';
          });

          // Find settings button index in the native buttons list
          const settingsIdx = nativeButtons.findIndex(el => {
            return el === settingsBtn || el.id === 'setting-icon' || el.querySelector('#setting-icon');
          });

          if (settingsIdx !== -1) {
            nativeButtons.forEach((btn, index) => {
              const offset = settingsIdx - index;
              
              if (offset === 1) {
                // Notes (1 button left of Settings)
                setHidden(btn, activeSettings.hideNotes);
              } else if (offset === 2) {
                // Note Timeline (2 buttons left of Settings)
                setHidden(btn, activeSettings.hideNoteTimeline);
              } else if (offset === 3) {
                // Doubt Q&A (3 buttons left of Settings)
                setHidden(btn, activeSettings.hideDoubt);
              } else if (offset === 4) {
                // Live Chat (4 buttons left of Settings)
                setHidden(btn, activeSettings.hideChat);
              } else {
                // Fallback for other buttons (like Ask AI if inside toolbar)
                const type = checkElementOrChildType(btn);
                if (type === 'askai') {
                  setHidden(btn, activeSettings.hideAskAI);
                } else if (type === 'chat') {
                  setHidden(btn, activeSettings.hideChat);
                } else if (type === 'doubt') {
                  setHidden(btn, activeSettings.hideDoubt);
                } else if (type === 'notes') {
                  setHidden(btn, activeSettings.hideNotes);
                } else if (type === 'notetimeline') {
                  setHidden(btn, activeSettings.hideNoteTimeline);
                }
              }
            });
          } else {
            // Fallback if settings button is not found
            nativeButtons.forEach(btn => {
              const type = checkElementOrChildType(btn);
              if (type === 'chat') {
                setHidden(btn, activeSettings.hideChat);
              } else if (type === 'doubt') {
                setHidden(btn, activeSettings.hideDoubt);
              } else if (type === 'notes') {
                setHidden(btn, activeSettings.hideNotes);
              } else if (type === 'notetimeline') {
                setHidden(btn, activeSettings.hideNoteTimeline);
              } else if (type === 'askai') {
                setHidden(btn, activeSettings.hideAskAI);
              }
            });
          }
        }
      }
    }

    // Handle native Speed Badges next to the timer (dynamic — CSS can't target)
    const container = document.getElementById('pwc-speed-control');
    const nativeBadges = findNativeSpeedBadges();

    if (!extensionEnabled) {
      if (container) {
        setHidden(container, true);
      }
      for (const el of nativeBadges) {
        setHidden(el, false);
      }
    } else {
      if (activeSettings.hideSpeed) {
        if (container) {
          setHidden(container, true);
        }
        for (const el of nativeBadges) {
          setHidden(el, true);
        }
      } else {
        if (container) {
          setHidden(container, false);
        }
        for (const el of nativeBadges) {
          setHidden(el, false);
        }
      }
    }

    // Handle timeline hiding
    const timeline = findTimeline();
    if (timeline) {
      setHidden(timeline, activeSettings.hideTimeLine);
    }

    // Handle time display texts hiding
    const timeTexts = findTimeTexts();
    timeTexts.forEach(el => {
      setHidden(el, activeSettings.hideTimeText);
      hideTimeSeparators(el, activeSettings.hideTimeText);
    });
  }

  // Set the playback speed on the video element
  function applySpeedToActiveVideo() {
    const video = getActiveVideo();
    if (!video) return;

    if (video !== activeVideo) {
      setupVideoListeners(video);
    }

    const targetSpeed = extensionEnabled ? currentSpeed : 1.0;

    if (video.playbackRate !== targetSpeed) {
      isSettingRate = true;
      video.playbackRate = targetSpeed;
      setTimeout(() => {
        isSettingRate = false;
      }, 50);
    }
    updateUI();
  }

  // Listen to video events to sync our UI badge
  function setupVideoListeners(video) {
    if (activeVideo) {
      try {
        activeVideo.removeEventListener('ratechange', onRateChange);
        activeVideo.removeEventListener('play', onVideoPlay);
        activeVideo.removeEventListener('enterpictureinpicture', onEnterPiP);
        activeVideo.removeEventListener('leavepictureinpicture', onLeavePiP);
      } catch (e) {}
    }

    activeVideo = video;

    // Reset cached player controls when switching active videos
    cachedSettingsBtn = null;
    cachedFullscreenBtn = null;
    cachedTimeline = null;
    cachedTimeTexts = null;
    cachedNativeSpeedBadges = null;

    // Reset skip silence session counter and reconnect engine for new video
    skipSilenceSessionSaved = 0;
    if (skipSilenceEnabled && ssConnectedVideo !== video) {
      ssDestroy();
      setTimeout(() => {
        if (skipSilenceEnabled) ssInit();
      }, 500);
    }

    activeVideo.addEventListener('ratechange', onRateChange);
    activeVideo.addEventListener('play', onVideoPlay);
    activeVideo.addEventListener('enterpictureinpicture', onEnterPiP);
    activeVideo.addEventListener('leavepictureinpicture', onLeavePiP);

    // Apply auto Picture-in-Picture natively
    if (enablePiP) {
      video.autoPictureInPicture = true;
    } else {
      video.autoPictureInPicture = false;
    }
  }

  // Update speed UI when speed changes (syncs with native controls)
  function onRateChange() {
    if (isSettingRate || !activeVideo) return;
    currentSpeed = activeVideo.playbackRate;
    updateUI();
  }

  // Delay applying speed on play to allow player init scripts to settle
  function onVideoPlay() {
    setTimeout(() => {
      applySpeedToActiveVideo();
      if (skipSilenceEnabled && !ssEngineRunning) {
        ssInit();
      }
    }, 200);
  }

  let pwcTextTrack = null;
  let captionIntervalId = null;

  function syncCaptionsToPiP() {
    if (!document.pictureInPictureElement || !activeVideo) return;

    const root = (activeVideo.getRootNode && activeVideo.getRootNode()) || document;
    const captionEl = root.querySelector ? (
      root.querySelector('.vjs-text-track-display') ||
      root.querySelector('.caption-window') ||
      root.querySelector('.player-timedtext') ||
      root.querySelector('.shaka-text-container') ||
      root.querySelector('[class*="caption"]') ||
      root.querySelector('[class*="subtitle"]')
    ) : null;

    if (!captionEl) return;

    const text = (captionEl.textContent || "").trim();
    if (!pwcTextTrack && typeof activeVideo.addTextTrack === 'function') {
      try {
        pwcTextTrack = activeVideo.addTextTrack('captions', 'PWC_captions', 'en');
        pwcTextTrack.mode = 'showing';
      } catch (e) {}
    }

    if (pwcTextTrack && typeof VTTCue !== 'undefined') {
      try {
        if (pwcTextTrack.cues) {
          Array.from(pwcTextTrack.cues).forEach(cue => pwcTextTrack.removeCue(cue));
        }
        if (text) {
          const cue = new VTTCue(activeVideo.currentTime, activeVideo.currentTime + 10, text);
          pwcTextTrack.addCue(cue);
        }
      } catch (e) {}
    }
  }

  function onEnterPiP() {
    updatePiPButtonUI(true);
    if (!captionIntervalId) {
      captionIntervalId = setInterval(syncCaptionsToPiP, 500);
    }
  }

  function onLeavePiP() {
    updatePiPButtonUI(false);
    if (captionIntervalId) {
      clearInterval(captionIntervalId);
      captionIntervalId = null;
    }
  }

  // Save the speed setting and apply it to the video
  function saveSpeed(speed) {
    currentSpeed = speed;
    applySpeedToActiveVideo();
    safeSetSettings({ preferredSpeed: speed });
  }

  // Update the progress track background of the range input dynamically
  function updateSliderBackground(slider, val) {
    if (!slider) return;
    slider.style.setProperty('background', '#ffffff', 'important');
  }

  // Bind mouse drag and scroll wheel events to a speed control container
  function setupUIEventListeners(container) {
    const slider = container.querySelector('.pwc-speed-slider');

    updateSliderBackground(slider, currentSpeed);

    let mouseLeaveTimer = null;
    container.addEventListener('mouseenter', () => {
      if (mouseLeaveTimer) {
        clearTimeout(mouseLeaveTimer);
        mouseLeaveTimer = null;
      }
      container.classList.add('pwc-expanded');
    });

    container.addEventListener('mouseleave', () => {
      if (alwaysExpandWidget) return;
      mouseLeaveTimer = setTimeout(() => {
        container.classList.remove('pwc-expanded');
      }, 250);
    });

    slider.addEventListener('input', (e) => {
      let val = parseFloat(e.target.value);
      
      // Magnetic attraction snapping effect (snaps within 0.22 threshold to snap point dots)
      const threshold = 0.22;
      for (const snap of snapPoints) {
        if (Math.abs(val - snap) <= threshold) {
          val = snap;
          e.target.value = val;
          break;
        }
      }

      updateSliderBackground(slider, val);
      saveSpeed(val);
    });

    container.addEventListener('wheel', (e) => {
      if (!extensionEnabled || disableScroll) return;
      e.preventDefault();
      const val = stepSpeed(e.deltaY < 0 ? 1 : -1);
      slider.value = val;
      updateSliderBackground(slider, val);
      saveSpeed(val);
    }, { passive: false });
  }

  // Update speed badges, slider values, tick highlights, and needle angles in the UI
  function updateUI() {
    document.querySelectorAll('.pwc-speed-badge').forEach(badge => {
      badge.textContent = `${currentSpeed.toFixed(1)}x`;
    });

    document.querySelectorAll('.pwc-speed-slider').forEach(slider => {
      slider.value = currentSpeed;
      updateSliderBackground(slider, currentSpeed);
    });

    document.querySelectorAll('.pwc-tick-label').forEach(label => {
      const valText = label.textContent.replace('x', '');
      const val = parseFloat(valText);
      if (!isNaN(val) && Math.abs(currentSpeed - val) < 0.15) {
        label.classList.add('pwc-active-tick');
      } else {
        label.classList.remove('pwc-active-tick');
      }
    });

    // Update needle rotation based on current speed
    const pct = (currentSpeed - 0.5) / (4.0 - 0.5);
    const angle = -110 + pct * 220; // range from -110deg to 110deg
    document.querySelectorAll('.pwc-needle').forEach(needle => {
      needle.style.transform = `rotate(${angle}deg)`;
    });
  }

  // Helper function to match keys case-insensitively, supporting spacebar and shifts
  function matchKey(event, targetKey) {
    if (!targetKey) return false;
    
    if (targetKey === '>') {
      return event.key === '>' || (event.shiftKey && event.key === '.');
    }
    if (targetKey === '<') {
      return event.key === '<' || (event.shiftKey && event.key === ',');
    }
    if (targetKey === 'Space') {
      return event.key === ' ' || event.key === 'Space';
    }
    
    return event.key.toLowerCase() === targetKey.toLowerCase();
  }

  // Helper to toggle play/pause natively through player controls
  function togglePlayPause() {
    const video = getActiveVideo();
    if (!video) return;
    const playerContainer = document.getElementById('video-player-container') || video.closest('.video-player-app') || video.parentElement;
    if (playerContainer) {
      const playBtn = playerContainer.querySelector('.vjs-play-control, [class*="play-control" i], [class*="play-btn" i], .play-btn, .vjs-play-btn');
      if (playBtn) {
        playBtn.click();
        return;
      }
    }
    // Fallback 1: Toggle via HTML5 video API
    try {
      if (video.paused) {
        video.play();
      } else {
        video.pause();
      }
    } catch (e) {
      // Fallback 2: click the video element
      video.click();
    }
  }

  // Set temporary speed without saving it permanently to storage
  function applyTemporarySpeed(speed) {
    currentSpeed = speed;
    const video = getActiveVideo();
    if (video) {
      if (video.playbackRate !== speed) {
        isSettingRate = true;
        video.playbackRate = speed;
        setTimeout(() => {
          isSettingRate = false;
        }, 50);
      }
    }
    updateUI();
  }

  // Helper to check if user is typing in a text entry field
  function isUserTyping() {
    const active = document.activeElement;
    if (!active) return false;
    const tagName = active.tagName.toLowerCase();
    if (tagName === 'textarea' || active.isContentEditable || active.getAttribute('role') === 'textbox') {
      return true;
    }
    if (tagName === 'input') {
      const type = (active.type || 'text').toLowerCase();
      const textTypes = ['text', 'search', 'email', 'number', 'password', 'tel', 'url'];
      return textTypes.includes(type);
    }
    return false;
  }

  // Dedicated capture-phase Spacebar interceptors to prevent double-toggling
  document.addEventListener('keydown', (e) => {
    if (!extensionEnabled) return;
    if (e.key !== ' ' && e.code !== 'Space') return;
    
    // Safety check: Ignore if typing in text fields
    if (isUserTyping()) return;

    if (holdSpaceSpeedUp) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      
      if (isHoldingSpace) return;
      if (!spacePressTimer) {
        speedBeforeHold = currentSpeed;
        spacePressTimer = setTimeout(() => {
          isHoldingSpace = true;
          applyTemporarySpeed(holdSpaceSpeed);
        }, 300);
      }
    }
  }, true); // useCapture = true

  document.addEventListener('keyup', (e) => {
    if (!extensionEnabled) return;
    if (e.key !== ' ' && e.code !== 'Space') return;

    if (holdSpaceSpeedUp) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      if (spacePressTimer) {
        clearTimeout(spacePressTimer);
        spacePressTimer = null;
      }

      if (isHoldingSpace) {
        applyTemporarySpeed(speedBeforeHold);
        isHoldingSpace = false;
      } else {
        // Only toggle play/pause if user is not typing in a text field
        if (!isUserTyping()) {
          togglePlayPause();
        }
      }
    }
  }, true); // useCapture = true
  // Safety net: Reset hold-space state when tab loses focus
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && isHoldingSpace) {
      if (spacePressTimer) {
        clearTimeout(spacePressTimer);
        spacePressTimer = null;
      }
      applyTemporarySpeed(speedBeforeHold);
      isHoldingSpace = false;
    }
  });

  // Track screen hold state to suppress custom top pill during PW native screen hold
  const startHold = (e) => {
    const video = getActiveVideo();
    if (!video) return;
    const playerContainer = document.getElementById('video-player-container') || video.closest('.video-player-app') || video.parentElement;
    if (playerContainer && playerContainer.contains(e.target)) {
      isPointerHoldingOnPlayer = true;
    }
  };

  const endHold = () => {
    isPointerHoldingOnPlayer = false;
  };

  document.addEventListener('pointerdown', startHold, true);
  document.addEventListener('mousedown', startHold, true);
  document.addEventListener('touchstart', startHold, true);

  document.addEventListener('pointerup', endHold, true);
  document.addEventListener('mouseup', endHold, true);
  document.addEventListener('touchend', endHold, true);
  document.addEventListener('pointercancel', endHold, true);



  // Listen to keyboard shortcuts (bubble phase)
  document.addEventListener('keydown', (e) => {
    if (!extensionEnabled || !enableHotkeys) return;

    // Safety check: Ignore if typing in text fields
    if (isUserTyping()) return;

    if (matchKey(e, keySpeedUp)) {
      e.preventDefault();
      saveSpeed(stepSpeed(1));
    } else if (matchKey(e, keySlowDown)) {
      e.preventDefault();
      saveSpeed(stepSpeed(-1));
    } else if (matchKey(e, keyReset)) {
      e.preventDefault();
      saveSpeed(1.0);
    }
  });

  // Inject and manage the arrow hide button inside the controls bar
  function injectInstantHideButton() {
    const video = getActiveVideo();
    if (!video) return;

    const exactBtn = document.getElementById('pwc-instant-hide-btn');

    // If disabled, remove the button if it exists
    if (!extensionEnabled || !enableInstantHide) {
      if (exactBtn) {
        exactBtn.remove();
      }
      // Ensure we exit collapsed state if the feature is disabled
      if (document.documentElement.classList.contains('pwc-collapsed-state')) {
        document.documentElement.classList.remove('pwc-collapsed-state');
      }
      return;
    }

    // Determine the control bar container to inject into
    const footerRight = document.getElementById('footer-right-section');
    const controlBar = footerRight ? footerRight.parentElement : null;
    
    // Fallback: search for settings/fullscreen buttons and trace their parent container
    let fallbackControlBar = null;
    if (!controlBar) {
      const settingsBtn = findSettingsButton();
      const fullscreenBtn = findFullscreenButton();
      const refBtn = settingsBtn || fullscreenBtn;
      if (refBtn) {
        fallbackControlBar = getToolbarContainer(refBtn);
      }
    }

    // Prioritize the full-width control bar container so absolute centering works relative to the entire player width!
    const parent = controlBar || fallbackControlBar || footerRight;
    if (!parent) return;

    // Create and inject the button if it doesn't exist
    if (!exactBtn) {
      const btn = document.createElement('button');
      btn.id = 'pwc-instant-hide-btn';
      btn.className = 'pwc-instant-hide-btn';
      btn.type = 'button';
      btn.setAttribute('title', 'Instant Focus Mode (Hide controls & cursor)');

      // Custom SVG Chevron down
      const svgNS = 'http://www.w3.org/2000/svg';
      const svg = document.createElementNS(svgNS, 'svg');
      svg.setAttribute('viewBox', '0 0 24 24');
      svg.setAttribute('fill', 'none');
      svg.setAttribute('stroke', 'currentColor');
      svg.setAttribute('stroke-width', '2.3');
      svg.setAttribute('stroke-linecap', 'round');
      svg.setAttribute('stroke-linejoin', 'round');

      const polyline = document.createElementNS(svgNS, 'polyline');
      polyline.setAttribute('points', '6 9 12 15 18 9');
      svg.appendChild(polyline);
      btn.appendChild(svg);

      // Insert at the beginning of footerRight (or control bar) so it aligns naturally
      if (parent.firstChild) {
        parent.insertBefore(btn, parent.firstChild);
      } else {
        parent.appendChild(btn);
      }

      // Add event listeners
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();

        // Collapse the entire page's player controls and cursor
        document.documentElement.classList.add('pwc-collapsed-state');
        lastCollapsedTime = Date.now();

        // Bind root event listeners to reveal controls on mouse move or screen touch
        if (!document.documentElement.pwcHasMouseMoveListener) {
          document.documentElement.pwcHasMouseMoveListener = true;

          const revealControls = () => {
            // Ignore movements within 400ms of clicking to avoid micro-movements cancelling focus mode
            if (Date.now() - lastCollapsedTime < 400) {
              return;
            }
            if (document.documentElement.classList.contains('pwc-collapsed-state')) {
              document.documentElement.classList.remove('pwc-collapsed-state');
            }
          };

          document.addEventListener('mousemove', revealControls);
          document.addEventListener('touchstart', revealControls);
        }
      });
    } else {
      // Ensure it is in the correct parent
      if (exactBtn.parentElement !== parent) {
        if (parent.firstChild) {
          parent.insertBefore(exactBtn, parent.firstChild);
        } else {
          parent.appendChild(exactBtn);
        }
      }
    }
  }

  function stylePiPButton(btn) {
    btn.style.setProperty('position', 'relative', 'important');
    btn.style.setProperty('z-index', '999999', 'important');
    btn.style.setProperty('pointer-events', 'auto', 'important');
    btn.style.setProperty('height', '100%', 'important');
    btn.style.setProperty('width', '36px', 'important');
    btn.style.setProperty('display', 'inline-flex', 'important');
    btn.style.setProperty('align-items', 'center', 'important');
    btn.style.setProperty('justify-content', 'center', 'important');
    btn.style.setProperty('background', 'transparent', 'important');
    btn.style.setProperty('border', 'none', 'important');
    btn.style.setProperty('color', '#ffffff', 'important');
    btn.style.setProperty('cursor', 'pointer', 'important');
    btn.style.setProperty('padding', '0', 'important');
    btn.style.setProperty('margin', '0 6px', 'important');
    btn.style.setProperty('transition', 'color 0.2s ease, transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.25s ease', 'important');

    if (!btn.pwcHasHoverListeners) {
      btn.pwcHasHoverListeners = true;
      btn.addEventListener('mouseenter', () => {
        btn.style.setProperty('color', '#ffffff', 'important');
        btn.style.setProperty('transform', 'scale(1.12)', 'important');
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.setProperty('color', '#ffffff', 'important');
        btn.style.setProperty('transform', 'scale(1)', 'important');
      });
    }
  }

  // Robust PiP toggler with immediate synchronous execution to preserve User Gesture activation
  function togglePiP(video) {
    if (!video) return;

    // Force-enable Picture-in-Picture on video
    video.disablePictureInPicture = false;
    if (video.hasAttribute('disablepictureinpicture')) {
      video.removeAttribute('disablepictureinpicture');
    }

    if (document.pictureInPictureElement) {
      if (document.exitPictureInPicture) {
        document.exitPictureInPicture().catch(() => {});
      }
    } else {
      let promise = null;
      if (typeof video.requestPictureInPicture === 'function') {
        try { promise = video.requestPictureInPicture(); } catch (e) {}
      }
      if (!promise && HTMLVideoElement.prototype.requestPictureInPicture) {
        try { promise = HTMLVideoElement.prototype.requestPictureInPicture.call(video); } catch (e) {}
      }

      if (promise && typeof promise.catch === 'function') {
        promise.catch(err => {
          console.warn("PW Control: Primary PiP request failed, trying prototype call fallback:", err);
          if (HTMLVideoElement.prototype.requestPictureInPicture) {
            HTMLVideoElement.prototype.requestPictureInPicture.call(video).catch(() => {
              showInfoToast("Failed to enter Picture-in-Picture.");
            });
          }
        });
      }
    }
  }

  function setupPiPButtonListeners(btn) {
    if (btn.pwcHasClickEventListener) return;
    btn.pwcHasClickEventListener = true;

    btn.addEventListener('click', () => {
      const video = getActiveVideo();
      if (video) {
        togglePiP(video);
      }
    });
  }

  // Find native or player-provided PiP buttons on the page so we can attach working handlers to them
  function findNativePiPButtons() {
    const video = getActiveVideo();
    if (!video) return [];

    const root = (video.getRootNode && video.getRootNode()) || document;
    const buttons = Array.from(root.querySelectorAll ? root.querySelectorAll(
      '[class*="pip" i], [id*="pip" i], [title*="picture" i], [aria-label*="picture" i]'
    ) || [] : []);

    const fsBtn = findFullscreenButton();
    if (fsBtn) {
      const fsWrapper = fsBtn.closest('.flex-col') || fsBtn.closest('button') || fsBtn.parentElement;
      if (fsWrapper && fsWrapper.nextElementSibling) {
        const nextBtn = getControlButton(fsWrapper.nextElementSibling) || fsWrapper.nextElementSibling;
        if (nextBtn && !buttons.includes(nextBtn) && nextBtn.id !== 'pwc-pip-btn') {
          buttons.push(nextBtn);
        }
      }
    }
    return buttons;
  }

  // Remove all injected instances of PiP buttons across light and shadow DOMs
  function removeAllPiPButtons() {
    const mainBtn = document.getElementById('pwc-pip-btn');
    if (mainBtn) mainBtn.remove();

    const all = document.querySelectorAll('*');
    all.forEach(el => {
      if (el.shadowRoot) {
        const shadowBtn = el.shadowRoot.getElementById('pwc-pip-btn') || el.shadowRoot.querySelector('#pwc-pip-btn');
        if (shadowBtn) shadowBtn.remove();
      }
    });
  }

  // Inject and manage the Picture-in-Picture button inside the controls bar
  function injectPiPButton() {
    const video = getActiveVideo();
    if (!video) return;

    // Attach working listener to any native PiP button in PW player toolbar
    const nativeBtns = findNativePiPButtons();
    nativeBtns.forEach(nBtn => {
      if (nBtn && nBtn.id !== 'pwc-pip-btn' && !nBtn.pwcHasNativePiPListener) {
        nBtn.pwcHasNativePiPListener = true;
        nBtn.addEventListener('click', () => {
          const v = getActiveVideo();
          if (v) {
            togglePiP(v);
          }
        });
      }
    });

    if (!extensionEnabled || !enablePiP) {
      removeAllPiPButtons();
      return;
    }

    // Determine the control bar container to inject into
    const footerRight = document.getElementById('footer-right-section');
    const controlBar = footerRight ? footerRight.parentElement : null;
    
    // Fallback: search for settings/fullscreen buttons and trace their parent container
    let fallbackControlBar = null;
    if (!controlBar) {
      const settingsBtn = findSettingsButton();
      const fullscreenBtn = findFullscreenButton();
      const refBtn = settingsBtn || fullscreenBtn;
      if (refBtn) {
        fallbackControlBar = getToolbarContainer(refBtn);
      }
    }

    const parent = controlBar || fallbackControlBar || footerRight || (video.parentElement || video.parentNode);
    if (!parent) return;

    // Target the light DOM container or shadow container
    const targetContainer = footerRight || parent;

    // Search targetContainer/parent for our button to support shadow roots!
    const exactBtn = targetContainer.querySelector('#pwc-pip-btn');

    // Create and inject the button if it doesn't exist
    if (!exactBtn) {
      const btn = document.createElement('button');
      btn.id = 'pwc-pip-btn';
      btn.className = 'pwc-pip-btn';
      btn.type = 'button';
      stylePiPButton(btn);

      // Insert right before fullscreen button if found inside the same parent, otherwise append
      const fullscreenBtn = findFullscreenButton();
      if (fullscreenBtn && fullscreenBtn.parentElement === targetContainer) {
        targetContainer.insertBefore(btn, fullscreenBtn);
      } else {
        targetContainer.appendChild(btn);
      }

      setupPiPButtonListeners(btn);
      // Initial UI draw
      updatePiPButtonUI(document.pictureInPictureElement === video, btn);
    } else {
      stylePiPButton(exactBtn);
      // Ensure it is in the correct position if the toolbar rebuilt
      if (exactBtn.parentElement !== targetContainer) {
        const fullscreenBtn = findFullscreenButton();
        if (fullscreenBtn && fullscreenBtn.parentElement === targetContainer) {
          targetContainer.insertBefore(exactBtn, fullscreenBtn);
        } else {
          targetContainer.appendChild(exactBtn);
        }
      }
      setupPiPButtonListeners(exactBtn);
      // Update UI state based on current PiP state
      updatePiPButtonUI(document.pictureInPictureElement === video, exactBtn);
    }
  }

  function updatePiPButtonUI(isInPiP, btnElement = null) {
    let btn = btnElement;
    if (!btn) {
      const footerRight = document.getElementById('footer-right-section');
      const controlBar = footerRight ? footerRight.parentElement : null;
      let fallbackControlBar = null;
      if (!controlBar) {
        const settingsBtn = findSettingsButton();
        const fullscreenBtn = findFullscreenButton();
        const refBtn = settingsBtn || fullscreenBtn;
        if (refBtn) {
          fallbackControlBar = getToolbarContainer(refBtn);
        }
      }
      const parent = controlBar || fallbackControlBar || footerRight;
      if (parent) {
        btn = parent.querySelector('#pwc-pip-btn');
      }
    }
    if (!btn) return;

    btn.textContent = '';
    btn.setAttribute('title', isInPiP ? 'Exit Picture-in-Picture' : 'Picture-in-Picture');

    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2.3');
    svg.setAttribute('stroke-linecap', 'square');
    svg.setAttribute('stroke-linejoin', 'miter');

    // Inline style for SVG to make sure it renders even inside Shadow DOM and passes clicks to the parent button
    svg.style.setProperty('width', '28px', 'important');
    svg.style.setProperty('height', '28px', 'important');
    svg.style.setProperty('stroke', 'currentColor', 'important');
    svg.style.setProperty('stroke-width', '2.4', 'important');
    svg.style.setProperty('fill', 'none', 'important');
    svg.style.setProperty('transition', 'transform 0.2s ease', 'important');
    svg.style.setProperty('pointer-events', 'none', 'important');

    if (isInPiP) {
      // Exit PiP Icon: Sharp outer screen frame + exit diagonal arrow
      const rect = document.createElementNS(svgNS, 'rect');
      rect.setAttribute('x', '2');
      rect.setAttribute('y', '4');
      rect.setAttribute('width', '20');
      rect.setAttribute('height', '14');
      rect.setAttribute('rx', '0');
      rect.setAttribute('ry', '0');
      rect.setAttribute('fill', 'none');
      rect.style.setProperty('fill', 'none', 'important');
      rect.style.setProperty('pointer-events', 'none', 'important');
      svg.appendChild(rect);

      const path = document.createElementNS(svgNS, 'path');
      path.setAttribute('d', 'M10 10l-4-4m0 0h3m-3 0v3');
      path.style.setProperty('pointer-events', 'none', 'important');
      svg.appendChild(path);
    } else {
      // Enter PiP Icon: Sharp rectangular line geometry
      const rect1 = document.createElementNS(svgNS, 'rect');
      rect1.setAttribute('x', '2');
      rect1.setAttribute('y', '4');
      rect1.setAttribute('width', '20');
      rect1.setAttribute('height', '14');
      rect1.setAttribute('rx', '0');
      rect1.setAttribute('ry', '0');
      rect1.setAttribute('fill', 'none');
      rect1.style.setProperty('fill', 'none', 'important');
      rect1.style.setProperty('pointer-events', 'none', 'important');
      svg.appendChild(rect1);

      // Inner Floating PiP Window (sharp 90-degree rectangular outline)
      const rect2 = document.createElementNS(svgNS, 'rect');
      rect2.setAttribute('x', '11');
      rect2.setAttribute('y', '10');
      rect2.setAttribute('width', '8');
      rect2.setAttribute('height', '6');
      rect2.setAttribute('rx', '0');
      rect2.setAttribute('ry', '0');
      rect2.setAttribute('fill', 'none');
      rect2.setAttribute('stroke', 'currentColor');
      rect2.style.setProperty('fill', 'none', 'important');
      rect2.style.setProperty('stroke', 'currentColor', 'important');
      rect2.style.setProperty('stroke-width', '2.2', 'important');
      rect2.style.setProperty('pointer-events', 'none', 'important');
      svg.appendChild(rect2);
    }
    btn.appendChild(svg);
  }

  // Throttled execution of DOM monitoring to optimize performance
  let monitorTimeout = null;
  let monitorIntervalId = null;

  function throttledMonitor() {
    if (monitorTimeout) return;
    monitorTimeout = setTimeout(() => {
      monitorTimeout = null;
      monitor();
      manageMonitorInterval();
    }, 150);
  }

  // Start or stop the safety-net interval based on whether a video exists
  function manageMonitorInterval() {
    const hasVideo = !!(cachedVideo && cachedVideo.isConnected);
    if (hasVideo && !monitorIntervalId) {
      // Video found — start the safety-net interval
      monitorIntervalId = setInterval(throttledMonitor, 1000);
    } else if (!hasVideo && monitorIntervalId) {
      // No video — stop the interval to save CPU
      clearInterval(monitorIntervalId);
      monitorIntervalId = null;
    }
  }



  // Main monitoring function
  function monitor() {
    if (isModifyingDOM) return;
    const video = getActiveVideo();
    if (video) {
      if (video !== activeVideo) {
        setupVideoListeners(video);
      }
      isModifyingDOM = true;
      try {
        injectSpeedControl();
        injectSkipSilenceButton();
        injectInstantHideButton();
        injectPiPButton();
      } finally {
        isModifyingDOM = false;
      }
      if (skipSilenceEnabled && !ssEngineRunning && !video.paused) {
        ssInit();
      }
    }
  }

  // Setup DOM Observer for dynamic injections and visibility synchronization
  const observer = new MutationObserver((mutations) => {
    if (isModifyingDOM) return;
    throttledMonitor();
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });

  // Initial execution
  monitor();
  manageMonitorInterval();


})();
