# Performance-Audit Gesamtsystem — 02.09.2026

**Auftrag (Uwe):** Gesamtes Audit, autonom, Ziel: bestmögliche Performance des
Gesamtsystems; Datenreste/Datenmüll automatisiert löschen.
**Umfang:** Frontend-Bundle, Bilder, Caching, Fonts, Build-Pipeline, Datenbank,
Tests, Repo-Hygiene, lokale Arbeitskopie.
**Branch:** `perf/audit-2026-09-02`

---

## 1. Ausgangslage (gemessen, Produktion, vor den Änderungen)

| Messung | Wert |
|---|---|
| Startseite, JS komprimiert (ohne Polyfills) | **~405 kB** in 20 Chunks |
| davon Sentry-Browser-SDK | 108 kB |
| davon supabase-js (nur für „Anmelden/Mein Konto" im Header) | 63 kB |
| davon framer-motion (voller `motion`-Import) | 55 kB |
| davon react-markdown + remark-gfm (Rezept-Schmiede-Antwort) | 46 kB |
| Next „First Load JS" `/` | 344 kB |
| Lighthouse mobil (`/`) | **73** · LCP 4,5 s · TBT 400 ms |
| Lighthouse desktop (`/`) | 98 |
| `hero-thermometer.png` / `hero-ribeye.png` | 9,9 MB / 8,9 MB (2752 px PNG-Fotos) |
| `/_next/image`-Antworten | `max-age=0, must-revalidate`, Vercel-Cache MISS |
| `/favicon.ico`, `/apple-touch-icon.png` | 404 (jeder Browser fragt sie an → 404-Route läuft als Function) |
| `npm run build` | rief `scripts/seo-image-optimizer.mjs` (Claude-API) bei jedem Vercel-Build |
| Datenbank | 24 RLS-Policies mit `auth.uid()` ohne InitPlan, 6 FKs ohne Index, 1 doppelter Index |
| Lokale Arbeitskopie | 94 MB `_to_delete/`, 12 MB `test-results/`, `C:\Dev\null` (72 kB HTML-Dump) |
| Repo | 12 MB verworfene KI-Cut-Bilder (`training/cut-review`) + AGB-PDF getrackt |

## 2. Umgesetzt

### 2.1 JavaScript-Bundle (−52 % auf der Startseite)

| Maßnahme | Datei(en) | Effekt |
|---|---|---|
| framer-motion auf `LazyMotion` + `domAnimation` + `m` (strict) — alle 22 Dateien `import { m as motion }` | `MotionProvider.tsx`, 21 Komponenten | 55 → 20 kB |
| Sentry: Replay-Code + Debug-Statements weggeworfen (`bundleSizeOptimizations`), Browser-Tracing nur im Client via `__SENTRY_TRACING__=false` entfernt — Server-Tracing (Agent-Monitoring) unberührt | `next.config.mjs`, `sentry.client.config.ts` | 108 → 63 kB |
| Marco-Chat + Exit-Intent per `next/dynamic` in eigene Chunks, gemountet erst nach Idle/erster Interaktion | `LayoutExtras.tsx`, `DeferredMount.tsx`, `layout.tsx` | ai/react + Chat-UI raus aus dem kritischen Pfad |
| supabase-js im Header nur laden, wenn ein `sb-*-auth-token`-Cookie existiert (sonst ist niemand eingeloggt) | `AccountLink.tsx` | 63 kB → 0 für anonyme Besucher |
| react-markdown erst laden, wenn eine Rezept-Schmiede-Antwort da ist | `LazyMarkdown.tsx`, `ToolBoxes.tsx` | 46 kB raus aus `/` |

Ergebnis Build: **First Load JS `/` 344 → 173 kB**, shared 162 → 120 kB.
Lokal (Lighthouse mobil, `next start`): TBT 400 → 170 ms, LCP-„Load Delay" 1,2 s → 0, Render Delay 530 → 70 ms.

### 2.2 Bilder (−24 MB im Repo, schnellere Optimierung)

- 7 PNG-Fotos → JPEG (q82, mozjpeg, progressiv), Hero-Motive auf 1920 px begrenzt:
  `hero-thermometer` 9,9 MB → 206 kB, `hero-ribeye` 8,9 MB → 178 kB, `tomahawk-hero`, `uwe-yendell`,
  `methode-kamado`, `methode-smoker`, `articles/pellet-grills-usa-2026`. Alle Referenzen
  (MDX-Frontmatter, `startseiten-artikel.ts`, `bildregister.yaml`, `bild-helligkeit.json`, Autoren, OG) umgestellt.
- 5 tote Dateien gelöscht (byte-identische Dubletten bzw. unreferenziert): zwei `Firefly_*.png`,
  `Medaillen Final.png`, `image.png`, `diplome/medals-hero.png` (v2 ist live). Register bereinigt.
- Marco-Avatar: 128-px-WebP-Ableitungen statt 2×512-px-JPEG auf jeder Seite; `<img>` mit width/height.
- `ArticleCard`: `sizes` für alle vier Varianten (vorher lud jede Grid-Karte das 1200-px-Derivat).
- Logo im Header ohne `priority` (konkurrierte mit dem Hero um das Preload).
- `favicon.ico` (ICO mit 32/48-px-PNG) + `apple-icon.png` aus `icon.svg` erzeugt → keine 404-Functions mehr.

### 2.3 Caching

- `images.minimumCacheTTL: 86400` (Standard 60 s).
- Header `/(images|videos)/*`: `public, max-age=86400, stale-while-revalidate=604800`.
  Austausch unter gleichem Dateinamen wird spätestens nach 24 h sichtbar.

### 2.4 Fonts

Playfair 6 → 4 Gewichte (500/800 nirgends verwendet), Source Serif 4 → 2 (500/600 nirgends verwendet).
DM Sans unverändert (alle 4 in Gebrauch). Nachweis: grep über `src`, `tailwind.config.js`, `globals.css`.

### 2.5 Build-Pipeline

- `"build": "next build"` — der Claude-API-Aufruf (`seo-image-optimizer`) läuft nicht mehr bei jedem
  Vercel-Build (Determinismus, Kosten, Ausfallrisiko). Manuell weiter über `npm run seo-images`.
- Next.js 14.2.29 → **14.2.35** (letzter 14.x-Patch; memory: 14.x EOL dort), `eslint-config-next` gleich.

### 2.6 Datenbank (Migration liegt bereit, **nicht angewendet** — siehe 4.)

`supabase/migrations/20260902160000_perf_rls_initplan_fk_indizes.sql`:
24 Policies auf `(select auth.uid())`/`(select auth.role())` (InitPlan statt per Zeile),
6 FK-Indizes, doppelter Index `ds_orders_email_idx` entfernt. Semantik unverändert.
HNSW-Indizes bewusst nicht angefasst (Advisor „unused" ist ein Schnappschuss seit Stats-Reset).

### 2.7 Tests

- **Nebenbefund Uwe (Consent-Banner überdeckt Ziel → Timeout, keine Regression) reproduziert**
  und dauerhaft gelöst: `playwright.config.ts` startet jeden Test mit `storageState`
  `tests/e2e/fixtures/consent-declined.storage.json` (Banner geschlossen, nichts Einwilligungspflichtiges lädt).
  Helper `tests/e2e/helpers/consent.ts` (`dismissConsent`, `presetConsent`) für Tests, die den Banner selbst prüfen.
- E2E 24/24 grün gegen Produktions-Build, Vitest 86/86, `tsc` 0 Fehler, `next lint` 0, `npm run check` grün, Legal-Guard grün.

### 2.8 Aufräumen

- Lokal gelöscht: `_to_delete/` (94 MB CI-Snapshots + Git-Lock-Müll), `test-results/` (12 MB),
  `.git/_to_delete/`, `tsconfig.check.tmp.tsbuildinfo`, `C:\Dev\null` (versehentlicher HTML-Dump).
- Aus dem Git-Index genommen (Dateien bleiben lokal): `training/cut-review/` (59 verworfene KI-Bilder, 12 MB,
  ungeklärte Herkunft in einem öffentlichen Repo) und `Steakakademie-AGB.pdf` (Tippfehler `*.pd` in `.gitignore`).
- **Nicht gelöscht:** `graphify-out/` (36 MB, ignoriert, regenerierbar), `docs/cut-atlas/werkstatt/` (Arbeitsmaterial),
  `onedrive-rescue-2026-08-19` (Rettungskopie — Entscheidung Uwe). Produktiv-Datenzeilen (Kontaktanfragen,
  Bestellungen) wurden bewusst nicht angefasst; Lesen personenbezogener Zeilen war zudem gesperrt.

## 3. Nicht geprüft / Grenzen

- **Kein Vercel-Preview-Deploy** und **kein Push** aus dieser Session (keine GitHub-Credentials in der Sandbox).
  Build, Typecheck, Lint, Unit- und E2E-Tests liefen in einer Linux-Kopie (`/tmp`, eigenes `npm ci`).
- Lighthouse „nachher" lief gegen `next start` lokal, nicht gegen Vercel — LCP dort durch die lokale
  Bildoptimierung verzerrt; belastbar sind TBT, Bytes, Load/Render-Delay. Die Produktionszahl kommt nach dem Deploy.
- Die DB-Migration wurde vom Auto-Mode-Classifier blockiert (DDL auf Produktion) — `supabase db push` durch Uwe.

## 4. Nächste Schritte (Uwe, in dieser Reihenfolge)

1. `git push -u origin perf/audit-2026-09-02` → Preview prüfen (Startseite, Marco-Chat öffnen, Mobile-Menü, Rezept-Schmiede).
2. Lighthouse mobil auf dem Preview (Erwartung: LCP ≈ 2,5–3 s, TBT < 200 ms, Score > 85).
3. PR nach main. Nach dem Merge: `supabase db push` (Migration 20260902160000).
4. Optional, nächste Stufe: Sentry-Client lazy (nach Idle) laden → weitere ~60 kB; Font-Preload auf zwei Familien begrenzen.

## 5. Erkenntnis für CLAUDE.md

Eine Linux-Session **kann** bauen und typechecken — nur nicht im Windows-Arbeitsbaum. Rezept:
`git archive HEAD | tar -x -C /tmp/repo && cd /tmp/repo && npm ci && npx next build` (2 CPU: Build 2:23 min, tsc 26 s).
Playwright-Chromium braucht zusätzlich `libXdamage.so.1` (ohne root: `apt-get download libxdamage1`, `dpkg-deb -x`, `LD_LIBRARY_PATH`).
