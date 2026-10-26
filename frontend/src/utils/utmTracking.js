/**
 * UTM Parameter Tracking Utility
 * Captures campaign attribution parameters from URL on entry
 * and stores them in sessionStorage for regulatory compliance and audit attribution.
 */

const UTM_STORAGE_KEY = 'creditlens_utm_params';

export function captureUtmParameters() {
  if (typeof window === 'undefined') return null;

  try {
    const params = new URLSearchParams(window.location.search);
    const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
    const captured = {};
    let hasUtm = false;

    utmKeys.forEach((key) => {
      const val = params.get(key);
      if (val) {
        captured[key] = val;
        hasUtm = true;
      }
    });

    if (hasUtm) {
      const record = {
        ...captured,
        capturedAt: new Date().toISOString(),
      };
      sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(record));
      return record;
    }

    const existing = sessionStorage.getItem(UTM_STORAGE_KEY);
    return existing ? JSON.parse(existing) : null;
  } catch (e) {
    console.warn('Failed to parse UTM parameters:', e);
    return null;
  }
}

export function getCapturedUtm() {
  if (typeof window === 'undefined') return null;
  try {
    const existing = sessionStorage.getItem(UTM_STORAGE_KEY);
    return existing ? JSON.parse(existing) : null;
  } catch {
    return null;
  }
}
