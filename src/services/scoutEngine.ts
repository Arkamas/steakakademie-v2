// ── STEP 2B — Scout Engine ────────────────────────────────────────────────────
// Verarbeitet RSS-Feeds und HTML-Quellen.
// Output: ScoutBriefing[] — bereit für den Content-Agent.
//
// Node-kompatibel — einsetzbar in API-Routes und CLI-Skripten.

import type {
  RawArticle,
  ScoutBriefing,
  ContentPipelineCategory,
} from '@/lib/schemas/pipeline'
import type { ScoutSource } from '@/lib/schemas/pipeline'
import type { CountryCategory } from '@/lib/schemas/recipe'
import { COUNTRY_CATEGORIES } from '@/lib/schemas/recipe'
import { QOF_TONE_RULES } from '@/lib/schemas/queen-of-fire'
import { ACTIVE_SOURCES } from './scoutSources'

// ─── RSS-Feed Parser ──────────────────────────────────────────────────────────
// Minimalparser — kein externes Paket erforderlich.

interface FeedItem {
  title: string
  link: string
  description: string
  pubDate?: string
}

function parseRssXml(xml: string): FeedItem[] {
  const items: FeedItem[] = []
  const itemRegex = /<item>([\s\S]*?)<\/item>/g
  let match

  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1]
    const get = (tag: string) => {
      const m = block.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`))
      return m ? (m[1] ?? m[2] ?? '').trim() : ''
    }
    items.push({
      title: get('title'),
      link: get('link'),
      description: get('description').replace(/<[^>]+>/g, '').slice(0, 500),
      pubDate: get('pubDate'),
    })
  }
  return items
}

async function fetchFeed(source: ScoutSource): Promise<RawArticle[]> {
  if (!source.feed_url) return []

  try {
    const res = await fetch(source.feed_url, {
      headers: { 'User-Agent': 'Steakakademie-Scout/1.0' },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return []

    const xml = await res.text()
    const items = parseRssXml(xml)

    return items.slice(0, 10).map((item) => ({
      source_id: source.id,
      url: item.link,
      title: item.title,
      summary: item.description,
      published_at: item.pubDate,
      fetched_at: new Date().toISOString(),
    }))
  } catch {
    return []
  }
}

// ─── Relevanz-Scoring ─────────────────────────────────────────────────────────

const RELEVANCE_KEYWORDS: Record<string, string[]> = {
  championship: ['meisterschaft', 'championship', 'competition', 'bbq contest', 'bbq battle', '2026', 'gbaev'],
  queen_of_fire: ['frau', 'women', 'hosting', 'eleganz', 'kulinarisch', 'tischkultur', 'sensorik'],
  scientific: ['maillard', 'temperatur', 'reverse sear', 'sous vide', 'kerntemperatur', 'collagen'],
  recipe: ['rezept', 'recipe', 'zubereitung', 'marinade', 'rub', 'smoke'],
  equipment: ['grill', 'smoker', 'thermometer', 'kamado', 'weber', 'bge'],
}

const COUNTRY_SIGNALS: Record<CountryCategory, string[]> = {
  usa: ['texas', 'brisket', 'pulled pork', 'pitmaster', 'bbq trail', 'kansas city'],
  kanada: ['canadian', 'maple', 'moose', 'bison'],
  argentinien: ['asado', 'parrilla', 'gaucho', 'vacío', 'entraña'],
  brasilien: ['churrasco', 'picanha', 'rodizio', 'churrasqueiro'],
  japan: ['yakiniku', 'wagyu', 'teppanyaki', 'yakitori'],
  korea: ['kbbq', 'galbi', 'samgyeopsal', 'bulgogi'],
  australien: ['aussie bbq', 'barramundi', 'kangaroo', 'lamb chop'],
  deutschland: ['grillen', 'bratwurst', 'gbaev', 'grillmeister'],
  suedafrika: ['braai', 'boerewors', 'potjie', 'sosatie'],
  thailand: ['satay', 'moo ping', 'gai yang', 'thai grill'],
  tuerkei: ['mangal', 'kebab', 'ocakbaşı', 'adana'],
  spanien: ['chuletón', 'asador', 'txuleta', 'parrilla española'],
}

function scoreRelevance(article: RawArticle): number {
  const text = `${article.title} ${article.summary}`.toLowerCase()
  let score = 0

  for (const keywords of Object.values(RELEVANCE_KEYWORDS)) {
    score += keywords.filter((kw) => text.includes(kw.toLowerCase())).length * 1.5
  }
  for (const signals of Object.values(COUNTRY_SIGNALS)) {
    score += signals.filter((s) => text.includes(s.toLowerCase())).length * 1.2
  }

  return Math.min(10, Math.round(score * 10) / 10)
}

// ─── Kategorie-Erkennung ──────────────────────────────────────────────────────

function detectCategory(
  article: RawArticle,
  sourceHint: ContentPipelineCategory
): ContentPipelineCategory {
  const text = `${article.title} ${article.summary}`.toLowerCase()

  // Meisterschaften haben Priorität
  if (RELEVANCE_KEYWORDS.championship.some((kw) => text.includes(kw))) {
    return 'championship-2026'
  }

  // Queen of Fire Signals
  const qofHits = QOF_TONE_RULES.required_themes.filter((t) =>
    text.includes(t.toLowerCase())
  )
  if (qofHits.length >= 2 || sourceHint === 'queen-of-fire') {
    return 'queen-of-fire'
  }

  // Länder-Erkennung
  for (const country of COUNTRY_CATEGORIES) {
    const signals = COUNTRY_SIGNALS[country]
    if (signals.some((s) => text.includes(s.toLowerCase()))) {
      return country
    }
  }

  return sourceHint === 'equipment' ? 'equipment' : 'general-bbq'
}

function detectQofSignals(article: RawArticle): string[] {
  const text = `${article.title} ${article.summary}`.toLowerCase()
  return QOF_TONE_RULES.required_themes.filter((t) => text.includes(t.toLowerCase()))
}

function detectCountry(article: RawArticle): CountryCategory | undefined {
  const text = `${article.title} ${article.summary}`.toLowerCase()
  for (const country of COUNTRY_CATEGORIES) {
    if (COUNTRY_SIGNALS[country].some((s) => text.includes(s.toLowerCase()))) {
      return country
    }
  }
}

// ─── Scout-Run ────────────────────────────────────────────────────────────────

export interface ScoutRunResult {
  briefings: ScoutBriefing[]
  discarded: number
  errors: string[]
  run_at: string
}

export async function runScout(
  options: { relevanceThreshold?: number; sources?: ScoutSource[] } = {}
): Promise<ScoutRunResult> {
  const threshold = options.relevanceThreshold ?? 8
  const sources = options.sources ?? ACTIVE_SOURCES.filter((s) => s.feed_url)

  const result: ScoutRunResult = {
    briefings: [],
    discarded: 0,
    errors: [],
    run_at: new Date().toISOString(),
  }

  await Promise.allSettled(
    sources.map(async (source) => {
      try {
        const articles = await fetchFeed(source)

        for (const article of articles) {
          const score = scoreRelevance(article)

          if (score < threshold) {
            result.discarded++
            continue
          }

          const category = detectCategory(article, source.pipeline_hint)
          const qofSignals = detectQofSignals(article)
          const country = detectCountry(article)
          const isChampionship = category === 'championship-2026'

          const briefing: ScoutBriefing = {
            article,
            relevance_score: score,
            detected_category: category,
            championship_detected: isChampionship,
            country_detected: country,
            queen_of_fire_signals: qofSignals,
            recommended_action: score >= threshold ? 'generate' : 'monitor',
            briefing_notes: [
              `Quelle: ${source.name}`,
              isChampionship ? '🏆 Meisterschaft 2026 erkannt' : '',
              qofSignals.length > 0 ? `👸 QoF-Signale: ${qofSignals.join(', ')}` : '',
              country ? `🌍 Land: ${country}` : '',
            ]
              .filter(Boolean)
              .join(' | '),
            scored_at: new Date().toISOString(),
          }

          result.briefings.push(briefing)
        }
      } catch (err) {
        result.errors.push(`${source.id}: ${String(err)}`)
      }
    })
  )

  // Absteigend nach Relevanz sortieren
  result.briefings.sort((a, b) => b.relevance_score - a.relevance_score)

  return result
}

// ─── Preview-Funktion (für Tests ohne echte Feeds) ───────────────────────────

export function previewBriefing(briefing: ScoutBriefing): string {
  return [
    `[${briefing.relevance_score.toFixed(1)}/10] ${briefing.article.title}`,
    `Kategorie: ${briefing.detected_category}`,
    `Aktion: ${briefing.recommended_action}`,
    briefing.briefing_notes,
  ].join('\n')
}
