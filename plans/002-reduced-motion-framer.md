# 002 — Reduced-Motion-Vertrag für framer-motion einlösen

- **Status**: DONE — umgesetzt und verifiziert am 02.09.2026. **Ein offener Nebenbefund**, siehe „Ergebnis" am Ende
- **Commit**: 14448e2
- **Severity**: HIGH
- **Category**: Accessibility
- **Estimated scope**: 1 neue Datei + `layout.tsx` (Schritt 1, deckt ~90 % ab), danach 2 gezielte Komponenten-Fixes

## Problem

`src/app/globals.css:381-384` gibt schriftlich ein Versprechen ab:

```css
/* src/app/globals.css:381-384 — aktueller Stand */
/* ── REDUCED MOTION ──────────────────────────────────────────────────────
   Bewegung ist hier Feedback, nie Inhalt. Wer prefers-reduced-motion setzt,
   behaelt Farbe, Schatten und Rahmen als Rueckmeldung — Verschiebung und
   Skalierung entfallen. Die Tailwind-Seite deckt motion-reduce:* ab,
   Framer-Motion-Komponenten regeln es ueber useReducedMotion. */
```

Der letzte Halbsatz stimmt nicht. Von 20 Dateien, die `framer-motion` importieren, rufen nur fünf `useReducedMotion()` auf: `AnimatedBar.tsx`, `MedalCeremony.tsx`, `AnimatedLogo.tsx`, `ExitIntent.tsx`, `SmokeEffect.tsx` (letztere ist derzeit nicht gemountet).

Die übrigen 15 bewegen sich unabhängig von der Systemeinstellung — darunter zwei, die auf **jeder Seite** laufen:

| Datei | Bewegung ohne Reduced-Motion-Handling |
| --- | --- |
| `src/components/ai/MarcoAvatar.tsx:191-194` | Pulsierender Ring, `scale: [0.85, 1.15, 0.85]`, `repeat: Infinity` |
| `src/components/ai/MarcoAvatar.tsx:208-210` | Rotierender Sektor-Ring, `rotate: 360`, `repeat: Infinity` |
| `src/components/ai/MarcoAvatar.tsx:150-160` | 3D-Flip `rotateY`, 0,7 s |
| `src/components/ai/MarcoWidget.tsx:105-107, 125-128, 157-160` | Panel- und Icon-Entrances mit `y`/`scale` |
| `src/components/home/FrischSaisonal.tsx:89-95` | Slide-Wechsel `y: 12 → 0 → -12`, alle 5,2 s automatisch |
| `src/components/recipe/RecipeSubmitModal.tsx:247-260, 312-314` | Modal-Entrance, Spring |
| `src/components/tools/NicheValidator.tsx:159-161, 189-190, 432-434, 557-559` | Entrances mit `y` |
| `src/components/cuts/AnimalDiagramPhoto.tsx:101-104` | Zoom/Pan-Spring `x`/`y`/`scale` |
| `src/components/cuts/CutAtlasClient.tsx:244-251, 282-286` | Tab-Wechsel `x: 14 → 0 → -14` |
| `src/components/cuts/CutGenerator.tsx:167-170, 287-293` | Schrittwechsel `x: 24 → 0 → -24`, `y: 20` |
| `src/app/aging/AgingClient.tsx:163, 200-202, 309` | Entrances mit `y: 10–16` |
| `src/app/terroir/TerroirClient.tsx:156, 198-201, 245-255` | Entrances + Overlay `y: 32`, `scale: 0.97` |
| `src/app/rettung/RettungClient.tsx:145, 165-168` | Entrances mit `y: 16` |
| `src/app/manifest/ManifestClient.tsx:88-90, 111-113, 138-140` | Entrances mit `y: 20`, `x: -12`, `scale: 0.92` |
| `src/app/diplome/DiplomeClient.tsx:124-127` | Gestaffelte Karten-Entrance, `y: 16` |
| `src/app/diplome/simulation/page.tsx:378-380, 442-444, 457-459` | Spring-Scale, `rotate: -10 → 0` |
| `src/app/diplome/urkunde/page.tsx:86-88, 129-130, 145-147` | Entrances mit `scale`/`y` |

## Target

Der Vertrag aus `globals.css` gilt tatsächlich: bei `prefers-reduced-motion: reduce` entfallen **Verschiebung und Skalierung**, Opacity- und Farbübergänge **bleiben** (Reduced Motion heißt sanfter, nicht null).

