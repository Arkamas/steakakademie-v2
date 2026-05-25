/**
 * AuthorityOS — EU SEO Content Runner
 * ═══════════════════════════════════════════════════════════════
 * Generiert GEO-optimierte Content-Blöcke aus der 6-Spalten-
 * Steuerberechnung und schreibt JSON-Dateien für Next.js-Seiten.
 *
 * Features:
 *   — Featured Snippet (Position-0-optimiert)
 *   — Factual Summary (AI-Wissens-Extraktion)
 *   — Comparison Table mit schema.org/Dataset
 *   — GEO Blocks (9 Q&A-Blöcke: 3 Vergleich + 6 Länder)
 *   — 6 FAQ-Items (Deutsch, Premium-Segment)
 *   — FAQPage + Dataset JSON-LD
 *   — Ausgabe für 3 Einkommensstufen: 3k / 5k / 8k
 *
 * Ausführen: npx tsx src/eu-seo-runner.ts
 * ═══════════════════════════════════════════════════════════════
 */

import * as fs   from 'fs';
import * as path from 'path';
import { evaluateAllCountries }  from './services/euCountryEvaluator';
import { generateEUSeoPage }     from './services/euSeoContentGenerator';

// ─── Formatierung ─────────────────────────────────────────────────────────────

const EUR  = (n: number) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(n);
const W    = 72;
const DSEP = '═'.repeat(W);
const SEP  = '─'.repeat(W);

const rpad = (s: string | number, n: number) => String(s).padEnd(n);
const lpad = (s: string | number, n: number) => String(s).padStart(n);

function header(t: string) { console.log('\n' + DSEP + '\n  ' + t + '\n' + DSEP); }
function box(t: string)    { console.log('\n┌' + SEP + '┐\n│  ' + rpad(t, W - 2) + '│\n├' + SEP + '┤'); }
function boxEnd()          { console.log('└' + SEP + '┘'); }
function line(t: string)   { console.log('│  ' + rpad(t, W - 2) + '│'); }
function divider()         { console.log('│  ' + '─'.repeat(W - 2) + '│'); }

// ─── Output-Funktionen ────────────────────────────────────────────────────────

function printFeaturedSnippet(snippet: string) {
  box('FEATURED SNIPPET — Position 0 (60 Wörter, direkte Antwort)');
  snippet.match(/.{1,68}/g)?.forEach(l => line(l.trim()));
  boxEnd();
}

function printFactualSummary(summary: string) {
  box('FACTUAL SUMMARY — AI-Wissens-Extraktion (Perplexity / ChatGPT / Gemini)');
  summary.split('\n').forEach(l => line(l));
  boxEnd();
}

function printComparisonTable(page: ReturnType<typeof generateEUSeoPage>) {
  const { rows, caption } = page.comparisonTable;
  box(`COMPARISON TABLE — ${caption}`);
  const H = (s: string) => lpad(s, 14);
  line('  ' + rpad('Rang  Land', 28) + H('Netto/Mo') + H('Quote') + H('SV/KV') + H('Steuer'));
  divider();
  for (const r of rows) {
    line(
      `  ${r.rank}.  ` +
      rpad(r.countryName, 22) +
      lpad(r.monthlyNet, 14) +
      lpad(r.effectiveRate, 14) +
      lpad(r.svKV, 14) +
      lpad(r.incomeTax, 14),
    );
  }
  divider();
  line(`  Dataset schema.org: ${Object.keys(page.comparisonTable.schemaOrg).join(', ')}`);
  boxEnd();
}

function printGEOBlocks(page: ReturnType<typeof generateEUSeoPage>) {
  const comparison = page.geoBlocks.filter(b => b.type !== 'country-answer');
  const countries  = page.geoBlocks.filter(b => b.type === 'country-answer');

  box(`GEO BLOCKS — ${comparison.length} Vergleich + ${countries.length} Länder-Antworten`);
  line('Vergleichs-Blöcke (Typ: comparison / premium-insight):');
  divider();
  for (const b of comparison) {
    line(`  Q: ${b.query.substring(0, 68)}`);
    b.answer.split('\n').slice(0, 6).forEach(l => line(`     ${l}`));
    line('     [...]');
    divider();
  }
  line('Pro-Land GEO-Blöcke (Typ: country-answer):');
  divider();
  for (const b of countries) {
    line(`  [${b.country}]  ${b.query.substring(0, 60)}`);
    b.answer.split('\n').slice(0, 3).forEach(l => line(`        ${l}`));
    line('        [...]');
  }
  boxEnd();
}

