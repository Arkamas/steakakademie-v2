# [OPERATIONS] — Plattform, Tech-Stack & aktive Kampagnen

> Quelle: `CLAUDE.md` → `[technik]`/`[tools]`, `STATUS.md`, `ROADMAP.md`, Supabase (Projekt `bbgdrzhlellxzggbbqcm`).

## Stack

- **Frontend:** Next.js 14 App Router, TailwindCSS, Framer Motion, Contentlayer2, TypeScript.
- **Hosting/Deploy:** **Vercel** (Auto-Deploy via GitHub `main`) — kanonisch. Domain `steakakademie.de` (GoDaddy), DNS via Cloudflare (NS `rohin`/`zita.ns.cloudflare.com`), A-Records zeigen auf Vercel; `www` läuft über Cloudflare proxied auf Vercel und wird per `vercel.json` 308 auf die Apex-Domain umgeleitet.
  - Korrigiert 13.08.2026: Hier stand bis dahin „Netlify (Auto-Deploy) + Vercel (verknüpft)". Das war seit der Umstellung falsch herum — belegt durch `server: Vercel` + `x-vercel-id` in der Live-Antwort. Vgl. `compliance/website-rechtscheck.yaml` §3, das Vercel bereits am 07.06.2026 als Host korrigiert hatte.
  - **Netlify:** Site `steakakademie-de` baute bis 13.08.2026 parallel aus demselben Repo mit (letzter Deploy `6a7dc50c`, Commit `e04bcc5`). Builds gestoppt, Site bleibt als Vergleichsobjekt unter `steakakademie-de.netlify.app` online. `netlify.toml` liegt weiterhin im Repo und wirkt nur noch dort. Achtung: Die Kopie ist crawlbar (kein `X-Robots-Tag: noindex`); gegen Duplicate Content schützt allein das Canonical-Tag auf die Hauptdomain.
- **Auth/DB:** Supabase (Auth Magic Link/OTP + OAuth PKCE, PostgreSQL, RLS, Storage). Dual-path callback `src/app/auth/callback/route.ts`.
- **E-Mail:** Loops.so (transaktional + Newsletter); 8 Aliases @steakakademie.de via Cloudflare Email Routing.
- **KI-Bild:** **fal.ai (FLUX.1 dev) = EINZIGER Bildgenerator.** Higgsfield verbannt (03.06.2026).
- **Analytics:** GA4 `G-MP7TY25SL5`; Google Search Console `sc-domain:steakakademie.de`.

## Supabase-Schema (10 Tabellen, alle RLS-aktiv)

| Tabelle | Zweck | Zeilen |
|---------|-------|--------|
| `courses` | Kurs-Definitionen | 4 |
| `digistore_products` | Produkt-Mapping (Digistore↔Kurs) | 4 |
| `digistore_orders` | Bestellungen (Webhook) | 8 |
| `bookings` | Course-Grants | 1 |
| `course_progress` | Lernfortschritt | 0 |
| `protokolle` | Mein-Protokoll-Pläne | 3 |
| `diagnosen` | Steak-Beichte-Diagnosen | 1 |
| `diagnose_credits` | Credit-Guthaben | 1 |
| `widerrufe` | Widerrufe (Verbraucherrecht) | 4 |
| `profiles` | öffentliche Profile (slug) | 1 |

**Security (gehärtet 03.06.):** `search_path` auf 4 PL/pgSQL-Funktionen fixiert, `rls_auto_enable()` EXECUTE revoked. ⚠️ Offen: Leaked-Password-Protection deaktiviert → KAN-16.

## Digistore24-Produkte

| ID | Produkt | Preis | Status |
|----|---------|-------|--------|
| 696394 | Steak-Beichte (KI-Diagnose, Credits) | 7€ / 25€ 5er | ✅ liefert (hardcoded Credit) |
| 696396 | Mein Protokoll (8-Wochen-Plan) | 19€ / 29€ | ✅ verifiziert live 01.06. |
| 696399 | BBQ-Grundkurs | 79€ / 127€ | „In Vorbereitung" (Substanz fehlt) |
| 695894 | Gründung-Sprint | — | deaktiviert bis Substanz |
| 695900 | Agentur-Killer-Sprint | — | deaktiviert bis Substanz |
| 695797 | Steuer-Matrix | — | live |

⚠️ **Regel:** Jedes Course-Produkt braucht `courses`-Zeile + `digistore_products`-Mapping, sonst kassiert es ohne Auslieferung. Reaktivierung: **erst Substanz, dann Checkout** — nie umgekehrt.

## Aktive Ops-Blocker (auf Uwe) → Jira

KAN-9 (Prod-Migrations) · KAN-10 (Danke-URLs) · KAN-11 (Webhook-URLs) · KAN-12 (Env-Vars — **in Vercel**, nicht Netlify; der Jira-Titel nennt ggf. noch Netlify) · KAN-13 (Testkauf-Verifikation) · KAN-15 (ADMIN_PASSWORD rotieren).

## GitHub Actions (Repo `vecmahr/steakakademie-v2`)

`auto-fix.yml` (verwaist) · `check-affiliate-links.yml` (Mo 08:00) · `glossary-grow.yml` (So 03:00) · `recipe-grow.yml` (So 03:30). Scripts: `glossary-agent.mjs`, `recipe-agent.mjs`, `recipe-images.mjs`, `check-affiliate-links.mjs`, `cron-scout.mjs`, `fetch-pa-api-images.mjs`.

## Rechtssicherheit-Gate (HART)

Keine selbst/mit-KI gebaute Seite geht live ohne bestandenen Tiefen-Rechtsscan (Impressum, DSGVO, AGB, Widerruf + **Widerrufsbutton ab 19.06.2026**, Cookie-Consent, PAngV, Schema). Bis Freigabe: `noindex`/Coming-Soon. Katalog: `compliance/website-rechtscheck.yaml` (21 Komponenten).
