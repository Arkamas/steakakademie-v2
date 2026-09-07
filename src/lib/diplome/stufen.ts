/**
 * Die eine Quelle fuer die Diplom-Taxonomie.
 *
 * Vorher stand dieselbe Struktur (5 Stufen, 10 Level, Namen, Farben, Badges)
 * an sechs Stellen unabhaengig im Code — RoadmapClient (stages + moduleMeta),
 * DiplomeClient (LEVELS), lernen/[stufe]/[lektion] (STUFE_META), urkunde
 * (DIPLOMA_LEVELS), griller/[slug] (STAGES), BadgeProgression (BADGES) — und
 * war bereits auseinandergelaufen (Gold #FFD700 gegen #F5C842, „Bezähmen"
 * gegen „bezähmen"). Audit 06.09.2026, Befund R11/R14.
 *
 * Beziehung der beiden Zaehlweisen, damit sie nie wieder nebeneinander
 * stehen ohne Erklaerung: FUENF Stufen fuehren. Jede Stufe hat ZWEI Level.
 * Level 1+2 = Stufe 1 (Bronze), Level 3+4 = Stufe 2 (Silber) usw. Die
 * Lektionen tragen beides im Frontmatter (`stufe`, `level`).
 *
 * Reine Daten, keine React-Abhaengigkeit — importierbar aus Server- und
 * Client-Komponenten sowie aus API-Routen.
 */

export type StufeKey = 'bronze' | 'anatomie' | 'thermometer' | 'holz' | 'kcbs';
export type MedalTier = 'bronze' | 'silber' | 'gold' | 'platin' | 'master';

export type Stufe = {
  /** 1–5 */
  nr: number;
  /** Modul-Schluessel — so heisst die Stufe in course_progress.modul */
  key: StufeKey;
  tier: MedalTier;
  /** „Bronze", „Silber" … */
  metall: string;
  /** „Bronze-Zertifikat" … „Meister-Diplom" */
  cert: string;
  /** Stufentitel, identisch mit /diplome und dem Reel */
  title: string;
  /** Badge-Name, der bei Bestehen vergeben wird */
  badge: string;
  color: string;
  glow: string;
  /** Emoji der Stufe (Roadmap-Uebersicht) */
  emoji: string;
  /** Modultitel und -emoji in der Roadmap-Modulansicht */
  modulTitle: string;
  modulEmoji: string;
  modulDescription: string;
  /** Die beiden Level dieser Stufe */
  levels: readonly [number, number];
  /** Welche Stufe vorher bestanden sein muss (null = Einstieg) */
  requires: StufeKey | null;
};

export const STUFEN: readonly Stufe[] = [
  {
    nr: 1, key: 'bronze', tier: 'bronze', metall: 'Bronze', cert: 'Bronze-Zertifikat',
    title: 'Der Funke', badge: 'Glut-Lehrling',
    color: '#CD7F32', glow: 'rgba(205,127,50,0.4)', emoji: '🔥',
    modulTitle: 'Feuerzone', modulEmoji: '🔥',
    modulDescription: 'Kohle, Temperaturzonen, Sicherheit — die Grundlagen am Feuer.',
    levels: [1, 2], requires: null,
  },
  {
    nr: 2, key: 'anatomie', tier: 'silber', metall: 'Silber', cert: 'Silber-Zertifikat',
    title: 'Die Flamme bezähmen', badge: 'Fleischkenner',
    color: '#C0C0C0', glow: 'rgba(192,192,192,0.4)', emoji: '🌡️',
    modulTitle: 'Anatomie & Cuts', modulEmoji: '🥩',
    modulDescription: 'Welcher Cut kommt woher und wie wird er gegart?',
    levels: [3, 4], requires: 'bronze',
  },
  {
    nr: 3, key: 'thermometer', tier: 'gold', metall: 'Gold', cert: 'Gold-Zertifikat',
    title: 'Hitzekontrolle', badge: 'Präzisions-Griller',
    color: '#FFD700', glow: 'rgba(255,215,0,0.4)', emoji: '🎯',
    modulTitle: 'Kerntemperatur', modulEmoji: '🌡️',
    modulDescription: 'Die exakte Temperatur für jedes Fleisch.',
    levels: [5, 6], requires: 'anatomie',
  },
  {
    nr: 4, key: 'holz', tier: 'platin', metall: 'Platin', cert: 'Platin-Zertifikat',
    title: 'Präzision & Geschmack', badge: 'BBQ-Scientist',
    color: '#E5E4E2', glow: 'rgba(229,228,226,0.5)', emoji: '💨',
    modulTitle: 'Holz & Smoke', modulEmoji: '🌲',
    modulDescription: 'Welches Holz für welches Aroma — Smoker beherrschen.',
    levels: [7, 8], requires: 'thermometer',
  },
  {
    nr: 5, key: 'kcbs', tier: 'master', metall: 'Meister', cert: 'Meister-Diplom',
    title: 'Der vollendete Pitmaster', badge: 'Master of Steak',
    color: '#FF6B35', glow: 'rgba(255,107,53,0.5)', emoji: '👑',
    modulTitle: 'KCBS-Wettbewerb', modulEmoji: '🏅',
    modulDescription: 'Bewertungs-Standards der Wettbewerbsgrills.',
    levels: [9, 10], requires: 'holz',
  },
] as const;

