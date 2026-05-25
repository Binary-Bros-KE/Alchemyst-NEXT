const CONSENT_KEY = 'adult_consent_ts';
export const ADULT_CONSENT_COOKIE = 'adult_consent_ts';
const HOURS = 25;

export function isAdultConsentTimestampValid(value: string | null | undefined): boolean {
  if (!value) return false;
  const ts = Number(value);
  if (!ts) return false;
  return Date.now() - ts < HOURS * 60 * 60 * 1000;
}

export function grantAdultConsent(): void {
  try {
    if (typeof window === 'undefined') return;
    const ts = String(Date.now());
    localStorage.setItem(CONSENT_KEY, ts);
    document.cookie = `${ADULT_CONSENT_COOKIE}=${ts}; max-age=${HOURS * 60 * 60}; path=/; samesite=lax`;
  } catch {
    // ignore storage errors
  }
}

export function clearAdultConsent(): void {
  try {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(CONSENT_KEY);
    document.cookie = `${ADULT_CONSENT_COOKIE}=; max-age=0; path=/; samesite=lax`;
  } catch {
    // ignore storage errors
  }
}

export function hasAdultConsent(): boolean {
  try {
    if (typeof window === 'undefined') return false;
    const storedConsent = localStorage.getItem(CONSENT_KEY);
    if (isAdultConsentTimestampValid(storedConsent)) return true;

    const cookieConsent = document.cookie
      .split('; ')
      .find((cookie) => cookie.startsWith(`${ADULT_CONSENT_COOKIE}=`))
      ?.split('=')[1];

    return isAdultConsentTimestampValid(cookieConsent);
  } catch {
    return false;
  }
}
