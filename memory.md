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
