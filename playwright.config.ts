import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E Config — Steakakademie
 * Default: lokaler Dev-Server, chromium-only, sequenziell.
 */
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  expect: { timeout: 5_000 },

  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list']],

  use: {
    baseURL: 'http://localhost:3000',
    // Consent-Banner vorab entschieden (abgelehnt): Sonst ueberdeckt das fixed
    // positionierte Banner untere Seitenbereiche, Hover/Click laufen in Timeouts
    // und sehen aus wie Regressionen (Befund 02.09.2026). Details und Ausnahme
    // fuer Banner-Tests: tests/e2e/helpers/consent.ts
    storageState: 'tests/e2e/fixtures/consent-declined.storage.json',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
    actionTimeout: 5_000,
    navigationTimeout: 15_000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    // Kaltstart nach sauberem Build (ohne .next-Cache) braucht deutlich laenger als 2 min.
    timeout: 300_000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
});
