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

  const opentype: { parse: typeof parse };
  export default opentype;
}
