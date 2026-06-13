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

// Browser-ähnlicher User-Agent: viele Shops (v.a. Amazon) blocken Bot-UAs.
const BROWSER_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

// Anti-Bot-/Transient-Codes: KEIN toter Link, sondern der Shop blockt den
// CI-Runner (Datacenter-IP). Diese gelten als "blockiert/unbekannt" und lassen
// den Build NICHT rot werden — echte tote Links (404/410/Timeout) tun das weiter.
const BLOCKED_STATUS = new Set([403, 429, 503]);

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
async function checkUrl(url) {
  // Placeholder direkt ablehnen
  if (url.includes('PLACEHOLDER')) {
    return { ok: false, status: 0, reason: 'PLACEHOLDER in URL' };
  }

  const classify = (status, method) => {
    if (status >= 200 && status < 400) {
      return { ok: true, status, reason: method === 'GET' ? 'OK (GET)' : 'OK' };
    }
    if (BLOCKED_STATUS.has(status)) {
      // Anti-Bot-Block: nicht als toter Link werten.
      return { ok: false, blocked: true, status, reason: `Blockiert (HTTP ${status})` };
    }
    return { ok: false, status, reason: `HTTP ${status}` };
  };

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const res = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      redirect: 'follow',
      headers: { 'User-Agent': BROWSER_UA },
    });

    // HEAD oft nicht erlaubt/geblockt (405/403/501) → GET versuchen, bevor wir urteilen.
    if (res.status === 405 || res.status === 403 || res.status === 501) {
      const res2 = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
        redirect: 'follow',
        headers: { 'User-Agent': BROWSER_UA, Accept: 'text/html,application/xhtml+xml' },
      });
      clearTimeout(timer);
      return classify(res2.status, 'GET');
    }

    clearTimeout(timer);
    return classify(res.status, 'HEAD');
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

    if (!AS_JSON) {
      const icon = result.ok ? '✅' : result.blocked ? '⚠️' : '❌';
      console.log(`${icon} [${p.id}] ${result.reason}`);
      if (!result.ok) {
        console.log(`   URL: ${p.url}`);
      }
    }

    if (!FAST && !result.ok) {
      // Kurze Pause nach Fehlern um Rate-Limits zu vermeiden
      await new Promise(r => setTimeout(r, 500));
    }
  }

  const errors  = results.filter(r => !r.ok && !r.blocked);
  const blocked = results.filter(r => r.blocked);
  const ok      = results.filter(r => r.ok);

  if (AS_JSON) {
    console.log(JSON.stringify(
      { total: results.length, ok: ok.length, errors: errors.length, blocked: blocked.length, results },
      null, 2,
    ));
    process.exit(errors.length > 0 ? 1 : 0);
  }

  console.log(`\n────────────────────────────────`);
  console.log(`✅ OK:         ${ok.length}`);
  console.log(`⚠️  Blockiert:  ${blocked.length}`);
  console.log(`❌ Fehler:     ${errors.length}`);
  console.log(`📊 Gesamt:     ${results.length}`);

  if (blocked.length > 0) {
    console.log(`\nℹ️  Blockierte Links (Anti-Bot, kein toter Link — nicht als Fehler gewertet):\n`);
    for (const b of blocked) {
      console.log(`  • ${b.id} (${b.name}) — ${b.reason}`);
    }
  }

  if (errors.length > 0) {
    console.log(`\n⚠️  Fehlerhafte Links:\n`);
    for (const e of errors) {
      console.log(`  • ${e.id} (${e.name})`);
      console.log(`    Grund:  ${e.reason}`);
      console.log(`    URL:    ${e.url}\n`);
    }
    process.exit(1);
  } else {
    console.log(`\n🎉 Keine toten Links.\n`);
    process.exit(0);
  }
}

main().catch(err => { console.error(err); process.exit(1); });
