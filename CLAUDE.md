# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Steakakademie v2 is a **German-language BBQ/steak content site** (steakakademie.de) that combines an SEO-driven editorial site with affiliate monetization and digital products. It is a single Next.js 14 (App Router) application, but two largely independent subsystems live inside it:

1. **The public website** — content modeled as MDX via Contentlayer, plus Supabase for auth, courses, orders and user data.
2. **"AuthorityOS" Validator Engine** (`src/engine` + `src/services`) — a niche-validation / SEO-scoring system with per-country EU tax evaluators and a content-scout pipeline. It is dependency-injected, stateless and unit-tested in isolation.

Almost everything user-facing — UI copy, MDX content, code comments, commit context — is in **German**. Match that when writing comments or content. Code comments frequently reference Jira tickets as `KAN-NN`.

## Commands

```bash
# Dev / build  — ⚠️ see the AI-agent caveat below
npm run dev              # runs recipe-agent + seo-image-optimizer + glossary-agent, THEN next dev
npm run build            # seo-image-optimizer, THEN next build  (agents NOT run)
npm run build:with-agents# full pipeline incl. recipe + glossary agents
npm run lint             # next lint (eslint-config-next)

# Tests
npm test                 # vitest run — unit tests, node env, matches src/**/*.test.ts
npm run test:watch       # vitest watch
npx vitest run src/__tests__/tax-comparison.test.ts   # a single test file
npx vitest run -t "name of test"                      # a single test by name
npm run test:e2e         # playwright (auto-starts `npm run dev` on :3000)
npm run test:e2e:ui      # playwright --ui

# Content / build integrity
npm run build-guard      # detects "silent" content defects that survive a green build (see below)
npm run check-links      # validate all affiliate URLs (also a scheduled GH Action)
```

**AI-agent caveat:** `npm run dev` (and `build:with-agents`) invoke generation scripts that call the Anthropic API and fal.ai and read `.env.local`. Without `ANTHROPIC_API_KEY` / `FAL_KEY` they will fail or no-op. For pure UI/code work, run `next dev` directly (or `npm run build`, which skips the LLM agents) to avoid burning API credits. Each agent also supports `--dry-run` and `--force` (see `package.json` scripts).

## Content system (Contentlayer)

All editorial content lives in `content/**/*.mdx` and is compiled by **Contentlayer2** (`contentlayer.config.ts`) into `.contentlayer/generated`, imported in code as `contentlayer/generated`. Ten document types each map a content subdirectory to a URL via `computedFields` (the `url` field is the routing source of truth):

`Artikel`, `Cut`, `Methode`, `Vergleich`, `Persoenlichkeit`, `Glossar`, `UsaBbqStyle`, `Recipe`, `DiplomLektion` (the Grillmeister "Diplom" curriculum), `SprintModul` (founder course). `Recipe` is the richest type (structured `ingredients`/`steps` JSON, `kategorie` enum drives its URL `/rezepte/<kategorie>/<slug>`).

**Silent-content-defect hazard:** Contentlayer logs bad documents as *warnings*, so a malformed MDX file can silently drop a page while the build stays green (real incidents KAN-26, KAN-28). Two guards exist:
- `.gitattributes` forces **LF** on `.mdx`/code so Windows CRLF can't break frontmatter parsing (a CRLF bug once dropped 32 recipes).
- `remark-gfm` is enabled so Markdown tables/task-lists render as real HTML.
- `npm run build-guard` (and the `build-guard.yml` Action) re-run Contentlayer, assert "0 problems" and a sane doc count, and check for GFM regressions. Run it after bulk content changes.

## Architecture notes

