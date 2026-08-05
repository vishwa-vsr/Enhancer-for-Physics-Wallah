(function() {
  function setPlayerQuality(targetQ) {
    if (!targetQ) return;
    var targetNum = parseInt(targetQ.toString().replace('p', '').trim(), 10);
    
    // Set localStorage quality keys
    try {
      ['pw_quality', 'pw_video_quality', 'vjs_quality', 'video_quality', 'resolution', 'preferredQuality'].forEach(function(k) {
        window.localStorage.setItem(k, targetQ === 'auto' ? 'auto' : targetNum.toString());
      });
    } catch(e) {}

    // Target VideoJS quality levels directly if available
    try {
      if (window.videojs && window.videojs.players) {
        Object.keys(window.videojs.players).forEach(function(id) {
          var p = window.videojs.players[id];
          if (p && typeof p.qualityLevels === 'function') {
            var levels = p.qualityLevels();
            if (levels && levels.length) {
              var hasMatch = false;
              for (var i = 0; i < levels.length; i++) {
                if (levels[i].height === targetNum) { hasMatch = true; break; }
              }
              for (var j = 0; j < levels.length; j++) {
                if (targetQ === 'auto' || !hasMatch) {
                  levels[j].enabled = true;
                } else {
                  levels[j].enabled = (levels[j].height === targetNum);
                }
              }
            }
          }
        });
      }
    } catch(err) {}
  }

  window.addEventListener('message', function(ev) {
    if (ev && ev.data && ev.data.type === 'PWC_SET_QUALITY') {
      setPlayerQuality(ev.data.quality);
    }
  });
})();
