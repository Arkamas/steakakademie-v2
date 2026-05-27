'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

type Stage = {
  id: number;
  cert: string;
  title: string;
  emoji: string;
  color: string;
  glow: string;
  levels: number[];
  levelNames: string[];
  tagline: string;
  kompetenzen: string[];
  lernmethoden: { icon: string; label: string; desc: string }[];
  pruefung: string;
  badge: string;
};

type ModuleKey = 'bronze' | 'anatomie' | 'thermometer' | 'holz' | 'kcbs';
type ViewKey   = 'roadmap' | ModuleKey;
type TabKey    = 'lerninhalte' | 'quiz' | 'flashcards';
type ExpandKey = 'komp' | 'learn' | 'pruef' | null;
type ZoneKey   = 'direkte' | 'indirekte' | 'ruhe' | 'abdeck';

type ModuleMeta = {
  title: string;
  emoji: string;
  color: string;
  glow: string;
  stage: number;
  badge: string;
  description: string;
  requires?: ModuleKey;
};

type QuizQuestion = {
  q: string;
  options: string[];
  correct: number;
  explain?: string;
};

type Flashcard = { front: string; back: string };

type FeuerzoneItem = {
  id: string;
  label: string;
  emoji: string;
  correctZone: ZoneKey;
  explain: string;
};

type Progress = {
  bestandene_module: ModuleKey[];
  quiz_scores: Partial<Record<ModuleKey, number>>;
  badges: string[];
  streak_count: number;
};

// ═══════════════════════════════════════════════════════════════════════════
// DESIGN TOKEN T
// ═══════════════════════════════════════════════════════════════════════════

const T = {
  bg:           '#0a0a0a',
  bgGradient:   'linear-gradient(180deg, #1a0a00 0%, #0a0a0a 100%)',
  panel:        '#111',
  panelAlt:     '#161616',
  border:       '#222',
  borderMuted:  '#2a2a2a',
  borderSubtle: '#1a1a1a',
  text:         '#e8e0d0',
  textGold:     '#e8c88a',
  textMuted:    '#8a7a6a',
  textDim:      '#666',
  textFaint:    '#444',
  card:         '#c8b898',
  success:      '#7CB342',
  successBg:    'rgba(124,179,66,0.15)',
  error:        '#E53935',
  errorBg:      'rgba(229,57,53,0.15)',
  gold:         '#C8882A',
  fire:         '#FF6B35',
};

// ═══════════════════════════════════════════════════════════════════════════
// DATA — Stages (Roadmap)
// ═══════════════════════════════════════════════════════════════════════════

