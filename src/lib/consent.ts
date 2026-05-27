/**
 * Cookie-Consent-Verwaltung
 * TTDSG §25 + DSGVO Art. 6 Abs. 1 lit. a
 *
 * Speicherung: localStorage 'sa_consent_v1'
 * Kein Cookie — localStorage ist kein "Setzen eines Cookies" i.S.d. TTDSG §25
 * (technisch notwendige Speicherung zur Verwaltung der Einwilligung)
 */

export const CONSENT_KEY = 'sa_consent_v1';
export const CONSENT_VERSION = 1;

export interface ConsentState {
  analytics: boolean;   // GA4 + Microsoft Clarity
  version: number;
  timestamp: string;
}

/** Gibt den gespeicherten Consent zurück — null wenn noch keine Entscheidung */
export function getConsent(): ConsentState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ConsentState;
    if (parsed.version !== CONSENT_VERSION) return null; // Neue Version → neu fragen
    return parsed;
  } catch {
    return null;
  }
}

/** Speichert den Consent */
export function setConsent(analytics: boolean): ConsentState {
  const state: ConsentState = {
    analytics,
    version: CONSENT_VERSION,
    timestamp: new Date().toISOString(),
  };
  if (typeof window !== 'undefined') {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(state));
  }
  return state;
}

/** Löscht den gespeicherten Consent (z.B. für "Einwilligung widerrufen") */
export function revokeConsent(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(CONSENT_KEY);
  }
}

/** Hat der User Analytics-Tracking zugestimmt? */
export function hasAnalyticsConsent(): boolean {
  const c = getConsent();
  return c?.analytics === true;
}
