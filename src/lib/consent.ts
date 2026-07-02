// DSGVO-Consent für einwilligungspflichtige Dienste (aktuell: Microsoft Clarity,
// Kategorie "statistics"). Plausible ist cookieless und braucht KEINE Einwilligung
// (§ 25 Abs. 2 TDDDG) → wird hier NICHT verwaltet, läuft immer.
//
// Speicherung rein lokal (localStorage), keine Server-Übertragung. Opt-in: Ohne
// aktive Zustimmung gilt "nicht erteilt", nichts wird geladen.

export interface ConsentState {
  statistics: boolean;
  ts: number;
}

const STORAGE_KEY = 'sa-consent-v1';
export const CONSENT_CHANGE_EVENT = 'sa-consent-change';
export const CONSENT_OPEN_EVENT = 'sa-consent-open';

export function getConsent(): ConsentState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ConsentState>;
    if (typeof parsed.statistics !== 'boolean') return null;
    return { statistics: parsed.statistics, ts: parsed.ts ?? 0 };
  } catch {
    return null;
  }
}

export function setConsent(statistics: boolean): void {
  if (typeof window === 'undefined') return;
  const state: ConsentState = { statistics, ts: Date.now() };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* localStorage kann blockiert sein – dann greift der Opt-in-Default (nichts laden) */
  }
  window.dispatchEvent(new CustomEvent<ConsentState>(CONSENT_CHANGE_EVENT, { detail: state }));
}

// Öffnet den Consent-Dialog erneut (Widerruf/Änderung, z. B. aus dem Footer).
export function openConsentSettings(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(CONSENT_OPEN_EVENT));
}

export function hasStatisticsConsent(): boolean {
  return getConsent()?.statistics === true;
}
