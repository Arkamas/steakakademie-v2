# 🎛️ COCKPIT — Steakakademie

> **Das ist die einzige Datei, die Uwe anheftet.** Alles andere wird über die fünf
> Abteilungen unten erreicht — nicht über Einzel-Ordner im Sichtfeld.
>
> **Regel:** Es gibt **fünf** Abteilungen. Dauerhaft. Neues wird einer der fünf
> zugeordnet — es kommt keine sechste dazu. Wenn etwas in keine passt, ist es
> entweder falsch geschnitten oder gehört nicht ins Projekt.
>
> **Pflege:** Je Abteilung genau drei Zeilen — *läuft · hängt · nächster Schritt*.
> Wird die Liste länger, gehört der Rest in die Detail-Doku der Abteilung, nicht hierher.
>
> Angelegt 10.08.2026 (Konsistenz-Audit). Stand der Einträge: siehe Datum je Zeile.

---

## Die fünf Abteilungen

| # | Abteilung | Ersetzt | Einstieg |
|---|---|---|---|
| 1 | **Systems & Ops** | Entwicklung + IT-Betrieb | `src/` · `scripts/` · `supabase/` · `.github/workflows/` |
| 2 | **Studio** | Video-/Bildproduktion | `video/` · `training/` · `bild-austausch/` |
| 3 | **Redaktion** | Content-Team + Fachredaktion | `content/` · `data/` |
| 4 | **Wachstum** | SEO/GEO · Social · Newsletter · Affiliate | `products/` · `steakakademie-audit/` |
| 5 | **Kanzlei** | Recht · Steuern · Behörden | `compliance/` · `Existenzgruendung-Jobcenter/` |

---

## 1 · Systems & Ops

**Läuft:** Vercel-Produktion (`steakakademie.de`), Supabase-Auth (Magic Link), Branch
Protection auf `main` mit drei Pflicht-Checks (P0-Gates, Stille Content-Defekte, Vercel),
16 GitHub-Actions-Workflows, Sentry-Monitoring, Ops-Alert → Jira (KAN).

**Hängt:** **Content-Wachstum steht seit 01.09.** — Branch Protection blockiert die
Direct-Pushes der sechs Agenten-Workflows, letzter Bot-Commit 27.08. Fix liegt vor
(Composite Action `pr-statt-push`, alle sechs umgestellt, 04.09.), wird aber erst mit
**`BOT_PAT`** voll wirksam — ohne PAT lösen Bot-PRs keine Pflicht-Checks aus ·
`_content_snap.tgz` / `_fix_sync.tgz` als Müll im Repo-Root (Regel 14).

**Nächster Schritt (Uwe, 3 Min):** `BOT_PAT` anlegen + „Allow auto-merge" setzen —
Anleitung `docs/ci-bot-pat.md`. Dann `glossary-grow` manuell starten und prüfen, dass
der PR Checks bekommt.

*Erledigt 04.09.2026:* PR-Gate für alle Bot-Pushes (Text auto-merge, Bilder Review) ·
Race durch eigene Branches gelöst · 13 `workflow_dispatch`-Inputs über `env` entschärft
(Script-Injection-Muster) · Guard in `train-pork-lora.yml` (fehlendes Dataset ≠ Fehler).

---

## 2 · Studio

**Läuft:** Cut-Foto-Generator (FLUX.1 + `sa_rawcut`-LoRA) mit **PR-Review-Gate** —
nichts geht ohne Sichtprüfung live. Rezeptbild-Generator (`sa_foodstyle`-LoRA).
Kräuter-Rotation im Cut-Prompt (6 Kräuter, deterministisch je Slug).

