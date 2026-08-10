# Agent-Matrix — Steakakademie

> **Quelle der Wahrheit:** `CLAUDE.md` (Repo-Root, Abschnitt `## [agenten]`). Diese Seite ist ein Spiegel für die Confluence-Übersicht.
> **Ehrlicher Status (Konsistenz-Audit 2026-06-13):** 12 Agenten geplant, **5–6 tatsächlich aktiv** (Agent 3 nach KAN-15-Klärung reklassifiziert). Mit Agent 6 (PR #3) → 6–7; beim Merge angleichen. Die Lücke ist bewusst dokumentiert, nicht beschönigt.

## Tatsächlich aktiv (laufen heute)

| # | Agent | Mechanik | Trigger | Status |
|---|-------|----------|---------|--------|
| 1 | **AGB/Rechts-Compliance-Scanner** | CronCreate (Remote) gegen `compliance/website-rechtscheck.yaml` (33 Komponenten, Stand 2026-06-13) | täglich 06:00 UTC | ✅ aktiv |
| 3 | **Content-Pipeline (Scout→Draft)** | GitHub Actions `content-grow.yml` → `scripts/cron-scout.mjs` (Claude) → Supabase `content_drafts`; RSS-Quellen | So 04:00 UTC + manuell | ✅ aktiv (human-gated via `/admin/review`) |
| 5 | **Affiliate-Link-Checker** | GitHub Actions `check-affiliate-links.yml` → `npm run check-links:json`, öffnet/schließt GitHub Issue | Mo 08:00 UTC | ✅ aktiv |
| 11 | **Glossar-Agent** | GitHub Actions `glossary-grow.yml` → `scripts/glossary-agent.mjs` (Claude Haiku), committet `content/glossar` | So 03:00 UTC | ✅ aktiv (aus Build entfernt 02.06.) |
| 12 | **Rezept-Agent** | GitHub Actions `recipe-grow.yml` → `scripts/recipe-agent.mjs` (Claude Sonnet) + `recipe-images.mjs` (FLUX.1/FAL) | So 03:30 UTC | ✅ aktiv (aus Build entfernt 02.06.) |
| — | **Auto-Fix-Agent** | GitHub Actions `auto-fix.yml` → `claude-code-action@beta`, öffnet PR bei Issue-Label `auto-fix` | event-driven | ⚠️ vorhanden, aber **verwaist** — hängt am nicht existenten „Mingma Post-Agent" |
| — | **cron-scout** (Engine von Agent 3) | `scripts/cron-scout.mjs` (Supabase Service-Role + Anthropic) | scheduled via Agent 3 + manuell/`cron:scout` | ✅ freigegeben — KAN-15 (`ADMIN_PASSWORD` rotiert) = **Fertig**; `/admin` abgesichert, `cron:scout` scharf |

## Geplant, noch nicht gebaut

| # | Agent | Benötigt | Jira |
|---|-------|----------|------|
| 2 | SEO-Monitor | GSC Service Account | KAN-21 |
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
- **Agent 3 (Content-Pipeline)** → **reklassifiziert auf „aktiv"** (in die
  Aktiv-Tabelle verschoben, aus „Geplant" entfernt). Runner `content-grow.yml`
  läuft geplant **So 04:00 UTC** (`cron-scout.mjs` → Claude → Supabase
  `content_drafts`, RSS statt des gelöschten `recipe-scraper/`); Freigabe
  human-gated über `/admin/review`.
  **KAN-15 geklärt:** `ADMIN_PASSWORD` sichert nur die `/admin`-Auth
  (`src/app/api/admin/*`) — `cron-scout.mjs` nutzt Supabase-Service-Role +
  Anthropic, **kein `ADMIN_PASSWORD`**. KAN-15 betraf also die Review-UI-
  Sicherheit, nicht den Agentenlauf. **Status am 2026-06-13 via Jira-MCP
  verifiziert: Fertig** — `ADMIN_PASSWORD` rotiert, `/admin` abgesichert,
  `cron:scout` freigegeben.
- **Agent 6 (Social-Media)**: Skripte `social-posts.mjs`, `promo-machine.mjs`,
  `postiz-push.mjs` existieren bereits auf `main` (Runner fehlt noch auf main).
  Der offene **PR #3** schaltet ihn aktiv + ergänzt `social-grow.yml` und pflegt
  Agent-6-Zeile + Status-Zähler — diese Zeilen bleiben hier bewusst unangetastet.
- **Label-Taxonomie vereinheitlicht (2026-06-13):** Alle Ops-Alerts laufen jetzt
  unter dem Tech-&-Automation-Label `agent-tech-automation-engineer` (Affiliate von
  `agent-senior-marketing-manager` umgestellt; `vercel-deploy-alert` ergänzt um
  `ops` + Agent-Label). Die fachliche Domäne bleibt als Topic-Label
  (`affiliate`/`vercel`/…). `ALERT_DEDUP_LABEL` pro Workflow unverändert.
  `social-grow.yml` (PR #3) beim Merge auf `agent-tech-automation-engineer`
  + Topic `social` angleichen.

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
