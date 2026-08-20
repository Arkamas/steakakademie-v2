/**
 * Affiliate Link Checker
 * Prüft alle affiliateUrl-Einträge aus registry.yaml auf Erreichbarkeit.
 *
 * Usage:
 *   node scripts/check-affiliate-links.mjs
 *   node scripts/check-affiliate-links.mjs --fast     # kein Sleep, nur HEAD-Requests
 *   node scripts/check-affiliate-links.mjs --json     # Output als JSON (für CI)
 *
 * Exit code: 0 = alle OK, 1 = mindestens ein Fehler
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const FAST    = process.argv.includes('--fast');
const AS_JSON = process.argv.includes('--json');
const TIMEOUT_MS = 8000;

// ── Minimal YAML Parser ─────────────────────────────────────────────────────
function loadRegistry() {
  const raw = readFileSync(join(ROOT, 'products', 'registry.yaml'), 'utf-8');
  const products = [];
  let current = null;

  for (const line of raw.split('\n')) {
    if (line.startsWith('- id:')) {
      if (current) products.push(current);
      current = {
        id:   line.replace('- id:', '').trim().replace(/"/g, ''),
        url:  null,
        name: null,
      };
    } else if (current && /^\s+affiliateUrl:/.test(line)) {
      const val = line.replace(/\s+affiliateUrl:\s*/, '').trim().replace(/"/g, '');
      // Kommentare ignorieren
      if (!val.startsWith('#')) current.url = val;
    } else if (current && /^\s+name:/.test(line)) {
      current.name = line.replace(/\s+name:\s*/, '').trim().replace(/"/g, '');
    }
  }
  if (current) products.push(current);
  return products.filter(p => p.url);
}

// ── HTTP Check ─────────────────────────────────────────────────────────────
// Amazon-Suchlink-Erkennung (Fix 03.07.2026, KAN-59):
// Für Produkte ohne eigene ASIN/Herstellerseite nutzen wir bewusst generische
// amazon.de/s?k=... Suchlinks statt toter /dp/-Deep-Links (siehe memory.md,
// 25.06.). Amazon blockt automatisierte Requests (Bot-/WAF-Schutz, v.a. von
// GitHub-Actions-IPs) auf Suchseiten fast immer mit HTTP 503 — unabhängig
// davon, ob der Link für echte Nutzer im Browser funktioniert. Das erzeugte
// jede Woche einen falschen P0-Alarm (KAN-59: "22 defekte Links", alles
// amazon.de/s?-Suchlinks mit 503). Diese Links lassen sich durch einen
// simplen HTTP-Check technisch nicht sauber verifizieren — wir markieren sie
// bei 503 daher explizit als "unverifizierbar" statt als Fehler.
function isAmazonSearchUrl(url) {
  return /amazon\.[a-z.]+\/s\?/i.test(url);
}

async function checkUrl(url) {
  // Placeholder direkt ablehnen
  if (url.includes('PLACEHOLDER')) {
    return { ok: false, status: 0, reason: 'PLACEHOLDER in URL' };
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const res = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': 'Steakakademie-LinkChecker/1.0 (+https://steakakademie.de)',
      },
    });
    clearTimeout(timer);

    if (res.status === 503 && isAmazonSearchUrl(url)) {
      return {
        ok: true, status: 503, warn: true,
        reason: 'Amazon Bot-Block vermutet (503) — Suchlink, für echte Nutzer im Browser i.d.R. erreichbar, technisch nicht verifizierbar',
      };
    }

    if (res.status === 405) {
      // HEAD nicht erlaubt → GET versuchen
      const res2 = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
        redirect: 'follow',
        headers: { 'User-Agent': 'Steakakademie-LinkChecker/1.0' },
      });
      if (res2.status === 503 && isAmazonSearchUrl(url)) {
        return {
          ok: true, status: 503, warn: true,
          reason: 'Amazon Bot-Block vermutet (503) — Suchlink, für echte Nutzer im Browser i.d.R. erreichbar, technisch nicht verifizierbar',
        };
      }
      return { ok: res2.ok, status: res2.status, reason: res2.ok ? 'OK (GET)' : `HTTP ${res2.status}` };
    }

    return { ok: res.ok, status: res.status, reason: res.ok ? 'OK' : `HTTP ${res.status}` };
  } catch (err) {
    if (err.name === 'AbortError') {
      return { ok: false, status: 0, reason: `Timeout nach ${TIMEOUT_MS}ms` };
    }
    return { ok: false, status: 0, reason: err.message };
  }
}

