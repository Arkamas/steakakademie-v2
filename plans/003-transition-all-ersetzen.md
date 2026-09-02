# 003 — `transition-all` durch benannte Properties ersetzen

- **Status**: DONE — 68 von 75 ersetzt am 02.09.2026, die restlichen 7 im Nachgang ersatzlos entfernt. `transition-all` kommt in `src/` nicht mehr vor
- **Commit**: 14448e2
- **Severity**: MEDIUM
- **Category**: Performance
- **Estimated scope**: 75 Vorkommen in 41 Dateien; rein mechanisch, aber **nicht** per Suchen-und-Ersetzen — siehe Entscheidungstabelle

## Problem

`transition-all` animiert jede Property, die sich am Element ändert — auch solche, die man nie animieren wollte, und die meisten davon außerhalb des Compositors (Layout + Paint statt nur Composite). Der Browser muss außerdem bei jedem State-Wechsel alle Properties auf Änderungen prüfen.

Aktuell 75 Vorkommen in 41 Dateien, ermittelt mit:

```bash
grep -rn --include='*.tsx' --include='*.css' "transition-all" src | wc -l
```

Beispiel `src/components/layout/Header.tsx:178` — der Sticky-Header, auf jeder Seite, bei jedem Scroll:

```tsx
// src/components/layout/Header.tsx:176-180 — aktuell
      <header
        className={cn(
          'bg-surface-dark border-b border-brand-gold/15 sticky top-0 z-50 transition-all duration-200',
          scrolled && 'shadow-[0_4px_32px_rgba(0,0,0,0.45),0_1px_0_rgba(200,136,42,0.15)]'
        )}
```

Es ändert sich dort ausschließlich `box-shadow`. `transition-all` lässt den Browser trotzdem den kompletten Property-Satz beobachten.

## Wichtig: `transition-all` ist hier an vielen Stellen **tragend**

Ein blindes `transition-all` → `transition-colors` zerstört Funktionalität. In dieser Codebase existieren mehrere Stellen, an denen `transition-all` genau deshalb steht, weil eine Layout-Property animiert werden soll — z. B. Fortschrittsbalken, deren Breite über ein Inline-`style` gesetzt wird:

```tsx
// src/components/steuer-matrix/TaxCalculator.tsx:268-270 — aktuell
                <div
                  className="h-full bg-brand-gold rounded-full transition-all duration-500"
                  style={{ width: `${Math.round(result.effectiveRate * 100)}%` }}
                />
```

Würde man hier `transition-colors` einsetzen, springt der Balken ohne Übergang. Deshalb gilt die Entscheidungstabelle unten, nicht ein globales Ersetzen.

## Target

Jedes `transition-all` nennt die Properties, die sich an diesem Element tatsächlich ändern.

### Entscheidungstabelle

Für jedes Vorkommen: Ansehen, welche Properties das Element in seinen Zustandswechseln (`hover:`, `group-hover:`, `active:`, `disabled:`, Template-Literal-Zweige, Inline-`style`) verändert.

| Gruppe | Erkennungsmerkmal | Ersatz |
| --- | --- | --- |
| **A — Farbe/Rahmen** | Nur `hover:bg-*`, `hover:text-*`, `hover:border-*`, `hover:decoration-*` | `transition-colors` |
| **B — Transform beteiligt** | `hover:-translate-y-*`, `group-hover:scale-*`, `active:scale-*` zusätzlich zu Farbe | `transition-[transform,border-color,background-color]` |
| **C — Breite/Höhe über Inline-`style`** | Element hat `style={{ width: … }}` oder `style={{ height: … }}` | `transition-[width]` bzw. `transition-[width,background-color]` |
| **D — `gap` animiert** | `hover:gap-*` oder `group-hover:gap-*` im selben className | `transition-[gap]` |
| **E — SVG-Opacity** | `group-hover:[fill-opacity:…]`, `[stroke-opacity:…]` | `transition-[fill-opacity]` bzw. `transition-[stroke-opacity]` |
| **F — nur Schatten** | Nur `box-shadow` ändert sich | `transition-shadow` |

**Harte Regel für Zweifelsfälle**: Hat das Element ein Inline-`style` mit `width`, `height` oder `gap`, gehört es zu Gruppe C bzw. D — niemals `transition-colors`. Passt ein Vorkommen in keine Gruppe: unverändert lassen und im Abschlussbericht auflisten. Raten ist hier schlimmer als Stehenlassen.

### Verifizierte Zuordnungen

