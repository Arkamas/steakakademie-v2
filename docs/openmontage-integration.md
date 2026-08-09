# OpenMontage — Videoproduktion für die Steakakademie

**Status:** installiert und verifiziert am 09.08.2026 (Upstream-Commit `4eab34c`).
**Upstream:** https://github.com/calesthio/OpenMontage · **Lizenz:** GNU AGPLv3

---

## 1. Was das Tool ist

OpenMontage ist ein agenten-getriebenes Videoproduktions-System: keine Klick-Oberfläche,
sondern ~13 Pipeline-Manifeste (YAML), Skill-Dateien (Markdown) und rund 100 Python-Tools,
die ein KI-Coding-Assistent (Claude Code) als Regie-Anweisung liest und ausführt.
Der Ablauf ist ein Zustandsautomat:

```
idea → script → scene_plan → assets → edit → compose → publish
```

An jeder Stufe sitzt ein Approval-Gate. Das passt exakt zu **Regel 4** (human-gated):
Der Agent produziert, **Uwe gibt frei**.

**Kostenlage — nachgemessen, nicht aus dem README übernommen:** Ohne jeden API-Key sind
**35 von 98** Tools verfügbar (Preflight vom 09.08.2026). Das trägt die gesamte
Produktionskette *außer* Bildbeschaffung:

- **Voll da, ohne Keys:** Komposition (Remotion, HyperFrames), Post-Produktion
  (FFmpeg — 9/9), Untertitel (2/2), Audio-Mischung (2/2), Character-Animation (6/6),
  Screen-Capture (2/2), Analyse (7/13), Publish (1/1).
- **Da, aber PATH-abhängig:** **Piper TTS** (kostenlose Offline-Stimme). Das Binary liegt
  in `.venv/bin/piper` — ohne aktiviertes venv meldet der Preflight `tts 0/7`. Die
  npm-Scripts setzen den PATH selbst; wer manuell im Ordner arbeitet, muss
  `source .venv/bin/activate` ausführen.
- **Echtes Archiv-Footage — ganz ohne Keys:** `direct_clip_search` zieht Bewegtbild aus
  **archive.org, NASA und Wikimedia Commons**; das Tool sagt selbst: „archive.org, nasa, and
  wikimedia work without API keys". Das ist der Weg zu echtem Filmmaterial zum Nulltarif und
  der Kern der `documentary-montage`-Pipeline.
  ⚠️ **In der Cowork-Sandbox blockiert** — der Container weist `archive.org` und
  `commons.wikimedia.org` beim CONNECT mit 403 ab. Getestet: das Tool läuft durch und meldet
  „0 Treffer", **ohne** einen Fehler zu setzen. Auf Uwes Rechner steht der Weg offen.
- **Braucht kostenlose Keys:** Pexels und Pixabay — für **Stand**bilder und zusätzliches
  Stock-Footage (`image_generation 0/12`). Registrierung gratis.
  → Sollte Uwe besorgen, kostet nichts.
- **Kostenpflichtig, bleibt human-gated:** Video-Generierung (Veo, Kling, Runway …, 0/21),
  ElevenLabs/OpenAI/Google TTS, Suno, HeyGen-Avatare (0/4).

Die README-Aussage „works with zero keys" stimmt also für Schnitt, Komposition, Vertonung
**und Archiv-Footage** — nicht für generierte oder Stock-Standbilder.

---

## 2b. Kostenrahmen und Budget-Wächter

OpenMontage schätzt Kosten **vor** der Ausführung und stoppt an harten Grenzen. Werte aus
`config.yaml`, nachgeprüft in unserer Installation:

| Einstellung | Upstream-Standard | **Bei uns** |
|---|---|---|
| `budget.total_usd` | 10,00 $ pro Projekt | 10,00 $ |
| `budget.mode` | `warn` (nur Warnung) | **`cap`** — harte Grenze |
| `single_action_approval_usd` | 0,50 $ | **0,00 $** — jede kostenpflichtige Aktion |
| `require_approval_for_new_paid_tool` | `true` | `true` |

Die beiden verschärften Werte setzt `scripts/openmontage-setup.sh` bei jedem Lauf neu.
Damit erzwingt das Werkzeug **Regel 4 mechanisch**, statt sich darauf zu verlassen, dass ein
Agent sie im Kopf behält.

