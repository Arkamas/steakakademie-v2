# Architektur-Audit Steakakademie — 27.08.2026

Grundlage: Repo `C:\Dev\steakakademie-v2` @ `6d35a11` (main), Supabase-Projekt `bbgdrzhlellxzggbbqcm`, Security-Advisor-Lauf 27.08. 16:37 UTC. Alle Befunde sind im Code verifiziert (Datei:Zeile angegeben), keine Vermutungen.

Kennzahlen: 304 Dateien in `src/`, 66 Client-Komponenten, 27 API-Routen, 53 Skripte, 46 Doku-Dateien, 29 Migrationen, 51 verschiedene `process.env.*`, 11 Contentlayer-Typen, 391 MDX-Dateien, 5 Testdateien.

---

## 1. Root-Cause-Analyse der Loops

Die Loops haben **drei Ursachenklassen**, in dieser Reihenfolge nach Wirkung:

### 1.1 Die Agenten-Umgebung selbst erzeugt Schleifen (Hauptursache)

**A) PreToolUse-Hook blockiert Read/Grep/Glob/Bash** — `.claude/settings.json` + `.claude/hooks/graphify-guard.sh`
Jeder Read/Grep/Glob/Bash-Aufruf wird an `graphify hook-guard` durchgereicht, „damit Claude Code vor Grep/Read zuerst den Wissensgraphen befragt". Ist graphify installiert (Ordner `graphify-out/` und `settings.json.graphify-bak` belegen das), kann der Hook Tool-Aufrufe **ablehnen**. Der Agent reagiert auf Ablehnung mit erneutem Versuch oder Umweg → identisches Muster → Ablehnung. Das ist ein klassischer Hook-Loop: Der Agent kann seine Grundwerkzeuge nicht verlässlich benutzen. Zusätzlich veraltet `graphify-out/` gegenüber dem Code — der Graph liefert falsche Antworten, der Agent „korrigiert" existierenden Code auf Basis alter Strukturen.

**B) Stop-Hook macht Git-Commits** — `scripts/wip-autosave.mjs` bei jedem `Stop`
Jeder Turn-Abschluss committet auf `wip/auto` (heute allein 2× binnen 18 Min). Läuft parallel eine Cowork-Session auf demselben Repo (Mount), entstehen die dokumentierten `index.lock`-Kollisionen (siehe Projektgedächtnis „Sandbox-Git-Fallen"). Eine Session sieht gesperrte Indizes, die andere stale Dateien → beide „reparieren" → Zirkel. `main..wip/auto` liegt bereits 6 Commits auseinander: zwei divergierende Wahrheiten.

**C) Zwei konkurrierende CLAUDE.md** 
- Repo: `CLAUDE.md` (19 KB, „Operating-Anker", Abschnitt 1 explizit „Stand 04.06.2026")
- Cowork-Projekt: `…\Projects\Steakakademie\CLAUDE.md` (91 KB, 993 Zeilen, „Projektplan")
Beide behaupten „Single Source für Claude". Dazu `STATUS.md`, `ROADMAP.md`, `memory.md`, 46 Dateien in `docs/` (zusammen 5.173 Zeilen Prosa) plus Projektgedächtnis plus Jira. Wenn Regel und Realität sich widersprechen (z. B. Deploy = Netlify laut alter Doku, Vercel laut Repo — `netlify.toml` liegt noch im Root), oszilliert der Agent zwischen zwei „richtigen" Zuständen. Commit `6d35a11` („Stichtags-Meldung hat eine Session in die Irre geführt") ist der schriftliche Beleg, dass Doku-Texte bereits Sessions fehlgeleitet haben.

**D) Build-Gates, die den Build brechen** — `prebuild`, `build`, `postbuild` in `package.json`
Sieben Gate-Skripte mit `process.exit(1)` laufen vor/nach jedem Build (Startseiten-Hierarchie, Redaktionsvorbehalt, Frontmatter, Links, seit `d4d5457` bricht ein toter Link den Build). Der Agent ändert Code → Gate bricht wegen eines *inhaltlichen* Befunds → Agent „fixt" Inhalt → anderes Gate bricht. Vier rote Vercel-Builds am 27.08. (Projektgedächtnis) sind genau dieses Muster. Gates sind richtig, gehören aber in CI/Pre-Commit, nicht in den Vercel-Build-Pfad.

### 1.2 Next.js-14-Architekturfehler (Reibungspunkte im Stack)

**E) Client-Component importiert Server-Datenquelle** — `src/app/diplome/roadmap/page.tsx:1,6`
`'use client'` + `import { allDiplomLektions } from 'contentlayer/generated'`. Damit wandern alle 35 Lektionen (inkl. MDX-Body, Paywall-Inhalte Stufe 2–5!) in das Client-Bundle. Zusätzlich importiert die Seite `Header`/`Footer` selbst statt über Layout, Zeile 682 hat einen `useEffect` mit Dependency auf einen abgeleiteten State (`prog.progress.streak_count`) — Kandidat für Render-Schleifen.

