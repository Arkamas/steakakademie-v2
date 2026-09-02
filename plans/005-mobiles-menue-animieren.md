# 005 — Mobiles Menü mit Ein- und Ausblendung versehen

- **Status**: TODO
- **Commit**: 14448e2
- **Severity**: MEDIUM (additive Verbesserung, kein Defekt)
- **Category**: Missed opportunity — preventing a jarring change
- **Estimated scope**: 1 Datei, ~10 geänderte Zeilen

## Problem

Das mobile Vollbild-Menü erscheint und verschwindet schlagartig. Ein `fixed inset-0`-Overlay, das die gesamte Seite ersetzt, wird ohne jeden Übergang ein- und ausgeblendet — der härteste Zustandswechsel der ganzen Site, und auf Mobilgeräten der meistgenutzte.

```tsx
// src/components/layout/Header.tsx:332-334 — aktuell
      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-surface-dark overflow-y-auto md:hidden pt-16">
```

Die Bedingung `{mobileOpen && …}` hängt das Element aus dem DOM aus. Eine Exit-Animation ist damit grundsätzlich unmöglich, egal welche CSS-Klasse man ergänzt — das Element ist im selben Frame weg.

Gate-Prüfung, warum diese Stelle Motion verdient:
- **Frequenz**: gelegentlich (Menü öffnen, nicht Dutzende Male pro Minute) → animieren erlaubt.
- **Zweck**: preventing a jarring change — ein bildschirmfüllender Wechsel ohne Brücke.
- **Budget**: 200 ms rein, 150 ms raus. Liegt im Fenster für Drawer/Modals (200–500 ms), am schnellen Ende.
- **Funktion**: dekoriert keine Daten, die gelesen werden — es überbrückt einen Navigationswechsel.

## Target

Ein- und Ausblendung über `AnimatePresence`, damit das Overlay bis zum Ende der Exit-Animation gemountet bleibt. Bewegung minimal: Opacity plus 8 px Versatz von oben, weil das Menü aus dem Header kommt.

```tsx
// target — src/components/layout/Header.tsx:332ff
      {/* Mobile menu overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-menu"
            className="fixed inset-0 z-40 bg-surface-dark overflow-y-auto md:hidden pt-16"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
          >
            {/* Inhalt unverändert übernehmen: <div className="p-6"> … </div> */}
          </motion.div>
        )}
      </AnimatePresence>
```

Werte, die exakt so zu übernehmen sind:

| | |
| --- | --- |
| Kurve | `[0.23, 1, 0.32, 1]` — das ist die starke Ease-out-Kurve des Motion-Playbooks (`cubic-bezier(0.23, 1, 0.32, 1)`) in framer-motions Array-Schreibweise |
| Dauer rein | `0.2` |
| Dauer raus | `0.15` — über `exit` mit eigener `transition` (siehe Schritt 5) |
| Versatz | `y: -8`, nicht mehr. Ein bildschirmfüllendes Overlay, das weit fliegt, wirkt träge |
| Skalierung | keine. `scale` auf einem Vollbild-Overlay liest sich als Zoom, nicht als Übergang |

## Repo conventions to follow

- `AnimatePresence` + `motion.div` mit `initial`/`animate`/`exit` ist im Repo etabliert. Exemplar mit asymmetrischem Timing, das Schritt 5 imitiert:
  ```tsx
  // src/components/recipe/RecipeSubmitModal.tsx:257-260
  initial={{ opacity: 0, y: 24 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: 16, transition: { duration: 0.18 } }}
  transition={{ type: 'spring', stiffness: 300, damping: 26 }}
  ```
- `Header.tsx` ist bereits eine Client-Komponente (`'use client'` in Zeile 1) — kein zusätzlicher Direktiven-Wechsel nötig.
- `framer-motion` liegt durch `MarcoWidget` ohnehin auf jeder Seite im Bundle (`src/app/layout.tsx:110`); der Import im Header kostet nichts zusätzlich.

## Steps

