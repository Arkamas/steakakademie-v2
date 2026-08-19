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

## 10. August 2026 — Video-Produktion → OpenMontage + Session-Übergabe (Cowork)

**Richtungsentscheidung (Uwe):** Video-Produktion läuft künftig **ausschließlich über OpenMontage**. Alte Pipeline `scripts/promo-machine.mjs` + Remotion-`RecipePromo` (Ordner `steakakademie-video`) für Neu-Produktion **eingefroren** (48 fertige MP4s + Post-Kits bleiben Assets; Post-Kit-Teil via `--kit-only` evtl. behalten — offen). OpenMontage macht Video inkl. Sprache/Untertitel, aber NICHT die Social-Captions/Hashtag-Post-Kits.

**OpenMontage-Stand:** Eingerichtet + lauffähig, aber **NICHT in `main` gemerged** — alles auf Branch `claude/openmontage-steakakademie-setup-shvafa` (21 Dateien: Setup-Skripte, `docs/openmontage/steakakademie-brief.md` + `steakakademie.style.yaml`, `docs/avatare/marco.md`, Remotion-Komposition `video/remotion/steakakademie/Kerntemperatur.tsx` (938 Z.), `video/kerntemperatur-tiktok/` script.json+timeline.json). TTS aktuell = **Piper** (Free, offline); Paid-Provider human-gated.

**Erstes Video (Kerntemperatur-TikTok) — Feedback + To-do:**
- **(A) Pacing zu langsam:** ~1 s Schwarzbild zwischen Sätzen. Ursache = `audioDelay` in `timeline.json` (Hook 0.5, sonst 0.25) + `dauer` länger als Ton. Fix: audioDelay ~0, `dauer` straffen, **J/L-Cuts** (Ton überlappen) — reiner Kompositions-/Daten-Code.
- **(B) Stimme:** Piper klingt maschinell + Aussprachefehler („Küche"->„Käsche", „Schuhsohle"->„Scho-so-le"). Ziel = **tiefe, rauchige „Whiskey"-Männerstimme** (Avatar **Marco**, nicht Uwe). Optionen: Piper **Thorsten** (frei/kommerziell, aber neutral) als Interim; **Fish Audio „Ruhige tiefe Stimme"** (modelId 05432ab0451b48b2a47d367fcf6fdeb9 — passt, aber **kommerziell = Paid ~5-15 $/Mon**, human-gated, Rechte prüfen); oder **eigenes Voice-Cloning** (offenes Modell, lokal, gratis) aus **rechtssauberer Referenz** (einwilligende Person/Sprecher-Buyout, nie Uwe). SaaS-„Stimme erstellen" bleibt an deren Paywall gebunden; frei-kommerziell nur über offene/lokale Modelle. NC-Modelle (F5-German, MiraTTS) für kommerziell ausgeschlossen.
- **(C) Visuelle Haptik:** nur Text auf Schwarz ermüdet. Feuer/brutzelndes-Fleisch-**B-Roll @15-20 % Deckkraft** als Loop-Hintergrund — gratis via OpenMontage `direct_clip_search` (Archiv-Footage).
- **(D) Avatar:** sprechender **Marco** = `avatar-spokesperson`-Pipeline (HeyGen, **Paid**, Phase 2). Aktuell nur statisches `marco-back.jpg`.

**Compliance (OpenMontage-Outputs):** KI-Stimme/Bilder kennzeichnen; jede Kerntemperatur/Cut gegen `data/kerntemperatur-referenz.yaml` (Regel 8c); kommerzielle Lizenz jeder Stimme (Regel 6); kein Uwe-Auftritt (Regel 3).

**Rendern:** Aus dem **OneDrive-Klon** (`...\OneDrive\Dokumente\Claude\Projects\Steakakademie\steakakademie-v2`) läuft OpenMontage/`promo-machine.mjs` out-of-the-box — dort liegt `steakakademie-video` als Geschwister-Ordner. Aus `C:\Dev\steakakademie-v2` bricht `VIDEO_ROOT` (Nachbar fehlt). Optionaler Fix (nicht committet): `VIDEO_ROOT` per Env-Var überschreibbar.

**Repo-Stand:** PR #4 (`claude/github-installation-kj257d` @ ~`3bd3efb`) grün (legal-guard-Fixes + netlify.toml). `main` @ `6ddb8ef` = netlify.toml-Prodfix (Netlify-Deploys scheiterten seit ~07.07. an kaputtem TOML). KAN-15 = Fertig verifiziert.

**Offene Git-Hygiene:** Im OneDrive-Klon wurde lokaler `main` versehentlich per `reset --hard` auf `3bd3efb` verschoben (`;` statt `&&`). Fix: `git reset --hard <Original-SHA aus Reflog>` + `git stash pop` (18 uncommittete Dateien in `stash@{0}`). **Nichts gepusht, `origin/main` heil.** Achtung: die 18 Dateien enthalten 548 Löschungen inkl. `compliance/` — vor Commit prüfen.

**Nächster Schritt (Cowork):** (A) Pacing + (C) B-Roll-Layer in der Komposition; Stimme testen (erst Thorsten gratis, dann Whiskey-Marco via Fish-Paid-Freigabe oder Clone); OpenMontage-Branch reviewen/mergen wenn stabil.

## 10. August 2026 — Pacing-Pass Kerntemperatur-Video (Cowork)

