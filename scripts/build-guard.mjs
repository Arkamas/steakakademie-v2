#!/usr/bin/env node
// ── Build-Guard (KAN-29) ──────────────────────────────────────────────────────
// Macht stille Content-Defekte sichtbar, die einen "grünen" Build überleben.
// Zwei reale Vorfälle dieser Session als Grundlage:
//   • KAN-26: 32 Rezepte fielen via CRLF stumm aus dem Build (nur Warnung).
//   • KAN-28: Markdown-Tabellen rendern als Pipe-Text, weil remark-gfm fehlte.
// Exit 1 bei Defekt → CI rot → der Ops-Hook öffnet automatisch ein KAN-Ticket.

import { execSync } from 'node:child_process';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

let failed = false;
const fail = (m) => { console.error('❌ ' + m); failed = true; };
const ok = (m) => console.log('✅ ' + m);

function walk(dir, ext, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    // contentDirExclude in contentlayer.config.ts schliesst '_archiv' aus —
    // hier mitziehen, sonst zaehlt der Guard Quellen mit, die Contentlayer nie
    // generiert, und meldet einen stummen Doc-Drop, den es gar nicht gibt.
    if (e.isDirectory()) {
      if (e.name === '_archiv') continue;
      walk(p, ext, acc);
    } else if (e.name.endsWith(ext)) acc.push(p);
  }
  return acc;
}

const mdxFiles = walk('content', '.mdx');
console.log(`Build-Guard: ${mdxFiles.length} .mdx-Quellen unter content/\n`);

// ── Check A: Contentlayer-Integrität (gegen KAN-26: stille Doc-Drops) ──────────
console.log('— Check A: Contentlayer (0 Probleme + Doc-Count) —');
let clOut = '';
try {
  clOut = execSync('npx contentlayer2 build', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
} catch (e) {
  clOut = `${e.stdout || ''}${e.stderr || ''}`;
}
const problems = /Found (\d+) problems?/i.exec(clOut);
const generated = /Generated (\d+) documents?/i.exec(clOut);

if (problems && Number(problems[1]) > 0) {
  fail(`Contentlayer meldet ${problems[1]} Problem(e) → stumme Defekte (vgl. KAN-26). Quelldateien prüfen (oft CRLF/Frontmatter).`);
} else {
  ok('Contentlayer: 0 Probleme.');
}
if (generated) {
  const gen = Number(generated[1]);
  if (gen < mdxFiles.length) {
    fail(`Nur ${gen} Dokumente generiert, aber ${mdxFiles.length} .mdx-Quellen → ${mdxFiles.length - gen} sind stumm rausgefallen.`);
  } else {
    ok(`Doc-Count plausibel: ${gen} generiert ≥ ${mdxFiles.length} Quellen.`);
  }
} else {
  fail('Konnte "Generated N documents" nicht aus der Contentlayer-Ausgabe lesen.');
}

// ── Check B: Tabellen brauchen remark-gfm (gegen KAN-28: Pipe-Text statt <table>) ─
console.log('\n— Check B: Tabellen-Syntax ⇒ remark-gfm aktiv —');
const filesWithTables = mdxFiles.filter((f) => /\|\s*:?-{3,}/.test(readFileSync(f, 'utf8')));
if (filesWithTables.length === 0) {
  ok('Keine Markdown-Tabellen in Quellen — Check übersprungen.');
} else {
  const cfg = existsSync('contentlayer.config.ts') ? readFileSync('contentlayer.config.ts', 'utf8') : '';
  const gfmConfigured = /remarkGfm/.test(cfg) && /remarkPlugins/.test(cfg);
  if (!gfmConfigured) {
    fail(`${filesWithTables.length} MDX-Quellen enthalten Tabellen, aber remark-gfm ist nicht in contentlayer.config.ts (remarkPlugins) aktiv → Tabellen würden als Pipe-Text rendern (vgl. KAN-28).`);
  } else {
    ok(`${filesWithTables.length} Dateien mit Tabellen — remark-gfm ist aktiv.`);
  }
}

console.log('');
if (failed) {
  console.error('🔴 BUILD-GUARD: stille Defekte gefunden — NICHT deployen.');
  process.exit(1);
}
console.log('🟢 BUILD-GUARD: keine stillen Defekte.');
