# Agent-Matrix — Steakakademie

> **Quelle der Wahrheit:** `CLAUDE.md` → Branch `[agenten]`. Diese Seite ist ein Spiegel für die Confluence-Übersicht.
> **Ehrlicher Status (Audit 03.06.2026, claude-mem obs 2947/2948/2995):** 12 Agenten geplant, **4–5 tatsächlich aktiv.** Die Lücke ist bewusst dokumentiert, nicht beschönigt.

## Tatsächlich aktiv (laufen heute)

| # | Agent | Mechanik | Trigger | Status |
|---|-------|----------|---------|--------|
| 1 | **AGB/Rechts-Compliance-Scanner** | CronCreate (Remote) gegen `compliance/website-rechtscheck.yaml` (21 Komponenten) | täglich 06:00 UTC | ✅ aktiv |
| 5 | **Affiliate-Link-Checker** | GitHub Actions `check-affiliate-links.yml` → `npm run check-links:json`, öffnet/schließt GitHub Issue | Mo 08:00 UTC | ✅ aktiv |
| 11 | **Glossar-Agent** | GitHub Actions `glossary-grow.yml` → `scripts/glossary-agent.mjs` (Claude Haiku), committet `content/glossar` | So 03:00 UTC | ✅ aktiv (aus Build entfernt 02.06.) |
| 12 | **Rezept-Agent** | GitHub Actions `recipe-grow.yml` → `scripts/recipe-agent.mjs` (Claude Sonnet) + `recipe-images.mjs` (FLUX.1/FAL) | So 03:30 UTC | ✅ aktiv (aus Build entfernt 02.06.) |
| — | **Auto-Fix-Agent** | GitHub Actions `auto-fix.yml` → `claude-code-action@beta`, öffnet PR bei Issue-Label `auto-fix` | event-driven | ⚠️ vorhanden, aber **verwaist** — hängt am nicht existenten „Mingma Post-Agent" |
| — | **cron-scout** | `scripts/cron-scout.mjs` | manuell/`cron:scout` | ⚠️ blockiert bis ADMIN_PASSWORD rotiert (KAN-15) |

## Geplant, noch nicht gebaut

| # | Agent | Benötigt | Jira |
|---|-------|----------|------|
| 2 | SEO-Monitor | GSC Service Account | KAN-21 |
| 3 | Content-Pipeline (Recherche→Übersetzung→DE) | DeepL, Notion, `recipe-scraper/` (gelöscht) | — |
| 4 | Newsletter/DOI-Monitor | Loops.so API | — |
| 6 | Social Media Senior Director (Content-Generator, `scripts/social-posts.mjs`) | Notion, FAL | — |
| 7 | Konkurrenz-Monitor (Frühwarnung „Präsenz-Player geht online") | Nimble/Brightdata, Searchfit | — |
| 8 | Rechts-Update-Scanner | WebFetch (bmj.de, eur-lex) | — |
| 9 | Digistore24-Performance-Report | Digistore24 API | — |
| 10 | GSC-Indexierungs-Report | GSC API (deckt KAN-21 mit ab) | KAN-21 |

## Konsolidierungs-Empfehlung (aus Audit 2995)

- **Agent 2 + 10** zusammenlegen (beide GSC) → ein SEO/Index-Monitor.
- **Agent 1 + 8** überschneiden sich (beide Rechts/Compliance) → prüfen, ob 8 in 1 aufgeht.
- **Agent 3** referenziert gelöschtes `recipe-scraper/` → Roadmap-Eintrag bereinigen oder neu spezifizieren.
- **Auto-Fix-Agent** entweder an realen Alert-Trigger anschließen oder als dormant markieren.

## Virtuelle AI-Workforce (Rovo-Orchestrator-Ebene)

Mapping der vier Orchestrator-Rollen auf die reale Arbeit — **keine Doppelung** der obigen Automation, sondern Zuständigkeits-Linsen:

| Rolle | Deckt ab | Reale Artefakte |
|-------|----------|-----------------|
| Content & Culinary Expert | Pitmaster-Doktrin, Rezepte, Glossar, Lektionen | Agent 11/12, `content/` |
| SEO & Growth Hacker | Keywords, Schema/GEO, interne Links | KAN-1, KAN-18, KAN-24, Searchfit |
| Tech & Automation Engineer | Code, Supabase, GitHub Actions, Deploy | KAN-6, alle Agenten-Workflows |
| Brand & UX Designer | „High-Tech & Smoke"-Design, FLUX-Bilder | Design-System, FAL-Pipeline |
