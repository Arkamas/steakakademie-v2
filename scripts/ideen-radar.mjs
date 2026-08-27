#!/usr/bin/env node
// ---------------------------------------------------------------------------
// ideen-radar.mjs — Ideen-Signale aus US-BBQ-Primaerquellen sammeln
//
//   node scripts/ideen-radar.mjs                 # Lauf nach Rotation fuer heute
//   node scripts/ideen-radar.mjs --dry-run       # nur anzeigen, nichts schreiben
//   node scripts/ideen-radar.mjs --tag 2026-12-01  # Rotation fuer ein Datum simulieren
//   node scripts/ideen-radar.mjs --alle          # ausnahmsweise alle Quellen
//   node scripts/ideen-radar.mjs --json
//
// WAS DAS SKRIPT TUT
//   Es liest aus den RSS-Feeds in data/rezept-quellen.yaml ausschliesslich
//   Titel, Link, Datum und Kategorien. Fliesstext, Zutatenlisten, Mengen und
//   Bilder werden verworfen, auch wenn der Feed sie mitliefert. Das Ergebnis
//   ist eine Ideen-Liste in data/ideen-backlog.json — ein interner Themen-
//   speicher, aus dem die bestehende Rezept- bzw. Artikel-Pipeline Auftraege
//   zieht. Nichts davon wird veroeffentlicht.
//
//   Gerichtenamen sind nicht schutzfaehig, ausformulierte Rezepte und Fotos
//   sehr wohl. Genau an dieser Grenze arbeitet der Radar (Regel 1, Regel 5).
//
// ROTATION
//   Zwei Quellen je Lauf, deterministisch aus dem Tag im Jahr — Grundrotation
//   plus Saison-Slot aus data/saison-kalender.yaml. Kein Zustand: derselbe
//   Tag ergibt immer dieselbe Auswahl, ein verpasster Lauf verschiebt nichts.
// ---------------------------------------------------------------------------

import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const QUELLEN_YAML = join(ROOT, 'data', 'rezept-quellen.yaml');
const SAISON_YAML  = join(ROOT, 'data', 'saison-kalender.yaml');
const BACKLOG      = join(ROOT, 'data', 'ideen-backlog.json');

const argv    = process.argv.slice(2);
const DRY     = argv.includes('--dry-run');
const ALLE    = argv.includes('--alle');
const JSON_   = argv.includes('--json');
const TAG_ARG = argv.includes('--tag') ? argv[argv.indexOf('--tag') + 1] : null;