**F) Kein Layer zwischen Route und Datenbank**
44 Dateien rufen `createClient(...)` direkt auf; Pages, API-Routen und Client-Komponenten sprechen alle selbst mit Supabase. 16 Dateien nutzen den **Service-Role-Key**, darunter eine Page (`src/app/gutschein/[code]/page.tsx`) und zwei Libs (`voyage-retrieval.ts`, `publisherAgent.ts`). Es gibt keine Stelle, an der ein Agent „die eine richtige Art, Daten zu holen" nachschlagen kann → jede Generierung erfindet eine neue.

**G) Zwei Auth-Systeme** 
Supabase Auth (`getUser()` in 16 Dateien) **und** ein Klartext-Cookie `admin_auth === process.env.ADMIN_PASSWORD` (Middleware Z. 59/72, 6 Dateien). Zwei Identitätsmodelle, zwei Guard-Muster, zwei Redirect-Ziele. Zusätzlich: Middleware-Schutzliste enthält `/profil`, die Nutzerseite liegt aber unter `/diplome/profil` **und** es existiert ein zweites `src/app/profil/` (Client-Formular). Ebenso `steuer-matrix/` und `steuer-matrix-live/` doppelt.

**H) Runtime-Mix ohne Regel**
`api/chat` läuft auf `edge`, 14 Routen auf `nodejs`, 8 Routen ohne Angabe. Supabase-SSR-Client + Edge ist eine bekannte Fehlerquelle; Agenten kopieren beim Anlegen neuer Routen wahllos eines der drei Muster.

**I) Doppelte Header-Konfiguration** — `next.config.mjs` (CSP + 6 Header) **und** `vercel.json` (3 davon nochmal). Bei Änderungen wird eine Stelle vergessen; CSP steht nur in einer.

### 1.3 Race-Conditions und ungeschützte Kostenpfade

**J) Öffentliche KI-Endpunkte ohne Guard/Rate-Limit** (0 Treffer für Auth/Limit): `api/chat` (Anthropic, edge), `api/kochwissen/generieren` (Anthropic + Voyage + Service-Role-Admin-Client), `api/niche-validator/analyze`, `api/foodpairing`. Jeder Bot kann Kosten erzeugen. Gleichzeitig ist der Sandbox-Allowlist-Eintrag `api.voyageai.com` in `settings.json` — Embedding-Aufrufe laufen auch aus Agenten-Sessions.

**K) Webhook ohne Signatur** — `api/webhooks/digistore24`: Secret nur als URL-Parameter, kein HMAC, keine Idempotenz-Prüfung sichtbar → doppelte Zustellung = doppelte Credits/Entitlements.

**L) Build-Zeit-Content-Generierung** — `recipe-agent.mjs` schreibt bei `dev:full`/`build:with-agents` MDX während des Builds nach `content/rezepte/`. Nicht-deterministische Builds; Contentlayer-Cache und Git-Stand driften.

---

## 2. Konsistenz- und Architektur-Check

### 2.1 Next.js App Router ↔ Supabase ↔ Vercel/Cloudflare

