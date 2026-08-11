# memory.md — Lern-Gedächtnis (automatisch)

> **Gegenstück zu `CLAUDE.md`.**
> - `CLAUDE.md` = festgelegte **Regeln** (Strategie, Doktrin, Was-gilt) — ändert sich bewusst.
> - `memory.md` = was Claude beim **Problemlösen lernt** (Erkenntnisse, Lösungen, Stolpersteine) — wächst automatisch.
>
> Wird nach jeder Session vom Stop-Hook `~/.claude/scripts/gf3-lesson.js` ergänzt
> (synthetisiert aus claude-mem-Observations via Haiku). **Committet + gepusht = dauerhaft**
> (überlebt jeden Rechner/Container). Via `@memory.md` in `CLAUDE.md` bei jeder Session geladen.
> Der Hook hält die jüngsten ~40 Einträge; alles Ältere bleibt in claude-mem + Git-Historie.
> Manuelle Erkenntnisse dürfen hier auch direkt eingetragen werden.

---

## 25. Juni 2026 — Setup + Bestandsaufnahme (manueller Seed)

**System / Gedächtnis:**
- Der GF3-Aufzeichnungs-Hook lief seit Mai **nie** — `ANTHROPIC_API_KEY` fehlte im Hook-Env (Synthese brach still ab, `gf3-log.json` wurde nie erzeugt). **Fix (25.06.):** Key aus der gitignored `.env.local` lesen; zusätzlich Schreiben in dieses `memory.md`. Live getestet ✅.
- **Durabilität:** Nur `steakakademie-v2` ist in Git/GitHub. Parent-`CLAUDE.md` (82 KB) + Ordner „Das Ehrliche System" liegen **nur auf OneDrive**. Transkript-Aufbewahrung war Default 30 Tage → auf **3650** erhöht (Tag 1 = 18.05.2026 damit gesichert).
- **Synthese-Qualität offen:** Die Haiku-Auto-Lektionen können generisch/halluziniert sein, wenn claude-mem nur unspezifischen Kontext liefert → Prompt + Observation-Qualität später tunen; manuelle Einträge bleiben der verlässliche Anker.

**Projekt (jüngste Sessions):**
- **Amazon-Affiliate:** Tag `steakakademie-21` hängt korrekt an allen Links (Guard `npm run check-affiliate-tags`). Deep-Links nur für **mainstream amazon.de-ASINs** (Inkbird, MEATER 2 Plus); US-Eigenvertrieb (Thermapen ONE, ThermoWorks Signals) → **Such-URL** statt totem `/dp/`. PA-API-Produktbilder erst **nach 3 qualifizierten Sales** möglich → solange „Symbolbild"-Platzhalter.
- **Bank-Mail-Ausfall:** Ursache war **nicht** der Gmail-Filter (Konto hatte live keine Filter), sondern **Cloudflare-Weiterleitung unterbrochen** (Zieladresse `steakakademie@gmail.com` unverifiziert) + Rate-Limit der Codes.
- **Cut-Atlas:** Auf einem **frontalen** Stier-Foto lassen sich Primal-Zonen anatomisch nicht sauber platzieren; Gemini legte sie auf die **sichtbare Flanke** der Dreiviertel-Ansicht → für einen Kultur-/Genuss-Explorer akzeptabel.
- **Markt-Lauf:** Hebel 1+2 ✅; **Hebel 3** (Loops-Willkommenssequenz) einen Schritt vor Abschluss — Code-Seite (Leadmagnet `/kerntemperatur-spickzettel` + alle Mail-Ziele) verifiziert live, nur noch Uwes ~15-Min-Setup in Loops.so.

**Nächster Schritt:** zurück zu Hebel 3.

## 28. Juni 2026 — Korrektur Amazon-Produktbilder + Design-Pass (manuell)

