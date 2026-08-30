#!/usr/bin/env node
/**
 * check-mdx-komponenten.mjs — Build-Gate für JSX-Komponenten in content/
 *
 * WARUM ES DIESES SKRIPT GIBT (Vorfall 30.08.2026):
 * Commit 7f19d67 ("406 Rechtschreibkorrekturen aus LanguageTool-Triage") hat
 * beim Anwenden der Korrekturen einen JSX-Bezeichner miteingedeutscht:
 * <Schnelluebersicht> wurde zu <Schnellübersicht> — 94 Stellen in 47 Dateien.
 * Die Komponente heisst im Code Schnelluebersicht, also brach jede betroffene
 * Seite beim Prerender mit
 *
 *     Expected component `Schnellübersicht` to be defined
 *
 * auf /methoden/*, /diplome/lernen/* und /gruender-schmiede/lernen/*.
 * Repariert in 7a1fdb3.
 *
 * WAS DAMALS NICHT GEGRIFFEN HAT:
 * Der Fehler lag in content/, nicht im Code — tsc sieht MDX nicht. Er fiel
 * erst im Vercel-Build auf, also nach dem Push, und die Produktion stand
 * mehrere Tage rot. Die Nachsorge in efea468 (JSX-Maske in spell-check.mjs,
 * Komponentennamen in der Whitelist) haertet den PRUEFER — sie kann aber
 * nichts ausrichten, wenn jemand oder etwas den Bezeichner beim ANWENDEN
 * einer Korrektur veraendert. Genau diese Luecke schliesst dieses Gate.
 *
 * PRUEFUNG:
 * Jedes <Grossbuchstaben-Tag> in content/ muss einen passenden Namen im Code
 * haben — entweder als benannter Export unter src/components/ oder als
 * Schluessel in einer mdxComponents-Zuordnung. Fehlt der Name, bricht der
 * Build mit Datei, Zeile und Tagname ab.
 *
 * GRENZE DIESER PRUEFUNG (bewusst, nicht vergessen):
 * Geprueft wird gegen die VEREINIGUNG aller bekannten Namen, nicht pro Route.
 * Eine Komponente, die zwar existiert, aber in der mdxComponents-Zuordnung
 * GERADE DIESER Route fehlt, faellt hier nicht auf. Dafuer muesste das Gate
 * wissen, welches content/-Verzeichnis von welcher Seite gerendert wird —
 * eine Zuordnungstabelle, die still veraltet und dann falsche Sicherheit
 * gibt. Der Vorfall, um den es geht, war ein unbekannter Name; den faengt
 * die Vereinigung zuverlaessig.
 *
 * Usage:
 *   node scripts/check-mdx-komponenten.mjs
 *   node scripts/check-mdx-komponenten.mjs --verbose   # bekannte Namen zeigen
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT_DIR = path.join(ROOT, 'content');
const COMPONENTS_DIR = path.join(ROOT, 'src', 'components');
const APP_DIR = path.join(ROOT, 'src', 'app');
const VERBOSE = process.argv.includes('--verbose');

const c = {
  r: (s) => `\x1b[31m${s}\x1b[0m`,
  g: (s) => `\x1b[32m${s}\x1b[0m`,
  y: (s) => `\x1b[33m${s}\x1b[0m`,
  d: (s) => `\x1b[2m${s}\x1b[0m`,
};

/* ── Dateien einsammeln ─────────────────────────────────────────────────── */
function walk(dir, test, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name.startsWith('.')) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, test, out);
    else if (test(e.name)) out.push(full);
  }
  return out;
}

const rel = (p) => path.relative(ROOT, p).split(path.sep).join('/');

/* ── 1. Verwendete Tags aus content/ ────────────────────────────────────────
 * Zeilennummern muessen stimmen, deshalb wird Weggeschnittenes durch gleich
 * viele Zeilenumbrueche ersetzt statt geloescht. */
const gleichVieleZeilen = (s) => '\n'.repeat((s.match(/\n/g) || []).length);

