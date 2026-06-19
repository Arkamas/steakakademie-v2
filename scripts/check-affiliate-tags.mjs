/**
 * Affiliate-Tag-Guard
 *
 * Stellt sicher, dass JEDER Amazon-Affiliate-Link in products/registry.yaml den
 * aktiven Partner-Tag `tag=steakakademie-21` trägt. Ein fehlender Tag bedeutet:
 * Klick generiert KEINE Provision — stiller Umsatzverlust. Dieser Guard fängt das
 * vor dem Deploy ab.
 *
 * Geprüft werden nur Produkte mit `provider: amazon`. Nicht-Amazon-Links
 * (otto.de, beefer.de, dry-ager.com, otto-gourmet.de …) sind ausgenommen.
 *
 * Usage:
 *   node scripts/check-affiliate-tags.mjs
 *
 * Exit code: 0 = alle Amazon-Links korrekt getaggt, 1 = mindestens ein Verstoß
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// Single Source of Truth — identisch zu AMAZON_TAG in src/lib/cut-affiliate.ts
const AMAZON_TAG = 'steakakademie-21';
const REQUIRED = `tag=${AMAZON_TAG}`;

function loadRegistry() {
  const raw = readFileSync(join(ROOT, 'products', 'registry.yaml'), 'utf-8');
  const parsed = yaml.load(raw);
  if (!Array.isArray(parsed)) {
    console.error('FEHLER: products/registry.yaml ergibt keine Produkt-Liste.');
    process.exit(1);
  }
  return parsed;
}

function main() {
  const products = loadRegistry();
  const amazonProducts = products.filter((p) => p && p.provider === 'amazon');

  const offenders = [];
  for (const p of amazonProducts) {
    const url = typeof p.affiliateUrl === 'string' ? p.affiliateUrl : '';
    if (!url.includes(REQUIRED)) {
      offenders.push({ id: p.id ?? '(ohne id)', url: url || '(keine affiliateUrl)' });
    }
  }

  if (offenders.length > 0) {
    console.error(
      `\n✖ Affiliate-Tag-Guard FEHLGESCHLAGEN: ${offenders.length} Amazon-Link(s) ohne "${REQUIRED}":\n`
    );
    for (const o of offenders) {
      console.error(`  • ${o.id}\n      ${o.url}`);
    }
    console.error(
      `\nJeder provider:amazon-Link muss "${REQUIRED}" enthalten, sonst entgeht uns die Provision.\n`
    );
    process.exit(1);
  }

  console.log(
    `✓ Affiliate-Tag-Guard OK — alle ${amazonProducts.length} Amazon-Links tragen "${REQUIRED}".`
  );
  process.exit(0);
}

main();
