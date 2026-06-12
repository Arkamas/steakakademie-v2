#!/usr/bin/env node
/**
 * Promo-Maschine — aus jedem Rezept ein fertiges Social-Video + Post-Kit.
 *
 * Pro Rezept mit Hero-Bild (fleisch/fisch):
 *   1. Hero-Bild  →  steakakademie-video/public/heroes/<slug>.jpg
 *   2. Props ableiten (Titel, Kategorie-Kicker, Kern-Fakt) aus dem MDX-Frontmatter
 *   3. RecipePromo (Remotion) → steakakademie-video/out/<slug>.mp4 (15s, 9:16)
 *   4. Post-Kit (Marco-Stimme + Hashtag-Sets aus dem Channel-Setup) → promo-output/<slug>.md
 *
 * Kein LLM, keine API-Keys, keine Kosten — rein lokal, deterministisch, idempotent.
 *
 * Aufruf (im steakakademie-v2-Ordner):
 *   node scripts/promo-machine.mjs                 # alle (Video überspringt bereits gerenderte)
 *   node scripts/promo-machine.mjs --slug tomahawk-reverse-sear
 *   node scripts/promo-machine.mjs --limit 5       # nur die ersten 5
 *   node scripts/promo-machine.mjs --kit-only      # nur Post-Kits, kein Render (schnell)
 *   node scripts/promo-machine.mjs --force         # auch vorhandene MP4s neu rendern
 *   node scripts/promo-machine.mjs --dry-run       # nur anzeigen, was passieren würde
 */

import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync, statSync } from 'node:fs';
import { join, resolve, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import yaml from 'js-yaml';

const __dirname = dirname(fileURLToPath(import.meta.url));
const V2_ROOT = resolve(__dirname, '..');

// Autoritative Kerntemperatur-Referenz (Single Source of Truth)
const REF = yaml.load(readFileSync(join(V2_ROOT, 'data', 'kerntemperatur-referenz.yaml'), 'utf8'));
const BADGES = REF.badges;
const VIDEO_ROOT = resolve(V2_ROOT, '..', 'steakakademie-video');
const CONTENT_DIR = join(V2_ROOT, 'content', 'rezepte');
const HERO_SRC_DIR = join(V2_ROOT, 'public', 'images', 'rezepte');
const HERO_DST_DIR = join(VIDEO_ROOT, 'public', 'heroes');
const PROPS_DIR = join(VIDEO_ROOT, 'props');
const OUT_DIR = join(VIDEO_ROOT, 'out');
const KIT_DIR = join(V2_ROOT, 'promo-output');

// ── Args ─────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const flag = (n) => args.includes(`--${n}`);
const val = (n) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : undefined; };
const ONLY_SLUG = val('slug');
const LIMIT = val('limit') ? parseInt(val('limit'), 10) : Infinity;
const KIT_ONLY = flag('kit-only');
const FORCE = flag('force');
const DRY = flag('dry-run');

// ── Kategorie-Labels (Kicker) ─────────────────────────────────────────────────
const KICKER = {
  fleisch: 'Fleisch',
  fisch: 'Fisch & Meeresfrüchte',
  beilagen: 'Beilage',
  'saucen-rubs': 'Sauce & Rub',
  desserts: 'Dessert',
  'wine-spirits': 'Pairing',
};

// ── Hashtag-Sets (aus Channel-Setup_Komplettpaket.md, „Marco"-Stimme) ─────────
const TAGS_REACH = ['#grillen', '#steak', '#bbqdeutschland', '#grillenlernen', '#grilltipps', '#fleisch', '#grillmeister'];
const TAGS_BRAND = ['#steakakademie'];
const TAGS_FISCH = ['#grillen', '#fisch', '#fischgrillen', '#bbqdeutschland', '#grillenlernen', '#seafood', '#grilltipps'];
// Methoden-Tag nach cookingMethod
function methodTag(method = '') {
  const m = method.toLowerCase();
  if (m.includes('reverse')) return '#reversesear';
  if (m.includes('sous')) return '#sousvide';
  if (m.includes('oberhitze') || m.includes('900') || m.includes('beefer')) return '#oberhitzegrill';
  if (m.includes('smok') || m.includes('low') || m.includes('slow')) return '#lowandslow';
  if (m.includes('dry') || m.includes('aged')) return '#dryaged';
  return '#kerntemperatur';
}

