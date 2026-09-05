// Main World Engine Bridge for Video.js
// Runs in the webpage context (world: MAIN, run_at: document_start)
// Directly interacts with Video.js, VHS, and stream quality levels

(function initPwcEngineBridge() {
  interface VhsOptions {
    bandwidth?: number;
    limitRenditionByPlayerDimensions?: boolean;
    enableLowInitialPlaylist?: boolean;
    useBandwidthFromLocalStorage?: boolean;
    [key: string]: unknown;
  }

  interface PlaylistAttributes {
    RESOLUTION?: {
      width?: number;
      height?: number;
    };
    BANDWIDTH?: number;
    [key: string]: unknown;
  }

  interface PlaylistEntry {
    attributes?: PlaylistAttributes;
    uri?: string;
    [key: string]: unknown;
  }

  interface MasterPlaylist {
    playlists?: PlaylistEntry[];
    [key: string]: unknown;
  }

  interface VhsRepresentation {
    height?: number;
    width?: number;
    bandwidth?: number;
    enabled?: (enable?: boolean) => boolean;
    [key: string]: unknown;
  }

  interface VhsTech {
    bandwidth?: number;
    playlists?: {
      master?: MasterPlaylist;
      media?: (playlist?: PlaylistEntry) => PlaylistEntry | undefined;
      [key: string]: unknown;
    };
    selectPlaylist?: () => PlaylistEntry | undefined;
    representations?: () => VhsRepresentation[];
    mainSegmentLoader_?: {
      abort?: () => void;
      reset_?: () => void;
      [key: string]: unknown;
    };
    masterPlaylistController_?: {
      mediaSource?: MediaSource;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  }

  interface QualityLevel {
    id?: string;
    label?: string;
    width?: number;
    height?: number;
    bitrate?: number;
    enabled?: boolean;
    [key: string]: unknown;
  }

  interface QualityLevelList {
    length: number;
    [index: number]: QualityLevel;
    on?: (event: string, callback: () => void) => void;
    addEventListener?: (event: string, callback: () => void) => void;
    __pwc_attached?: boolean;
    [key: string]: unknown;
  }

  interface PlayerTech extends VhsTech {
    vhs?: VhsTech;
    representations?: () => VhsRepresentation[];
  }

  interface VideoJsPlayer {
    tech?: (options?: { IWillNotUseThisInPlugins?: boolean }) => PlayerTech | null;
    qualityLevels?: () => QualityLevelList | null;
    currentTime?: (time?: number) => number;
    paused?: () => boolean;
    __pwc_abr_hooked?: boolean;
    [key: string]: unknown;
  }

  interface VideoJsGlobal {
    options?: {
      vhs?: VhsOptions;
      html5?: {
        vhs?: VhsOptions;
        [key: string]: unknown;
      };
      [key: string]: unknown;
    };
    players?: Record<string, VideoJsPlayer>;
    getAllPlayers?: () => VideoJsPlayer[];
    [key: string]: unknown;
  }

  interface PwcWindow {
    __PWC_ENGINE_BRIDGE_INITIALIZED__?: boolean;
    __PWC_LAST_TARGET_QUALITY__?: string;
    videojs?: VideoJsGlobal;
  }

  const pwcWin = window as unknown as PwcWindow;
  if (pwcWin.__PWC_ENGINE_BRIDGE_INITIALIZED__) return;
  pwcWin.__PWC_ENGINE_BRIDGE_INITIALIZED__ = true;

  let targetQuality: string = pwcWin.__PWC_LAST_TARGET_QUALITY__ || '720p';
  let activePollTimer: number | undefined = undefined;

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

  // Helper to configure high bandwidth options on VHS instances
  function applyHighBandwidthProfile(vhs: VhsOptions): void {
    vhs.bandwidth = 100000000; // 100 Mbps
    vhs.limitRenditionByPlayerDimensions = false;
    vhs.enableLowInitialPlaylist = false;
    vhs.useBandwidthFromLocalStorage = true;
  }

  // 2. Pre-configure global Video.js defaults to prevent low-res startup (only if constant quality is active)
  function seedVideoJsOptions(vjs: VideoJsGlobal): void {
    if (!isConstantQualityEnabled || !vjs || !vjs.options) return;
    try {
      vjs.options.vhs = vjs.options.vhs || {};
      applyHighBandwidthProfile(vjs.options.vhs);

      if (vjs.options.html5) {
        vjs.options.html5.vhs = vjs.options.html5.vhs || {};
        applyHighBandwidthProfile(vjs.options.html5.vhs);
      }
      console.log('[PWC-QUALITY] Seeded Video.js global VHS options (100 Mbps)');
    } catch (_e) {}
  }

  if (pwcWin.videojs) {
    seedVideoJsOptions(pwcWin.videojs);
  } else {
    let _vjs: VideoJsGlobal | undefined = pwcWin.videojs;
    try {
      Object.defineProperty(window, 'videojs', {
        configurable: true,
        enumerable: true,
        get() {
          return _vjs;
        },
        set(val: VideoJsGlobal) {
          _vjs = val;
          seedVideoJsOptions(val);
        },
      });
    } catch (_e) {}
  }

  function getPlayer(): VideoJsPlayer | null {
    try {
      // 1. Check video elements and parents
      const videoEl = document.querySelector('video') as (HTMLVideoElement & { player?: VideoJsPlayer }) | null;
      if (videoEl && videoEl.player) {
        return videoEl.player;
      }
      if (videoEl?.parentElement && (videoEl.parentElement as HTMLElement & { player?: VideoJsPlayer }).player) {
        return (videoEl.parentElement as HTMLElement & { player?: VideoJsPlayer }).player!;
      }

      // 2. Check Video.js containers
      const vjsEl = document.querySelector('.video-js, .video-player-app, [id^="vjs_video_"]') as (HTMLElement & { player?: VideoJsPlayer }) | null;
      if (vjsEl && vjsEl.player) {
        return vjsEl.player;
      }

      // 3. Check window.videojs players registry
      const vjs = (window as unknown as { videojs?: VideoJsGlobal }).videojs;
      if (vjs) {
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
        const p = (elements[i] as HTMLElement & { player?: VideoJsPlayer }).player;
        if (p) return p;
      }
    } catch (_e) {}
    return null;
  }

  function getQualityLevels(): QualityLevelList | null {
    const player = getPlayer();
    if (player && typeof player.qualityLevels === 'function') {
      return player.qualityLevels() || null;
    }
    return null;
  }

  function getAvailableHeights(levels: QualityLevelList | null): number[] {
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
      const h = levels[i]?.height;
      if (typeof h === 'number' && !isNaN(h) && h > 0 && !heights.includes(h)) {
        heights.push(h);
      }
    }
    heights.sort((a, b) => b - a);
    return heights.length > 0 ? heights : [720, 480, 360, 240];
  }

  function getCurrentQualityLabel(levels: QualityLevelList | null): string {
    if (!levels || levels.length === 0) return targetQuality || '720p';

    let enabledCount = 0;
    let enabledHeight = 0;
    for (let i = 0; i < levels.length; i++) {
      if (levels[i]?.enabled) {
        enabledCount++;
        enabledHeight = levels[i]?.height || 0;
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

  function broadcastState(levels?: QualityLevelList | null) {
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

  // Shared helper to find the closest item index by resolution height
  function findClosestIndexByHeight(items: Array<{ height?: number }>, targetHeight: number): number {
    if (!items || items.length === 0) return -1;
    const exact = items.findIndex((item) => item.height === targetHeight);
    if (exact !== -1) return exact;

    let closestIdx = 0;
    let minDiff = Infinity;
    for (let i = 0; i < items.length; i++) {
      const h = items[i]?.height || 0;
      const diff = Math.abs(h - targetHeight);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = i;
      }
    }
    return closestIdx;
  }

  // Hook VHS selectPlaylist early so chunk 0 downloads in 720p directly
  function hookPlayerABR(player: VideoJsPlayer) {
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
            const playlists = (arguments && arguments[0] && Array.isArray(arguments[0]))
              ? (arguments[0] as PlaylistEntry[])
              : (master && Array.isArray(master.playlists) ? master.playlists : null);
            if (playlists && playlists.length > 0) {
              const heights = playlists.map((p) => ({ height: p.attributes?.RESOLUTION?.height }));
              const bestIdx = findClosestIndexByHeight(heights, targetHeight);
              if (bestIdx >= 0 && playlists[bestIdx]) {
                const chosen = playlists[bestIdx];
                console.log(`[PWC-QUALITY] selectPlaylist picked ${chosen.attributes?.RESOLUTION?.height}p rendition`);
                return chosen;
              }
            }
          }
          return origSelectPlaylist.apply(this, arguments as any);
        };
        console.log('[PWC-QUALITY] Successfully hooked VHS selectPlaylist');
      }
    } catch (_e) {}
  }

  function attachLevelsListeners(levels: QualityLevelList | null) {
    if (!levels || levels.__pwc_attached) return;
    levels.__pwc_attached = true;

    const onAdd = () => {
      console.log('[PWC-QUALITY] addqualitylevel fired, re-applying target:', targetQuality);
      if (targetQuality) applyQuality(targetQuality);
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

  function applyQuality(quality: string): boolean {
    targetQuality = (quality || 'auto').toLowerCase().trim();
    pwcWin.__PWC_LAST_TARGET_QUALITY__ = targetQuality;

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
        const levelItems: Array<{ height?: number }> = [];
        for (let i = 0; i < levels.length; i++) {
          levelItems.push({ height: levels[i]?.height });
        }
        const matchIdx = findClosestIndexByHeight(levelItems, targetHeight);

        for (let i = 0; i < levels.length; i++) {
          if (levels[i]) {
            levels[i].enabled = (i === matchIdx);
          }
        }
        if (matchIdx >= 0 && levels[matchIdx]) {
          console.log(`[PWC-QUALITY] Locked qualityLevels[${matchIdx}] (${levels[matchIdx].height}p) enabled=true`);
        }
        applied = matchIdx !== -1;
      }
      broadcastState(levels);
    }

    // Layer 2: Apply via VHS representations API (fallback if qualityLevels not present)
    if (!applied && player) {
      try {
        const tech = typeof player.tech === 'function' ? player.tech({ IWillNotUseThisInPlugins: true }) : null;
        const reps = tech?.vhs?.representations
          ? tech.vhs.representations()
          : typeof tech?.representations === 'function'
            ? tech.representations()
            : null;
        if (reps && reps.length > 0) {
          if (isAuto) {
            reps.forEach((r: VhsRepresentation) => typeof r.enabled === 'function' && r.enabled(true));
            applied = true;
          } else {
            const matchIdx = findClosestIndexByHeight(reps, targetHeight);
            const matchRep = matchIdx >= 0 ? reps[matchIdx] : null;
            if (matchRep) {
              reps.forEach((r: VhsRepresentation) => {
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

    return applied;
  }

  // Active polling loop: retries every 250ms for up to 15 seconds after video begins loading
  function startQualityEnforcementLoop() {
    if (!isConstantQualityEnabled) return;
    if (activePollTimer !== undefined) clearInterval(activePollTimer);
    let attempts = 0;
    activePollTimer = window.setInterval(() => {
      attempts++;
      const player = getPlayer();
      if (player) {
        hookPlayerABR(player);
      }
      const levels = getQualityLevels();
      const hasLevels = levels && levels.length > 0;
      if (hasLevels) {
        attachLevelsListeners(levels);
        const success = applyQuality(targetQuality);
        broadcastState(levels);
        if (success || attempts > 20) {
          if (activePollTimer !== undefined) {
            clearInterval(activePollTimer);
            activePollTimer = undefined;
          }
        }
      } else if (attempts > 60) {
        if (activePollTimer !== undefined) {
          clearInterval(activePollTimer);
          activePollTimer = undefined;
        }
      }
    }, 250);
  }

  // Listen for quality commands from PWC content script
  window.addEventListener('PWC_SET_QUALITY', (event: Event) => {
    const customEvt = event as CustomEvent<{ quality?: string }>;
    if (customEvt && customEvt.detail && customEvt.detail.quality) {
      console.log('[PWC-QUALITY] Received PWC_SET_QUALITY:', customEvt.detail.quality);
      applyQuality(customEvt.detail.quality);
    }
  });

  window.addEventListener('PWC_SET_CONSTANT_QUALITY_ENABLED', (event: Event) => {
    const customEvt = event as CustomEvent<{ enabled?: boolean }>;
    if (customEvt && customEvt.detail !== undefined) {
      isConstantQualityEnabled = !!customEvt.detail.enabled;
      console.log('[PWC-QUALITY] Constant quality enabled changed to:', isConstantQualityEnabled);
      try {
        localStorage.setItem('pwc_constant_quality', isConstantQualityEnabled ? 'true' : 'false');
      } catch (_e) {}

      if (isConstantQualityEnabled) {
        if (pwcWin.videojs) {
          seedVideoJsOptions(pwcWin.videojs);
        }
        const player = getPlayer();
        if (player) {
          hookPlayerABR(player);
        }
        startQualityEnforcementLoop();
        applyQuality(targetQuality);
      } else {
        if (activePollTimer !== undefined) {
          clearInterval(activePollTimer);
          activePollTimer = undefined;
        }
        applyQuality('auto');
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
      applyQuality(targetQuality);
    }
  }, true);

  document.addEventListener('canplay', (e: Event) => {
    if (isConstantQualityEnabled && e.target instanceof HTMLVideoElement) {
      const player = getPlayer();
      if (player) hookPlayerABR(player);
      applyQuality(targetQuality);
    }
  }, true);

  document.addEventListener('play', (e: Event) => {
    if (isConstantQualityEnabled && e.target instanceof HTMLVideoElement) {
      const player = getPlayer();
      if (player) {
        hookPlayerABR(player);
        applyQuality(targetQuality);
      }
    }
  }, true);
})();
