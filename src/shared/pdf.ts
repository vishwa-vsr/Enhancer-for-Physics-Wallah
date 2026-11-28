export const PW_NATIVE_PDF_STORAGE_KEY = 'pwc_native_pdf_viewer';
export const PW_NATIVE_PDF_EVENT = 'PWC_SET_NATIVE_PDF_VIEWER';

const NOTES_VIEWER_PATHS = new Set(['/study-v2/notes', '/study/notes', '/notes']);

export function isPwNotesViewerPath(pathname: string): boolean {
  const normalized = pathname.replace(/\/+$/, '').toLowerCase();
  return NOTES_VIEWER_PATHS.has(normalized);
}

function parseHttpUrl(candidate: string): string | null {
  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null;
    }
    if (isPwNotesViewerPath(parsed.pathname)) {
      return null;
    }
    return parsed.href;
  } catch {
    return null;
  }
}

/**
 * Decodes PW's `pdf` query parameter (either base64-encoded or URI-encoded http/https URL).
 */
export function decodePdfParamValue(rawPdf: string | null | undefined): string | null {
  if (!rawPdf) return null;
  const trimmed = rawPdf.trim();
  if (!trimmed) return null;

  // PW supports base64-encoded URLs in ?pdf=
  if (/^[A-Za-z0-9+/=]+$/.test(trimmed)) {
    try {
      const decoded = atob(trimmed).trim();
      const validDecoded = parseHttpUrl(decoded);
      if (validDecoded) {
        return validDecoded;
      }
    } catch {
      // Fall through to plain/URI-decoded URL handling
    }
  }

  const direct = parseHttpUrl(trimmed);
  if (direct) return direct;

  try {
    const uriDecoded = decodeURIComponent(trimmed).trim();
    return parseHttpUrl(uriDecoded);
  } catch {
    return null;
  }
}

/**
 * Extracts the underlying direct PDF URL when given a PW notes viewer URL.
 */
export function extractPdfUrlFromNotesUrl(
  rawUrl: string | URL,
  baseOrigin?: string,
): string | null {
  try {
    const parsed =
      rawUrl instanceof URL ? rawUrl : new URL(String(rawUrl), baseOrigin || 'https://www.pw.live');
    if (!isPwNotesViewerPath(parsed.pathname)) {
      return null;
    }
    return decodePdfParamValue(parsed.searchParams.get('pdf'));
  } catch {
    return null;
  }
}

/**
 * Checks whether a fetch/resource URL points directly to a PDF asset (used for contentId fallback).
 */
export function isDirectPdfAssetUrl(rawUrl: string, baseOrigin?: string): string | null {
  try {
    const parsed = new URL(rawUrl, baseOrigin || 'https://www.pw.live');
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null;
    }
    if (!parsed.pathname.toLowerCase().endsWith('.pdf')) {
      return null;
    }
    return parsed.href;
  } catch {
    return null;
  }
}