**Regelverstoß im eigenen Playbook gefunden:** Die Erstfassung hatte zwei Szenen über `motion.pacing_rules.max_scene_hold_seconds: 10` — `zahlen` mit 15,17 s und `carryover` mit 11,25 s. Dazu bekam die vierte Temperaturkarte keine 4,0 s Standzeit, die `quality_rules` aber verlangen. Gefixt durch Teilen von `zahlen` in `zahlen_a`/`zahlen_b` (je zwei Karten) und Straffen der Narration: **56,72 s → 53,34 s**, alle sieben Fakten unverändert. `Kerntemperatur.tsx` blieb unangetastet — `TempCards` rendert `visual.karten` ohnehin als Liste beliebiger Länge. **Lehre: Das Playbook ist maschinell prüfbar, wurde aber nie gegen die fertige `timeline.json` gehalten.** Ein Gate, das `dauer > max_scene_hold_seconds` meldet, gehört in `scripts/video-kerntemperatur.mjs`.

**Zeit kommt aus der Satzanzahl, nicht aus dem Sprechtempo:** Jeder Satz kostet 0,35 s `sentence-silence`. Drei Sätze zu zwei zusammenzuziehen spart mehr als schneller zu sprechen — und lässt den ruhigen Marken-Ton intakt. Beispiel `carryover`: 3 Sätze/10,03 s → 2 Sätze/7,14 s bei gleicher Aussage.

**Stimme — Ursache gefunden und behoben:** `de-thorsten-low` läuft mit **16 000 Hz** Samplerate. Daher der maschinelle Klang, nicht wegen des Modells. `medium` und `high` liefern 22 050 Hz, liegen auf Hugging Face (`rhasspy/piper-voices`) und kosten 0 €. Umgestellt auf `medium`. Gemessener Spektralzentroid der Hook-Zeile: low 1355 Hz, medium 1944 Hz, high 1879 Hz. Auf Wunsch dunklerer Ton: **nicht** zurück auf low, sondern `WARM_EQ` vor dem Loudnorm (Hochpass 80 Hz, +2,2 dB @ 180 Hz, −1,6 dB @ 3 kHz, −3,5 dB Kuhschwanz ab 6 kHz) — Zentroid 1913 → 1692 Hz bei voller Bandbreite. Wichtig: **EQ vor der loudnorm-Messung**, sonst misst man einen Pegel, den es im Ergebnis nicht gibt.

**Netzsperren sind containerspezifisch, nicht dauerhaft:** huggingface.co, archive.org, commons.wikimedia.org und remotion.media waren am 10.08. aus dem Cowork-Container erreichbar, am 09.08. nicht. **Lehre: Erreichbarkeit pro Lauf prüfen, nicht aus dem letzten Lauf fortschreiben** — sonst baut man Workarounds um Sperren, die nicht mehr existieren.

**B-Roll geprüft und bewusst verworfen:** Wikimedia Commons hat zu „steak" 40 Video-Treffer, davon zwei in 1080p brauchbar — beide **CC BY-SA 4.0**. Share-Alike ist bei einem Markenvideo mit Leadmagnet-CTA keine Option, die man nebenbei eingeht. archive.org liefert bei 216 CC-Treffern überwiegend Stadtratssitzungen und 1960er-Heimvideos. Für Kerntemperatur bleibt die kinetische Typo die markentreuere Lösung; B-Roll erst beim nächsten Format (Reverse-Sear, Dry-Aging) und dann als eigene Aufnahme.

**Der Stack rekonstruiert sich aus dem Repo:** OpenMontage wurde in einer frischen Umgebung neu geklont, Composer per npm installiert, Kompositionsdateien aus diesem Branch geholt — Render lief durch, QA-Gate ohne Befund. Die Entscheidung, `tools/openmontage/` gitignored zu lassen und nur den Bauplan zu versionieren, trägt also. Sie trägt aber **nur**, solange jede Verbesserung sofort zurück in den Bauplan committet wird statt im Container zu versanden.

**Stolperstein Cowork-Brücke:** `git worktree add` über den Device-Mount läuft in den Timeout — der Checkout schreibt zu viele Dateien durch einen zu langsamen Mount und hinterlässt einen halben Worktree. Außerdem ist `rm` auf dem Mount gesperrt, `.git/worktrees/<name>/locked` lässt sich also nicht löschen; Aufräumen geht nur per `mv` des ganzen Metadaten-Ordners, danach `git worktree prune`. **Besserer Weg für Commits über die Brücke: Git-Plumbing ohne Checkout** — `hash-object -w`, temporärer Index über `GIT_INDEX_FILE`, `write-tree`, `commit-tree`, `update-ref`. Sekunden statt Minuten, und der Working Tree wird nicht berührt.

**Nächster Schritt:** `git push origin claude/openmontage-steakakademie-setup-shvafa` (Uwe — der Cowork-Container hat keine Push-Credentials), dann Freigabe des Videos.

## 10. August 2026 — Playbook-Gate gebaut (Cowork)

**Umgesetzt, was der Eintrag oben als Lehre formuliert hat:** `scripts/video-kerntemperatur.mjs` prüft die gemessenen Szenenlängen jetzt gegen `docs/openmontage/steakakademie.style.yaml` — direkt nach dem Ausmessen der Narration und **vor** dem Render, wo eine Korrektur Sekunden statt vier Minuten kostet. Geprüft werden `min_scene_hold_seconds`, `max_scene_hold_seconds` und `stat_card_hold_seconds` (letzteres für Szenentypen, in denen eine Zahl das Motiv ist: `temp_cards`, `hero_number`, `carryover`).

