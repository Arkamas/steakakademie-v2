/**
 * Amazon PA-API v5 Image Fetcher
 * Holt Produktbilder für alle ASINs aus registry.yaml und speichert
 * ASIN → imageUrl Mapping in products/images.json
 *
 * Setup:
 *   AMAZON_ACCESS_KEY=<dein PA-API Access Key>
 *   AMAZON_SECRET_KEY=<dein PA-API Secret Key>
 *   AMAZON_PARTNER_TAG=steakakademie-21   (optional, aus .env)
 *
 * Usage:
 *   node scripts/fetch-pa-api-images.mjs
 *   node scripts/fetch-pa-api-images.mjs --force   # überschreibt bestehende Einträge
 *   node scripts/fetch-pa-api-images.mjs --dry-run # nur ASINs ausgeben
 */

import { createHmac, createHash } from 'crypto';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// ── Env ─────────────────────────────────────────────────────────────────────
const ACCESS_KEY = process.env.AMAZON_ACCESS_KEY;
const SECRET_KEY = process.env.AMAZON_SECRET_KEY;
const PARTNER_TAG = process.env.AMAZON_PARTNER_TAG || 'steakakademie-21';
const DRY_RUN = process.argv.includes('--dry-run');
const FORCE = process.argv.includes('--force');

// ── PA-API v5 Config (Germany) ───────────────────────────────────────────────
const HOST = 'webservices.amazon.de';
const REGION = 'eu-west-1';
const PATH = '/paapi5/getitems';
const SERVICE = 'ProductAdvertisingAPI';
const MARKETPLACE = 'www.amazon.de';