// ── Mini-Frontmatter-Parser (nur einzeilige Keys, die wir brauchen) ───────────
function parseFrontmatter(raw) {
  const m = raw.match(/^---\s*\n([\s\S]*?)\n---/);
  const fm = {};
  if (!m) return { fm, body: raw };
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^([a-zA-Z0-9_]+):\s*(.*)$/);
    if (!kv) continue;
    let v = kv[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    fm[kv[1]] = v;
  }
  return { fm, body: raw.slice(m[0].length) };
}

// Kurzer, knackiger Titel (vor erstem – — : | und gekappt)
function shortTitle(title = '') {
  let t = title.split(/\s[–—|:]\s|\s–\s|\s—\s/)[0].trim();
  if (t.length > 38) t = t.slice(0, 37).trim() + '…';
  return t;
}

// Klassifiziert ein Rezept in eine autoritative Badge-Familie (data/kerntemperatur-
// referenz.yaml). Gibt einen Badge-Key zurück oder null (→ Regex-/Text-Fallback).
function classifyBadge(fm, slug) {
  const hay = `${fm.meatType || ''} ${fm.title || ''} ${slug} ${fm.cookingMethod || ''}`.toLowerCase();
  const has = (...ws) => ws.some((w) => hay.includes(w));
  const lowslow = has('low', 'slow', 'smoker', '3-2-1', 'geschmort', 'pulled', 'burnt end', 'räuch', 'raeuch');

  // Hack/Burger zuerst (Sicherheit: durchgegart) — fängt auch Wagyu-Burger
  if (has('burger', 'smash', 'patty', 'hackfleisch', 'tatar')) return 'burger';

  // Fisch
  if (has('lachs', 'salmon')) return 'salmon';
  if (has('thunfisch', 'tuna')) return 'tuna';
  if (has('makrele', 'sardin')) return 'oily_whole';
  if (has('dorade', 'kabeljau', 'rotbarbe', 'mahi', 'schwertfisch', 'wolfsbarsch', 'seebarsch', 'seafood')) return 'whitefish';

  // Geflügel (immer durch ≥72 °C; Pulled Chicken spezifisch via Regex)
  if (has('hähnchen', 'haehnchen', 'chicken', 'pute', 'turkey', 'spatchcock', 'poularde')) return has('pulled') ? null : 'poultry';
  if (has('ente', 'duck')) return has('brust') ? 'duck_breast' : 'duck_whole';
  if (has('gans', 'goose')) return 'duck_whole';

  // Schwein
  if (has('carrillera')) return 'pork_lowslow';
  if (has('krustenbraten')) return 'pork_kruste';
  if (has('pulled pork', 'boston butt', 'spareribs', 'sparerib', 'schälrippchen')) return 'pork_lowslow';
  if (has('iberico', 'pluma', 'presa', 'secreto', 'schweinefilet', 'schweinelende', 'schweinekotelett', 'schweinenacken')) return lowslow ? 'pork_lowslow' : 'pork_juicy';

  // Lamm (Keule rosa 60–63 → spezifisch via Regex)
  if (has('lammkarree', 'lammkotelett', 'lammrücken', 'lammruecken', 'lammlachs')) return 'lamb_mr';

  // Rind Low & Slow — immer kollagenreiche Schmor-/Smoke-Cuts …
  if (has('brisket', 'burnt end', 'pulled beef', 'ochsenback', 'ochsenbäck', 'rinderbrust')) return 'beef_lowslow';
  // … Short/Back Ribs NUR bei echtem Low&Slow-Kontext (NICHT heiß gegrilltes Asado de Tira)
  if (lowslow && has('short rib', 'short-rib', 'back rib', 'back-rib', 'rind', 'beef', 'ochsen', 'tafelspitz')) return 'beef_lowslow';

  // Wagyu (außer dünn am Tischgrill/Yakiniku)
  if (has('wagyu') && !has('yakiniku', 'tischgrill')) return 'wagyu';

  // Rind Steak (Premium → Medium Rare)
  if (has('ribeye', 'rib-eye', 'entrecote', 'entrecôte', 'roastbeef', 'filet', 'chateaubriand', 'tomahawk',
    't-bone', 'tbone', 'porterhouse', 'picanha', 'tri-tip', 'tri tip', 'flank', 'bavette', 'skirt',
    'onglet', 'hanger', 'flap', 'tagliata', 'dry-aged', 'dry aged', 'striploin', 'sirloin', 'rumpsteak',
    'flat iron', 'denver', 'club steak', 'fiorentina')) return 'beef_mr';

  return null;
}

