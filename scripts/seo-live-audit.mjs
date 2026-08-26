#!/usr/bin/env node
// ---------------------------------------------------------------------------
// seo-live-audit.mjs — Live-Audit der ausgelieferten Seiten (nicht des Quellcodes)
//
//   node scripts/seo-live-audit.mjs                 # Stichprobe aus der Sitemap
//   node scripts/seo-live-audit.mjs --all           # jede URL der Sitemap
//   node scripts/seo-live-audit.mjs --limit 80
//   node scripts/seo-live-audit.mjs --base https://steakakademie.de
//   node scripts/seo-live-audit.mjs --json          # Maschinen-Ausgabe
//
// Prueft je Seite: Statuscode, <title>-Laenge, Meta-Description-Laenge,
// Canonical (fehlend/fremd), robots-noindex, genau eine H1, Bilder ohne alt,
// Anzahl JSON-LD-Bloecke. Meldet ausserdem Titel-/Description-Duplikate.
//
// Bewusst ohne Abhaengigkeiten (Node >= 18, globales fetch).
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const flag = (n, d = null) => { const i = args.indexOf(n); return i >= 0 ? (args[i + 1] ?? true) : d; };
const BASE = String(flag('--base', 'https://steakakademie.de')).replace(/\/$/, '');
const ALL = args.includes('--all');
const JSON_OUT = args.includes('--json');
const LIMIT = Number(flag('--limit', ALL ? Infinity : 40));
const CONCURRENCY = Number(flag('--concurrency', 6));
const UA = 'SteakakademieSEOAudit/1.0 (+https://steakakademie.de)';

const TITLE_MIN = 30, TITLE_MAX = 60;
const DESC_MIN = 70, DESC_MAX = 160;

const text = (s) => s.replace(/\s+/g, ' ').trim();
const attr = (tag, name) => {
  const m = tag.match(new RegExp(`${name}\\s*=\\s*("([^"]*)"|'([^']*)')`, 'i'));
  return m ? (m[2] ?? m[3]) : null;
};

