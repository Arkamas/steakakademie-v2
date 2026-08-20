#!/usr/bin/env node
/**
 * Legal-Guard — statischer Regressions-Check gegen typische Abmahn-Gründe.
 *
 * Verankert die maschinell prüfbaren Punkte des Abmahn-Checks (13.06.2026) als
 * CI-Gate, damit niemand sie versehentlich wieder einbaut. Begründung/Quelle je
 * Regel: compliance/website-rechtscheck.yaml.
 *
 * Prüft NUR Text-Dateien (keine Binär-/Bild-Dateien → keine Fehl-Treffer).
 * Scannt bewusst NICHT compliance/ und docs/ (dort stehen die Regeln als Text).
 *
 * Exit 0 = sauber · Exit 1 = mindestens ein Verstoß.
 * Keine externen Dependencies.
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname, dirname, relative, sep } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const SKIP_DIRS = new Set(['node_modules', '.next', '.git', 'out', 'dist']);

function walk(dir, exts, acc = []) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return acc;
  }
  for (const e of entries) {
    const p = join(dir, e);
    let st;
    try {
      st = statSync(p);
    } catch {
      continue;
    }
    if (st.isDirectory()) {
      if (!SKIP_DIRS.has(e)) walk(p, exts, acc);
    } else if (exts.includes(extname(p))) {
      acc.push(p);
    }
  }
  return acc;
}

const rel = (p) => relative(ROOT, p);

const CODE_EXTS = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.css'];
const WEB_EXTS = ['.html', '.js', '.css'];
const CONTENT_EXTS = ['.md', '.mdx'];

const srcFiles = walk(join(ROOT, 'src'), CODE_EXTS);
const publicFiles = walk(join(ROOT, 'public'), WEB_EXTS);
const contentFiles = walk(join(ROOT, 'content'), CONTENT_EXTS);
const affiliateFiles = walk(join(ROOT, 'src', 'components', 'affiliate'), ['.tsx']);

const violations = [];
const add = (rule, file, detail) => violations.push({ rule, file: rel(file), detail });

// ── 1) Toter EU-OS-Plattform-Link ────────────────────────────────────────────
// Die EU-Plattform zur Online-Streitbeilegung wurde zum 20.07.2025 eingestellt.
// Ein verbleibender Link ist selbst ein Abmahnrisiko (Quelle: impressum-ddg).
for (const f of [...srcFiles, ...contentFiles]) {
  if (/consumers\/odr/.test(readFileSync(f, 'utf8'))) {
    add('OS-Plattform-Link', f, 'Verweis auf die eingestellte EU-OS-Plattform (ec.europa.eu/consumers/odr) entfernen');
  }
}

// ── 2) Extern nachladende Google Fonts ───────────────────────────────────────
// Müssen self-hosted sein (next/font). Quelle: google-fonts-selfhosted.
for (const f of [...srcFiles, ...publicFiles]) {
  if (/fonts\.googleapis\.com|fonts\.gstatic\.com/.test(readFileSync(f, 'utf8'))) {
    add('Externe Google Fonts', f, 'fonts.googleapis.com/gstatic.com extern nachgeladen — stattdessen self-hosted via next/font');
  }
}

// ── 3) Einwilligungspflichtige Tracker ohne Consent ──────────────────────────
// Standard ist cookieless (nur Plausible). Wer GA4/Meta-Pixel/Hotjar/Clarity
// einbaut, braucht ein Consent-Banner. Quelle: tracking-skripte-ohne-consent.
// Ausnahme: Tracker, die NACHWEISLICH erst nach aktiver Einwilligung laden
// (Consent-Framework `@/lib/consent` + ConsentBanner), sind zulässig (§ 25 Abs. 1
// TDDDG) und werden NICHT geflaggt — erkannt am Consent-Bezug in derselben Datei.
const TRACKERS = [
  ['Google Analytics / GTM', /googletagmanager\.com|google-analytics\.com|\bgtag\s*\(/],
  ['Meta-Pixel', /connect\.facebook\.net|fbevents\.js|\bfbq\s*\(/],
  ['Hotjar', /static\.hotjar\.com/],
  ['Microsoft Clarity', /clarity\.ms/],
];
const CONSENT_GATED = /@\/lib\/consent|hasStatisticsConsent|hasMarketingConsent|CONSENT_CHANGE_EVENT/;
for (const f of [...srcFiles, ...publicFiles]) {
  const txt = readFileSync(f, 'utf8');
  if (CONSENT_GATED.test(txt)) continue; // consent-gated → zulässig, kein Verstoß
  for (const [name, re] of TRACKERS) {
    if (re.test(txt)) {
      add('Tracker ohne Consent', f, `${name} gefunden — ohne gleichwertiges Consent-Banner unzulässig (§ 25 TDDDG)`);
    }
  }
}

// ── 4) Affiliate-Komponenten: Werbekennzeichnung + rel="sponsored" ───────────
// Quelle: werbekennzeichnung-affiliate-uwg (§ 5a Abs. 4 UWG).
for (const f of affiliateFiles) {
  const txt = readFileSync(f, 'utf8');
  const isAffiliateLinkComponent = /\/go\/|affiliateHref/.test(txt);

  // Jeder rel="…" in einer Affiliate-Komponente muss 'sponsored' enthalten.
  for (const m of txt.match(/rel="([^"]*)"/g) || []) {
    if (!/sponsored/.test(m)) {
      add('Affiliate rel', f, `${m} ohne 'sponsored' — Affiliate-Links als bezahlt auszeichnen`);
    }
  }

  // Komponenten, die einen Affiliate-Link rendern, brauchen ein sichtbares Label.
  if (isAffiliateLinkComponent && !/Anzeige|Werbung/.test(txt)) {
    add('Werbekennzeichnung', f, "kein sichtbares 'Anzeige'-/'Werbung'-Label in der Komponente");
  }
}

// ── 5) Externe Bild-URLs in MDX-Frontmatter ─────────────────────────────────
// Ein image:/heroImage: auf fremdem Host laedt beim Seitenaufruf ungefragt von
// dort — derselbe Mechanismus, der bei den Amazon-Bildpfaden geschlossen wurde
// (KAN-71): Drittanbieter-Request ohne Einwilligung, dazu IP-Uebermittlung.
// Bilder gehoeren nach public/ und werden ueber einen lokalen Pfad referenziert.
//
// Diese Regel fehlte bisher: der Guard hat src/ und public/ gelesen, aber nie
// die Frontmatter der Inhalte. Aufgefallen ist es, weil vier neue Artikel das
// Muster aus dem Altbestand uebernommen haben.
//
// ALTBESTAND: 13 Dateien tragen den Fehler seit Mai/Juni und wuerden den Build
// ab der ersten Minute rot setzen. Sie stehen namentlich in BILD_ALTBESTAND —
// bewusst als Liste und nicht als Muster, damit sie sichtbar bleibt, sich beim
// Abarbeiten verkleinert und nicht versehentlich waechst. Fuer alles Neue ist
// die Regel hart.
const BILD_ALTBESTAND = new Set([
  'content/cuts/brisket.mdx',
  'content/cuts/pulled-pork.mdx',
  'content/methoden/direktes-grillen.mdx',
  'content/methoden/searing-perfekte-kruste.mdx',
  'content/methoden/smoken-low-and-slow.mdx',
  'content/methoden/sous-vide.mdx',
  'content/usa/carolinas.mdx',
  'content/usa/kansas-city.mdx',
  'content/usa/memphis.mdx',
  'content/usa/texas-style.mdx',
  'content/vergleich/fleischthermometer.mdx',
  'content/vergleich/grills.mdx',
  'content/vergleich/messer.mdx',
]);

const BILD_FELDER = /^(image|heroImage|ogImage|thumbnail):\s*["']?(https?:\/\/[^"'\s]+)/gm;

let altbestandTreffer = 0;
for (const f of contentFiles) {
  const relPfad = rel(f).split(sep).join('/');
  const txt = readFileSync(f, 'utf8');
  // Nur die Frontmatter betrachten, nicht den Fliesstext: ein Link im Text ist
  // etwas anderes als eine Bildquelle, die der Browser automatisch laedt.
  const fmEnde = txt.indexOf('\n---', 3);
  const fm = txt.startsWith('---') && fmEnde > 0 ? txt.slice(0, fmEnde + 1) : '';
  if (!fm) continue;
  for (const m of fm.matchAll(BILD_FELDER)) {
    if (BILD_ALTBESTAND.has(relPfad)) { altbestandTreffer++; continue; }
    const host = m[2].replace(/^https?:\/\//, '').split('/')[0];
    add('Externes Bild in Frontmatter', f, `${m[1]}: laedt von ${host} — Bild nach public/ legen und lokal referenzieren`);
  }
}

// ── Report ───────────────────────────────────────────────────────────────────
const scanned = srcFiles.length + publicFiles.length + contentFiles.length;
if (violations.length === 0) {
  console.log(`✅ Legal-Guard: keine Abmahn-Regressionen (${scanned} Dateien geprüft).`);
  if (altbestandTreffer) {
    console.log(`   Hinweis: ${altbestandTreffer} externe Bild-URL(n) im Altbestand (BILD_ALTBESTAND, ${BILD_ALTBESTAND.size} Dateien) — geduldet, nicht geloest.`);
  }
  process.exit(0);
}

console.error(`\n❌ Legal-Guard: ${violations.length} Verstoß/Verstöße gefunden:\n`);
const byRule = {};
for (const v of violations) (byRule[v.rule] ??= []).push(v);
for (const [rule, list] of Object.entries(byRule)) {
  console.error(`▸ ${rule}`);
  for (const v of list) console.error(`    ${v.file}\n      → ${v.detail}`);
  console.error('');
}
console.error('Begründung je Regel: compliance/website-rechtscheck.yaml');
process.exit(1);