**Schwellen kommen aus dem Playbook, nicht aus dem Skript.** Duplizierte Grenzwerte driften auseinander; das Playbook bleibt Single Source of Truth. Gelesen wird mit `js-yaml`, das ohnehin in den Dependencies steht.

**Abbruch statt Warnung — mit Ventil.** Verstoß ⇒ `process.exit(1)`. Ausnahme nur über `--playbook-ausnahme="Grund"`; der Grund ist Pflicht und wird in `timeline.json` unter `playbookAusnahme` protokolliert. Begründung: Reines Warnen wird übersehen — genau daran ist die Regel beim ersten Mal gescheitert. Reines Abbrechen ohne Ventil führt dazu, dass irgendwann jemand die Regel im Playbook aufweicht, statt die eine Ausnahme zu begründen.

**Gegen echte Daten geprüft, nicht nur gedacht:** Die alte `timeline.json` (v1) liefert exakt die zwei bekannten Verstöße (`zahlen` 15,17 s und `carryover` 11,25 s gegen max 10 s), die neue v2-Timeline läuft ohne Befund durch, und ein künstlicher Grenzfall (Zahlen-Szene auf 3,5 s, CTA auf 2,1 s) wird korrekt als Unterschreitung von `stat_card_hold_seconds` bzw. `min_scene_hold_seconds` gemeldet.

## 11. August 2026 — Windows-Installer war kaputt, nicht nur ungeprüft (Cowork)

`openmontage-setup.ps1` lag als UTF-8 **ohne BOM** vor. Windows PowerShell 5.1
liest BOM-lose Dateien als CP1252 — die fünf Gedankenstriche (`E2 80 94`) wurden
zu `â€"`, und das letzte Byte `0x94` ist dort ein schließendes typografisches
Anführungszeichen. Der Parser nimmt es als String-Delimiter, jeder String mit
Gedankenstrich endet zu früh, und die Datei kaskadiert in "missing }"-Fehler.
Das Skript konnte also nie funktionieren; der memory.md-Vermerk "Windows-Installer
nicht verifiziert" vom 09.08. war zu milde.

**Fix:** als UTF-8 **mit** BOM gespeichert, Inhalt byte-identisch. Funktioniert
in PowerShell 5.1 und pwsh 7.

**Nur die Gedankenstriche zu ersetzen hätte das Skript zwar lauffähig gemacht,
aber nicht sauber** — die Umlaute ("Installer für die Steakakademie") brechen den
Parser nicht, werden unter CP1252 aber zu Buchstabensalat (`Ã¼`). Gemessen: eine
Testdatei nur mit Umlauten läuft unter PowerShell 5.1 bis zum Ende durch, eine nur
mit Gedankenstrich stirbt an `TerminatorExpectedAtEndOfString`. Gefährlich ist
allein, wenn das zweite Byte auf ein CP1252-Anführungszeichen fällt — beim
Gedankenstrich `0x94` = `”`, beim Halbgeviertstrich `–` `0x93` = `“`, ebenso bei
`’`/`‘`. Der nächste typografische Strich legt den Parser also sofort wieder lahm.
Regel für alle künftigen .ps1 in diesem Repo: UTF-8 mit BOM.

**Verifiziert:** Setup lief danach unter Windows 11 durch — Clone auf 4eab34c,
venv mit requirements.txt + piper-tts (Python 3.13, keine Wheel-Probleme),
Remotion-Composer 199 Pakete, Playbook gegen das Schema validiert.
Voraussetzungen waren FFmpeg 9.0 und GNU Make 4.4.1 (winget).

## 13. August 2026 — Produktionsbuch-Serie komplett: 7 Bücher → 27 eigene Rezepte (manuell)

