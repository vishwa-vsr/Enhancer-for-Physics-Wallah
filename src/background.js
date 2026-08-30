// Background Service Worker for PW Control (Manifest V3)

const UNINSTALL_URL = 'https://docs.google.com/forms/d/e/1FAIpQLScW98YLIwoVbtv27qBN9e9ECJSoDfJfPEHHZ6EdEL_WLHqCfQ/viewform';

async function setupExtensionOnInstall() {
  try {
    // Configure uninstall survey URL
    if (typeof chrome !== 'undefined' && chrome.runtime && typeof chrome.runtime.setUninstallURL === 'function') {
      try {
        await chrome.runtime.setUninstallURL(UNINSTALL_URL);
      } catch (err) {
        console.warn('[PW Control] Warning setting uninstall URL:', err);
      }
    }

    // Initialize install date if not already recorded
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      try {
        const result = await chrome.storage.local.get('installDate');
        if (!result || !result.installDate) {
          await chrome.storage.local.set({ installDate: Date.now() });
        }
      } catch (err) {
        console.warn('[PW Control] Warning setting install date:', err);
      }
    }
  } catch (e) {
    console.warn('[PW Control] Error during install setup:', e);
  }
}

// Event-driven listener: strictly executed on install or extension update
if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onInstalled) {
  chrome.runtime.onInstalled.addListener(() => {
    setupExtensionOnInstall();
  });
}
