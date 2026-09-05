# Website-Relaunch 2026-09 — Stand, Entscheidungen, Umschalt-Kriterien

**Angelegt:** 05.09.2026 (Claude, Cowork-Session, Branch `relaunch/2026-09`)
**Quelle des Designs:** `handoff/website-relaunch/README.md` (hifi, verbindlich) + Prototyp
**Abteilung:** 1 · Systems & Ops (Code) — Inhalte der Kataloge gehören zu 3 · Redaktion

## Was gilt

- **Die Alt-Site ist archiviert, nicht gelöscht.** Tag `archiv/website-v1-2026-09`,
  Branch `archiv/website-v1`, Git-Bundle + Verzeichnis-Abbild + Env-Namensliste unter
  `C:\Dev\_archiv\` (dort `ARCHIV-README.md`). Referenz-Kopie von `/` und `/home-b` fürs
  zweite Standbein: `OneDrive\…\Projects\Steakakademie\Archiv-Website-v1\`.
- **Der Relaunch läuft parallel** unter `/relaunch` und `/relaunch/[katalog]`, eigenes
  Layout, `noindex`, Canonical auf `/`. Die Alt-Site (`/`, `/home-b`, alle ~500 Seiten)
  ist unberührt. Kein Feature-Flag nötig, solange der Pfad-Präfix trennt.
- **Launch 01.10.2026 bleibt mit dem heutigen Stand.** Umschalten erst, wenn die
  Kriterien unten grün sind.
- **Keine Slug-Änderungen** beim Umschalten — die URLs der Inhalte bleiben, nur das
  Layout wechselt. Das ist die SEO-Bedingung.

## Was gebaut ist (05.09.2026)

| Teil | Datei(en) | Stand |
|---|---|---|
| Tokens + Komponenten-Klassen | `src/app/relaunch/relaunch.css` | Werte 1:1 aus dem Handoff, gescoped unter `.sk` |
| Schriften | `src/app/relaunch/layout.tsx` | Big Shoulders Display 600–900 + Literata 400/600/i400 via `next/font`, self-hosted |
| Kopfzeile, Fußbereich, Marke | `src/components/relaunch/{Header,Footer,Rauchring}.tsx` | Marke „2b Rauchring", Spickzettel genau einmal |
| Spickzettel-Formular | `src/components/relaunch/SpickzettelForm.tsx` | gegen `/api/newsletter`, mit Einwilligungs-Checkbox (s. u.), source `footer-relaunch` |
| Glut-Animation | `src/components/relaunch/EmberCanvas.tsx` | alle vier Perf-Regeln, Stufe „Ruhig", nur im Hero |
| Startseite | `src/app/relaunch/page.tsx` | alle sieben Abschnitte; Streitfälle aus contentlayer (Redaktionsvorbehalt) |
| Übersicht-Muster | `src/app/relaunch/[katalog]/page.tsx` + `src/components/relaunch/Katalog.tsx` | EIN Muster, vier Kataloge; Filter/Sort/Ansicht ohne Nachladen; Ansicht in `localStorage` |
| Katalog-Daten | `src/lib/relaunch/katalog.ts` | 40 Cuts, 8 Streitfälle, 8 Rezepte, 10 Techniken — Text aus dem Prototyp |
| Diplom-Siegel | `src/components/relaunch/Siegel.tsx` | fünf Stufen, Ringfarben und Füllgrad wie im Prototyp |
| E2E | `tests/e2e/relaunch-uebersicht.spec.ts` | 5 Tests: Filter, Sort, Ansicht-Persistenz, Leer/404, Startseite |

**Noch nicht gebaut** (Handoff-Ansichten 3–8): Streitfall-Artikel, Lektion, Rezept mit
Portionsrechner, Werkzeug-Vergleich, Diplome, Über uns. Die Kopfzeile verlinkt dafür
auf die bestehenden Live-Seiten (`/vergleich`, `/diplome`, `/ueber-uns`).

## Bewusste Abweichungen vom Prototyp — mit Grund

1. **Einwilligungs-Checkbox im Spickzettel-Formular.** Der Prototyp zeigt nur
   E-Mail-Feld + Knopf. Das Rechts-Audit vom 28.08.2026 verlangt die Checkbox mit dem
   versionierten Wortlaut (`@/lib/newsletter-consent`, § 7 Abs. 2 Nr. 2 UWG).
   Prioritäts-Logik: Recht → Fakten → Marke. Nicht verhandelbar.
2. **Filterleiste klebt UNTER der Kopfzeile** (`top: var(--sk-header-h)`), nicht bei
   `top: 0`. Im Prototyp stehen beide auf `top: 0` — dort verschwindet die Leiste
   hinter dem Header (z-index 20 > 5), sobald sie kleben soll. Ein Defekt des
   Prototyps, kein Gestaltungswille.
3. **Kopfzeile unter 720px nicht sticky.** Ohne Mobile-Navigation (Handoff, offener
   Punkt 2) bricht die Leiste um und ist ~290px hoch — ein Drittel des Bildschirms.
   Bis die Mobile-Nav entworfen ist, bleibt sie auf schmalen Geräten im Fluss. Fällt
   mit dem Mobile-Nav-Entwurf wieder weg.
4. **Karten ohne Detailseite sind keine Links.** Der Prototyp führt jeden Eintrag auf
   dieselbe Beispielseite (offener Punkt 4). Hier: `href` nur, wo die Live-Seite
   existiert (9 von 66 Einträgen, geprüft gegen `content/` und `src/app/`); sonst
   „Detailseite folgt" statt eines toten Links. Kein Link wurde erfunden.
5. **„Ausrüstung"** zeigt auf `/vergleich` (die Vergleichstests), weil `/ausruestung`
   keine Index-Seite hat.
6. **Werkzeuge-Liste auf der Startseite:** „Foodpairing" und „Rezept-Schmiede" aus dem
   Prototyp haben keine Route → ersetzt durch Kerntemperatur-Spickzettel und
   „Rezepte nach Methode". Rückgängig machen, sobald die Routen existieren.
7. **`schwenkgrill-glut.jpg`** liegt im Repo auf 2400px/q85 (1,1 MB statt 10,4 MB).
   Original im OneDrive-Handoff.

## Was NICHT geprüft wurde (Berichtspflicht § A)

- **Vercel-Preview** — kein Push aus der Cowork-VM möglich; Branch liegt als Bundle vor.
- **Pflicht-Checks in Actions** (P0-Gates, Stille Content-Defekte, Build pruefen) —
  lokal liefen `npm run check`, `legal-guard`, `tsc`, `next build`, vitest 96/96,
  Playwright 5/5 (neu) + Bestand nicht erneut.
- **Eingeloggte Zustände** (Kursstatus „Stufe 1 · 1/7") — nicht angebunden, nur
  Zustand „kein Fortschritt".
- **Kontraste gemessen:** nein. Die Akzentregel (#e2531f nur hell, #ffb35c nur dunkel)
  ist eingehalten; ein WCAG-Lauf (wie bei `/home-b` am 03.09.) steht aus.
- **Fakten in `katalog.ts`** (Kerntemperaturen 56/58/68/90/94 °C) sind Prototyp-Text,
  NICHT gegen `data/kerntemperatur-referenz.yaml` abgeglichen — Regel 8c, vor dem
  Umschalten Pflicht.
- **Startseiten-Doktrin** (CLAUDE.md § 2 Regel 8) gilt für `src/app/page.tsx`; das
  Gate prüft `/relaunch` nicht. Ob die Reihenfolge Value-Prop → HERO → Artikel →
  Mitglieder-CTA auf das neue Layout übertragen wird, entscheidet Uwe.
- **Lighthouse / Bundle-Größe** nicht gemessen (Route: 1,74 kB + 136 kB First Load).
- **Safari/iOS** nicht gesehen — nur Chromium headless, 1400px und 390px.

## Umschalt-Kriterien (alle grün, sonst kein Umschalten)

1. Mobile-Navigation entworfen (Uwe/Design) und gebaut
2. Login/Registrierung entworfen und gebaut — Stufe 2+ braucht Konto
3. Cut-Detailseite entworfen; Vorlagen für Rezept/Technik/Streitfall aus dem Handoff gebaut
4. Kerntemperaturen in `katalog.ts` gegen die Referenz abgeglichen (Regel 8c)
5. Lighthouse Mobile ≥ 90, Kontrastlauf WCAG AA
6. Playwright grün (Bestand + Relaunch), Legal-Guard grün, alle Pflicht-Checks
7. Rechtsseiten inhaltlich byteidentisch, Anwaltstestat unangetastet
8. Sitemap-URLs unverändert
9. Entscheidung zur Startseiten-Doktrin (s. o.)

**Umschalten heißt dann:** `src/app/relaunch/*` nach `src/app/*` heben (Layout wird
Root-Layout, `[katalog]` wird `/cuts` … — die bestehenden Routen bleiben, nur ihr Layout
wechselt), `noindex` entfernen, Vorschau-Leiste entfernen, `AB_HOME`-Middleware
stilllegen. Erst dann wird `/home-b` unerreichbar — und bleibt trotzdem im Archiv.

## Branch übernehmen (Uwe, eigenes Terminal)

Der Branch existiert im Cowork-Klon und als Bundle. Ins Arbeits-Repo holen und pushen:

```powershell
cd C:\Dev\steakakademie-v2
git fetch C:\Dev\_archiv\relaunch-2026-09.bundle relaunch/2026-09:relaunch/2026-09
git push -u origin relaunch/2026-09
gh pr create --base main --head relaunch/2026-09 --title "Relaunch 2026-09: Layout, Startseite, Übersicht-Muster (parallel unter /relaunch)" --body-file docs/website-relaunch-2026-09.md
```

Danach zeigt Vercel die Vorschau unter `<preview>/relaunch`. Der PR kann mergen, sobald
die Pflicht-Checks grün sind — er verändert nichts an der Live-Site, nur `/relaunch`
kommt dazu (noindex).
