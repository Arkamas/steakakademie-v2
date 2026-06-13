# CLAUDE.md — Steakakademie

Projektleitfaden für Claude Code. Next.js-Content-/Affiliate-Plattform
(steakakademie.de). Diese Datei ist die **Quelle der Wahrheit** für das
Agenten-System; `docs/confluence/00-AGENT-MATRIX.md` ist ihr Spiegel.

## Konventionen (Kurz)

- **Rechts-/Compliance-Prüfungen** laufen gegen die Kataloge in `compliance/`
  (`website-rechtscheck.yaml` = Self-Audit, `gruendung-sprint-rechtscheck.yaml`
  = Kunden-Audit). Maschinell prüfbare Abmahn-Regressionen sichert
  `scripts/legal-guard.mjs` (CI: `legal-guard.yml`).
- **Ops-Alerts** aus Workflows gehen über `scripts/ops-alert-to-jira.mjs` nach
  Jira (Projekt `KAN`); jeder Workflow setzt `ALERT_*`-Env inkl. eindeutigem
  `ALERT_DEDUP_LABEL`.
- **Nichts geht live ohne menschliche Freigabe** (Content-Drafts → `/admin/review`,
  Social → manuell via Postiz). GATE: Community/Gutschein erst nach anwaltlicher
  Endprüfung scharfschalten.

## [agenten]

Kanonische Registry. Stand: **Konsistenz-Audit 2026-06-13**.

### Aktiv (laufen / Runner gebaut)

| # | Agent | Runner | Trigger | Status |
|---|-------|--------|---------|--------|
| 1 | AGB/Rechts-Compliance-Scanner | CronCreate (Remote) gegen `compliance/website-rechtscheck.yaml` (33 Komponenten) | täglich 06:00 UTC | aktiv |
| 3 | Content-Pipeline (Scout→Draft) | `content-grow.yml` → `scripts/cron-scout.mjs` → Claude → Supabase `content_drafts` | So 04:00 UTC + manuell | aktiv, human-gated (ggf. KAN-15-blockiert) |
| 5 | Affiliate-Link-Checker | `check-affiliate-links.yml` → `npm run check-links:json` | Mo 08:00 UTC | aktiv |
| 11 | Glossar-Agent | `glossary-grow.yml` → `scripts/glossary-agent.mjs` (Claude Haiku) | So 03:00 UTC | aktiv |
| 12 | Rezept-Agent | `recipe-grow.yml` → `scripts/recipe-agent.mjs` (Claude Sonnet) + `recipe-images.mjs` | So 03:30 UTC | aktiv |

Event-/Dispatch-Runner: `auto-fix.yml` (Issue-Label `auto-fix` → PR; aktuell
verwaist, kein Label-Erzeuger), `regenerate-recipe-images.yml` (manuell),
`vercel-deploy-alert.yml` (Deploy-Event → Jira), `test-ops-hook.yml` (manuell).

### Teilweise gebaut

- **Agent 6 — Social-Media**: Skripte `social-posts.mjs`, `promo-machine.mjs`,
  `postiz-push.mjs` vorhanden; Runner `social-grow.yml` kommt mit PR #3.

### Geplant (noch nicht gebaut)

| # | Agent | Benötigt | Jira |
|---|-------|----------|------|
| 2 | SEO-Monitor | GSC Service Account | KAN-21 |
| 4 | Newsletter/DOI-Monitor | Loops.so API | — |
| 7 | Konkurrenz-Monitor | Nimble/Brightdata, Searchfit | — |
| 8 | Rechts-Update-Scanner | WebFetch (bmj.de, eur-lex) | — |
| 9 | Digistore24-Performance-Report | Digistore24 API | — |
| 10 | GSC-Indexierungs-Report | GSC API | KAN-21 |

### CI-Guards (keine Agenten, aber Teil der Automation)

- `build-guard.yml` → `scripts/build-guard.mjs` (stille Content-Defekte)
- `legal-guard.yml` → `scripts/legal-guard.mjs` (Abmahn-Regressionen)

### ops-alert-Label ↔ Rovo-Rollen

Vier Orchestrator-Rollen: **Content & Culinary**, **SEO & Growth**,
**Tech & Automation**, **Brand & UX**. Reale `agent-*`-Labels in den Workflows
gehen darüber hinaus (`agent-tech-automation-engineer`,
`agent-senior-marketing-manager`, `agent-social-media`) — vor einer
Vereinheitlichung Jira-Filter/Dedup prüfen.

### Pflege-Regel

Diese Registry und der Matrix-Spiegel (`docs/confluence/00-AGENT-MATRIX.md`)
sind synchron zu halten. Neuer Agent/Runner → hier **und** im Spiegel eintragen.