// ── Main ───────────────────────────────────────────────────────────────────
/**
 * KAN-71: Wachhund gegen den Rueckfall zu Amazon-gehosteten Bildern.
 *
 * Am 20.08.2026 wurden die drei Amazon-Hosts aus next.config.mjs gestrichen und
 * scripts/fetch-pa-api-images.mjs entfernt. Grund war doppelt: Von Amazon
 * geladene Bilder schicken die Besucher-IP ohne Einwilligung dorthin
 * (Art. 6 DSGVO / TDDDG), und ein lokaler Spiegel waere lizenzrechtlich nicht
 * gedeckt — das PartnerNet liefert Produktbilder ueber die API mit kurzen
 * Cache-Fristen aus.
 *
 * Beides laesst sich unbemerkt rueckgaengig machen: ein remotePattern
 * hinzufuegen, ein Skript wieder einspielen, images.json befuellen. Deshalb
 * sieht der woechentliche Lauf an beiden Stellen nach und meldet einen Fund.
 * Er bricht NICHT ab — ein Fund kann legitim sein, wenn Lizenz und
 * Einwilligung geklaert sind. Auffallen soll er trotzdem.
 */
function pruefeAmazonBildpfade() {
  const funde = [];

  const config = join(ROOT, 'next.config.mjs');
  if (existsSync(config)) {
    for (const [nr, zeile] of readFileSync(config, 'utf8').split(/\r?\n/).entries()) {
      // Kommentare zaehlen nicht — die erklaeren ja gerade, warum es fehlt.
      const ohneKommentar = zeile.replace(/\/\/.*$/, '').replace(/\/\*.*?\*\//g, '');
      if (/amazon/i.test(ohneKommentar)) funde.push(`next.config.mjs:${nr + 1} → ${zeile.trim()}`);
    }
  }

  const cache = join(ROOT, 'products', 'images.json');
  if (existsSync(cache)) {
    const roh = readFileSync(cache, 'utf8');
    if (/amazon/i.test(roh)) {
      let anzahl = '?';
      try {
        anzahl = String(Object.keys(JSON.parse(roh)).filter(k => !k.startsWith('_')).length);
      } catch { /* kaputtes JSON ist selbst ein Fund */ }
      funde.push(`products/images.json enthaelt Amazon-URLs (${anzahl} Eintraege)`);
    }
  }

  if (funde.length && !AS_JSON) {
    console.log('\n⚠️  KAN-71 — Amazon-Bildpfade wieder aktiv:\n');
    for (const f of funde) console.log(`  • ${f}`);
    console.log('\n  Vor der Nutzung klaeren: PartnerNet-Lizenz fuer die Auslieferung UND');
    console.log('  Einwilligungsschranke, sonst geht die Besucher-IP ohne Einwilligung an Amazon.\n');
  }
  return funde;
}

async function main() {
  const amazonFunde = pruefeAmazonBildpfade();

  const products = loadRegistry();
  const results  = [];

  if (!AS_JSON) {
    console.log(`\n🔗 Affiliate Link Checker — ${products.length} URLs\n`);
  }

  for (const p of products) {
    const result = await checkUrl(p.url);
    results.push({ id: p.id, name: p.name, url: p.url, ...result });

    if (!AS_JSON) {
      const icon = result.ok ? '✅' : '❌';
      const label = result.ok ? result.reason : `${result.reason}`;
      console.log(`${icon} [${p.id}] ${label}`);
      if (!result.ok) {
        console.log(`   URL: ${p.url}`);
      }
    }

    if (!FAST && !result.ok) {
      // Kurze Pause nach Fehlern um Rate-Limits zu vermeiden
      await new Promise(r => setTimeout(r, 500));
    }
  }

  const errors = results.filter(r => !r.ok);
  const ok     = results.filter(r => r.ok);

  if (AS_JSON) {
    console.log(JSON.stringify({ total: results.length, ok: ok.length, errors: errors.length, amazonFunde, results }, null, 2));
    process.exit(errors.length > 0 ? 1 : 0);
  }

  console.log(`\n────────────────────────────────`);
  console.log(`✅ OK:      ${ok.length}`);
  console.log(`❌ Fehler:  ${errors.length}`);
  console.log(`📊 Gesamt:  ${results.length}`);

  if (errors.length > 0) {
    console.log(`\n⚠️  Fehlerhafte Links:\n`);
    for (const e of errors) {
      console.log(`  • ${e.id} (${e.name})`);
      console.log(`    Grund:  ${e.reason}`);
      console.log(`    URL:    ${e.url}\n`);
    }
    process.exit(1);
  } else {
    console.log(`\n🎉 Alle Links erreichbar.\n`);
    process.exit(0);
  }
}

main().catch(err => { console.error(err); process.exit(1); });
