// ── STEP 1A — Rezept-Schema + 12 internationale Länder-Kategorien ────────────

export const COUNTRY_CATEGORIES = [
  'usa',
  'kanada',
  'argentinien',
  'brasilien',
  'japan',
  'korea',
  'australien',
  'deutschland',
  'suedafrika',
  'thailand',
  'tuerkei',
  'spanien',
] as const

export type CountryCategory = (typeof COUNTRY_CATEGORIES)[number]

export const COUNTRY_META: Record<
  CountryCategory,
  { label: string; style: string; signatureCuts: string[]; culturalContext: string }
> = {
  usa: {
    label: 'USA & Texas BBQ',
    style: 'Low & Slow Smoke',
    signatureCuts: ['Brisket', 'Baby Back Ribs', 'Pulled Pork'],
    culturalContext: 'Texas Pitmaster-Tradition, Kansas City Style, Carolina Vinegar',
  },
  kanada: {
    label: 'Kanada',
    style: 'Maple-Smoke & Open Fire',
    signatureCuts: ['Moose Steak', 'Bison Ribeye', 'Salmon Plank'],
    culturalContext: 'First Nations Feuertechniken, Wildgrill, Maple-Glazing',
  },
  argentinien: {
    label: 'Argentinien — Asado',
    style: 'Asado al Asador',
    signatureCuts: ['Asado de Tira', 'Vacío', 'Entraña', 'Mollejas'],
    culturalContext: 'Parrilla-Kultur, Gaucho-Tradition, kein Rauch — nur Feuer',
  },
  brasilien: {
    label: 'Brasilien — Churrasco',
    style: 'Rodizio Churrasco',
    signatureCuts: ['Picanha', 'Fraldinha', 'Costela'],
    culturalContext: 'Churrasqueiro-Handwerk, Rotisserie-Tradition, Groß-Format-Cuts',
  },
  japan: {
    label: 'Japan — Yakiniku',
    style: 'Tischgrill & Präzision',
    signatureCuts: ['Wagyu Kalbi', 'Tan (Zunge)', 'Harami', 'Rosu'],
    culturalContext: 'Yakiniku-Kultur, Wagyu A5-Ästhetik, minimale Würzung',
  },
  korea: {
    label: 'Korea — KBBQ',
    style: 'Banchan & Tischgrill',
    signatureCuts: ['Galbi', 'Samgyeopsal', 'Bulgogi'],
    culturalContext: 'Ssam-Kultur, fermentierte Begleiter, Gruppenritual',
  },
  australien: {
    label: 'Australien — Aussie BBQ',
    style: 'Direct Grill & Bush Tucker',
    signatureCuts: ['Lamb Chops', 'Kangaroo Fillet', 'Barramundi', 'Prawns'],
    culturalContext: 'Backyard BBQ-Kultur, Indigenous Cooking, Coastal Fusion',
  },
  deutschland: {
    label: 'Deutschland — Grillen',
    style: 'Direktgrill & Regional',
    signatureCuts: ['Schweinenacken', 'Rostbratwurst', 'Rindersteak'],
    culturalContext: 'GBAEV-Meisterschaftskultur, Rheinischer Sauerbraten, Regionales',
  },
  suedafrika: {
    label: 'Südafrika — Braai',
    style: 'Open-Fire Braai',
    signatureCuts: ['Boerewors', 'Lamb Chops', 'Sosaties'],
    culturalContext: 'Soziales Braai-Ritual, Holzkohle-Pflicht, Potjiekos-Tradition',
  },
  thailand: {
    label: 'Thailand — Thai Grill',
    style: 'Satay & Moo Ping',
    signatureCuts: ['Moo Ping', 'Gai Yang', 'Satay'],
    culturalContext: 'Straßen-Grill-Kultur, Kräuter-Marinaden, Charcoal-Skewer',
  },
  tuerkei: {
    label: 'Türkei — Mangal',
    style: 'Mangal & Ocakbaşı',
    signatureCuts: ['Adana Kebab', 'Kuzu Şiş', 'Beyti'],
    culturalContext: 'Ocakbaşı-Tradition, Lammkultur, Holzkohle-Mangal',
  },
  spanien: {
    label: 'Spanien — Asador',
    style: 'Asador & Parrilla',
    signatureCuts: ['Chuletón de Buey', 'Lechazo', 'Txuleta'],
    culturalContext: 'Baskenland-Asador, Galicisches Rind, offenes Feuer',
  },
}

export type RecipeDifficulty = 'leicht' | 'mittel' | 'fortgeschritten'
export type RecipeStatus = 'draft' | 'review' | 'published'

export interface RecipeContent {
  id: string
  title: string
  slug: string
  country: CountryCategory
  cut_ref: string
  drink_pairing_ref?: string
  description: string
  ingredients: string[]
  method: string[]
  cooking_time_min: number
  difficulty: RecipeDifficulty
  temperature_c?: number
  image_prompt: string
  tags: string[]
  status: RecipeStatus
  created_at: string
  source_url?: string
  agent_generated: boolean
}
