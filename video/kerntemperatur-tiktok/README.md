# Kerntemperatur-Erklärer — TikTok, vertical

**Status:** Entwurf gerendert am 09.08.2026. **Nicht veröffentlicht** — Freigabe durch Uwe steht aus (Regel 4).

```bash
npm run video:kerntemperatur
```

Baut das Video vollständig neu: Narration → Timing → Render → Loudness → Prüfung.
Voraussetzung: `npm run video:setup` ist gelaufen und eine deutsche Piper-Stimme liegt bereit
(siehe unten).

---

## Ergebnis

| | |
|---|---|
| Datei | `out/kerntemperatur-tiktok.mp4` (gitignored) |
| Format | 1080×1920, 30 fps, H.264, faststart |
| Länge | 56,8 s |
| QA-Gate | `visual_qa` (Review-Frames + Pegel) — ohne Befund |
| Ton | AAC 192 kbit/s, **-14,0 LUFS** (TikTok-Norm), True Peak -1 dBTP |
| Größe | 7,5 MB |
| Untertitel | im Bild eingebrannt + `out/untertitel.srt` |
| Kosten | **0 €** — kein kostenpflichtiger Provider berührt |

---

## Warum Typografie statt Fleisch-Footage

**Korrektur zur ersten Fassung dieses Dokuments:** Es stimmt *nicht*, dass der Free-Path gar
keine Bildquelle hat. `direct_clip_search` zieht echtes Bewegtbild aus **archive.org, NASA und
Wikimedia Commons — ohne jeden API-Key**. Nur in der Cowork-Sandbox sind diese Hosts per
Netzwerk-Policy gesperrt (403 beim CONNECT, verifiziert), weshalb hier kein Footage verfügbar
war. Auf Uwes Rechner steht der Weg offen.

Keys brauchen weiterhin Pexels und Pixabay — für Standbilder (`image_generation 0/12`).

Das ist hier kein Notbehelf: Bei Kerntemperatur **ist die Zahl das Motiv**. Die Komposition
macht sie zum Helden — Glut-Hintergrund, Marken-Gold, ruhige Schnitte. Sobald die Keys da sind,
lässt sich B-Roll ergänzen, ohne die Struktur zu ändern.

---

## Aufbau

| Szene | Länge | Inhalt |
|---|---|---|
| `hook` | 8,1 s | „54 °C" groß — Zahl rastet ein |
| `problem` | 9,3 s | „Minuten lügen." — durchgestrichen in Ember |
| `zahlen` | 14,6 s | Vier Karten: Rind 54 · Schwein 63 · Geflügel 74 · Hack 70 |
| `carryover` | 11,0 s | Zahl steigt 51 → 54, Merksatz |
| `messen` | 7,2 s | Zwei Regeln: dickster Punkt · 3–5 Min. ruhen |
| `cta` | 6,5 s | Spickzettel, Domain, KI-Hinweis |

**Die Szenenlängen sind nicht geschätzt.** Der Build misst jede Piper-Narration mit `ffprobe`
und leitet die Länge aus der realen Audiodauer plus definiertem Vor-/Nachlauf ab
(`PADDING` in `scripts/video-kerntemperatur.mjs`).

---

## Fakten-Herkunft (Regel 8c)

Jeder Wert im Video stammt aus `data/kerntemperatur-referenz.yaml`. Die Zuordnung steht
maschinenlesbar in `script.json` unter `faktencheck`:

| Aussage | Quelle |
|---|---|
| Rind medium rare 54 °C | `badges.beef_mr.c` |
| Schwein saftig 63 °C | `badges.pork_juicy.c`, `sicherheit.schwein` |
| Geflügel 74 °C, immer durch | `badges.poultry.c`, `sicherheit.gefluegel = 72` (Minimum) |
| Hackfleisch 70 °C | `badges.burger.c`, `sicherheit.hackfleisch` |
| Nachziehen 2–5 °C, 3 °C vorher runter | `meta.carryover` |
| Dickster Punkt, nicht am Knochen | `meta.messen` |
| 3–5 Minuten ruhen | `meta.ruhen` |

Ändert sich die Referenz, muss `script.json` nachgezogen werden — der Build prüft das **nicht**
automatisch.

---

## Compliance-Stand

- **Regel 3 — kein Uwe-Auftritt:** eingehalten. Kein Gesicht, keine reale Person.
  Sprecherrolle Marco „Der Meister" (in `script.json` festgehalten).
- **Regel 1 — Werbekennzeichnung:** **nicht erforderlich.** Kein Affiliate-Link, keine
  Kooperation, kein beworbenes Produkt — nur Wissen plus Verweis auf den eigenen kostenlosen
  Leadmagnet. **Sobald ein Affiliate-Link oder eine Kooperation dazukommt, muss „Werbung"
  sichtbar ins Thumbnail** (LG Köln, 12.05.2026).
- **KI-Transparenz:** „STIMME KI-GENERIERT" wird in der Schlussszene eingeblendet und steht
  zusätzlich im Caption-Text.
- **Regel 4 — human-gated:** Das Video ist ein Entwurf. Es wurde nichts hochgeladen.

---

## Bekannte Schwächen

1. **Stimme.** Piper `de-thorsten-low` ist die kostenlose Offline-Variante und klingt hörbar
   maschinell — für einen Testlauf in Ordnung, für den Dauerbetrieb als „Marco" grenzwertig.
   Optionen: das größere `de_DE-thorsten-medium`-Modell (kostenlos, liegt aber auf
   huggingface.co) oder ElevenLabs (kostenpflichtig → Freigabe nötig).
2. **Keine Musik.** Das Playbook sieht ein warmes, minimales Bett bei `music_volume 0.07` vor.
   Free-Path-Quelle wäre Pixabay Music (Key nötig).
3. **Kein Bewegtbild.** Siehe oben — Stock-Keys fehlen.

---

## Stimme installieren

Die deutsche Piper-Stimme liegt nicht im Repo (58 MB):

```bash
curl -sSL -o /tmp/v.tar.gz \
  https://github.com/rhasspy/piper/releases/download/v0.0.2/voice-de-thorsten-low.tar.gz
mkdir -p ~/.piper/models && tar -xzf /tmp/v.tar.gz -C ~/.piper/models
```

Eine andere Stimme lässt sich über `PIPER_VOICE=/pfad/zur/stimme.onnx` einsetzen.

---

## Dateien

| Datei | Rolle |
|---|---|
| `script.json` | Narration, Untertitel, Visuals, Faktencheck, TikTok-Caption — **hier wird inhaltlich editiert** |
| `timeline.json` | generiert; gemessene Timings für Remotion |
| `out/` | generiert; Video + SRT (gitignored) |
| `audio/` | generiert; Piper-WAVs je Szene (gitignored) |
| `../remotion/steakakademie/` | die Komposition (TSX) |
| `../remotion/fonts/` | Playfair Display + DM Sans, lokal eingebettet |
| `../../scripts/video-kerntemperatur.mjs` | der Build |