Der Hebel dafür ist ein einziger Provider, kein 15-Dateien-Refactor. framer-motion 11 kennt

```ts
// node_modules/framer-motion/dist/index.d.ts:1209
type ReducedMotionConfig = "always" | "never" | "user";
```

und dokumentiert `reducedMotion` als: *"If true, will respect the device prefersReducedMotion setting by switching transform animations off."* Mit `reducedMotion="user"` springen `x`, `y`, `scale`, `rotate` und `rotateY` sofort auf ihren Zielwert, während `opacity` weiter animiert — exakt das gewünschte Verhalten, für alle `motion.`-Komponenten im Baum auf einmal.

Was der Provider **nicht** abdeckt und weshalb Schritt 2 und 3 nötig sind:

- Endlos-Loops, die ausschließlich aus Transform bestehen (`rotate: 360`, `scale: [...]`): die werden abgeschaltet und hinterlassen ein totes, statisches Element. Ein Ladeindikator ohne jede Rückmeldung ist schlechter als ein sanfter — er braucht einen Opacity-Ersatz.
- Animationen auf `width`/`height` (kein Transform): laufen unverändert weiter.

## Repo conventions to follow

- Client-Provider liegen unter `src/components/layout/` und werden in `src/app/layout.tsx` im `<body>` gemountet — siehe `EmberGlow`, `MarcoWidget`, `ExitIntent` in `src/app/layout.tsx:109-111`.
- `'use client'` steht als erste Zeile der Datei, siehe `src/components/ui/EmberGlow.tsx:1`.
- Exemplar für manuelles Verzweigen (Schritt 2 imitiert das):
  ```tsx
  // src/components/diplome/MedalCeremony.tsx:106-108
  initial={reduce ? { opacity: 0 } : { scale: 0.6, opacity: 0, y: 20 }}
  animate={reduce ? { opacity: 1 } : { scale: 1, opacity: 1, y: 0 }}
  ```
- Import-Alias ist `@/` → `@/components/layout/MotionProvider`.

## Steps

### Schritt 1 — Provider (deckt alle 15 Dateien ab)

1. Neue Datei `src/components/layout/MotionProvider.tsx` anlegen:

   ```tsx
   'use client';

   import { MotionConfig } from 'framer-motion';

   /**
    * Löst den Reduced-Motion-Vertrag aus globals.css für die framer-motion-Seite ein:
    * bei prefers-reduced-motion: reduce schaltet framer-motion Transform-Animationen
    * (x, y, scale, rotate) ab und behält Opacity — Bewegung entfällt, Rückmeldung bleibt.
    */
   export default function MotionProvider({ children }: { children: React.ReactNode }) {
     return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
   }
   ```

2. In `src/app/layout.tsx` den Import zu den bestehenden Imports (Zeile 3-11) ergänzen:

   ```tsx
   import MotionProvider from '@/components/layout/MotionProvider';
   ```

3. In `src/app/layout.tsx` den gesamten Inhalt des `<body>` mit `<MotionProvider>` umschließen. `MotionProvider` ist eine Client-Komponente, bekommt die Server-Komponenten aber als `children` übergeben — sie bleiben dadurch server-gerendert. Die Reihenfolge der Kinder (`EmberGlow`, `MarcoWidget`, `ExitIntent`, Zeile 109-111) nicht verändern.

### Schritt 2 — MarcoAvatar: Ladeindikatoren mit Opacity-Ersatz

4. In `src/components/ai/MarcoAvatar.tsx` die bestehende Import-Zeile aus `framer-motion` um `useReducedMotion` ergänzen (nur ergänzen, nichts entfernen).

5. In der Komponente vor dem `return` ergänzen: `const reduce = useReducedMotion();`

6. Der "responding"-Ring verliert durch Schritt 1 seine Scale-Pulsation. Auf reine Opacity-Pulsation umstellen, gleiche Frequenz:

   ```tsx
   // src/components/ai/MarcoAvatar.tsx:192-194 — aktuell
   animate={{ opacity: [0.6, 0, 0.6], scale: [0.85, 1.15, 0.85] }}
   transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}

   // target
   animate={reduce
     ? { opacity: [0.5, 0.15, 0.5] }
     : { opacity: [0.6, 0, 0.6], scale: [0.85, 1.15, 0.85] }}
   transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
   ```

