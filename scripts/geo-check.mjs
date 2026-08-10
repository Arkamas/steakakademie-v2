#!/usr/bin/env node
// ── GEO-Check (GEO Manager) ───────────────────────────────────────────────────
// Ganzseiten-Re-Check bei jedem neuen Text. GEO ist ein Domain-Effekt, kein
// Einzelseiten-Effekt: ein neuer Artikel verändert Entity-Struktur und interne
// Verlinkung der GANZEN Domain. Dieses Skript prüft daher immer ALLE content/-
// Texte, nicht nur die geänderten.
//
// Doktrin: docs/geo-manager-agent.md · Signale: docs/geo-llm-ranking-factors.md
//
// Politik (wie build-guard): HARTE Defekte → exit 1 (CI rot + KAN-Ticket).
// Weiche Befunde → WARN (im Report sichtbar, kein Abbruch) = GEO-Backlog.

import { readdirSync, readFileSync, existsSync, appendFileSync } from 'node:fs';
import { join } from 'node:path';

const fails = [];
const warns = [];
const fail = (m) => fails.push(m);
const warn = (m) => warns.push(m);

function walk(dir, ext, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, ext, acc);
    else if (e.name.endsWith(ext)) acc.push(p);
  }
  return acc;
}

// Minimaler Frontmatter-Parser (Skalar-Keys), dependency-frei wie build-guard.
function parse(file) {
  const raw = readFileSync(file, 'utf8').replace(/^﻿/, ''); // BOM strippen (vgl. KAN-26)
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(raw);
  const fm = {};
  for (const line of (m ? m[1] : '').split(/\r?\n/)) {
    const kv = /^([A-Za-z0-9_]+):\s*(.*)$/.exec(line);
    if (kv) fm[kv[1]] = kv[2].replace(/^["']|["']$/g, '').trim();
  }
  return { fm, body: m ? m[2] : raw };
}

// content/<typ>/... → Typ ableiten (für typ-spezifische Regeln).
const typeOf = (f) => f.split(/[\\/]/)[1] || '';
// Verschiedene Content-Typen benennen das Beschreibungs-Feld unterschiedlich.
const DESC_FIELDS = ['description', 'seoDescription', 'excerpt', 'shortDefinition'];
const descOf = (fm) => DESC_FIELDS.map((k) => fm[k]).filter(Boolean).sort((a, b) => b.length - a.length)[0] || '';
const seoDescOf = (fm) => fm.seoDescription || fm.description || '';

const AUTHOR_TYPES = new Set(['rezepte', 'cuts', 'methoden', 'usa', 'vergleich', 'gruender-schmiede', 'persoenlichkeiten']);
const LINK_TYPES = new Set(['rezepte', 'cuts', 'methoden', 'usa', 'vergleich', 'gruender-schmiede']);

const files = walk('content', '.mdx');
const docs = files.map((f) => ({ file: f, type: typeOf(f), ...parse(f) }));
console.log(`GEO-Check: ${files.length} content/-Texte (Ganzseiten-Re-Check)\n`);

// ── Check A: SEO/GEO-Basis — title + Beschreibung (HART) ──────────────────────
console.log('— Check A: title + Beschreibung vorhanden (HART) —');
for (const d of docs) {
  if (!d.fm.title) fail(`${d.file}: kein \`title\` → keine SEO-/GEO-Basis.`);
  if (descOf(d.fm).length < 10) {
    fail(`${d.file}: keine Beschreibung (description/seoDescription/excerpt/shortDefinition) → kein Entity-/Snippet-Block.`);
  }
}

// ── Check B: E-E-A-T-Signale Autor + Datum (WARN) ─────────────────────────────
console.log('— Check B: E-E-A-T (Autor + Datum) (WARN) —');
for (const d of docs) {
  if (AUTHOR_TYPES.has(d.type) && !d.fm.author && !d.fm.authorSlug) warn(`${d.file}: kein \`author\` → E-E-A-T schwächer.`);
  if (d.type !== 'glossar' && !d.fm.publishedAt && !d.fm.date) warn(`${d.file}: kein \`publishedAt\` → fehlendes Datums-Signal.`);
}

// ── Check C: SEO-Description-Länge 50–170 Zeichen (WARN) ───────────────────────
console.log('— Check C: seoDescription-Länge 50–170 (WARN) —');
for (const d of docs) {
  const len = seoDescOf(d.fm).length;
  if (len && (len < 50 || len > 170)) warn(`${d.file}: seoDescription ${len} Zeichen (Ziel 50–170).`);
}

// ── Check D: interne Verlinkung (WARN, Domain-Effekt) ─────────────────────────
// Nur für Artikel-Typen; Lektionen (UI-Navigation) und Glossar ausgenommen.
console.log('— Check D: ≥1 ausgehender interner Link (WARN) —');
const INTERNAL = /\]\((?:https?:\/\/(?:www\.)?steakakademie\.de)?\/[a-z0-9][\w\-/]*\)/gi;
for (const d of docs) {
  if (!LINK_TYPES.has(d.type)) continue;
  if ((d.body.match(INTERNAL) || []).length === 0) {
    warn(`${d.file}: 0 ausgehende interne Links → nicht ins Cluster eingebunden.`);
  }
}

// ── Check E: Rezept-Schema-Pflichtfelder (WARN, strukturierte Daten) ──────────
console.log('— Check E: Rezept-Schema-Felder (WARN) —');
for (const d of docs) {
  if (d.type !== 'rezepte') continue;
  for (const key of ['cookTime', 'kategorie', 'image']) {
    if (!d.fm[key]) warn(`${d.file}: Rezept ohne \`${key}\` → Recipe-Schema unvollständig.`);
  }
}

// ── Report ────────────────────────────────────────────────────────────────────
const out = [];
out.push(`# 🔎 GEO-Check — ${files.length} Texte geprüft`, '');
out.push(`- **Harte Defekte:** ${fails.length}`);
out.push(`- **Warnungen (GEO-Backlog):** ${warns.length}`);
if (fails.length) { out.push('', '## ❌ Harte Defekte'); fails.forEach((m) => out.push(`- ${m}`)); }
if (warns.length) {
  out.push('', '## ⚠️ Warnungen (Optimierungspotenzial)');
  warns.slice(0, 80).forEach((m) => out.push(`- ${m}`));
  if (warns.length > 80) out.push(`- … und ${warns.length - 80} weitere (siehe Konsole).`);
}

console.log('\n' + out.join('\n'));
if (process.env.GITHUB_STEP_SUMMARY) {
  try { appendFileSync(process.env.GITHUB_STEP_SUMMARY, out.join('\n') + '\n'); } catch {}
}

console.log('');
if (fails.length) {
  console.error(`🔴 GEO-CHECK: ${fails.length} harte Defekt(e) — bitte beheben.`);
  process.exit(1);
}
console.log(`🟢 GEO-CHECK: keine harten Defekte (${warns.length} Optimierungs-Hinweise im Backlog).`);