| Kopplung | Befund | Bewertung |
|---|---|---|
| Next ↔ Supabase | `@supabase/ssr` 0.10 korrekt mit `getAll/setAll` (`lib/supabase/server.ts`); Middleware refresht Session. **Aber:** kein Repository-Layer, Service-Role in Pages, RLS teils ohne Policy (`knowledge_embeddings`) | Grundlage OK, Nutzung inkonsistent |
| Next ↔ Vercel | `vercel.json` + `next.config.mjs` doppelt; `netlify.toml` Karteileiche; `maxDuration: 30` global für `api/**` (Anthropic-Streams brauchen ggf. mehr, Nodes-Routen ohne Stream weniger) | Aufräumbedarf |
| Cloudflare | Im Repo nur R2-Migrationsskript (`migrate-to-r2.mjs`), `remotePatterns` erlaubt `**.steakakademie.de` + `images.unsplash.com`. Rolle von Cloudflare (DNS? Proxy? R2 live?) ist nirgends als Architekturentscheidung dokumentiert | Ungeklärte Zuständigkeit |
| Contentlayer2 | 11 Typen, 391 MDX — **die eigentliche Content-DB** ist das Dateisystem, Supabase hält nur User-/Transaktionsdaten + Embeddings. Das ist richtig und stabil (statisch, 497 Seiten SSG). Bruch nur in E (Client-Import). | Sauber, wenn Regel eingehalten |

