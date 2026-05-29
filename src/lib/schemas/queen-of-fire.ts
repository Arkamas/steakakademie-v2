// ── STEP 1B — Queen of Fire — Premium Content Schema ─────────────────────────
// Tonalität: kulinarische Präzision, Maillard-Reaktion, Sensorik, Hosting.
// Strikt KEIN: Macho-Narrative, Fleischporno-Ästhetik, übertriebene Roheit.

export type QofCategory = 'queen-of-fire'

export type QofTone =
  | 'culinary-precision'   // Maillard, Sensorik, Wissenschaft
  | 'hosting-elegance'     // Tischkultur, Erlebnis, Atmosphäre
  | 'ingredient-sourcing'  // Herkunft, Qualität, Nachhaltigkeit
  | 'pairing-artistry'     // Wein, Cocktails, non-alkoholisch

export type QofImageStyle =
  | 'daylight-editorial'   // Tageslicht, helles Setting, clean
  | 'intimate-tablescape'  // Nahaufnahme, Tischgedeck, Kerzen
  | 'process-beauty'       // Grillprozess ästhetisch, kein Chaos

export interface QofImagePrompt {
  style: QofImageStyle
  prompt_en: string          // Englisch für Bild-KI
  negative_prompt_en: string // Was NICHT generiert werden soll
  aspect_ratio: '16:9' | '1:1' | '4:5'
}

export interface QofContent {
  id: string
  category: QofCategory
  title: string
  subtitle: string
  slug: string
  tone: QofTone
  meat_cut_ref: string         // Ref auf MeatCut.id aus pairing-kb.ts
  drink_pairing_ref: string    // Ref auf Drink.id aus pairing-kb.ts
  lead_paragraph: string       // Hook — max. 2 Sätze
  body_sections: QofSection[]
  maillard_note?: string       // Wissenschafts-Box: Reaktion + Temp + Erklärung
  sensory_profile: QofSensoryProfile
  image_prompt: QofImagePrompt
  seo_title: string
  seo_description: string
  tags: string[]
  status: 'draft' | 'review' | 'published'
  created_at: string
  agent_generated: boolean
}

export interface QofSection {
  heading: string
  content: string
}

export interface QofSensoryProfile {
  aroma: string      // z.B. "Röstaromen, karamellisierte Kruste, dezente Rauchnote"
  texture: string    // z.B. "Zartes Inneres, knusprige Außenschicht"
  taste: string      // z.B. "Umami-Tiefe, Fett-Balance, leichte Süße"
  finish: string     // z.B. "Langer, rauchiger Abgang"
}

// Tonalitäts-Filter — wird vom Content-Agent geprüft vor Publikation
export const QOF_TONE_RULES = {
  forbidden_keywords: [
    'Fleischporno',
    'brutal',
    'Macho',
    'Tier',
    'blutig',
    'roh und ungefiltert',
    'für Männer',
    'echte Männer',
  ],
  required_themes: [
    'Maillard',
    'Sensorik',
    'Hosting',
    'Präzision',
    'kulinarisch',
  ],
  image_forbidden: [
    'raw bloody meat',
    'gore',
    'dirty',
    'messy',
    'aggressive',
    'masculine',
  ],
} as const
