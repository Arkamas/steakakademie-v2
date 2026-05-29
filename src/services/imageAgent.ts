// ── STEP 3B — Image Agent ─────────────────────────────────────────────────────
// Generiert präzise, englischsprachige Prompts für Bild-KIs (fal.ai, Flux etc.)
// Stil wird automatisch aus der Pipeline-Kategorie abgeleitet.

import type { ContentDraft, ImageBrief } from '@/lib/schemas/pipeline'
import type { ContentPipelineCategory } from '@/lib/schemas/pipeline'

// ─── Stil-Definitionen pro Kategorie ─────────────────────────────────────────

interface StyleTemplate {
  base_style: string
  lighting: string
  composition: string
  mood: string
  negative: string
  aspect_ratio: '16:9' | '1:1' | '4:5'
}

const STYLE_TEMPLATES: Record<string, StyleTemplate> = {
  'queen-of-fire': {
    base_style:
      'editorial food photography, modern aesthetic, clean and elegant, professional food styling',
    lighting: 'bright natural daylight, soft window light, no harsh shadows',
    composition: 'clean white marble surface or light wood, minimal props, wine glass or herbs',
    mood: 'sophisticated, inviting, calm, premium dining experience',
    negative:
      'dark background, bloody raw meat, aggressive, messy, dirty, gore, masculine, chaotic, low quality',
    aspect_ratio: '4:5',
  },
  usa: {
    base_style:
      'authentic American BBQ photography, rustic wood table, smoke atmosphere, Texan pitmaster setting',
    lighting: 'warm golden hour, smoky haze, dramatic side lighting',
    composition: 'brisket on butcher paper, cast iron skillet, smoke wisps, Texas Monthly style',
    mood: 'hearty, authentic, proud, craft BBQ culture',
    negative: 'studio white background, too clean, generic, unreal',
    aspect_ratio: '16:9',
  },
  argentinien: {
    base_style: 'authentic Argentine asado photography, parrilla grill, gaucho tradition',
    lighting: 'warm fire glow, outdoor setting, natural afternoon light',
    composition: 'large cuts on iron grill, chimichurri, rustic outdoor setting',
    mood: 'passionate, traditional, social gathering, South American soul',
    negative: 'indoor sterile, modern fusion, unauthentic',
    aspect_ratio: '16:9',
  },
  japan: {
    base_style:
      'Japanese Yakiniku photography, minimal aesthetic, izakaya atmosphere, Wagyu close-up',
    lighting: 'warm intimate table lighting, soft glow from charcoal',
    composition: 'sliced Wagyu on hot iron plate, chopsticks, small bowls, Japanese tableware',
    mood: 'refined, intimate, precise, sensory focus',
    negative: 'western BBQ, messy, chaotic, dark or gory',
    aspect_ratio: '1:1',
  },
  korea: {
    base_style: 'Korean BBQ table photography, KBBQ restaurant setting, banchan side dishes',
    lighting: 'warm restaurant ambient, built-in grill glow',
    composition: 'meat on table grill, Korean side dishes, ssam wraps being assembled',
    mood: 'social, vibrant, communal dining, fun',
    negative: 'empty table, no context, sterile studio',
    aspect_ratio: '16:9',
  },
  brasilien: {
    base_style: 'Brazilian churrasco photography, rodizio style, Picanha on sword',
    lighting: 'outdoor fire light, warm evening glow',
    composition: 'large picanha on skewer, traditional churrascaria setting, green herb',
    mood: 'festive, generous, proud, South American vibrancy',
    negative: 'indoors sterile, small portions, no fire context',
    aspect_ratio: '16:9',
  },
  suedafrika: {
    base_style: 'South African Braai photography, open hardwood fire, authentic outdoor setting',
    lighting: 'natural fire and sunset light, warm orange tones',
    composition: 'boerewors on open fire grate, outdoor braai setup, sunset background',
    mood: 'communal, authentic, rugged, natural',
    negative: 'electric grill, indoor, studio, artificial',
    aspect_ratio: '16:9',
  },
  'championship-2026': {
    base_style:
      'BBQ competition photography, championship event, awards ceremony, team in aprons',
    lighting: 'outdoor event lighting, bright daylight, trophy shine',
    composition: 'BBQ team presenting winning dish, judges at table, banner in background',
    mood: 'competitive, proud, community, excellence',
    negative: 'empty, no people, studio',
    aspect_ratio: '16:9',
  },
  'general-bbq': {
    base_style:
      'professional BBQ food photography, grill marks, perfect sear, appetizing presentation',
    lighting: 'natural light with subtle warmth, no harsh flash',
    composition: 'grilled meat center frame, fresh herbs, clean plate, minimal background',
    mood: 'appetizing, professional, inspiring, craft',
    negative: 'raw bloody meat, messy, low quality, dark and gloomy',
    aspect_ratio: '16:9',
  },
  equipment: {
    base_style: 'product photography for BBQ equipment, clean background, detail shot',
    lighting: 'studio quality, even lighting, no shadows',
    composition: 'grill or tool in center, lifestyle context in background',
    mood: 'quality, precision, desirable',
    negative: 'dirty, used, damaged, cheap looking',
    aspect_ratio: '1:1',
  },
}

