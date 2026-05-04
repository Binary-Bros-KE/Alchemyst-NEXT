const CONSENT_KEY = 'adult_consent_ts';
const HOURS = 25;

export function grantAdultConsent(): void {
  try {
    if (typeof window === 'undefined') return;
    localStorage.setItem(CONSENT_KEY, String(Date.now()));
  } catch {
    // ignore storage errors
  }
}

export function clearAdultConsent(): void {
  try {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(CONSENT_KEY);
  } catch {
    // ignore storage errors
  }
}

export function hasAdultConsent(): boolean {
  try {
    if (typeof window === 'undefined') return false;
    const v = localStorage.getItem(CONSENT_KEY);
    if (!v) return false;
    const ts = Number(v);
    if (!ts) return false;
    return Date.now() - ts < HOURS * 60 * 60 * 1000;
  } catch {
    return false;
  }
}