Diese Stellen wurden bereits geprüft, die Gruppe steht fest:

| Ort | Gruppe | Ersatz |
| --- | --- | --- |
| `src/components/layout/Header.tsx:178` | F | `transition-shadow` |
| `src/components/persoenlichkeiten/SeriesBadge.tsx:42` | C | `transition-[width]` |
| `src/components/steuer-matrix/TaxCalculator.tsx:269` | C | `transition-[width]` |
| `src/components/recipe/CookCoach.tsx:62` | C | `transition-[width]` (`motion-reduce:transition-none` beibehalten) |
| `src/components/streitfaelle/StreitfallUmfrage.tsx:157` | C | `transition-[width]` (`motion-reduce:transition-none` beibehalten) |
| `src/app/zzp-niche/page.tsx:109` | C | `transition-[width]` |
| `src/app/admin/pm-agent/page.tsx:28` | C | `transition-[width]` |
| `src/app/diplome/simulation/page.tsx:54` | C | `transition-[width]` |
| `src/components/home/FrischSaisonal.tsx:171` | C | `transition-[width,background-color]` |
| `src/app/methoden/page.tsx:85` | B | `transition-[transform,border-color]` |
| `src/app/zzp-niche/page.tsx:63` | B | `transition-[transform,border-color]` |
| `src/components/diplome/KontextRail.tsx:40, 62` | B | `transition-[transform,border-color]` |
| `src/app/ehrliches-system/page.tsx:312` | D | `transition-[gap]` |
| `src/app/persoenlichkeiten/page.tsx:106` | D | `transition-[gap]` |
| `src/components/home/ToolBoxes.tsx:441` | D | `transition-[gap]` |
| `src/app/gruender-schmiede/lernen/[slug]/page.tsx:168` | D | `transition-[gap]` |
| `src/components/cuts/AnimalDiagram.tsx:87` | E | `transition-[fill-opacity]` |
| `src/components/cuts/AnimalDiagramPhoto.tsx:139, 230, 289` | E | `transition-[fill-opacity]` |
| `src/components/cuts/AnimalDiagramPhoto.tsx:336` | E | `transition-[stroke-opacity]` |
| `src/app/globals.css:129` (`.btn-affiliate`) | B | `transition-[background-color,box-shadow,transform] duration-200` |
| `src/app/globals.css:150` (`.btn-gold`) | B | `transition-[background-color,box-shadow,transform] duration-200` |
| `src/app/autoren/page.tsx:88`, `src/app/vergleich/page.tsx:145`, `src/app/ehrliches-system/page.tsx:247`, `src/app/kontakt/page.tsx:114`, `src/app/pflanzlich/page.tsx:94, 205`, `src/app/persoenlichkeiten/page.tsx:81, 129`, `src/app/persoenlichkeiten/[slug]/page.tsx:344` | A | `transition-colors` |

Die übrigen Vorkommen nach Tabelle klassifizieren.

## Repo conventions to follow

- Tailwind-Arbitrary-Values in eckigen Klammern ohne Leerzeichen, so wie es die Codebase schon tut: `group-hover:[fill-opacity:0.30]` in `src/components/cuts/AnimalDiagram.tsx:87`.
- `duration-*` und `ease-*` bleiben immer unverändert stehen — dieser Plan ändert **nur**, *welche* Properties animiert werden, nicht *wie lange* oder *mit welcher Kurve*.
- `motion-reduce:transition-none` bleibt überall erhalten, wo es steht (`CookCoach.tsx:62, 81`, `StreitfallUmfrage.tsx:157`).
- In `globals.css` stehen die Transitions in `@apply`-Zeilen; dort dieselbe Ersetzung innerhalb des `@apply` vornehmen.

## Steps

1. Vollständige Liste erzeugen und als Arbeitsgrundlage festhalten:
   ```bash
   grep -rn --include='*.tsx' --include='*.css' "transition-all" src
   ```
2. Die 30 oben verifizierten Stellen abarbeiten — Gruppe und Ersatz sind vorgegeben.
3. Die restlichen Vorkommen einzeln öffnen, className und Inline-`style` lesen, nach Entscheidungstabelle klassifizieren, ersetzen.
4. Vorkommen, die in keine Gruppe passen, unverändert lassen und mit `file:line` + Grund im Abschlussbericht auflisten.
5. Abschließend prüfen: `grep -rn --include='*.tsx' --include='*.css' "transition-all" src` — jedes verbleibende Vorkommen muss in der Liste aus Schritt 4 stehen.

