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

import { readFileSync } from 'fs';
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
async function main() {
  const products = loadRegistry();
  const results  = [];

  if (!AS_JSON) {
    console.log(`\n🔗 Affiliate Link Checker — ${products.length} URLs\n`);
  }

  for (const p of products) {
    const result = await checkUrl(p.url);
    results.push({ id: p.id, name: p.name, url: p.url, ...result });

   