7. Der "thinking"-Ring verliert seine Rotation und stünde still. Ersetzen:

   ```tsx
   // src/components/ai/MarcoAvatar.tsx:208-210 — aktuell
   animate={{ rotate: 360 }}
   transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}

   // target
   animate={reduce ? { opacity: [1, 0.35, 1] } : { rotate: 360 }}
   transition={reduce
     ? { duration: 1.6, repeat: Infinity, ease: 'easeInOut' }
     : { duration: 1.2, repeat: Infinity, ease: 'linear' }}
   ```

### Schritt 3 — FrischSaisonal-Balken kontrollieren

8. Voraussetzung: **Plan 001 ist erledigt** (Balken läuft dann über `scaleX`, also Transform, und wird von Schritt 1 automatisch abgeschaltet). Ist 001 noch offen, diesen Schritt überspringen und im Abschlussbericht vermerken.
9. Nur kontrollieren, kein Code: Bei aktivem Reduced Motion steht der Balken sofort im Endzustand und läuft nicht mehr durch.

## Boundaries

- **Keine** der 15 Dateien einzeln um `useReducedMotion` erweitern, außer `MarcoAvatar.tsx` in Schritt 2. Der Provider erledigt den Rest; paralleles Handverdrahten erzeugt doppelte Logik.
- Die fünf Dateien, die `useReducedMotion` bereits nutzen (`AnimatedBar`, `MedalCeremony`, `AnimatedLogo`, `ExitIntent`, `SmokeEffect`), **nicht anfassen**. Sie funktionieren mit dem Provider zusammen; ihre Verzweigungen bleiben gültig.
- Den Kommentar in `globals.css:381-384` nicht umschreiben — er beschreibt nach diesem Plan wieder korrekt, was passiert.
- `EmberGlow.tsx` nicht anfassen (eigener Befund; hat eigenes Reduced-Motion-Handling in `EmberGlow.tsx:63-64`).
- Auto-Advance des Karussells (`FrischSaisonal.tsx:33`, `setTimeout(next, ROTATE_MS)`) **nicht** abschalten. Ob automatisch wechselnder Inhalt bei Reduced Motion ganz stoppen sollte, ist eine Produktentscheidung (WCAG 2.2.2) und nicht Teil dieses Plans — im Abschlussbericht als offene Frage vermerken.
- Keine neuen Dependencies.
- Bei Drift gegenüber Commit `14448e2`: STOPP und melden.

## Verification

- **Mechanisch**:
  - `npx tsc --noEmit` → keine neuen Fehler.
  - `npm run build` → läuft durch. Besonders prüfen: keine "Server Component"-Fehler durch den neuen Client-Provider im Root-Layout.
- **Feel check**: `npm run dev`, DevTools → Rendering → `Emulate CSS media feature prefers-reduced-motion: reduce` aktivieren, dann:
  - Startseite: Karussell wechselt den Slide durch **Überblenden**, nicht durch Hochschieben. Der Inhalt darf nicht mehr vertikal wandern.
  - Marco-Widget unten rechts öffnen: Panel **blendet auf**, springt aber sofort auf seine Endposition — kein Hochgleiten, kein Aufskalieren.
  - Marco eine Frage stellen: Der Ring um den Avatar muss weiterhin **sichtbar rückmelden** (sanftes Auf- und Abblenden). Ein völlig statischer Ring ist ein Fehlschlag von Schritt 2.
  - `/terroir`, `/manifest`, `/rettung`: Inhalte erscheinen durch Aufblenden, ohne Hochwandern.
  - Emulation wieder ausschalten und dieselben Stellen prüfen: Alles bewegt sich exakt wie vorher. Der Provider darf im Normalfall **nichts** verändern.
- **Done when**: Mit aktivem `prefers-reduced-motion` findet auf Startseite, Marco-Widget und zwei Content-Seiten keine Positions- oder Größenänderung mehr statt, Opacity-Feedback und die Marco-Ladeindikatoren funktionieren weiter, und ohne die Einstellung ist kein Unterschied zum Zustand vor dem Plan sichtbar.

## Ergebnis (02.09.2026)

Umgesetzt wie beschrieben: `MotionProvider` neu, in `layout.tsx` um den `<body>`-Inhalt gelegt, `MarcoAvatar` mit Opacity-Ersatz für die beiden Endlos-Ladeindikatoren. Schritt 3 entfiel als reine Kontrolle (Plan 001 war bereits erledigt).

