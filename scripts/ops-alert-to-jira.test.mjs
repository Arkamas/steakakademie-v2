import { describe, it, expect } from 'vitest';
import { zaehleVorfaelle, eskalationsPlan, VORFALL_MARKER } from './ops-alert-to-jira.mjs';

/** Baut einen Jira-Kommentar im ADF-Format, wie ihn das Skript schreibt. */
function adfKommentar(text) {
  return {
    body: {
      type: 'doc',
      version: 1,
      content: [{ type: 'paragraph', content: [{ type: 'text', text }] }],
    },
  };
}

describe('zaehleVorfaelle', () => {
  it('zaehlt an einem frischen Ticket null Vorfaelle', () => {
    expect(zaehleVorfaelle([])).toBe(0);
    expect(zaehleVorfaelle()).toBe(0);
  });

  it('ignoriert Kommentare von Menschen', () => {
    const comments = [
      adfKommentar('Schaue ich mir morgen an.'),
      adfKommentar('Betrifft nur den Montagslauf.'),
    ];
    expect(zaehleVorfaelle(comments)).toBe(0);
  });

  it('findet den Marker im verschachtelten ADF-Body', () => {
    const comments = [
      adfKommentar(`${VORFALL_MARKER} 1: Content-Pipeline fehlgeschlagen`),
      adfKommentar('Zwischenruf eines Menschen'),
      adfKommentar(`${VORFALL_MARKER} 2: Content-Pipeline fehlgeschlagen`),
    ];
    expect(zaehleVorfaelle(comments)).toBe(2);
  });

  it('kommt mit fehlendem oder leerem Body klar', () => {
    expect(zaehleVorfaelle([{}, { body: null }, adfKommentar(`${VORFALL_MARKER} 1: x`)])).toBe(1);
  });
});

describe('eskalationsPlan', () => {
  const schwelle = 3;

  it('kommentiert immer', () => {
    for (const n of [1, 2, 3, 4, 99]) {
      expect(eskalationsPlan(n, schwelle).kommentieren).toBe(true);
    }
  });

  it('eskaliert nicht unterhalb der Schwelle', () => {
    expect(eskalationsPlan(1, schwelle).eskalieren).toBe(false);
    expect(eskalationsPlan(2, schwelle).eskalieren).toBe(false);
  });

  it('eskaliert genau einmal, beim Erreichen der Schwelle', () => {
    expect(eskalationsPlan(3, schwelle).eskalieren).toBe(true);
    expect(eskalationsPlan(4, schwelle).eskalieren).toBe(false);
    expect(eskalationsPlan(9, schwelle).eskalieren).toBe(false);
  });

  it('meldet ab der Schwelle dauerhaft "wiederholt sich"', () => {
    expect(eskalationsPlan(2, schwelle).ueberSchwelle).toBe(false);
    expect(eskalationsPlan(3, schwelle).ueberSchwelle).toBe(true);
    expect(eskalationsPlan(9, schwelle).ueberSchwelle).toBe(true);
  });

  it('eskaliert nie bei unbrauchbarer Schwelle', () => {
    for (const s of [0, -1, Number.NaN]) {
      expect(eskalationsPlan(5, s).eskalieren).toBe(false);
      expect(eskalationsPlan(5, s).ueberSchwelle).toBe(false);
    }
  });

  it('haette den realen Fall erkannt: acht Fehlschlaege in Folge', () => {
    // KAN-62, Juli bis September 2026. Vorher: acht Mal dieselbe Logzeile.
    const stufen = [1, 2, 3, 4, 5, 6, 7, 8].map((n) => eskalationsPlan(n, schwelle));
    expect(stufen.filter((s) => s.eskalieren)).toHaveLength(1);
    expect(stufen.filter((s) => s.ueberSchwelle)).toHaveLength(6);
    expect(stufen.every((s) => s.kommentieren)).toBe(true);
  });
});
