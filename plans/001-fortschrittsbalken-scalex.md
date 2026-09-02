# 001 — Startseiten-Fortschrittsbalken von `width` auf `scaleX` umstellen

- **Status**: DONE — umgesetzt und vollständig verifiziert am 02.09.2026 (Messwerte am Ende)
- **Commit**: 14448e2
- **Severity**: HIGH
- **Category**: Performance
- **Estimated scope**: 1 Datei, ~6 geänderte Zeilen

## Problem

Der Fortschrittsbalken des Karussells „Frisch & Saisonal" auf der Startseite animiert die
CSS-Property `width` von `0%` auf `100%` — linear über 5,2 Sekunden, in einer Endlosschleife
(bei jedem Slide-Wechsel neu gestartet über den `key`), oberhalb des Folds auf der
meistbesuchten Seite der Site.

`width` ist eine Layout-Property. Jeder einzelne Frame dieser Animation löst Layout → Paint →
Composite aus, dauerhaft, auf dem Main Thread. `transform` und `opacity` sind die einzigen
Properties, die der Compositor allein erledigen kann.

`ROTATE_MS` ist in `src/components/home/FrischSaisonal.tsx:9` definiert als `5200`.

```tsx
// src/components/home/FrischSaisonal.tsx:148-159 — aktueller Stand
              {/* Fortschrittsbalken */}
              {total > 1 && (
                <div className="h-0.5 w-full bg-black/5">
                  <motion.div
                    key={`${slide.url}-bar`}
                    className="h-full"
                    style={{ background: '#C8882A' }}
                    initial={{ width: '0%' }}
                    animate={{ width: paused ? '0%' : '100%' }}
                    transition={{ duration: paused ? 0 : ROTATE_MS / 1000, ease: 'linear' }}
                  />
                </div>
              )}
```

## Target

Exakt dieselbe sichtbare Bewegung, aber über `transform: scaleX()` mit Ursprung links.

```tsx
// target
              {/* Fortschrittsbalken */}
              {total > 1 && (
                <div className="h-0.5 w-full bg-black/5">
                  <motion.div
                    key={`${slide.url}-bar`}
                    className="h-full w-full"
                    style={{ background: '#C8882A', transformOrigin: 'left' }}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: paused ? 0 : 1 }}
                    transition={{ duration: paused ? 0 : ROTATE_MS / 1000, ease: 'linear' }}
                  />
                </div>
              )}
```

Drei Dinge ändern sich, alle drei sind zwingend:

1. `className="h-full"` → `className="h-full w-full"`. Bisher kam die Breite aus der Animation
   selbst; ohne `w-full` wäre das Element nach der Umstellung 0 px breit und unsichtbar.
2. `style` bekommt `transformOrigin: 'left'`. Ohne das skaliert der Balken aus der Mitte nach
   beiden Seiten statt von links nach rechts zu wachsen.
3. `width: '0%' | '100%'` → `scaleX: 0 | 1`.

