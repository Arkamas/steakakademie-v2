# Ops-Heartbeat — der Totmannschalter der Automation

**Angelegt 13.09.2026.** Grund: `recipe-grow` lief vom 27.08. bis 13.09.2026 jede
Nacht grün durch, in 48 Sekunden, und erzeugte kein einziges Rezept. Die
Seed-Liste in `scripts/recipe-agent.mjs` war nach 84 Einträgen abgearbeitet —
für den Workflow kein Fehler, also kein Alarm. Siebzehn Tage Stillstand fielen
erst auf, als Uwe die Rezeptseite ansah.

## Der Denkfehler, den das behebt

GitHub Actions kennt nur zwei Zustände: *durchgelaufen* und *abgebrochen*.
„Hat nichts produziert" ist im grünen Fall enthalten. Jeder Agent, der aus einem
Vorrat schöpft — Seeds, RSS-Quellen, Warteschlangen — kann deshalb leise
versiegen, während das Dashboard weiter grün leuchtet.

Der Heartbeat prüft daher **Ergebnisse statt Läufe**: *Wann kam aus diesem
Bereich zuletzt etwas heraus?*

## Wie es läuft

| | |
|---|---|
| Workflow | `.github/workflows/ops-heartbeat.yml`, täglich 09:00 UTC |
| Skript | `scripts/ops-heartbeat.mjs` (nur Node-Bordmittel, kein `npm ci`) |
| Prüfpunkte | `data/ops-heartbeat.json` |
| Lokal | `npm run heartbeat` (meldet, ohne rot zu werden) |

Der Wächter läuft bewusst ohne Abhängigkeiten: ein Wächter, der an einem
kaputten `npm ci` scheitert, ist keiner.

## Prüf-Typen

- **`git`** — wann wurde ein Pfad zuletzt verändert? (`content/rezepte`, …)
  Braucht `fetch-depth: 0`, sonst findet `git log` nichts.
- **`supabase`** — wie alt ist der neueste Datensatz? (`content_drafts`)
  Optionaler `filter` in PostgREST-Syntax, z. B. `status=neq.draft`.
- **`workflow`** — wann ist ein Workflow zuletzt überhaupt gestartet?
  Deckt den Fall ab, dass **GitHub geplante Workflows in ruhigen Repos nach
  60 Tagen ohne Aktivität abschaltet** — dann läuft nichts mehr, und nichts
  wird rot, weil nichts läuft.

## Meldeweg bei Stillstand

1. **Job wird rot** → GitHub schickt die Fehlermail. Das ist der Kanal, der
   tatsächlich ankommt.
2. **GitHub-Issue** mit Label `ops-heartbeat` — eines, das aktualisiert und bei
   Besserung automatisch wieder geschlossen wird. Kein Issue-Regen.
3. **Jira-Ticket** (KAN) über `scripts/ops-alert-to-jira.mjs`, inklusive der
   bestehenden Eskalation ab dem dritten Vorfall.

## Neue Automation angelegt?

Dann gehört sie in `data/ops-heartbeat.json`. Felder:

```json
{
  "name": "Anzeigename",
  "typ": "git | supabase | workflow",
  "pfad": "content/…",            // typ git
  "tabelle": "…", "spalte": "…",  // typ supabase
  "filter": "status=neq.draft",   // typ supabase, optional
  "datei": "name.yml",            // typ workflow
  "maxTage": 7,
  "hinweis": "Was zu tun ist, wenn das hier anschlägt."
}
```

`maxTage` großzügig über dem Takt ansetzen: ein wöchentlicher Lauf braucht
mindestens 10 Tage Frist, sonst schlägt der Wächter bei jedem Feiertag an und
wird nach drei Fehlalarmen ignoriert — dann ist er wertlos.

## Fehlende Secrets

Fehlen `NEXT_PUBLIC_SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY`, wird der
betroffene Prüfpunkt **übersprungen, nicht rot**. Ein Wächter, der wegen eines
fehlenden Secrets dauerrot steht, erzieht zum Wegschauen.
