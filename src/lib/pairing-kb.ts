export type FatContent = 'low' | 'medium' | 'high'
export type FlavorIntensity = 'mild' | 'medium' | 'strong'
export type Acidity = 'low' | 'medium' | 'high'
export type Tannins = 'low' | 'medium' | 'high'
export type Body = 'light' | 'medium' | 'full'

export interface MeatCut {
  id: string
  name: string
  fat_content: FatContent
  flavor_intensity: FlavorIntensity
  ideal_preparation: string[]
  characteristics: string
}

export interface Drink {
  id: string
  name: string
  type: string
  acidity: Acidity
  tannins: Tannins
  body: Body
  pairing_notes: string
}

export interface PairingRule {
  meat_fat: FatContent
  recommendation: string[]
  reasoning: string
}

export interface SteakakademieKB {
  meats: MeatCut[]
  drinks: Drink[]
  pairing_logic: { rules: PairingRule[] }
}

export const kb: SteakakademieKB = {
  meats: [
    {
      id: 'cut_001',
      name: 'Ribeye',
      fat_content: 'high',
      flavor_intensity: 'strong',
      ideal_preparation: ['Grillen', 'Reverse Sear'],
      characteristics: 'Hoher Fettanteil, ausgeprägter Eigengeschmack',
    },
  ],

  drinks: [
    {
      id: 'drink_001',
      name: 'Barolo',
      type: 'Rotwein',
      acidity: 'medium',
      tannins: 'high',
      body: 'full',
      pairing_notes:
        'Die hohen Tannine schneiden durch das Fett, die Säure balanciert die Intensität.',
    },
  ],

  pairing_logic: {
    rules: [
      {
        meat_fat: 'high',
        recommendation: ['high_tannin', 'high_acidity'],
        reasoning: 'Fett benötigt Struktur (Tannin) oder Säure zum Ausgleich.',
      },
    ],
  },
}

export function getPairingsForCut(cutId: string): Drink[] {
  const cut = kb.meats.find((m) => m.id === cutId)
  if (!cut) return []

  const rule = kb.pairing_logic.rules.find((r) => r.meat_fat === cut.fat_content)
  if (!rule) return []

  return kb.drinks.filter((d) => {
    return rule.recommendation.some((rec) => {
      if (rec === 'high_tannin') return d.tannins === 'high'
      if (rec === 'high_acidity') return d.acidity === 'high'
      if (rec === 'low_tannin') return d.tannins === 'low'
      if (rec === 'low_acidity') return d.acidity === 'low'
      return false
    })
  })
}