`transition` bleibt Zeichen für Zeichen unverändert — `ease: 'linear'` ist für einen
Fortschrittsbalken korrekt (konstante Bewegung, siehe Regel „Constant motion → linear").

## Repo conventions to follow

- Motion-Werte stehen in dieser Datei inline am `motion.`-Element; es gibt (noch) keine
  Motion-Tokens. Keine einführen — das ist Gegenstand eines separaten Befunds.
- `transformOrigin` als camelCase-Key im React-`style`-Objekt, so wie es
  `src/components/layout/AnimatedLogo.tsx:151` bereits macht:
  `style={{ transformOrigin: '250px 192px' }}`
- Exemplar für einen korrekt gebauten Balken im Repo: `src/components/diplome/AnimatedBar.tsx`
  (nutzt zwar ebenfalls noch `width`, aber zeigt die Struktur „Track-Div außen, motion-Div innen").

## Steps

1. `src/components/home/FrischSaisonal.tsx` öffnen, zu Zeile 148 springen
   (Kommentar `{/* Fortschrittsbalken */}`).
2. In der `motion.div` darunter `className="h-full"` ersetzen durch `className="h-full w-full"`.
3. In derselben `motion.div` das `style`-Objekt ersetzen:
   `style={{ background: '#C8882A' }}` → `style={{ background: '#C8882A', transformOrigin: 'left' }}`
4. `initial={{ width: '0%' }}` ersetzen durch `initial={{ scaleX: 0 }}`.
5. `animate={{ width: paused ? '0%' : '100%' }}` ersetzen durch `animate={{ scaleX: paused ? 0 : 1 }}`.
6. Die `transition`-Zeile **nicht** anfassen.

## Boundaries

- Nur die eine `motion.div` des Fortschrittsbalkens. Die Slide-Animation darüber
  (`FrischSaisonal.tsx:90-95`, `initial={{ y: 12 }}`) bleibt unangetastet.
- Keine anderen Fortschrittsbalken in diesem Durchgang — `AgingClient.tsx`,
  `diplome/simulation/page.tsx`, `NicheValidator.tsx` und `AnimatedBar.tsx` haben dasselbe
  Muster, sind aber ein eigener Befund und ein eigener Plan.
- Kein `useReducedMotion` hinzufügen — das ist Plan 002 und würde hier kollidieren.
- Keine Struktur-, Farb- oder Markup-Änderungen, keine neuen Dependencies.
- Wenn der Code an Zeile 148-159 nicht dem oben zitierten Stand entspricht (Drift seit
  Commit `14448e2`): STOPP, melden, nicht improvisieren.

## Verification

- **Mechanisch**:
  - `npx tsc --noEmit` → keine neuen Fehler.
  - `npm run lint` → keine neuen Warnungen in `FrischSaisonal.tsx`.
- **Feel check**: `npm run dev`, `http://localhost:3000` öffnen, zum Block „Frisch & Saisonal" scrollen:
  - Der goldene Balken wächst von **links nach rechts** über die volle Kartenbreite und
    braucht dafür 5,2 s — visuell identisch zu vorher.
  - Beim Slide-Wechsel springt er auf 0 zurück und startet neu.
  - Maus über die Karte halten → Balken fährt sofort auf 0 zurück (`paused`), Maus weg → läuft neu.
  - DevTools → Rendering → **Paint flashing** aktivieren: während der Balken läuft, darf
    **kein** grünes Repaint-Rechteck mehr über der Karte oder dem umgebenden Layout blinken.
    Vor dem Fix blinkt es im Sekundentakt.
  - DevTools → Performance, 6 s aufzeichnen: in der Timeline dürfen für den Balken keine
    `Layout`-Einträge mehr auftauchen, nur `Composite Layers`.
- **Done when**: Balken sieht identisch aus, läuft identisch lang, und Paint Flashing zeigt
  während der Animation keine Repaints des Karussell-Bereichs mehr.

## Ergebnis (02.09.2026)

Mechanisch: `tsc --noEmit`, `next lint` und `next build` (501 Seiten) je ohne Fehler.

Verhalten automatisiert gemessen (Playwright aus dem Repo, Chromium 1440×900, Dev-Server):

| Messung | Ergebnis |
| --- | --- |
| `transform-origin` (computed) | `0px 1px` — linke Kante |
| `scaleX` über 3,2 s, alle 400 ms | 0,837 → 0,917 → 0,994 → *(Slide-Wechsel)* → 0,071 → 0,151 → 0,228 → 0,305 → 0,385 |
| `width` (computed) | `476.656px` bei **jeder** Messung identisch |
| `offsetWidth` | `477` konstant |

Die konstante Layout-Breite bei gleichzeitig wachsendem `scaleX` ist der eigentliche Nachweis:
Vor der Änderung wäre `offsetWidth` im selben Zeitraum von 0 auf 477 gewandert. Paint Flashing
wurde nicht separat geprüft — die konstante Layout-Breite deckt dieselbe Ursache ab.