Video-Toolkit (MIT, v0.20.0) seit 04.09. im Repo verankert (PR #47 gemergt):
`npm run vt:setup:win`, Marken-Profil kanonisch in `docs/video-toolkit/brand/`,
Modal mit 6/8 Endpunkten (**Qwen3-TTS**, **FLUX2**, Image-Edit, Upscale, Musik,
SadTalker) — Doku `docs/video-toolkit-setup.md`.

**Marcos Stimme ist abgenommen und eingefroren** (04.09., B3 „warm-erfahren",
Voice-Design statt Klon). Die Referenz-WAV liegt versioniert im Repo, weil Qwen3-TTS
**keinen Seed** kennt — löschen und neu generieren ergäbe eine *andere* Stimme.
Nie löschen, Neu-Abnahme nur mit Freigabe (`docs/video-toolkit-setup.md` §6).

**Hängt:** **R2 fehlt — Pflicht vor der nächsten Generierung** (ohne R2 gehen
Referenz-Assets an einen öffentlichen Filehoster, Befund 04.09.; Setup-Skripte warnen
rot; die vier Schlüssel stehen bereits auskommentiert in `tools/video-toolkit/.env`) ·
16 Cut-Fotos fehlen (Platzhalter greift) · `training/lora-pork/dataset/` fehlt →
Training läuft nicht (Guard fängt es ab) · zwei Video-Stacks parallel (OpenMontage +
Toolkit) — einer zu viel.

**Nächster Schritt:** R2 einrichten (`docs/video-toolkit-setup.md` §3, 0 €) → erste
Lernvideo-Produktion mit Marcos Stimme. Danach OpenMontage stilllegen.

---

## 3 · Redaktion

**Läuft:** 64 Cuts im Katalog, 334 MDX-Dateien ohne Frontmatter-Fehler, keine toten
internen Links, Glossar- und Rezept-Agent (täglich 03:00 / 03:30 UTC), Rechtschreibprüfung
(report-only), MDX-Komponenten-Gate im `prebuild`.

**Hängt:** 7 Rind-Cuts mit `52–54 °C` widersprechen der Untergrenze 54 °C in
`data/kerntemperatur-referenz.yaml` — Fachentscheidung offen, welche Seite recht hat ·
`content/cuts/pulled-pork.mdx` hat keinen Katalog-Eintrag (Seite existiert, aus dem
Atlas nicht erreichbar) · `id: 'roastbeef'` ≠ `slug: 'rumpsteak'` (einziger ID/Slug-Bruch).

**Nächster Schritt:** Rind-Kerntemperaturen entscheiden — Katalog an YAML angleichen
oder YAML korrigieren. Kein Raten (Regel 8c).

*Erledigt 10.08.2026:* 7 Schwein-Cuts lagen unter dem Sicherheitsminimum 63 °C
(presa/pluma erreichten es nie) → auf `63–65 °C` korrigiert.

---

## 4 · Wachstum

**Läuft:** Affiliate-Link-Checker (Mo 08:00 UTC), Social-Post-Entwürfe als Artifact
(human-gated, kein Auto-Posting), GEO-Check, Content-Wachstum (So 04:00 UTC),
`products/registry.yaml` mit 32 Einträgen.

**Hängt:** `lastChecked` in der Registry überall 22.05.2026 (~3 Monate ungeprüft) ·
4 offene Affiliate-TODOs (Santosgrills, Grillfürst, Ankerkraut, Otto Gourmet) ·
5 Einträge ohne jeden Affiliate-Parameter = aktuell reine Gratis-Links ·
Newsletter-Versand seit 10.08. nur noch manuell nach Vorschau-Freigabe.

**Nächster Schritt:** Affiliate-Programme anmelden — der einzige Monetarisierungs-Hebel
mit 0 € Startkosten (CLAUDE.md §5, Blocker 4).

---

## 5 · Kanzlei

**Läuft:** Rechts-Compliance-Scanner (täglich 06:00 UTC) gegen
`compliance/website-rechtscheck.yaml`, Impressum/Datenschutz/AGB/Widerruf live,
KI-Disclaimer nach EU AI Act, Existenzgründungs-Paket für das Jobcenter vollständig
(Businessplan, Lebenslauf, Finanzplan, §16c-Antrag 4.100 €, Anschreiben, Checkliste).

**Hängt:** Re-Prüfung der behobenen Anwalts-Mängel durch RAin Nieweg steht aus ·
Wortmarke „Steakakademie" — Gebühr offen · Berufsgenossenschaft/Unfallversicherung
erst nach Gewerbeanmeldung klärbar.

**Nächster Schritt (real, nur Uwe):** Gewerbe **erst nach** ESG-Antragseingang anmelden,
Aufnahmedatum 01.09.2026 im Antragsgespräch bestätigen.

---

## Zuordnungs-Regel für Neues

Bevor ein neuer Ordner, ein neues Tool oder eine neue Automatisierung entsteht:
**Zu welcher der fünf gehört es?** Die Antwort steht im Commit oder in der
Abteilungs-Doku — nicht implizit im Kopf. Findet sich keine Abteilung, ist das ein
Signal zum Nachdenken, kein Grund für eine sechste.
