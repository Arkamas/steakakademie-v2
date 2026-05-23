export interface CutData {
  id: string;
  nameDE: string;
  nameEN: string;
  shortLabel: string;
  cuts: string[];
  emoji: string;
  description: string;
  marbling: number;
  donenessRecommended: string;
  methods: string[];
  diplomLevel: number;
  diplomLevelName: string;
  price: number;
  region: string;
  points: string;
  labelX: number;
  labelY: number;
  dotX: number;
  dotY: number;
  labelBelow: boolean;
  color: string;
}

export const CUTS: CutData[] = [
  {
    id: 'chuck',
    nameDE: 'Schulter & Nacken',
    nameEN: 'Chuck',
    shortLabel: 'Schulter',
    cuts: ['Flat Iron', 'Chuck Eye Steak', 'Nackenbraten', 'Schaufelstück'],
    emoji: '🪓',
    description:
      'Der Schulterbereich ist intensiv gearbeitet — reich an Bindegewebe und intramuskulärem Fett. Als Flat Iron dünn geschnitten überraschend zart. Für Low & Slow unübertroffen: Das Kollagen zerfällt zu Gelatine und das Fleisch wird butterzart.',
    marbling: 3,
    donenessRecommended: 'Medium (Steak) · Well Done für Schmorbraten',
    methods: [
      'Flat Iron: direkt grillen, 55–58 °C Kerntemperatur',
      'Chuck Roast: 8h Schmoren bei 120 °C',
      'Sous-vide: 48h bei 60 °C + kurz angrillen',
    ],
    diplomLevel: 7,
    diplomLevelName: 'Smoke-Artist',
    price: 2,
    region: 'Vorderviertel — Schulter & Hals',
    points: '155,108 318,106 314,258 185,258 158,240',
    labelX: 236, labelY: 70, dotX: 234, dotY: 182, labelBelow: false,
    color: '#92400e',
  },
  {
    id: 'rib',
    nameDE: 'Hochrippe',
    nameEN: 'Rib',
    shortLabel: 'Hochrippe',
    cuts: ['Ribeye', 'Tomahawk', 'Côte de Bœuf', 'Entrecôte', 'Standing Rib Roast'],
    emoji: '🥩',
    description:
      'Die absolute Königsklasse. Das Ribeye hat die höchste Marmorierungsdichte aller Cuts. Das intramuskuläre Fett schmilzt beim Grillen und erzeugt diesen unverwechselbaren Buttergeschmack — kein anderer Cut kommt dem näher.',
    marbling: 5,
    donenessRecommended: 'Medium Rare (54–57 °C) — darüber verliert das Fett seinen Sinn',
    methods: [
      'Direkt grillen: 2–3 min je Seite, dann 4 min ruhen',
      'Reverse Sear: 52 °C im Ofen, dann Finish auf höchster Hitze',
      'Cast Iron mit Butter-Basting: Knoblauch + Thymian',
    ],
    diplomLevel: 5,
    diplomLevelName: 'Flammen-Virtuose',
    price: 4,
    region: 'Mittlerer Rücken — Rippen 6 bis 12',
    points: '318,106 462,104 458,258 314,258',
    labelX: 390, labelY: 70, dotX: 388, dotY: 181, labelBelow: false,
    color: '#b45309',
  },
  {
    id: 'loin',
    nameDE: 'Rücken (Loin)',
    nameEN: 'Short Loin',
    shortLabel: 'Loin',
    cuts: ['Filet / Tenderloin', 'Rumpsteak', 'T-Bone', 'Porterhouse', 'New York Strip'],
    emoji: '👑',
    description:
      'Im Short Loin vereinen sich die edelsten Cuts. Das Filet ist so zart, dass man es mit dem Löffel essen könnte — fast ohne Eigengeschmack. Das Rumpsteak kompensiert mit maximalem Fleischaroma. T-Bone und Porterhouse verbinden beide durch den Knochen.',
    marbling: 4,
    donenessRecommended: 'Rare bis Medium Rare (50–56 °C)',
    methods: [
      'Direkt grillen auf höchster Hitze — kurz und präzise',
      'Filet: Pfanne + Butter-Basting, 52 °C Kerntemperatur',
      'Porterhouse: indirektes Grillen bis 50 °C, dann Sear',
    ],
    diplomLevel: 8,
    diplomLevelName: 'Thermometer-Profi',
    price: 5,
    region: 'Oberer Rücken — 13. Rippe bis Hüfte',
    points: '462,104 592,106 588,262 458,258',
    labelX: 525, labelY: 70, dotX: 523, dotY: 183, labelBelow: false,
    color: '#b45309',
  },
  {
    id: 'sirloin',
    nameDE: 'Hüfte',
    nameEN: 'Sirloin',
    shortLabel: 'Hüfte',
    cuts: ['Picanha', 'Hüftsteak', 'Top Sirloin', 'Tafelspitz (Spitze)', 'Tri-Tip'],
    emoji: '🏅',
    description:
      'Die Hüfte ist das Zentrum brasilianischer Grillkultur. Die Picanha — mit Fettdeckel nach innen gerollt auf dem Spieß — ist das nationale Symbol des Churrasco. Charaktervoller Geschmack, weniger Fett als Ribeye, aber mehr Persönlichkeit als Filet.',
    marbling: 3,
    donenessRecommended: 'Medium Rare bis Medium (54–60 °C)',
    methods: [
      'Picanha: Rotisserie oder C-Form auf dem Spieß',
      'Hüftsteak: direkt grillen, gegen die Faser schneiden',
      'Tafelspitz-Spitze: Sous-vide 8h bei 56 °C + Finish',
    ],
    diplomLevel: 6,
    diplomLevelName: 'Cuts-Experte',
    price: 3,
    region: 'Lende — obere Hinterhand, Kreuzbein',
    points: '592,106 672,118 668,282 614,290 588,262',
    labelX: 638, labelY: 70, dotX: 630, dotY: 196, labelBelow: false,
    color: '#a16207',
  },
  {
    id: 'round',
    nameDE: 'Keule',
    nameEN: 'Round',
    shortLabel: 'Keule',
    cuts: ['Oberschale', 'Unterschale', 'Nuss (Eye of Round)', 'Tafelspitz', 'Hüftdeckel'],
    emoji: '🦵',
    description:
      'Die Keule ist das arbeitende Hinterbein — mageres, festes Fleisch mit intensivem Geschmack. Für klassische deutsche Küche (Tafelspitz, Rinderschmorbraten) unersetzlich. Sous-vide transformiert die Textur vollständig bei gleichem Geschmack.',
    marbling: 2,
    donenessRecommended: 'Well Done beim Schmoren · Medium via Sous-vide',
    methods: [
      'Tafelspitz: kochen in Bouillon mit Wurzelgemüse, 90 min',
      'Sous-vide: 12–24h bei 58 °C, dann scharf anbraten',
      'Schmorbraten: 3h bei 160 °C mit Rotwein-Fond',
    ],
    diplomLevel: 4,
    diplomLevelName: 'Dry-Ager',
    price: 2,
    region: 'Hinterhand — Oberschenkel & Hüftgelenkbereich',
    points: '672,118 792,138 800,335 715,356 668,282',
    labelX: 750, labelY: 80, dotX: 738, dotY: 237, labelBelow: false,
    color: '#78350f',
  },
  {
    id: 'brisket',
    nameDE: 'Brust (Brisket)',
    nameEN: 'Brisket',
    shortLabel: 'Brisket',
    cuts: ['Flat (Brust flach)', 'Point (Brust spitz)', 'Burnt Ends', 'Pastrami'],
    emoji: '💨',
    description:
      'Das Brisket ist der heilige Gral des American BBQ. 12–18 Stunden im Smoker bei 110–120 °C, 95 °C Kerntemperatur — dann zerfällt das Kollagen vollständig zu Gelatine. Burnt Ends aus dem fetthaltigen Point-Stück gelten als die wertvollsten Bissen des gesamten BBQ.',
    marbling: 4,
    donenessRecommended: 'Well Done (90–95 °C Kerntemperatur für Smoker)',
    methods: [
      'Smoker: 12–18h bei 110–120 °C, Texas Crutch ab 72 °C',
      'Sous-vide: 48h bei 74 °C + 1–2h Smoker-Finish',
      'Pastrami: einpökeln, räuchern, dampfgaren',
    ],
    diplomLevel: 7,
    diplomLevelName: 'Smoke-Artist',
    price: 2,
    region: 'Brustbereich — unteres Vorderviertel',
    points: '158,258 314,258 296,360 198,364',
    labelX: 236, labelY: 398, dotX: 236, dotY: 308, labelBelow: true,
    color: '#92400e',
  },
  {
    id: 'plate',
    nameDE: 'Bauch & Flanke',
    nameEN: 'Plate & Flank',
    shortLabel: 'Bauch',
    cuts: ['Flank Steak', 'Skirt Steak', 'Onglet (Nierenzapfen)', "Bavette d'aloyau", 'Hanging Tender'],
    emoji: '🎯',
    description:
      'Die Geheimtipps der Kenner. Onglet hat den intensivsten Eigengeschmack aller Cuts — fast mineral-leberig, ein Cut das polarisiert. Flank und Bavette: grobe Faser, maximaler Geschmack. Die eiserne Regel: immer gegen die Faser schneiden.',
    marbling: 3,
    donenessRecommended: 'Medium Rare (52–55 °C) — nie darüber hinaus',
    methods: [
      'Sehr heiß, sehr kurz: 2–3 min je Seite auf höchster Hitze',
      'Über Nacht marinieren verstärkt Zartheit erheblich',
      'Immer schräg gegen die Faser schneiden — kein Verhandlungsspielraum',
    ],
    diplomLevel: 3,
    diplomLevelName: 'Onglet-Kenner',
    price: 2,
    region: 'Unterbauch — Rippenbogen bis Flanke',
    points: '314,258 668,282 660,370 296,360',
    labelX: 485, labelY: 398, dotX: 483, dotY: 318, labelBelow: true,
    color: '#a16207',
  },
];
