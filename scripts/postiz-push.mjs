#!/usr/bin/env node
/**
 * Postiz-Anbindung — schiebt die Promo-Maschinen-Outputs (Video + Caption +
 * Hashtags) als ENTWÜRFE in Postiz, auf die verbundenen Social-Kanäle.
 *
 * Sicherheits-Prinzip (hart): NICHTS wird automatisch veröffentlicht.
 *   - Default-Modus = `draft` → landet als Entwurf in Postiz; DU gibst dort frei.
 *   - `--schedule` plant zu einem Zeitpunkt (immer noch von dir kontrolliert).
 *   - Es gibt KEINEN „jetzt posten"-Modus in diesem Script.
 *
 * Konfiguration (in steakakademie-v2/.env.local — NIE in Git/Chat):
 *   POSTIZ_API_KEY=...            (Settings → Developers → Public API)
 *   POSTIZ_API_URL=https://api.postiz.com/public/v1   (optional; Default = Cloud)
 *   POSTIZ_CHANNELS=id1,id2       (optional; sonst alle aktiven Kanäle)
 *
 * Aufrufe (im steakakademie-v2-Ordner):
 *   node scripts/postiz-push.mjs --probe          # Kanäle + IDs auflisten (braucht Key)
 *   node scripts/postiz-push.mjs --dry-run        # Plan zeigen, kein API-Call (Default)
 *   node scripts/postiz-push.mjs --slug tomahawk-reverse-sear --push    # 1 Rezept → Entwurf
 *   node scripts/postiz-push.mjs --limit 5 --push                       # 5 Rezepte → Entwürfe
 *   node scripts/postiz-push.mjs --push --schedule --at 2026-06-10T08:00:00Z --every 1440
 */

