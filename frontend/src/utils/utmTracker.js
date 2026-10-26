/**
 * UTM Parameter Tracker
 * Captures campaign parameters from URL query string on load
 * and stores them in sessionStorage for regulatory compliance and audit attribution.
 */
const UTM_STORAGE_KEY = 'creditlens_utm_attribution';

export function captureUtmParameters() {
  if (typeof window === 'undefined') return null;

  try {
    const params = new URLSearchParams(window.location.search);
    const utmSource = params.get('utm_source');
    const utmMedium = params.get('utm_medium');
    const utmCampaign = params.get('utm_campaign');
    const utmTerm = params.get('utm_term');
    const utmContent = params.get('utm_content');

    if (utmSource || utmMedium || utmCampaign) {
      const attribution = {
        source: utmSource || 'direct',
        medium: utmMedium || 'none',
        campaign: utmCampaign || 'organic',
        term: utmTerm || '',
        content: utmContent || '',
        capturedAt: new Date().toISOString()
      };
      sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(attribution));
      return attribution;
    }

    const saved = sessionStorage.getItem(UTM_STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

export function getTrackedUtm() {
  if (typeof window === 'undefined') return null;
  try {
    const saved = sessionStorage.getItem(UTM_STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}
