// Background Service Worker for PW Control

const UNINSTALL_URL = 'https://docs.google.com/forms/d/e/1FAIpQLScW98YLIwoVbtv27qBN9e9ECJSoDfJfPEHHZ6EdEL_WLHqCfQ/viewform';

function setUninstallSurveyUrl() {
  if (typeof chrome !== 'undefined' && chrome.runtime && typeof chrome.runtime.setUninstallURL === 'function') {
    try {
      chrome.runtime.setUninstallURL(UNINSTALL_URL, () => {
        if (chrome.runtime.lastError) {
          console.warn('[PW Control] Failed to set uninstall URL:', chrome.runtime.lastError.message);
        }
      });
    } catch (err) {
      console.warn('[PW Control] Error setting uninstall URL:', err);
    }
  }
}

// Set upon initial install or extension update
if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onInstalled) {
  chrome.runtime.onInstalled.addListener(() => {
    setUninstallSurveyUrl();
  });
}

// Immediate execution fallback
setUninstallSurveyUrl();
