// Regressionstest fuer den Rezept-Agenten.
//
// Anlass: Lauf #100 (14.09.2026) scheiterte an „Zu wenige Schritte". Der
// Schritt-Parser trennte mit split(' | ') und verlangte damit Leerzeichen um
// die Pipe; schrieb das Modell 'Titel|Dauer|Text', fiel der Schritt weg. Die
// Zutaten daneben wurden schon immer mit split('|') gelesen — dieselbe Datei,
// zwei Strenge-Grade, ein stiller Ausfall der Tagesproduktion.
import { describe, it, expect } from 'vitest'
import { parseStructuredText, validate } from './recipe-agent.mjs'

const KOPF = `TITLE: Yakitori Negima
DESCRIPTION: Testbeschreibung fuer den Parser
IMAGE_ALT: Spiesse ueber Glut
LAND: Japan
PREP_TIME: PT25M
COOK_TIME: PT10M
TOTAL_TIME: PT35M
SERVINGS: 4

INGREDIENTS:
- 600 | g | Haehnchenschenkel | gewuerfelt
- 4 | Stangen | Negi-Lauch
- 100 | ml | Sojasauce
- 100 | ml | Mirin
- 2 | EL | Zucker

STEPS:
`

const SCHRITT_FORMATE = {
  'Leerzeichen um die Pipe':   '1. Tare | 15 Min | Einkochen bis sirupartig. | Rest aufheben\n2. Spiesse | 10 Min | Abwechselnd aufziehen. | Wassern',
  'ohne Leerzeichen':          '1. Tare|15 Min|Einkochen bis sirupartig.|Rest aufheben\n2. Spiesse|10 Min|Abwechselnd aufziehen.|Wassern',
  'gemischte Abstaende':       '1. Tare |15 Min| Einkochen bis sirupartig.  |Rest aufheben\n2. Spiesse   |  10 Min |Abwechselnd aufziehen.',
  'Klammer-Nummerierung':      '1) Tare | 15 Min | Einkochen bis sirupartig.\n2) Spiesse | 10 Min | Abwechselnd aufziehen.',
  // Lauf #101: „Zu wenige Schritte" trotz Trennzeichen-Fix. Seitdem entscheidet
  // nicht mehr die Nummerierung, ob eine Zeile ein Schritt ist, sondern die Pipes.
  'Spiegelstriche':            '- Tare | 15 Min | Einkochen bis sirupartig.\n- Spiesse | 10 Min | Abwechselnd aufziehen.',
  'Sternchen':                 '* Tare | 15 Min | Einkochen bis sirupartig.\n* Spiesse | 10 Min | Abwechselnd aufziehen.',
  'ganz ohne Aufzaehlung':     'Tare | 15 Min | Einkochen bis sirupartig.\nSpiesse | 10 Min | Abwechselnd aufziehen.',
}

const SEED = {
  slug: 'yakitori-negima', kategorie: 'fleisch', difficulty: 'Mittel',
  meatType: 'Haehnchenschenkel', cookingMethod: 'Direkt',
}

describe('parseStructuredText — Schritte', () => {
  for (const [name, steps] of Object.entries(SCHRITT_FORMATE)) {
    it(`liest ${name}`, () => {
      const daten = parseStructuredText(KOPF + steps)
      expect(daten.steps).toHaveLength(2)
      expect(daten.steps[0].title).toBe('Tare')
      expect(daten.steps[0].duration).toBe('15 Min')
      expect(daten.steps[0].description).toBe('Einkochen bis sirupartig.')
    })
  }

  // Lauf #102: vier von fuenf Titeln kamen als "2. Spiesse bestuecken" an.
  it('streift Nummern und Fettmarkierung vom Titel — auch mehrfach', () => {
    const daten = parseStructuredText(KOPF +
      '1. Tare | 15 Min | Einkochen.\n' +
      '- 2. Spiesse | 10 Min | Aufziehen.\n' +
      '3. **3. Grillen** | 6 Min | Wenden.\n' +
      '**4.** Ruhen | 2 Min | Warten. | Tipp mit 5 Minuten')
    expect(daten.steps.map(s => s.title)).toEqual(['Tare', 'Spiesse', 'Grillen', 'Ruhen'])
    expect(daten.steps[3].tip).toBe('Tipp mit 5 Minuten')
  })

  it('haelt ein | im Tipp zusammen, statt es abzuschneiden', () => {
    const daten = parseStructuredText(KOPF + '1. Tare | 15 Min | Einkochen. | Variante A | Variante B\n2. Spiesse | 10 Min | Aufziehen.')
    expect(daten.steps[0].tip).toBe('Variante A | Variante B')
  })

  it('liest Zutaten unabhaengig vom Pipe-Abstand', () => {
    const daten = parseStructuredText(KOPF + SCHRITT_FORMATE['ohne Leerzeichen'])
    expect(daten.ingredients).toHaveLength(5)
    expect(daten.ingredients[0]).toMatchObject({ amount: 600, unit: 'g', name: 'Haehnchenschenkel' })
  })
})

describe('validate', () => {
  it('laesst einen vollstaendigen Datensatz durch', () => {
    const daten = parseStructuredText(KOPF + SCHRITT_FORMATE['ohne Leerzeichen'])
    daten.image = '/images/rezepte/yakitori-negima.jpg'
    daten.kategorie = SEED.kategorie
    daten.meatType = SEED.meatType
    daten.cookingMethod = SEED.cookingMethod
    daten.difficulty = SEED.difficulty
    // Zweiter Schritt reicht der Mindestanforderung; mehr braucht validate nicht.
    expect(validate(daten, SEED)).toEqual([])
  })

  it('meldet fehlendes land — Pflichtfeld seit Stichtag 18.08.2026', () => {
    const daten = parseStructuredText(KOPF.replace('LAND: Japan\n', '') + SCHRITT_FORMATE['ohne Leerzeichen'])
    daten.image = '/images/rezepte/x.jpg'
    expect(validate(daten, SEED)).toContain('Pflichtfeld fehlt: land')
  })

  it('meldet zu wenige Schritte — der Fehler aus Lauf #100', () => {
    const daten = parseStructuredText(KOPF + '1. Tare | 15 Min | Einkochen.')
    daten.image = '/images/rezepte/x.jpg'
    expect(validate(daten, SEED)).toContain('Zu wenige Schritte')
  })
})
