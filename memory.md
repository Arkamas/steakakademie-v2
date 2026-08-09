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
