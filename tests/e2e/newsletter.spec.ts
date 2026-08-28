import { test, expect, type Page } from '@playwright/test';

/**
 * E2E — Newsletter-Anmeldung (NewsletterSignup auf /newsletter)
 *
 * Deckt ab:
 *  - Happy Path: gültige E-Mail + DSGVO-Consent → Erfolgs-/DOI-Meldung
 *  - DSGVO-Gating: ohne Consent bleibt der Absenden-Button deaktiviert
 *  - E-Mail-Validierung: ungültige Formate deaktivieren den Button
 *
 * Design-Entscheidungen:
 *  - Der POST an /api/newsletter wird per page.route() gemockt. Dadurch ist der
 *    Test deterministisch, unabhängig vom Mail-Provider (Loops) und löst KEINE
 *    echte Bestätigungsmail aus — auch unter der Standard-Config (echter Key).
 *  - Erst-Interaktionen sind in expect(...).toPass() gewrappt: Controlled Inputs
 *    werden erst nach React-Hydration reaktiv; das retryt statt fixem Sleep und
 *    macht die Tests robust gegen Kaltstart-/Hydration-Timing.
 */

const URL = '/newsletter';
const VALID_EMAIL = 'e2e@example.com';

/**
 * mainArea statt signup fuer Zustandsmeldungen: Im Erfolgsfall ersetzt
 * NewsletterSignup die <section aria-label="Newsletter-Anmeldung"> durch ein
 * <div role="status"> ohne dieses Label. Ein an signup gehaengter Text-Locator
 * findet die Erfolgsmeldung deshalb nie.
 */

/**
 * Die Anmeldebox der SEITE.
 *
 * NewsletterSignup steht zusaetzlich im Footer (Footer.tsx) und damit auf jeder
 * Seite ein zweites Mal im DOM. Ohne diese Eingrenzung trifft jeder Locator hier
 * beide Instanzen und Playwright bricht mit einer strict mode violation ab.
 */
const mainArea = (p: Page) => p.getByRole('main');
const signup = (p: Page) => mainArea(p).getByRole('region', { name: 'Newsletter-Anmeldung' });

const emailField = (p: Page) => signup(p).getByPlaceholder('deine@email.de');
const consentBox = (p: Page) => signup(p).getByRole('checkbox');
// Beschriftung = Prop `cta` von NewsletterSignup, Default 'Spickzettel sichern'
// (NewsletterSignup.tsx). /newsletter uebergibt keinen eigenen Wert. Aendert sich
// der Default, muss dieses Regex mit — vorher stand hier noch die Beschriftung
// von vor a8a6f1f und der Button war schlicht nicht auffindbar.
const submitBtn = (p: Page) =>
  signup(p).getByRole('button', { name: /Spickzettel sichern|Sendet/ });

/** Wartet, bis die Client-Komponente hydriert ist (Button reagiert auf Eingaben). */
async function enableViaValidInput(page: Page) {
  await expect(async () => {
    await emailField(page).fill(VALID_EMAIL);
    if (!(await consentBox(page).isChecked())) await consentBox(page).check();
    await expect(submitBtn(page)).toBeEnabled({ timeout: 500 });
  }).toPass({ timeout: 15_000 });
}

test.describe('Newsletter-Anmeldung', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL, { waitUntil: 'domcontentloaded' });
    await expect(signup(page)).toBeVisible();
  });

  test('Happy Path: gültige Eingabe + Consent → Erfolgsmeldung', async ({ page }) => {
    // /api/newsletter mocken — kein echter Loops-Versand, deterministische Antwort.
    let payload: Record<string, unknown> | null = null;
    await page.route('**/api/newsletter', async (route) => {
      payload = route.request().postDataJSON();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, doi: true }),
      });
    });

    await expect(submitBtn(page)).toBeDisabled();
    await enableViaValidInput(page);

    await submitBtn(page).click();

    // Erfolgszustand (Double-Opt-in-Hinweis) erscheint
    await expect(
      mainArea(page).getByText('Fast geschafft — bitte E-Mail bestätigen.'),
    ).toBeVisible({ timeout: 10_000 });

    // Der Client hat die erwartete Nutzlast gesendet (inkl. leerem Honeypot).
    expect(payload).toMatchObject({ email: VALID_EMAIL, source: 'newsletter-page' });
    expect(payload).toHaveProperty('website', '');
  });

  test('Fehlerfall: API antwortet 429 → Fehlermeldung, kein Erfolg', async ({ page }) => {
    await page.route('**/api/newsletter', async (route) => {
      await route.fulfill({
        status: 429,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'rate limited' }),
      });
    });

    await enableViaValidInput(page);
    await submitBtn(page).click();

    // Spezifisch auf den Meldungstext prüfen (Next.js rendert einen leeren
    // role="alert"-Route-Announcer, daher getByText statt getByRole('alert')).
    await expect(mainArea(page).getByText(/Zu viele Anmeldeversuche/i)).toBeVisible();
    await expect(
      mainArea(page).getByText('Fast geschafft — bitte E-Mail bestätigen.'),
    ).toHaveCount(0);
  });

  test('DSGVO-Gating: ohne Consent bleibt der Button deaktiviert', async ({ page }) => {
    // Erst Hydration nachweisbar abwarten (gültige Mail + Consent → Button aktiv).
    // Vorher direkt zu füllen wäre ein Race: Ein Fill VOR der Hydration setzt nur
    // den DOM-Wert, nicht den React-State — der spätere Consent-Check liefe dann
    // gegen einen leeren E-Mail-State und der Button bliebe fälschlich disabled.
    await enableViaValidInput(page);

    // Consent entziehen → deaktiviert, obwohl die E-Mail gültig bleibt.
    await consentBox(page).uncheck();
    await expect(submitBtn(page)).toBeDisabled();

    // Gegenprobe: Consent wieder an → aktiv.
    await consentBox(page).check();
    await expect(submitBtn(page)).toBeEnabled();
  });

  test('E-Mail-Validierung: ungültige Formate deaktivieren den Button', async ({ page }) => {
    // Consent gesetzt lassen — so steuert allein die E-Mail-Gültigkeit den Button.
    await enableViaValidInput(page);

    for (const bad of ['keine-email', 'foo@', '@bar.de', 'foo bar@x.de', 'foo@bar']) {
      await emailField(page).fill(bad);
      await expect(submitBtn(page), `"${bad}" muss ungültig sein`).toBeDisabled();
    }

    // Wieder gültiges Format → Button aktiv.
    await emailField(page).fill('wieder@gueltig.de');
    await expect(submitBtn(page)).toBeEnabled();
  });
});
