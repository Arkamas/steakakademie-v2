import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { bewerte, FRAGEN, FLASHCARDS } from '@/lib/diplome/fragen';
import {
  STUFEN,
  LEVELS,
  STUFEN_ORDER,
  QUIZ_FRAGEN_JE_MODUL,
  QUIZ_BESTEHENSGRENZE,
  stufeByKey,
  tierForLevel,
  type StufeKey,
} from '@/lib/diplome/stufen';

// Audit 06.09.2026 — die Tests halten fest, was vorher kaputt war.

describe('Stufenpruefung: Bewertung', () => {
  const alleRichtig = (modul: StufeKey) => FRAGEN[modul].map((f) => f.correct);

  it('bestanden nur ab der Bestehensgrenze', () => {
    for (const modul of STUFEN_ORDER) {
      const richtig = alleRichtig(modul);
      expect(bewerte(modul, richtig)).toMatchObject({ score: QUIZ_FRAGEN_JE_MODUL, bestanden: true });

      // genau eine falsch → immer noch bestanden (4 von 5)
      const eineFalsch = richtig.map((c, i) => (i === 0 ? (c + 1) % 4 : c));
      expect(bewerte(modul, eineFalsch)).toMatchObject({ score: QUIZ_FRAGEN_JE_MODUL - 1, bestanden: true });

      // zwei falsch → NICHT bestanden. Vorher wurde jedes Ergebnis verbucht.
      const zweiFalsch = richtig.map((c, i) => (i < 2 ? (c + 1) % 4 : c));
      expect(bewerte(modul, zweiFalsch)).toMatchObject({ score: QUIZ_FRAGEN_JE_MODUL - 2, bestanden: false });

      // alles falsch / leer → 0, nicht bestanden
      expect(bewerte(modul, [])).toMatchObject({ score: 0, bestanden: false });
      expect(bewerte(modul, [-1, -1, -1, -1, -1])).toMatchObject({ score: 0, bestanden: false });
    }
  });

  it('Bestehensgrenze ist 4 von 5', () => {
    expect(QUIZ_FRAGEN_JE_MODUL).toBe(5);
    expect(QUIZ_BESTEHENSGRENZE).toBe(4);
  });

  it('jedes Modul hat genau QUIZ_FRAGEN_JE_MODUL Fragen mit gueltigem correct-Index', () => {
    for (const modul of STUFEN_ORDER) {
      expect(FRAGEN[modul]).toHaveLength(QUIZ_FRAGEN_JE_MODUL);
      for (const f of FRAGEN[modul]) {
        expect(f.correct).toBeGreaterThanOrEqual(0);
        expect(f.correct).toBeLessThan(f.options.length);
        expect(f.explain.length).toBeGreaterThan(0);
      }
      expect(FLASHCARDS[modul].length).toBeGreaterThan(0);
    }
  });
});

describe('Fragen ↔ Lektionen (Regel 8b, Pruefungsbezug)', () => {
  const root = join(process.cwd(), 'content', 'diplom-lektionen');
  const slugsJeStufe = new Map<number, Set<string>>();
  for (const s of STUFEN) {
    const dir = join(root, `stufe-${s.nr}`);
    const set = new Set<string>();
    for (const file of readdirSync(dir)) {
      if (!file.endsWith('.mdx')) continue;
      const m = readFileSync(join(dir, file), 'utf8').match(/^lektionSlug:\s*"([^"]+)"/m);
      if (m) set.add(m[1]);
    }
    slugsJeStufe.set(s.nr, set);
  }

  it('jede Frage zeigt auf eine existierende Lektion ihrer Stufe', () => {
    for (const modul of STUFEN_ORDER) {
      const stufe = stufeByKey(modul)!;
      const slugs = slugsJeStufe.get(stufe.nr)!;
      for (const f of FRAGEN[modul]) {
        expect(slugs.has(f.lektionSlug), `${modul}: "${f.q}" → ${f.lektionSlug}`).toBe(true);
      }
    }
  });

  it('jede Stufe hat sieben Lektionen', () => {
    for (const s of STUFEN) expect(slugsJeStufe.get(s.nr)!.size).toBe(7);
  });
});

describe('Taxonomie: eine Quelle', () => {
  it('fuenf Stufen, zehn Level, je zwei Level pro Stufe', () => {
    expect(STUFEN).toHaveLength(5);
    expect(LEVELS).toHaveLength(10);
    for (const s of STUFEN) {
      const lv = LEVELS.filter((l) => l.stufe === s.nr).map((l) => l.id);
      expect(lv).toEqual([...s.levels]);
    }
  });

  it('Freischaltkette ist lueckenlos (vorher fehlte requires bei Stufe 2)', () => {
    expect(STUFEN[0].requires).toBeNull();
    for (let i = 1; i < STUFEN.length; i++) {
      expect(STUFEN[i].requires).toBe(STUFEN[i - 1].key);
    }
  });

  it('tierForLevel folgt der Stufe', () => {
    expect(tierForLevel(1)).toBe('bronze');
    expect(tierForLevel(2)).toBe('bronze');
    expect(tierForLevel(3)).toBe('silber');
    expect(tierForLevel(10)).toBe('master');
  });
});

describe('Regel 8c: Zahlen in Fragen und Flashcards folgen der Referenz', () => {
  const referenz = readFileSync(join(process.cwd(), 'data', 'kerntemperatur-referenz.yaml'), 'utf8');
  const schweinMin = Number(referenz.match(/^\s*schwein:\s*(\d+)/m)?.[1]);
  const beefMr = referenz.match(/beef_mr:\s*\{[^}]*range:\s*\[(\d+),\s*(\d+)\]/)?.slice(1, 3).map(Number);

  it('Referenz gelesen', () => {
    expect(schweinMin).toBe(63);
    expect(beefMr).toEqual([52, 55]);
  });

  it('Schweinefilet-Antwort unterschreitet das Sicherheits-Minimum nicht', () => {
    const f = FRAGEN.thermometer.find((q) => q.q.includes('Schweinefilet'))!;
    const richtig = f.options[f.correct];
    const unter = Number(richtig.match(/(\d+)/)?.[1]);
    expect(unter).toBeGreaterThanOrEqual(schweinMin);
  });

  it('Rind medium rare entspricht dem Referenzkorridor', () => {
    const f = FRAGEN.thermometer.find((q) => q.q.includes('medium rare'))!;
    expect(f.options[f.correct]).toContain(`${beefMr![0]}–${beefMr![1]}`);
    const card = FLASHCARDS.thermometer.find((c) => c.front === 'Rind medium rare')!;
    expect(card.back).toContain(`${beefMr![0]}–${beefMr![1]}`);
  });
});