Größenordnungen aus den Entwickler-Demos (nur **Medien**kosten, ohne Token-Kosten des
Agenten): 60-s-Clip mit Kling-Videomodell ≈ 1,33 $ · Werbevideo mit OpenAI-Bildern ≈ 0,69 $ ·
12 FLUX-Bilder in Remotion animiert ≈ 0,15 $ · Zero-Key-Pfad 0 $.
*Quelle: Praxis-Guide von Florian Gahn (24.06.2026) — von uns nicht nachgemessen,
als Richtgröße behandeln.*

---

## 2c. Qualitäts-Gates nach dem Render

Das System prüft seinen eigenen Output, statt ihn nur abzuliefern. Für uns relevant und
**bereits in `scripts/video-kerntemperatur.mjs` verdrahtet**:

- `visual_qa` mit `operation: review` — zieht Review-Frames aus dem fertigen Video
  (schwarze Bilder, kaputte Overlays fallen so auf).
- `visual_qa` mit `operation: audio_levels` — misst mean/max-Pegel an mehreren Stellen.
  Unser Build wertet das aus: `mean < -60 dB` ⇒ **STUMM**, `max > -0,5 dB` ⇒ **CLIPPING**.
- Weitere lokale Prüfer ohne Keys: `composition_validator` (Ton-/Bild-Längen, fehlende
  Assets — **vor** dem Render), `frame_sampler`, `scene_detect`, `audio_probe`, `video_analyzer`.

Das hat sich sofort bezahlt gemacht: Der erste Lauf meldete am Videoende 2,3 s mit -91 dB —
also komplette Stille auf einer Loop-Plattform. Nachlauf gekürzt, Gate seitdem ohne Befund.

---

## 2. Warum es NICHT im Repo liegt

`tools/openmontage/` ist **gitignored**. Drei Gründe:

1. **Lizenz.** OpenMontage steht unter **AGPLv3**. Ein Hineinkopieren des Quellcodes in
   dieses Repo würde die Steakakademie-Codebasis lizenzrechtlich mit AGPL verkoppeln.
   Als getrennt installiertes Werkzeug, das lediglich Videos *produziert*, entsteht diese
   Kopplung nicht — die erzeugten Videos gehören uns.
   *(Das ist eine begründete Einschätzung, keine Rechtsberatung. Falls die Steakakademie
   je AGPL-Code ausliefern oder OpenMontage in die Website integrieren will, muss das
   ein Anwalt prüfen.)*
2. **Build-Sicherheit.** Netlify/Vercel initialisieren Submodule automatisch. Ein 160-MB-
   Submodul im Build-Pfad hätte den Next-Build verlangsamt oder gebrochen — ohne jeden
   Nutzen, weil die Website den Video-Stack nicht braucht.
3. **Größe.** 160 MB Quellcode plus venv und `node_modules` gehören nicht in ein
   Content-Repo.

**Was stattdessen versioniert ist** — alles, was die Installation reproduzierbar und
markenkonform macht:

| Datei | Zweck |
|---|---|
| `scripts/openmontage-setup.sh` | Installer Linux/macOS, idempotent |
| `scripts/openmontage-setup.ps1` | Installer Windows (für Uwes Rechner) |
| `docs/openmontage/steakakademie.style.yaml` | Marken-Playbook (Farben, Typo, Motion, Audio, Qualitätsregeln) |
| `docs/openmontage/steakakademie-brief.md` | Pflicht-Briefing: Regeln 1/3/4/5/7/8c für jede Produktion |
| `docs/openmontage-integration.md` | dieses Dokument |

Der Installer kopiert Playbook und Briefing bei jedem Lauf in die Installation. Deshalb:
**immer die Dateien in `docs/openmontage/` bearbeiten, nie die Kopien in `tools/openmontage/`** —
letztere werden überschrieben.

---

## 3. Installation

```bash
npm run video:setup
```

