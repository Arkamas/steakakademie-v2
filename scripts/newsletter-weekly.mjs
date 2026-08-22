#!/usr/bin/env node
/**
 * newsletter-weekly.mjs
 * Steakakademie — Wöchentlicher Newsletter-Generator
 *
 * Läuft jeden Freitag via GitHub Actions.
 * 1. Findet die 3 neuesten Rezepte aus dem Repo
 * 2. Generiert Newsletter-Inhalt via Claude Haiku
 * 3. Feuert Loops.so-Event "weekly_newsletter" an alle Subscriber
 *
 * Voraussetzungen (GitHub Secrets):
 *   ANTHROPIC_API_KEY
 *   LOOPS_API_KEY
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, dirname, extname, basename } from 'path';
import { fileURLToPath } from 'url';
import { callClaude, printCacheStats } from './lib/anthropic.mjs';
process.on('exit', () => printCacheStats('  '))

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const LOOPS_API_KEY = process.env.LOOPS_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

if (!LOOPS_API_KEY || !ANTHROPIC_API_KEY) {
  console.error('❌ LOOPS_API_KEY und ANTHROPIC_API_KEY müssen gesetzt sein');
  process.exit(1);
}

// ─── 1. REZEPTE FINDEN ────────────────────────────────────────────────────────

function findRecipeFiles(limit = 5) {
  const searchPaths = [
    join(ROOT, 'content', 'rezepte'),
    join(ROOT, 'content', 'recipes'),
    join(ROOT, 'src', 'content', 'rezepte'),
    join(ROOT, 'src', 'content', 'recipes'),
  ];

  const files = [];

  for (const dir of searchPaths) {
    if (!existsSync(dir)) continue;
    collectFiles(dir, files);
  }

  if (files.length === 0) {
    console.warn('⚠️  Keine Rezeptdateien gefunden');
    return [];
  }

  // Neueste zuerst (nach Änderungsdatum)
  files.sort((a, b) => b.mtime - a.mtime);
  return files.slice(0, limit);
}

function collectFiles(dir, result) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      collectFiles(fullPath, result);
    } else if (['.mdx', '.md', '.json'].includes(extname(entry.name))) {
      const stat = statSync(fullPath);
      result.push({ path: fullPath, mtime: stat.mtimeMs });
    }
  }
}

function parseRecipe(filePath) {
  const content = readFileSync(filePath, 'utf-8');
  const ext = extname(filePath);

  if (ext === '.json') {
    try {
      const data = JSON.parse(content);
      return {
        title: data.title || basename(filePath, ext),
        description: data.description || '',
        country: data.country_name || data.country || '',
        flag: data.flag || '',
        difficulty: data.difficulty || '',
        servings: data.servings || '',
        slug: data.slug || basename(filePath, ext),
      };
    } catch { return null; }
  }

  // MDX/MD: frontmatter parsen
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (match) {
    const fm = {};
    for (const line of match[1].split('\n')) {
      const [k, ...vs] = line.split(':');
      if (k && vs.length) fm[k.trim()] = vs.join(':').trim().replace(/^["']|["']$/g, '');
    }
    return {
      title: fm.title || basename(filePath, ext),
      description: fm.description || fm.excerpt || '',
      country: fm.country || fm.land || '',
      flag: fm.flag || fm.emoji || '',
      difficulty: fm.difficulty || fm.schwierigkeit || '',
      servings: fm.servings || fm.portionen || '',
      slug: fm.slug || basename(filePath, ext),
    };
  }

  return { title: basename(filePath, ext), description: '', country: '', flag: '', slug: basename(filePath, ext) };
}

// ─── 2. NEWSLETTER-INHALT GENERIEREN (Claude Haiku) ──────────────────────────

async function generateNewsletter(recipes) {
  const recipeList = recipes
    .map((r, i) => `${i + 1}. ${r.flag} ${r.title} (${r.country})${r.description ? ' — ' + r.description.slice(0, 120) : ''}`)
    .join('\n');

  const today = new Date().toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' });
  const weekNum = getWeekNumber(new Date());

  const prompt = `Du bist der redaktionelle Assistent der Steakakademie.de — Deutschlands führender BBQ-Wissensplattform.

Schreibe einen knappen, leidenschaftlichen Wochen-Newsletter auf Deutsch für diese neuen Rezepte:

${recipeList}

Format (exakt so, keine anderen Felder):
BETREFF: [Betreffzeile, max 55 Zeichen, packend, BBQ-Jargon ok]
PREHEADER: [Vorschautext für E-Mail-Client, max 90 Zeichen]
INTRO: [2-3 Sätze Begrüßung, warm, direkt, kein Smalltalk]
REZEPT_1_TEASER: [2 Sätze für Rezept 1, Appetit wecken, präzise]
REZEPT_2_TEASER: [2 Sätze für Rezept 2]
REZEPT_3_TEASER: [2 Sätze für Rezept 3, falls vorhanden]
CTA: [1 Satz Call-to-Action zum Diplomsystem, max 80 Zeichen]
PS: [Optional: 1 kurzer PS-Satz mit Tipp oder Fakt]

Ton: Kampferprobt. Direkt. Keine Floskeln. Qualität über Masse.`;

  const r = await callClaude({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 600,
    messages: [{ role: 'user', content: prompt }],
    label: 'newsletter',
  });
  const text = r.text;

  // Felder parsen
  const get = (key) => {
    const match = text.match(new RegExp(`${key}:\\s*(.+)`));
    return match ? match[1].trim() : '';
  };

  return {
    subject: get('BETREFF') || `KW${weekNum} — Neue BBQ-Rezepte auf Steakakademie.de`,
    preheader: get('PREHEADER') || 'Neue Rezepte sind online.',
    intro: get('INTRO') || '',
    recipe1Teaser: get('REZEPT_1_TEASER') || '',
    recipe2Teaser: get('REZEPT_2_TEASER') || '',
    recipe3Teaser: get('REZEPT_3_TEASER') || '',
    cta: get('CTA') || 'Sicher dir dein BBQ-Diplom auf steakakademie.de',
    ps: get('PS') || '',
    date: today,
    weekNum,
  };
}

// ─── 3. LOOPS.SO CONTACTS ABRUFEN ────────────────────────────────────────────

async function getSubscribers() {
  const subscribers = [];
  let page = 1;
  const limit = 100;

  while (true) {
    const resp = await fetch(
      `https://app.loops.so/api/v1/contacts/search?limit=${limit}&skip=${(page - 1) * limit}`,
      { headers: { Authorization: `Bearer ${LOOPS_API_KEY}` } }
    );

    if (!resp.ok) {
      const err = await resp.text();
      throw new Error(`Loops.so contacts error: ${resp.status} ${err}`);
    }

    const data = await resp.json();
    const batch = Array.isArray(data) ? data : (data.contacts || []);

    if (batch.length === 0) break;

    // Nur aktive/unsubscribed=false Kontakte
    const active = batch.filter(c => c.unsubscribed !== true && c.email);
    subscribers.push(...active);

    if (batch.length < limit) break;
    page++;
  }

  return subscribers;
}

// ─── 4. EVENT AN ALLE SUBSCRIBER FEUERN ──────────────────────────────────────

async function sendNewsletterEvent(subscribers, content, recipes) {
  const eventProperties = {
    subject: content.subject,
    preheader: content.preheader,
    intro: content.intro,
    recipe1Title: recipes[0]?.title || '',
    recipe1Flag: recipes[0]?.flag || '',
    recipe1Country: recipes[0]?.country || '',
    recipe1Teaser: content.recipe1Teaser,
    recipe1Url: `https://steakakademie.de/rezepte/${recipes[0]?.slug || ''}`,
    recipe2Title: recipes[1]?.title || '',
    recipe2Flag: recipes[1]?.flag || '',
    recipe2Country: recipes[1]?.country || '',
    recipe2Teaser: content.recipe2Teaser,
    recipe2Url: `https://steakakademie.de/rezepte/${recipes[1]?.slug || ''}`,
    recipe3Title: recipes[2]?.title || '',
    recipe3Flag: recipes[2]?.flag || '',
    recipe3Country: recipes[2]?.country || '',
    recipe3Teaser: content.recipe3Teaser,
    recipe3Url: `https://steakakademie.de/rezepte/${recipes[2]?.slug || ''}`,
    cta: content.cta,
    ps: content.ps,
    date: content.date,
    weekNum: String(content.weekNum),
    unsubscribeUrl: '{{unsubscribeUrl}}',
  };

  let sent = 0;
  let errors = 0;

  // Regel 4 (human-gated): Der Versand an echte Empfänger ist NICHT der Standard.
  // Ohne explizites --send erzeugt der Lauf nur eine Vorschau zur Freigabe.
  // Grund: KI-generierter Text ging vorher ungeprüft per Cron an alle Subscriber.
  const SEND = process.argv.includes('--send');
  if (!SEND) {
    console.log('\n📋 VORSCHAU-MODUS (kein Versand) — Freigabe nötig, dann erneut mit --send\n');
    console.log(`Empfänger, die beim Versand angeschrieben würden: ${subscribers.length}`);
    console.log('\n--- Newsletter-Inhalt ---');
    console.log(JSON.stringify(eventProperties, null, 2));
    console.log('\n--- Ende Vorschau ---');
    return { sent: 0, errors: 0, preview: true, recipients: subscribers.length };
  }

  for (const contact of subscribers) {
    try {
      const resp = await fetch('https://app.loops.so/api/v1/events/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${LOOPS_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: contact.email,
          eventName: 'weekly_newsletter',
          eventProperties,
        }),
      });

      if (resp.ok) {
        sent++;
      } else {
        errors++;
        console.warn(`⚠️  ${contact.email}: ${resp.status}`);
      }

      // Rate limiting: Loops.so erlaubt ~10 req/s
      await new Promise(r => setTimeout(r, 120));
    } catch (err) {
      errors++;
      console.warn(`⚠️  ${contact.email}: ${err.message}`);
    }
  }

  return { sent, errors };
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function getWeekNumber(d) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date - yearStart) / 86400000 + 1) / 7);
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🔥 Steakakademie Wochen-Newsletter startet...\n');

  // 1. Rezepte
  const recipeFiles = findRecipeFiles(3);
  if (recipeFiles.length === 0) {
    console.error('❌ Keine Rezepte gefunden. Abbruch.');
    process.exit(1);
  }

  const recipes = recipeFiles.map(f => parseRecipe(f.path)).filter(Boolean);
  console.log(`✅ ${recipes.length} Rezepte gefunden:`);
  recipes.forEach(r => console.log(`   ${r.flag} ${r.title} (${r.country})`));

  // 2. Inhalt generieren
  console.log('\n⚡ Generiere Newsletter-Inhalt via Claude Haiku...');
  const content = await generateNewsletter(recipes);
  console.log(`✅ Betreff: ${content.subject}`);
  console.log(`   Preheader: ${content.preheader}`);

  // 3. Subscriber abrufen
  console.log('\n📋 Lade Loops.so Subscriber...');
  const subscribers = await getSubscribers();
  console.log(`✅ ${subscribers.length} aktive Subscriber`);

  if (subscribers.length === 0) {
    console.log('ℹ️  Keine Subscriber — kein Versand.');
    return;
  }

  // 4. Event senden
  console.log(`\n📤 Sende "weekly_newsletter" Event an ${subscribers.length} Kontakte...`);
  const { sent, errors } = await sendNewsletterEvent(subscribers, content, recipes);

  console.log(`\n✅ Newsletter-Run abgeschlossen:`);
  console.log(`   Gesendet: ${sent}`);
  console.log(`   Fehler:   ${errors}`);

  if (errors > 0 && errors === subscribers.length) {
    console.error('❌ Alle Sends fehlgeschlagen');
    process.exit(1);
  }
}

main().catch(err => {
  console.error('❌ Unbehandelter Fehler:', err);
  process.exit(1);
});