function tagsAusMdx(quelltext) {
  const bereinigt = quelltext
    .replace(/^---\r?\n[\s\S]*?\r?\n---/, gleichVieleZeilen)   // Frontmatter
    .replace(/```[\s\S]*?```/g, gleichVieleZeilen)              // Code-Fences
    .replace(/~~~[\s\S]*?~~~/g, gleichVieleZeilen)              // alternative Fences
    .replace(/`[^`\n]*`/g, ' ');                                 // Inline-Code

  const treffer = [];
  // Oeffnend und selbstschliessend. </Foo> ist bewusst NICHT dabei: ein
  // schliessendes Tag ohne oeffnendes ist ein Syntaxfehler, den MDX selbst
  // meldet — hier wuerde es nur jeden Fund doppelt zaehlen.
  //
  // UNICODE, NICHT [A-Za-z] (sonst ist dieses Gate blind fuer genau seinen
  // Anlassfall): der kaputte Bezeichner aus 7f19d67 hiess Schnellübersicht.
  // Mit einer ASCII-Zeichenklasse bricht das Muster am 'ü' ab, findet also
  // gar kein Tag und meldet folgerichtig nichts. Beim ersten Testlauf lief
  // das Gate deshalb gruen durch den echten Vorfall.
  //
  // Ein "A<B sind keine Tags" im Fliesstext wird hier als <B> gemeldet. Das
  // ist Absicht und kein Fehlalarm: MDX behandelt '<' vor einem Buchstaben
  // ebenfalls als JSX und bricht daran. Das Gate meldet es nur frueher und
  // mit klarerer Begruendung als der Parser. ("5 < 10" bleibt unberuehrt.)
  const re = /<(\p{Lu}[\p{L}\p{N}_$]*)(?=[\s/>])/gu;
  let m;
  while ((m = re.exec(bereinigt)) !== null) {
    const zeile = bereinigt.slice(0, m.index).split('\n').length;
    treffer.push({ name: m[1], zeile });
  }
  return treffer;
}

/* ── 2a. Benannte Exporte aus src/components/ ───────────────────────────── */
function exportierteNamen(quelltext) {
  const namen = new Set();
  // export function X / export const X / export class X / export let X
  for (const m of quelltext.matchAll(/^\s*export\s+(?:async\s+)?(?:function|const|class|let|var)\s+([A-Za-z0-9_$]+)/gm)) {
    namen.add(m[1]);
  }
  // export { A, B as C }  — bei "as" zaehlt der aussen sichtbare Name
  for (const m of quelltext.matchAll(/^\s*export\s*\{([^}]*)\}/gm)) {
    for (const teil of m[1].split(',')) {
      const t = teil.trim();
      if (!t) continue;
      const alsName = t.match(/\bas\s+([A-Za-z0-9_$]+)$/);
      namen.add(alsName ? alsName[1] : t.replace(/^type\s+/, ''));
    }
  }
  return namen;
}

/* ── 2b. Schluessel aus mdxComponents-Zuordnungen ──────────────────────────
 * Klammern werden gezaehlt statt per Regex gesucht: die Literale enthalten
 * verschachtelte Objekte und JSX, an denen ein "bis zur naechsten }"-Muster
 * zuverlaessig danebengreift. */
function objektLiteralNach(quelltext, startIndex) {
  const auf = quelltext.indexOf('{', startIndex);
  if (auf < 0) return '';
  let tiefe = 0;
  for (let i = auf; i < quelltext.length; i++) {
    const ch = quelltext[i];
    if (ch === '{') tiefe++;
    else if (ch === '}') {
      tiefe--;
      if (tiefe === 0) return quelltext.slice(auf, i + 1);
    }
  }
  return '';
}

function zugeordneteNamen(quelltext) {
  const namen = new Set();
  // Jede Zuordnung, die wie eine MDX-Komponentenkarte aussieht.
  for (const m of quelltext.matchAll(/\b(?:const|let|var)\s+\w*[cC]omponents\w*\s*(?::[^=]+)?=/g)) {
    const literal = objektLiteralNach(quelltext, m.index);
    if (!literal) continue;
    // Nur Schluessel der obersten Ebene: Tiefe 1 relativ zum Literal.
    let tiefe = 0;
    for (let i = 0; i < literal.length; i++) {
      const ch = literal[i];
      if (ch === '{' || ch === '(' || ch === '[') tiefe++;
      else if (ch === '}' || ch === ')' || ch === ']') tiefe--;
      else if (tiefe === 1 && /\p{Lu}/u.test(ch)) {
        const rest = literal.slice(i);
        // "Name:" (Schluessel) oder "Name," / "Name}" (Kurzschreibweise).
        // Gleiche Unicode-Klasse wie oben — ein Schluessel mit Umlaut soll
        // als bekannt gelten und nicht stillschweigend durchfallen.
        const k = rest.match(/^(\p{Lu}[\p{L}\p{N}_$]*)\s*[,:}]/u);
        if (k) { namen.add(k[1]); i += k[1].length - 1; }
      }
    }
  }
  return namen;
}

/* ── Hauptlauf ──────────────────────────────────────────────────────────── */
const contentDateien = walk(CONTENT_DIR, (n) => /\.mdx?$/.test(n));
const tsxDateien = [
  ...walk(COMPONENTS_DIR, (n) => n.endsWith('.tsx')),
  ...walk(APP_DIR, (n) => n.endsWith('.tsx')),
];

if (contentDateien.length === 0 || tsxDateien.length === 0) {
  console.error(c.r('\nAbbruch: keine content/- oder .tsx-Dateien gefunden — stimmt das Arbeitsverzeichnis?'));
  // Eine Pruefung, die gar nicht laufen konnte, ist keine bestandene Pruefung.
  process.exit(1);
}

const bekannt = new Set();
const herkunft = new Map();
for (const datei of tsxDateien) {
  const quelltext = fs.readFileSync(datei, 'utf8');
  const ausDieserDatei = datei.startsWith(COMPONENTS_DIR)
    ? new Set([...exportierteNamen(quelltext), ...zugeordneteNamen(quelltext)])
    : zugeordneteNamen(quelltext);
  for (const n of ausDieserDatei) {
    bekannt.add(n);
    if (!herkunft.has(n)) herkunft.set(n, rel(datei));
  }
}

const fehlend = [];
const verwendet = new Map();
for (const datei of contentDateien) {
  for (const { name, zeile } of tagsAusMdx(fs.readFileSync(datei, 'utf8'))) {
    verwendet.set(name, (verwendet.get(name) || 0) + 1);
    if (!bekannt.has(name)) fehlend.push({ datei: rel(datei), zeile, name });
  }
}

console.log(`\n🧩 MDX-Komponenten-Gate: ${contentDateien.length} Inhaltsdatei(en), ${bekannt.size} bekannte Namen aus ${tsxDateien.length} .tsx-Datei(en)`);

if (VERBOSE) {
  console.log(c.d('\n   Verwendet in content/:'));
  for (const [n, anzahl] of [...verwendet].sort()) {
    const ok = bekannt.has(n);
    console.log(`   ${ok ? c.g('✓') : c.r('✗')} ${n.padEnd(24)} ${String(anzahl).padStart(4)}×  ${ok ? c.d(herkunft.get(n)) : c.r('kein Export, keine Zuordnung')}`);
  }
}

if (fehlend.length === 0) {
  console.log(c.g(`✓ Alle ${verwendet.size} verwendeten Komponenten sind aufloesbar.\n`));
  process.exit(0);
}

console.log(c.r(`\n✗ ${fehlend.length} Verwendung(en) ohne passenden Namen im Code:\n`));
for (const f of fehlend) {
  console.log(`  ${f.datei}:${f.zeile}  ${c.r('<' + f.name + '>')}`);
}

const eindeutig = [...new Set(fehlend.map((f) => f.name))];
console.log(c.y(`\n  Betroffene Bezeichner: ${eindeutig.join(', ')}`));
console.log(c.y('  Ein Komponentenname ist ein Bezeichner, kein Fliesstext — nicht eindeutschen,'));
console.log(c.y('  nicht "korrigieren". Entweder der Name in content/ ist falsch geschrieben,'));
console.log(c.y('  oder die Komponente fehlt in src/components/ bzw. in der mdxComponents-Zuordnung.'));
console.log(c.r('\n❌ MDX-Komponenten-Gate: Build gestoppt.\n'));
process.exit(1);