export type Level = {
  id: number;
  stufe: number;
  name: string;
  emoji: string;
  description: string;
};

export const LEVELS: readonly Level[] = [
  { id: 1,  stufe: 1, name: 'Glut-Lehrling',     emoji: '🔥',  description: 'Grundlagen des Grillens: Temperaturzonen, direktes vs. indirektes Grillen, Sicherheit.' },
  { id: 2,  stufe: 1, name: 'Marinier-Meister',  emoji: '🧂',  description: 'Die Kunst der Würzung: Dry Rubs, Marinaden, Salzen und Timing.' },
  { id: 3,  stufe: 2, name: 'Onglet-Kenner',     emoji: '🥩',  description: 'Cuts & Anatomie: Welche Fleischteile sind was — und warum?' },
  { id: 4,  stufe: 2, name: 'Dry-Ager',          emoji: '🧊',  description: 'Reifung & Lagerung: Wet Aging vs. Dry Aging, optimale Bedingungen.' },
  { id: 5,  stufe: 3, name: 'Flammen-Virtuose',  emoji: '🎯',  description: 'Präzisions-Grillen: Kerntemperaturen, Reverse Sear, die perfekte Kruste.' },
  { id: 6,  stufe: 3, name: 'Cuts-Experte',      emoji: '🗺️', description: 'Weltreise der Cuts: Wagyu, Angus, Iberico — Herkunft & Eigenschaften.' },
  { id: 7,  stufe: 4, name: 'Smoke-Artist',      emoji: '💨',  description: 'Low & Slow: Smoker, Holzarten, Smoke Rings und BBQ-Wissenschaft.' },
  { id: 8,  stufe: 4, name: 'Thermometer-Profi', emoji: '🌡️', description: 'Die Physik des Steaks: Maillard-Reaktion, Proteinstruktur, Saftigkeit.' },
  { id: 9,  stufe: 5, name: 'Wagyu-Sommelier',   emoji: '🏅',  description: 'Premium-Klasse: Marmorierung, BMS-Score, Verkostung wie ein Profi.' },
  { id: 10, stufe: 5, name: 'Master of Steak',   emoji: '👑',  description: 'Das Abschluss-Diplom. Du kennst das Steak von der Weide bis zum Teller.' },
] as const;

/** Reihenfolge der Module — identisch mit STUFEN, als Schluessel-Liste. */
export const STUFEN_ORDER: readonly StufeKey[] = STUFEN.map((s) => s.key);

/** Stufe 1 ist frei; ab Stufe 2 gehoert der Inhalt zum kostenpflichtigen Diplom. */
export const ERSTE_BEZAHLSTUFE = 2;

/** Slug des Kurses in `courses` — der Digistore-Webhook schreibt die Buchung darauf. */
export const DIPLOM_COURSE_SLUG = 'grillmeister-diplom';

/**
 * Pruefungsregeln — EINE Stelle. Vorher stand „4" hart in der Quiz-Komponente
 * und in isUnlocked, waehrend die Roadmap-Texte 70 % und 75 % behaupteten.
 */
export const QUIZ_FRAGEN_JE_MODUL = 5;
export const QUIZ_BESTEHENSGRENZE = 4;
export const QUIZ_BESTEHENSQUOTE = Math.round((QUIZ_BESTEHENSGRENZE / QUIZ_FRAGEN_JE_MODUL) * 100);

export function stufeByNr(nr: number): Stufe | undefined {
  return STUFEN.find((s) => s.nr === nr);
}

export function stufeByKey(key: string): Stufe | undefined {
  return STUFEN.find((s) => s.key === key);
}

export function isStufeKey(x: unknown): x is StufeKey {
  return typeof x === 'string' && STUFEN.some((s) => s.key === x);
}

export function levelsOfStufe(nr: number): Level[] {
  return LEVELS.filter((l) => l.stufe === nr);
}

export function stufeOfLevel(levelId: number): Stufe | undefined {
  const lvl = LEVELS.find((l) => l.id === levelId);
  return lvl ? stufeByNr(lvl.stufe) : undefined;
}

export function tierForLevel(levelId: number): MedalTier {
  return stufeOfLevel(levelId)?.tier ?? 'bronze';
}

/** Der lesbare Pruefungssatz — aus den Konstanten, nie von Hand geschrieben. */
export function pruefungsText(): string {
  return `${QUIZ_FRAGEN_JE_MODUL} Fragen · ${QUIZ_BESTEHENSGRENZE} von ${QUIZ_FRAGEN_JE_MODUL} richtig (${QUIZ_BESTEHENSQUOTE} %) · sofort wiederholbar`;
}
