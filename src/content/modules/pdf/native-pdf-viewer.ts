import {
  PW_NATIVE_PDF_EVENT,
  PW_NATIVE_PDF_STORAGE_KEY,
  extractPdfUrlFromNotesUrl,
} from '../../../shared/pdf';
import { state } from '../../state';

export function isNativePdfViewerActive(): boolean {
  return Boolean(state.extensionEnabled && state.nativePdfViewer);
}

/**
 * Redirects away from PW's custom react-pdf viewer (/study-v2/notes?pdf=...)
 * to the raw PDF URL so the browser's built-in native PDF viewer handles it.
 */
export function redirectIfPwNotesPage(): boolean {
  if (typeof window === 'undefined' || !isNativePdfViewerActive()) {
    return false;
  }

  const targetPdfUrl = extractPdfUrlFromNotesUrl(window.location.href);
  if (!targetPdfUrl || targetPdfUrl === window.location.href) {
    return false;
  }

  window.location.replace(targetPdfUrl);
  return true;
}

/**
 * Syncs Native Browser PDF Viewer setting to localStorage and MAIN-world engine bridge,
 * and redirects immediately if currently on a PW notes viewer page.
 */
export function syncNativePdfViewer(): void {
  const enabled = isNativePdfViewerActive();

  try {
    localStorage.setItem(PW_NATIVE_PDF_STORAGE_KEY, enabled ? 'true' : 'false');
  } catch {
    // Ignored: localStorage unavailable
  }

  try {
    window.dispatchEvent(
      new CustomEvent(PW_NATIVE_PDF_EVENT, {
        detail: { enabled },
      }),
    );
  } catch {
    // Ignored
  }

  if (enabled) {
    redirectIfPwNotesPage();
  }
}
