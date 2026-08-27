#!/usr/bin/env node
/**
 * check-startseiten-hierarchie.mjs — Build-Gate für die Reihenfolge der Startseite
 *
 * WARUM ES DIESES SKRIPT GIBT (Uwe, 20.08.2026):
 * Das Ausbildungsangebot (Diplome / Mitgliedschaft) ist wiederholt von selbst an den
 * Anfang der Startseite gewandert. Ursache war keine Nachlässigkeit, sondern die
 * Doktrin: CLAUDE.md Abschnitt 5 heißt „Kritische Blocker (Umsatz zuerst)" und nennt
 * „Diplom Bronze live" — eine Gegenregel zur Startseiten-Hierarchie gab es nicht.
 * Jeder Agent hat also folgerichtig das Angebot nach oben gezogen.
 *
 * Prosa allein hat das nicht verhindert. Deshalb bricht ab jetzt der Build.
 *
 * SOLL-HIERARCHIE (Entscheidung Uwe, 20.08.2026): INHALT ZUERST.
 * Der erste Bildschirm gehört dem Thema, nicht dem Angebot. Das Diplom erscheint
 * als Teaser weiter unten. Das entspricht der Strategie „Reichweite zuerst,
 * dann aktivieren".
 *
 * ÄNDERN DER REIHENFOLGE IST ERLAUBT — aber nur bewusst: SOLL_REIHENFOLGE unten
 * anpassen UND in CLAUDE.md Abschnitt 2 vermerken. Wer nur page.tsx umbaut,
 * bekommt einen roten Build. Genau das ist der Zweck.
 */

import { readFileSync } from 'node:fs';

const DATEI = 'src/app/page.tsx';

/** Marker-Kommentare in src/app/page.tsx, in der verbindlichen Reihenfolge. */
// GEAENDERT (Uwe, 27.08.2026): Der Magazin-Aufmacher (HERO) steht an Position 1 —
// die Startseite oeffnet wie ein Magazin mit der aktuellsten Geschichte, nicht
// mit der Selbstbeschreibung. INHALT ZUERST bleibt damit erst recht erfuellt:
// ein redaktioneller Artikel ist mehr "Thema" als das Value-Prop-Band. Der
// Mitglieder-CTA bleibt unterhalb. Vermerkt in CLAUDE.md Regel 8.
const SOLL_REIHENFOLGE = [
  'HERO',
  'SECONDARY ARTICLES',
  'VALUE-PROP-BAND',
  'WERKZEUGE',
  'LEADMAGNET',
  'PLATTFORM-PULS',
  'FRISCH & SAISONAL',
  'MANIFESTO',
  'DIPLOM-TEASER',
  'BBQ-NEWS TEASER',
  'KATEGORIE-SEKTIONEN',
  'TOP-PRODUKTE',
  'NEUESTE ARTIKEL',
  'TRUST-BAR',
];

/**
 * Abschnitte, die NICHT über einer bestimmten Grenze stehen dürfen.
 * Der Diplom-Teaser darf nie vor den redaktionellen Einstieg rutschen.
 */
const NICHT_VOR = [
  { abschnitt: 'DIPLOM-TEASER', darf_nicht_vor: 'KATEGORIE-SEKTIONEN', ausnahme: 'MANIFESTO' },
];

/** Höchstzahl an Links auf /diplome oberhalb des HERO-Abschnitts. */
const MAX_DIPLOM_LINKS_OBEN = 1;

const quelle = readFileSync(DATEI, 'utf8');
const zeilen = quelle.split('\n');
const fehler = [];

// ── 1) Reihenfolge der Marker ───────────────────────────────────────────────
const gefunden = [];
zeilen.forEach((zeile, i) => {
  for (const marker of SOLL_REIHENFOLGE) {
    if (zeile.includes('──') && zeile.includes(marker) && !gefunden.some((g) => g.marker === marker)) {
      gefunden.push({ marker, zeile: i + 1 });
    }
  }
});

const fehlend = SOLL_REIHENFOLGE.filter((m) => !gefunden.some((g) => g.marker === m));
if (fehlend.length) {
  fehler.push(
    `Abschnitte fehlen oder wurden umbenannt: ${fehlend.join(', ')}\n` +
      `   → Wenn das gewollt ist, SOLL_REIHENFOLGE in diesem Skript anpassen.`,
  );
}

const ist = gefunden.map((g) => g.marker);
const sollGefiltert = SOLL_REIHENFOLGE.filter((m) => ist.includes(m));
if (ist.join('|') !== sollGefiltert.join('|')) {
  fehler.push(
    `Reihenfolge weicht ab.\n` +
      `   SOLL: ${sollGefiltert.join(' → ')}\n` +
      `   IST:  ${ist.join(' → ')}`,
  );
}

// ── 2) Diplom-Teaser nicht nach oben gerutscht ──────────────────────────────
for (const regel of NICHT_VOR) {
  const a = gefunden.find((g) => g.marker === regel.abschnitt);
  const b = gefunden.find((g) => g.marker === regel.darf_nicht_vor);
  if (a && b && a.zeile > b.zeile) {
    fehler.push(
      `„${regel.abschnitt}" steht in Zeile ${a.zeile} und damit NACH „${regel.darf_nicht_vor}" (Zeile ${b.zeile}) — erwartet war davor.`,
    );
  }
}

// ── 3) Angebots-Links oberhalb des HERO begrenzen ───────────────────────────
const heroZeile = gefunden.find((g) => g.marker === 'HERO')?.zeile ?? zeilen.length;
const obenDrueber = zeilen.slice(0, heroZeile).join('\n');
const diplomLinks = (obenDrueber.match(/href=["']\/diplome/g) || []).length;
if (diplomLinks > MAX_DIPLOM_LINKS_OBEN) {
  fehler.push(
    `${diplomLinks} Links auf /diplome oberhalb des HERO-Abschnitts — erlaubt ist maximal ${MAX_DIPLOM_LINKS_OBEN}.\n` +
      `   Der erste Bildschirm gehört dem Inhalt, nicht dem Angebot (CLAUDE.md Abschnitt 2).`,
  );
}

// ── Ergebnis ────────────────────────────────────────────────────────────────
if (fehler.length) {
  console.error('\n❌ Startseiten-Hierarchie verletzt (' + DATEI + ')\n');
  fehler.forEach((f) => console.error('   • ' + f + '\n'));
  console.error(
    '   Hintergrund: Das Ausbildungsangebot ist mehrfach unbemerkt nach oben gewandert.\n' +
      '   Die Reihenfolge ist eine Entscheidung von Uwe (20.08.2026), keine Optimierungsfrage.\n' +
      '   Änderung nur bewusst: SOLL_REIHENFOLGE in scripts/check-startseiten-hierarchie.mjs\n' +
      '   anpassen und in CLAUDE.md Abschnitt 2 vermerken.\n',
  );
  process.exit(1);
}

console.log(`✅ Startseiten-Hierarchie unverändert (${ist.length} Abschnitte, ${diplomLinks} Diplom-Link(s) oberhalb HERO)`);
