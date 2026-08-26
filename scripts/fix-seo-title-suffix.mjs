#!/usr/bin/env node
// ---------------------------------------------------------------------------
// fix-seo-title-suffix.mjs — entfernt den doppelten Markensuffix aus seoTitle
//
//   node scripts/fix-seo-title-suffix.mjs --dry-run
//   node scripts/fix-seo-title-suffix.mjs
//
// Befund 26.08.2026: 344 von 441 ausgelieferten Seiten trugen den Titel
// "… | Steakakademie | Steakakademie". Ursache: src/app/layout.tsx setzt
// `title.template = '%s | Steakakademie'`, waehrend 325 MDX-Dateien den
// Suffix bereits im Frontmatter-Feld `seoTitle` mitbringen. Next haengt ihn
// dann ein zweites Mal an. Google schneidet Titel ab ~60 Zeichen ab — der
// doppelte Suffix frisst 17 Zeichen Sichtbarkeit auf fast jeder Seite.
//
// Dieses Skript ist die Quellen-Reparatur: der Suffix gehoert in EINE
// Zustaendigkeit (das Template), nicht zusaetzlich in die Inhalte.
// ---------------------------------------------------------------------------
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, extname } from 'node:path';

const DRY = process.argv.includes('--dry-run');
const ROOT = 'content';
// Trennzeichen: | – — - vor dem Markennamen, am Zeilenende
const SUFFIX = /\s*[|–—-]\s*Steakakademie\s*$/;

async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...await walk(p));
    else if (extname(p) === '.mdx') out.push(p);
  }
  return out;
}

let touched = 0, scanned = 0;
for (const file of await walk(ROOT)) {
  const raw = await readFile(file, 'utf8');
  // Einige Dateien tragen ein BOM (\uFEFF) — ohne Abtrennen scheitert der
  // Frontmatter-Test und die Datei wird stillschweigend uebersprungen.
  const bom = raw.startsWith('\uFEFF') ? '\uFEFF' : '';
  const src = bom ? raw.slice(1) : raw;
  const end = src.indexOf('\n---', 4);
  if (!src.startsWith('---') || end < 0) continue;
  const fm = src.slice(0, end);
  const rest = src.slice(end);
  scanned++;

  // Deckt beide YAML-Schreibweisen ab: seoTitle: "..." und seoTitle: ohne Anfuehrungszeichen
  const out = fm.replace(/^(seoTitle:[ \t]*)(?:(["'])([^\n]*?)\2|([^\n"'][^\n]*?))[ \t\r]*$/m,
    (m, key, q, quoted, bare) => {
      const val = q ? quoted : bare;
      if (!SUFFIX.test(val)) return m;
      const clean = val.replace(SUFFIX, '').trimEnd();
      if (!clean) return m;                     // nie leeren Titel erzeugen
      if (DRY) console.log(`${file}\n   alt: ${val}\n   neu: ${clean}`);
      // Ohne Anfuehrungszeichen kann ein ':' oder '#' YAML brechen -> dann quoten
      const needsQuote = !q && /[:#]/.test(clean);
      return needsQuote ? `${key}"${clean.replace(/"/g, '\\"')}"` : `${key}${q ?? ''}${clean}${q ?? ''}`;
    });

  if (out !== fm) { touched++; if (!DRY) await writeFile(file, bom + out + rest, 'utf8'); }
}
console.log(`\n${DRY ? '[Trockenlauf] ' : ''}${touched} von ${scanned} MDX-Dateien ${DRY ? 'wuerden geaendert' : 'geaendert'}.`);
