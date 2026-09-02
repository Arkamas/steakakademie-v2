# 004 — Hover-Motion nur noch bei echtem Zeigegerät auslösen

- **Status**: DONE — umgesetzt und vollständig verifiziert am 02.09.2026 (Messwerte am Ende)
- **Commit**: 14448e2
- **Severity**: LOW
- **Category**: Accessibility
- **Estimated scope**: 1 Datei, 3 Zeilen — betrifft aber jede `hover:`- und `group-hover:`-Klasse im Projekt

## Problem

Touch-Geräte feuern beim Antippen ein synthetisches `:hover`, das bis zur nächsten Berührung bestehen bleibt. Tailwind kann Hover-Varianten deshalb in `@media (hover: hover) and (pointer: fine)` einpacken — aber nur, wenn das Future-Flag gesetzt ist. In Tailwind 3.4 ist es **standardmäßig aus**:

```js
// node_modules/tailwindcss/src/featureFlags.js:11-17
let featureFlags = {
  future: [
    'hoverOnlyWhenSupported',
    …
```

```js
// node_modules/tailwindcss/lib/corePlugins.js:204
!flagEnabled(config(), "hoverOnlyWhenSupported") ? "&:hover" : "@media (hover: hover) and (pointer: fine) { &:hover }"
```

`src/tailwind.config.js` enthält keinen `future`-Block, das Flag ist also inaktiv. Folge: Auf dem Handy zoomt beim Antippen einer Artikelkarte erst das Bild, bevor navigiert wird — sichtbar an jeder Karte der Site:

```tsx
// src/components/article/ArticleCard.tsx:30 — aktuell (identisch in Zeile 68, 96, 130)
              className="w-full h-full object-cover transition-transform duration-200 ease-out group-hover:scale-[1.03] motion-reduce:group-hover:scale-100"
```

Weitere betroffene Stellen, dieselbe Ursache: `src/components/home/FrischSaisonal.tsx:104`, der Desktop-Dropdown in `src/components/layout/Header.tsx:313`, sämtliche `hover:-translate-y-*`-Karten (`src/app/methoden/page.tsx:85`, `src/components/diplome/KontextRail.tsx:40, 62`, `src/app/zzp-niche/page.tsx:63`).

## Target

Ein Future-Flag in der Tailwind-Konfiguration. Danach erzeugt Tailwind für **jede** Hover-Variante automatisch den Media-Query-Wrapper; keine einzige Komponente muss angefasst werden.

```js
// target — src/../tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  future: {
    hoverOnlyWhenSupported: true,
  },
  content: [
    …
```

Erzeugtes CSS danach, exemplarisch:

```css
@media (hover: hover) and (pointer: fine) {
  .group:hover .group-hover\:scale-\[1\.03\] { transform: scale(1.03); }
}
```

## Repo conventions to follow

- `tailwind.config.js` liegt im Projekt-Root und nutzt CommonJS (`module.exports`) mit dem `/** @type {import('tailwindcss').Config} */`-JSDoc-Kommentar in Zeile 1. Beides beibehalten.
- Top-Level-Keys stehen dort in der Reihenfolge `content` → `theme` → `plugins`. `future` gehört als erster Key davor, so wie es die Tailwind-Doku zeigt.

## Steps

1. `tailwind.config.js` im Projekt-Root öffnen.
2. Direkt nach `module.exports = {` und vor `content: [` einfügen:

   ```js
   future: {
     hoverOnlyWhenSupported: true,
   },
   ```

3. Sonst nichts ändern — `content`, `theme.extend` und `plugins` bleiben Zeichen für Zeichen wie sie sind.

## Boundaries

