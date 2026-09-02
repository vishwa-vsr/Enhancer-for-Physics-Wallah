import { state } from '../../state';
import { getActiveVideo } from '../video/detector';
import {
  findSettingsButton,
  findFullscreenButton,
  getToolbarContainer,
} from '../distractions/elements';

let lastCollapsedTime = 0;

// Inject and manage the arrow hide button inside the controls bar
export function injectInstantHideButton(): void {
  const video = getActiveVideo();
  if (!video) return;

  const exactBtn = document.getElementById('pwc-instant-hide-btn');

  // If disabled, remove the button if it exists
  if (!state.extensionEnabled || !state.enableInstantHide) {
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
  let fallbackControlBar: Element | null = null;
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
      const revealControls = () => {
        // Ignore movements within 400ms of clicking to avoid micro-movements cancelling focus mode
        if (Date.now() - lastCollapsedTime < 400) {
          return;
        }
        if (document.documentElement.classList.contains('pwc-collapsed-state')) {
          document.documentElement.classList.remove('pwc-collapsed-state');
        }
        document.removeEventListener('mousemove', revealControls);
        document.removeEventListener('touchstart', revealControls);
      };

      document.addEventListener('mousemove', revealControls);
      document.addEventListener('touchstart', revealControls);
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