Windows:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\openmontage-setup.ps1
```

Der Installer klont/aktualisiert das Upstream-Repo, baut das venv, installiert die
Python-Abhängigkeiten, Remotion, Piper TTS, legt `.env` an, spielt den Marken-Layer ein
und **validiert das Playbook gegen OpenMontages JSON-Schema**. Erneutes Ausführen
aktualisiert die Installation.

**Voraussetzungen** (der Installer prüft sie und bricht mit Klartext ab):
Python ≥ 3.10 · Node ≥ 18 (Remotion mag 22+) · FFmpeg · Git

FFmpeg ist der einzige, der auf Windows typischerweise fehlt: `winget install Gyan.FFmpeg`.

---

## 4. Benutzung

```bash
npm run video:check    # Preflight: welche Tools/Provider sind verfügbar
npm run video:board    # Backlot — das Live-Produktionsboard im Browser
npm run video:demo     # Demo-Renders ohne API-Keys (Funktionstest)
```

Für eine echte Produktion: Claude Code in `tools/openmontage/` arbeiten lassen und den
Auftrag in Klartext formulieren, z. B.

> Lies STEAKAKADEMIE-BRIEF.md. Baue ein 75-Sekunden-Vertical-Erklärvideo zur
> Kerntemperatur beim Ribeye, Sprecher-Rolle Marco, Style-Playbook `steakakademie`,
> Free-Path (Piper TTS, keine kostenpflichtigen Provider). Temperaturen aus
> `../../data/kerntemperatur-referenz.yaml`, nichts schätzen. Stopp vor `compose`
> zur Freigabe.

Der Agent recherchiert, schreibt Script und Szenenplan, erzeugt Assets, schneidet und
rendert — mit Halt an jedem Approval-Gate.

### Pipelines in unserer Installation (13, nachgezählt)

| Pipeline | Wofür | Für uns |
|---|---|---|
| `animated-explainer` | Bildung, Tutorials, recherchierte Themen | **Prio 1** — Kerntemperatur & Methoden |
| `documentary-montage` | Video-Essays aus echtem Archiv-Footage | **Prio 2** — Cut-Porträts, sobald Archive erreichbar |
| `talking-head` | footage-geführte Sprechervideos | **Prio 3** — YouTube-Guides |
| `cinematic` | Trailer, Teaser, Mood-Edits, Brand Films | **Prio 4** — Diplom-/Produkt-Trailer |
| `animation` | Social, Produkt-Demos, Kinetic Typography | Shorts |
| `clip-factory` | viele kurze Clips aus einer langen Quelle | YouTube → TikTok-Recycling |
| `podcast-repurpose` | Podcast-Highlights als Video | später |
| `hybrid` | Quellmaterial + KI-Support-Visuals | später |
| `localization-dub` | Untertitel, Synchronisation | später (EN-Markt) |
| `avatar-spokesperson` | Corporate Comms, Training | nur mit Kostenfreigabe (HeyGen o. ä.) |
| `character-animation` | animierte Figuren | offen |
| `screen-demo` | Software-Bildschirmaufnahmen | für uns irrelevant |
| `framework-smoke` | interner Selbsttest | Diagnose |

> Der Praxis-Guide von Florian Gahn nennt 12 Pipelines inkl. „Product Ad / Promo" sowie
> 52 Tools und 500+ Skills. Unsere Installation (Commit `4eab34c`) hat **13 Pipelines
> (ohne Product-Ad, dafür mit `character-animation` und `framework-smoke`), 98 Tools und
> 723 Skill-Dateien** — der Artikel beschreibt einen älteren Stand. Im Zweifel gilt
> `npm run video:check`, nicht der Artikel.

**Render-Engines:** Der Agent wählt zwischen **Remotion** (React — datengetriebene Szenen,
Charts, Stat-Reveals) und **HyperFrames** (HTML/CSS/GSAP — Kinetic Typography, SVG-Animation).
Unser Kerntemperatur-Video nutzt Remotion über eine **eigene** Komposition
(`video/remotion/steakakademie/`), nicht die generische Explainer-Komposition.

Priorisierung für die Steakakademie steht in `docs/openmontage/steakakademie-brief.md` §3.

---

## 5. Geltende Regeln (Kurzfassung)

Das vollständige Briefing liegt in `docs/openmontage/steakakademie-brief.md` und wird als
`STEAKAKADEMIE-BRIEF.md` in die Installation gespiegelt. Kern:

- **Regel 8c:** Kerntemperaturen/Cuts/Reifung nur aus `data/kerntemperatur-referenz.yaml`.
- **Regel 3:** kein persönlicher Auftritt von Uwe — Avatare Marco/Jonas/Elena.
- **Regel 1:** „Werbung"/„Anzeige" sichtbar im Thumbnail, falls Werbung/Affiliate.
- **Regel 4:** kein Auto-Publishing, Approval-Gates bleiben aktiv.
- **Regel 7:** keine erfundenen Zahlen oder Quellen im Script.
- **Kosten:** Paid-Provider erst nach Kostenschätzung und Freigabe.

---

## 6. Verifikationsstand (09.08.2026, Linux-Container)

| Prüfung | Ergebnis |
|---|---|
| `scripts/openmontage-setup.sh` | läuft sauber durch, idempotent (zweiter Lauf getestet) |
| `make setup` | erfolgreich (venv, requirements, Remotion, Piper TTS, HyperFrames-Runtime `0.7.102`) |
| `make test-contracts` | **630 passed**, 7 skipped |
| `make preflight` | **35 von 98** Tools ohne Keys verfügbar; `video_post` 9/9, `tts` 1/7 (Piper, venv-aktiv) |
| FFmpeg | 7:6.1.1 installiert |
| Playbook-Validierung | `steakakademie.yaml` gültig — gegen `playbook.schema.json` **und** über OpenMontages eigenen `playbook_loader` geladen |

**Nicht verifiziert:** ein vollständiger End-to-End-Render mit Ton, und die Installation
auf Windows. Der Container ist flüchtig — die Installation hier überlebt die Session
nicht; reproduziert wird sie über `npm run video:setup`.

---

## 6b. Grenzen, die wir einkalkulieren müssen

Nüchtern, damit später niemand überrascht ist:

1. **Volle Modell-Abhängigkeit.** Die Orchestrierung macht der KI-Agent. Verliert er den
   Kontext oder ignoriert Anweisungen, bricht die Produktion — nicht mit einem Fehler,
   sondern mit einem schlechten Video. Genau deshalb sind unsere Regeln als **Datei** im
   Repo verankert (`steakakademie-brief.md`) und nicht als Chat-Anweisung.
2. **Kein GUI.** Alles läuft im Terminal. Für Uwe heißt das: Der Weg zum fertigen Video führt
   über Claude Code, nicht über eine Timeline mit Buttons. Das Backlot-Board
   (`npm run video:board`) zeigt den Fortschritt, ist aber nur Anzeige, kein Editor.
3. **Fremde APIs sind fragil.** Der Premium-Pfad hängt an Anbietern, die Preise ändern oder
   ausfallen. Der Free-Path (Piper, Archive, Remotion, FFmpeg) ist deshalb nicht nur billiger,
   sondern auch stabiler — ein Argument, ihn als Standard zu behalten.
4. **Netz-Policy schlägt durch.** In dieser Sandbox sind huggingface.co, remotion.media,
   archive.org und Wikimedia gesperrt. Alle Umgehungen stehen im Build; auf einem normalen
   Rechner entfallen sie.
5. **AGPL-3.0.** Bestätigt unsere Platzierungs-Entscheidung aus §2: Wer auf OpenMontage einen
   kommerziellen Dienst baut, muss den eigenen Code offenlegen. **Videos produzieren ist davon
   nicht betroffen** — die Ergebnisse gehören uns. Das Werkzeug bleibt außerhalb des Repos.

## 7. Offene Punkte

1. **Erstlauf auf Uwes Rechner** — Windows-Installer real durchlaufen lassen (FFmpeg via
   winget vorher installieren).
2. **Zwei kostenlose Keys holen** (5 Minuten, 0 €): `PEXELS_API_KEY`, `PIXABAY_API_KEY`
   in `tools/openmontage/.env`. Ohne sie hat das System kein Bildmaterial.
3. **Free-Path-Testvideo** — ein 60-s-Kerntemperatur-Erklärer ohne Bezahl-Provider, um
   Qualität und Renderdauer einzuschätzen, bevor über Kosten entschieden wird.
4. **Avatar-Stimmen** — Piper klingt maschinell. Wenn Marco/Jonas/Elena eine tragfähige
   Stimme brauchen, ist ElevenLabs der naheliegende Kandidat (kostenpflichtig → Freigabe).
5. **Ablage der Ergebnisse** — Videos gehören nicht ins Git-Repo. Ziel ist R2 (dort liegen
   bereits die Bilder, siehe `scripts/migrate-to-r2.mjs`).