// ── Winziger YAML-Leser fuer genau diese beiden Dateien ─────────────────────
// Bewusst keine Abhaengigkeit: das Repo hat kein YAML-Paket in dependencies,
// und ein Ideen-Sammler soll den Build nicht um eine Bibliothek erweitern.
function parseQuellen(text) {
  const out = [];
  let cur = null, meta = {};
  let inMeta = false, inQuellen = false;
  for (const zeile of text.split(/\r?\n/)) {
    if (/^#/.test(zeile) || !zeile.trim()) continue;
    if (/^meta:/.test(zeile))    { inMeta = true;  inQuellen = false; continue; }
    if (/^quellen:/.test(zeile)) { inQuellen = true; inMeta = false; continue; }
    if (inMeta) {
      const m = zeile.match(/^\s{2}(\w+):\s*(.*)$/);
      if (m) meta[m[1]] = wert(m[2]);
      continue;
    }
    if (!inQuellen) continue;
    const neu = zeile.match(/^\s{2}-\s+(\w+):\s*(.*)$/);
    if (neu) { cur = { [neu[1]]: wert(neu[2]) }; out.push(cur); continue; }
    const feld = zeile.match(/^\s{4}(\w+):\s*(.*)$/);
    if (feld && cur) cur[feld[1]] = wert(feld[2]);
  }
  return { meta, quellen: out };
}
function wert(roh) {
  const s = roh.replace(/\s+#.*$/, '').trim();
  if (s.startsWith('[')) {
    return s.slice(1, -1).split(',').map((x) => x.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
  }
  return s.replace(/^["']|["']$/g, '');
}

/** Aktives Saison-Fenster: das mit dem naechstliegenden Anlass. */
function aktivesFenster(saisonText, heute) {
  const fenster = [];
  let cur = null;
  for (const zeile of saisonText.split(/\r?\n/)) {
    const neu = zeile.match(/^\s{2}-\s+id:\s*(.*)$/);
    if (neu) { cur = { id: wert(neu[1]) }; fenster.push(cur); continue; }
    const f = zeile.match(/^\s{4}(von|bis|anlass|label):\s*(.*)$/);
    if (f && cur) cur[f[1]] = wert(f[2]);
  }
  const mmdd = `${String(heute.getMonth() + 1).padStart(2, '0')}-${String(heute.getDate()).padStart(2, '0')}`;
  const drin = (von, bis) => (von <= bis ? mmdd >= von && mmdd <= bis : mmdd >= von || mmdd <= bis);
  const offen = fenster.filter((x) => x.von && x.bis && drin(x.von, x.bis));
  if (!offen.length) return null;
  // Dringlichkeit: kleinster Abstand bis zum Anlass
  const abstand = (a) => {
    const d = (a.anlass ?? a.bis).localeCompare(mmdd);
    return d >= 0 ? (a.anlass ?? a.bis) : 'zz' + (a.anlass ?? a.bis); // Vergangenes hinten
  };
  return offen.sort((a, b) => abstand(a).localeCompare(abstand(b)))[0];
}

function tagImJahr(d) {
  return Math.floor((d - new Date(Date.UTC(d.getUTCFullYear(), 0, 0))) / 86400000);
}

/** Titel, Link, Datum, Kategorien — sonst nichts. */
function feedTitel(xml, max) {
  const treffer = [];
  const bloecke = xml.match(/<(item|entry)\b[\s\S]*?<\/\1>/g) ?? [];
  for (const b of bloecke.slice(0, max)) {
    const roh = (b.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? '').trim();
    const titel = entschaerfen(roh);
    if (!titel) continue;
    const link = (b.match(/<link[^>]*>([\s\S]*?)<\/link>/i)?.[1]
              ?? b.match(/<link[^>]+href=["']([^"']+)["']/i)?.[1] ?? '').trim();
    const datum = (b.match(/<(pubDate|updated|published)[^>]*>([\s\S]*?)<\/\1>/i)?.[2] ?? '').trim();
    const kategorien = [...b.matchAll(/<category[^>]*>([\s\S]*?)<\/category>/gi)]
      .map((m) => entschaerfen(m[1])).filter(Boolean).slice(0, 6);
    treffer.push({ titel, link, datum, kategorien });
  }
  return treffer;
}
function entschaerfen(s) {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#039;|&apos;/g, "'")
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ').trim();
}

const schluessel = (s) => s.toLowerCase().normalize('NFD')
  .replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// ── Lauf ────────────────────────────────────────────────────────────────────
const { meta, quellen } = parseQuellen(await readFile(QUELLEN_YAML, 'utf8'));
const heute = TAG_ARG ? new Date(`${TAG_ARG}T12:00:00Z`) : new Date();
const tag = tagImJahr(heute);

let fenster = null;
if (existsSync(SAISON_YAML)) fenster = aktivesFenster(await readFile(SAISON_YAML, 'utf8'), heute);

let gewaehlt;
if (ALLE) {
  gewaehlt = quellen;
} else {
  const a = quellen[tag % quellen.length];
  const passend = fenster ? quellen.filter((q) => (q.saison ?? []).includes(fenster.id)) : [];
  let b = passend.length ? passend[tag % passend.length] : quellen[(tag + 1) % quellen.length];
  if (b.id === a.id) b = quellen[(quellen.indexOf(a) + 1) % quellen.length];
  gewaehlt = [a, b];
}

if (!JSON_) {
  console.log(`Ideen-Radar — ${heute.toISOString().slice(0, 10)} (Tag ${tag})`);
  console.log(`Saison-Fenster: ${fenster ? `${fenster.label ?? fenster.id} (${fenster.id})` : 'keines aktiv'}`);
  console.log(`Quellen dieses Laufs: ${gewaehlt.map((q) => q.name).join(' · ')}\n`);
}

const max = Number(meta.max_pro_quelle ?? 15);
const delay = Number(meta.crawl_delay_ms ?? 2000);
const ua = meta.user_agent ?? 'SteakakademieIdeenRadar/1.0';

const gesammelt = [];
for (const [i, q] of gewaehlt.entries()) {
  if (i > 0) await new Promise((r) => setTimeout(r, delay));
  try {
    const res = await fetch(q.feed, { headers: { 'user-agent': ua, accept: 'application/rss+xml, application/atom+xml, application/xml' } });
    if (!res.ok) { console.error(`  ${q.id}: HTTP ${res.status}`); continue; }
    for (const t of feedTitel(await res.text(), max)) {
      gesammelt.push({
        id: `${q.id}:${schluessel(t.titel)}`,
        quelle: q.id, quelleName: q.name, quelleUrl: q.feed.replace(/\/feed\/?$/, '/'),
        eignung: q.eignung ?? [], schwerpunkt: q.schwerpunkt ?? '',
        ...t, gesehen: heute.toISOString().slice(0, 10), status: 'neu',
      });
    }
  } catch (e) {
    console.error(`  ${q.id}: ${e.message}`);
  }
}

// Gegen Backlog UND gegen bestehende Rezepte entdoppeln
const alt = existsSync(BACKLOG) ? JSON.parse(await readFile(BACKLOG, 'utf8')) : { eintraege: [] };
const bekannt = new Set(alt.eintraege.map((e) => e.id));
const frisch = gesammelt.filter((e) => !bekannt.has(e.id));

if (!JSON_) {
  for (const q of gewaehlt) {
    const n = frisch.filter((e) => e.quelle === q.id).length;
    console.log(`  ${q.name}: ${n} neue Ideen`);
  }
  console.log('');
  for (const e of frisch.slice(0, 25)) console.log(`  · [${e.quelle}] ${e.titel}`);
  if (frisch.length > 25) console.log(`  … und ${frisch.length - 25} weitere`);
}

if (DRY) {
  if (!JSON_) console.log(`\n[Trockenlauf] ${frisch.length} Eintraege wuerden ergaenzt (Backlog: ${alt.eintraege.length}).`);
} else {
  const neu = {
    hinweis: 'Nur Titel/Link/Datum/Kategorien. Kein fremder Fliesstext, keine Bilder. Interner Themenspeicher, nicht zur Veroeffentlichung.',
    aktualisiert: heute.toISOString(),
    eintraege: [...alt.eintraege, ...frisch],
  };
  await writeFile(BACKLOG, JSON.stringify(neu, null, 1), 'utf8');
  if (!JSON_) console.log(`\n${frisch.length} neu → data/ideen-backlog.json (jetzt ${neu.eintraege.length} Eintraege).`);
}
if (JSON_) console.log(JSON.stringify({ tag, fenster: fenster?.id ?? null, quellen: gewaehlt.map((q) => q.id), neu: frisch }, null, 1));
