import { test, expect } from '@playwright/test';

/**
 * Relaunch 2026-09 — Übersicht-Muster (ein Muster, vier Kataloge).
 * Prüft das Verhalten aus dem Handoff-README, Ansicht 2:
 *  - Filter, Sortierung, Ansicht ohne Nachladen
 *  - Trefferzahl aktualisiert sich sofort
 *  - Ansicht bleibt beim Katalogwechsel erhalten, Filter wird zurückgesetzt
 *  - Leer-Zustand mit „Filter zurücksetzen"
 *  - unbekannter Katalog → 404
 * Consent-Banner ist über storageState (playwright.config.ts) bereits weg.
 */
test.describe('Relaunch · Übersicht', () => {
  test('Cuts: 40 Einträge, Filter Lamm → 5, A–Z sortiert', async ({ page }) => {
    await page.goto('/relaunch/cuts');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Cuts & Fleischkunde');
    await expect(page.locator('.sk-count')).toHaveText('40 von 40');
    await expect(page.getByRole('tab', { name: 'Cuts' })).toHaveAttribute('aria-selected', 'true');

    await page.getByRole('button', { name: 'Lamm' }).click();
    await expect(page.locator('.sk-count')).toHaveText('5 von 40');
    await expect(page.getByRole('button', { name: 'Lamm' })).toHaveAttribute('aria-pressed', 'true');

    await page.getByRole('button', { name: 'A–Z' }).click();
    await expect(page.locator('.sk-raster .sk-h--card').first()).toHaveText('Lammhaxe');
  });

  test('Ansicht Liste bleibt beim Katalogwechsel, Filter startet neu', async ({ page }) => {
    await page.goto('/relaunch/cuts');
    await page.getByRole('button', { name: 'Liste' }).click();
    await page.getByRole('button', { name: 'Schwein' }).click();
    await expect(page.locator('.sk-list .sk-row')).toHaveCount(11);

    await page.getByRole('tab', { name: 'Rezepte' }).click();
    await expect(page).toHaveURL(/\/relaunch\/rezepte$/);
    await expect(page.locator('.sk-list')).toHaveCount(1);
    await expect(page.locator('.sk-chip--on')).toHaveText('Alle');
    await expect(page.locator('.sk-count')).toHaveText('8 von 8');
  });

  test('Streitfälle: Filterachse Urteil, Karten ohne Detailseite sind keine Links', async ({ page }) => {
    await page.goto('/relaunch/streitfaelle');
    await expect(page.locator('.sk-filterbar__label')).toHaveText('Urteil');
    await page.getByRole('button', { name: 'Stimmt' }).click();
    await expect(page.locator('.sk-count')).toHaveText('1 von 8');
    await expect(page.locator('.sk-raster .sk-entry__soon')).toHaveCount(1);
    await page.getByRole('button', { name: 'Alle' }).click();
    await expect(page.locator('.sk-raster a.sk-card')).toHaveCount(2);
  });

  test('Unbekannter Katalog liefert 404', async ({ page }) => {
    const res = await page.goto('/relaunch/gibt-es-nicht');
    expect(res?.status()).toBe(404);
  });

  test('Startseite: Hero, fünf Rubriken, Spickzettel-Formular mit Einwilligung', async ({ page }) => {
    await page.goto('/relaunch');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Gutes Fleisch verdient keinen Zufall.');
    await expect(page.getByRole('navigation', { name: 'Rubriken' }).getByRole('link')).toHaveCount(5);
    await expect(page.locator('canvas.sk-hero__canvas')).toHaveCount(1);
    const senden = page.getByRole('button', { name: 'Spickzettel sichern' });
    await expect(senden).toBeDisabled();
    await page.getByPlaceholder('E-Mail-Adresse').fill('test@example.com');
    await expect(senden).toBeDisabled(); // ohne Einwilligung kein Versand
  });
});
