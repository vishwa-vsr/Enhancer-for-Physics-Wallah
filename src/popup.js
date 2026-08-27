document.addEventListener('DOMContentLoaded', () => {
  // Helper to safely access chrome.storage
  function safeStorageGet(keys, callback) {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      try {
        chrome.storage.local.get(keys, (result) => {
          if (chrome.runtime && chrome.runtime.lastError) {
            callback({});
          } else {
            callback(result || {});
          }
        });
      } catch (err) {
        callback({});
      }
    } else {
      callback({});
    }
  }

  function safeStorageSet(data) {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set(data);
    }
  }

  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const sunIcon = themeToggleBtn ? themeToggleBtn.querySelector('.sun-icon') : null;
  const moonIcon = themeToggleBtn ? themeToggleBtn.querySelector('.moon-icon') : null;

  function applyTheme(isLight) {
    if (isLight) {
      document.body.classList.add('light-theme');
      if (sunIcon) sunIcon.style.display = 'none';
      if (moonIcon) moonIcon.style.display = 'block';
    } else {
      document.body.classList.remove('light-theme');
      if (sunIcon) sunIcon.style.display = 'block';
      if (moonIcon) moonIcon.style.display = 'none';
    }
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const isLight = document.body.classList.contains('light-theme');
      const nextLight = !isLight;
      applyTheme(nextLight);
      safeStorageSet({ themeMode: nextLight ? 'light' : 'dark' });
    });
  }

  const toggles = {
    hideAskAI: document.getElementById('hide-askai-toggle'),
    hideDoubt: document.getElementById('hide-doubt-toggle'),
    hideChat: document.getElementById('hide-chat-toggle'),
    hideNotes: document.getElementById('hide-notes-toggle'),
    hideNoteTimeline: document.getElementById('hide-notetimeline-toggle'),
    hideSpeed: document.getElementById('hide-speed-toggle'),
    hideSetting: document.getElementById('hide-setting-toggle'),
    hideTimeLine: document.getElementById('hide-timeline-toggle'),
    hideTimeText: document.getElementById('hide-timetext-toggle'),
    enableInstantHide: document.getElementById('enable-instant-hide-toggle'),
    enablePiP: document.getElementById('enable-pip-toggle')
  };

  const customToggles = {
    enableHotkeys: document.getElementById('enable-hotkeys-toggle'),
    disableScroll: document.getElementById('disable-scroll-toggle'),
    holdSpaceSpeedUp: document.getElementById('hold-space-toggle'),
    alwaysExpandWidget: document.getElementById('always-expand-toggle'),
    showFinishTime: document.getElementById('show-finish-time-toggle')
  };

  const holdSpaceSpeedInput = document.getElementById('hold-space-speed');

  const keyInputs = {
    keySpeedUp: document.getElementById('key-speedup'),
    keySlowDown: document.getElementById('key-slowdown'),
    keyReset: document.getElementById('key-reset')
  };

  const snapInputs = [
    document.getElementById('snap-pt1'),
    document.getElementById('snap-pt2'),
    document.getElementById('snap-pt3'),
    document.getElementById('snap-pt4')
  ];

  const speedSlider = document.getElementById('speed-slider');
  const speedDisplay = document.getElementById('speed-display');
  const loadingOverlay = document.getElementById('loading-overlay');
  const editorContainer = document.getElementById('hotkeys-editor-container');



  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');
  const popupContainer = document.querySelector('.popup-container');



  let snapPoints = [1.0, 2.0, 3.0, 4.0];

  function getDefaultKey(key) {
    if (key === 'keySpeedUp') return 'h';
    if (key === 'keySlowDown') return 'j';
    if (key === 'keyReset') return 'l';
    return '';
  }

  // Bind tab switching click handlers
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      
      // Update tab headers
      tabButtons.forEach(b => {
        const isActive = b === btn;
        b.classList.toggle('active', isActive);
        b.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });

      // Update tab panels
      tabPanels.forEach(panel => {
        panel.classList.toggle('active', panel.id === targetTab);
      });
    });
  });

  // Toggle active styling of the keycap binder container
  function toggleEditorState(isDisabled) {
    if (editorContainer) {
      if (isDisabled) {
        editorContainer.classList.add('disabled');
      } else {
        editorContainer.classList.remove('disabled');
      }
    }
  }

  // Equal-distance 4-point segmented slider interpolation functions
  // Points: [p0, p1, p2, p3] mapped at 0%, 33.3333%, 66.6667%, 100%
  function speedToSliderPercent(speed, points) {
    const pts = (points && points.length === 4) ? points : [1.0, 2.0, 3.0, 4.0];
    const s = parseFloat(speed);
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
      return (100 / 3) + frac * (100 / 3);
    }
    const span = pts[3] - pts[2];
    const frac = span > 0 ? (s - pts[2]) / span : 0;
    return (200 / 3) + frac * (100 / 3);
  }

  function sliderPercentToSpeed(pct, points) {
    const pts = (points && points.length === 4) ? points : [1.0, 2.0, 3.0, 4.0];
    const p = Math.max(0, Math.min(100, parseFloat(pct)));
    let raw = pts[0];
    if (p <= 0) {
      raw = pts[0];
    } else if (p >= 100) {
      raw = pts[3];
    } else if (p <= (100 / 3)) {
      const frac = p / (100 / 3);
      raw = pts[0] + frac * (pts[1] - pts[0]);
    } else if (p <= (200 / 3)) {
      const frac = (p - (100 / 3)) / (100 / 3);
      raw = pts[1] + frac * (pts[2] - pts[1]);
    } else {
      const frac = (p - (200 / 3)) / (100 / 3);
      raw = pts[2] + frac * (pts[3] - pts[2]);
    }
    return Math.round(raw * 10) / 10;
  }

  // Dynamically redraw tick labels at exact equal distances (0%, 33.33%, 66.67%, 100%)
  function updateTicksAndPresets(points) {
    const ticksRow = document.querySelector('.ticks-row');
    if (ticksRow) {
      ticksRow.textContent = '';
      const stops = [0, 100 / 3, 200 / 3, 100];
      points.forEach((pt, index) => {
        const pct = stops[index] !== undefined ? stops[index] : (index / (points.length - 1)) * 100;
        const span = document.createElement('span');
        span.className = 'tick-label';
        span.style.left = `${pct}%`;
        span.textContent = `${pt.toFixed(1).replace(/\.0$/, '')}x`;
        ticksRow.appendChild(span);
      });
    }
  }

  // Sync speed values to text labels and slider
  function updateSpeedUI(speed) {
    const formattedSpeed = parseFloat(speed).toFixed(1);
    if (speedDisplay) {
      speedDisplay.textContent = `${formattedSpeed}x`;
    }
    if (speedSlider) {
      const percent = speedToSliderPercent(formattedSpeed, snapPoints);
      speedSlider.value = Math.round(percent * 10);
      speedSlider.style.setProperty('--percent', `${percent}%`);
    }
  }

  // Save playback rate setting to extension storage
  function saveSpeed(speed) {
    safeStorageSet({ preferredSpeed: speed });
  }

  // Helper to dismiss loading overlay and remove from DOM after fade
  function dismissLoadingOverlay() {
    if (loadingOverlay) {
      loadingOverlay.classList.add('fade-out');
      loadingOverlay.addEventListener('transitionend', () => {
        loadingOverlay.remove();
      }, { once: true });
    }
  }

  const holdSpaceConfigRow = document.getElementById('hold-space-config-row');
  function toggleHoldSpaceConfig(isDisabled) {
    if (holdSpaceConfigRow) {
      if (isDisabled) {
        holdSpaceConfigRow.classList.add('disabled');
      } else {
        holdSpaceConfigRow.classList.remove('disabled');
      }
    }
  }



  safeStorageGet(
    ['preferredSpeed', 'hideAskAI', 'hideDoubt', 'hideChat', 'hideNotes', 'hideNoteTimeline', 'hideSpeed', 'hideSetting', 'hideTimeLine', 'hideTimeText', 'enableInstantHide', 'enableHotkeys', 'disableScroll', 'holdSpaceSpeedUp', 'holdSpaceSpeed', 'alwaysExpandWidget', 'showFinishTime', 'finishTimeFormat', 'keySpeedUp', 'keySlowDown', 'keyReset', 'snapPoints', 'extensionEnabled', 'themeMode', 'enablePiP', 'skipSilenceEnabled', 'skipSilenceSilenceSpeed', 'skipSilenceThreshold', 'skipSilenceDynamicThreshold', 'skipSilenceMute', 'skipSilenceTimeSaved', 'skipSilenceMinDuration', 'installDate', 'reviewPromptStatus', 'reviewPromptNextShowTime'],
    (result) => {
      applyTheme(result.themeMode !== 'dark');
      // Load focus toggles
      for (const key in toggles) {
        if (toggles[key]) {
          if (key === 'enablePiP') {
            toggles[key].checked = result[key] !== false;
          } else {
            toggles[key].checked = !!result[key];
          }
        }
      }



      // Load custom settings
      if (customToggles.enableHotkeys) {
        customToggles.enableHotkeys.checked = !!result.enableHotkeys;
        toggleEditorState(!result.enableHotkeys);
      }
      if (customToggles.disableScroll) {
        customToggles.disableScroll.checked = !!result.disableScroll;
      }
      if (customToggles.holdSpaceSpeedUp) {
        customToggles.holdSpaceSpeedUp.checked = !!result.holdSpaceSpeedUp;
        toggleHoldSpaceConfig(!result.holdSpaceSpeedUp);
      }
      if (customToggles.alwaysExpandWidget) {
        customToggles.alwaysExpandWidget.checked = !!result.alwaysExpandWidget;
      }
      if (customToggles.showFinishTime) {
        customToggles.showFinishTime.checked = result.showFinishTime !== false;
      }
      const finishTimeFormatSelect = document.getElementById('finish-time-format-select');
      if (finishTimeFormatSelect) {
        finishTimeFormatSelect.value = result.finishTimeFormat || 'minimal';
      }
      if (holdSpaceSpeedInput) {
        holdSpaceSpeedInput.value = result.holdSpaceSpeed !== undefined ? parseFloat(result.holdSpaceSpeed).toFixed(1) : "2.0";
      }

      // Load custom snap points
      if (result.snapPoints && Array.isArray(result.snapPoints) && result.snapPoints.length === 4) {
        snapPoints = result.snapPoints.map(v => parseFloat(v));
      }
      snapInputs.forEach((input, index) => {
        if (input && snapPoints[index] !== undefined) {
          input.value = snapPoints[index].toFixed(1);
        }
      });
      updateTicksAndPresets(snapPoints);

      // Load key bindings (default to empty if uninitialized)
      if (keyInputs.keySpeedUp) keyInputs.keySpeedUp.value = result.keySpeedUp || getDefaultKey('keySpeedUp');
      if (keyInputs.keySlowDown) keyInputs.keySlowDown.value = result.keySlowDown || getDefaultKey('keySlowDown');
      if (keyInputs.keyReset) keyInputs.keyReset.value = result.keyReset || getDefaultKey('keyReset');

      // Load speed (default to 1.0x if uninitialized)
      const speed = result.preferredSpeed ? parseFloat(result.preferredSpeed) : 1.0;
      updateSpeedUI(speed);

      // Load Skip Silence settings
      const ssEnableToggle = document.getElementById('ss-enable-toggle');
      if (ssEnableToggle) ssEnableToggle.checked = !!result.skipSilenceEnabled;

      const ssSilenceSpeedInput = document.getElementById('ss-silence-speed');
      if (ssSilenceSpeedInput) {
        ssSilenceSpeedInput.value = result.skipSilenceSilenceSpeed !== undefined ? parseFloat(result.skipSilenceSilenceSpeed).toFixed(1) : '3.0';
      }

      const ssAutoToggle = document.getElementById('ss-auto-toggle');
      const ssManualSensitivityCard = document.getElementById('ss-manual-sensitivity-card');
      const isAutoThreshold = result.skipSilenceDynamicThreshold !== false;
      if (ssAutoToggle) ssAutoToggle.checked = isAutoThreshold;
      if (ssManualSensitivityCard) ssManualSensitivityCard.style.display = isAutoThreshold ? 'none' : 'flex';

      const ssThresholdSlider = document.getElementById('ss-threshold-slider');
      const ssSensitivityValue = document.getElementById('ss-sensitivity-value');
      if (ssThresholdSlider) {
        const thresholdVal = (result.skipSilenceThreshold !== undefined && result.skipSilenceThreshold < 0)
          ? parseInt(result.skipSilenceThreshold)
          : -40;
        ssThresholdSlider.value = thresholdVal;
        if (ssSensitivityValue) ssSensitivityValue.textContent = `${thresholdVal} dB`;
      }

      const ssMuteToggle = document.getElementById('ss-mute-toggle');
      if (ssMuteToggle) ssMuteToggle.checked = !!result.skipSilenceMute;

      const ssTimeSaved = document.getElementById('ss-time-saved');
      if (ssTimeSaved) {
        const ms = result.skipSilenceTimeSaved || 0;
        ssTimeSaved.textContent = formatTimeSavedPopup(ms);
      }

      const ssMinDurationInput = document.getElementById('ss-min-duration');
      if (ssMinDurationInput) {
        ssMinDurationInput.value = result.skipSilenceMinDuration !== undefined ? parseFloat(result.skipSilenceMinDuration).toFixed(1) : '0.5';
      }

      // Check Review Prompt display logic
      checkAndTriggerReviewPrompt(result);

      // Remove loading overlay
      dismissLoadingOverlay();
    }
  );

  // Save focus toggles changes
  for (const key in toggles) {
    if (toggles[key]) {
      toggles[key].addEventListener('change', (e) => {
        safeStorageSet({ [key]: e.target.checked });
      });
    }
  }



  // Save custom layout settings changes
  for (const key in customToggles) {
    if (customToggles[key]) {
      customToggles[key].addEventListener('change', (e) => {
        const isChecked = e.target.checked;
        if (key === 'enableHotkeys') {
          toggleEditorState(!isChecked);
        }
        if (key === 'holdSpaceSpeedUp') {
          toggleHoldSpaceConfig(!isChecked);
        }
        safeStorageSet({ [key]: isChecked });
      });
    }
  }

  // Save finish time format selector changes
  const finishTimeFormatSelect = document.getElementById('finish-time-format-select');
  if (finishTimeFormatSelect) {
    finishTimeFormatSelect.addEventListener('change', (e) => {
      safeStorageSet({ finishTimeFormat: e.target.value });
    });
  }

  // Bind interactive hold space custom speed rate changes
  const holdSpaceMinusBtn = document.getElementById('hold-space-minus');
  const holdSpacePlusBtn = document.getElementById('hold-space-plus');

  function updateHoldSpaceRate(delta) {
    if (!holdSpaceSpeedInput) return;
    let val = parseFloat(holdSpaceSpeedInput.value);
    if (isNaN(val)) val = 2.0;
    val = Math.round((val + delta) * 10) / 10;
    if (val < 1.1) val = 1.1;
    if (val > 4.0) val = 4.0;
    holdSpaceSpeedInput.value = val.toFixed(1);
    safeStorageSet({ holdSpaceSpeed: val });
  }

  if (holdSpaceMinusBtn) {
    holdSpaceMinusBtn.addEventListener('click', () => updateHoldSpaceRate(-0.1));
  }
  if (holdSpacePlusBtn) {
    holdSpacePlusBtn.addEventListener('click', () => updateHoldSpaceRate(0.1));
  }

  if (holdSpaceSpeedInput) {
    holdSpaceSpeedInput.addEventListener('change', () => {
      let val = parseFloat(holdSpaceSpeedInput.value);
      if (isNaN(val) || val < 1.1 || val > 4.0) {
        val = 2.0;
      }
      val = Math.round(val * 10) / 10;
      holdSpaceSpeedInput.value = val.toFixed(1);
      safeStorageSet({ holdSpaceSpeed: val });
    });
  }



  // Validate, auto-sort and sanitize snap points
  function sanitizeAndSortSnapPoints() {
    let rawVals = snapInputs.map((inp, idx) => {
      let v = parseFloat(inp ? inp.value : (idx + 1.0));
      if (isNaN(v) || v < 0.5) v = 0.5;
      if (v > 4.0) v = 4.0;
      return Math.round(v * 10) / 10;
    });

    // Sort ascending
    rawVals.sort((a, b) => a - b);

    // Enforce strictly increasing (at least 0.1 gap if duplicates exist)
    for (let i = 1; i < rawVals.length; i++) {
      if (rawVals[i] <= rawVals[i - 1]) {
        rawVals[i] = Math.min(4.0, Math.round((rawVals[i - 1] + 0.1) * 10) / 10);
      }
    }
    // If pushing right exceeded 4.0, push backwards
    for (let i = rawVals.length - 2; i >= 0; i--) {
      if (rawVals[i] >= rawVals[i + 1]) {
        rawVals[i] = Math.max(0.5, Math.round((rawVals[i + 1] - 0.1) * 10) / 10);
      }
    }

    snapPoints = rawVals;
    snapInputs.forEach((inp, idx) => {
      if (inp) inp.value = snapPoints[idx].toFixed(1);
    });

    safeStorageSet({ snapPoints: snapPoints });
    updateTicksAndPresets(snapPoints);

    // Refresh current speed UI with updated mapping
    safeStorageGet('preferredSpeed', (res) => {
      const current = res.preferredSpeed ? parseFloat(res.preferredSpeed) : 1.0;
      updateSpeedUI(current);
    });
  }

  // Bind interactive snap point input changes
  snapInputs.forEach((input) => {
    if (input) {
      input.addEventListener('change', () => {
        sanitizeAndSortSnapPoints();
      });
    }
  });

  // Bind Quick Speed Reset Button (resets active speed to 1.0x)
  const speedResetBtn = document.getElementById('speed-reset-btn');
  if (speedResetBtn) {
    speedResetBtn.addEventListener('click', () => {
      const targetSpeed = 1.0;
      updateSpeedUI(targetSpeed);
      saveSpeed(targetSpeed);
    });
  }

  // Bind Snap Points Reset Defaults Button (resets points to [1.0, 2.0, 3.0, 4.0])
  const snapResetDefaultsBtn = document.getElementById('snap-reset-defaults-btn');
  if (snapResetDefaultsBtn) {
    snapResetDefaultsBtn.addEventListener('click', () => {
      snapPoints = [1.0, 2.0, 3.0, 4.0];
      snapInputs.forEach((input, index) => {
        if (input && snapPoints[index] !== undefined) {
          input.value = snapPoints[index].toFixed(1);
        }
      });
      safeStorageSet({ snapPoints: snapPoints });
      updateTicksAndPresets(snapPoints);

      safeStorageGet('preferredSpeed', (res) => {
        const current = res.preferredSpeed ? parseFloat(res.preferredSpeed) : 1.0;
        updateSpeedUI(current);
      });
    });
  }

  // Bind interactive key press recording with guide labels
  for (const key in keyInputs) {
    const input = keyInputs[key];
    if (input) {
      // Guide prompt on click/focus
      input.addEventListener('focus', () => {
        input.value = 'Press key...';
        input.style.color = 'var(--accent-focus)';
      });

      // Restore saved value on blur if no key was recorded
      input.addEventListener('blur', () => {
        input.style.removeProperty('color');
        safeStorageGet(key, (result) => {
          input.value = result[key] || getDefaultKey(key);
        });
      });

      // Keypress listener
      input.addEventListener('keydown', (e) => {
        e.preventDefault();
        
        // Ignore pure modifier keys
        if (['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) {
          return;
        }

        let boundKey = e.key;
        if (boundKey === ' ') boundKey = 'Space';

        input.value = boundKey;
        
        safeStorageSet({ [key]: boundKey });
        input.blur(); // exit focus state
      });
    }
  }

  // Bind slider drag changes with smooth segmented interpolation & magnetic snap
  if (speedSlider) {
    speedSlider.addEventListener('input', (e) => {
      const percent = parseFloat(e.target.value) / 10;
      let val = sliderPercentToSpeed(percent, snapPoints);

      // Magnetic snapping within ~2.2% of any snap point
      const snapPercents = [0, 100 / 3, 200 / 3, 100];
      for (let i = 0; i < snapPercents.length; i++) {
        if (Math.abs(percent - snapPercents[i]) <= 2.2) {
          val = snapPoints[i];
          break;
        }
      }

      if (speedDisplay) {
        speedDisplay.textContent = `${val.toFixed(1)}x`;
      }
      const actualPct = speedToSliderPercent(val, snapPoints);
      speedSlider.style.setProperty('--percent', `${actualPct}%`);
      saveSpeed(val);
    });

    speedSlider.addEventListener('change', (e) => {
      const percent = parseFloat(e.target.value) / 10;
      const val = sliderPercentToSpeed(percent, snapPoints);
      updateSpeedUI(val);
      saveSpeed(val);
    });
  }

  // Bind settings gear panel expand/collapse events with 2-way CSS Grid smooth animations
  const settingsToggleBtn = document.getElementById('settings-toggle-btn');
  const presetsEditorContainer = document.getElementById('presets-editor-container');

  if (settingsToggleBtn && presetsEditorContainer) {
    let collapseTimeout = null;

    settingsToggleBtn.addEventListener('click', () => {
      if (collapseTimeout) {
        clearTimeout(collapseTimeout);
        collapseTimeout = null;
      }

      const isExpanded = presetsEditorContainer.classList.contains('expanded');

      if (isExpanded) {
        presetsEditorContainer.classList.remove('expanded');
        presetsEditorContainer.classList.add('collapsing');
        settingsToggleBtn.setAttribute('aria-expanded', 'false');

        collapseTimeout = setTimeout(() => {
          presetsEditorContainer.classList.remove('collapsing');
          collapseTimeout = null;
        }, 220);
      } else {
        presetsEditorContainer.classList.remove('collapsing');
        presetsEditorContainer.classList.add('expanded');
        settingsToggleBtn.setAttribute('aria-expanded', 'true');
      }
    });
  }

  // Handle external links opening in a new tab
  const githubLink = document.querySelector('.github-link');
  if (githubLink) {
    githubLink.addEventListener('click', (e) => {
      e.preventDefault();
      const url = githubLink.getAttribute('href');
      if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.create) {
        chrome.tabs.create({ url: url });
      } else {
        window.open(url, '_blank');
      }
    });
  }

  const feedbackLink = document.querySelector('.feedback-link');
  if (feedbackLink) {
    feedbackLink.addEventListener('click', (e) => {
      e.preventDefault();
      const url = feedbackLink.getAttribute('href');
      if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.create) {
        chrome.tabs.create({ url: url });
      } else {
        window.open(url, '_blank');
      }
    });
  }

  const versionLink = document.querySelector('.version-link');
  if (versionLink) {
    versionLink.addEventListener('click', (e) => {
      e.preventDefault();
      const url = versionLink.getAttribute('href');
      if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.create) {
        chrome.tabs.create({ url: url });
      } else {
        window.open(url, '_blank');
      }
    });
  }
  const rateLink = document.querySelector('.rate-link');
  if (rateLink) {
    let rateUrl = 'https://chromewebstore.google.com/detail/pw-control/ibepglcdcaanmkledmpgfapaffkhbadj?authuser=0&hl=en-GB';
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes('firefox')) {
      rateUrl = 'https://addons.mozilla.org/en-US/firefox/addon/pw-control/';
    } else if (ua.includes('edg')) {
      rateUrl = 'https://microsoftedge.microsoft.com/addons/detail/pw-control/cnoboofnelihfmnjfbpbelpfdmogfaan';
    }
    rateLink.setAttribute('href', rateUrl);
    rateLink.addEventListener('click', (e) => {
      e.preventDefault();
      if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.create) {
        chrome.tabs.create({ url: rateUrl });
      } else {
        window.open(rateUrl, '_blank');
      }
    });
  }


  // === SKIP SILENCE TAB EVENT HANDLERS ===

  // Format milliseconds to human-readable string for popup display
  function formatTimeSavedPopup(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    if (totalSeconds < 60) return totalSeconds + 's';
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    if (minutes < 60) return minutes + 'm ' + seconds + 's';
    const hours = Math.floor(minutes / 60);
    const remMinutes = minutes % 60;
    return hours + 'h ' + remMinutes + 'm';
  }

  // Skip Silence enable toggle
  const ssEnableToggleEl = document.getElementById('ss-enable-toggle');
  if (ssEnableToggleEl) {
    ssEnableToggleEl.addEventListener('change', (e) => {
      safeStorageSet({ skipSilenceEnabled: e.target.checked });
    });
  }

  // Silence speed stepper
  function updateSSSilenceSpeed(delta) {
    const input = document.getElementById('ss-silence-speed');
    if (!input) return;
    let val = parseFloat(input.value);
    if (isNaN(val)) val = 3.0;
    val = Math.round((val + delta) * 10) / 10;
    if (val < 1.5) val = 1.5;
    if (val > 6.0) val = 6.0;
    input.value = val.toFixed(1);
    safeStorageSet({ skipSilenceSilenceSpeed: val });
  }

  const ssSilenceMinus = document.getElementById('ss-silence-minus');
  const ssSilencePlus = document.getElementById('ss-silence-plus');
  if (ssSilenceMinus) ssSilenceMinus.addEventListener('click', () => updateSSSilenceSpeed(-0.1));
  if (ssSilencePlus) ssSilencePlus.addEventListener('click', () => updateSSSilenceSpeed(0.1));

  const ssSilenceSpeedEl = document.getElementById('ss-silence-speed');
  if (ssSilenceSpeedEl) {
    ssSilenceSpeedEl.addEventListener('change', () => {
      let val = parseFloat(ssSilenceSpeedEl.value);
      if (isNaN(val) || val < 1.5 || val > 6.0) val = 3.0;
      val = Math.round(val * 10) / 10;
      ssSilenceSpeedEl.value = val.toFixed(1);
      safeStorageSet({ skipSilenceSilenceSpeed: val });
    });
  }

  // Auto noise calibration toggle
  const ssAutoToggleEl = document.getElementById('ss-auto-toggle');
  const ssManualSensitivityCardEl = document.getElementById('ss-manual-sensitivity-card');
  if (ssAutoToggleEl) {
    ssAutoToggleEl.addEventListener('change', (e) => {
      const isAuto = e.target.checked;
      if (ssManualSensitivityCardEl) {
        ssManualSensitivityCardEl.style.display = isAuto ? 'none' : 'flex';
      }
      safeStorageSet({ skipSilenceDynamicThreshold: isAuto });
    });
  }

  // Silence threshold slider
  const ssThresholdSliderEl = document.getElementById('ss-threshold-slider');
  const ssSensitivityValueEl = document.getElementById('ss-sensitivity-value');
  if (ssThresholdSliderEl) {
    ssThresholdSliderEl.addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      if (ssSensitivityValueEl) ssSensitivityValueEl.textContent = `${val} dB`;
      safeStorageSet({ skipSilenceThreshold: val });
    });
  }

  // Mute during silence toggle
  const ssMuteToggleEl = document.getElementById('ss-mute-toggle');
  if (ssMuteToggleEl) {
    ssMuteToggleEl.addEventListener('change', (e) => {
      safeStorageSet({ skipSilenceMute: e.target.checked });
    });
  }

  // Reset time saved button
  const ssResetBtn = document.getElementById('ss-reset-btn');
  if (ssResetBtn) {
    ssResetBtn.addEventListener('click', () => {
      safeStorageSet({ skipSilenceTimeSaved: 0 });
      const ssTimeSavedEl = document.getElementById('ss-time-saved');
      if (ssTimeSavedEl) ssTimeSavedEl.textContent = '0s';
    });
  }

  // Minimum silence duration input
  const ssMinDurationEl = document.getElementById('ss-min-duration');
  if (ssMinDurationEl) {
    ssMinDurationEl.addEventListener('change', () => {
      let val = parseFloat(ssMinDurationEl.value);
      if (isNaN(val) || val < 0.3) val = 0.3;
      if (val > 3.0) val = 3.0;
      val = Math.round(val * 10) / 10;
      ssMinDurationEl.value = val.toFixed(1);
      safeStorageSet({ skipSilenceMinDuration: val });
    });
  }

  // Listen for time saved updates from content script in real-time
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'local' && changes.skipSilenceTimeSaved) {
        const ssTimeSavedEl = document.getElementById('ss-time-saved');
        if (ssTimeSavedEl) {
          ssTimeSavedEl.textContent = formatTimeSavedPopup(changes.skipSilenceTimeSaved.newValue || 0);
        }
      }
    });
  }


  // === REVIEW PROMPT MODAL LOGIC ===
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;
  const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

  const reviewModal = document.getElementById('review-modal');
  const reviewBackdrop = reviewModal ? reviewModal.querySelector('.review-modal-backdrop') : null;
  const reviewBtnAccept = document.getElementById('review-btn-accept');
  const reviewBtnLater = document.getElementById('review-btn-later');
  const reviewBtnNever = document.getElementById('review-btn-never');

  function getStoreReviewUrl() {
    let storeUrl = 'https://chromewebstore.google.com/detail/pw-control/ibepglcdcaanmkledmpgfapaffkhbadj/reviews';
    const ua = (navigator.userAgent || '').toLowerCase();
    if (ua.includes('firefox')) {
      storeUrl = 'https://addons.mozilla.org/en-US/firefox/addon/enhancer-for-physics-wallah/';
    } else if (ua.includes('edg')) {
      storeUrl = 'https://microsoftedge.microsoft.com/addons/detail/pw-control/cnoboofnelihfmnjfbpbelpfdmogfaan';
    }
    return storeUrl;
  }

  function showReviewModal() {
    if (!reviewModal) return;
    reviewModal.style.display = 'flex';
    reviewModal.setAttribute('aria-hidden', 'false');
    // Force layout reflow before adding active class for smooth CSS transition
    void reviewModal.offsetWidth;
    reviewModal.classList.add('active');
  }

  function hideReviewModal() {
    if (!reviewModal) return;
    reviewModal.classList.remove('active');
    reviewModal.setAttribute('aria-hidden', 'true');
    setTimeout(() => {
      if (!reviewModal.classList.contains('active')) {
        reviewModal.style.display = 'none';
      }
    }, 220);
  }

  function checkAndTriggerReviewPrompt(storedData) {
    const now = Date.now();
    let installDate = storedData.installDate;

    // Gracefully handle existing users: record Day 1 on their first popup open after update
    if (!installDate) {
      installDate = now;
      safeStorageSet({ installDate: now });
    }

    const reviewPromptStatus = storedData.reviewPromptStatus;
    const reviewPromptNextShowTime = storedData.reviewPromptNextShowTime || 0;

    // Do not show if permanently dismissed or already reviewed
    if (reviewPromptStatus === 'reviewed' || reviewPromptStatus === 'dismissed_permanently') {
      return;
    }

    // Check if at least 1 full day has passed since install and snooze interval has elapsed
    const hasBeenOneDay = (now - installDate) >= ONE_DAY_MS;
    const isSnoozeOver = now >= reviewPromptNextShowTime;

    if (hasBeenOneDay && isSnoozeOver) {
      // Gentle delayed entrance so popup UI smoothly mounts first
      setTimeout(() => {
        showReviewModal();
      }, 350);
    }
  }

  // Response 1: Leave a Review (opens browser store & permanently stops asking)
  if (reviewBtnAccept) {
    reviewBtnAccept.addEventListener('click', () => {
      const url = getStoreReviewUrl();
      if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.create) {
        chrome.tabs.create({ url: url });
      } else {
        window.open(url, '_blank');
      }
      safeStorageSet({ reviewPromptStatus: 'reviewed' });
      hideReviewModal();
    });
  }

  // Response 2: Maybe Later (3 days snooze)
  if (reviewBtnLater) {
    reviewBtnLater.addEventListener('click', () => {
      safeStorageSet({ reviewPromptNextShowTime: Date.now() + THREE_DAYS_MS });
      hideReviewModal();
    });
  }

  // Response 3: Don't Ask Again (Permanently dismiss)
  if (reviewBtnNever) {
    reviewBtnNever.addEventListener('click', () => {
      safeStorageSet({ reviewPromptStatus: 'dismissed_permanently' });
      hideReviewModal();
    });
  }

  // Backdrop click dismissal (treated as Maybe Later - 3 days snooze)
  if (reviewBackdrop) {
    reviewBackdrop.addEventListener('click', () => {
      safeStorageSet({ reviewPromptNextShowTime: Date.now() + THREE_DAYS_MS });
      hideReviewModal();
    });
  }

  // Escape key dismissal (treated as Maybe Later - 3 days snooze)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && reviewModal && reviewModal.classList.contains('active')) {
      safeStorageSet({ reviewPromptNextShowTime: Date.now() + THREE_DAYS_MS });
      hideReviewModal();
    }
  });

});