function printFAQ(page: ReturnType<typeof generateEUSeoPage>) {
  box(`FAQ — ${page.faq.length} Items (FAQPage JSON-LD ready)`);
  page.faq.forEach((f, i) => {
    line(`  Q${i + 1}: ${f.question.substring(0, 65)}`);
    line(`       ${f.answer.substring(0, 65)} …`);
  });
  divider();
  line(`  JSON-LD: FAQPage (${page.faq.length} Questions) + Dataset`);
  boxEnd();
}

function printKeywords(page: ReturnType<typeof generateEUSeoPage>) {
  box('SEO-KEYWORDS — Primary + Secondary (alle 6 Länder)');
  line('Primary:');
  evaluateAllCountries(page.grossRevenue).forEach(ev => {
    line(`  [${ev.country}]  ${ev.meta.primaryKeyword}`);
  });
  divider();
  line('Secondary (Auswahl):');
  evaluateAllCountries(page.grossRevenue)
    .filter(ev => ['FR', 'PT'].includes(ev.country))
    .forEach(ev => {
      line(`  [${ev.country}]  ${ev.meta.secondaryKeywords.slice(0, 3).join(' | ')}`);
    });
  divider();
  line('GEO-Queries FR:');
  evaluateAllCountries(page.grossRevenue)
    .find(e => e.country === 'FR')!
    .meta.geoQueries.forEach(q => line(`  ${q.substring(0, 68)}`));
  line('GEO-Queries PT:');
  evaluateAllCountries(page.grossRevenue)
    .find(e => e.country === 'PT')!
    .meta.geoQueries.forEach(q => line(`  ${q.substring(0, 68)}`));
  boxEnd();
}

function writeJSON(page: ReturnType<typeof generateEUSeoPage>) {
  const dir = path.join(__dirname, 'data', 'generated');
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `eu-seo-${page.grossRevenue}.json`);
  fs.writeFileSync(file, JSON.stringify(page, null, 2), 'utf-8');
  return file;
}

// ─── Hauptprogramm ────────────────────────────────────────────────────────────

function main() {
  const TIERS = [3_000, 5_000, 8_000];

  header('AUTHORITYOS — EU SEO CONTENT GENERATOR (GEO / AI-SEARCH)');
  console.log(`  Ziel: Featured Snippets, AI-Search-Rankings (Perplexity, ChatGPT, Gemini)`);
  console.log(`  Fokus: Premium-Segment Solopreneure | Einkommensstufen: ${TIERS.map(t => EUR(t)).join(' / ')}`);
  console.log(`  Märkte: DE, NL, ES, IT, FR (auto-entrepreneur BNC), PT (recibos verdes)\n`);

  const writtenFiles: string[] = [];

  for (const gross of TIERS) {
    const evals = evaluateAllCountries(gross);
    const page  = generateEUSeoPage(evals);

    header(`EINKOMMENSSTUFE: ${EUR(gross)} / MONAT BRUTTOUMSATZ`);

    printFeaturedSnippet(page.featuredSnippet);
    printFactualSummary(page.factualSummary);
    printComparisonTable(page);

    if (gross === 5_000) {
      // Vollständige GEO-Ausgabe nur für 5k-Tier
      printGEOBlocks(page);
      printFAQ(page);
      printKeywords(page);
    }

    const file = writeJSON(page);
    writtenFiles.push(file);
    console.log(`\n  ✓  JSON geschrieben: ${path.relative(process.cwd(), file)}`);
  }

  // Abschluss-Zusammenfassung
  console.log('\n' + DSEP);
  console.log('  OUTPUT-ZUSAMMENFASSUNG');
  console.log(DSEP);
  writtenFiles.forEach(f => console.log(`  • ${path.relative(process.cwd(), f)}`));
  console.log(`\n  GEO-Blöcke pro Seite: 9 (3 Vergleich + 6 Länder-Antworten)`);
  console.log(`  FAQ-Items pro Seite:  6 (FAQPage JSON-LD)`);
  console.log(`  Structured Data:      schema.org/Dataset + FAQPage`);
  console.log(`  Targeting:            Featured Snippet, Perplexity, ChatGPT, Gemini\n`);
}

main();