const stages: Stage[] = [
  {
    id: 1,
    cert: 'Bronze-Zertifikat',
    title: 'Der Funke',
    emoji: '🔥',
    color: '#CD7F32',
    glow: 'rgba(205,127,50,0.4)',
    levels: [1, 2],
    levelNames: ['Glut-Lehrling', 'Marinier-Meister'],
    tagline: 'Feuer machen kann jeder. Feuer beherrschen ist die Kunst.',
    kompetenzen: [
      'Grillarten verstehen: Holzkohle, Gas, Pellet, Keramik',
      'Direkte vs. indirekte Hitze einsetzen',
      'Temperaturzonen auf dem Rost einteilen',
      'Sicherheitsregeln & Brandschutz',
      'Grundlagen Dry Rubs & Marinaden',
      'Salzen: Wann, wie viel, warum?',
      'Timing beim Würzen verstehen',
    ],
    lernmethoden: [
      { icon: '🎮', label: 'Drag & Drop',     desc: 'Kohle-Zonen auf dem Rost korrekt platzieren' },
      { icon: '⏱️', label: 'Timer-Challenge', desc: 'Wie lange darf ein Rub einziehen? Raten & testen' },
      { icon: '🎯', label: 'Matching-Quiz',   desc: 'Gewürze den richtigen Fleischsorten zuordnen' },
      { icon: '📹', label: 'Marco erklärt',   desc: '2-Min-Video: Kohle richtig anzünden' },
    ],
    pruefung: '10 Multiple-Choice-Fragen · Bestehensgrenze: 70% · Wiederholung nach 24h',
    badge: 'Glut-Lehrling Zertifikat',
  },
  {
    id: 2,
    cert: 'Silber-Zertifikat',
    title: 'Die Flamme Bezähmen',
    emoji: '🌡️',
    color: '#C0C0C0',
    glow: 'rgba(192,192,192,0.4)',
    levels: [3, 4],
    levelNames: ['Onglet-Kenner', 'Dry-Ager'],
    tagline: 'Du weißt, was auf den Grill kommt — und warum.',
    kompetenzen: [
      'Fleischanatomie: Muskelgruppen & Schnitte',
      'Cuts erkennen: Ribeye, Brisket, Onglet, Tomahawk & Co.',
      'Marmorierung beurteilen',
      'Wet Aging vs. Dry Aging: Unterschiede & Anwendung',
      'Optimale Lagertemperaturen & Bedingungen',
      'Fleischqualität beim Einkauf beurteilen',
    ],
    lernmethoden: [
      { icon: '🗺️', label: 'Anatomie-Map',      desc: 'Klick auf das Rind: Welcher Cut kommt woher?' },
      { icon: '🔬', label: 'Zoom-Karte',         desc: 'Marmorierung mikroskopisch erkennen — gut vs. schlecht' },
      { icon: '🃏', label: 'Flashcards',         desc: 'Cut-Name → Charakteristik → Garmethode in 60 Sek.' },
      { icon: '📊', label: 'Vergleichs-Slider',  desc: 'Wet Aged vs. Dry Aged: Textur, Geschmack, Preis' },
    ],
    pruefung: '15 Fragen inkl. Bildidentifikation von Cuts · Bestehensgrenze: 75%',
    badge: 'Fleischkenner Zertifikat',
  },
  {
    id: 3,
    cert: 'Gold-Zertifikat',
    title: 'Hitzekontrolle',
    emoji: '🎯',
    color: '#FFD700',
    glow: 'rgba(255,215,0,0.4)',
    levels: [5, 6],
    levelNames: ['Flammen-Virtuose', 'Cuts-Experte'],
    tagline: 'Präzision trennt den Hobbykoch vom Profi.',
    kompetenzen: [
      'Kerntemperaturen für alle Fleischarten beherrschen',
      'Reverse Sear Methode anwenden',
      'Die perfekte Kruste erzeugen (Maillard-Reaktion)',
      'Sous-Vide-Grillen als Hybridmethode',
      'Internationale Cuts: Wagyu, Angus, Iberico',
      'Herkunftsländer & Qualitätsstandards kennen',
      'Rasse, Fütterung & Haltung als Qualitätsfaktoren',
    ],
    lernmethoden: [
      { icon: '🌡️', label: 'Thermometer-Simulator', desc: 'Virtuelle Sonde: Richtige Einstichstelle wählen' },
      { icon: '🌍', label: 'World-Tour Quiz',        desc: 'Cut aus Herkunftsland und Rasse identifizieren' },
      { icon: '⚗️', label: 'Reaktions-Labor',         desc: 'Maillard-Animation: Was passiert bei 140°C?' },
      { icon: '🏆', label: 'Streak-Challenge',        desc: '5 Kerntemperaturen in Folge korrekt = Bonus-Badge' },
    ],
    pruefung: '20 Fragen + 1 Praxis-Fallstudie: Garplan für ein 4-Gang-BBQ-Menü erstellen',
    badge: 'Präzisions-Griller Zertifikat',
  },
  {
    id: 4,
    cert: 'Platin-Zertifikat',
    title: 'Präzision & Geschmack',
    emoji: '💨',
    color: '#E5E4E2',
    glow: 'rgba(229,228,226,0.5)',
    levels: [7, 8],
    levelNames: ['Smoke-Artist', 'Thermometer-Profi'],
    tagline: 'Low & Slow ist eine Philosophie, kein Rezept.',
    kompetenzen: [
      'Smoker bedienen: Offset, Kettle, Pellet, Keramik',
      'Holzarten & Raucharomen gezielt einsetzen',
      'Smoke Ring erzeugen und verstehen',
      'BBQ-Wissenschaft: Kollagenabbau, Stall-Phase',
      'Proteinstruktur & Saftigkeit verstehen',
      'Lebensmittelhygiene & HACCP-Grundlagen',
      'Planung & Logistik großer Grillveranstaltungen',
    ],
    lernmethoden: [
      { icon: '🌲', label: 'Holz-Wheel',  desc: 'Spin & Match: Welches Holz für welches Fleisch?' },
      { icon: '📈', label: 'Stall-Kurve', desc: 'Interaktives Diagramm: Temperatur über Zeit tracken' },
      { icon: '🔊', label: 'Audio-Guide', desc: 'Hör den Smoker: Wann ist das Holz zu nass?' },
      { icon: '📋', label: 'Event-Planer', desc: 'Simuliere: Catering für 50 Personen kalkulieren' },
    ],
    pruefung: '25 Fragen + Smoke-Protokoll ausfüllen + Zeitplan für ein BBQ-Event erstellen',
    badge: 'BBQ-Scientist Zertifikat',
  },
  {
    id: 5,
    cert: 'Meister-Diplom',
    title: 'Der vollendete Pitmaster',
    emoji: '👑',
    color: '#FF6B35',
    glow: 'rgba(255,107,53,0.5)',
    levels: [9, 10],
    levelNames: ['Wagyu-Sommelier', 'Master of Steak'],
    tagline: 'Du kennst das Steak von der Weide bis zum Teller.',
    kompetenzen: [
      'Wagyu-Sensorik: BMS-Score, Marmorierung verkosten',
      'Foodpairing & Foodcompleting meistern',
      'Weinbegleitung & Getränkeempfehlungen',
      'Wettbewerbsgrillen (KCBS, SCA, GBA-Standards)',
      'Präsentation & Anrichten auf Profiniveau',
      'Kundenberatung & Wissensvermittlung',
      'Eigene Kurse & Events konzipieren und leiten',
    ],
    lernmethoden: [
      { icon: '👁️', label: 'Wagyu-Loupe',     desc: 'Marmorierungs-Stufen im Detail per Zoom erkennen' },
      { icon: '🍷', label: 'Pairing-Lab',      desc: 'Interaktives Matching: Steak + Wein + Beilage' },
      { icon: '🏅', label: 'KCBS-Simulator',   desc: 'Bewerte 5 virtuelle Briskets nach Wettbewerbsregeln' },
      { icon: '🎤', label: 'Kurs-Creator',     desc: 'Entwickle dein eigenes Mini-Modul: erkläre es Marco' },
    ],
    pruefung: '30 Fragen + mündliche Videoprüfung: 5-Min-Erklärung zu einem Profi-Thema + Peer-Bewertung',
    badge: 'Meister-Diplom (postfähige Urkunde)',
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// DATA — Module Meta
// ═══════════════════════════════════════════════════════════════════════════

const moduleMeta: Record<ModuleKey, ModuleMeta> = {
  bronze: {
    title:       'Feuerzone',
    emoji:       '🔥',
    color:       '#CD7F32',
    glow:        'rgba(205,127,50,0.4)',
    stage:       1,
    badge:       'Glut-Lehrling',
    description: 'Kohle, Temperaturzonen, Sicherheit — die Grundlagen am Feuer.',
  },
  anatomie: {
    title:       'Anatomie & Cuts',
    emoji:       '🥩',
    color:       '#C0C0C0',
    glow:        'rgba(192,192,192,0.4)',
    stage:       2,
    badge:       'Fleischkenner',
    description: 'Welcher Cut kommt woher und wie wird er gegart?',
  },
  thermometer: {
    title:       'Kerntemperatur',
    emoji:       '🌡️',
    color:       '#FFD700',
    glow:        'rgba(255,215,0,0.4)',
    stage:       3,
    badge:       'Präzisions-Griller',
    description: 'Die exakte Temperatur für jedes Fleisch.',
    requires:    'anatomie',
  },
  holz: {
    title:       'Holz & Smoke',
    emoji:       '🌲',
    color:       '#E5E4E2',
    glow:        'rgba(229,228,226,0.5)',
    stage:       4,
    badge:       'BBQ-Scientist',
    description: 'Welches Holz für welches Aroma — Smoker beherrschen.',
    requires:    'thermometer',
  },
  kcbs: {
    title:       'KCBS-Wettbewerb',
    emoji:       '🏅',
    color:       '#FF6B35',
    glow:        'rgba(255,107,53,0.5)',
    stage:       5,
    badge:       'Master of Steak',
    description: 'Bewertungs-Standards der Wettbewerbsgrills.',
    requires:    'holz',
  },
};

const moduleOrder: ModuleKey[] = ['bronze', 'anatomie', 'thermometer', 'holz', 'kcbs'];

// ═══════════════════════════════════════════════════════════════════════════
// DATA — Quizzes (5 Fragen pro Modul)
// ═══════════════════════════════════════════════════════════════════════════

const quizzes: Record<ModuleKey, QuizQuestion[]> = {
  bronze: [
    {
      q: 'Wann ist Holzkohle bereit zum Grillen?',
      options: ['Sobald die Flammen lodern', 'Wenn schwarze Kohlen glühen', 'Sobald ein grauer Aschefilm sichtbar ist', 'Nach genau 5 Minuten'],
      correct: 2,
      explain: 'Grauer Aschefilm zeigt: gleichmäßige Glut, ideale Temperatur.',
    },
    {
      q: 'Welche Temperatur hat die direkte Hitze-Zone?',
      options: ['100-150 °C', '160-200 °C', '230-290 °C', '300-400 °C'],
      correct: 2,
      explain: '230-290 °C ist die Searing-Zone für die Maillard-Reaktion.',
    },
    {
      q: 'Wofür nutzt man indirekte Hitze?',
      options: ['Schnelles Anbraten', 'Große Stücke, Low & Slow', 'Maillard-Reaktion', 'Scharfes Angrillen'],
      correct: 1,
      explain: 'Indirekt = langsam und schonend für Brisket, Pulled Pork etc.',
    },
    {
      q: 'Was verhindert ein gefährliches Aufflackern?',
      options: ['Mehr Holzkohle nachlegen', 'Deckel schließen', 'Wasser drauf spritzen', 'Fett vom Fleisch schneiden'],
      correct: 1,
      explain: 'Sauerstoffmangel durch geschlossenen Deckel erstickt Flammen.',
    },
    {
      q: 'Mindest-Abstand Kohle zu Rost?',
      options: ['2-5 cm', '5-8 cm', '10-15 cm', '20-25 cm'],
      correct: 2,
      explain: '10-15 cm — sonst verbrennt das Fleisch außen, bevor es innen gar ist.',
    },
  ],
  anatomie: [
    { q: 'Aus welchem Teilstück ist ein Ribeye?', options: ['Bauch', 'Hohe Rippe', 'Hüfte', 'Schulter'], correct: 1, explain: 'Ribeye = Kern der hohen Rippe, stark marmoriert.' },
    { q: 'Wie heißt der Brustkern auf Englisch?', options: ['Sirloin', 'Brisket', 'Chuck', 'Flank'], correct: 1, explain: 'Brisket = Rinderbrust, der König der Low-&-Slow-Cuts.' },
    { q: 'Welcher Cut ist besonders stark marmoriert?', options: ['Filet', 'Onglet', 'Ribeye', 'Hüfte'], correct: 2, explain: 'Ribeye trägt das meiste intramuskuläre Fett — Geschmacks-Champion.' },
    { q: 'Dry-Aging-Dauer minimal für spürbaren Effekt?', options: ['3 Tage', '7 Tage', '21 Tage', '60 Tage'], correct: 2, explain: 'Ab 21 Tagen entstehen die typischen nussigen Aromen.' },
    { q: 'Optimale Fleisch-Lagertemperatur?', options: ['-2 bis 0 °C', '0 bis 2 °C', '2 bis 4 °C', '4 bis 6 °C'], correct: 1, explain: '0-2 °C maximiert Haltbarkeit ohne Gewebeschaden.' },
  ],
  thermometer: [
    { q: 'Kerntemperatur medium-rare beim Rind?', options: ['48-50 °C', '52-55 °C', '58-62 °C', '65-68 °C'], correct: 1, explain: '52-55 °C: rosa Kern, warm, juicy.' },
    { q: 'Hähnchenbrust sichere Endtemperatur?', options: ['62 °C', '68 °C', '72-75 °C', '85 °C'], correct: 2, explain: 'Ab 72 °C ist Salmonellen-Risiko gebannt — und noch saftig.' },
    { q: 'Schweinefilet ideal?', options: ['54 °C', '58-62 °C', '70 °C', '78 °C'], correct: 1, explain: 'Rosa Kern bei Schwein ist seit 2011 lebensmittel-rechtlich okay.' },
    { q: 'Was passiert ab 140 °C an der Fleischoberfläche?', options: ['Saftverlust', 'Maillard-Reaktion', 'Kollagenabbau', 'Verkohlung'], correct: 1, explain: 'Maillard = die Bräunungs-Reaktion, Aromen-Explosion.' },
    { q: 'Reverse Sear: Welche Reihenfolge?', options: ['Sear → Niedrig garen', 'Niedrig garen → Sear', 'Nur Sear', 'Nur niedrig garen'], correct: 1, explain: 'Erst sanft auf Kerntemperatur, dann scharf für die Kruste.' },
  ],
  holz: [
    { q: 'Hickory passt am besten zu?', options: ['Lachs', 'Geflügel zart', 'Brisket', 'Käse'], correct: 2, explain: 'Hickory ist robust — perfekt für Brisket und Pulled Pork.' },
    { q: 'Apfelholz-Aroma?', options: ['Stark, würzig', 'Mild, leicht süß', 'Bitter, scharf', 'Erdig, kräftig'], correct: 1, explain: 'Apfel ist sanft — ideal für Geflügel und Schwein.' },
    { q: 'Was ist ein Smoke Ring?', options: ['Werbe-Logo', 'Rosa Ring unter der Kruste', 'Rauch-Tornado im Smoker', 'Werkzeug'], correct: 1, explain: 'Stickstoff-Reaktion: rosa Verfärbung unter der Kruste, Zeichen guten Smokes.' },
    { q: 'Die Stall-Phase tritt typisch auf bei?', options: ['65-75 °C', '50-60 °C', '85-95 °C', '40-50 °C'], correct: 0, explain: 'Bei 65-75 °C verdunstet Wasser und kühlt die Oberfläche — Geduld!' },
    { q: 'Optimale Holz-Feuchtigkeit zum Räuchern?', options: ['0-5 %', '15-20 %', '30-35 %', '50-60 %'], correct: 1, explain: '15-20 % gibt sauberen Rauch ohne Bitterkeit.' },
  ],
  kcbs: [
    { q: 'Wie viele Hähnchenstücke kommen in die KCBS-Box?', options: ['1 ganzes Tier', '4 Brüste', '6 gleiche Stücke', '8 Schenkel'], correct: 2, explain: '6 einheitliche Stücke — Optik zählt.' },
    { q: 'KCBS-Brisket-Wettkampfgewicht typisch?', options: ['1-2 kg', '3-4 kg', '6-7 kg', '12-15 kg'], correct: 2, explain: 'Packer-Brisket mit Flat + Point, 6-7 kg sind Standard.' },
    { q: 'KCBS-Bewertungsskala pro Kriterium?', options: ['1-5', '1-10', '2-9', '6-9 + Disqualifikation'], correct: 3, explain: '6=durchschnittlich, 9=exzellent. Unter 6 = Disqualifikation.' },
    { q: 'Was zählt zum "Appearance"-Score?', options: ['Geschmack', 'Konsistenz', 'Optik in der Turn-In-Box', 'Geruch'], correct: 2, explain: 'Box-Layout, Farbe, Glanz — der erste Eindruck zählt.' },
    { q: 'Standard-KCBS-Turn-In-Box?', options: ['Eigene Box', 'Styropor, weiß, 9×9 inch', 'Holzkiste', 'Glasdose'], correct: 1, explain: 'Weiße Styropor-Box, einheitlich 9×9 inch.' },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// DATA — Flashcards (8 Karten pro Modul)
// ═══════════════════════════════════════════════════════════════════════════

const flashcards: Record<ModuleKey, Flashcard[]> = {
  bronze: [
    { front: 'Direkte Hitze',          back: '230-290 °C · Maillard, schnelles Anbraten' },
    { front: 'Indirekte Hitze',        back: '150-180 °C · Low & Slow, schonend gleichmäßig' },
    { front: 'Aschefilm',              back: 'Grauer Belag = Kohle ist bereit, gleichmäßige Glut' },
    { front: 'Maillard-Reaktion',      back: 'Bräunung & Aromen · startet ab ~140 °C' },
    { front: 'Reverse Sear',           back: 'Erst niedrig garen, dann kurz scharf für Kruste' },
    { front: 'Deckel zu',              back: 'Erstickt Aufflackern, hält Temperatur konstant' },
    { front: 'Abstand Rost zu Kohle',  back: '10-15 cm · Standard für gleichmäßiges Garen' },
    { front: 'Salz-Timing',            back: 'Direkt vor dem Grillen oder ≥40 Min davor' },
  ],
  anatomie: [
    { front: 'Ribeye',     back: 'Hohe Rippe · Direkt grillen, medium-rare' },
    { front: 'Brisket',    back: 'Rinderbrust · Low & Slow, 12-16 h smoken' },
    { front: 'Onglet',     back: 'Zwerchfellpfeiler · scharf anbraten, rare bis medium-rare' },
    { front: 'Tomahawk',   back: 'Ribeye mit langem Knochen · Reverse Sear, ~600 g pro Person' },
    { front: 'Picanha',    back: 'Tafelspitz (Sirloin Cap) · BR-BBQ, mit Fettkappe' },
    { front: 'Flank Steak',back: 'Bauchlappen · marinieren, quer zur Faser schneiden' },
    { front: 'Hanger Steak',back:'Onglet-Verwandter · hängt am Zwerchfell, intensiv im Geschmack' },
    { front: 'Wagyu A5',   back: 'Japan-Top · BMS 8-12, sehr dünn aufgeschnitten kurz braten' },
  ],
  thermometer: [
    { front: 'Rind rare',         back: '48-52 °C · roter Kern, weich' },
    { front: 'Rind medium-rare',  back: '52-55 °C · rosa Kern, juicy' },
    { front: 'Rind medium',       back: '55-60 °C · rosa-grau, fester' },
    { front: 'Rind well-done',    back: '65+ °C · durch, deutlicher Saftverlust' },
    { front: 'Schwein Filet',     back: '58-62 °C · zart-rosa Kern (seit 2011 erlaubt)' },
    { front: 'Hähnchen Brust',    back: '72-75 °C · weiß, sicher, noch saftig' },
    { front: 'Lachs',             back: '52-55 °C · mi-cuit, glasig opak' },
    { front: 'Lamm Rücken',       back: '58-62 °C · medium-rare, rosé' },
  ],
  holz: [
    { front: 'Hickory',  back: 'Stark würzig · Brisket, Pulled Pork, Ribs' },
    { front: 'Apfel',    back: 'Mild, leicht süß · Geflügel, Schwein, Fisch' },
    { front: 'Kirsche',  back: 'Süßlich, färbt rot · Geflügel, Lamm' },
    { front: 'Mesquite', back: 'Sehr intensiv, erdig · Beef, kurze Sessions' },
    { front: 'Buche',    back: 'Mittel, neutral · Allrounder, Fisch' },
    { front: 'Walnuss',  back: 'Stark, kann bitter werden · Wild, Rind sparsam' },
    { front: 'Ahorn',    back: 'Süß, mild · Geflügel, Schinken' },
    { front: 'Pekan',    back: 'Süßlich-nussig · Schwein, Geflügel' },
  ],
  kcbs: [
    { front: 'Chicken',     back: '6 gleiche Stücke · Turn-In 12:00' },
    { front: 'Pork Ribs',   back: 'St. Louis oder Baby Back · Turn-In 12:30' },
    { front: 'Pork',        back: 'Schulter/Butt 4-6 kg · Turn-In 13:00' },
    { front: 'Brisket',     back: 'Flat oder Point, 6-7 kg · Turn-In 13:30' },
    { front: 'Appearance',  back: 'Score 6-9 · Box-Layout, Farbe, Glanz' },
    { front: 'Taste',       back: 'Score 6-9 · der wichtigste Faktor' },
    { front: 'Tenderness',  back: 'Score 6-9 · zart, aber nicht zerfallend' },
    { front: 'DQ-Gründe',   back: 'Falsche Garnitur, Box-Sticker fehlt, Sauce-Pool' },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// DATA — Feuerzonen-Spiel
// ═══════════════════════════════════════════════════════════════════════════

const feuerzoneItems: FeuerzoneItem[] = [
  { id: 'steak',   label: 'Steak',    emoji: '🥩', correctZone: 'direkte',   explain: 'Direkte Hitze für die perfekte Kruste (Maillard-Reaktion).' },
  { id: 'wurst',   label: 'Wurst',    emoji: '🌭', correctZone: 'direkte',   explain: 'Schnelles Bräunen, direkt servieren.' },
  { id: 'haehn',   label: 'Hähnchen', emoji: '🍗', correctZone: 'indirekte', explain: 'Indirekt durchgaren — innen 75 °C, sicher und saftig.' },
  { id: 'brisket', label: 'Brisket',  emoji: '🐂', correctZone: 'indirekte', explain: 'Low & Slow: 110-120 °C über 12-16 Stunden.' },
  { id: 'gemuese', label: 'Gemüse',   emoji: '🥦', correctZone: 'ruhe',      explain: 'Ruhezone: sanfte Hitze, keine Verkohlung.' },
  { id: 'fisch',   label: 'Fisch',    emoji: '🐟', correctZone: 'abdeck',    explain: 'Abdeckzone mit Deckel: schonend, gleichmäßig.' },
];

const zoneMeta: Record<ZoneKey, { label: string; temp: string; color: string }> = {
  direkte:   { label: 'Direkte Hitze',   temp: '230-290 °C', color: '#E53935' },
  indirekte: { label: 'Indirekte Hitze', temp: '150-180 °C', color: '#FB8C00' },
  ruhe:      { label: 'Ruhezone',        temp: '100-130 °C', color: '#FBC02D' },
  abdeck:    { label: 'Abdeckzone',      temp: '90-110 °C',  color: '#43A047' },
};

// ═══════════════════════════════════════════════════════════════════════════
// HOOK — useProgress (localStorage, SSR-safe)
// ═══════════════════════════════════════════════════════════════════════════

const STORAGE_KEY = 'steakakademie_progress';
const defaultProgress: Progress = {
  bestandene_module: [],
  quiz_scores:       {},
  badges:            [],
  streak_count:      0,
};

function useProgress() {
  const [progress, setProgress] = useState<Progress>(defaultProgress);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Progress>;
        setProgress({ ...defaultProgress, ...parsed });
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  const persist = useCallback((next: Progress) => {
    setProgress(next);
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }, []);

  const completeModule = useCallback(
    (key: ModuleKey, score: number): string => {
      const badge = moduleMeta[key].badge;
      setProgress((prev) => {
        const next: Progress = {
          ...prev,
          bestandene_module: prev.bestandene_module.includes(key)
            ? prev.bestandene_module
            : [...prev.bestandene_module, key],
          quiz_scores: {
            ...prev.quiz_scores,
            [key]: Math.max(score, prev.quiz_scores[key] ?? 0),
          },
          badges: prev.badges.includes(badge)
            ? prev.badges
            : [...prev.badges, badge],
        };
        if (typeof window !== 'undefined') {
          try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
        }
        return next;
      });
      return badge;
    },
    [],
  );

  const bumpStreak = useCallback(() => {
    setProgress((prev) => {
      const next: Progress = { ...prev, streak_count: prev.streak_count + 1 };
      if (typeof window !== 'undefined') {
        try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      }
      return next;
    });
  }, []);

  const resetStreak = useCallback(() => {
    setProgress((prev) => {
      if (prev.streak_count === 0) return prev;
      const next: Progress = { ...prev, streak_count: 0 };
      if (typeof window !== 'undefined') {
        try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      }
      return next;
    });
  }, []);

  const resetAll = useCallback(() => {
    persist(defaultProgress);
  }, [persist]);

  const isUnlocked = useCallback(
    (key: ModuleKey): boolean => {
      const meta = moduleMeta[key];
      if (!meta.requires) return true;
      const reqScore = progress.quiz_scores[meta.requires] ?? 0;
      return reqScore >= 4;
    },
    [progress.quiz_scores],
  );

  return { progress, hydrated, completeModule, bumpStreak, resetStreak, resetAll, isUnlocked };
}

// ═══════════════════════════════════════════════════════════════════════════
// HOOK — useBanner (3-Sekunden-Auto-Dismiss)
// ═══════════════════════════════════════════════════════════════════════════

type BannerMsg = { text: string; color: string } | null;

function useBanner(): [BannerMsg, (msg: BannerMsg) => void] {
  const [banner, setBanner] = useState<BannerMsg>(null);

  useEffect(() => {
    if (!banner) return;
    const t = window.setTimeout(() => setBanner(null), 3000);
    return () => window.clearTimeout(t);
  }, [banner]);

  return [banner, setBanner];
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function DiplomeRoadmapPage() {
  const [view, setView] = useState<ViewKey>('roadmap');
  const prog = useProgress();
  const [banner, setBanner] = useBanner();

  function tryOpenModule(key: ModuleKey) {
    if (!prog.isUnlocked(key)) {
      const reqKey = moduleMeta[key].requires!;
      setBanner({
        text: `🔒 Schließe zuerst Stufe ${moduleMeta[reqKey].stage} (${moduleMeta[reqKey].title}) ab`,
        color: T.gold,
      });
      return;
    }
    setView(key);
  }

  function handleQuizComplete(key: ModuleKey, score: number) {
    const badge = prog.completeModule(key, score);
    setBanner({ text: `🏅 ${badge} freigeschaltet!`, color: moduleMeta[key].color });
  }

  function handleStreakHit() {
    prog.bumpStreak();
  }

  // Streak-Banner ab 5
  useEffect(() => {
    if (prog.progress.streak_count > 0 && prog.progress.streak_count % 5 === 0) {
      setBanner({ text: `🔥 Streak! ${prog.progress.streak_count} richtige in Folge`, color: T.fire });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prog.progress.streak_count]);

  function handleReset() {
    if (typeof window === 'undefined') return;
    if (window.confirm('Fortschritt komplett zurücksetzen? Dies kann nicht rückgängig gemacht werden.')) {
      prog.resetAll();
      setBanner({ text: '✓ Fortschritt zurückgesetzt', color: T.textMuted });
    }
  }

  return (
    <>
      <Header />
      <main className="bg-surface-base min-h-screen relative">

        {banner && <Banner text={banner.text} color={banner.color} />}

        {/* Breadcrumb */}
        <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <nav className="flex items-center justify-between gap-4" aria-label="Breadcrumb">
            <div className="flex items-center gap-1.5 text-xs font-sans text-text-light/30">
              <Link href="/" className="hover:text-brand-gold transition-colors">Start</Link>
              <ChevronRight size={12} />
              <Link href="/diplome" className="hover:text-brand-gold transition-colors">Diplom-System</Link>
              <ChevronRight size={12} />
              {view === 'roadmap' ? (
                <span className="text-text-light/50">Roadmap</span>
              ) : (
                <>
                  <button
                    onClick={() => setView('roadmap')}
                    className="hover:text-brand-gold transition-colors"
                  >Roadmap</button>
                  <ChevronRight size={12} />
                  <span className="text-text-light/50">{moduleMeta[view].title}</span>
                </>
              )}
            </div>
            {prog.hydrated && (prog.progress.bestandene_module.length > 0 || prog.progress.streak_count > 0) && (
              <button
                onClick={handleReset}
                className="text-[10px] font-sans text-text-light/20 hover:text-text-light/50 transition-colors"
                title="Fortschritt zurücksetzen"
              >Fortschritt zurücksetzen</button>
            )}
          </nav>
        </div>

        {view === 'roadmap' ? (
          <RoadmapView
            isUnlocked={prog.isUnlocked}
            completedModules={prog.progress.bestandene_module}
            onOpenModule={tryOpenModule}
          />
        ) : (
          <ModuleView
            moduleKey={view}
            onBack={() => setView('roadmap')}
            onQuizComplete={(score) => handleQuizComplete(view, score)}
            onStreakHit={handleStreakHit}
            onStreakBreak={prog.resetStreak}
            streakCount={prog.progress.streak_count}
            bestScore={prog.progress.quiz_scores[view] ?? 0}
            completed={prog.progress.bestandene_module.includes(view)}
          />
        )}
      </main>
      <Footer />
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT — Banner
// ═══════════════════════════════════════════════════════════════════════════

function Banner({ text, color }: { text: string; color: string }) {
  return (
    <div
      className="fixed top-20 left-1/2 -translate-x-1/2 z-50 rounded-xl px-6 py-3 font-sans text-sm font-bold shadow-2xl pointer-events-none"
      style={{
        background: `linear-gradient(135deg, ${color}, ${color}dd)`,
        color: '#0a0a0a',
        boxShadow: `0 8px 32px ${color}66`,
        animation: 'sk-banner-in 0.25s ease-out',
      }}
      role="status"
    >
      {text}
      <style>{`
        @keyframes sk-banner-in {
          from { opacity: 0; transform: translate(-50%, -8px); }
          to   { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT — RoadmapView (5 Stufen Overview)
// ═══════════════════════════════════════════════════════════════════════════

function RoadmapView({
  isUnlocked,
  completedModules,
  onOpenModule,
}: {
  isUnlocked: (key: ModuleKey) => boolean;
  completedModules: ModuleKey[];
  onOpenModule: (key: ModuleKey) => void;
}) {
  const [active, setActive] = useState(0);
  const [expanded, setExpanded] = useState<ExpandKey>(null);
  const s = stages[active];
  const stageModuleKey = moduleOrder[active];
  const unlocked = isUnlocked(stageModuleKey);
  const completed = completedModules.includes(stageModuleKey);

  return (
    <>
      {/* Header strip */}
      <div className="border-b border-brand-gold/10 mt-4" style={{ background: T.bgGradient }}>
        <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center gap-4">
          <div className="text-3xl">🥩</div>
          <div>
            <div className="text-[10px] font-sans font-bold tracking-[0.18em] uppercase text-brand-fire mb-1">
              Steakakademie · Diplom-System
            </div>
            <div className="font-serif text-xl font-bold" style={{ color: T.textGold }}>
              Grillmeister-Ausbildung in 5 Stufen
            </div>
          </div>
        </div>
      </div>

      {/* Stage Navigator */}
      <div className="bg-surface-dark border-b border-border-subtle">
        <div
          className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-5 flex gap-2 overflow-x-auto"
          style={{ scrollbarWidth: 'none' }}
        >
          {stages.map((st, i) => {
            const mKey = moduleOrder[i];
            const stageUnlocked = isUnlocked(mKey);
            const stageDone = completedModules.includes(mKey);
            return (
              <button
                key={i}
                onClick={() => { setActive(i); setExpanded(null); }}
                className="flex-none rounded-xl p-3 text-center min-w-[110px] transition-all relative"
                style={{
                  background: active === i ? `linear-gradient(135deg, ${st.color}22, ${st.color}44)` : T.panelAlt,
                  border: active === i ? `1px solid ${st.color}` : `1px solid ${T.borderMuted}`,
                  boxShadow: active === i ? `0 0 16px ${st.glow}` : 'none',
                }}
              >
                <div className="text-xl mb-1">{stageDone ? '✓' : (stageUnlocked ? st.emoji : '🔒')}</div>
                <div className="text-[10px] font-sans tracking-[0.12em] uppercase" style={{ color: active === i ? st.color : T.textDim }}>
                  Stufe {st.id}
                </div>
                <div className="text-[11px] font-sans mt-0.5" style={{ color: active === i ? T.text : T.textFaint }}>
                  {st.cert.split('-')[0]}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Stage Hero */}
        <div
          className="relative overflow-hidden rounded-2xl p-7 mb-7"
          style={{
            background: `linear-gradient(135deg, ${s.color}15 0%, ${T.bg} 60%)`,
            border: `1px solid ${s.color}40`,
            boxShadow: `0 0 40px ${s.glow}`,
          }}
        >
          <div className="absolute -top-5 -right-5 leading-none pointer-events-none" style={{ fontSize: '100px', opacity: 0.06 }} aria-hidden>
            {s.emoji}
          </div>
          <div className="text-[11px] font-sans tracking-[0.18em] uppercase mb-2" style={{ color: s.color }}>
            Stufe {s.id} · {s.cert}
          </div>
          <div className="font-serif text-2xl lg:text-3xl font-bold text-text-primary mb-2">
            {s.emoji} {s.title}
          </div>
          <div className="font-serif italic text-text-secondary mb-4 text-sm sm:text-base">
            „{s.tagline}"
          </div>
          <div className="flex gap-2 flex-wrap mb-5">
            {s.levels.map((lv, i) => (
              <span
                key={i}
                className="rounded-full px-3 py-1 text-[11px] font-sans"
                style={{ background: `${s.color}20`, border: `1px solid ${s.color}50`, color: s.color }}
              >
                Level {lv}: {s.levelNames[i]}
              </span>
            ))}
          </div>

          {/* Module-CTA */}
          <button
            onClick={() => onOpenModule(stageModuleKey)}
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-sans font-bold text-[12px] tracking-wider uppercase transition-all"
            style={{
              background: unlocked
                ? `linear-gradient(135deg, ${s.color}, ${s.color}cc)`
                : T.panel,
              color: unlocked ? T.bg : T.textDim,
              border: unlocked ? 'none' : `1px solid ${T.borderMuted}`,
              boxShadow: unlocked ? `0 4px 16px ${s.glow}` : 'none',
              cursor: 'pointer',
            }}
          >
            {!unlocked && '🔒 '}
            {completed ? '✓ ' : ''}
            {moduleMeta[stageModuleKey].emoji} Modul öffnen: {moduleMeta[stageModuleKey].title} →
          </button>
        </div>

        {/* Expand sections */}
        <div className="flex flex-col gap-4">
          <ExpandSection
            expanded={expanded === 'komp'}
            onToggle={() => setExpanded(expanded === 'komp' ? null : 'komp')}
            icon="📚"
            title="Lernziele & Kompetenzen"
            subtitle={`${s.kompetenzen.length} Kernthemen dieser Stufe`}
            color={s.color}
          >
            <div className="flex flex-col gap-2 pt-4">
              {s.kompetenzen.map((k, i) => (
                <div key={i} className="flex items-start gap-2.5 text-[13px] font-sans" style={{ color: T.card }}>
                  <span style={{ color: s.color, marginTop: '1px' }}>✦</span>
                  {k}
                </div>
              ))}
            </div>
          </ExpandSection>

          <ExpandSection
            expanded={expanded === 'learn'}
            onToggle={() => setExpanded(expanded === 'learn' ? null : 'learn')}
            icon="🎮"
            title="Spielerische Lernmethoden"
            subtitle="Interaktiv · KI-gestützt · Gamified"
            color={s.color}
          >
            <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {s.lernmethoden.map((m, i) => (
                <div key={i} className="rounded-xl p-3" style={{ background: `${s.color}10`, border: `1px solid ${s.color}25` }}>
                  <div className="text-xl mb-1.5">{m.icon}</div>
                  <div className="text-xs font-sans font-bold mb-1" style={{ color: s.color }}>{m.label}</div>
                  <div className="text-[11px] font-sans leading-snug" style={{ color: T.textMuted }}>{m.desc}</div>
                </div>
              ))}
            </div>
          </ExpandSection>

          <ExpandSection
            expanded={expanded === 'pruef'}
            onToggle={() => setExpanded(expanded === 'pruef' ? null : 'pruef')}
            icon="🏅"
            title="Prüfung & Abschluss"
            subtitle={s.badge}
            color={s.color}
          >
            <div className="pt-4">
              <div
                className="rounded-xl p-4 text-[13px] font-sans leading-relaxed mb-3"
                style={{ background: `${s.color}15`, border: `1px solid ${s.color}30`, color: T.card }}
              >
                📋 {s.pruefung}
              </div>
              <div className="flex items-center gap-2.5 rounded-xl px-4 py-3" style={{ background: T.bg }}>
                <span className="text-2xl">🏆</span>
                <div>
                  <div className="text-[11px] font-sans text-text-muted mb-0.5">Bei Bestehen erhältst du</div>
                  <div className="text-[13px] font-sans font-bold" style={{ color: s.color }}>{s.badge}</div>
                </div>
                {s.id === 5 && (
                  <div
                    className="ml-auto rounded-lg px-2.5 py-1 text-[10px] font-sans tracking-wider"
                    style={{ background: `${s.color}20`, border: `1px solid ${s.color}`, color: s.color }}
                  >
                    ✉️ Urkunde per Post
                  </div>
                )}
              </div>
            </div>
          </ExpandSection>
        </div>

        {/* Progress Bar */}
        <div className="mt-8 p-5 rounded-2xl border border-border-subtle bg-surface-dark">
          <div className="text-[11px] font-sans tracking-[0.18em] uppercase text-text-muted mb-3">
            Gesamtpfad zur Meisterschaft
          </div>
          <div className="flex gap-1.5 items-center">
            {stages.map((st, i) => {
              const mKey = moduleOrder[i];
              const done = completedModules.includes(mKey);
              return (
                <div key={i} className="flex items-center flex-1">
                  <button
                    onClick={() => { setActive(i); setExpanded(null); }}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all flex-none"
                    style={{
                      background: done || i <= active ? `linear-gradient(135deg, ${st.color}, ${st.color}88)` : T.borderSubtle,
                      border: i === active ? `2px solid ${st.color}` : `2px solid ${T.borderMuted}`,
                      boxShadow: i === active ? `0 0 12px ${st.glow}` : 'none',
                    }}
                    aria-label={`Springe zu Stufe ${st.id}`}
                  >
                    {done ? '✓' : st.emoji}
                  </button>
                  {i < stages.length - 1 && (
                    <div
                      className="flex-1 h-px"
                      style={{
                        background:
                          done || i < active
                            ? `linear-gradient(90deg, ${st.color}, ${stages[i + 1].color})`
                            : T.borderSubtle,
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-2">
            {stages.map((st, i) => (
              <div
                key={i}
                className="text-[9px] font-sans uppercase tracking-wider text-center flex-1"
                style={{ color: i === active ? st.color : T.textFaint }}
              >
                {st.cert.split('-')[0]}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-7 pb-4">
          <Link
            href="/diplome"
            className="inline-block uppercase font-sans font-bold text-[13px] tracking-wider px-7 py-3 rounded-full text-ink"
            style={{
              background: `linear-gradient(135deg, ${s.color}, ${s.color}99)`,
              boxShadow: `0 4px 20px ${s.glow}`,
            }}
          >
            Zurück zum Diplom-System →
          </Link>
          <div className="mt-2.5 text-[11px] font-sans" style={{ color: T.textFaint }}>
            steakakademie.de/diplome · Kostenlos starten
          </div>
        </div>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT — ModuleView (Lerninhalte / Quiz / Flashcards Tabs)
// ═══════════════════════════════════════════════════════════════════════════

function ModuleView({
  moduleKey,
  onBack,
  onQuizComplete,
  onStreakHit,
  onStreakBreak,
  streakCount,
  bestScore,
  completed,
}: {
  moduleKey: ModuleKey;
  onBack: () => void;
  onQuizComplete: (score: number) => void;
  onStreakHit: () => void;
  onStreakBreak: () => void;
  streakCount: number;
  bestScore: number;
  completed: boolean;
}) {
  const meta = moduleMeta[moduleKey];
  const stage = stages[meta.stage - 1];
  const [tab, setTab] = useState<TabKey>('lerninhalte');

  return (
    <>
      {/* Module Header */}
      <div
        className="border-b mt-4"
        style={{
          background: `linear-gradient(135deg, ${meta.color}18 0%, ${T.bg} 80%)`,
          borderColor: `${meta.color}30`,
        }}
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-7">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-[11px] font-sans uppercase tracking-wider mb-4 hover:opacity-80 transition-opacity"
            style={{ color: meta.color }}
          >
            <ArrowLeft size={14} /> Zurück zur Roadmap
          </button>
          <div className="text-[11px] font-sans tracking-[0.18em] uppercase mb-2" style={{ color: meta.color }}>
            Stufe {meta.stage} · {stage.cert}
          </div>
          <div className="font-serif text-2xl lg:text-3xl font-bold text-text-primary mb-2">
            {meta.emoji} {meta.title}
          </div>
          <div className="text-sm font-sans mb-4" style={{ color: T.textMuted }}>
            {meta.description}
          </div>
          <div className="flex gap-3 flex-wrap text-[11px] font-sans">
            {completed && (
              <span className="rounded-full px-3 py-1" style={{ background: T.successBg, border: `1px solid ${T.success}40`, color: T.success }}>
                ✓ Abgeschlossen
              </span>
            )}
            {bestScore > 0 && (
              <span className="rounded-full px-3 py-1" style={{ background: `${meta.color}15`, border: `1px solid ${meta.color}40`, color: meta.color }}>
                Beste Quiz-Punktzahl: {bestScore}/{quizzes[moduleKey].length}
              </span>
            )}
            {streakCount > 0 && (
              <span className="rounded-full px-3 py-1" style={{ background: `${T.fire}15`, border: `1px solid ${T.fire}40`, color: T.fire }}>
                🔥 Streak: {streakCount}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-surface-dark border-b border-border-subtle">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {(
            [
              { key: 'lerninhalte', label: '📚 Lerninhalte' },
              { key: 'quiz',        label: '🎯 Quiz' },
              { key: 'flashcards',  label: '🃏 Flashcards' },
            ] as { key: TabKey; label: string }[]
          ).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="rounded-lg px-4 py-2 text-[12px] font-sans font-semibold transition-all"
              style={{
                background: tab === t.key ? `${meta.color}25` : 'transparent',
                color:      tab === t.key ? meta.color : T.textMuted,
                border:     tab === t.key ? `1px solid ${meta.color}60` : `1px solid transparent`,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {tab === 'lerninhalte' && <LerninhalteTab moduleKey={moduleKey} stage={stage} />}
        {tab === 'quiz' && (
          <Quiz
            moduleKey={moduleKey}
            onComplete={onQuizComplete}
            onStreakHit={onStreakHit}
            onStreakBreak={onStreakBreak}
          />
        )}
        {tab === 'flashcards' && <Flashcards moduleKey={moduleKey} />}
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT — LerninhalteTab
// ═══════════════════════════════════════════════════════════════════════════

function LerninhalteTab({ moduleKey, stage }: { moduleKey: ModuleKey; stage: Stage }) {
  const meta = moduleMeta[moduleKey];

  return (
    <div className="flex flex-col gap-6">
      {moduleKey === 'bronze' && (
        <FeuerzoneSpiel color={meta.color} />
      )}

      <div className="rounded-2xl p-6" style={{ background: T.panel, border: `1px solid ${T.border}` }}>
        <div className="text-[11px] font-sans tracking-[0.18em] uppercase mb-3" style={{ color: meta.color }}>
          Was du in diesem Modul lernst
        </div>
        <div className="flex flex-col gap-2.5">
          {stage.kompetenzen.map((k, i) => (
            <div key={i} className="flex items-start gap-2.5 text-[14px] font-sans" style={{ color: T.card }}>
              <span style={{ color: meta.color, marginTop: '2px' }}>✦</span>
              {k}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl p-6" style={{ background: T.panel, border: `1px solid ${T.border}` }}>
        <div className="text-[11px] font-sans tracking-[0.18em] uppercase mb-3" style={{ color: meta.color }}>
          So lernst du
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {stage.lernmethoden.map((m, i) => (
            <div key={i} className="rounded-xl p-3" style={{ background: `${meta.color}10`, border: `1px solid ${meta.color}25` }}>
              <div className="text-xl mb-1.5">{m.icon}</div>
              <div className="text-xs font-sans font-bold mb-1" style={{ color: meta.color }}>{m.label}</div>
              <div className="text-[11px] font-sans leading-snug" style={{ color: T.textMuted }}>{m.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT — FeuerzoneSpiel (Stufe 1 Bronze Spezial)
// ═══════════════════════════════════════════════════════════════════════════

function FeuerzoneSpiel({ color }: { color: string }) {
  const [placements, setPlacements] = useState<Partial<Record<string, ZoneKey>>>({});
  const [selected, setSelected]     = useState<string | null>(null);
  const [feedback, setFeedback]     = useState<{ id: string; correct: boolean; explain: string } | null>(null);

  function place(itemId: string, zone: ZoneKey) {
    const item = feuerzoneItems.find(i => i.id === itemId);
    if (!item) return;
    const correct = item.correctZone === zone;
    setPlacements(prev => ({ ...prev, [itemId]: zone }));
    setFeedback({ id: itemId, correct, explain: item.explain });
    setSelected(null);
  }

  function reset() {
    setPlacements({});
    setSelected(null);
    setFeedback(null);
  }

  const placedCount  = Object.keys(placements).length;
  const correctCount = feuerzoneItems.filter(i => placements[i.id] === i.correctZone).length;
  const allPlaced    = placedCount === feuerzoneItems.length;

  return (
    <div className="rounded-2xl p-6" style={{ background: T.panel, border: `1px solid ${T.border}` }}>
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="text-[11px] font-sans tracking-[0.18em] uppercase mb-1" style={{ color }}>
            🎮 Feuerzonen-Spiel
          </div>
          <div className="font-serif text-lg font-bold text-text-primary mb-1">
            Wo gehört welches Fleisch hin?
          </div>
          <div className="text-[12px] font-sans" style={{ color: T.textMuted }}>
            Wähle ein Item, dann klick auf die richtige Zone.
          </div>
        </div>
        <div className="text-right">
          <div className="text-[11px] font-sans uppercase tracking-wider" style={{ color: T.textDim }}>Stand</div>
          <div className="font-serif text-2xl font-bold" style={{ color: allPlaced && correctCount === feuerzoneItems.length ? T.success : color }}>
            {correctCount}/{feuerzoneItems.length}
          </div>
        </div>
      </div>

      {/* Grill SVG */}
      <div className="relative mb-4 rounded-xl overflow-hidden" style={{ background: '#1c1410', border: `1px solid ${T.borderMuted}` }}>
        <svg viewBox="0 0 400 280" className="w-full block" aria-label="Grill mit 4 Hitze-Zonen">
          <defs>
            <radialGradient id="sk-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="#FF6B35" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#FF6B35" stopOpacity="0" />
            </radialGradient>
          </defs>
          {/* Grill body */}
          <ellipse cx="200" cy="140" rx="180" ry="120" fill="#0a0a0a" stroke={T.borderMuted} strokeWidth="2" />
          <ellipse cx="200" cy="140" rx="170" ry="112" fill="url(#sk-glow)" opacity="0.4" />

          {/* 4 zones */}
          {(['direkte', 'indirekte', 'ruhe', 'abdeck'] as ZoneKey[]).map((zone, idx) => {
            const positions = [
              { x: 110, y: 100, w: 90, h: 90 },   // direkte (top-left)
              { x: 200, y: 100, w: 90, h: 90 },   // indirekte (top-right)
              { x: 110, y: 190, w: 90, h: 60 },   // ruhe (bottom-left)
              { x: 200, y: 190, w: 90, h: 60 },   // abdeck (bottom-right)
            ];
            const p  = positions[idx];
            const zm = zoneMeta[zone];
            const itemsInZone = feuerzoneItems.filter(i => placements[i.id] === zone);

            return (
              <g
                key={zone}
                onClick={() => selected && place(selected, zone)}
                style={{ cursor: selected ? 'pointer' : 'default' }}
              >
                <rect
                  x={p.x} y={p.y} width={p.w} height={p.h}
                  rx="6"
                  fill={`${zm.color}22`}
                  stroke={zm.color}
                  strokeWidth={selected ? 2 : 1}
                  strokeDasharray={selected ? '4 3' : '0'}
                  opacity={selected ? 1 : 0.7}
                />
                <text x={p.x + p.w / 2} y={p.y + 18} textAnchor="middle" fontSize="9" fontWeight="700" fill={zm.color} fontFamily="sans-serif">
                  {zm.label.toUpperCase()}
                </text>
                <text x={p.x + p.w / 2} y={p.y + 30} textAnchor="middle" fontSize="8" fill={T.textDim} fontFamily="sans-serif">
                  {zm.temp}
                </text>
                {itemsInZone.map((it, i) => (
                  <text
                    key={it.id}
                    x={p.x + 18 + (i % 3) * 24}
                    y={p.y + 55 + Math.floor(i / 3) * 22}
                    fontSize="18"
                  >
                    {it.emoji}
                  </text>
                ))}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Items */}
      <div className="flex flex-wrap gap-2 mb-3">
        {feuerzoneItems.map(item => {
          const placed = placements[item.id];
          const isSelected = selected === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                if (placed) return;
                setSelected(isSelected ? null : item.id);
              }}
              disabled={!!placed}
              className="rounded-lg px-3 py-2 flex items-center gap-2 text-[13px] font-sans transition-all"
              style={{
                background: isSelected ? `${color}30` : (placed ? T.borderSubtle : T.panelAlt),
                border:     isSelected ? `1px solid ${color}` : `1px solid ${T.borderMuted}`,
                color:      placed ? T.textDim : T.text,
                opacity:    placed ? 0.5 : 1,
                cursor:     placed ? 'default' : 'pointer',
              }}
            >
              <span className="text-base">{item.emoji}</span>
              {item.label}
              {placed && <span className="text-[10px]" style={{ color: T.textDim }}>· platziert</span>}
            </button>
          );
        })}
      </div>

      {/* Feedback */}
      {feedback && (
        <div
          className="rounded-lg p-3 text-[13px] font-sans mb-3"
          style={{
            background: feedback.correct ? T.successBg : T.errorBg,
            border:     `1px solid ${feedback.correct ? T.success : T.error}40`,
            color:      feedback.correct ? T.success : T.error,
          }}
        >
          {feedback.correct ? '✓ Richtig! ' : '✗ Nicht ganz. '}
          <span style={{ color: T.text }}>{feedback.explain}</span>
        </div>
      )}

      {/* Done */}
      {allPlaced && (
        <div className="flex items-center justify-between gap-3 rounded-xl p-3" style={{ background: `${color}15`, border: `1px solid ${color}40` }}>
          <div className="text-[13px] font-sans">
            {correctCount === feuerzoneItems.length
              ? `🎉 Alles korrekt! Jetzt das Quiz starten.`
              : `${correctCount}/${feuerzoneItems.length} richtig — kann besser, oder?`}
          </div>
          <button
            onClick={reset}
            className="rounded-md px-3 py-1.5 text-[11px] font-sans font-bold uppercase tracking-wider"
            style={{ background: T.panelAlt, color: T.text, border: `1px solid ${T.borderMuted}` }}
          >
            Neu starten
          </button>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT — Quiz
// ═══════════════════════════════════════════════════════════════════════════

function Quiz({
  moduleKey,
  onComplete,
  onStreakHit,
  onStreakBreak,
}: {
  moduleKey: ModuleKey;
  onComplete: (score: number) => void;
  onStreakHit: () => void;
  onStreakBreak: () => void;
}) {
  const questions = quizzes[moduleKey];
  const color     = moduleMeta[moduleKey].color;

  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers]   = useState<{ chosen: number; correct: boolean }[]>([]);
  const [showExplain, setShowExplain] = useState(false);
  const [finished, setFinished] = useState(false);

  function choose(idx: number) {
    if (selected !== null) return;
    const q = questions[current];
    const correct = idx === q.correct;
    setSelected(idx);
    setShowExplain(true);
    setAnswers(prev => [...prev, { chosen: idx, correct }]);
    if (correct) onStreakHit();
    else         onStreakBreak();
  }

  function next() {
    if (current + 1 >= questions.length) {
      const score = answers.filter(a => a.correct).length;
      setFinished(true);
      onComplete(score);
    } else {
      setCurrent(c => c + 1);
      setSelected(null);
      setShowExplain(false);
    }
  }

  function restart() {
    setCurrent(0);
    setSelected(null);
    setAnswers([]);
    setShowExplain(false);
    setFinished(false);
  }

  if (finished) {
    const score = answers.filter(a => a.correct).length;
    const passed = score >= 4;
    return (
      <div className="rounded-2xl p-8 text-center" style={{ background: T.panel, border: `1px solid ${color}40` }}>
        <div className="text-5xl mb-3">{passed ? '🏅' : '📚'}</div>
        <div className="font-serif text-2xl font-bold text-text-primary mb-2">
          {passed ? 'Modul bestanden!' : 'Knapp daneben'}
        </div>
        <div className="text-sm font-sans mb-4" style={{ color: T.textMuted }}>
          {score} von {questions.length} richtig{passed ? '' : ' — du brauchst mindestens 4'}.
        </div>
        <div className="flex gap-3 justify-center">
          <button
            onClick={restart}
            className="rounded-full px-5 py-2.5 font-sans font-bold text-[12px] tracking-wider uppercase"
            style={{
              background: passed ? T.panelAlt : `linear-gradient(135deg, ${color}, ${color}cc)`,
              color:      passed ? T.text : T.bg,
              border:     passed ? `1px solid ${T.borderMuted}` : 'none',
            }}
          >
            {passed ? 'Nochmal' : 'Erneut versuchen'}
          </button>
        </div>
      </div>
    );
  }

  const q = questions[current];

  return (
    <div className="rounded-2xl p-6" style={{ background: T.panel, border: `1px solid ${T.border}` }}>
      <div className="flex items-center justify-between mb-4">
        <div className="text-[11px] font-sans uppercase tracking-wider" style={{ color }}>
          Frage {current + 1} / {questions.length}
        </div>
        <div className="flex gap-1">
          {questions.map((_, i) => (
            <span
              key={i}
              className="w-2 h-2 rounded-full"
              style={{ background: i < current ? color : i === current ? `${color}aa` : T.borderMuted }}
            />
          ))}
        </div>
      </div>

      <div className="font-serif text-lg font-bold text-text-primary mb-5">
        {q.q}
      </div>

      <div className="flex flex-col gap-2.5 mb-4">
        {q.options.map((opt, i) => {
          const isCorrect = i === q.correct;
          const isChosen  = selected === i;
          const reveal    = selected !== null;
          let bg     = T.panelAlt;
          let border = T.borderMuted;
          let textCol = T.text;
          if (reveal) {
            if (isCorrect)         { bg = T.successBg; border = T.success; textCol = T.success; }
            else if (isChosen)     { bg = T.errorBg;   border = T.error;   textCol = T.error;   }
          }
          return (
            <button
              key={i}
              onClick={() => choose(i)}
              disabled={reveal}
              className="text-left rounded-lg px-4 py-3 text-[13px] font-sans transition-all"
              style={{
                background: bg,
                border:     `1px solid ${border}`,
                color:      textCol,
                cursor:     reveal ? 'default' : 'pointer',
              }}
            >
              <span style={{ color: T.textDim, marginRight: '8px' }}>{String.fromCharCode(65 + i)}.</span>
              {opt}
              {reveal && isCorrect && <span className="float-right">✓</span>}
              {reveal && isChosen && !isCorrect && <span className="float-right">✗</span>}
            </button>
          );
        })}
      </div>

      {showExplain && q.explain && (
        <div className="rounded-lg p-3 text-[13px] font-sans mb-4" style={{ background: T.panelAlt, color: T.textMuted }}>
          💡 {q.explain}
        </div>
      )}

      {selected !== null && (
        <button
          onClick={next}
          className="w-full rounded-full px-5 py-2.5 font-sans font-bold text-[12px] tracking-wider uppercase"
          style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)`, color: T.bg }}
        >
          {current + 1 >= questions.length ? 'Ergebnis sehen →' : 'Nächste Frage →'}
        </button>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT — Flashcards (CSS-Flip, Gewusst/Nochmal)
// ═══════════════════════════════════════════════════════════════════════════

function Flashcards({ moduleKey }: { moduleKey: ModuleKey }) {
  const all   = flashcards[moduleKey];
  const color = moduleMeta[moduleKey].color;

  // Stapel verwaltet als Indexe (FIFO mit Re-Insertion)
  const [stack, setStack]     = useState<number[]>(() => all.map((_, i) => i));
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown]     = useState<number[]>([]);

  // localStorage-Persistenz für Fortschritt (separate Key pro Modul)
  const lsKey = `steakakademie_flashcards_${moduleKey}`;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(lsKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { known: number[] };
      if (Array.isArray(parsed.known)) {
        setKnown(parsed.known);
        setStack(all.map((_, i) => i).filter(i => !parsed.known.includes(i)));
      }
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleKey]);

  function persistKnown(next: number[]) {
    setKnown(next);
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(lsKey, JSON.stringify({ known: next }));
    } catch {
      /* ignore */
    }
  }

  function markKnown() {
    const [head, ...rest] = stack;
    setStack(rest);
    setFlipped(false);
    if (head !== undefined && !known.includes(head)) {
      persistKnown([...known, head]);
    }
  }

  function markAgain() {
    const [head, ...rest] = stack;
    setStack([...rest, head!]);
    setFlipped(false);
  }

  function reset() {
    setStack(all.map((_, i) => i));
    setFlipped(false);
    persistKnown([]);
  }

  if (stack.length === 0) {
    return (
      <div className="rounded-2xl p-8 text-center" style={{ background: T.panel, border: `1px solid ${color}40` }}>
        <div className="text-5xl mb-3">🎓</div>
        <div className="font-serif text-2xl font-bold text-text-primary mb-2">
          Alle {all.length} Karten gewusst!
        </div>
        <div className="text-sm font-sans mb-4" style={{ color: T.textMuted }}>
          Fortschritt gespeichert — du kannst neu starten oder zur Quiz wechseln.
        </div>
        <button
          onClick={reset}
          className="rounded-full px-5 py-2.5 font-sans font-bold text-[12px] tracking-wider uppercase"
          style={{ background: T.panelAlt, color: T.text, border: `1px solid ${T.borderMuted}` }}
        >
          Stapel zurücksetzen
        </button>
      </div>
    );
  }

  const currentIdx = stack[0];
  const card       = all[currentIdx];

  return (
    <div className="flex flex-col gap-4">

      {/* Progress */}
      <div className="flex items-center justify-between text-[11px] font-sans uppercase tracking-wider">
        <span style={{ color }}>Karte {known.length + 1} / {all.length}</span>
        <span style={{ color: T.textDim }}>Stapel: {stack.length}</span>
      </div>

      {/* Card */}
      <div
        className="w-full [perspective:1200px] cursor-pointer"
        style={{ minHeight: '240px' }}
        onClick={() => setFlipped(f => !f)}
      >
        <div
          className="relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d]"
          style={{
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            minHeight: '240px',
          }}
        >
          {/* Vorderseite */}
          <div
            className="absolute inset-0 rounded-2xl p-8 flex flex-col items-center justify-center [backface-visibility:hidden]"
            style={{
              background: `linear-gradient(135deg, ${color}10 0%, ${T.panel} 70%)`,
              border:     `1px solid ${color}40`,
              boxShadow:  `0 8px 24px ${color}22`,
            }}
          >
            <div className="text-[11px] font-sans uppercase tracking-wider mb-3" style={{ color }}>
              Begriff
            </div>
            <div className="font-serif text-3xl font-bold text-text-primary text-center">
              {card.front}
            </div>
            <div className="text-[11px] font-sans mt-4" style={{ color: T.textDim }}>
              Klicken zum Umdrehen
            </div>
          </div>

          {/* Rückseite */}
          <div
            className="absolute inset-0 rounded-2xl p-8 flex flex-col items-center justify-center [backface-visibility:hidden] [transform:rotateY(180deg)]"
            style={{
              background: `linear-gradient(135deg, ${color}25 0%, ${T.panel} 70%)`,
              border:     `1px solid ${color}60`,
              boxShadow:  `0 8px 24px ${color}33`,
            }}
          >
            <div className="text-[11px] font-sans uppercase tracking-wider mb-3" style={{ color }}>
              Erklärung
            </div>
            <div className="font-serif text-lg text-text-primary text-center leading-relaxed">
              {card.back}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={markAgain}
          className="flex-1 rounded-lg px-4 py-3 font-sans font-bold text-[12px] tracking-wider uppercase"
          style={{ background: T.panelAlt, color: T.text, border: `1px solid ${T.borderMuted}` }}
        >
          ↻ Nochmal
        </button>
        <button
          onClick={markKnown}
          className="flex-1 rounded-lg px-4 py-3 font-sans font-bold text-[12px] tracking-wider uppercase"
          style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)`, color: T.bg }}
        >
          ✓ Gewusst
        </button>
      </div>

      {known.length > 0 && (
        <button
          onClick={reset}
          className="text-[10px] font-sans uppercase tracking-wider self-center"
          style={{ color: T.textDim }}
        >
          Stapel zurücksetzen
        </button>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT — ExpandSection (Roadmap)
// ═══════════════════════════════════════════════════════════════════════════

function ExpandSection({
  expanded,
  onToggle,
  icon,
  title,
  subtitle,
  color,
  children,
}: {
  expanded: boolean;
  onToggle: () => void;
  icon: string;
  title: string;
  subtitle: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl overflow-hidden transition-colors"
      style={{
        background: T.panel,
        border:     expanded ? `1px solid ${color}60` : `1px solid ${T.border}`,
      }}
    >
      <button
        onClick={onToggle}
        className="w-full px-5 py-4 flex justify-between items-center cursor-pointer text-left"
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-2.5">
          <span className="text-xl" aria-hidden>{icon}</span>
          <div>
            <div className="text-[13px] font-sans font-semibold text-text-primary">
              {title}
            </div>
            <div className="text-[11px] font-sans text-text-muted">
              {subtitle}
            </div>
          </div>
        </div>
        <span
          className="text-lg transition-transform inline-block"
          style={{ color, transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
          aria-hidden
        >
          ▾
        </span>
      </button>
      {expanded && (
        <div className="px-5 pb-5 border-t" style={{ borderTopColor: T.borderSubtle }}>
          {children}
        </div>
      )}
    </div>
  );
}