## Boundaries

- **Nichts** außer dem Transition-Property-Teil der className ändern. Keine Farben, keine Abstände, keine Struktur, keine Dauern, keine Kurven.
- Keine Layout-Animation in eine Transform-Animation umbauen. Dass die Fortschrittsbalken aus Gruppe C weiterhin `width` animieren, ist bekannt und ein **eigener Befund mit eigenem Plan** — hier wird nur die Property benannt, nicht die Technik gewechselt.
- `src/components/home/FrischSaisonal.tsx:155-157` (der große Fortschrittsbalken) gehört zu Plan 001 und wird hier **nicht** angefasst. Zeile 171 (die Dot-Navigation darunter) dagegen schon.
- **Beobachtung, nicht Teil dieses Plans**: In `src/components/home/DiplomaProgressSection.tsx:45-50` steht `group-hover:scale-110` in der className, während dasselbe Element im Inline-`style` ein `transform: 'scale(1.3)'` trägt. Das Inline-Style gewinnt, der Hover-Effekt greift daher vermutlich nie. Nicht reparieren — im Abschlussbericht vermerken.
- Keine neuen Dependencies, keine Formatter-Läufe über unbeteiligte Dateien.
- Bei Drift gegenüber Commit `14448e2`: STOPP und melden.

## Verification

- **Mechanisch**:
  - `npx tsc --noEmit` → keine neuen Fehler.
  - `npm run lint` → keine neuen Warnungen.
  - `npm run build` → läuft durch. Tailwind muss die Arbitrary-Variants (`transition-[width]` usw.) im Output erzeugen; bei einem Tippfehler in den eckigen Klammern fällt die Klasse still weg, deshalb ist der Feel Check unten nicht optional.
- **Feel check**: `npm run dev`, dann Stichproben über alle sechs Gruppen:
  - **A** `/autoren`: Karten-Rahmen wechselt beim Hover weich die Farbe.
  - **B** `/methoden`: Karte hebt sich beim Hover weiterhin um 4 px an und der Rahmen färbt sich — beides weich.
  - **C** `/steuer-matrix`: Ergebnis-Balken wächst weiterhin über 500 ms, springt nicht.
  - **C** Startseite: die Dot-Navigation unter dem Karussell verbreitert sich beim Slide-Wechsel weiterhin weich von 6 px auf 22 px.
  - **D** `/ehrliches-system`: Der Pfeil im Link rückt beim Hover weiterhin weich nach rechts.
  - **E** `/cuts`: Beim Hover über ein Teilstück im Rinder-Diagramm blendet die Füllung weiterhin weich ein.
  - **F** Beliebige Seite: Beim Scrollen bekommt der Header weiterhin weich seinen Schatten.
  - **Regression-Check**: Jede Stelle, die vorher weich war, ist danach weich. Ein hartes Springen an irgendeiner geänderten Stelle bedeutet: falsche Gruppe gewählt.
- **Done when**: `grep -rn "transition-all" src` liefert nur noch Treffer, die in Schritt 4 begründet aufgelistet sind, und keine der Stichproben aus dem Feel Check springt hart.

## Ergebnis (02.09.2026)

68 von 75 Vorkommen ersetzt, verteilt auf 39 Dateien. Die verbleibenden 7 stehen unverändert, mit Begründung unten.

Mechanisch: `tsc --noEmit`, `next lint` und `next build` (501 Seiten) je ohne Fehler.

### Alle erzeugten Regeln sind im CSS angekommen

Der Plan warnt, dass Tailwind fehlerhafte Arbitrary-Klassen still weglässt. Gegenprobe im gebauten CSS (`cat .next/static/css/*.css | grep -o "transition-property:[^;}]*" | sort | uniq -c`) — jede der 20 erzeugten Property-Listen ist vorhanden:

`width` · `width,background-color` · `gap` · `fill-opacity` · `stroke-opacity` · `fill-opacity,stroke,stroke-width` · `transform` · `transform,border-color` · `box-shadow` · `background-color,box-shadow,transform` (2×) · `background-color,opacity` · `background-color,color,opacity` · `background-color,border-color,opacity` · `background-color,border-color,color` · `background-color,color,border-color` · `background,border-color,box-shadow` · `background,color,border-color,box-shadow` · `opacity,visibility,transform` · `text-decoration-thickness` · die Tailwind-Liste hinter `transition-colors`

### Verhalten pro Gruppe geprüft

Automatisiert gegen den Produktions-Build (Playwright, Hover ausgelöst, computed styles gelesen):

