let cachedVideo: HTMLVideoElement | null = null;

export function getCachedVideo(): HTMLVideoElement | null {
  return cachedVideo;
}

export function setCachedVideo(video: HTMLVideoElement | null): void {
  cachedVideo = video;
}

// Helper to find video elements cleanly without expensive querySelectorAll('*')
export function findVideos(root: Document | ShadowRoot | Element = document): HTMLVideoElement[] {
  let videos: HTMLVideoElement[] = [];
  if (!root) return videos;
  try {
    if (root.querySelectorAll) {
      videos = Array.from(root.querySelectorAll('video'));
      // Search shadow roots only in candidate player containers if no video is found directly
      if (videos.length === 0) {
        const containers = root.querySelectorAll(
          '#video-player-container, .video-player-app, [class*="player" i]'
        );
        for (let i = 0; i < containers.length; i++) {
          const el = containers[i];
          if (el.shadowRoot) {
            videos = videos.concat(findVideos(el.shadowRoot));
          }
        }
      }
    }
  } catch (_e) {
    // Ignored: DOM access error during shadow root traversal
  }
  return videos;
}

// Helper to find the active video element (selects the video with largest display area)
export function getActiveVideo(): HTMLVideoElement | null {
  // 1. Instant return if cached video is still valid and connected to the page
  if (
    cachedVideo &&
    cachedVideo.isConnected &&
    (cachedVideo.offsetWidth > 0 ||
      cachedVideo.videoWidth > 0 ||
      document.pictureInPictureElement === cachedVideo)
  ) {
    return cachedVideo;
  }

  // 2. If a video is currently in Picture-in-Picture, it is definitely the active one!
  if (document.pictureInPictureElement && document.pictureInPictureElement instanceof HTMLVideoElement) {
    cachedVideo = document.pictureInPictureElement;
    return document.pictureInPictureElement;
  }

  const videos = findVideos(document);
  if (videos.length === 0) {
    cachedVideo = null;
    return null;
  }

  if (videos.length === 1) {
    cachedVideo = videos[0];
    return videos[0];
  }

  let mainVideo = videos[0];
  let maxArea = -1;
  for (const v of videos) {
    const rect = v.getBoundingClientRect
      ? v.getBoundingClientRect()
      : { width: v.offsetWidth, height: v.offsetHeight };
    const isVisible =
      (rect && (rect.width > 0 || rect.height > 0)) || v.offsetWidth > 0 || v.offsetHeight > 0;
    if (!isVisible) continue;

    const area =
      (rect.width || v.videoWidth || v.clientWidth || 0) *
      (rect.height || v.videoHeight || v.clientHeight || 0);
    if (area > maxArea) {
      maxArea = area;
      mainVideo = v;
    }
  }
  cachedVideo = mainVideo;
  return mainVideo;
}
