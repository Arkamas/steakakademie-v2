// ── STEP 2A — Scout Source Registry ──────────────────────────────────────────
// Alle vordefinierten Quellen mit Metadaten, Feed-URLs und Pipeline-Hints.

import type { ScoutSource } from '@/lib/schemas/pipeline'

export const SCOUT_SOURCES: ScoutSource[] = [
  // ── US-Kultur & Wissenschaft ──────────────────────────────────────────────
  {
    id: 'src_texas_monthly',
    name: 'Texas Monthly BBQ',
    url: 'https://www.texasmonthly.com/category/bbq-food/',
    feed_url: 'https://www.texasmonthly.com/feed/',
    type: 'rss',
    language: 'en',
    pipeline_hint: 'usa',
    active: true,
  },
  {
    id: 'src_amazing_ribs',
    name: 'AmazingRibs.com',
    url: 'https://amazingribs.com',
    feed_url: 'https://amazingribs.com/feed/',
    type: 'rss',
    language: 'en',
    pipeline_hint: 'general-bbq',
    active: true,
  },
  {
    id: 'src_serious_eats_grilling',
    name: 'Serious Eats — Grilling',
    url: 'https://www.seriouseats.com/grilling',
    feed_url: 'https://www.seriouseats.com/feeds/all.xml',
    type: 'rss',
    language: 'en',
    pipeline_hint: 'general-bbq',
    active: true,
  },

  // ── US-Foren ──────────────────────────────────────────────────────────────
  {
    id: 'src_bbq_brethren',
    name: 'BBQ Brethren Forum',
    url: 'https://www.bbq-brethren.com/forum/',
    feed_url: undefined,
    type: 'forum',
    language: 'en',
    pipeline_hint: 'usa',
    active: false, // kein RSS-Feed → nicht scrapebar (Weg-A-Cleanup)
  },
  {
    id: 'src_smoked_meat_forums',
    name: 'The Smoked Meat Forums',
    url: 'https://www.thesmokedmeatforum.com',
    feed_url: undefined,
    type: 'forum',
    language: 'en',
    pipeline_hint: 'general-bbq',
    active: false, // kein RSS-Feed → nicht scrapebar (Weg-A-Cleanup)
  },
  {
    id: 'src_weber_kettle_club',
    name: 'Weber Kettle Club',
    url: 'https://www.weberkettle.club',
    feed_url: undefined,
    type: 'forum',
    language: 'en',
    pipeline_hint: 'equipment',
    active: false, // kein RSS-Feed → nicht scrapebar (Weg-A-Cleanup)
  },
  {
    id: 'src_big_green_egg',
    name: 'Big Green Egg EGGhead Forum',
    url: 'https://eggheadforum.com',
    feed_url: undefined,
    type: 'forum',
    language: 'en',
    pipeline_hint: 'equipment',
    active: false, // kein RSS-Feed → nicht scrapebar (Weg-A-Cleanup)
  },

  // ── Deutsche Szene & Events ───────────────────────────────────────────────
  {
    id: 'src_gbaev',
    name: 'GBAEV — Meisterschaften 2026',
    url: 'https://www.gbaev.de',
    feed_url: 'https://www.gbaev.de/feed/',
    type: 'rss',
    language: 'de',
    pipeline_hint: 'championship-2026',
    active: true,
  },
  {
    id: 'src_bbqpit',
    name: 'BBQ Pit',
    url: 'https://www.bbqpit.de',
    feed_url: 'https://www.bbqpit.de/feed/',
    type: 'rss',
    language: 'de',
    pipeline_hint: 'deutschland',
    active: true,
  },
  {
    id: 'src_grillkameraden',
    name: 'Grillkameraden',
    url: 'https://www.grillkameraden.de',
    feed_url: 'https://www.grillkameraden.de/feed/',
    type: 'rss',
    language: 'de',
    pipeline_hint: 'deutschland',
    active: true,
  },
  {
    id: 'src_bbqlove',
    name: 'BBQ Love',
    url: 'https://www.bbqlove.de',
    feed_url: 'https://www.bbqlove.de/feed/',
    type: 'rss',
    language: 'de',
    pipeline_hint: 'general-bbq',
    active: true,
  },

  // ── Queen of Fire Pipeline ────────────────────────────────────────────────
  {
    id: 'src_die_frau_am_grill',
    name: 'Die Frau am Grill',
    url: 'https://www.die-frau-am-grill.de',
    feed_url: 'https://www.die-frau-am-grill.de/feed/',
    type: 'rss',
    language: 'de',
    pipeline_hint: 'queen-of-fire',
    active: true,
  },
]

export const ACTIVE_SOURCES = SCOUT_SOURCES.filter((s) => s.active)

export function getSourceById(id: string): ScoutSource | undefined {
  return SCOUT_SOURCES.find((s) => s.id === id)
}

export function getSourcesByPipeline(hint: ScoutSource['pipeline_hint']): ScoutSource[] {
  return ACTIVE_SOURCES.filter((s) => s.pipeline_hint === hint)
}
