// ── STEP 3C — Publisher Agent ─────────────────────────────────────────────────
// Schreibt ContentDraft + ImageBrief als Entwurf in Supabase.
// Tabelle: content_drafts (Migration: 20260528_content_pipeline.sql)

import { createClient } from '@supabase/supabase-js'
import type { ContentDraft, ImageBrief } from '@/lib/schemas/pipeline'

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  // Service-Role ist Pflicht: dieser Agent schreibt content_drafts an RLS vorbei.
  // KEIN Fallback auf ANON_KEY — der scheitert still an RLS. Fail-fast statt fail-silent.
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url) throw new Error('NEXT_PUBLIC_SUPABASE_URL fehlt in .env.local')
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY fehlt — publisherAgent braucht Service-Role (kein ANON-Fallback)')

  return createClient(url, key, {
    auth: { persistSession: false },
  })
}

// ─── Einzel-Publish ───────────────────────────────────────────────────────────

export interface PublishResult {
  success: boolean
  draft_id: string
  supabase_id?: string
  error?: string
}

export async function publishDraft(
  draft: ContentDraft,
  imageBrief: ImageBrief
): Promise<PublishResult> {
  const supabase = getSupabaseAdmin()

  const row = {
    id: draft.id,
    source_briefing_id: draft.source_briefing_id,
    category: draft.category,
    title: draft.title,
    slug: draft.slug,
    content_body: draft.content_body,
    seo_title: draft.seo_title,
    seo_description: draft.seo_description,
    image_prompt_en: imageBrief.prompt_en,
    image_negative_prompt_en: imageBrief.negative_prompt_en,
    image_aspect_ratio: imageBrief.aspect_ratio,
    image_style_preset: imageBrief.style_preset,
    tone_check_passed: draft.tone_check_passed,
    tone_violations: draft.tone_violations,
    status: draft.status,
    generated_at: draft.generated_at,
  }

  const { data, error } = await supabase
    .from('content_drafts')
    .upsert(row, { onConflict: 'slug' })
    .select('id')
    .single()

  if (error) {
    return { success: false, draft_id: draft.id, error: error.message }
  }

  return { success: true, draft_id: draft.id, supabase_id: data?.id }
}

// ─── Batch-Publish ────────────────────────────────────────────────────────────

export interface BatchPublishResult {
  total: number
  succeeded: number
  failed: number
  results: PublishResult[]
}

export async function publishBatch(
  pairs: Array<{ draft: ContentDraft; imageBrief: ImageBrief }>
): Promise<BatchPublishResult> {
  const results = await Promise.allSettled(
    pairs.map(({ draft, imageBrief }) => publishDraft(draft, imageBrief))
  )

  const resolved = results.map((r) =>
    r.status === 'fulfilled'
      ? r.value
      : { success: false, draft_id: 'unknown', error: String((r as PromiseRejectedResult).reason) }
  )

  return {
    total: resolved.length,
    succeeded: resolved.filter((r) => r.success).length,
    failed: resolved.filter((r) => !r.success).length,
    results: resolved,
  }
}

// ─── Status-Update ────────────────────────────────────────────────────────────

export async function approveDraft(slug: string): Promise<boolean> {
  const supabase = getSupabaseAdmin()
  const { error } = await supabase
    .from('content_drafts')
    .update({ status: 'approved' })
    .eq('slug', slug)
  return !error
}

export async function getPendingDrafts() {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('content_drafts')
    .select('id, title, slug, category, status, tone_check_passed, generated_at')
    .in('status', ['draft', 'review'])
    .order('generated_at', { ascending: false })
    .limit(50)

  if (error) throw new Error(error.message)
  return data ?? []
}