const DEFAULT_STYLE = STYLE_TEMPLATES['general-bbq']

// ─── Prompt-Builder ───────────────────────────────────────────────────────────

function buildImagePrompt(draft: ContentDraft): { prompt: string; negative: string } {
  const style = STYLE_TEMPLATES[draft.category] ?? DEFAULT_STYLE

  // Verwende den vom Content-Agent gelieferten Prompt als Basis, ergänze Stil
  const baseFromDraft = draft.image_prompt_en
    ? `${draft.image_prompt_en}, `
    : ''

  const prompt = [
    baseFromDraft,
    style.base_style,
    style.lighting,
    style.composition,
    style.mood,
    '4K, photorealistic, high detail, professional photography',
  ]
    .filter(Boolean)
    .join(', ')

  return { prompt, negative: style.negative }
}

// ─── Haupt-Funktion ───────────────────────────────────────────────────────────

export function generateImageBrief(draft: ContentDraft): ImageBrief {
  const style = STYLE_TEMPLATES[draft.category] ?? DEFAULT_STYLE
  const { prompt, negative } = buildImagePrompt(draft)

  return {
    draft_id: draft.id,
    prompt_en: prompt,
    negative_prompt_en: negative,
    style_preset: draft.category,
    aspect_ratio: style.aspect_ratio,
    generated_at: new Date().toISOString(),
  }
}

// ─── Batch-Varianten für Queen of Fire (3 Stile) ─────────────────────────────

export function generateQofImageVariants(draft: ContentDraft): ImageBrief[] {
  const styles: Array<{ suffix: string; composition: string; ratio: '16:9' | '1:1' | '4:5' }> = [
    {
      suffix: 'editorial hero',
      composition: 'wide shot, food on elegant table, full scene composition',
      ratio: '16:9',
    },
    {
      suffix: 'detail close-up',
      composition: 'macro close-up of meat texture, crust detail, bokeh background',
      ratio: '1:1',
    },
    {
      suffix: 'hosting scene',
      composition: 'table setting with multiple dishes, candles, wine, hosting atmosphere',
      ratio: '4:5',
    },
  ]

  return styles.map((s) => ({
    draft_id: draft.id,
    prompt_en: [
      draft.image_prompt_en,
      STYLE_TEMPLATES['queen-of-fire'].base_style,
      STYLE_TEMPLATES['queen-of-fire'].lighting,
      s.composition,
      s.suffix,
      '4K, photorealistic, premium food magazine quality',
    ]
      .filter(Boolean)
      .join(', '),
    negative_prompt_en: STYLE_TEMPLATES['queen-of-fire'].negative,
    style_preset: `queen-of-fire-${s.suffix.replace(' ', '-')}`,
    aspect_ratio: s.ratio,
    generated_at: new Date().toISOString(),
  }))
}