**Bottleneck 1 — Monolith mit drei Geschäftsfeldern:** Unter `src/app/` liegen neben der Steakakademie (GF1) `agentur-killer-sprint`, `erste-kunden-sprint`, `gruender-schmiede`, `seo-sprint`, `eu-steuervergleich`, `steuer-matrix(-live)`, `zzp-niche`, `ehrliches-system`, `mein-system`. `src/services/` enthält 12 Länder-Steuer-Evaluatoren (`atEvaluator` … `ptEvaluator`), `taxCalculator`, `euSeoContentGenerator`. Das ist GF2/GF3-Code (laut Mandat „RADAR/ZUKUNFT") im GF1-Deploy. Jede Regel in CLAUDE.md, jedes Build-Gate, jede CSP muss für beides gelten → Widersprüche sind strukturell garantiert, und Agenten lesen beim Kontextaufbau doppelt so viel irrelevanten Code.

**Bottleneck 2 — Skript-Universum:** 53 Skripte in `scripts/` (Recipe-Agent, Glossary-Agent, Cron-Scout, Kochwissen-Ingest, Video/OpenMontage, Cut-Images, PM-Context, Cache-Selftest …) mit eigenen Anthropic-Clients, eigenen Modell-IDs, eigenem Env-Handling. Zehn verschiedene Modell-Strings im Repo (`claude-haiku-4-5-20251001` 12×, `claude-sonnet-4-6` 7×, `claude-sonnet-4-5` 6×, `claude-opus-4-7` 4×, `claude-opus-5` 3×, `claude-sonnet-5` 1× …). Ein Modellwechsel bedeutet 40+ Editstellen.

### 2.2 KI-Integrationen (Anthropic, Voyage) — Trennung vom Backend

**Nein, nicht sauber getrennt.** Konkret:

- **Zwei Anthropic-SDKs parallel:** `@anthropic-ai/sdk` (raw) **und** `@ai-sdk/anthropic` + `ai` (Vercel AI SDK). `api/chat` + `MarcoWidget` nutzen AI-SDK, 7 andere Routen + Skripte das Raw-SDK. Zwei Fehlerbilder, zwei Streaming-Modelle, zwei Prompt-Konventionen.
- **Vier Voyage-Implementierungen:** `src/lib/voyage/client.ts`, `src/lib/voyage-retrieval.ts`, `src/lib/kochwissen/voyage.ts`, `src/lib/kochwissen/retrieval.ts` + drei Skripte (`generate-embeddings.js`, `kochwissen-ingest.mjs`, `kochwissen-reembed.mjs`). Welche ist kanonisch? Ein Agent wählt zufällig.
- **KI-Logik in Routen-Handlern:** Prompting, Retrieval, DB-Schreiben und HTTP-Handling stehen in denselben `route.ts`-Dateien (z. B. `kochwissen/generieren`). Nicht testbar, nicht wiederverwendbar für Skripte → deshalb existiert die Logik in Skripten *nochmal*.
- **`pgvector` in `public`** (Advisor WARN), `knowledge_embeddings` mit RLS aber ohne Policy (INFO) — funktioniert nur, weil alles über Service-Role läuft, was wiederum J verschärft.

### 2.3 Supabase-Advisor (27.08.)

- ERROR: Views `aroma_ingredient_ohne_hub`, `streitfall_ergebnis` sind `SECURITY DEFINER` → umgehen RLS.
- WARN: Extension `vector` in `public`; Leaked-Password-Protection aus.
- INFO: `knowledge_embeddings` RLS ohne Policy.

---

## 3. Actionable Fixes (priorisiert) + 5 eiserne Regeln

### 3.1 Prioritätenliste

**P0 — sofort, stoppt die Loops (Aufwand: < 1 Tag)**

1. **PreToolUse-Hook entfernen.** `graphify`-Hooks aus `.claude/settings.json` streichen (Read/Grep/Glob/Bash dürfen nie durch ein Gate). Graphify bleibt als manuelles Werkzeug (`graphify-out/` in `.gitignore`).
2. **Stop-Hook entschärfen.** `wip-autosave` nicht bei `Stop`, sondern als manuelles `npm run wip` oder nur wenn keine `.git/index.lock` existiert; `wip/auto` nach Sicherung löschen. Regel: nur *eine* Session schreibt ins Repo.
3. **Eine CLAUDE.md.** Repo-`CLAUDE.md` = einzige technische Wahrheit, ≤ 300 Zeilen, nur Regeln + Verweise. Die 91-KB-Projektdatei wird auf Strategie/Marke reduziert und enthält **keine** technischen Aussagen mehr (Deploy, Pfade, Stack). Abschnitt „Harte Realität Stand 04.06." löschen; Status lebt in Jira/STATUS.md. `netlify.toml`, `memory.md`, `*.patch` im Root, `tsconfig.homeb.tsbuildinfo` entfernen.
4. **Gates aus dem Vercel-Build ziehen.** `prebuild`/`postbuild` → `npm run check` (lokal + GitHub Action als Required Check). Vercel baut nur `next build && next-sitemap`. Damit ist ein roter Vercel-Build wieder ein *Code*-Fehler, kein Inhaltsbefund.

**P1 — diese Woche (Sicherheit + Kosten)**

5. `diplome/roadmap/page.tsx`: Server-Component-Page, Lektionsliste serverseitig auf `{slug,title,stufe}` reduzieren, Client-Teil in `RoadmapClient.tsx`. Prüfen, ob Paywall-Text Stufe 2–5 aktuell im Bundle liegt (Kompletter Bruch der Diplom-Paywall vom 26.08.).
6. Rate-Limit + Origin-Check als **eine** Hilfsfunktion `lib/api/guard.ts` (Upstash oder Supabase-Tabelle) und in `chat`, `kochwissen/generieren`, `niche-validator/analyze`, `foodpairing` einsetzen. `generieren` zusätzlich hinter Login oder Admin.
7. Digistore-Webhook: Idempotenz über `order_id` (Unique-Constraint) + Token im Header statt URL; Advisor-ERRORs (2 SECURITY-DEFINER-Views) auf `security_invoker = true` umstellen.
8. `middleware.ts`: `PROTECTED` auf reale Pfade (`/diplome/profil`), Duplikate `src/app/profil` und `steuer-matrix-live` klären (eines löschen oder Redirect).

**P2 — nächste 2 Wochen (Struktur)**

9. **`src/lib/ai/`** als einzige KI-Schicht: `anthropic.ts` (ein Client, ein Modell-Enum `MODELS.fast/quality`), `voyage.ts` (ein Client), `retrieval.ts`. Drei der vier Voyage-Dateien löschen; Skripte importieren aus `src/lib/ai` (via `tsx`) statt eigene Clients. Entscheidung Raw-SDK **oder** AI-SDK — Empfehlung: AI-SDK für Streaming-Routen, Raw-SDK überall sonst, **nie beides in einer Datei**.
10. **`src/lib/db/`** als Repository-Layer (`recipes.ts`, `entitlements.ts`, `profiles.ts`…). Nur diese Dateien importieren `@/lib/supabase/*`. Service-Role ausschließlich in `lib/db/admin/*` und Webhooks; niemals in Pages.
11. Runtime-Regel: `nodejs` Standard; `edge` nur für `api/og/*`. `chat` auf nodejs umstellen (Streaming funktioniert dort ebenso).
12. Header nur in `next.config.mjs`; `vercel.json` auf Redirects + `functions` reduzieren.

**P3 — Radar (Monolith entflechten)**

13. GF2/GF3-Routen (`*-sprint`, `steuer-*`, `zzp-niche`, `eu-steuervergleich`, `gruender-schmiede`, `ehrliches-system`, `mein-system`, `src/services/*Evaluator`) in ein eigenes Paket/Repo oder mindestens `src/app/(gf2)/` + eigene Contentlayer-Config. Bis dahin: Feature-Flag, damit sie nicht mitgebaut werden.
14. Testbasis: 5 Testdateien für 304 Quelldateien. Mindestens: Guard-Funktion, Webhook-Idempotenz, `requireCourseAccess`, ein Contentlayer-Smoke-Test.

### 3.2 Fünf eiserne Architektur-Grundregeln (ab sofort)

**Regel 1 — Server first, Client nur mit Grund.**
Jede `page.tsx` ist eine Server-Component. `'use client'` steht nur in Blatt-Komponenten (`*Client.tsx`, `components/**`) und **niemals** in einer Datei, die `contentlayer/generated`, `@/lib/supabase/server`, `next/headers`, `fs` oder `server-only` importiert. Daten kommen als Props von oben, nie per Import von unten.

**Regel 2 — Ein Weg zur Datenbank.**
Supabase wird ausschließlich über `src/lib/db/*` angesprochen. Pages, Routen und Komponenten importieren nie `@/lib/supabase/*` direkt. Service-Role-Key existiert nur in `src/lib/db/admin/*` und `api/webhooks/*`. Neue Tabelle = Migration + RLS-Policy + Repository-Funktion in **einem** Commit; `get_advisors` muss danach frei von ERROR sein.

**Regel 3 — Eine KI-Schicht, ein Modell-Register.**
Anthropic und Voyage werden nur über `src/lib/ai/*` aufgerufen — von Routen **und** von Skripten. Modell-IDs stehen nur in `src/lib/ai/models.ts`; ein Literal wie `'claude-…'` außerhalb dieser Datei ist ein Lint-Fehler. Jeder öffentliche KI-Endpunkt läuft durch `lib/api/guard.ts` (Rate-Limit + Origin + optional Auth).

**Regel 4 — Eine Wahrheit pro Thema.**
Technik: `CLAUDE.md` im Repo (≤ 300 Zeilen). Status/Aufgaben: Jira. Strategie/Marke: Projekt-CLAUDE.md, ohne Technik. Header: `next.config.mjs`. Runtime: `nodejs`, Ausnahme nur `api/og`. Wer eine zweite Stelle anlegt (`*-live`, `*-b`, `*.patch`, zweite Voyage-Datei), löscht die erste im selben Commit oder legt nicht an.

**Regel 5 — Werkzeuge werden nie blockiert, Builds nie durch Inhalt.**
Keine PreToolUse-Hooks auf Read/Grep/Glob/Bash. Keine Git-Schreiboperation in Hooks. Inhaltliche Gates (Links, Frontmatter, Hierarchie, Redaktionsvorbehalt) laufen in `npm run check` / CI, nie in `prebuild`/`postbuild` auf Vercel. Nur *eine* Session schreibt gleichzeitig ins Repo; Push nur nach lokalem grünem `next build`.

---

## Anhang — Belegstellen

- Hooks: `.claude/settings.json`, `.claude/hooks/graphify-guard.sh`, `scripts/wip-autosave.mjs`
- Client/Server-Bruch: `src/app/diplome/roadmap/page.tsx:1,6,682`
- Service-Role außerhalb Backend: `src/app/gutschein/[code]/page.tsx`, `src/lib/voyage-retrieval.ts`, `src/services/publisherAgent.ts`
- Ungeschützte KI-Routen: `src/app/api/{chat,foodpairing,kochwissen/generieren,niche-validator/analyze}/route.ts`
- Auth-Dopplung: `src/middleware.ts:59-85`, `src/app/profil/` vs `src/app/diplome/profil/`
- Voyage-Vierfach: `src/lib/{voyage/client,voyage-retrieval,kochwissen/voyage,kochwissen/retrieval}.ts`
- Doppelte Header: `next.config.mjs` ↔ `vercel.json`; tote Config: `netlify.toml`
- Gates im Build: `package.json` → `prebuild`, `build`, `postbuild`
- Supabase-Advisor: 2 ERROR (SECURITY DEFINER Views), 2 WARN, 1 INFO (Stand 27.08.2026)
