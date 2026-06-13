# Agent-Matrix — Steakakademie

> **Quelle der Wahrheit:** `CLAUDE.md` (Repo-Root, Abschnitt `## [agenten]`). Diese Seite ist ein Spiegel für die Confluence-Übersicht.
> **Ehrlicher Status (Audit 03.06.2026, claude-mem obs 2947/2948/2995):** 12 Agenten geplant, **4–5 tatsächlich aktiv.** Die Lücke ist bewusst dokumentiert, nicht beschönigt.

## Tatsächlich aktiv (laufen heute)

| # | Agent | Mechanik | Trigger | Status |
|---|-------|----------|---------|--------|
| 1 | **AGB/Rechts-Compliance-Scanner** | CronCreate (Remote) gegen `compliance/website-rechtscheck.yaml` (33 Komponenten, Stand 2026-06-13) | täglich 06:00 UTC | ✅ aktiv |
| 5 | **Affiliate-Link-Checker** | GitHub Actions `check-affiliate-links.yml` → `npm run check-links:json`, öffnet/schließt GitHub Issue | Mo 08:00 UTC | ✅ aktiv |
| 11 | **Glossar-Agent** | GitHub Actions `glossary-grow.yml` → `scripts/glossary-agent.mjs` (Claude Haiku), committet `content/glossar` | So 03:00 UTC | ✅ aktiv (aus Build entfernt 02.06.) |
| 12 | **Rezept-Agent** | GitHub Actions `recipe-grow.yml` → `scripts/recipe-agent.mjs` (Claude Sonnet) + `recipe-images.mjs` (FLUX.1/FAL) | So 03:30 UTC | ✅ aktiv (aus Build entfernt 02.06.) |
| — | **Auto-Fix-Agent** | GitHub Actions `auto-fix.yml` → `claude-code-action@beta`, öffnet PR bei Issue-Label `auto-fix` | event-driven | ⚠️ vorhanden, aber **verwaist** — hängt am nicht existenten „Mingma Post-Agent" |
| — | **cron-scout** | `scripts/cron-scout.mjs` (auch via `content-grow.yml`) | So 04:00 UTC + manuell/`cron:scout` | ⚠️ Runner gebaut, ggf. blockiert bis ADMIN_PASSWORD rotiert (KAN-15) |

## Geplant, noch nicht gebaut

| # | Agent | Benötigt | Jira |
|---|-------|----------|------|
| 2 | SEO-Monitor | GSC Service Account | KAN-21 |
| 3 | Content-Pipeline (Recherche→Übersetzung→DE) | DeepL, Notion, `recipe-scraper/` (gelöscht) | — |
| 4 | Newsletter/DOI-Monitor | Loops.so API | — |
| 6 | Social-Media-Content-Generator | Notion, FAL | — |
| 7 | Konkurrenz-Monitor (Frühwarnung „Präsenz-Player geht online") | Nimble/Brightdata, Searchfit | — |
| 8 | Rechts-Update-Scanner | WebFetch (bmj.de, eur-lex) | — |
| 9 | Digistore24-Performance-Report | Digistore24 API | — |
| 10 | GSC-Indexierungs-Report | GSC API (deckt KAN-21 mit ab) | KAN-21 |

## Konsistenz-Audit (2026-06-13)

Vollständiger Abgleich Matrix ↔ Workflows ↔ Skripte ↔ Trigger ↔ ops-alert-Labels.
Technisch sauber verdrahtet (alle 11 referenzierten Skripte existieren, Zeitpläne
für Affiliate/Glossar/Rezept stimmen). Korrekturen:

- **SSoT-Verweis** auf real existierende `CLAUDE.md` (Repo-Root, `## [agenten]`)
  umgestellt — der bisherige Verweis auf „Branch `[agenten]`" zeigte ins Leere.
- **Agent 1**: Komponentenzahl 21 → **33** (Stand des Compliance-Katalogs).
- **Agent 3 (Content-Pipeline)** ist NICHT „noch nicht gebaut": Der Runner
  `content-grow.yml` läuft geplant **So 04:00 UTC** (`cron-scout.mjs` → Claude →
  Supabase `content_drafts`, Mechanik RSS statt des gelöschten `recipe-scraper/`).
  → Reklassifizieren nach „aktiv (human-gated, ggf. KAN-15-blockiert)".
- **Agent 6 (Social-Media)**: Skripte `social-posts.mjs`, `promo-machine.mjs`,
  `postiz-push.mjs` existieren bereits auf `main` (Runner fehlt noch auf main).
  Der offene **PR #3** schaltet ihn aktiv + ergänzt `social-grow.yml` und pflegt
  Agent-6-Zeile + Status-Zähler — diese Zeilen bleiben hier bewusst unangetastet.
- **Label-Taxonomie**: ops-alert nutzt `agent-tech-automation-engineer` (meiste),
  `agent-senior-marketing-manager` (Affiliate), `agent-social-media` (PR #3) —
  diese gehen über die unten gelisteten 4 Rovo-Rollen hinaus; `vercel-deploy-alert`
  trägt gar kein `agent-*`-Label. Vor Vereinheitlichung Jira-Filter/Dedup prüfen.

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
