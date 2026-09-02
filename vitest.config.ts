import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    environment: 'node',
    // scripts/ ist mit drin, seit die Ops-Hook-Eskalation testbare Logik hat
    // (02.09.2026). Ohne diese Zeile laeuft scripts/*.test.mjs nicht mit.
    include:     ['src/**/*.test.ts', 'scripts/**/*.test.mjs'],
  },
});