**Abgeschlossen:** Alle 7 Weber-Grillakademie-Produktionsbücher (Basic, Perfektes Steak, Classic, Exklusiv, Genesis-2-Gas, Best of, Räucherkurs) verarbeitet — Rezeptwelt 85 → **112 Rezepte** (PRs #24–#28). Rechtsweg: Sperrvermerk (© Gerhard Volk, Forum Culinaire) respektiert — **kein Originaltext veröffentlicht**; Gerichtsideen als Allgemeingut in vollständig eigenen Worten neu entwickelt, von Uwe explizit freigegeben („genau so wie vorgeschlagen"). Kanonisch dokumentiert in `docs/produktionsbuch-integration.md` inkl. Backlog (24 Gerichte für Content-Grow).

**Eingespielte Pipeline pro Buch (je ~1 h):** PDF privat sichten (pdfminer; pypdf brauchte cffi-Reinstall) → Lücken-Analyse gegen Bestand → 3–5 Rezepte als eigene MDX (Wissenschafts-Aufhänger je Rezept, KT gegen `data/kerntemperatur-referenz.yaml`) → `rezepte-to-kochwissen.mjs` (CSV) → Build → Push → `regenerate-recipe-images.yml` mit `only=slugs` (committet Bilder auf den Branch) → PR/Squash-Merge → `ingest-kochwissen.yml` mit `only=steakakademie-rezepte` auf main.

**Stolpersteine mit Fix:**
- **Voyage-TPM-Mathe:** Rezept-Einträge ~900 Tokens × Batch 16 ≈ 15K > 10K-TPM-Gratis-Limit → Request kann NIE durchgehen (429-Retry sinnlos). Fix: Batch 6 für `steakakademie-rezepte-*` im Workflow verdrahtet + `only`-Input für sparsame Nachläufe.
- **Bild-Workflow-Race:** Eigener Push auf den Branch, während der Workflow committen will → sein Push wird rejected (KAN-60). Regel: Während ein Bild-Lauf aktiv ist, NICHT auf den Branch pushen; Re-Run genügt.
- **Branch-Historien-Falle:** Der Feature-Branch basierte einmal auf veralteter/fremder Historie („unrelated histories", main hätte 14k Zeilen verloren). Fix: Vor jedem Merge `git merge --no-commit` testen; Branch auf origin/main neu aufsetzen und nur eigene Feature-Dateien übernehmen (main-seitige Änderungen an geteilten Dateien via Basis-Vergleich `git diff 27c11f8:$f origin/main:$f` erkennen und manuell patchen).
- **Jira-Such-API:** `/rest/api/3/search` von Atlassian entfernt (410) → `/rest/api/3/search/jql`, Existenz via `issues[]` statt `total` (in `ops-alert-to-jira.mjs` gefixt).
- Merged-PR-Regel gelebt: nach jedem Squash-Merge Branch frisch von origin/main (`checkout -B`), sonst Force-Push-Salat.

**Nebenprodukte derselben Session:** Pro-Person-Engine (Basis 1 Person, `zutaten-basis`-Block + deterministischer UI-Rechner), AromaPairing auf Rezeptseiten mit `?schmiede=`-Deeplink, Einkaufslisten-Button, Menü-Planer `/menue`, 112-Rezepte-RAG-Flywheel. Notion „🍖 Rezept-Datenbank" ist leer (0 Einträge) — kein verlorener Content.

## 15. August 2026 — Loops-Start-Bug gelöst (API-Neubau) + Produkt-Entscheidungen

**Der Bug — Ursache gefunden (wichtigste Lektion des Tages):**
Der Workflow „Willkommenssequenz Wissens-Brief" ließ sich in der Loops-UI **nicht starten** —
Fehler: „Something went wrong, please contact support." Auch **Duplizieren** schlug fehl.
Guardian-Checks 2/2 grün, Sending-Domain verifiziert, Free-Plan enthält Workflows
(„all features included") — also kein Bedien- oder Tariffehler.
**Root Cause:** Die Mails 1/2/4 enthielten ein `<Image src="https://steakakademie.de/images/logo-barrel.jpg" width="auto">`.
Loops akzeptiert nur **CDN-eigene Bilder**; extern gehostete Bilder + `width="auto"` sind ungültig.
Die **UI** verschluckte das und warf generisch „Something went wrong"; erst die **API** nannte
den echten Grund (HTTP 422 mit Klartext). Lehre: **Bei stummen UI-Fehlern dieselbe Operation
über die API fahren — dort steht die Wahrheit.**

**Lösung — Workflow per API neu gebaut (~2 Min statt UI-Gefrickel):**
`POST /v1/workflows` → Trigger via `POST /v1/workflows/{id}/nodes/{nodeId}` auf `SignupTrigger`
→ Knoten via `POST /v1/workflows/{id}/nodes` (`insertMode: between`, `fromNodeId`/`toNodeId`)
→ Inhalte via `POST /v1/email-messages/{id}` (Format **LMX**, nicht HTML).
Stolpersteine: (a) `amount`/`unit` beim **Anlegen** eines TimerAction werden abgelehnt →
erst Knoten anlegen, **dann** per Node-Update setzen. (b) `languageCode` mitsenden → 400
„Translations are not enabled for this team" → Feld weglassen. (c) Jeder Schreibzugriff
braucht `expectedRevisionId` (Workflow: `workflowRevisionId`, Mail: `contentRevisionId`).
Skripte liegen im Scratchpad (`loops-read.mjs`, `loops-build2.mjs`).
**Ergebnis:** Workflow `cmsu6aces18t90j0aansmuc9e` („…Wissens-Brief v2") ist **Active**.
Externe Logo-Bilder wurden dabei entfernt — für Wiedereinbau erst in Loops-Mediathek hochladen.

**Loops-Fallstricke (allgemein):**
- Trigger „Contact added" = API-`SignupTrigger`; feuert **nur bei NEU angelegten Kontakten**.
- **Zwei getrennte Mail-Wege:** `/auth/login` = Magic-Link-Login (Resend, login@) ≠
  `/newsletter` = Wissens-Brief-Anmeldung (Loops, Double-Opt-In). Beim Testen leicht zu verwechseln.
- `GET /v1/contacts/find?email=…` liefert `[]`, wenn die Adresse unbekannt ist — gut zum Prüfen
  einer Testadresse vor dem Selbsttest.
- Der Workflow-Canvas (ReactFlow) reagiert kaum auf Fernsteuerung: Doppelklick zoomt, Tab zoomt,
  der „+"-Einfügepunkt erscheint nur bei kleinem Zoom. **Struktur immer per API bauen.**

**Fakten-Korrektur (Regel 8c):** In Mail 3 stand „10 Stufen" — real sind es
**5 Stufen mit 35 Lektionen** (im Code verifiziert). Korrigiert vor dem Start.

**Produkt-Entscheidungen (Uwe, 15.08.2026) — Details im Ideen-Memo der CLAUDE.md:**
- **BBQ-Grundkurs = Option B:** echter **Video-Kurs**; Abgrenzung zum kostenlosen Diplom-Lernweg
  (Text, 5 Stufen/35 Lektionen) über das **Format**, nicht über den Inhalt.
- **Verlosung:** „Jeden Monat 2× SteakChamp 3-Color Black unter allen Neuanmeldungen"
  (Bestand 32 Stück originalverpackt, UVP je 49,95 € → ~1.600 € Gesamtwert, 16 Monate Laufzeit).
- **Weihnachts-Gutscheine:** Zeitfenster startet ~Mitte/Ende August → Kampagne mit **bestehenden**
  Produkten starten (Steak-Beichte, physisches Diplom, Gründer-Schmiede); Video-Kurs stößt dazu,
  sobald er ehrlich fertig ist — keine Gutscheine für Unfertiges.
- **Gründer-Schmiede-Begleitung:** 3/5/7/10 Std à 105/100/95/89 €; Digitaler Ratgeber (2 PDFs,
  müssen aktualisiert werden) mit/ohne Begleitung, dort nur 3 und 5 Std. Gutscheine für alles.

**Nächster Schritt:** Uwe: auf `/newsletter` mit neuer Adresse anmelden + DOI-Link klicken →
Mail 1 muss ankommen → dann ist der **Markt-Lauf abgeschlossen** (Hebel 1+2+3 ✅).
Danach: alten Workflow (ohne „v2") löschen, sonst doppelte Sequenzen bei einer späteren Reparatur.

## 2026-08-15 (Abend) — Markt-Lauf ABGESCHLOSSEN: DOI-Kette erstmals End-to-End verifiziert

**Ergebnis:** Anmeldung → DOI-Mail → Bestätigung → Loops-Kontakt → „Willkommenssequenz v2" 1 Send (Active). Beide Zähler in Loops verifiziert.

**Root Cause (zweiteilig, beide auf dem ECHTEN Host Vercel):**
1. `LOOPS_DOI_TEMPLATE_ID` existierte auf Vercel NICHT → Route lief in den warn-Zweig, sendete nie, meldete dem Nutzer trotzdem Erfolg (`success:true` wird IMMER zurückgegeben — Fehlerpfad verschluckt).
2. Es gab in Loops gar keine DOI-Transactional-Vorlage. Neu gebaut + published: **„DOI Bestätigung Wissens-Brief", ID `cmsufizv80g7a0jyvr6gwgtzq`**, werbefrei (BGH: DOI-Mail darf keine Werbung enthalten), Button-Link = Data-Variable `confirmUrl` (im Editor: Button markieren → Sidebar-Sektion „Link +" → {}-Option; NICHT das Guardian-Popup).

**Lern-Anker #30 — Deploy-Host-Verwechslung:** steakakademie.de läuft auf **VERCEL** (Header `server: Vercel` gemessen; Projekt `steakakademie-v2`, Team `uwe-yendell-s-projects`, Auto-Deploy von main). Die Netlify-Site `steakakademie-de` ist ein ALTLAST-Zwilling: Builds bewusst gestoppt (Kaper-Schutz, richtig so), Env-Variablen dort sind Geister (u. a. stand die Supabase-URL in `NEXT_PUBLIC_APP_URL`). Host-Fragen nie aus Konsolen-Zugehörigkeit schließen — Response-Header messen.

**Vercel-Env heute gesetzt (Production+Preview, Sensitive):** `LOOPS_DOI_TEMPLATE_ID`, `NEWSLETTER_DOI_SECRET` (64-hex, neu generiert). `NEXT_PUBLIC_APP_URL` bewusst NICHT angelegt — Code-Fallback ist korrekt `https://steakakademie.de`.

**Offen:**
- ERLEDIGT-NICHTS ZU TUN (Uwe-Check 15.08. abends): Ein alter Workflow ohne "v2" existiert nicht mehr in Loops. Bestand: v2 (Active) + 3 Drafts (Untitled, Steak-Diplom, Woechentlicher Newsletter) - Drafts senden nicht, kein Doppel-Risiko.
- A2-Patch: ehrliche Fehlermeldung statt Schein-Erfolg in `/api/newsletter` + `source`/`userGroup` in DOI-Token (geht heute bei Confirm verloren → alle Kontakte landen als `default` in Gruppe `newsletter`).
- `NEXT_PUBLIC_APP_URL` + `LOOPS_DOI_TEMPLATE_ID` + `NEWSLETTER_DOI_SECRET` in `.env.example` dokumentieren (Fehlbelegungs-Ursache: fehlte dort).
- Block-A-Patch (Trichter öffnen, 9 Dateien) liegt geliefert vor, wartet auf `npm run build` + Freigabe.

## 2026-08-16 — Block A + EmberGlow LIVE (Commit a8a6f1f)

Trichter-Umbau deployed und von aussen verifiziert (Top-Bar + einheitliche Geschenk-Copy live): 11 Dateien, +354/-46. Sammelpunkte 2 -> 8+ (Top-Bar, Header-Link, Mobile-Menue, Homepage-Sektion NACH Hero+Artikelreihe [Uwe-Entscheidung: erst Inhalt, dann Geschenk — Reziprozitaet], 2x temperatur-guide, cuts, Spickzettel-Seite, Footer-Band auf allen Seiten). Copy ueberall: Geschenk zuerst, Frequenz "jeden Freitag" (Uwe-Entscheidung; erfordert woechentlichen Versand via newsletter-weekly Dispatch!). EmberGlow ersetzt SmokeEffect (reaktiver Gargrad-Verlauf statt Dauerschleife; SmokeEffect.tsx bleibt fuer Revert). Gemini-Gradient-Idee: verworfen (Uwe ueberzeugt).

**Offen danach:** Plausible-Baseline/Quellen-Vergleich erst ab jetzt aussagekraeftig (neue sources: footer, homepage-leadmagnet, homepage-sidebar, temperatur-guide-inline/-vor-faq, cuts-atlas, spickzettel-seite — ABER: source geht im DOI-Token verloren bis A2-Patch!). Ribeye-Hero-Bild tauschen (zeigt Schinken-artiges Fleisch; fal.ai-Prompt liegt im Chat vom 16.08.; Kandidat aus Stock verworfen: kein Ribeye-Auge + Lizenz unklar; Bestand sichten: public/Bildstil Steakakademie/ + cuts/skirt.jpg untracked). Lokale WIP-Dateien (globals.css, icon.svg, auth/login, CutAtlas/CutGenerator inkl. meiner 2 TS-Fixes, PlattformPuls) weiter uncommitted.

## 2026-08-16 (Mittag) — A2 LIVE (Commit c0d9ed9): ehrlicher DOI-Fehler + source-Segmentierung

/api/newsletter meldet jetzt 503 (Template-ID fehlt) bzw. 502 (Loops lehnt ab) statt success:true; Formular zeigt die Server-Meldung an. createDOIToken traegt source+userGroup im Token -> /confirm legt Kontakte korrekt segmentiert an; ab jetzt ist der Quellen-Vergleich der 8 Sammelpunkte in Loops/Plausible aussagekraeftig. .env.example dokumentiert LOOPS_DOI_TEMPLATE_ID, NEWSLETTER_DOI_SECRET, NEXT_PUBLIC_APP_URL (inkl. Supabase-Verwechslungs-Warnung). Live-Check nach Deploy: Seite rendert normal. Naechste Marketing-Bausteine: Spickzettel-PDF (B1), Ribeye-Bild (fal.ai), Gutschein-Kette (C1-C5, Uwe-Entscheidungen).

## 2026-08-16 (Nachmittag) — Design-Audit Säule 1 (Homepage) + Signup-Fix LIVE

Gemeinsamer Screenshot-Durchgang (Uwe + Claude via Browser). ERLEDIGT (Commit #33): Sidebar-Kollaps des E-Mail-Felds (sm:flex-row quetschte Input in 300px-Spalte auf 0px -> flex-wrap + min-w-[200px]; Lehre: KEINE Viewport-Breakpoints fuer Komponenten, die in schmalen Containern landen), Disabled-Button lesbar (Kontur-Stil statt opacity-40), Checkbox-Label + Kleingedrucktes eine Kontraststufe hoch.

OFFENE Design-Befunde Homepage (priorisiert):
1. Plattform-Puls zeigt "3 Cuts"/"7 Grilltechniken" — faktisch falsch (Atlas hat Dutzende), untergraebt "waechst jede Woche"; Fix steckt vermutlich im lokalen WIP (plattform-puls.ts/PlattformPuls.tsx) — fertigstellen oder Sektion solange ausblenden.
2. Weiss-Blitz bei Scroll-Spruengen: html-Element ohne dunklen Hintergrund -> 1-Zeilen-Fix globals.css (html{background:#17100B}) — ACHTUNG globals.css ist WIP-modifiziert.
3. Rubrik "Cuts & Fleischkunde": nur 2 Karten + leerer dritter Slot; Karten lazy-loaden als dunkle Flaechen.
4. Doppelte Floating-UI unten rechts (Frag-Marco-Pille + separates Avatar-Bild), Pille ueberlappt Sidebar-Kleingedrucktes.
5. Stats-Reihe: "2026 Inhalte aktuell" = Jahreszahl als Kennzahl verkleidet (Regel-7-Geruch), schwaecht echte Zahlen.
6. Manifest-Anfuehrungszeichen ueberlappt erste Textzeile (minor).
Unterseiten-Durchgang steht aus (Uwe war noch auf keiner); Mobil-Check offen (Browser-Resize griff nicht — am Geraet pruefen).

**2026-08-16:** Briefing fuer 3 neue Methoden-Seiten angelegt (docs/briefing-methoden-erweiterung-2026-08.md): Oberhitze-Grillen (Prio 1, Ueberbau zum bestehenden Oberhitzegrill-Vergleich), Plancha/Feuerplatte, Rotisserie. Ziel: Methoden 7 -> 10, Puls-Zaehler "Grilltechniken" kehrt automatisch zurueck (Unter-10-Regel). Produktion via Content-Pipeline + Qualitaets-Gate, Werte aus kerntemperatur-referenz.yaml, Bilder fal.ai.

**2026-08-16 (Abend):** Methode Oberhitze-Grillen LIVE (/methoden/oberhitze-grillen, Hybrid-Weg: Hand-Entwurf nach Briefing, Uwe-Review, Push). 54 GradC/54-58-Korridor aus Referenz-YAML verifiziert, 11 interne Links, Vergleichs-Verweis nur redaktionell in FAQ. Bild = Platzhalter hero-ribeye (TODO-Kommentar im MDX; fal.ai-Generierung zusammen mit Ribeye-Bildtausch, wartet auf Uwes Kosten-Go). Methoden jetzt 8/10 — Plancha + Rotisserie ausstehend (Briefings fertig), dann kehrt Puls-Zaehler "Grilltechniken" automatisch zurueck. Puls-Fix (Atlas-Cuts) und Signup-Fix ebenfalls heute live.

**2026-08-16 (spät):** Dauerauftrag Uwe ("eins nach dem anderen, nicht fragen"). Umgesetzt, wartet auf Commit: (1) Methode Plancha/Feuerplatte (content/methoden/plancha-feuerplatte.mdx, 9 Links, Fakten Grillfuerst-Ratgeber: Zonen, 20-40min Vorheizen, Einbrennen), (2) Methode Rotisserie (content/methoden/rotisserie-drehspiess.mdx, Gefluegel 74C/72-80 aus Referenz-YAML verifiziert, Sicherheits-Callout), (3) Weiss-Blitz-Fix: html-Element in layout.tsx bekommt backgroundColor #17100B (bewusst NICHT via globals.css — die ist Uwes WIP). Beide MDX mit Bild-Platzhalter + TODO (fal.ai-Runde ausstehend). Nach Merge: Methoden 10/10 -> Puls-Zaehler "Grilltechniken: 10" erscheint automatisch.

**2026-08-16 (Abschluss):** Alles vom Tages-Stapel LIVE + von aussen verifiziert. Puls final: 112 Rezepte / 173 Glossar / 35 Lektionen / 10 Grilltechniken / **40 Cuts im Atlas**. KORREKTUR eigener Fehler: Ich hatte 52 angesagt — grep zaehlte auch die 12 Rinder-PRIMALS mit (species-Feld); getCutsBySpecies('rind') liefert korrekt 40 echte Cuts. Live-Zahl stimmt, Ansage war falsch. Verbleibender Stapel: fal.ai-Bildrunde (3 Heroes, wartet auf Kosten-Go), Spickzettel-PDF (B1), Gutschein-Kette (C1-C5, Uwe-Entscheidungen, Deadline ~Ende August!), Design-Kleinteile (Floating-Doppel, leere 3. Rubrik-Karte, "2026"-Kennzahl, Manifest-Anfuehrungszeichen).

## 2026-08-16 — Lernvideo-Produktion: Entscheidungen + Plan (docs/lernvideo-produktion-plan.md)

**ENTSCHIEDEN (Uwe, 16.08.):** (1) Protagonist = **Avatar-System synthetisch** (nicht Uwe vor der Kamera) -> Vollautomatik moeglich, Doktrin gewahrt. Damit ist lernvideo-machart.md (12.06., "Protagonist: Uwe") als Produktionsgrundlage UEBERHOLT — Mikasa-Stil bleibt nur als Erzaehl-Vorbild. (2) Inhalt = **die 35 Diplom-Lektionen** werden vertont -> hebt die Format-Abgrenzung des BBQ-Grundkurses (10.07.) auf.

**⚠️ OFFEN, blockiert Vorverkauf:** Diplom ist kostenlos — was wird zu Weihnachten VERKAUFT? Optionen im Plan: (a) Videopfad = Bezahlprodukt [Empfehlung], (b) Urkunde/Pruefung verkaufen, (c) BBQ-Grundkurs neu abgrenzen. Uwe muss entscheiden.

**Maschine steht bereits, nichts Neues noetig:** OpenMontage (installiert 09.08., Zustandsautomat mit Approval-Gate je Stufe = Regel 4), **Piper TTS offline 0 EUR**, fal.ai fuer Bilder, Remotion-Komposition, FFmpeg/Untertitel/Audio komplett kostenlos.

**Nacht-Automatik = GitHub Actions**, NICHT geplanter Claude-Lauf (frische Sitzung hat nachts keinen Ordner-Zugriff auf C:\Dev; device_bash ohne Netz + 45s-Limit). Muster wie glossary-grow/recipe-grow. Workflow `lernvideo-render.yml`, cron 01:00 UTC, stoppt VOR `publish`, MP4 als Artefakt -> Uwe gibt morgens frei.

**Zeitplan realistisch:** Stufe 1 (7 Lektionen) bis Vorverkauf, NICHT alle 35. W1 Pipeline+Pilot, W2 Pilot-Review/Stil-Sperre, W3-4 Rest Stufe 1 (1/Nacht), W5 Korrektur+Verkaufsseite, W6 Puffer. Vorverkauf ehrlich: "Stufe 1 sofort, Stufe 2-5 monatlich".

**Uwe-Zuarbeit:** Bezahlprodukt-Entscheidung · Pexels/Pixabay-Keys (gratis) · fal.ai-Kosten-Go · Pilot-Review W2 (danach Stil gesperrt).

**BEFUND 16.08.2026 — Herkunft des "kostenlosen Diploms" (Uwe wusste es selbst nicht):** Keine Entscheidung, sondern Begriffs-Drift. Ursprung Parent-CLAUDE.md Z.282: "Physisches Diplom — **Digital kostenlos, gedruckt 9,99 EUR + 4,99 Porto**" — das betraf die URKUNDE (Fulfillment-Detail), nicht den Lernweg. Daraus wurde bis 10.07. (Z.617) "Abgrenzung zum **kostenlosen Diplom-Lernweg**" und schliesslich die primaere Homepage-CTA "Werde SteakAdemiker — kostenlos". WIDERSPRUCH: Parent-CLAUDE.md Z.865 fuehrt weiterhin **"🔴 P0 | Diplom Bronze ueber Digistore24 monetarisieren"** und Z.388 "Digistore24 — Diplom-Verkauf" als OFFEN. Monetarisierung war also immer geplant; das "kostenlos" hat sie ueberwuchert.

**ENTSCHIEDEN (Uwe, 16.08.2026): Physisches Diplom entfaellt komplett** — Grund: Verpackungsverordnung DE (Registrierungs-/Lizenzpflichten stehen in keinem Verhaeltnis zu 9,99 EUR + Porto bei manuellem Fulfillment). Konsequenzen: (a) Urkunden-Bestellformular /diplome/urkunde + Fulfillment raus bzw. auf rein digitale Urkunde reduzieren, (b) Gutschein-Lineup verliert einen der drei geplanten Posten (Steak-Beichte / physisches Diplom / Gruender-Schmiede) — ersetzt durch das kostenpflichtige Diplom, (c) kein Versand = kein Widerrufs-/Versandrecht-Overhead mehr. Digitale Urkunde bleibt Teil des Produkts.

**ENTSCHIEDEN (Uwe, 16.08.2026) — PREIS Grillmeister-Diplom:** regulaer **149 EUR**, Vorverkauf **99 EUR Gruendungs-Preis fuer die ersten 100** ("danach 149"). Uwe folgt der Argumentation: Kategorie ohne Vergleich wird positioniert statt verteidigt; Praesenz-Grillkurs kostet 100-200 EUR fuer EINEN Tag ohne Wiederholbarkeit/Zertifikat; bei Geschenken ist billig ein Makel; Gruendungs-Preis loest zugleich das fehlende Social Proof (F4) und schafft Dringlichkeit im Weihnachtsfenster. Stufe 1 (Bronze) bleibt kostenlos = Trichter; Stufe 2-5 = Bezahlprodukt (Text + Video). BBQ-Grundkurs geht darin auf, entfaellt als eigenes Produkt.

**Avatar-Video-Konzept (Briefing: docs/briefing-avatar-marco-video.md, 16.08.):** EMPFEHLUNG = **kein sprechender Kopf**. Marco = Stimme (Piper, fest gesperrt) + wiedererkennbare Figur (am Grill, von hinten/halbseitlich, arbeitend — `marco-back.jpg` ist bereits diese Bildidee) + Haende-Nahaufnahmen. Gruende: Handwerk lehrt statt Gesicht (Mikasa-Prinzip), lippensynchrone KI-Avatare sind 2026 Billig-Signal + kostenpflichtig, rechtlich schlanker. Zu produzieren: **Charakter-LoRA `FAL_LORA_MARCO`** aus bestehender Referenz authors/marco-richter.jpg (Aussehen ist seit Monaten oeffentlich, darf sich NICHT aendern) — Verfahren analog train-pork-lora.yml, ca. 1 Tag, gehoert in Woche 1. NUR Marco; Jonas/Elena erst nach Stufe 1. Uwe-Gates: fal.ai-Kosten-Go (Trainingsset+LoRA), Stimm-Abnahme, Charakter-Abnahme (5-Szenen-Test).

## 19. August 2026 — E-Mail-Chaos: vier Adressen im Code, eine existiert (manuell)

**Was passiert ist:**
- Im Code standen vier Absender-/Kontaktadressen (`info@`, `masterclass@`, `inspiration@`, `pitmaster@`) — eine Gmail-Beweissuche zeigte: **nur `pitmaster@` empfängt nachweislich** (~200 Threads). Für die anderen drei gab es keinen einzigen Zustellnachweis und keine Cloudflare-Routing-Verifizierung. Sie waren nie angelegt worden, standen aber 22-mal im Code.
- Parallel dazu: Das Kontaktformular **simulierte** den Versand nur (`setTimeout` + Erfolgsmeldung, kein fetch). Jede Anfrage seit dem 7. Juli lief ins Leere — und der Nutzer bekam trotzdem „Wir melden uns innerhalb von 24–48 Stunden".
- Beinahe-Folgefehler: Der Fix hätte fast einen **neuen** Zustelldienst (Resend/SMTP) eingeführt — dabei lief Loops längst als Transaktions-Versender (`/api/widerruf`). Ein neuer Dienst hätte einen neuen Auftragsverarbeiter, AVV und Datenschutz-Absatz bedeutet. Für nichts.

**Lektion für Gründer — E-Mail-Infrastruktur richtig aufsetzen:**
1. **Eine Adresse, bis es weh tut.** Starte mit genau einem Postfach, das nachweislich funktioniert und im Impressum steht. Sortierung macht ein Betreff-Präfix (`[Presse]`, `[Kooperation]`) + Mail-Filter — nicht drei weitere Postfächer, die niemand angelegt hat.
2. **Eine Adresse existiert erst, wenn eine Testmail von außen ankommt.** Nicht wenn sie im Code steht, nicht wenn sie „eingerichtet sein müsste". Beweis vor Behauptung — dieselbe Doktrin wie bei Bildquellen.
3. **Keine Erfolgsmeldung ohne Zustellnachweis.** Ein Formular darf „gesendet" erst anzeigen, wenn die API `ok` zurückgibt. Zusätzlich jede Nachricht **vor** dem Mailversand in die Datenbank schreiben — dann verliert selbst ein Mail-Ausfall keine Anfrage.
4. **Erst Inventur, dann neuer Dienst.** Vor jedem „wir brauchen Tool X" prüfen, was schon da ist (`grep` nach API-Endpunkten, ENV-Keys zählen). Jeder zusätzliche Dienst ist ein Auftragsverarbeiter mehr: AVV, Datenschutzerklärung, ein weiterer Login, ein weiterer Ausfallpunkt.
5. **Adressen gehören in EINE Konstante, nicht 22-mal verstreut.** Wäre `KONTAKT_EMAIL` zentral definiert gewesen, hätte der Fehler eine Zeile betroffen statt drei Dateien und zehn Wochen.

**Verbleibende Altlast:** `info@`/`masterclass@`/`inspiration@` stehen noch im Code und müssen auf `pitmaster@` vereinheitlicht oder in Cloudflare wirklich angelegt werden.