1. In `src/components/layout/Header.tsx` den Import ergänzen, unterhalb der bestehenden Imports (Zeile 3-10):
   ```tsx
   import { motion, AnimatePresence } from 'framer-motion';
   ```
2. Zu Zeile 332 springen (`{/* Mobile menu overlay */}`).
3. Das `{mobileOpen && (` durch `<AnimatePresence>` + `{mobileOpen && (` ersetzen und den schließenden Teil entsprechend um `</AnimatePresence>` erweitern. Das Overlay endet aktuell bei Zeile 376 mit `)}`.
4. Das äußere `<div className="fixed inset-0 …">` zu `<motion.div>` machen, `key="mobile-menu"` ergänzen und die className **unverändert** übernehmen.
5. Die vier Motion-Props ergänzen, mit eigener Exit-Dauer:
   ```tsx
   initial={{ opacity: 0, y: -8 }}
   animate={{ opacity: 1, y: 0 }}
   exit={{ opacity: 0, y: -8, transition: { duration: 0.15, ease: [0.23, 1, 0.32, 1] } }}
   transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
   ```
6. Den gesamten Inhalt des Overlays (`<div className="p-6">` bis zu seinem schließenden Tag, Zeile 335-375) **wortgleich** übernehmen — keine Klasse, kein Link, kein Kommentar ändert sich.

## Boundaries

- Nur das mobile Menü. Die Suchleiste darüber (`Header.tsx:252`, `{searchOpen && …}`) teleportiert ebenfalls, ist aber ein eigener Kandidat mit eigenem Plan — hier **nicht** anfassen.
- Den Toggle-Button (`Header.tsx:239-246`) nicht ändern. Der Icon-Wechsel Menu ↔ X bleibt hart; ein Morph dort ist nicht Teil dieses Plans.
- Kein Body-Scroll-Lock, kein Focus-Trap, keine `aria`-Änderungen ergänzen. Beides sind sinnvolle, aber eigenständige Themen.
- Keine Springs. Ein Spring auf einem Vollbild-Overlay überschwingt sichtbar an der Bildschirmkante.
- Kein `useReducedMotion` ergänzen: Plan 002 stellt den `MotionProvider` mit `reducedMotion="user"` bereit, der `y` bei aktiver Systemeinstellung automatisch abschaltet und `opacity` behält. **Reihenfolge beachten** — ist Plan 002 noch nicht erledigt, bewegt sich dieses Menü bei `prefers-reduced-motion` weiterhin; das im Abschlussbericht vermerken.
- Keine neuen Dependencies.
- Bei Drift gegenüber Commit `14448e2`: STOPP und melden.

## Verification

- **Mechanisch**:
  - `npx tsc --noEmit` → keine neuen Fehler.
  - `npm run lint` → keine neuen Warnungen in `Header.tsx`.
- **Feel check**: `npm run dev`, DevTools → Device Toolbar → iPhone-Größe:
  - Menü-Button antippen: Das Overlay blendet in 200 ms auf und kommt dabei 8 px von oben herab.
  - Erneut antippen: Das Overlay blendet in 150 ms aus und ist dabei bis zum Schluss sichtbar — es darf **nicht** im ersten Frame verschwinden. Verschwindet es hart, ist `AnimatePresence` nicht korrekt außen herum.
  - Den Button schnell mehrfach hintereinander antippen: Die Bewegung muss aus dem aktuellen Zustand heraus umkehren, nicht von vorn beginnen und nicht flackern.
  - Einen Link im Menü antippen: Navigation passiert, das Overlay blendet sauber aus.
  - DevTools → Animations-Panel, Wiedergabe auf 10 % stellen und einmal öffnen: Die Bewegung startet schnell und läuft weich aus (Ease-out). Startet sie langsam, wurde die Kurve falsch übernommen.
  - Falls Plan 002 bereits erledigt: `prefers-reduced-motion: reduce` emulieren → Overlay blendet nur noch auf, ohne den 8-px-Versatz.
- **Done when**: Öffnen und Schließen sind beide sichtbar animiert, schnelles Umschalten flackert nicht, und Inhalt sowie Layout des Menüs sind unverändert gegenüber vorher.
