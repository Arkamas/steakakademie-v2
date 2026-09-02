import type { Page } from '@playwright/test';

/**
 * Consent-Banner in E2E-Tests
 * ===========================
 * Befund (Uwe, 02.09.2026): Ein Hover-Test lief in einen Timeout, weil das
 * DSGVO-Banner (fixed, unten) die Zielkarte ueberdeckte — nicht, weil etwas
 * kaputt war. Wer eine Ueberdeckung fuer eine Regression haelt, sucht am
 * falschen Ende.
 *
 * Deshalb startet JEDER Test mit bereits getroffener Consent-Entscheidung
 * ("abgelehnt": nichts Einwilligungspflichtiges laedt, Banner bleibt zu) —
 * siehe `use.storageState` in playwright.config.ts, das die Datei
 * tests/e2e/fixtures/consent-declined.storage.json einspielt. Der Schluessel
 * entspricht STORAGE_KEY in src/lib/consent.ts.
 *
 * Tests, die den Banner selbst pruefen wollen, heben das gezielt auf:
 *   test.use({ storageState: { cookies: [], origins: [] } });
 * und schliessen ihn danach mit `dismissConsent(page)`.
 */
export async function dismissConsent(page: Page, choice: 'accept' | 'decline' = 'decline') {
  const banner = page.getByRole('dialog', { name: 'Datenschutz-Einstellungen' });
  if (!(await banner.isVisible().catch(() => false))) return;
  const label = choice === 'accept' ? /Alles akzeptieren/i : /Ablehnen/i;
  await banner.getByRole('button', { name: label }).click();
  await banner.waitFor({ state: 'hidden' });
}

/** Consent-Zustand direkt setzen (vor page.goto), falls kein storageState greift. */
export async function presetConsent(page: Page, statistics = false) {
  await page.addInitScript((value) => {
    try {
      window.localStorage.setItem('sa-consent-v1', JSON.stringify({ statistics: value, ts: 0 }));
    } catch {
      /* localStorage blockiert → Banner erscheint, Test muss dismissConsent nutzen */
    }
  }, statistics);
}