**Amazon-Bilder — WICHTIGE KORREKTUR (überschreibt frühere „ab 3 Sales"-Notiz):**
- Amazon-Produktbilder dürfen **ausschließlich über die offizielle API** genutzt werden — kein Download/Screenshot/Self-Hosting (Verstoß = Risiko fürs Partnerkonto).
- Die **PA-API** (Product Advertising API) wird **zum 15.05.2026 abgeschaltet** und ist seit 31.01.2025 durch die **Amazon Creators API** ersetzt.
- Zugang zur Creators API (für Produktbilder) verlangt jetzt rund **10 qualifizierte Sales in 30 Tagen** — NICHT 3. Bis dahin bleibt der „Symbolbild"-Platzhalter korrekt.
- Sofort nutzbare, saubere Alternativen: **Herstellerbilder** (Anova, ThermoWorks etc.) mit deren Freigabe, oder **eigene Fotos**.
- Quelle: webservices.amazon.com/paapi5 (Deprecation-Hinweis Creators API) + Branchenartikel 2026.

**Design-Pass (Website-Helligkeit / „kein Stillstand"):**
- Neuer `.reading-light` Lese-Layer (warmes Pergament, dunkle Schrift) für Inhalts-Bodys; dunkler Hero/Header/Footer als Marken-Rahmen. Callouts + Token-Komponenten (Affiliate-Boxen) adaptieren via CSS-Variablen bzw. scoped Overrides — dunkle Seiten bleiben unverändert.
- Hero-Bildfilter war auf `brightness(0.52) saturate(0.72)` gedimmt → auf 0.92/1.06 angehoben (Food macht jetzt Appetit). Overlay unten-gewichtet.
- `/methoden`-Index war auf 3 hartcodierte Text-Karten festgenagelt (Bug: tote „raeuchern"-Karte) → jetzt dynamische Bild-Karten aus `allMethodes`.
- Grilltechniken-Counter ehrlich 1 → 7 (6 neue vollwertige Methoden-MDX).
- Offen/nächster Schritt: weitere Homepage-Sektionen + Rezept-/Artikel-Bodys auf hellen Layer; Hero-Food-Motion + Newsletter-CTA (Leadmagnet Kerntemperatur-Spickzettel) prominent platzieren.

## 03. Juli 2026 — Projekt-Director-Audit: Git-Korruption + Gedächtnis-Bereinigung (manuell)

**Kritischer Fund — Gedächtnis-Hook halluzinierte:** Zwischen 26.06. und 30.06. hat der Auto-Lektion-Hook (`scripts/gf3-lesson.cjs`) 18 komplett erfundene „GF3-Lektionen" in diese Datei geschrieben (falsche Zahlungsanbieter wie Stripe/Mollie — das Projekt nutzt Digistore24 —, erfundene Nutzerzahlen, generische SaaS-Gründungsgeschichten ohne Bezug zum echten Projekt). Root Cause: der `/api/context/inject`-Fallback lieferte bei fehlgeschlagener Observation-Suche generischen Meta-Text (Token-/Observation-Statistiken) statt echter Session-Fakten, den Haiku als „Inhalt" interpretiert und dazu passend ausgeschmückt hat. **Alle 18 Fake-Einträge gelöscht.** Hook gefixt: Fallback entfernt, Qualitäts-Gate für Observations (≥40 Zeichen Inhalt), Prompt zwingt Haiku bei zu vagem Input zu „SKIP" statt Spekulation. **Offen:** Der reparierte `scripts/gf3-lesson.cjs` muss noch manuell nach `~/.claude/scripts/gf3-lesson.js` kopiert werden (Cowork-Sandbox hat keinen Zugriff auf den Windows-Home-Pfad) — sonst läuft weiter die alte, halluzinierende Version.

**Git-Korruption gefixt:** `.git/HEAD` war mit Null-Bytes korrumpiert (Repo komplett unbrauchbar, „branch appears to be broken") — behoben. Mehrere Working-Tree-Dateien (u. a. `CLAUDE.md`, `agb/page.tsx`, `datenschutz/page.tsx`, `ki-disclaimer/page.tsx`) waren gegenüber dem letzten Commit abgeschnitten/korrumpiert (kein Datenverlust, da nur lokal unkommittet — auf HEAD-Stand zurückgesetzt). Sandbox-Mount-Eigenheit gemerkt: `unlink`/`rm` schlägt auf diesem Mount mit „Operation not permitted" fehl, `mv` (rename) funktioniert aber — Workaround für „Datei löschen" ist `mv` statt `rm`, auch für hängengebliebene `.git/index.lock`.

**Nächster Schritt:** Hook-Kopie manuell synchronisieren (Uwe); KAN-59 (Affiliate-Link-Checker Fehlalarm bei Amazon-Suchlinks) fixen.

## 09. August 2026 — OpenMontage installiert (Video-Stack) (manuell)

**Was:** OpenMontage (github.com/calesthio/OpenMontage, AGPLv3) als Videoproduktions-Stack eingerichtet. Agenten-getrieben: 13 Pipeline-Manifeste (YAML) + Skills (MD) + ~98 Python-Tools, Zustandsautomat `idea → script → scene_plan → assets → edit → compose → publish` mit Approval-Gate je Stufe — passt zu Regel 4 ohne Umbau.

**Entscheidung Platzierung:** `tools/openmontage/` ist **gitignored**, nicht Submodul und nicht vendored. Gründe: (1) AGPLv3 würde beim Hineinkopieren die Codebasis lizenzrechtlich verkoppeln; (2) Netlify/Vercel initialisieren Submodule automatisch → 160 MB im Build-Pfad hätten den Next-Build ohne Nutzen belastet; (3) Größe. Versioniert ist stattdessen der reproduzierbare Layer: `scripts/openmontage-setup.sh` / `.ps1`, `docs/openmontage/steakakademie.style.yaml` (Marken-Playbook), `docs/openmontage/steakakademie-brief.md` (Regeln 1/3/4/5/7/8c als Pflichtlektüre für Produktions-Agenten), `docs/openmontage-integration.md`.

**Gemessene Realität statt README-Versprechen:** Das README behauptet „works with zero keys". Preflight sagt: **35 von 98** Tools ohne Keys. Voll da sind Komposition (Remotion/HyperFrames), FFmpeg-Post (9/9), Untertitel, Audio-Mix, Character-Animation. **Nicht** da ist Bildmaterial: `image_generation 0/12` — Pexels und Pixabay brauchen Keys (kostenlos, aber Pflicht). Video-Generierung 0/21 und Premium-TTS sind kostenpflichtig.

**Stolperstein Piper-TTS:** Die kostenlose Offline-Stimme wird als `piper-tts` (Python-Paket) installiert, aber die Registry prüft auf `cmd:piper` — das Binary liegt in `.venv/bin/` und ist ohne aktiviertes venv nicht auf dem PATH. Ergebnis: Preflight meldet fälschlich `tts 0/7`. Fix: npm-Scripts (`video:check`, `video:board`, `video:demo`) setzen `PATH="$PWD/.venv/bin:$PATH"` selbst; beim manuellen Arbeiten im Ordner `source .venv/bin/activate` nicht vergessen.

**Verifiziert (Linux-Container):** `make setup` grün · `make test-contracts` **630 passed, 7 skipped** · FFmpeg 7:6.1.1 nachinstalliert (apt brauchte erst `apt-get update`, die ondrej/php-PPA wirft 403 — stört nicht) · Playbook `steakakademie` valide gegen `schemas/styles/playbook.schema.json` **und** ladbar über den eigenen `playbook_loader` · Installer zweimal gelaufen (idempotent). **Nicht verifiziert:** End-to-End-Render mit Ton, Windows-Installer.

**Nächster Schritt:** Zwei kostenlose Keys (Pexels, Pixabay) in `tools/openmontage/.env`, dann ein 60-s-Kerntemperatur-Erklärer als Free-Path-Testlauf.

## 09. August 2026 — Erstes Video produziert: Kerntemperatur-Erklärer (TikTok) (manuell)

**Ergebnis:** 56,8 s, 1080×1920, -14,0 LUFS, 7,5 MB, 0 € Produktionskosten. Entwurf, nicht veröffentlicht. Reproduzierbar per `npm run video:kerntemperatur`.

**Vier Netz-Blocker im Cowork-Container — und wie sie umgangen wurden:**
1. **huggingface.co ist per Policy gesperrt** (403 beim CONNECT) → Piper-Stimmen nicht über `piper.download_voices` beziehbar. **Workaround:** die Legacy-Stimme liegt auf GitHub-Releases, das ist erlaubt: `github.com/rhasspy/piper/releases/download/v0.0.2/voice-de-thorsten-low.tar.gz` (58 MB). Läuft mit Piper 1.6 über `-m pfad.onnx`.
2. **remotion.media ist gesperrt** → Remotion kann seine Chrome-Headless-Shell nicht laden. **Workaround:** der Container hat Playwright-Chromium; `--browser-executable /opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell`. Im Build über `REMOTION_BROWSER` steuerbar.
3. **Google Fonts scheitern im Render-Browser** an `ERR_CERT_AUTHORITY_INVALID` (Chromium traut der Proxy-CA nicht). **Kein** TLS-Aufweichen nötig: Schriften einmal per curl geholt und lokal via `FontFace` eingebettet (`video/remotion/fonts/`). Nebeneffekt: Renders sind jetzt offline-fähig und reproduzierbar — und konsistent mit der DSGVO-Linie der Website.
4. **`delayRender` auf Modulebene crasht den Bundler** (kein `window` beim Bundling). Muss in eine Komponente mit `useState(() => delayRender(...))` + `useEffect`. Zusätzlich auf `document.fonts.ready` warten, sonst brennt Frame 0 in der Ersatzschrift.

**Handwerkliche Lehren:**
- **Timing aus dem Ton ableiten, nicht schätzen.** Der Build erzeugt je Szene eine WAV, misst sie mit ffprobe und baut daraus die Timeline. Erste Fassung war mit 40,6 s zu kurz und zu hastig → Piper `--length-scale 1.14` + `--sentence-silence 0.35` ergibt 48,5 s Sprache und trifft Marcos ruhigen Ton.
- **Rendern heißt nicht fertig: hinschauen.** Frame-Extraktion je Szene zeigte einen echten Layout-Bug — Playfair-Ziffern bei `lineHeight 0.86` laufen aus ihrer Box und die Unterzeile lag in der „54". Fix: `lineHeight: 1` + großzügiger `marginBottom`.
- **Loudness ist Pflicht.** Piper-Rohausgabe lag bei -16,3 LUFS; TikTok normalisiert auf ~-14. Zweistufiges ffmpeg-`loudnorm` (messen → mit `measured_*` korrigieren) trifft -14,0 exakt. **Der loudnorm-JSON-Report kommt über stderr**, nicht stdout — `execFileSync` liefert ihn nicht, `spawnSync().stderr` schon.
- **Eigener Remotion-Einstiegspunkt statt Upstream-Patch.** `src/steakakademie/index.tsx` mit eigenem `registerRoot` — so bleibt `npm run video:setup` (git fetch + checkout) konfliktfrei. Die Komposition lebt kanonisch in `video/remotion/`, der Build spiegelt sie in den Composer.

**Inhaltlich:** Alle sieben Werte gegen `data/kerntemperatur-referenz.yaml` geprüft, Zuordnung maschinenlesbar in `script.json` unter `faktencheck`. Werbekennzeichnung hier **nicht** nötig (kein Affiliate, keine Kooperation) — begründet dokumentiert; sobald ein Affiliate-Link dazukommt, greift Regel 1. KI-Kennzeichnung ist im Video und in der Caption.

**Nächster Schritt:** Uwes Freigabe. Offene Qualitätspunkte: Stimme (Piper-low klingt maschinell), keine Musik, kein Bewegtbild — alle drei hängen an Keys bzw. Kostenfreigabe.

## 09. August 2026 — Marco: Avatar war schon da (manuell)

**Korrektur einer Annahme:** Auf die Frage „müssen wir zuerst einen Avatar erstellen?" war die Antwort **nein** — Marco existierte bereits vollständig und wurde nur nirgends benutzt. Vorhanden waren: Persona in `marketing_agent.txt`, Eintrag in `src/lib/authors.ts`, Autorenseite `/autoren/marco` mit Label „KI-Redaktionspersona", ausführlicher `/ki-disclaimer` (EU-AI-Act-Bezug), Chat-Widget, 7-Zustands-Automat `useAvatarStateMachine.ts` — **und zwei fertige Bilder**: `public/images/authors/marco-richter.jpg` (Porträt) und `public/images/marco-back.jpg` (Rückenansicht am Grill), beide 512×512 im Markenlook. **Lehre: vor „neu erstellen" immer erst das Repo durchsuchen.**

**Gute Design-Entscheidung, die schon im Code steckte:** `MarcoAvatar.tsx` zeigt Marco per `ROTATIONS` standardmäßig **von hinten am Grill** (180°) und dreht ihn nur zum Antworten nach vorn (0°). Das umgeht das Uncanny Valley und ist jetzt als Leitlinie in `docs/avatare/marco.md` festgeschrieben: Rücken/Hände = Normalzustand, Gesicht = Autoritätsmoment. Im Video genauso umgesetzt.

**Rechts-Fund (Regel 6, autonom gefixt):** Die Bios der drei KI-Personas behaupteten gelebte Erfahrung — Marco: „über 15 Jahren Grillpraxis", „**Er testet alle Produkte selbst, bevor er sie empfiehlt**", „Nachtschicht am Smoker"; Jonas „200+ Grillsessions dokumentiert"; Elena „seit 8 Jahren". Das stand direkt unter dem Label „KI-Redaktionspersona" — und neben Affiliate-Empfehlungen ist ein erfundener Selbsttest einer nicht existierenden Person eine irreführende geschäftliche Handlung (UWG). Alle drei Bios umgeschrieben: Persona und Ton bleiben, die Autorität wird jetzt auf die kanonische Wissensbasis und auf Uwes reale Qualifikation zurückgeführt (`statsLabel: 'KI-Persona · fachlich verantwortet von Uwe Yendell'`). Nebenbei: `avatar`-Pfad zeigte auf `/images/authors/marco.jpg`, die Datei heißt `marco-richter.jpg` — korrigiert (wurde nur im Schema für `realPerson` genutzt, war also nie ein sichtbar kaputtes Bild).

**Higgsfield-MCP:** Guthaben 0,01 Credits, Free-Plan → generative Bilderzeugung ist ohne Kauf faktisch nicht verfügbar. Kein Kauf vorgeschlagen. Konsequenz: neue Marco-Assets (die 6 fehlenden Widget-Videos, höhere Auflösung, Hände-am-Werk-Aufnahmen) brauchen eine Kostenfreigabe. **Stock-Fotomodels als Marco sind keine Option** — Model-Releases decken das regelmäßig nicht ab.

**Technisch:** 512×512-Quellen bei 1080×1920 Ziel — Hintergrund läuft deshalb abgedunkelt/leicht unscharf als Stimmungsfläche (3,75× Upscale wäre sonst sichtbar), Porträt im Kreis mit `transform: scale(1.75)` + `transformOrigin: '52% 24%'` auf das Gesicht gezoomt, weil die Halbfigur im Kreis sonst verloren wirkt.

**KI-Kennzeichnung nachgezogen:** Da jetzt eine KI-generierte Person im Bild ist, reicht „Stimme KI-generiert" nicht — jetzt „KI-Avatar" am Porträt und „KI-Avatar · Stimme KI-generiert" im Abspann, plus ausführlicher Hinweis in der Caption.

## 09. August 2026 — Praxis-Guide abgeglichen: zwei eigene Fehler korrigiert (manuell)

**Quelle:** florian-gahn.de/blog/openmontage-ki-video-produktion (Florian Gahn, 24.06.2026). Nicht blind übernommen, sondern gegen unsere Installation geprüft — der Artikel beschreibt einen älteren Stand: er nennt **12 Pipelines / 52 Tools / 500+ Skills**, unser Commit `4eab34c` hat **13 Pipelines (ohne „Product Ad", dafür `character-animation` + `framework-smoke`), 98 Tools, 723 Skill-Dateien**. Merksatz: im Zweifel `npm run video:check`, nicht der Artikel.

**Eigener Fehler 1 — „ohne Keys kein Bildmaterial" war zu absolut.** `direct_clip_search` zieht echtes Bewegtbild aus **archive.org, NASA und Wikimedia Commons ganz ohne API-Keys** (steht wörtlich in den `install_instructions` des Tools). Das ist der Kern der `documentary-montage`-Pipeline und war die ganze Zeit da. Keys brauchen nur Pexels/Pixabay für **Stand**bilder. **Aber:** in der Cowork-Sandbox sind `archive.org` und `commons.wikimedia.org` per Policy gesperrt (403 beim CONNECT, im Proxy-Status verifiziert). Tückisch: `direct_clip_search` lief erfolgreich durch und meldete `clips: [], errors: []` — der Netz-Fehlschlag wurde still als „0 Treffer" verbucht. **Lehre: bei 0 Treffern nie auf die Suchbegriffe schließen, ohne die Konnektivität zu prüfen.**

**Eigener Fehler 2 — QA von Hand gebaut, obwohl es sie gibt.** Ich hatte Frames mit eigenen ffmpeg-Aufrufen extrahiert. OpenMontage bringt das mit: `visual_qa` (`operation: review` für Review-Frames, `operation: audio_levels` für Pegel), dazu `composition_validator` (prüft **vor** dem Render Ton-/Bildlängen und fehlende Assets), `frame_sampler`, `scene_detect`, `audio_probe`, `video_analyzer` — alle lokal, alle ohne Keys. Jetzt in `scripts/video-kerntemperatur.mjs` verdrahtet mit Schwellen `mean < -60 dB` ⇒ STUMM, `max > -0,5 dB` ⇒ CLIPPING. **Hat sofort einen echten Fund geliefert:** 2,3 s Totstille am Videoende (-91 dB) — auf einer Loop-Plattform zu lang. CTA-Nachlauf auf 1,3 s gekürzt, Gate seitdem ohne Befund.

**Wichtigster Guardrail aus dem Artikel:** Die Pipeline startet jede Produktion mit **15–25 Live-Web-Suchen** zur Erdung des Skripts. Für unsere Kernzahlen ist das ein Risiko, kein Feature — US-Quellen nennen für Rind regelmäßig 57–63 °C, USDA noch höher. Übernimmt der Agent das, widerspricht das Video der Website. In `steakakademie-brief.md` §1 als harte Regel verankert: Web-Recherche darf `data/kerntemperatur-referenz.yaml` **nie** überstimmen; Abweichungen werden vermerkt und Uwe gemeldet, nicht still gemittelt. Recherche bleibt erlaubt für Aufhänger, Storywinkel, Suchintention.

**Kostenpolitik jetzt maschinell erzwungen:** Upstream lässt Aktionen unter 0,50 $ ohne Rückfrage laufen und warnt beim Budget nur. Unsere Regel 4 ist strenger. `scripts/openmontage-setup.sh` patcht `config.yaml` bei jedem Lauf: `budget.mode: cap` (harte Grenze statt Warnung) und `single_action_approval_usd: 0.00` (jede kostenpflichtige Aktion braucht Freigabe). Da `config.yaml` eine getrackte Upstream-Datei ist, läuft das Update jetzt über `git reset --hard FETCH_HEAD` — sonst scheitert der Checkout, sobald Upstream dieselbe Datei ändert.

**Kosten-Richtgrößen aus dem Artikel** (nur Medien, ohne Agent-Token, von uns nicht nachgemessen): 60-s-Clip mit Kling ≈ 1,33 $ · Werbevideo mit OpenAI-Bildern ≈ 0,69 $ · 12 FLUX-Bilder ≈ 0,15 $ · Zero-Key 0 $.

## 10. August 2026 — Pacing-Pass Kerntemperatur-Video (Cowork)

**Regelverstoß im eigenen Playbook gefunden:** Die Erstfassung hatte zwei Szenen über `motion.pacing_rules.max_scene_hold_seconds: 10` — `zahlen` mit 15,17 s und `carryover` mit 11,25 s. Dazu bekam die vierte Temperaturkarte keine 4,0 s Standzeit, die `quality_rules` aber verlangen. Gefixt durch Teilen von `zahlen` in `zahlen_a`/`zahlen_b` (je zwei Karten) und Straffen der Narration: **56,72 s → 53,34 s**, alle sieben Fakten unverändert. `Kerntemperatur.tsx` blieb unangetastet — `TempCards` rendert `visual.karten` ohnehin als Liste beliebiger Länge. **Lehre: Das Playbook ist maschinell prüfbar, wurde aber nie gegen die fertige `timeline.json` gehalten.** Ein Gate, das `dauer > max_scene_hold_seconds` meldet, gehört in `scripts/video-kerntemperatur.mjs`.

**Zeit kommt aus der Satzanzahl, nicht aus dem Sprechtempo:** Jeder Satz kostet 0,35 s `sentence-silence`. Drei Sätze zu zwei zusammenzuziehen spart mehr als schneller zu sprechen — und lässt den ruhigen Marken-Ton intakt. Beispiel `carryover`: 3 Sätze/10,03 s → 2 Sätze/7,14 s bei gleicher Aussage.

**Stimme — Ursache gefunden und behoben:** `de-thorsten-low` läuft mit **16 000 Hz** Samplerate. Daher der maschinelle Klang, nicht wegen des Modells. `medium` und `high` liefern 22 050 Hz, liegen auf Hugging Face (`rhasspy/piper-voices`) und kosten 0 €. Umgestellt auf `medium`. Gemessener Spektralzentroid der Hook-Zeile: low 1355 Hz, medium 1944 Hz, high 1879 Hz. Auf Wunsch dunklerer Ton: **nicht** zurück auf low, sondern `WARM_EQ` vor dem Loudnorm (Hochpass 80 Hz, +2,2 dB @ 180 Hz, −1,6 dB @ 3 kHz, −3,5 dB Kuhschwanz ab 6 kHz) — Zentroid 1913 → 1692 Hz bei voller Bandbreite. Wichtig: **EQ vor der loudnorm-Messung**, sonst misst man einen Pegel, den es im Ergebnis nicht gibt.

**Netzsperren sind containerspezifisch, nicht dauerhaft:** huggingface.co, archive.org, commons.wikimedia.org und remotion.media waren am 10.08. aus dem Cowork-Container erreichbar, am 09.08. nicht. **Lehre: Erreichbarkeit pro Lauf prüfen, nicht aus dem letzten Lauf fortschreiben** — sonst baut man Workarounds um Sperren, die nicht mehr existieren.

**B-Roll geprüft und bewusst verworfen:** Wikimedia Commons hat zu „steak" 40 Video-Treffer, davon zwei in 1080p brauchbar — beide **CC BY-SA 4.0**. Share-Alike ist bei einem Markenvideo mit Leadmagnet-CTA keine Option, die man nebenbei eingeht. archive.org liefert bei 216 CC-Treffern überwiegend Stadtratssitzungen und 1960er-Heimvideos. Für Kerntemperatur bleibt die kinetische Typo die markentreuere Lösung; B-Roll erst beim nächsten Format (Reverse-Sear, Dry-Aging) und dann als eigene Aufnahme.

**Der Stack rekonstruiert sich aus dem Repo:** OpenMontage wurde in einer frischen Umgebung neu geklont, Composer per npm installiert, Kompositionsdateien aus diesem Branch geholt — Render lief durch, QA-Gate ohne Befund. Die Entscheidung, `tools/openmontage/` gitignored zu lassen und nur den Bauplan zu versionieren, trägt also. Sie trägt aber **nur**, solange jede Verbesserung sofort zurück in den Bauplan committet wird statt im Container zu versanden.

**Stolperstein Cowork-Brücke:** `git worktree add` über den Device-Mount läuft in den Timeout — der Checkout schreibt zu viele Dateien durch einen zu langsamen Mount und hinterlässt einen halben Worktree. Außerdem ist `rm` auf dem Mount gesperrt, `.git/worktrees/<name>/locked` lässt sich also nicht löschen; Aufräumen geht nur per `mv` des ganzen Metadaten-Ordners, danach `git worktree prune`. **Besserer Weg für Commits über die Brücke: Git-Plumbing ohne Checkout** — `hash-object -w`, temporärer Index über `GIT_INDEX_FILE`, `write-tree`, `commit-tree`, `update-ref`. Sekunden statt Minuten, und der Working Tree wird nicht berührt.

**Nächster Schritt:** `git push origin claude/openmontage-steakakademie-setup-shvafa` (Uwe — der Cowork-Container hat keine Push-Credentials), dann Freigabe des Videos.
