// ── STEP 1C — Agenten-Pipeline Typen ─────────────────────────────────────────

import type { CountryCategory } from './recipe'
import type { QofCategory } from './queen-of-fire'

// ─── Scout-Agent ──────────────────────────────────────────────────────────────

export type ContentPipelineCategory =
  | CountryCategory
  | QofCategory
  | 'championship-2026'   // GBAEV / Meisterschaften automatisch erkannt
  | 'general-bbq'
  | 'equipment'
  | 'discard'

export interface ScoutSource {
  id: string
  name: string
  url: string
  feed_url?: string          // RSS/Atom-URL falls vorhanden
  type: 'rss' | 'html' | 'forum' | 'json'
  language: 'de' | 'en'
  pipeline_hint: ContentPipelineCategory // Vorgeschlagene Zuweisung
  active: boolean
}

export interface RawArticle {
  source_id: string
  url: string
  title: string
  summary: string
  published_at?: string
  raw_content?: string
  fetched_at: string
}

// ─── Bewertungs-Briefing (Scout-Output) ──────────────────────────────────────

export interface ScoutBriefing {
  article: RawArticle
  relevance_score: number        // 0–10
  detected_category: ContentPipelineCategory
  championship_detected: boolean // Meisterschaft 2026?
  country_detected?: CountryCategory
  queen_of_fire_signals: string[] // Keywords die QoF triggern
  recommended_action: 'generate' | 'monitor' | 'discard'
  briefing_notes: string
  scored_at: string
}

// ─── Content-Agent Output ─────────────────────────────────────────────────────

export interface ContentDraft {
  id: string
  source_briefing_id: string
  category: ContentPipelineCategory
  title: string
  slug: string
  content_body: string
  seo_title: string
  seo_description: string
  image_prompt_en: string
  tone_check_passed: boolean
  tone_violations: string[]   // Verbotene Keywords gefunden
  status: 'draft' | 'review' | 'approved' | 'rejected'
  generated_at: string
}

// ─── Image-Agent Output ───────────────────────────────────────────────────────

export interface ImageBrief {
  draft_id: string
  prompt_en: string
  negative_prompt_en: string
  style_preset: string
  aspect_ratio: '16:9' | '1:1' | '4:5'
  generated_at: string
}

// ─── Pipeline-Run Log ─────────────────────────────────────────────────────────

export type PipelineStage = 'scout' | 'content' | 'image' | 'publish'

export interface PipelineRun {
  run_id: string
  started_at: string
  completed_at?: string
  stage: PipelineStage
  articles_fetched: number
  briefings_created: number
  drafts_generated: number
  drafts_published: number
  errors: string[]
  status: 'running' | 'completed' | 'failed'
}