- **Path aliases:** `@/*` → `src/*`; `contentlayer/generated` → `.contentlayer/generated`. TypeScript is `strict`.
- **Validator Engine:** `src/engine/validatorEngine.ts` orchestrates injected services (`seoAnalyzer`, `monetizationEvaluator`, `contentMatchAnalyzer`, the per-country `*Evaluator.ts` tax modules) into a 0–100 Authority Score + GREEN/RED verdict. Types and thresholds live in `src/types/validator`. Tests run in deterministic simulation mode (no API keys, no I/O) — keep them that way.
- **Content-scout pipeline:** `scripts/cron-scout.mjs` → `src/services/scoutEngine.ts` reads RSS/HTML sources, generates drafts via Claude, and writes them to the Supabase `content_drafts` table as `status='draft'/'review'`. **Output goes to the DB, never to Git, and nothing is published without human approval in `/admin/review`.** `src/lib/content-routing.ts` is the single source of truth mapping each content `category` → its target page.
- **Auth & access control:** `middleware.ts` gates `/admin*` and `/api/admin*`/`/api/pm-agent*` behind an `admin_auth` cookie compared to `ADMIN_PASSWORD`; all other routes go through Supabase `updateSession`. Supabase Auth uses Magic Link/OTP + OAuth PKCE (dual-path callback in `src/app/auth/callback/route.ts`). The DB has ~10 RLS-enabled tables; schema evolves via timestamped files in `supabase/migrations/`.
- **Monetization has two legs:**
  - *Affiliate:* product registry in `products/registry.yaml` (+ `images.json` cache from Amazon PA-API via `scripts/fetch-pa-api-images.mjs`); outbound clicks go through the `/go/[product-slug]` redirect route.
  - *Digital products (Digistore24):* purchases arrive at `/api/webhooks/digistore24?token=<DIGISTORE_WEBHOOK_TOKEN>` and grant course access via Supabase. **Hard rule:** every course product needs a matching `courses` row **and** a `digistore_products` mapping, or it charges the customer without delivering. Ship substance first, enable checkout second.
- **Image generation:** **fal.ai (FLUX.1 dev) is the only image generator** (Higgsfield was removed 03.06.2026). LoRA training assets live under `training/`.

## Compliance gate (hard rule)

This is a regulated German e-commerce surface. **No self-/AI-built page goes live (indexable) until it passes the deep legal scan** — Impressum, DSGVO, AGB, Widerruf (incl. the Widerrufsbutton required from 19.06.2026), cookie consent, PAngV, Schema.org. Until cleared, a page must be `noindex` / coming-soon. The checklist catalog is `compliance/website-rechtscheck.yaml` (21 components) and is scanned daily by an automated agent.

## Automation (GitHub Actions)

Scheduled content-growth and ops jobs run in `.github/workflows/`. They commit generated content back to the repo *persistently* (a normal build only produces it ephemerally):
- `glossary-grow.yml` (Sun 03:00 UTC, Claude Haiku → commits `content/glossar`)
- `recipe-grow.yml` (Sun 03:30 UTC, Claude Sonnet → commits `content/rezepte`) and `regenerate-recipe-images.yml` (manual, FLUX.1)
- `content-grow.yml` (Sun 04:00 UTC → Supabase drafts, no commit)
- `check-affiliate-links.yml` (Mon 08:00 UTC, opens/closes a GitHub Issue)
- `build-guard.yml` (push/PR), plus ops alerting that opens Jira `KAN-*` tickets on failures (`vercel-deploy-alert.yml`, `scripts/ops-alert-to-jira.mjs`). `auto-fix.yml` exists but is currently orphaned.

The honest, audited state of the agent fleet (planned vs. actually running) is tracked in `docs/confluence/00-AGENT-MATRIX.md`; broader strategy/ops live in `docs/confluence/`.

## Deployment & environment

- **Hosting:** Netlify is primary (`netlify.toml`, `@netlify/plugin-nextjs`, Node 20, `--legacy-peer-deps`) with Vercel linked (`vercel.json`). Build runs `next build` + `next-sitemap`. Security headers and `www → apex` redirect are configured in both.
- **Env:** all `.env*` files are gitignored; use `.env.local`. See `.env.example` (Supabase URL/anon/**service-role**, Loops.so, Digistore webhook token). Never put the Supabase service-role key in client code. `ROADMAP.md` tracks operational blockers and outstanding setup (Amazon keys, affiliate signups, GA4, etc.).

## Gotchas

- `src/lib/pm-agent-context.generated.ts` is a committed snapshot that *used to* be generated from `CLAUDE.md` by a `generate-pm-context.js` script that is no longer in the repo. Editing this CLAUDE.md will **not** regenerate it — update that file by hand if the PM-agent (`/api/pm-agent`) needs current status.
- Unit tests live in two places: `src/**/*.test.ts` (vitest `include`) — note `src/__tests__/*.test.ts` and any colocated `*.test.ts` both match. E2E specs are under `tests/e2e/`.
- There is no README; `ROADMAP.md` and `docs/confluence/` are the closest thing to project documentation.