async function sitemapUrls() {
  const res = await fetch(`${BASE}/sitemap.xml`, { headers: { 'user-agent': UA } });
  let body = await res.text();
  const children = [...body.matchAll(/<sitemap>[\s\S]*?<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  if (children.length) {
    const parts = await Promise.all(children.map((u) =>
      fetch(u, { headers: { 'user-agent': UA } }).then((r) => r.text())));
    body = parts.join('\n');
  }
  return [...new Set([...body.matchAll(/<url>[\s\S]*?<loc>([^<]+)<\/loc>/g)].map((m) => m[1]))];
}

/** Gleichmaessige Stichprobe ueber die ganze Liste statt der ersten N. */
function sample(list, n) {
  if (list.length <= n) return list;
  const step = list.length / n;
  return Array.from({ length: n }, (_, i) => list[Math.floor(i * step)]);
}

async function auditOne(url) {
  const out = { url, status: 0, findings: [] };
  let html = '';
  try {
    const res = await fetch(url, { headers: { 'user-agent': UA }, redirect: 'follow' });
    out.status = res.status;
    out.finalUrl = res.url;
    if (res.url !== url) out.findings.push(`Umleitung -> ${res.url}`);
    if (!res.ok) { out.findings.push(`Status ${res.status}`); return out; }
    html = await res.text();
  } catch (e) {
    out.findings.push(`Nicht erreichbar: ${e.message}`);
    return out;
  }

  const head = html.slice(0, html.search(/<\/head>/i) + 7 || 200000);

  const title = text((head.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? ''));
  out.title = title;
  if (!title) out.findings.push('kein <title>');
  else if (title.length < TITLE_MIN) out.findings.push(`Title kurz (${title.length} Z.)`);
  else if (title.length > TITLE_MAX) out.findings.push(`Title lang (${title.length} Z.)`);

  const descTag = head.match(/<meta[^>]+name\s*=\s*["']description["'][^>]*>/i)?.[0];
  const desc = descTag ? text(attr(descTag, 'content') ?? '') : '';
  out.description = desc;
  if (!desc) out.findings.push('keine Meta-Description');
  else if (desc.length < DESC_MIN) out.findings.push(`Description kurz (${desc.length} Z.)`);
  else if (desc.length > DESC_MAX) out.findings.push(`Description lang (${desc.length} Z.)`);

  const canTag = head.match(/<link[^>]+rel\s*=\s*["']canonical["'][^>]*>/i)?.[0];
  const canonical = canTag ? attr(canTag, 'href') : null;
  out.canonical = canonical;
  if (!canonical) out.findings.push('kein Canonical');
  else if (!canonical.startsWith(BASE)) out.findings.push(`Canonical zeigt woanders hin: ${canonical}`);

  const robotsTag = head.match(/<meta[^>]+name\s*=\s*["']robots["'][^>]*>/i)?.[0];
  const robots = robotsTag ? (attr(robotsTag, 'content') ?? '') : '';
  out.robots = robots;
  if (/noindex/i.test(robots)) out.findings.push('noindex gesetzt');

  const h1 = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map((m) => text(m[1].replace(/<[^>]+>/g, '')));
  out.h1 = h1;
  if (h1.length === 0) out.findings.push('keine H1');
  else if (h1.length > 1) out.findings.push(`${h1.length} H1 (soll: genau 1)`);

  const imgs = [...html.matchAll(/<img\b[^>]*>/gi)].map((m) => m[0]);
  const noAlt = imgs.filter((t) => { const a = attr(t, 'alt'); return a === null || a.trim() === ''; });
  out.images = imgs.length;
  out.imagesWithoutAlt = noAlt.length;
  if (noAlt.length) out.findings.push(`${noAlt.length}/${imgs.length} Bilder ohne alt-Text`);

  out.jsonLd = (html.match(/application\/ld\+json/gi) ?? []).length;
  if (out.jsonLd === 0) out.findings.push('kein JSON-LD');

  return out;
}

async function pool(items, worker, size) {
  const results = new Array(items.length);
  let i = 0;
  await Promise.all(Array.from({ length: Math.min(size, items.length) }, async () => {
    while (i < items.length) { const k = i++; results[k] = await worker(items[k], k); }
  }));
  return results;
}

const urls = sample(await sitemapUrls(), LIMIT);
if (!JSON_OUT) console.log(`Pruefe ${urls.length} Seiten auf ${BASE} …\n`);
const results = await pool(urls, auditOne, CONCURRENCY);

// Duplikate ueber die geprueften Seiten hinweg
const dup = (key) => {
  const map = new Map();
  for (const r of results) { const v = r[key]; if (!v) continue; map.set(v, [...(map.get(v) ?? []), r.url]); }
  return [...map.entries()].filter(([, u]) => u.length > 1);
};
const dupTitles = dup('title');
const dupDescs = dup('description');

if (JSON_OUT) {
  console.log(JSON.stringify({ base: BASE, checked: results.length, results, dupTitles, dupDescs }, null, 2));
} else {
  const withFindings = results.filter((r) => r.findings.length);
  for (const r of withFindings) {
    console.log(`\n${r.url}`);
    for (const f of r.findings) console.log(`  · ${f}`);
  }
  const tally = new Map();
  for (const r of results) for (const f of r.findings) {
    const k = f.replace(/\d+/g, 'N').replace(/:.*/, '');
    tally.set(k, (tally.get(k) ?? 0) + 1);
  }
  console.log('\n' + '='.repeat(58));
  console.log(`Geprueft: ${results.length} · mit Befund: ${withFindings.length}`);
  for (const [k, n] of [...tally.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${String(n).padStart(4)}x  ${k}`);
  }
  if (dupTitles.length) {
    console.log(`\nDoppelte Titles: ${dupTitles.length}`);
    for (const [t, u] of dupTitles.slice(0, 10)) console.log(`  "${t.slice(0, 60)}" -> ${u.length} Seiten`);
  }
  if (dupDescs.length) {
    console.log(`\nDoppelte Descriptions: ${dupDescs.length}`);
    for (const [, u] of dupDescs.slice(0, 10)) console.log(`  ${u.length} Seiten: ${u[0]}`);
  }
  console.log('='.repeat(58));
}
