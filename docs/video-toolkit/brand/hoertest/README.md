# Hörtest Marco — Stimm-Abnahme

**Zweck:** Marcos Stimme einmal festlegen und dann einfrieren. Eine Stimme, die
sich mitten in einer Lektionsreihe ändert, ist teurer als jede Nachproduktion —
und Marco ist seit Monaten als Autor öffentlich sichtbar.

## Ausführen

```powershell
cd C:\Dev\claude-code-video-toolkit
.\.venv\Scripts\Activate.ps1
.\brands\steakakademie\hoertest\hoertest-marco.ps1
```

Voraussetzung: `MODAL_QWEN3_TTS_ENDPOINT_URL` steht in `.env`.

## Was erzeugt wird

Sieben Takes desselben Absatzes:

| Datei | Weg | Idee |
|---|---|---|
| A1-ryan-storyteller | eingebauter Sprecher | Erzählton, Standard-Referenz |
| A2-ryan-calm | eingebauter Sprecher | ruhiger, langsamer |
| A3-aiden-storyteller | eingebauter Sprecher | zweite Männerstimme |
| B1-whiskey-baritone | Voice-Design | „tiefer rauchiger Bariton, dreißig Jahre am Feuer" |
| B2-dunkel-ruhig | Voice-Design | sonor, minimal betont, nah |
| B3-warm-erfahren | Voice-Design | kumpelhaft-präzise |
| B4-lagerfeuer | Voice-Design | Erzähler mit Pausen, Gravitas ohne Pathos |

## Warum zwei Spuren

Qwen3-TTS bringt **nur zwei männliche Standardstimmen** mit (Ryan, Aiden — beide
als Englisch hinterlegt, können aber Deutsch). Die gewünschte tiefe, rauchige
Whiskey-Stimme ist damit nicht garantiert. Der **Voice-Design-Modus**
(`--design-instruct`) baut stattdessen eine Stimme nach Charakterbeschreibung.

Das ist rechtlich der saubere Weg: **kein Klonen einer realen Person**, also
keine Einwilligung, kein Sprecher-Buyout, keine Nutzungsrechte-Frage. Der
Klon-Weg (`--ref-audio`) bleibt bewusst ungenutzt.

## Worauf beim Hören achten

1. **Aussprache deutscher Fachwörter** — „Maillard", „Kerntemperatur",
   „vierundfünfzig Grad". Piper scheiterte hier („Küche" → „Käsche").
2. **Tempo** — soll ruhig sein, nicht gehetzt. Der Test klemmt auf 135 WpM.
3. **Ton** — kumpelhaft und gehoben zugleich, nie Werbestimme (Marken-DNA).
4. **Konsistenz** — klingt Satz 1 wie Satz 4, oder kippt die Stimme?

## Danach

Gewinner in `docs/video-toolkit/brand/voice.json` eintragen — **im Hauptrepo**, nicht in
der Toolkit-Kopie unter `tools/video-toolkit/brands/steakakademie/`, sonst ist er beim
nächsten Setup weg:

- Bei einem **A-Take**: `qwen3.speaker` auf `Ryan`/`Aiden`, `qwen3.tone` setzen.
- Bei einem **B-Take**: den exakten `design-instruct`-Text in `qwen3.instruct`
  übernehmen — Wort für Wort, sonst kommt eine andere Stimme heraus.

Dann den Block `_offen` in `voice.json` löschen. Die Entscheidung selbst mit Datum nach
`docs/video-toolkit-setup.md` § 6, den Stand nach `docs/COCKPIT.md`, Abteilung 2 (Studio).
**Nicht** nach `memory.md`: die Datei ist am 27.08.2026 bewusst entfernt worden und wird
nicht wiederbelebt (Ablage-Regel: CLAUDE.md § 6).
