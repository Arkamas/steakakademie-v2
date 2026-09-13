import { test, expect } from '@playwright/test';

/**
 * Hofladen-Radar (/hoefe) — Auftrag Uwe 13.09.2026, Konzept docs/hofladen-radar.md.
 *
 * Geprüft wird, was ohne Supabase-Env und ohne MapTiler-Key prüfbar ist:
 *  - Seite rendert, Suche schickt gegen /api/hoefe und zeigt eine Trefferzahl
 *    (0 ohne DB — die Zahl selbst ist hier nicht der Befund, der Ablauf ist es)
 *  - die URL wird teilbar (?ort=&km=)
 *  - ohne MapTiler-Key lädt KEINE Karte und es geht kein Request an api.maptiler.com
 *  - Kontext-Einstiege sitzen auf Cut-Detail, Startseite und im Footer
 *  - /api/hoefe ohne Same-Origin ist gesperrt, mit ist es offen
 * Consent-Banner ist über storageState (playwright.config.ts) bereits weg.
 */
test.describe('Hofladen-Radar', () => {
  test('Suche laeuft durch und macht die URL teilbar', async ({ page }) => {
    const fremdeRequests: string[] = [];
    page.on('request', (r) => { if (/maptiler|openstreetmap\.org\/.*tile|tile\./.test(r.url())) fremdeRequests.push(r.url()); });

    await page.goto('/hoefe');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Hofladen-Radar');

    // Geocoder-Fallback (Nominatim) kann mehrere Sekunden brauchen.
    const antwort = page.waitForResponse((r) => r.url().includes('/api/hoefe?'), { timeout: 30_000 });
    await page.getByPlaceholder(/Ort oder PLZ/).fill('Wuppertal');
    await page.getByRole('button', { name: 'Suchen' }).click();
    const res = await antwort;
    expect([200, 404]).toContain(res.status()); // 404 = Geocoder ohne Netz, 200 = Treffer (evtl. 0)

    if (res.status() === 200) {
      await expect(page.getByRole('heading', { level: 2, name: /im Umkreis von 25 km/ })).toBeVisible();
      await expect(page).toHaveURL(/\/hoefe\?.*km=25/);
      await expect(page).toHaveURL(/ort=Wuppertal/);
    } else {
      await expect(page.getByRole('alert')).toContainText('nicht gefunden');
    }
    // Keine Kachel-Requests an Dritte, solange niemand die Karte freigegeben hat.
    expect(fremdeRequests).toEqual([]);
  });

  test('Radius-Werte sind begrenzt, ?fleisch=1 wird uebernommen', async ({ page }) => {
    await page.goto('/hoefe?km=50&fleisch=1');
    await expect(page.locator('select')).toHaveValue('50');
    await expect(page.getByRole('checkbox', { name: /belegtem Fleischangebot/ })).toBeChecked();
  });

  test('Einstiege: Cut-Detail, Startseite, Footer, Relaunch', async ({ page }) => {
    await page.goto('/cuts/ribeye');
    await expect(page.getByRole('link', { name: /Hofladen-Radar öffnen/ })).toHaveAttribute('href', '/hoefe');

    await page.goto('/');
    await expect(page.getByRole('link', { name: /Hofladen-Radar.*Höfe finden/s })).toHaveAttribute('href', '/hoefe');
    await expect(page.locator('footer').getByRole('link', { name: 'Hofladen-Radar' })).toHaveAttribute('href', '/hoefe');

    await page.goto('/relaunch');
    await expect(page.getByRole('link', { name: /Hofladen-Radar/ }).first()).toHaveAttribute('href', '/hoefe');
  });

  test('/api/hoefe verlangt Same-Origin', async ({ request, baseURL }) => {
    const fremd = await request.get(`${baseURL}/api/hoefe?lat=51.27&lng=7.19`, { headers: { 'Sec-Fetch-Site': 'cross-site' } });
    expect(fremd.status()).toBe(403);
    const eigen = await request.get(`${baseURL}/api/hoefe?lat=51.27&lng=7.19&km=999`, { headers: { 'Sec-Fetch-Site': 'same-origin' } });
    expect(eigen.status()).toBe(200);
    const json = await eigen.json();
    expect(json.km).toBe(100); // geklemmt
    expect(Array.isArray(json.treffer)).toBe(true);
  });

  test('Unbekannter Hof ist 404', async ({ page }) => {
    const res = await page.goto('/hoefe/diesen-hof-gibt-es-nicht-0');
    expect(res?.status()).toBe(404);
  });
});
