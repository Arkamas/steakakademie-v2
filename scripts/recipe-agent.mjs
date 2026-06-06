#!/usr/bin/env node
/**
 * Steakakademie Recipe Agent
 *
 * Generiert vollständige Rezept-MDX-Dateien via Claude und schreibt sie nach content/rezepte/.
 *
 * Pipeline:
 *   1. SEED     — Definierte Rezept-Liste als Startpunkt
 *   2. CACHE    — Bereits generierte Rezepte werden übersprungen
 *   3. GENERATE — Claude (Sonnet) generiert strukturiertes JSON für jedes Rezept
 *   4. WRITE    — MDX-Datei nach content/rezepte/<slug>.mdx
 *
 * Usage:
 *   node scripts/recipe-agent.mjs            # Nur neue Rezepte generieren
 *   node scripts/recipe-agent.mjs --dry-run  # Vorschau ohne Datei-Schreibzugriff
 *   node scripts/recipe-agent.mjs --force    # Alle Rezepte neu generieren
 *   node scripts/recipe-agent.mjs --slug brisket-low-slow  # Einzelnes Rezept
 */

import { anthropic } from '@ai-sdk/anthropic'
import { generateText } from 'ai'
import { readFile, writeFile, mkdir, access } from 'fs/promises'
import { existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT       = join(__dirname, '..')
const REZEPTE    = join(ROOT, 'content', 'rezepte')
const CACHE_FILE = join(REZEPTE, '.recipe-cache.json')

dotenv.config({ path: join(ROOT, '.env.local') })

const DRY_RUN    = process.argv.includes('--dry-run')
const FORCE      = process.argv.includes('--force')
const SLUG_ONLY  = process.argv.includes('--slug')
  ? process.argv[process.argv.indexOf('--slug') + 1]
  : null

const TODAY = new Date().toISOString().split('T')[0]

// ─── FARB-UTILS ───────────────────────────────────────────────────────────────

const c = {
  green:  s => `\x1b[32m${s}\x1b[0m`,
  yellow: s => `\x1b[33m${s}\x1b[0m`,
  red:    s => `\x1b[31m${s}\x1b[0m`,
  bold:   s => `\x1b[1m${s}\x1b[0m`,
  dim:    s => `\x1b[2m${s}\x1b[0m`,
}

// ─── SEED-REZEPTE ─────────────────────────────────────────────────────────────
// Alle Rezepte die der Agent generieren soll. Neue Einträge werden automatisch
// beim nächsten Build/Dev aufgenommen.

const SEED_RECIPES = [
  // ── FLEISCH ─────────────────────────────────────────────────────────────────
  {
    slug:          'brisket-low-slow',
    kategorie:     'fleisch',
    title:         'Texas Brisket Low & Slow: Das 14-Stunden-Protokoll',
    meatType:      'Brisket',
    cookingMethod: 'Low & Slow',
    difficulty:    'Fortgeschritten',
    concept:       'Klassisches Texas Brisket im Offset-Smoker. Packer Cut, 14h bei 110°C, Aaron Franklins Philosophie: nur Salz und Pfeffer. Bark-Bildung, Stall-Phase, Texas Crutch optional. Schwerpunkt: Kollagen-Umwandlung und Plateauphase.',
  },
  {
    slug:          'pulled-pork-boston-butt',
    kategorie:     'fleisch',
    title:         'Pulled Pork vom Smoker: 12 Stunden, kein Kompromiss',
    meatType:      'Schweineschulter',
    cookingMethod: 'Low & Slow',
    difficulty:    'Mittel',
    concept:       'Boston Butt (Schweineschulter ohne Knochen, ca. 2,5 kg) im Smoker bei 110°C. Overnight-Rub, Apfelessig-Spritz, Texas Crutch bei 74°C Kerntemperatur. Ziel 93°C. Methode zum Zerrupfen, Bone-Test.',
  },
  {
    slug:          'tomahawk-reverse-sear',
    kategorie:     'fleisch',
    title:         'Tomahawk Reverse Sear: 900-Grad-Finish oder Gusseisen',
    meatType:      'Tomahawk Steak',
    cookingMethod: 'Reverse Sear',
    difficulty:    'Mittel',
    concept:       '1 kg Tomahawk Steak, 5 cm Dicke. Reverse Sear: Backofen 100°C bis Kern 48°C, dann finales Sear in der Gusseisenpfanne oder Oberhitzegrill bei 900°C. Knochenhandling, Garadvantage durch Knochen als Isolator.',
  },
  {
    slug:          't-bone-direktgrill',
    kategorie:     'fleisch',
    title:         'T-Bone auf dem Direktgrill: 3-Zonen-Technik',
    meatType:      'T-Bone Steak',
    cookingMethod: 'Direktgrill',
    difficulty:    'Einfach',
    concept:       'T-Bone besitzt zwei unterschiedliche Muskeln (Filet + Rumpsteak) die verschiedene Garzeiten benötigen. 3-Zonen-Grill-Setup mit direkter und indirekter Hitze. Filetseite zur schwächeren Zone, Rumpsteak zur heißen.',
  },
  {
    slug:          'smash-burger',
    kategorie:     'fleisch',
    title:         'Smash Burger: Die Wissenschaft des perfekten Crusts',
    meatType:      'Rinderhackfleisch',
    cookingMethod: 'Smash-Technik',
    difficulty:    'Einfach',
    concept:       '80/20 Rinderhack (selbst gewolft oder Metzger). Gusseisenpfanne auf Maximum, keine Fettzugabe. Balls formen, flach drücken auf 1 cm, 90 Sekunden je Seite. American Cheese für den Melt. Das Gegenteil von "zartem Burger".',
  },
  // ── BEILAGEN ────────────────────────────────────────────────────────────────
  {
    slug:          'smoked-baked-potatoes',
    kategorie:     'beilagen',
    title:         'Smoked Baked Potatoes: Die Kartoffel aus dem Smoker',
    meatType:      'Kartoffel',
    cookingMethod: 'Smoker',
    difficulty:    'Einfach',
    concept:       'Festkochende Kartoffeln direkt in den Smoker, 2h bei 135°C mit Hickory-Holz. Keine Alufolie. Außen knusprig, innen weich, mit Rauchgeschmack durchzogen. Toppings: Saure Sahne, Schnittlauch, geriebenem Cheddar.',
  },
  {
    slug:          'texas-coleslaw',
    kategorie:     'beilagen',
    title:         'Texas Coleslaw: Der Klassiker ohne Süßlichkeit',
    meatType:      'Kohl',
    cookingMethod: 'Kalt mariniert',
    difficulty:    'Einfach',
    concept:       'Kein Zucker, kein Miracel Whip. Weißkohl fein hobeln, Salzziehen 30 Min., ausdrücken. Dressing: Apfelessig, Dijon, Mayonnaise, Sellerie-Salz, schwarzer Pfeffer. Muss 2h ziehen. Kontrastiert fette BBQ-Fleischgerichte.',
  },
  {
    slug:          'mac-and-cheese-smoker',
    kategorie:     'beilagen',
    title:         'Mac & Cheese vom Smoker: Cheddar-Kruste und Rauch',
    meatType:      'Pasta',
    cookingMethod: 'Smoker',
    difficulty:    'Mittel',
    concept:       'Selbstgemachte Käsesauce (Mehlschwitze, Vollmilch, Cheddar, Gruyère), Macaroni al dente. In Gusseisen im Smoker 45 Min. bei 150°C. Pankobrösel-Kruste. Leichter Hickory-Rauch als Tiefe.',
  },
  // ── SAUCEN & RUBS ───────────────────────────────────────────────────────────
  {
    slug:          'texas-dry-rub',
    kategorie:     'saucen-rubs',
    title:         'Texas Dry Rub: Die Franklin BBQ Formel',
    meatType:      'Gewürzmischung',
    cookingMethod: 'Kalt mischen',
    difficulty:    'Einfach',
    concept:       'Aaron Franklins Grundprinzip: 50% grobes Meersalz, 50% schwarzer Pfeffer (grob gemahlen). Kein Zucker, kein Paprika, kein Knoblauch. Erklärung warum die Einfachheit die Bark-Bildung maximiert. Variationen für Ribs und Chicken.',
  },
  {
    slug:          'kansas-city-bbq-sauce',
    kategorie:     'saucen-rubs',
    title:         'Kansas City BBQ Sauce: Die süß-rauchige Klassikerin',
    meatType:      'Sauce',
    cookingMethod: 'Einkochen',
    difficulty:    'Einfach',
    concept:       'Tomatenmark-Basis, brauner Zucker, Apfelessig, Worcestershire, Liquid Smoke, Chipotle. 20 Min. einkochen. Dickere Konsistenz als Carolina-Saucen. Klassisch für Ribs und Pulled Pork. Sterile Aufbewahrung 4 Wochen.',
  },
  {
    slug:          'carolina-mustard-sauce',
    kategorie:     'saucen-rubs',
    title:         'Carolina Mustard Sauce: Die gelbe BBQ-Säure',
    meatType:      'Sauce',
    cookingMethod: 'Einkochen',
    difficulty:    'Einfach',
    concept:       'Typisch South Carolina. Senf-Basis (gelber Senf + Dijon), Apfelessig, brauner Zucker, Worcestershire, Tabasco. 10 Min. köcheln. Keine Tomaten. Perfekt zu Pulled Pork und Ribs. Erklärt die regionale BBQ-Sauce-Geografie der USA.',
  },
  // ── DESSERTS ────────────────────────────────────────────────────────────────
  {
    slug:          'gegrillter-pfirsich-bourbon',
    kategorie:     'desserts',
    title:         'Gegrillter Pfirsich mit Bourbon-Karamell-Glasur',
    meatType:      'Pfirsich',
    cookingMethod: 'Direktgrill',
    difficulty:    'Einfach',
    concept:       'Reife Pfirsiche halbiert, Kernhöhle mit Bourbon-Butter-Honig füllen. Direktgrill 5 Min. bis Grill-Marks entstehen. Karamellisierung durch die Hitze. Vanilleeis dazu. Das klassische Abschluss-Dessert nach einem BBQ.',
  },
  // ── WINE & SPIRITS ──────────────────────────────────────────────────────────
  {
    slug:          'bourbon-brisket-pairing',
    kategorie:     'wine-spirits',
    title:         'Bourbon zum Brisket: Die Wissenschaft des Rauch-Pairings',
    meatType:      'Pairing-Guide',
    cookingMethod: 'Tasting',
    difficulty:    'Mittel',
    concept:       'Warum Bourbon und Brisket chemisch zusammenpassen: Vanillin aus Eichenfässern resoniert mit Rauch-Phenolen. Fünf konkrete Empfehlungen: Buffalo Trace bis Blanton\'s. Für jeden Budgetrahmen. Auch: Warum man Brisket nicht mit peated Whisky trinken sollte.',
  },

  // ── KATALOG-ALIGNED QUEUE (Otto Gourmet / Albers) — Premium-Cuts, je mit Herkunft ──
  { slug: 'entrecote-grillen', kategorie: 'fleisch', title: 'Entrecôte perfekt grillen', meatType: 'Entrecôte', cookingMethod: 'Heiß angrillen + indirekt', difficulty: 'Mittel', concept: 'Deutschland-Standard: Entrecôte (3,5–5 cm) bei 280–300 Grad direkt pro Seite 60–90 Sekunden angrillen, dann indirekt bei rund 160 Grad Deckel bis 54 Grad Kern, 5–7 Minuten auf vorgewaermtem Holzbrett rasten. Herkunft: Deutschland.' },
  { slug: 'porterhouse-grill', kategorie: 'fleisch', title: 'Porterhouse vom Grill', meatType: 'Porterhouse', cookingMethod: 'Direkt + indirekt', difficulty: 'Fortgeschritten', concept: 'US-Klassiker: Porterhouse vereint Filet und Roastbeef am T-Knochen. Filetseite kuehler positionieren, beide Muskeln gleichmaessig auf 54 Grad bringen. Herkunft: USA.' },
  { slug: 'roastbeef-reverse-sear', kategorie: 'fleisch', title: 'Roastbeef am Stueck — Reverse Sear', meatType: 'Roastbeef', cookingMethod: 'Reverse Sear', difficulty: 'Fortgeschritten', concept: 'Britischer Sonntagsbraten neu gedacht: Roastbeef am Stueck niedrig indirekt auf 52 Grad Kern, dann scharf angrillen. In duennen Scheiben quer zur Faser. Herkunft: Grossbritannien.' },
  { slug: 'chateaubriand-filet', kategorie: 'fleisch', title: 'Chateaubriand — das Filet im Ganzen', meatType: 'Rinderfilet', cookingMethod: 'Indirekt + Sear', difficulty: 'Fortgeschritten', concept: 'Franzoesische Hohe Schule: Filet-Mittelstueck im Ganzen indirekt auf 53 Grad, kurz scharf, ruhen. Magerster Cut, daher praezise Kerntemperatur entscheidend. Herkunft: Frankreich.' },
  { slug: 'flank-steak-grillen', kategorie: 'fleisch', title: 'Flank Steak richtig grillen', meatType: 'Flank Steak', cookingMethod: 'Heiss direkt', difficulty: 'Mittel', concept: 'US-Cut mit groberer Faser: heiss und kurz auf medium rare, dann unbedingt quer zur deutlich sichtbaren Faser in duenne Scheiben. Herkunft: USA.' },
  { slug: 'onglet-hanger-steak', kategorie: 'fleisch', title: 'Onglet (Hanger Steak) — der Metzgercut', meatType: 'Onglet', cookingMethod: 'Heiss direkt', difficulty: 'Mittel', concept: 'Franzoesischer Bistro-Klassiker, intensiver Geschmack: kurz heiss grillen, medium rare, gegen die Faser. Mittelsehne entfernen. Herkunft: Frankreich.' },
  { slug: 'picanha-churrasco', kategorie: 'fleisch', title: 'Picanha — brasilianischer Churrasco', meatType: 'Picanha', cookingMethod: 'Spiess / indirekt', difficulty: 'Mittel', concept: 'Brasilianischer Klassiker: Tafelspitzdeckel mit Fettkappe, in C-Form auf den Spiess oder indirekt, nur grobes Salz. Fettseite zuerst. Herkunft: Brasilien.' },
  { slug: 'tri-tip-santa-maria', kategorie: 'fleisch', title: 'Tri-Tip Santa Maria Style', meatType: 'Tri-Tip', cookingMethod: 'Indirekt + Holz', difficulty: 'Mittel', concept: 'Kalifornischer Santa-Maria-Stil: Tri-Tip ueber Rotholz indirekt auf 54 Grad, einfacher Rub aus Salz, Pfeffer, Knoblauch. Herkunft: USA.' },
  { slug: 'beef-short-ribs', kategorie: 'fleisch', title: 'Beef Short Ribs Low and Slow', meatType: 'Short Ribs', cookingMethod: 'Smoker, Low and Slow', difficulty: 'Fortgeschritten', concept: 'Texas-BBQ-Ikone: dicke Rinder-Short-Ribs 8–10 Stunden bei 110–120 Grad raeuchern bis 95 Grad Kern, Kollagen schmilzt zu Gelatine. Herkunft: USA.' },
  { slug: 'ochsenbaeckchen-geschmort', kategorie: 'fleisch', title: 'Ochsenbaeckchen geschmort-gegrillt', meatType: 'Ochsenbacke', cookingMethod: 'Dutch Oven / indirekt', difficulty: 'Fortgeschritten', concept: 'Schmorklassiker: Ochsenbaeckchen scharf angrillen, dann im Dutch Oven indirekt 3–4 Stunden butterzart schmoren. Viel Bindegewebe wird seidig. Herkunft: Deutschland.' },
  { slug: 'dry-aged-ribeye', kategorie: 'fleisch', title: 'Dry-Aged Ribeye — die Reifung schmecken', meatType: 'Dry-Aged Ribeye', cookingMethod: 'Reverse Sear', difficulty: 'Profi', concept: 'Premium-Cut: trockengereiftes Ribeye sanft indirekt auf 52 Grad, dann scharf fuer die Kruste. Nussig-reife Aromen, sparsam wuerzen. Herkunft: Irland.' },
  { slug: 'bavette-skirt-steak', kategorie: 'fleisch', title: 'Bavette / Skirt Steak vom Grill', meatType: 'Bavette', cookingMethod: 'Heiss direkt', difficulty: 'Mittel', concept: 'Aromatischer Duennsaum-Cut: sehr heiss, sehr kurz, medium rare, gegen die Faser. Ideal fuer Fajitas und Tagliata. Herkunft: USA.' },
  { slug: 'wagyu-steak-braten', kategorie: 'fleisch', title: 'Wagyu-Steak richtig braten', meatType: 'Wagyu', cookingMethod: 'Kurz, kontrolliert', difficulty: 'Profi', concept: 'Japanisches Wagyu nicht ruinieren: niedrigere Hitze als beim normalen Steak, kurze Garzeit, kein zusaetzliches Fett. Das intramuskulaere Fett ist der Star. Herkunft: Japan.' },
  { slug: 'wagyu-yakiniku', kategorie: 'fleisch', title: 'Wagyu Yakiniku am Tischgrill', meatType: 'Wagyu', cookingMethod: 'Tischgrill', difficulty: 'Mittel', concept: 'Japanische Tischgrill-Tradition: hauchduenn geschnittenes Wagyu Sekunden pro Seite, sofort essen. Tare-Dip dazu. Herkunft: Japan.' },
  { slug: 'burnt-ends', kategorie: 'fleisch', title: 'Burnt Ends — die Bonbons vom Brisket', meatType: 'Brisket Point', cookingMethod: 'Smoker, gewuerfelt', difficulty: 'Fortgeschritten', concept: 'Kansas-City-Spezialitaet: das Point-Stueck vom Brisket weiterraeuchern, wuerfeln, in BBQ-Sauce glasieren, nochmal in den Smoker. Herkunft: USA.' },
  { slug: 'beef-back-ribs', kategorie: 'fleisch', title: 'Beef Back Ribs (Dino Ribs)', meatType: 'Beef Ribs', cookingMethod: 'Low and Slow', difficulty: 'Fortgeschritten', concept: 'Maechtige Rinderrippen: 6–8 Stunden bei 120 Grad raeuchern bis 96 Grad Kern, simpler Salz-Pfeffer-Rub. Herkunft: USA.' },
  { slug: 'iberico-secreto', kategorie: 'fleisch', title: 'Iberico Secreto vom Grill', meatType: 'Secreto', cookingMethod: 'Heiss direkt', difficulty: 'Mittel', concept: 'Spanische Delikatesse: das versteckte Secreto vom Iberico-Schwein, stark marmoriert, kurz heiss grillen auf medium, niemals durch. Herkunft: Spanien.' },
  { slug: 'iberico-presa', kategorie: 'fleisch', title: 'Iberico Presa richtig grillen', meatType: 'Presa', cookingMethod: 'Direkt + Ruhen', difficulty: 'Mittel', concept: 'Spanischer Premium-Cut aus dem Schulterbereich des Iberico, fein marmoriert: heiss angrillen, kurz ruhen, medium. Herkunft: Spanien.' },
  { slug: 'iberico-pluma', kategorie: 'fleisch', title: 'Iberico Pluma vom Grill', meatType: 'Pluma', cookingMethod: 'Heiss, kurz', difficulty: 'Mittel', concept: 'Zarter, flacher Iberico-Cut: heiss und kurz grillen, saftig medium. Wenig wuerzen, der nussige Eigengeschmack traegt. Herkunft: Spanien.' },
  { slug: 'iberico-carrillera', kategorie: 'fleisch', title: 'Iberico Carrillera (Schweinebaeckchen) geschmort', meatType: 'Carrillera', cookingMethod: 'Geschmort', difficulty: 'Fortgeschritten', concept: 'Spanischer Schmorcut: Iberico-Schweinebaeckchen in Rotwein-Fond niedrig schmoren bis sie zerfallen. Herkunft: Spanien.' },
  { slug: 'spareribs-3-2-1', kategorie: 'fleisch', title: 'Spareribs nach der 3-2-1-Methode', meatType: 'Spareribs', cookingMethod: '3-2-1, Smoker', difficulty: 'Mittel', concept: 'US-BBQ-Standard mit Duroc-Ribs: 3 Stunden raeuchern, 2 Stunden gewickelt daempfen, 1 Stunde glasieren. Fall-off-the-bone. Herkunft: USA.' },
  { slug: 'krustenbraten-grill', kategorie: 'fleisch', title: 'Krustenbraten vom Grill mit knuspriger Schwarte', meatType: 'Schweineschulter', cookingMethod: 'Indirekt + Kruste', difficulty: 'Mittel', concept: 'Bayrischer Klassiker am Grill: Schweineschulter mit Schwarte indirekt garen, am Ende heiss aufpoppen fuer die Kruste. Herkunft: Deutschland.' },
  // ── Fisch & Meeresfruechte ──
  { slug: 'cedar-plank-lachs', kategorie: 'fisch', title: 'Cedar-Plank-Lachs vom Grill', meatType: 'Lachs', cookingMethod: 'Indirekt auf Zedernholz', difficulty: 'Mittel', concept: 'Lachsfilet mit Haut auf gewaessertem Zedernholzbrett, indirekt bei rund 180 Grad bis Kern 50–52 Grad (glasig-saftig, nie ueber 55). Das Brett raucht und gibt Holzaroma. Glasur aus Ahornsirup, Dijon und Sojasauce; Dill und Zitrone. Orange-rosa Fleisch mit parallelen weissen Fettlinien. Herkunft: Pacific Northwest USA/Kanada.' },
  { slug: 'thunfisch-steak-grill', kategorie: 'fisch', title: 'Thunfisch-Steak medium rare grillen', meatType: 'Thunfisch', cookingMethod: 'Sehr heiss, sehr kurz direkt', difficulty: 'Mittel', concept: 'Dickes Ahi-Thunfisch-Steak in Sushi-Qualitaet, mariniert in Sojasauce, Sesamoel und Ingwer, optional Sesamkruste. Sehr heiss direkt nur 60–90 Sekunden je Seite: aussen scharfe Gitterstreifen, Kern tiefrot und roh (medium rare). Niemals durchgaren, wird sonst grau und trocken. Quer zur Faser schneiden. Herkunft: mediterran/japanisch.' },
  { slug: 'ganze-dorade-grill', kategorie: 'fisch', title: 'Ganze Dorade vom Grill', meatType: 'Dorade', cookingMethod: 'Direkt in der Fischzange', difficulty: 'Mittel', concept: 'Ganze ausgenommene Dorade (Goldbrasse), Haut beidseitig eingeschnitten, Bauchhoehle mit Zitronenscheiben, Rosmarin und Knoblauch gefuellt. In der Fischzange direkt ueber mittlerer Glut rund 6–8 Minuten je Seite, bis die silbrig-goldene Haut blasig und knusprig ist und das Fleisch weiss und saftig. Olivenoel, Meersalz. Herkunft: Mittelmeer.' },
  // ── Veggie-Beilagen ──
  { slug: 'maiskolben-elote', kategorie: 'beilagen', title: 'Gegrillter Maiskolben Elote-Style', meatType: 'Mais', cookingMethod: 'Direkt gegrillt', difficulty: 'Einfach', concept: 'Maiskolben direkt grillen, bis die gelben Koerner gebraeunt und karamellisiert sind mit dunklen Roeststreifen. Dann mexikanischer Elote: duenne Schicht Crema/Mayo-Limette, kruemeliger Cotija oder Feta, Chilipulver, Koriander, ein Spritzer Limette. Herkunft: Mexiko/USA-Streetfood.' },
  { slug: 'gemuese-spiesse-grill', kategorie: 'beilagen', title: 'Bunte Gemuese-Spiesse vom Grill', meatType: 'Gemüse', cookingMethod: 'Direkt gegrillt', difficulty: 'Einfach', concept: 'Spiesse aus rot-gelber Paprika, Zucchini, roter Zwiebel und Champignons in Olivenoel-Kraeutermarinade. Gleichmaessige Stuecke fuer gleiche Garzeit. Direkt grillen bis die Kanten blistered und karamellisiert sind, innen bissfest. Dazu Chimichurri. Vegan. Herkunft: mediterran/Sommergrill.' },
  { slug: 'gruener-spargel-grill', kategorie: 'beilagen', title: 'Gruener Spargel vom Grill mit Parmesan', meatType: 'Grüner Spargel', cookingMethod: 'Direkt, quer zum Rost', difficulty: 'Einfach', concept: 'Gruener Spargel, holzige Enden entfernt, in Olivenoel gewendet, quer ueber den heissen Rost rund 4–6 Minuten mit klaren dunklen Grillstreifen, Spitzen leicht knusprig, Stangen bissfest. Parmesan-Spaene, Meersalz-Flocken, Zitrone. Herkunft: mediterran.' },
  { slug: 'lammkarree-grillen', kategorie: 'fleisch', title: 'Lammkarree / Lammkrone vom Grill', meatType: 'Lammkarree', cookingMethod: 'Indirekt + Sear', difficulty: 'Mittel', concept: 'Festtags-Cut: Lammkarree mit Fettdeckel indirekt auf 56 Grad, dann scharf. Mediterrane Kraeuterkruste. Herkunft: Schottland.' },
  { slug: 'lammkoteletts-mediterran', kategorie: 'fleisch', title: 'Lammkoteletts mediterran', meatType: 'Lammkoteletts', cookingMethod: 'Direkt, kurz', difficulty: 'Einfach', concept: 'Schnell und aromatisch: Lammkoteletts in Rosmarin-Knoblauch-Olivenoel marinieren, heiss kurz grillen auf medium. Herkunft: Schottland.' },
  { slug: 'lammkeule-drehspiess', kategorie: 'fleisch', title: 'Lammkeule am Drehspiess', meatType: 'Lammkeule', cookingMethod: 'Rotisserie', difficulty: 'Fortgeschritten', concept: 'Ganze Lammkeule am Rotisserie-Spiess gleichmaessig indirekt auf 60 Grad, aussen knusprig. Herkunft: Neuseeland.' },
  { slug: 'beer-can-chicken', kategorie: 'fleisch', title: 'Beer Can Chicken', meatType: 'Ganzes Haehnchen', cookingMethod: 'Indirekt, aufrecht', difficulty: 'Einfach', concept: 'US-Grillklassiker: ganzes Haehnchen aufrecht auf einer halbvollen Bierdose indirekt garen bis 74 Grad Kern in der Brust, knusprige Haut. Herkunft: USA.' },
  { slug: 'spatchcock-haehnchen', kategorie: 'fleisch', title: 'Spatchcock-Haehnchen (Butterfly)', meatType: 'Ganzes Haehnchen', cookingMethod: 'Flach, indirekt', difficulty: 'Einfach', concept: 'Haehnchen flachgedrueckt (Rueckgrat entfernt) gart gleichmaessig und schneller, indirekt bis 74 Grad Kern. Herkunft: USA.' },
  { slug: 'pulled-chicken', kategorie: 'fleisch', title: 'Pulled Chicken vom Smoker', meatType: 'Haehnchenschenkel', cookingMethod: 'Low and Slow', difficulty: 'Einfach', concept: 'Saftige Alternative zu Pulled Pork: Haehnchenschenkel niedrig raeuchern bis 90 Grad, zupfen, in leichter Sauce. Herkunft: USA.' },
  { slug: 'ente-vom-grill', kategorie: 'fleisch', title: 'Ente vom Grill mit knuspriger Haut', meatType: 'Ganze Ente', cookingMethod: 'Indirekt, Fett ablassen', difficulty: 'Fortgeschritten', concept: 'Ganze Ente indirekt garen, Haut mehrfach einstechen damit Fett ausbraet und die Haut knusprig wird. Herkunft: Frankreich.' },
  { slug: 'asado-de-tira', kategorie: 'fleisch', title: 'Asado de Tira — argentinische Querrippe', meatType: 'Short Ribs (Tira)', cookingMethod: 'Asado, offen', difficulty: 'Fortgeschritten', concept: 'Argentinischer Asado-Klassiker: quer gesaegte Rinderrippe ueber offener Glut langsam garen, nur grobes Salz, Chimichurri dazu. Herkunft: Argentinien.' },
  { slug: 'korean-bbq-bulgogi', kategorie: 'fleisch', title: 'Korean BBQ Bulgogi', meatType: 'Rind (duenn)', cookingMethod: 'Mariniert, Tischgrill', difficulty: 'Einfach', concept: 'Koreanischer Klassiker: hauchduennes Rind in Sojasauce-Birne-Sesam-Marinade, am Tischgrill Sekunden braten. Herkunft: Korea.' },
  { slug: 'tagliata-di-manzo', kategorie: 'fleisch', title: 'Tagliata di Manzo', meatType: 'Roastbeef', cookingMethod: 'Heiss, in Scheiben', difficulty: 'Einfach', concept: 'Italienischer Klassiker: Roastbeef oder Entrecote heiss grillen, medium rare, in Scheiben auf Ruccola mit Parmesan und Olivenoel. Herkunft: Italien.' },
  { slug: 'wagyu-burger', kategorie: 'fleisch', title: 'Wagyu Burger', meatType: 'Wagyu-Hack', cookingMethod: 'Smash / Grill', difficulty: 'Mittel', concept: 'Luxus-Burger aus Wagyu-Hack: lockere Patties, hoher Fettanteil, kurz heiss, medium. Nicht plattdruecken bis trocken. Herkunft: Japan.' },
  { slug: 't-bone-fiorentina', kategorie: 'fleisch', title: 'T-Bone Bistecca alla Fiorentina', meatType: 'T-Bone', cookingMethod: 'Direkt, dick', difficulty: 'Fortgeschritten', concept: 'Toskanischer Klassiker: sehr dickes T-Bone (Chianina) sehr heiss direkt, aussen krustig, innen blutig-rosa, hochkant auf den Knochen gestellt. Nur Salz, Olivenoel, Zitrone. Herkunft: Italien.' },
]

// ─── CACHE ────────────────────────────────────────────────────────────────────

async function loadCache() {
  try { return JSON.parse(await readFile(CACHE_FILE, 'utf-8')) } catch { return {} }
}

async function saveCache(cache) {
  if (!DRY_RUN) await writeFile(CACHE_FILE, JSON.stringify(cache, null, 2))
}

// ─── YAML-HELPER (kein js-yaml nötig) ────────────────────────────────────────
// Einfaches YAML-Serialisieren für Rezept-Felder.

function yamlStr(val) {
  if (val === null || val === undefined) return '""'
  const s = String(val)
  // Zahl ohne Anführungszeichen wenn möglich
  if (/^\d+$/.test(s)) return s
  // Anführungszeichen wenn Sonderzeichen oder leer
  const needsQuote = /[:"#&*?|{}\[\]>!%@`,]/.test(s) || s.includes('\n') || s.trim() !== s || s === ''
  if (needsQuote) return `"${s.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`
  return s
}

function serializeIngredients(ingredients) {
  return ingredients.map(ing => {
    let line = `  - amount: ${ing.amount}\n    unit: ${yamlStr(ing.unit)}\n    name: ${yamlStr(ing.name)}`
    if (ing.note) line += `\n    note: ${yamlStr(ing.note)}`
    return line
  }).join('\n')
}

function serializeSteps(steps) {
  return steps.map(step => {
    let block = `  - title: ${yamlStr(step.title)}\n    description: ${yamlStr(step.description)}`
    if (step.duration) block += `\n    duration: ${yamlStr(step.duration)}`
    if (step.tip)      block += `\n    tip: ${yamlStr(step.tip)}`
    return block
  }).join('\n')
}

function serializeList(items) {
  return items.map(i => `  - ${yamlStr(i)}`).join('\n')
}

function buildMdx(data) {
  const fm = [
    `title: ${yamlStr(data.title)}`,
    `description: ${yamlStr(data.description)}`,
    `publishedAt: "${TODAY}"`,
    `author: ${yamlStr(data.author)}`,
    `authorSlug: ${yamlStr(data.authorSlug)}`,
    `image: ${yamlStr(data.image)}`,
    `imageAlt: ${yamlStr(data.imageAlt)}`,
    `prepTime: ${yamlStr(data.prepTime)}`,
    `cookTime: ${yamlStr(data.cookTime)}`,
    `totalTime: ${yamlStr(data.totalTime)}`,
    `servings: ${data.servings}`,
    data.calories ? `calories: ${data.calories}` : null,
    `kategorie: ${data.kategorie}`,
    `meatType: ${yamlStr(data.meatType)}`,
    `cookingMethod: ${yamlStr(data.cookingMethod)}`,
    data.land ? `land: ${yamlStr(data.land)}` : null,
    `difficulty: ${yamlStr(data.difficulty)}`,
    data.keywords?.length
      ? `keywords:\n${serializeList(data.keywords)}`
      : null,
    data.equipment?.length
      ? `equipment:\n${serializeList(data.equipment)}`
      : null,
    `ingredients:\n${serializeIngredients(data.ingredients)}`,
    `steps:\n${serializeSteps(data.steps)}`,
    data.seoTitle       ? `seoTitle: ${yamlStr(data.seoTitle)}`           : null,
    data.seoDescription ? `seoDescription: ${yamlStr(data.seoDescription)}` : null,
    data.whiskeyName    ? `whiskeyName: ${yamlStr(data.whiskeyName)}`     : null,
    data.whiskeyType    ? `whiskeyType: ${yamlStr(data.whiskeyType)}`     : null,
    data.whiskeyProfile ? `whiskeyProfile: ${yamlStr(data.whiskeyProfile)}` : null,
    data.whiskeyLink    ? `whiskeyLink: ${yamlStr(data.whiskeyLink)}`     : null,
    data.wineName       ? `wineName: ${yamlStr(data.wineName)}`           : null,
    data.wineType       ? `wineType: ${yamlStr(data.wineType)}`           : null,
    data.wineProfile    ? `wineProfile: ${yamlStr(data.wineProfile)}`     : null,
    data.wineLink       ? `wineLink: ${yamlStr(data.wineLink)}`           : null,
  ].filter(Boolean).join('\n')

  return `---\n${fm}\n---\n\n${data.body.trim()}\n`
}

// ─── GENERATION ───────────────────────────────────────────────────────────────

const SYSTEM = `Du bist Marco, der Chefautor von Steakakademie.de — Deutschlands autoritativster BBQ-Wissensplattform.
Ton: direkt, präzise, leidenschaftlich. Kein Fülltext. Kein Clickbait. Echter Substanz-Anspruch.
Zielgruppe: ambitionierte BBQ-Enthusiasten, 30–55 Jahre, die wissen wollen WARUM etwas funktioniert.
Sprache: Deutsch. Fachbegriffe englisch wenn üblich (Bark, Stall, Sear etc.).`

// ─── STRUKTURIERTES TEXT-FORMAT PARSER ───────────────────────────────────────
// Kein JSON-Parsing — Schlüssel:Wert-Format ist 100% zuverlässig

function parseStructuredText(text) {
  const data = {
    author: 'Marco', authorSlug: 'marco',
    keywords: [], equipment: [], ingredients: [], steps: [],
    whiskeyName: '', whiskeyType: '', whiskeyProfile: '', whiskeyLink: '',
    wineName: '', wineType: '', wineProfile: '', wineLink: '',
  }

  const lines = text.split('\n')
  let section = null

  for (const raw of lines) {
    const line = raw.trim()
    if (!line || line.startsWith('#')) continue

    // Section-Headers
    if (line === 'KEYWORDS:')    { section = 'keywords';    continue }
    if (line === 'EQUIPMENT:')   { section = 'equipment';   continue }
    if (line === 'INGREDIENTS:') { section = 'ingredients'; continue }
    if (line === 'STEPS:')       { section = 'steps';       continue }
    if (line === 'BODY:')        { section = 'body';        continue }

    // Einfache KEY: value Felder
    const kv = line.match(/^([A-Z_]+):\s*(.+)$/)
    if (kv && section !== 'body') {
      const key = kv[1], val = kv[2].trim()
      const map = {
        TITLE: 'title', DESCRIPTION: 'description', IMAGE_ALT: 'imageAlt', LAND: 'land',
        PREP_TIME: 'prepTime', COOK_TIME: 'cookTime', TOTAL_TIME: 'totalTime',
        SERVINGS: 'servings', CALORIES: 'calories',
        SEO_TITLE: 'seoTitle', SEO_DESCRIPTION: 'seoDescription',
        WHISKEY_NAME: 'whiskeyName', WHISKEY_TYPE: 'whiskeyType',
        WHISKEY_PROFILE: 'whiskeyProfile', WHISKEY_LINK: 'whiskeyLink',
        WINE_NAME: 'wineName', WINE_TYPE: 'wineType',
        WINE_PROFILE: 'wineProfile', WINE_LINK: 'wineLink',
      }
      if (map[key]) {
        data[map[key]] = ['SERVINGS', 'CALORIES'].includes(key) ? Number(val) : val
        section = null
      }
      continue
    }

    // Listen-Items (- text)
    if (line.startsWith('- ') && ['keywords', 'equipment'].includes(section)) {
      data[section].push(line.slice(2).trim())
      continue
    }

    // Zutaten: - Menge | Einheit | Name | Notiz(optional)
    if (line.startsWith('- ') && section === 'ingredients') {
      const parts = line.slice(2).split('|').map(s => s.trim())
      if (parts.length >= 3) {
        data.ingredients.push({
          amount: parseFloat(parts[0]) || 1,
          unit:   parts[1],
          name:   parts[2],
          note:   parts[3] || undefined,
        })
      }
      continue
    }

    // Schritte: N. Titel | Dauer | Beschreibung | Tipp(optional)
    if (/^\d+\./.test(line) && section === 'steps') {
      const withoutNum = line.replace(/^\d+\.\s*/, '')
      const parts = withoutNum.split(' | ')
      if (parts.length >= 3) {
        data.steps.push({
          title:       parts[0].trim(),
          duration:    parts[1].trim(),
          description: parts[2].trim(),
          tip:         parts[3]?.trim() || undefined,
        })
      }
      continue
    }

    // Body: alles nach BODY: sammeln
    if (section === 'body') {
      data.body = (data.body ? data.body + '\n' : '') + raw
    }
  }

  return data
}

async function generateRecipe(seed) {
  // Phase 1: Strukturiertes Textformat — kein JSON, kein Parsing-Problem
  const metaPrompt = `Generiere strukturierte Rezept-Metadaten für steakakademie.de.
Antworte EXAKT in diesem Format (Groß-/Kleinschreibung beachten):

TITLE: [Titel max. 70 Zeichen]
DESCRIPTION: [Meta-Beschreibung 120-155 Zeichen]
IMAGE_ALT: [Was auf dem Bild zu sehen ist, max. 80 Zeichen]
LAND: [Herkunftsland/Region des Gerichts, z.B. "USA · Texas", "Spanien", "Argentinien", "Italien" — bei deutschem Standard "Deutschland"]
PREP_TIME: [ISO8601, z.B. PT20M]
COOK_TIME: [ISO8601]
TOTAL_TIME: [ISO8601]
SERVINGS: [Zahl]
CALORIES: [Zahl]
SEO_TITLE: [max. 60 Zeichen | Steakakademie]
SEO_DESCRIPTION: [150-160 Zeichen]
WHISKEY_NAME: [Passender Whisky oder leer lassen]
WHISKEY_TYPE: [z.B. Bourbon]
WHISKEY_PROFILE: [Beschreibung und Pairing-Grund]
WHISKEY_LINK: [https://www.amazon.de/s?k=Name&tag=steakakademie-21 oder leer]
WINE_NAME: [Passender Wein oder leer lassen]
WINE_TYPE: [z.B. Rotwein]
WINE_PROFILE: [Beschreibung und Pairing-Grund]
WINE_LINK: [https://www.amazon.de/s?k=Name&tag=steakakademie-21 oder leer]

KEYWORDS:
- [keyword 1]
- [keyword 2]
- [keyword 3]
- [keyword 4]

EQUIPMENT:
- [equipment 1]
- [equipment 2]

INGREDIENTS:
- [Menge] | [Einheit] | [Name] | [Anmerkung optional]
- [Menge] | [Einheit] | [Name]
(mind. 5 Zutaten)

STEPS:
1. [Schritt-Titel] | [Dauer] | [Ausführliche Beschreibung: WARUM dieser Schritt wichtig ist. Mindestens 2 vollständige Sätze.] | [Profi-Tipp optional]
2. [Schritt-Titel] | [Dauer] | [Beschreibung] | [Tipp]
(mind. 4 Schritte, max. 7)

---
Rezept-Kontext:
- Slug: ${seed.slug}
- Konzept: ${seed.concept}
- Kategorie: ${seed.kategorie}
- Schwierigkeit: ${seed.difficulty}
- Fleisch/Hauptprodukt: ${seed.meatType}
- Methode: ${seed.cookingMethod}

Wichtig: Keine Markdown-Formatierung innerhalb der Felder. Kein JSON. Kein Kommentar außerhalb des Formats.`

  const metaResp = await generateText({
    model:    anthropic('claude-haiku-4-5-20251001'),
    maxTokens: 2000,
    system:   SYSTEM,
    messages: [{ role: 'user', content: metaPrompt }],
  })

  const data = parseStructuredText(metaResp.text)
  data.image     = `/images/articles/${seed.slug}.webp`
  data.kategorie = seed.kategorie
  data.meatType  = seed.meatType
  data.cookingMethod = seed.cookingMethod
  data.difficulty    = seed.difficulty

  // Phase 2: Artikeltext separat (kein JSON-Escaping-Problem)
  const promptBody = `Schreibe den Artikel-Text für ein Rezept auf steakakademie.de.

Rezept: ${data.title}
Konzept: ${seed.concept}

Format: Reines Markdown, keine Frontmatter, kein JSON.
Struktur:
- Intro (2-3 Sätze: Warum ist dieses Gericht besonders)
- ## [Sinnvoller Abschnitt 1] (Wissenschaft/Hintergrund)
- ## [Sinnvoller Abschnitt 2] (Profi-Wissen oder Equipment)
- ## Häufige Fehler
- Optional: ## Variationen

Mindestens 500 Wörter. Kein Titel als erster Satz. Keine Floskeln wie "In diesem Rezept...".`

  const bodyResp = await generateText({
    model: anthropic('claude-sonnet-4-6'),
    maxTokens: 1800,
    system: SYSTEM,
    messages: [{ role: 'user', content: promptBody }],
  })

  data.body = bodyResp.text.trim()
  return data
}

// ─── VALIDIERUNG ──────────────────────────────────────────────────────────────

const REQUIRED = ['title', 'description', 'author', 'authorSlug', 'image', 'imageAlt',
  'prepTime', 'cookTime', 'totalTime', 'servings', 'kategorie',
  'meatType', 'cookingMethod', 'difficulty', 'ingredients', 'steps']

const VALID_KATEGORIEN = new Set(['fleisch', 'fisch', 'beilagen', 'saucen-rubs', 'desserts', 'wine-spirits'])
const VALID_DIFFICULTY = new Set(['Einfach', 'Mittel', 'Fortgeschritten', 'Profi'])

function validate(data, seed) {
  const errors = []
  for (const field of REQUIRED) {
    if (!data[field]) errors.push(`Pflichtfeld fehlt: ${field}`)
  }
  if (!VALID_KATEGORIEN.has(data.kategorie)) errors.push(`Ungültige Kategorie: ${data.kategorie}`)
  if (!VALID_DIFFICULTY.has(data.difficulty)) errors.push(`Ungültige Schwierigkeit: ${data.difficulty}`)
  if (!Array.isArray(data.ingredients) || data.ingredients.length === 0) errors.push('Keine Zutaten')
  if (!Array.isArray(data.steps) || data.steps.length < 2) errors.push('Zu wenige Schritte')
  if (!/^PT/.test(data.prepTime || '')) errors.push(`prepTime kein ISO 8601: ${data.prepTime}`)
  if (!/^PT/.test(data.cookTime  || '')) errors.push(`cookTime kein ISO 8601: ${data.cookTime}`)
  if (!/^PT/.test(data.totalTime || '')) errors.push(`totalTime kein ISO 8601: ${data.totalTime}`)
  // Kategorie aus Seed erzwingen (Modell weicht manchmal ab)
  data.kategorie = seed.kategorie
  data.difficulty = seed.difficulty
  return errors
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(c.bold('\n┌─────────────────────────────────────────────┐'))
  console.log(c.bold('│  Steakakademie — Recipe Agent               │'))
  console.log(c.bold('└─────────────────────────────────────────────┘\n'))

  if (DRY_RUN) console.log(c.yellow('  Dry-run — keine Dateien werden geschrieben\n'))

  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn(c.yellow('  ⚠ ANTHROPIC_API_KEY fehlt — Recipe-Agent wird übersprungen.\n'))
    process.exit(0)
  }

  if (!DRY_RUN) await mkdir(REZEPTE, { recursive: true })

  const cache   = await loadCache()
  let seeds = SEED_RECIPES

  if (SLUG_ONLY) {
    seeds = seeds.filter(s => s.slug === SLUG_ONLY)
    if (seeds.length === 0) {
      console.error(c.red(`  ✗ Kein Seed mit slug="${SLUG_ONLY}" gefunden.\n`))
      process.exit(1)
    }
  }

  const toGenerate = FORCE
    ? seeds
    : seeds.filter(s => {
        const outFile = join(REZEPTE, `${s.slug}.mdx`)
        return !cache[s.slug] && !existsSync(outFile)   // Cache ODER existierende Datei → skip
      })

  console.log(`  ${seeds.length} Rezepte in Seed-Liste`)
  console.log(`  ${seeds.length - toGenerate.length} bereits generiert (Cache)`)
  console.log(`  ${c.yellow(toGenerate.length + '')} neu zu generieren\n`)

  if (toGenerate.length === 0) {
    console.log(c.green('  Alle Rezepte aktuell — nichts zu tun.\n'))
    return
  }

  let success = 0, failed = 0

  for (const seed of toGenerate) {
    process.stdout.write(`  Generiere: ${c.bold(seed.slug)}... `)

    let data
    try {
      data = await generateRecipe(seed)
    } catch (err) {
      console.log(c.red('FEHLER'))
      console.error(c.dim(`    ${err.message}`))
      failed++
      continue
    }

    const errors = validate(data, seed)
    if (errors.length > 0) {
      console.log(c.yellow('VALIDIERUNGSFEHLER'))
      errors.forEach(e => console.error(c.dim(`    ✗ ${e}`)))
      failed++
      continue
    }

    const mdx     = buildMdx(data)
    const outFile = join(REZEPTE, `${seed.slug}.mdx`)

    if (!DRY_RUN) {
      await writeFile(outFile, mdx, 'utf-8')
    }

    console.log(c.green('OK'))
    console.log(c.dim(`    → ${seed.kategorie} | ${data.difficulty} | ${data.servings} Portionen`))

    cache[seed.slug] = { at: TODAY, title: data.title }
    success++
  }

  await saveCache(cache)

  console.log(c.bold('\n  ─────────────────────────────────────────────'))
  if (success > 0) console.log(c.green(`  ✓ ${success} Rezept(e) generiert`))
  if (failed  > 0) console.log(c.red(  `  ✗ ${failed} Fehler`))
  console.log()
}

main().catch(err => {
  console.error(c.red(`\n  Agent-Fehler: ${err.message}\n`))
  process.exit(1)
})
