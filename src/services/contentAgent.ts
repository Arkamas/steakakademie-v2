// ── STEP 3A — Content Agent ───────────────────────────────────────────────────
// Nimmt ein ScoutBriefing → generiert ContentDraft via Claude.
// Bei Queen of Fire: strikter Tonalitäts-Filter (QOF_TONE_RULES).

import Anthropic from '@anthropic-ai/sdk'
import type { ScoutBriefing, ContentDraft } from '@/lib/schemas/pipeline'
import { QOF_TONE_RULES } from '@/lib/schemas/queen-of-fire'
import { COUNTRY_META } from '@/lib/schemas/recipe'
import type { CountryCategory } from '@/lib/schemas/recipe'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// ─── System-Prompts pro Kategorie ─────────────────────────────────────────────

function buildSystemPrompt(briefing: ScoutBriefing): string {
  if (briefing.detected_category === 'queen-of-fire') {
    return `Du bist Chefredakteurin für das Premium-Editorial "Queen of Fire" auf steakakademie.de.

Deine Stimme: Kulinarische Präzision trifft elegantes Hosting. Du schreibst über Fleisch wie eine Sommelière über Wein.

PFLICHT-THEMEN (mindestens 2 pro Text):
${QOF_TONE_RULES.required_themes.map((t) => `- ${t}`).join('\n')}

ABSOLUT VERBOTEN:
${QOF_TONE_RULES.forbidden_keywords.map((k) => `- "${k}"`).join('\n')}

Format-Regeln:
- Einstieg: 2 Sätze Hook ohne Floskeln
- Wissenschafts-Box: Maillard-Reaktion mit konkreten Temperaturen
- Sensorisches Profil: Aroma → Textur → Geschmack → Abgang
- Ton: selbstsicher, präzise, niemals herablassend`
  }

  if (briefing.detected_category === 'championship-2026') {
    return `Du bist Redakteur für Wettkampf-BBQ auf steakakademie.de.
Schreibe einen strukturierten Event-Bericht über Meisterschaften 2026.
Fokus: Datum, Ort, Kategorien, Teilnahme-Infos, warum es relevant ist.
Ton: enthusiastisch, informativ, community-nah.`
  }

  const country = briefing.country_detected
  if (country && COUNTRY_META[country]) {
    const meta = COUNTRY_META[country]
    return `Du bist Experte für internationale Grillkulturen auf steakakademie.de.
Schreibe über die BBQ-Tradition aus: ${meta.label}
Grillstil: ${meta.style}
Signature Cuts: ${meta.signatureCuts.join(', ')}
Kultureller Kontext: ${meta.culturalContext}

Ton: leidenschaftlich, respektvoll gegenüber der Kultur, lehrreich.
Immer: konkrete Temperaturen, Techniken, Schnitte nennen.`
  }

  return `Du bist Senior-Redakteur für BBQ & Grill auf steakakademie.de.
Schreibe einen informativen, praxisnahen Artikel.
Ton: direkt, leidenschaftlich, expertenhaft.
Immer: Temperaturen, Techniken und Produkt-Empfehlungen einbauen.`
}

// ─── Tonalitäts-Check ─────────────────────────────────────────────────────────

function checkTone(content: string, category: string): { passed: boolean; violations: string[] } {
  if (category !== 'queen-of-fire') return { passed: true, violations: [] }

  const lower = content.toLowerCase()
  const violations = QOF_TONE_RULES.forbidden_keywords.filter((kw) =>
    lower.includes(kw.toLowerCase())
  )
  return { passed: violations.length === 0, violations }
}

// ─── Slug-Generator ───────────────────────────────────────────────────────────

function toSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 80)
}

// ─── Haupt-Funktion ───────────────────────────────────────────────────────────

export async function generateContentDraft(briefing: ScoutBriefing): Promise<ContentDraft> {
  const systemPrompt = buildSystemPrompt(briefing)

  const userPrompt = `Basierend auf diesem Briefing, erstelle einen vollständigen Artikel:

Titel-Idee: ${briefing.article.title}
Quelle: ${briefing.article.url}
Zusammenfassung: ${briefing.article.summary}
Kategorie: ${briefing.detected_category}
Briefing-Notizen: ${briefing.briefing_notes}

Antworte NUR als JSON mit dieser Struktur:
{
  "title": "...",
  "content_body": "... (800-1200 Wörter, Markdown)",
  "seo_title": "... (max 60 Zeichen)",
  "seo_description": "... (max 160 Zeichen)",
  "image_prompt_en": "... (englischer Prompt für Bild-KI)"
}`

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    thinking: { type: 'adaptive' },
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  })

  const textBlock = response.content.find((b) => b.type === 'text')
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('Kein Text in Claude-Antwort')
  }

  let parsed: {
    title: string
    content_body: string
    seo_title: string
    seo_description: string
    image_prompt_en: string
  }

  try {
    const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('Kein JSON gefunden')
    parsed = JSON.parse(jsonMatch[0])
  } catch {
    throw new Error(`JSON-Parse fehlgeschlagen: ${textBlock.text.slice(0, 200)}`)
  }

  const { passed, violations } = checkTone(parsed.content_body, briefing.detected_category)

  return {
    id: `draft_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    source_briefing_id: briefing.article.url,
    category: briefing.detected_category,
    title: parsed.title,
    slug: toSlug(parsed.title),
    content_body: parsed.content_body,
    seo_title: parsed.seo_title,
    seo_description: parsed.seo_description,
    image_prompt_en: parsed.image_prompt_en,
    tone_check_passed: passed,
    tone_violations: violations,
    status: passed ? 'draft' : 'review',
    generated_at: new Date().toISOString(),
  }
}