- Genau diese eine Datei, genau diese drei Zeilen.
- **Keine** Komponente anfassen. Das ist der ganze Punkt des Plans: Der Effekt entsteht global durch die Konfiguration, nicht durch 40 Einzeländerungen.
- Kein weiteres Future-Flag aktivieren. `respectDefaultRingColorOpacity`, `disableColorOpacityUtilitiesByDefault` und `relativeContentPathsByDefault` stehen in derselben Liste, ändern aber Farb- und Pfadverhalten und sind hier ausdrücklich **nicht** gewollt.
- Kein `future: 'all'` setzen — das würde genau diese drei mit aktivieren.
- Bei Drift gegenüber Commit `14448e2`: STOPP und melden.

## Verification

- **Mechanisch**:
  - `npm run build` → läuft durch.
  - Im gebauten CSS muss der Wrapper auftauchen. **Achtung: Das Produktions-CSS ist minifiziert, die Leerzeichen im Media Query fehlen dort.** Deshalb ohne Leerzeichen suchen:
    ```bash
    grep -o "hover:hover" .next/static/css/*.css | wc -l
    ```
    Erwartung: Treffer > 0. Vor der Änderung ist das Ergebnis 0. Gemessen nach Umsetzung: 4 Media-Query-Blöcke, die alle Hover-Varianten bündeln, z. B.
    `@media (hover:hover) and (pointer:fine){.hover\:-translate-y-0\.5:hover{…}`
- **Feel check**:
  - **Desktop**, `npm run dev`, Startseite: Maus über eine Artikelkarte → Bild zoomt weiterhin um 3 % in 200 ms. Header-Dropdown öffnet weiterhin beim Hover. **Keine** Verhaltensänderung mit Maus — das ist das Erfolgskriterium.
  - **Touch**: DevTools → Device Toolbar → ein Mobilgerät wählen und **Touch-Simulation aktivieren** (nicht nur die Fenstergröße ändern, sonst greift `pointer: fine` weiterhin). Eine Artikelkarte antippen: Das Bild darf **nicht** mehr zoomen, die Navigation passiert direkt.
  - Nach der Rückkehr per Browser-Zurück darf keine Karte in einem "hängengebliebenen" Hover-Zustand stehen.
  - Zusätzlich am echten Telefon gegenprüfen, falls erreichbar: Die Emulation bildet `pointer: coarse` zuverlässig ab, aber das Zusammenspiel mit dem Zurück-Cache ist am Gerät ehrlicher.
- **Done when**: Der Grep liefert Treffer, Desktop-Hover verhält sich unverändert, und in der Touch-Emulation löst ein Tap keine Hover-Animation mehr aus.

## Ergebnis (02.09.2026)

Mechanisch: `tsc --noEmit`, `next lint` und `next build` (501 Seiten) je ohne Fehler. Im gebauten CSS 4 `@media (hover:hover) and (pointer:fine)`-Blöcke, vorher 0.

Verhalten automatisiert gemessen (Playwright aus dem Repo, Dev-Server):

| Kontext | `(hover: hover) and (pointer: fine)` | Bild-Transform |
| --- | --- | --- |
| Desktop 1440×900, Maus | `true` | Hover: `none` → `matrix(1.03, 0, 0, 1.03, 0, 0)` — unverändert |
| Touch 390×844, `hasTouch` (`hover: none`, `pointer: coarse`) | `false` | Nach Tap: `none` — kein Zoom |

Der Tap-Test allein wäre angreifbar, weil der Consent-Banner den Tap abfangen kann. Zusätzlich wurde deshalb das CSSOM ausgelesen: **alle sechs** `group-hover:scale-*`-Regeln (`scale-105`, `scale-110`, `scale-[1.02]`, `scale-[1.03]`, `scale-[1.04]`, `motion-reduce:group-hover:scale-100`) liegen in `@media (hover: hover) and (pointer: fine)` — im Desktop-Kontext mit `mediaMatches: true`, im Touch-Kontext mit `mediaMatches: false`. Die Regeln können auf Touch also unabhängig vom Tap-Ziel nicht greifen.

Keine Regression im Desktop-Hover gefunden.