// Kern-Fakt: 1) autoritativer Badge-Wert aus der Referenz (Serviertemperatur),
// 2) sonst recipe-eigener °C-Wert NUR im Kerntemperatur-Kontext + plausibel (38–99),
// 3) sonst meatType · Methode. Nie Grill-/Ofenhitze als „Kern" (CLAUDE.md 8c).
function deriveFact(fm, body, slug) {
  const method = fm.cookingMethod || '';
  const key = classifyBadge(fm, slug);
  if (key && BADGES[key]) return method ? `Kern ${BADGES[key].c} °C · ${method}` : `Kern ${BADGES[key].c} °C`;

  const hay = `${fm.description || ''}\n${body}`;
  const patterns = [
    /Kerntemperatur[^.\n]{0,40}?(\d{2,3})\s*°\s*C/i,
    /(\d{2,3})\s*°\s*C\s*Kerntemperatur/i,
    /Kern(?:temp)?[^.\n]{0,25}?(\d{2,3})\s*°\s*C/i,
    /auf\s*(\d{2,3})\s*°\s*C\s*(?:ziehen|garen|bringen|hochziehen)/i,
  ];
  for (const re of patterns) {
    const m = hay.match(re);
    if (m) {
      const n = +m[1];
      if (n >= 38 && n <= 99) return method ? `Kern ${n} °C · ${method}` : `Kern ${n} °C`;
    }
  }
  const parts = [fm.meatType, method].filter(Boolean);
  return parts.join(' · ') || 'Pitmaster-Rezept';
}

// Hook-Satz (Marco, appetit-/neugier-getrieben) — deterministisch je Slug
const HOOKS = [
  (t) => `So gelingt ${t} – auf den Punkt. 🔥`,
  (t) => `${t}: Der Profi-Trick, den kaum jemand kennt. 🔥`,
  (t) => `Warum dein ${t} bisher zäh wurde – und wie es perfekt wird. 🔥`,
  (t) => `${t} wie vom Pitmaster. Schritt für Schritt. 🔥`,
  (t) => `Speicher dir das: ${t}, richtig gemacht. 📌🔥`,
];
function hookFor(slug, title) {
  let h = 0; for (const ch of slug) h = (h + ch.charCodeAt(0)) % HOOKS.length;
  return HOOKS[h](title);
}

// ── Sammeln ────────────────────────────────────────────────────────────────
function collectRecipes() {
  const files = [];
  const walk = (dir) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith('.mdx')) files.push(p);
    }
  };
  walk(CONTENT_DIR);

  const out = [];
  for (const file of files) {
    const slug = basename(file, '.mdx');
    if (ONLY_SLUG && slug !== ONLY_SLUG) continue;
    const raw = readFileSync(file, 'utf8');
    const { fm, body } = parseFrontmatter(raw);
    const heroRel = fm.heroImage; // z.B. /images/rezepte/<slug>-hero.jpg
    if (!heroRel) continue;
    const heroSrc = join(HERO_SRC_DIR, basename(heroRel));
    if (!existsSync(heroSrc)) continue; // nur Rezepte mit echtem Hero-Bild
    out.push({
      slug,
      heroSrc,
      title: shortTitle(fm.title),
      kicker: KICKER[fm.kategorie] || 'Steakakademie',
      kategorie: fm.kategorie,
      fact: deriveFact(fm, body, slug),
      cookingMethod: fm.cookingMethod || '',
      fullTitle: fm.title || slug,
    });
  }
  return out;
}

