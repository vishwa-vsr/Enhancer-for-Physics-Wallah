// Main World Engine Bridge for Video.js
// Runs in the webpage context (world: MAIN, run_at: document_start)
// Directly interacts with Video.js, VHS, and stream quality levels

(function initPwcEngineBridge() {
  if ((window as any).__PWC_ENGINE_BRIDGE_INITIALIZED__) return;
  (window as any).__PWC_ENGINE_BRIDGE_INITIALIZED__ = true;

  let targetQuality: string = (window as any).__PWC_LAST_TARGET_QUALITY__ || '720p';
  let purgeTimeout: any = null;
  let activePollTimer: any = null;

  let isConstantQualityEnabled: boolean = false;
  try {
    isConstantQualityEnabled = localStorage.getItem('pwc_constant_quality') === 'true';
  } catch (_e) {}

  console.log('[PWC-QUALITY] Engine Bridge initialized at document_start. Constant quality active:', isConstantQualityEnabled, 'Default target:', targetQuality);

  // 1. Pre-seed localStorage bandwidth for VHS before player boots (only if constant quality is active)
  if (isConstantQualityEnabled) {
    try {
      const existing = localStorage.getItem('videojs-vhs');
      const data = existing ? JSON.parse(existing) : {};
      data.bandwidth = 100000000; // 100 Mbps
      localStorage.setItem('videojs-vhs', JSON.stringify(data));
    } catch (_e) {}
  }

  // 2. Pre-configure global Video.js defaults to prevent low-res startup (only if constant quality is active)
  function seedVideoJsOptions(vjs: any) {
    if (!isConstantQualityEnabled || !vjs || !vjs.options) return;
    try {
      vjs.options.vhs = vjs.options.vhs || {};
      vjs.options.vhs.bandwidth = 100000000;
      vjs.options.vhs.limitRenditionByPlayerDimensions = false;
      vjs.options.vhs.enableLowInitialPlaylist = false;
      vjs.options.vhs.useBandwidthFromLocalStorage = true;

      if (vjs.options.html5) {
        vjs.options.html5.vhs = vjs.options.html5.vhs || {};
        vjs.options.html5.vhs.bandwidth = 100000000;
        vjs.options.html5.vhs.limitRenditionByPlayerDimensions = false;
        vjs.options.html5.vhs.enableLowInitialPlaylist = false;
        vjs.options.html5.vhs.useBandwidthFromLocalStorage = true;
      }
      console.log('[PWC-QUALITY] Seeded Video.js global VHS options (100 Mbps)');
    } catch (_e) {}
  }

  if (typeof (window as any).videojs !== 'undefined') {
    seedVideoJsOptions((window as any).videojs);
  } else {
    let _vjs = (window as any).videojs;
    try {
      Object.defineProperty(window, 'videojs', {
        configurable: true,
        enumerable: true,
        get() {
          return _vjs;
        },
        set(val) {
          _vjs = val;
          seedVideoJsOptions(val);
        },
      });
    } catch (_e) {}
  }

  function getPlayer(): any {
    try {
      // 1. Check video elements and parents
      const videoEl = document.querySelector('video');
      if (videoEl && (videoEl as any).player) {
        return (videoEl as any).player;
      }
      if (videoEl?.parentElement && (videoEl.parentElement as any).player) {
        return (videoEl.parentElement as any).player;
      }

      // 2. Check Video.js containers
      const vjsEl = document.querySelector('.video-js, .video-player-app, [id^="vjs_video_"]');
      if (vjsEl && (vjsEl as any).player) {
        return (vjsEl as any).player;
      }

      // 3. Check window.videojs players registry
      if (typeof (window as any).videojs === 'function') {
        const vjs = (window as any).videojs;
        if (vjs.players) {
          const keys = Object.keys(vjs.players);
          if (keys.length > 0) return vjs.players[keys[0]];
        }
        if (typeof vjs.getAllPlayers === 'function') {
          const all = vjs.getAllPlayers();
          if (all && all.length > 0) return all[0];
        }
      }

      // 4. Scan for any DOM element holding a .player property
      const elements = document.querySelectorAll('.video-js, [class*="vjs-"], video');
      for (let i = 0; i < elements.length; i++) {
        if ((elements[i] as any).player) return (elements[i] as any).player;
      }
    } catch (_e) {}
    return null;
  }

  function getQualityLevels(): any {
    const player = getPlayer();
    if (player && typeof player.qualityLevels === 'function') {
      return player.qualityLevels();
    }
    return null;
  }

  function getAvailableHeights(levels: any): number[] {
    if (!levels || levels.length === 0) {
      // Check VHS representations if qualityLevels plugin not populated
      const player = getPlayer();
      const tech = typeof player?.tech === 'function' ? player.tech({ IWillNotUseThisInPlugins: true }) : null;
      const reps = tech?.vhs?.representations ? tech.vhs.representations() : null;
      if (reps && reps.length > 0) {
        const heights: number[] = [];
        for (const r of reps) {
          if (r.height && !heights.includes(r.height)) heights.push(r.height);
        }
        heights.sort((a, b) => b - a);
        if (heights.length > 0) return heights;
      }
      return [720, 480, 360, 240];
    }

    const heights: number[] = [];
    for (let i = 0; i < levels.length; i++) {
      const h = levels[i].height;
      if (typeof h === 'number' && !isNaN(h) && h > 0 && !heights.includes(h)) {
        heights.push(h);
      }
    }
    heights.sort((a, b) => b - a);
    return heights.length > 0 ? heights : [720, 480, 360, 240];
  }

  function getCurrentQualityLabel(levels: any): string {
    if (!levels || levels.length === 0) return targetQuality || '720p';

    let enabledCount = 0;
    let enabledHeight = 0;
    for (let i = 0; i < levels.length; i++) {
      if (levels[i].enabled) {
        enabledCount++;
        enabledHeight = levels[i].height;
      }
    }

    if (enabledCount === levels.length || enabledCount === 0) {
      return 'auto';
    }
    if (enabledCount === 1 && enabledHeight) {
      return `${enabledHeight}p`;
    }
    return targetQuality || 'auto';
  }

  function broadcastState(levels?: any) {
    const lvls = levels || getQualityLevels();
    const available = getAvailableHeights(lvls);
    const current = getCurrentQualityLabel(lvls);

    window.dispatchEvent(
      new CustomEvent('PWC_QUALITY_STATE', {
        detail: {
          currentQuality: current,
          availableQualities: available,
        },
      })
    );
  }

  // Hook VHS selectPlaylist early so chunk 0 downloads in 720p directly
  function hookPlayerABR(player: any) {
    if (!isConstantQualityEnabled || !player || player.__pwc_abr_hooked) return;
    player.__pwc_abr_hooked = true;

    try {
      const tech = typeof player.tech === 'function' ? player.tech({ IWillNotUseThisInPlugins: true }) : null;
      const vhs = tech?.vhs;
      if (vhs && typeof vhs.selectPlaylist === 'function') {
        const origSelectPlaylist = vhs.selectPlaylist;
        vhs.selectPlaylist = function () {
          if (!isConstantQualityEnabled) {
            return origSelectPlaylist.apply(this, arguments as any);
          }
          if (targetQuality && targetQuality !== 'auto') {
            const clean = targetQuality.replace('p', '');
            const targetHeight = parseInt(clean, 10);
            const master = vhs.playlists?.master;
            if (master && Array.isArray(master.playlists) && master.playlists.length > 0) {
              // 1. Exact match
              const exact = master.playlists.find(
                (p: any) => p.attributes?.RESOLUTION?.height === targetHeight
              );
              if (exact) {
                console.log(`[PWC-QUALITY] selectPlaylist picked exact ${targetHeight}p rendition`);
                return exact;
              }

              // 2. Closest match
              let closest = master.playlists[0];
              let minDiff = Infinity;
              for (const p of master.playlists) {
                const h = p.attributes?.RESOLUTION?.height || 0;
                const diff = Math.abs(h - targetHeight);
                if (diff < minDiff) {
                  minDiff = diff;
                  closest = p;
                }
              }
              if (closest) {
                console.log(`[PWC-QUALITY] selectPlaylist picked closest ${closest.attributes?.RESOLUTION?.height}p rendition`);
                return closest;
              }
            }
          }
          return origSelectPlaylist.apply(this, arguments as any);
        };
        console.log('[PWC-QUALITY] Successfully hooked VHS selectPlaylist');
      }
    } catch (_e) {}
  }

  // Purge pre-buffered low-quality chunks and micro-seek to sync crisp 720p immediately
  function purgeBufferAndSync(player: any) {
    if (!player) return;
    try {
      const curTime = typeof player.currentTime === 'function' ? player.currentTime() : 0;
      const tech = typeof player.tech === 'function' ? player.tech({ IWillNotUseThisInPlugins: true }) : null;
      const vhs = tech?.vhs;

      // 1. Abort any currently in-flight segment downloads
      if (vhs?.mainSegmentLoader_ && typeof vhs.mainSegmentLoader_.abort === 'function') {
        vhs.mainSegmentLoader_.abort();
        console.log('[PWC-QUALITY] Aborted in-flight low-res segment download');
      }

      // 2. Clear forward buffer from SourceBuffers
      const mediaSource = vhs?.masterPlaylistController_?.mediaSource;
      if (mediaSource && mediaSource.sourceBuffers && mediaSource.sourceBuffers.length > 0) {
        const buffers = Array.from(mediaSource.sourceBuffers) as SourceBuffer[];
        buffers.forEach((sb) => {
          const start = Math.max(0.1, curTime + 0.2);
          const end = curTime + 10000;
          const doRemove = () => {
            try {
              if (start < end && sb.buffered && sb.buffered.length > 0) {
                const bufEnd = sb.buffered.end(sb.buffered.length - 1);
                if (bufEnd > start) {
                  sb.remove(start, Math.min(end, bufEnd));
                  console.log(`[PWC-QUALITY] Purged forward buffer (${start.toFixed(1)}s -> ${bufEnd.toFixed(1)}s)`);
                }
              }
            } catch (_e) {}
          };

          if (!sb.updating) {
            doRemove();
          } else {
            const onUpdateEnd = () => {
              sb.removeEventListener('updateend', onUpdateEnd);
              doRemove();
            };
            sb.addEventListener('updateend', onUpdateEnd);
          }
        });
      }

      // 3. Reset VHS segment loader tracking
      if (vhs?.mainSegmentLoader_ && typeof vhs.mainSegmentLoader_.reset_ === 'function') {
        vhs.mainSegmentLoader_.reset_();
      }

      // 4. Micro-seek to sync decoder immediately
      setTimeout(() => {
        try {
          if (typeof player.currentTime === 'function') {
            const now = player.currentTime();
            player.currentTime(now + 0.001);
            console.log('[PWC-QUALITY] Micro-seek performed at', now);
          }
        } catch (_e) {}
      }, 50);
    } catch (_e) {}
  }

  function requestPurgeBuffer(player: any) {
    if (purgeTimeout) clearTimeout(purgeTimeout);
    purgeTimeout = setTimeout(() => {
      purgeBufferAndSync(player);
    }, 60);
  }

  function attachLevelsListeners(levels: any) {
    if (!levels || levels.__pwc_attached) return;
    levels.__pwc_attached = true;

    const onAdd = () => {
      console.log('[PWC-QUALITY] addqualitylevel fired, re-applying target:', targetQuality);
      if (targetQuality) applyQuality(targetQuality, false);
      broadcastState(levels);
    };
    const onChange = () => {
      broadcastState(levels);
    };

    try {
      if (typeof levels.on === 'function') {
        levels.on('addqualitylevel', onAdd);
        levels.on('change', onChange);
      }
      if (typeof levels.addEventListener === 'function') {
        levels.addEventListener('addqualitylevel', onAdd);
        levels.addEventListener('change', onChange);
      }
    } catch (_e) {}
  }

  function applyQuality(quality: string, shouldPurge = true): boolean {
    targetQuality = (quality || 'auto').toLowerCase().trim();
    (window as any).__PWC_LAST_TARGET_QUALITY__ = targetQuality;

    const player = getPlayer();
    if (player) {
      hookPlayerABR(player);
    }

    const clean = targetQuality.replace('p', '');
    const isAuto = clean === 'auto';
    const targetHeight = isAuto ? 0 : parseInt(clean, 10);

    let applied = false;

    // Layer 1: Apply via player.qualityLevels()
    const levels = getQualityLevels();
    if (levels && levels.length > 0) {
      attachLevelsListeners(levels);

      if (isAuto) {
        for (let i = 0; i < levels.length; i++) {
          levels[i].enabled = true;
        }
        applied = true;
      } else {
        let matchIdx = -1;
        for (let i = 0; i < levels.length; i++) {
          if (levels[i].height === targetHeight) {
            matchIdx = i;
            break;
          }
        }
        if (matchIdx === -1) {
          let minDiff = Infinity;
          let closestIdx = 0;
          for (let i = 0; i < levels.length; i++) {
            const diff = Math.abs(levels[i].height - targetHeight);
            if (diff < minDiff) {
              minDiff = diff;
              closestIdx = i;
            }
          }
          matchIdx = closestIdx;
        }

        for (let i = 0; i < levels.length; i++) {
          levels[i].enabled = (i === matchIdx);
        }
        console.log(`[PWC-QUALITY] Locked qualityLevels[${matchIdx}] (${levels[matchIdx].height}p) enabled=true`);
        applied = true;
      }
      broadcastState(levels);
    }

    // Layer 2: Apply via VHS representations API (fallback if qualityLevels not present)
    if (!applied && player) {
      try {
        const tech = typeof player.tech === 'function' ? player.tech({ IWillNotUseThisInPlugins: true }) : null;
        const reps = tech?.vhs?.representations ? tech.vhs.representations() : (tech?.representations ? tech.representations() : null);
        if (reps && reps.length > 0) {
          if (isAuto) {
            reps.forEach((r: any) => typeof r.enabled === 'function' && r.enabled(true));
            applied = true;
          } else {
            let matchRep = reps.find((r: any) => r.height === targetHeight);
            if (!matchRep) {
              let minDiff = Infinity;
              reps.forEach((r: any) => {
                const diff = Math.abs((r.height || 0) - targetHeight);
                if (diff < minDiff) {
                  minDiff = diff;
                  matchRep = r;
                }
              });
            }
            if (matchRep) {
              reps.forEach((r: any) => {
                if (typeof r.enabled === 'function') {
                  r.enabled(r === matchRep);
                }
              });
              console.log(`[PWC-QUALITY] Locked via vhs.representations: ${matchRep.height}p`);
              applied = true;
            }
          }
          broadcastState();
        }
      } catch (_e) {}
    }

    // Layer 3: Direct HLS Playlist switch
    if (player && !isAuto) {
      try {
        const tech = typeof player.tech === 'function' ? player.tech({ IWillNotUseThisInPlugins: true }) : null;
        const vhs = tech?.vhs;
        const master = vhs?.playlists?.master;
        if (master && Array.isArray(master.playlists) && typeof vhs.playlists?.media === 'function') {
          const matchPl = master.playlists.find((p: any) => p.attributes?.RESOLUTION?.height === targetHeight)
            || master.playlists[0];
          if (matchPl && vhs.playlists.media() !== matchPl) {
            vhs.playlists.media(matchPl);
            console.log(`[PWC-QUALITY] Switched vhs.playlists.media directly to ${matchPl.attributes?.RESOLUTION?.height}p`);
            applied = true;
          }
        }
      } catch (_e) {}
    }

    // If successfully locked, purge old buffer to show 720p instantly
    if (applied && shouldPurge && player) {
      requestPurgeBuffer(player);
    }

    return applied;
  }

  // Active polling loop: retries every 250ms for up to 15 seconds after video begins loading
  function startQualityEnforcementLoop() {
    if (!isConstantQualityEnabled) return;
    if (activePollTimer) clearInterval(activePollTimer);
    let attempts = 0;
    activePollTimer = setInterval(() => {
      attempts++;
      const player = getPlayer();
      if (player) {
        hookPlayerABR(player);
      }
      const levels = getQualityLevels();
      const hasLevels = levels && levels.length > 0;
      if (hasLevels) {
        attachLevelsListeners(levels);
        const success = applyQuality(targetQuality, true);
        broadcastState(levels);
        if (success || attempts > 20) {
          clearInterval(activePollTimer);
          activePollTimer = null;
        }
      } else if (attempts > 60) {
        clearInterval(activePollTimer);
        activePollTimer = null;
      }
    }, 250);
  }

  // Listen for quality commands from PWC content script
  window.addEventListener('PWC_SET_QUALITY', (event: any) => {
    if (event && event.detail && event.detail.quality) {
      console.log('[PWC-QUALITY] Received PWC_SET_QUALITY:', event.detail.quality);
      applyQuality(event.detail.quality, true);
    }
  });

  window.addEventListener('PWC_SET_CONSTANT_QUALITY_ENABLED', (event: any) => {
    if (event && event.detail !== undefined) {
      isConstantQualityEnabled = !!event.detail.enabled;
      console.log('[PWC-QUALITY] Constant quality enabled changed to:', isConstantQualityEnabled);
      try {
        localStorage.setItem('pwc_constant_quality', isConstantQualityEnabled ? 'true' : 'false');
      } catch (_e) {}

      if (isConstantQualityEnabled) {
        if (typeof (window as any).videojs !== 'undefined') {
          seedVideoJsOptions((window as any).videojs);
        }
        const player = getPlayer();
        if (player) {
          hookPlayerABR(player);
        }
        startQualityEnforcementLoop();
        applyQuality(targetQuality, true);
      } else {
        if (activePollTimer) {
          clearInterval(activePollTimer);
          activePollTimer = null;
        }
        applyQuality('auto', false);
      }
    }
  });

  window.addEventListener('PWC_REQUEST_QUALITY', () => {
    broadcastState();
  });

  // Start initial enforcement loop if enabled
  startQualityEnforcementLoop();

  // Monitor video lifecycle events: loadstart, loadedmetadata, canplay, play
  document.addEventListener('loadstart', (e: Event) => {
    if (isConstantQualityEnabled && e.target instanceof HTMLVideoElement) {
      console.log('[PWC-QUALITY] Video loadstart detected');
      startQualityEnforcementLoop();
    }
  }, true);

  document.addEventListener('loadedmetadata', (e: Event) => {
    if (isConstantQualityEnabled && e.target instanceof HTMLVideoElement) {
      console.log('[PWC-QUALITY] Video loadedmetadata detected -> enforcing quality');
      const player = getPlayer();
      if (player) hookPlayerABR(player);
      applyQuality(targetQuality, true);
    }
  }, true);

  document.addEventListener('canplay', (e: Event) => {
    if (isConstantQualityEnabled && e.target instanceof HTMLVideoElement) {
      const player = getPlayer();
      if (player) hookPlayerABR(player);
      applyQuality(targetQuality, false);
    }
  }, true);

  document.addEventListener('play', (e: Event) => {
    if (isConstantQualityEnabled && e.target instanceof HTMLVideoElement) {
      const player = getPlayer();
      if (player) {
        hookPlayerABR(player);
        applyQuality(targetQuality, false);
      }
    }
  }, true);
})();