Mechanisch: `tsc --noEmit`, `next lint` und `next build` (501 Seiten) je ohne Fehler — insbesondere keine Server-Component-Fehler durch den Client-Provider im Root-Layout.

Verhalten automatisiert gemessen (Playwright aus dem Repo, Chromium 1440×900, `reducedMotion`-Emulation, Sampling pro Frame via `requestAnimationFrame`):

| Element | ohne Reduced Motion | mit Reduced Motion |
| --- | --- | --- |
| Karussell-Fortschrittsbalken | `scaleX` läuft 0,907 → 0,987 → *(Wechsel)* → 0,063 → 0,303 | `transform: none` durchgehend — keine Bewegung |
| Karussell-Slide (`y: 12 → 0 → -12`) | `translateY` −11,6 px → 0,73 px während des Wechsels | `transform: none` durchgehend — reines Überblenden |
| Marco-Panel (`opacity`, `y: 20`, `scale: 0.95`) | Transform interpoliert über ~260 ms: `scale 0,954 → 0,967 → 0,982 → 0,994 → 1`, `translateY 18,5 → 13,1 → 7,2 → 2,4 → 0` | Transform nur **einen** Frame auf `matrix(0.95, 0, 0, 0.95, 0, 20)`, danach sofort `none` — kein Interpolieren |
| Marco-Panel `opacity` | 0 → 0,12 → 0,25 → … → 1, sauberer Verlauf | 0 → 0,50 → 0,85 → … → 0,99 → **0** → 1 |

Der Vertrag ist damit eingelöst: Transform-Animationen entfallen, Opacity bleibt.

### Offener Nebenbefund — ein Frame Opacity 0 am Ende des Marco-Panels

Beim Öffnen des Marco-Panels fällt die Opacity **nur mit aktivem Reduced Motion** unmittelbar vor dem Ende der Einblendung für genau einen Frame (~16 ms) von 0,99 auf 0 und dann auf 1. Vier Messungen grenzen es ein:

| | ohne Reduced Motion | mit Reduced Motion |
| --- | --- | --- |
| Dev-Server | kein Einbruch | **Einbruch** |
| Produktions-Build | kein Einbruch | **Einbruch** |

Es ist also durch diesen Plan entstanden und kein Dev-Artefakt. Drei Hypothesen wurden geprüft und **widerlegt**:

1. *Messartefakt durch Neu-Mount* — widerlegt: identische Node-ID und `querySelectorAll().length === 1` über den gesamten Verlauf.
2. *Fehlender `key` am `AnimatePresence`-Kind* — `key="marco-panel"` ergänzt, Einbruch blieb. Zurückgenommen.
3. *React StrictMode (`next.config.mjs:57`) rendert im Dev doppelt* — widerlegt: tritt im Produktions-Build genauso auf.
4. *`initial` mit Transform-Werten trotz abgeschalteter Transforms* — `initial`/`animate`/`exit` in `MarcoWidget.tsx` auf `reduce` verzweigt (Muster aus `MedalCeremony.tsx:106-108`), Einbruch blieb. Zurückgenommen.

Der Wert von `0` entspricht exakt dem `initial` des Panels, was auf ein einmaliges Wiederanwenden des Initialzustands am Animationsende hindeutet — die Ursache in framer-motion ist damit aber nicht belegt.

**Bewertung**: Ein 16-ms-Blinzeln an einer Komponente steht dem Nutzen gegenüber, dass 15 Komponenten überhaupt erst auf `prefers-reduced-motion` reagieren. Die Änderung bleibt daher drin. Der Befund ist offen und gehört als eigene Aufgabe untersucht — nicht als Teil dieses Plans.

**Nachtrag (Plan 005, 02.09.2026)**: Das Muster ist nicht komponentenspezifisch. Beim Schließen des mobilen Menüs — einer davon unabhängigen Komponente in `Header.tsx` — springt die Opacity mit aktivem Reduced Motion ebenfalls für einen Frame zurück auf `1`, kurz bevor das Element aus dem DOM verschwindet. Zwei unabhängige Belege sprechen damit für ein allgemeines Verhalten von framer-motion unter `reducedMotion="user"` am Ende einer Opacity-Animation. Wer den Befund aufgreift, sollte dort ansetzen statt an einzelnen Komponenten.
