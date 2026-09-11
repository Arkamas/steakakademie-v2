/**
 * Minimale Typen fuer opentype.js 2.x.
 *
 * Das Paket bringt selbst keine Typen mit, und @types/opentype.js beschreibt
 * die 1.x-Fassung. Statt eine unpassende Typdefinition zu installieren, steht
 * hier genau der Ausschnitt, den src/lib/urkunde/render.ts benutzt — was das
 * Paket sonst noch kann, geht uns nichts an.
 */
declare module 'opentype.js' {
  export interface Path {
    toPathData(fractionDigits?: number): string;
  }

  export interface Glyph {
    advanceWidth: number;
    getPath(x: number, y: number, fontSize: number): Path;
  }

  export interface Font {
    unitsPerEm: number;
    charToGlyph(c: string): Glyph;
    charToGlyphIndex(c: string): number;
    getKerningValue(links: Glyph, rechts: Glyph): number;
  }

  export function parse(buffer: ArrayBuffer): Font;
}

/**
 * Hier stand bis 11.09.2026 zusaetzlich ein `export default opentype`, und
 * render.ts importierte darueber. Das hat getypt, aber `next build` warnte:
 *
 *   Attempted import error: 'opentype.js' does not contain a default export
 *
 * Zu Recht. Das Paket hat zwei Einstiegspunkte, und nur einer kennt einen
 * Default:
 *   main   → dist/opentype.js   UMD, haengt per Footer `'default': opentype`
 *                               an die Exporte — der Default existiert.
 *   module → dist/opentype.mjs  reines ESM, exportiert NUR benannt
 *                               (parse, Font, Path, …) — kein Default.
 *
 * Gebuendelt wird derzeit die UMD-Fassung, deshalb lief es trotz der Warnung
 * (nachgeprueft im Kompilat: `l.default.parse(...)`, und der Aufruf klappt).
 * Verlassen sollte man sich darauf nicht: Wer die Aufloesung verschiebt —
 * Turbopack, ein Next-Upgrade, ein `exports`-Feld beim naechsten
 * opentype.js-Release — bekommt `undefined.parse` und damit einen Fehler
 * erst zur Laufzeit, in der Freigabe, nach dem Deploy.
 *
 * Der benannte Import funktioniert gegen BEIDE Fassungen. Damit der Default
 * nicht versehentlich zurueckkehrt, ist er hier nicht mehr deklariert: Ein
 * `import opentype from 'opentype.js'` ist jetzt ein Typfehler und faellt im
 * Typecheck auf, nicht in der Produktion.
 */