// ── Post-Kit schreiben ─────────────────────────────────────────────────────
function writeKit(r) {
  const isFisch = r.kategorie === 'fisch';
  const tags = [...new Set([...TAGS_BRAND, methodTag(r.cookingMethod), ...(isFisch ? TAGS_FISCH : TAGS_REACH)])].slice(0, 11);
  const hook = hookFor(r.slug, r.title);
  const caption =
`${hook}

${r.fact}. Ganzes Rezept mit allen Schritten gibt's auf steakakademie.de.

Folge für mehr Grillwissen vom Pitmaster. 🥩

${tags.join(' ')}`;

  const tiktok = `${hook.replace(' 🔥', '')} 🔥 Folge für mehr Grillwissen. ${TAGS_BRAND.join(' ')} #grilltok #steak`;

  const md =
`# Promo-Kit — ${r.fullTitle}

**Video:** \`steakakademie-video/out/${r.slug}.mp4\` (15s, 1080×1920, 9:16)
**Kategorie:** ${r.kicker}  ·  **Fakt im Video:** ${r.fact}

## Caption (Instagram / Facebook)
\`\`\`
${caption}
\`\`\`

## TikTok-Caption (kurz)
\`\`\`
${tiktok}
\`\`\`

## Hashtags (kopierfertig)
\`\`\`
${tags.join(' ')}
\`\`\`

> Stimme „Marco". Manuell gegenlesen & terminieren (Postiz). Kein Auto-Posting.
`;
  if (!DRY) { mkdirSync(KIT_DIR, { recursive: true }); writeFileSync(join(KIT_DIR, `${r.slug}.md`), md); }
}

// ── Video rendern ──────────────────────────────────────────────────────────
function renderVideo(r) {
  const outRel = `out/${r.slug}.mp4`;
  const outAbs = join(OUT_DIR, `${r.slug}.mp4`);
  if (!FORCE && existsSync(outAbs)) { console.log(`   ⏭  Video existiert: ${r.slug}.mp4`); return; }

  // 1) Hero kopieren
  mkdirSync(HERO_DST_DIR, { recursive: true });
  copyFileSync(r.heroSrc, join(HERO_DST_DIR, `${r.slug}.jpg`));

  // 2) Props schreiben
  mkdirSync(PROPS_DIR, { recursive: true });
  const props = { title: r.title, kicker: r.kicker, fact: r.fact, image: `heroes/${r.slug}.jpg` };
  const propsRel = `props/${r.slug}.json`;
  writeFileSync(join(PROPS_DIR, `${r.slug}.json`), JSON.stringify(props, null, 2));

  // 3) Render
  if (DRY) { console.log(`   🎬 (dry) würde rendern → ${outRel}`); return; }
  console.log(`   🎬 rendere ${r.slug}.mp4 …`);
  execSync(`npx remotion render RecipePromo "${outRel}" --props="${propsRel}"`, {
    cwd: VIDEO_ROOT, stdio: 'inherit',
  });
}

// ── Main ───────────────────────────────────────────────────────────────────
const recipes = collectRecipes().slice(0, LIMIT);
console.log(`\n🔥 Promo-Maschine — ${recipes.length} Rezept(e) mit Hero-Bild${KIT_ONLY ? ' (nur Kits)' : ''}${DRY ? ' [dry-run]' : ''}\n`);

let done = 0;
for (const r of recipes) {
  console.log(`▶ ${r.slug}  —  „${r.title}"  ·  ${r.fact}`);
  writeKit(r);
  if (!KIT_ONLY) {
    try { renderVideo(r); } catch (e) { console.error(`   ✖ Render-Fehler ${r.slug}: ${e.message}`); }
  }
  done++;
}

console.log(`\n✅ Fertig. ${done} Rezept(e) verarbeitet.`);
console.log(`   Videos:    steakakademie-video/out/*.mp4`);
console.log(`   Post-Kits: promo-output/*.md`);
if (KIT_ONLY) console.log(`   (Videos übersprungen — ohne --kit-only werden sie gerendert.)`);