import { readFileSync, readdirSync, existsSync, writeFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join, resolve, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const V2_ROOT = resolve(__dirname, '..');
const VIDEO_OUT = resolve(V2_ROOT, '..', 'steakakademie-video', 'out');
const KIT_DIR = join(V2_ROOT, 'promo-output');
const LEDGER = join(KIT_DIR, '.postiz-pushed.json');

// ── .env.local manuell laden (lokaler dotenv-Quirk, CLAUDE.md) ───────────────
function loadEnv() {
  const out = {};
  const p = join(V2_ROOT, '.env.local');
  if (!existsSync(p)) return out;
  for (const line of readFileSync(p, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    let v = m[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    out[m[1]] = v;
  }
  return out;
}
const ENV = { ...loadEnv(), ...process.env };
const API = (ENV.POSTIZ_API_URL || 'https://api.postiz.com/public/v1').replace(/\/$/, '');
const KEY = ENV.POSTIZ_API_KEY || '';

// ── Args ─────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const flag = (n) => args.includes(`--${n}`);
const val = (n) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : undefined; };
const PROBE = flag('probe');
const PUSH = flag('push');
const DRY = !PUSH; // Default: dry-run
const ONLY_SLUG = val('slug');
const LIMIT = val('limit') ? parseInt(val('limit'), 10) : Infinity;
const MODE = flag('schedule') ? 'schedule' : 'draft';
const AT = val('at'); // ISO-Startzeit für --schedule
const EVERY_MIN = val('every') ? parseInt(val('every'), 10) : 1440; // Abstand in Minuten (Default täglich)
const CHANNELS_OVERRIDE = val('channels');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function api(path, opts = {}) {
  const r = await fetch(`${API}${path}`, {
    ...opts,
    headers: { Authorization: KEY, ...(opts.headers || {}) },
  });
  const text = await r.text();
  let json; try { json = JSON.parse(text); } catch { json = text; }
  if (!r.ok) throw new Error(`${opts.method || 'GET'} ${path} → ${r.status}: ${typeof json === 'string' ? json : JSON.stringify(json)}`);
  return json;
}

// ── Kanäle laden + normalisieren ─────────────────────────────────────────────
function normChannel(it) {
  return {
    id: it.id || it.integrationId,
    platform: it.identifier || it.providerIdentifier || it.platform || it.type || 'unknown',
    name: it.name || it.profile || it.username || '(unbenannt)',
    disabled: Boolean(it.disabled),
  };
}
async function getChannels() {
  const res = await api('/integrations');
  const list = Array.isArray(res) ? res : res.integrations || res.data || [];
  let chans = list.map(normChannel).filter((c) => c.id && !c.disabled);
  const override = CHANNELS_OVERRIDE || ENV.POSTIZ_CHANNELS;
  if (override) {
    const ids = new Set(override.split(',').map((s) => s.trim()));
    chans = chans.filter((c) => ids.has(c.id));
  }
  return chans;
}

// ── Kit parsen (Caption / TikTok / Hashtags) ─────────────────────────────────
function parseKit(slug) {
  const file = join(KIT_DIR, `${slug}.md`);
  if (!existsSync(file)) return null;
  const md = readFileSync(file, 'utf8');
  const block = (header) => {
    const re = new RegExp(`##\\s*${header}[^\\n]*\\n\\s*\`\`\`\\n([\\s\\S]*?)\\n\`\`\``, 'i');
    const m = md.match(re);
    return m ? m[1].trim() : '';
  };
  return {
    caption: block('Caption'),
    tiktok: block('TikTok-Caption'),
    hashtags: block('Hashtags'),
  };
}

// Plattform-gerechte Caption
function captionFor(platform, kit) {
  return /tiktok/i.test(platform) && kit.tiktok ? kit.tiktok : kit.caption;
}

// ── Ledger (Doppel-Push verhindern) ──────────────────────────────────────────
function loadLedger() { try { return JSON.parse(readFileSync(LEDGER, 'utf8')); } catch { return {}; } }
function saveLedger(l) { writeFileSync(LEDGER, JSON.stringify(l, null, 2)); }

// ── Slugs sammeln (Kit + Video müssen existieren) ────────────────────────────
function collectSlugs() {
  if (!existsSync(KIT_DIR)) return [];
  let slugs = readdirSync(KIT_DIR).filter((f) => f.endsWith('.md')).map((f) => basename(f, '.md'));
  if (ONLY_SLUG) slugs = slugs.filter((s) => s === ONLY_SLUG);
  slugs = slugs.filter((s) => existsSync(join(VIDEO_OUT, `${s}.mp4`)));
  return slugs.slice(0, LIMIT);
}

// ── Media hochladen ──────────────────────────────────────────────────────────
async function uploadVideo(slug) {
  const buf = await readFile(join(VIDEO_OUT, `${slug}.mp4`));
  const fd = new FormData();
  fd.append('file', new Blob([buf], { type: 'video/mp4' }), `${slug}.mp4`);
  const res = await api('/upload', { method: 'POST', body: fd });
  // erwartet { id, path }
  return { id: res.id, path: res.path || res.url };
}

// ── Post (Entwurf/Plan) anlegen ──────────────────────────────────────────────
async function createPost(slug, kit, channels, media, isoDate) {
  const body = {
    type: MODE, // 'draft' | 'schedule'
    date: isoDate,
    shortLink: false,
    tags: [],
    posts: channels.map((ch) => ({
      integration: { id: ch.id },
      value: [{ content: captionFor(ch.platform, kit), image: media ? [media] : [] }],
      settings: { __type: ch.platform },
    })),
  };
  return api('/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

// ── Main ─────────────────────────────────────────────────────────────────────
(async () => {
  console.log(`\n🔌 Postiz-Push — ${API}`);

  if (PROBE) {
    if (!KEY) return console.error('✖ POSTIZ_API_KEY fehlt in .env.local.');
    const chans = await getChannels();
    console.log(`\nVerbundene Kanäle (${chans.length}):`);
    for (const c of chans) console.log(`  • ${c.platform.padEnd(12)} ${c.id}   ${c.name}`);
    console.log(`\n→ In .env.local einschränken via:  POSTIZ_CHANNELS=${chans.map((c) => c.id).join(',')}`);
    return;
  }

  const slugs = collectSlugs();
  if (slugs.length === 0) return console.error('✖ Keine Rezepte mit Kit + Video gefunden.');

  console.log(`Modus: ${DRY ? 'DRY-RUN (kein API-Call)' : MODE.toUpperCase()}  ·  ${slugs.length} Rezept(e)\n`);

  let channels = [];
  if (!DRY) {
    if (!KEY) return console.error('✖ POSTIZ_API_KEY fehlt in .env.local. Erst Key setzen, dann --push.');
    channels = await getChannels();
    if (channels.length === 0) return console.error('✖ Keine aktiven Kanäle. Erst in Postiz Social-Konten verbinden.');
    console.log(`Ziel-Kanäle: ${channels.map((c) => c.platform).join(', ')}\n`);
  }

  const ledger = loadLedger();
  let base = AT ? new Date(AT).getTime() : NaN;
  let pushed = 0;

  for (let i = 0; i < slugs.length; i++) {
    const slug = slugs[i];
    if (ledger[slug] && !flag('force')) { console.log(`⏭  ${slug} — bereits gepusht (${ledger[slug].id || 'ok'})`); continue; }
    const kit = parseKit(slug);
    if (!kit || !kit.caption) { console.log(`⚠  ${slug} — kein Kit-Text, übersprungen`); continue; }

    // Zeitpunkt: draft → +10min Platzhalter; schedule → AT + i*EVERY
    let iso;
    if (MODE === 'schedule' && !Number.isNaN(base)) iso = new Date(base + i * EVERY_MIN * 60000).toISOString();
    else iso = new Date(Date.now() + 10 * 60000).toISOString();

    if (DRY) {
      console.log(`▶ ${slug}`);
      console.log(`   Caption: ${kit.caption.split('\n')[0].slice(0, 70)}…`);
      console.log(`   Video:   ${slug}.mp4  ·  Zeit: ${MODE === 'schedule' ? iso : '(Entwurf)'}`);
      continue;
    }

    try {
      const media = await uploadVideo(slug);
      const res = await createPost(slug, kit, channels, media, iso);
      const id = res?.id || (Array.isArray(res) ? res[0]?.id : undefined) || 'ok';
      ledger[slug] = { id, at: iso, mode: MODE };
      saveLedger(ledger);
      pushed++;
      console.log(`✅ ${slug} → ${MODE} (${id})`);
      await sleep(1500); // Rate-Limit-Schonung (Cloud 100/h auf create)
    } catch (e) {
      console.error(`✖ ${slug}: ${e.message}`);
    }
  }

  if (!DRY) console.log(`\n✅ ${pushed} Post(s) als ${MODE} in Postiz angelegt. Prüfe & gib in Postiz frei.`);
  else console.log(`\n(Dry-Run — mit --push echte Entwürfe anlegen. Vorher einmal --probe für Kanal-IDs.)`);
})();