// ── Load Registry ────────────────────────────────────────────────────────────
function loadRegistry() {
  // Simple YAML parser for our specific format (array of objects with amazonAsin)
  const raw = readFileSync(join(ROOT, 'products', 'registry.yaml'), 'utf-8');
  const products = [];
  let current = null;

  for (const line of raw.split('\n')) {
    if (line.startsWith('- id:')) {
      if (current) products.push(current);
      current = { id: line.replace('- id:', '').trim().replace(/"/g, '') };
    } else if (current && line.match(/^\s+amazonAsin:/)) {
      const asin = line.replace(/\s+amazonAsin:\s*/, '').trim().replace(/"/g, '').replace(/^#.*/, '');
      if (asin && !asin.startsWith('#')) current.asin = asin;
    } else if (current && line.match(/^\s+name:/)) {
      current.name = line.replace(/\s+name:\s*/, '').trim().replace(/"/g, '');
    }
  }
  if (current) products.push(current);

  return products.filter(p => p.asin);
}

// ── Load existing image cache ────────────────────────────────────────────────
function loadCache() {
  const cachePath = join(ROOT, 'products', 'images.json');
  if (existsSync(cachePath)) {
    return JSON.parse(readFileSync(cachePath, 'utf-8'));
  }
  return {};
}

// ── AWS Signature V4 ─────────────────────────────────────────────────────────
function sign(key, msg) {
  return createHmac('sha256', key).update(msg).digest();
}

function getSigningKey(secret, date, region, service) {
  const kDate = sign('AWS4' + secret, date);
  const kRegion = sign(kDate, region);
  const kService = sign(kRegion, service);
  return sign(kService, 'aws4_request');
}

function sha256(data) {
  return createHash('sha256').update(data).digest('hex');
}

function buildAuthHeader(method, body, amzDate) {
  const date = amzDate.slice(0, 8);
  const contentType = 'application/json; charset=utf-8';
  const amzTarget = 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.GetItems';

  const canonicalHeaders = [
    `content-type:${contentType}`,
    `host:${HOST}`,
    `x-amz-date:${amzDate}`,
    `x-amz-target:${amzTarget}`,
  ].join('\n') + '\n';

  const signedHeaders = 'content-type;host;x-amz-date;x-amz-target';

  const canonicalRequest = [
    method,
    PATH,
    '',  // query string
    canonicalHeaders,
    signedHeaders,
    sha256(body),
  ].join('\n');

  const credentialScope = `${date}/${REGION}/${SERVICE}/aws4_request`;
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    credentialScope,
    sha256(canonicalRequest),
  ].join('\n');

  const signingKey = getSigningKey(SECRET_KEY, date, REGION, SERVICE);
  const signature = createHmac('sha256', signingKey).update(stringToSign).digest('hex');

  return {
    Authorization: `AWS4-HMAC-SHA256 Credential=${ACCESS_KEY}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`,
    'Content-Type': contentType,
    'X-Amz-Date': amzDate,
    'X-Amz-Target': amzTarget,
  };
}

// ── PA-API Call ───────────────────────────────────────────────────────────────
async function getItems(asins) {
  const body = JSON.stringify({
    PartnerTag: PARTNER_TAG,
    PartnerType: 'Associates',
    Marketplace: MARKETPLACE,
    ItemIds: asins,
    Resources: [
      'Images.Primary.Large',
      'Images.Primary.Medium',
    ],
  });

  const now = new Date().toISOString().replace(/[:-]/g, '').replace(/\.\d{3}/, '');
  const headers = buildAuthHeader('POST', body, now);

  const res = await fetch(`https://${HOST}${PATH}`, {
    method: 'POST',
    headers,
    body,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`PA-API error ${res.status}: ${err.substring(0, 200)}`);
  }

  return res.json();
}

// ── Chunk array ───────────────────────────────────────────────────────────────
function chunk(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size));
  return chunks;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const products = loadRegistry();
  console.log(`\n📦 Registry: ${products.length} Produkte mit ASIN`);

  if (DRY_RUN) {
    console.log('\nDRY RUN — ASINs die abgerufen würden:');
    for (const p of products) {
      console.log(`  ${p.asin}  →  ${p.name || p.id}`);
    }
    return;
  }

  if (!ACCESS_KEY || !SECRET_KEY) {
    console.error('\n❌ Fehler: AMAZON_ACCESS_KEY und AMAZON_SECRET_KEY müssen gesetzt sein.');
    console.error('\nSetup:');
    console.error('  1. PA-API Zugang beantragen: https://affiliate-program.amazon.de/');
    console.error('  2. In .env.local eintragen:');
    console.error('     AMAZON_ACCESS_KEY=...');
    console.error('     AMAZON_SECRET_KEY=...');
    console.error('  3. In Netlify unter Environment Variables eintragen');
    process.exit(1);
  }

  const cache = loadCache();

  // Filter ASINs die noch nicht im Cache sind (außer --force)
  const toFetch = FORCE
    ? products
    : products.filter(p => !cache[p.asin]);

  if (toFetch.length === 0) {
    console.log('\n✅ Alle ASINs bereits im Cache. --force zum Aktualisieren.');
    return;
  }

  console.log(`\n🔍 Fetching ${toFetch.length} ASINs (max 10 pro API-Call)...\n`);

  const batches = chunk(toFetch, 10);
  let success = 0;
  let errors = 0;

  for (const batch of batches) {
    const asins = batch.map(p => p.asin);
    process.stdout.write(`  [${asins.join(', ')}] ... `);

    try {
      const data = await getItems(asins);

      if (data.ItemsResult?.Items) {
        for (const item of data.ItemsResult.Items) {
          const asin = item.ASIN;
          const img = item.Images?.Primary?.Large?.URL || item.Images?.Primary?.Medium?.URL;
          if (img) {
            cache[asin] = img;
            success++;
            process.stdout.write(`✓`);
          } else {
            errors++;
            process.stdout.write(`⚠`);
          }
        }
      }

      // Fehler aus der API-Antwort
      if (data.Errors) {
        for (const err of data.Errors) {
          console.error(`\n  ⚠ ${err.Code}: ${err.Message}`);
          errors++;
        }
      }

      console.log('');

      // Rate limiting: 1 Req/Sekunde erlaubt (wir machen 1 pro Batch)
      if (batches.indexOf(batch) < batches.length - 1) {
        await new Promise(r => setTimeout(r, 1100));
      }

    } catch (err) {
      console.error(`\n  ❌ ${err.message}`);
      errors++;
    }
  }

  // Cache speichern
  const cachePath = join(ROOT, 'products', 'images.json');
  writeFileSync(cachePath, JSON.stringify(cache, null, 2) + '\n', 'utf-8');

  console.log(`\n✅ Fertig: ${success} Bilder gespeichert, ${errors} Fehler`);
  console.log(`📁 Cache: products/images.json (${Object.keys(cache).length} Einträge)`);
}

main().catch(err => { console.error(err); process.exit(1); });
