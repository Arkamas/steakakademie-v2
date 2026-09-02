# 003 — `transition-all` durch benannte Properties ersetzen

- **Status**: TODO
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