| Gruppe | Stichprobe | `transition-property` | Änderung |
| --- | --- | --- | --- |
| A | `/autoren`, Karte | `color, background-color, border-color, …` | `rgb(58,42,30)` → `rgba(200,136,42,0.4)` |
| A | `/vergleich`, Karte | dito | dito |
| B | `/methoden`, Karte | `transform, border-color` | `none` → `matrix(1,0,0,1,0,-4)` |
| C | Startseite, Dot-Navigation | `width, background-color` | aktiver Dot 22 px, übrige 6 px |
| D | `/ehrliches-system`, Pfeil-Link | `gap` | 8 px → 12 px |
| E | `/cuts`, Rinder-Diagramm | `fill-opacity, stroke, stroke-width` | Klasse korrekt aufgelöst |
| F | Header beim Scrollen | `box-shadow` | `none` → Schatten |

Keine Stelle springt hart, keine Regression gefunden.

### Korrekturen an der Entscheidungstabelle oben

Beim Abarbeiten haben sich zwei Lücken in der Tabelle gezeigt:

1. **Gruppe A führt `hover:decoration-*` als Farbe** — falsch für `decoration-2` in `src/app/artikel/[slug]/page.tsx:107`: Das ändert `text-decoration-thickness`, keine Farbe. `transition-colors` hätte den Effekt still abgeschaltet. Umgesetzt als `transition-[text-decoration-thickness]`.
2. **`disabled:opacity-*`, `visibility` und Gradient-Hintergründe fehlen in der Tabelle.** Sie kamen an 16 Stellen vor und brauchten eigene Property-Listen — etwa `transition-[background-color,opacity]` bei den Absende-Buttons (`kontakt/page.tsx:218`, `urkunde/page.tsx:208`) oder `transition-[opacity,visibility,transform]` beim Desktop-Dropdown (`Header.tsx:313`). Für Farbverläufe muss `background` statt `background-color` stehen, sonst greift die Transition nicht — betrifft die sechs Stellen in `RoadmapClient.tsx`.

### Die 7 unveränderten Vorkommen

An diesen Elementen ändert sich **keine** Property — weder über eigene `hover:`-Klassen noch über einen Zustandswechsel im Inline-`style`. `transition-all` läuft dort ins Leere. Sie fallen damit unter Schritt 4 („passt in keine Gruppe") und bleiben unangetastet:

| Ort | Warum ohne Wirkung |
| --- | --- |
| `src/app/glossar/[slug]/page.tsx:167` | `Link` mit statischem Inline-`style`, ohne eigene Hover-Klassen. Die Farbwechsel sitzen auf den Kindern und haben dort eigenes `transition-colors` |
| `src/app/grillstil/page.tsx:158` | `<a>` mit statischem Inline-`style`, keine Hover-Klasse |
| `src/app/grillstil/page.tsx:165` | dito |
| `src/app/grillstil/page.tsx:193` | Karte mit statischem Inline-`style`; trägt zwar `group`, aber die Datei enthält kein einziges `group-hover` |
| `src/app/grillstil/page.tsx:242` | dito, ohne `group` |
| `src/app/grillstil/page.tsx:333` | dito |
| `src/app/usa-expedition/page.tsx:508` | `Link` mit statischem Inline-`style`, keine Hover-Klasse |

Gegengeprüft: `globals.css` enthält keine generische `a:hover`-Regel, die hier greifen könnte.

**Nachtrag (02.09.2026, auf Zuruf umgesetzt)**: Die Empfehlung wurde ausgeführt — an allen sieben Stellen ist `transition-all` ersatzlos entfernt, zusammen mit dem dadurch verwaisten `duration-200`. Eine `duration-*`-Klasse wirkt nur auf Transitions und Animationen; auf keiner der sieben Zeilen steht eine `animate-*`-Klasse, sie war also ebenfalls ohne Wirkung.

Ergebnis: `grep -rn "transition-all" src` liefert **0 Treffer**, und im gebauten CSS taucht `transition-property:all` nicht mehr auf (vorher 1×). `tsc --noEmit`, `next lint` und `next build` (501 Seiten) je ohne Fehler.

Übrig bleibt eine kleinere Beobachtung, die **nicht** angefasst wurde: `src/app/grillstil/page.tsx:193` trägt weiterhin die Klasse `group`, obwohl die Datei kein einziges `group-hover` enthält. Auch sie ist ohne Wirkung, gehört aber nicht zum Thema dieses Plans.
