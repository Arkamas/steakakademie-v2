import type { Species } from './cuts-catalog';

/**
 * Foto-basiertes Metzger-Diagramm — Zonen-Mapping auf echte Tier-Fotos.
 * Koordinaten beziehen sich auf die Original-Pixelmaße des jeweiligen Fotos
 * (viewBox = width × height). Gemappt Juli 2026 (visuell verifiziert).
 *
 * Rind:    /images/cut-atlas-stier.jpg          (1264×842, Dreiviertel-Ansicht)
 * Schwein: /images/cuts/diagramm-schwein.jpg    (1376×768, Seitenprofil)
 *
 * Detail-Ebene (Zoom in eine Zone) — klassische Metzger-Konvention:
 * Cuts mit anatomischer Lage = gestrichelte Teilfläche (`points`),
 * auch innenliegende Stränge wie das Filet (liegt der Länge nach direkt
 * unter dem Roastbeef). Punkt-Cuts ohne sinnvolle Fläche = Label-Chip
 * (nur `x`/`y`). Reine Zubereitungs-Varianten (Tomahawk, Nackensteak,
 * Eisbein …) werden nicht eingezeichnet — sie erscheinen in der
 * Cut-Galerie der Zone.
 */

export interface SubCutPin {
  /** Cut-ID aus cuts-catalog */
  id: string;
  /** Label-Position */
  x: number;
  y: number;
  /** Gestrichelte Teilfläche (Metzger-Chart-Stil); ohne points → Chip */
  points?: string;
  /** Schriftgröße im viewBox-Maßstab (vor Zoom-Teilung) */
  fontSize?: number;
}

export interface PhotoZone {
  /** Polygon-Punkte im Foto-Koordinatensystem */
  points: string;
  labelX: number;
  labelY: number;
  /** Schriftgröße im viewBox-Maßstab */
  fontSize?: number;
  /** Detail-Ebene: Sub-Cuts (erscheinen beim Zoom in die Zone) */
  subCuts?: SubCutPin[];
}

export interface PhotoDiagram {
  src: string;
  width: number;
  height: number;
  /** Zonen je Teilstück-ID (muss zu PRIMALS in cuts-catalog passen) */
  zones: Record<string, PhotoZone>;
}

export const PHOTO_DIAGRAMS: Record<Species, PhotoDiagram> = {
  rind: {
    src: '/images/cut-atlas-stier.jpg',
    width: 1264,
    height: 842,
    zones: {
      hals: {
        points: '430,330 520,255 590,290 590,480 540,525 455,525 418,430',
        labelX: 500, labelY: 400, fontSize: 24,
        subCuts: [
          { id: 'nacken', points: '440,340 522,268 578,298 578,468 538,512 462,512 430,432', x: 505, y: 400 },
          { id: 'ochsenbacke', x: 478, y: 300 },
        ],
      },
      bug: {
        // Vertikale Chart-Bänder: Chuck Eye (rippenseitig oben), Schaufel,
        // Flat Iron (unter dem Schaufelknochen), Falsches Filet, Denver.
        points: '590,250 700,225 700,440 660,560 620,585 590,480 590,290',
        labelX: 648, labelY: 380, fontSize: 24,
        subCuts: [
          { id: 'chuck-eye', points: '590,250 700,225 700,320 590,320', x: 648, y: 280 },
          { id: 'schaufelstueck', points: '590,320 700,320 700,390 590,390', x: 648, y: 356 },
          { id: 'flat-iron', points: '590,390 700,390 700,440 695,450 590,450', x: 648, y: 420 },
          { id: 'falsches-filet', points: '590,450 693,450 680,510 610,510 590,480', x: 643, y: 480 },
          { id: 'denver', points: '610,510 680,510 660,560 620,585', x: 643, y: 540 },
        ],
      },
      hochrippe: {
        points: '700,225 790,218 790,430 700,440',
        labelX: 745, labelY: 330, fontSize: 15,
        subCuts: [
          { id: 'ribeye-cap', points: '700,225 790,218 790,248 700,255', x: 745, y: 237, fontSize: 15 },
          { id: 'ribeye', points: '700,255 790,248 790,330 700,335', x: 745, y: 292 },
          { id: 'prime-rib', points: '700,335 790,330 790,430 700,440', x: 745, y: 384, fontSize: 16 },
        ],
      },
      roastbeef: {
        // Anatomische Bänder: oben der Rückenstrang, direkt darunter der
        // Filetstrang (der Länge nach), unten die Querschnitte T-Bone /
        // Porterhouse (Schnitte durch Roastbeef + Filet + Knochen).
        points: '790,218 880,210 880,420 790,430',
        labelX: 835, labelY: 300, fontSize: 15,
        subCuts: [
          { id: 'roastbeef', points: '790,218 880,210 880,270 790,278', x: 835, y: 245, fontSize: 15 },
          { id: 'filet', points: '790,278 880,270 880,315 790,323', x: 835, y: 297 },
          { id: 't-bone', points: '790,323 880,315 880,365 790,373', x: 835, y: 345 },
          { id: 'porterhouse', points: '790,373 880,365 880,420 790,430', x: 835, y: 396, fontSize: 15 },
        ],
      },
      huefte: {
        points: '880,210 950,228 950,400 880,420',
        labelX: 915, labelY: 330, fontSize: 16,
        subCuts: [
          { id: 'picanha', points: '880,210 950,228 950,280 880,290', x: 915, y: 252 },
          { id: 'hueftsteak', points: '880,290 950,280 950,340 880,350', x: 915, y: 316 },
          { id: 'tri-tip', points: '880,350 950,340 950,400 880,420', x: 915, y: 380 },
        ],
      },
      keule: {
        // Chart-Aufteilung: Tafelspitz (hinterer Deckel), Kugel (vorn,
        // an der Hüfte), Oberschale (innen/Mitte), Unterschale (unten/außen).
        points: '880,420 950,400 990,430 985,560 950,610 895,600 880,520',
        labelX: 933, labelY: 490, fontSize: 20,
        subCuts: [
          { id: 'kugel', points: '880,420 945,402 945,465 880,465', x: 910, y: 448, fontSize: 14 },
          { id: 'tafelspitz', points: '945,402 990,430 985,470 945,465', x: 966, y: 430, fontSize: 12 },
          { id: 'oberschale', points: '880,465 985,470 982,530 880,530', x: 930, y: 498 },
          { id: 'unterschale', points: '880,530 982,530 950,610 895,600 880,540', x: 928, y: 565 },
        ],
      },
      brust: {
        points: '455,525 540,525 590,480 620,585 615,655 500,665 445,640 435,565',
        labelX: 525, labelY: 605, fontSize: 22,
        subCuts: [
          { id: 'brisket-point', points: '455,525 540,525 590,480 615,570 460,575 440,560', x: 528, y: 545, fontSize: 16 },
          { id: 'brisket', points: '440,560 615,570 615,655 500,665 445,640', x: 525, y: 612 },
        ],
      },
      duennung: {
        // Chart-Stil: Querrippe/Short Ribs vorn, Skirt oben, Bavette Mitte,
        // Flank hinten-unten; Onglet (Nierenzapfen, innen) als Chip.
        points: '648,558 700,445 845,445 845,525 780,565 700,585',
        labelX: 748, labelY: 512, fontSize: 20,
        subCuts: [
          { id: 'short-ribs', points: '648,558 700,445 720,445 700,570', x: 688, y: 520, fontSize: 12 },
          { id: 'skirt', points: '720,445 845,445 845,480 720,480', x: 782, y: 463 },
          { id: 'bavette', points: '720,480 845,480 845,505 790,540 720,520', x: 780, y: 502 },
          { id: 'flank', points: '720,520 790,540 780,565 700,585 700,570', x: 742, y: 556, fontSize: 13 },
          { id: 'onglet', x: 760, y: 430 },
        ],
      },
      beinscheibe: {
        points: '895,605 955,615 975,730 950,765 905,750 890,680',
        labelX: 932, labelY: 685, fontSize: 13,
        subCuts: [
          { id: 'beinscheibe', points: '902,615 950,623 968,725 948,755 910,742 897,680', x: 932, y: 688, fontSize: 13 },
          { id: 'ochsenschwanz', x: 965, y: 600 },
          { id: 'markknochen', x: 930, y: 775 },
        ],
      },
    },
  },
  schwein: {
    src: '/images/cuts/diagramm-schwein.jpg',
    width: 1376,
    height: 768,
    zones: {
      kopf: {
        points: '200,355 270,310 368,315 420,430 430,560 420,620 360,660 280,668 215,655 193,555 190,425',
        labelX: 300, labelY: 500, fontSize: 26,
        subCuts: [
          { id: 'schweinebacke', points: '300,540 380,540 395,600 360,648 300,652 275,600', x: 335, y: 595, fontSize: 17 },
        ],
      },
      nacken: {
        // Presa = Kern des Nackens Richtung Schulter (tief),
        // Secreto = unter dem Schulterblatt (unterster Streifen).
        points: '368,315 420,240 470,200 520,170 605,152 600,330 430,470 420,430',
        labelX: 495, labelY: 262, fontSize: 26,
        subCuts: [
          { id: 'schweinenacken', points: '368,315 420,240 470,200 520,170 605,152 602,260 430,395 420,370', x: 500, y: 240 },
          { id: 'presa', points: '430,395 602,260 601,300 445,425', x: 525, y: 348, fontSize: 17 },
          { id: 'secreto', points: '445,425 601,300 600,330 430,470', x: 522, y: 396, fontSize: 17 },
        ],
      },
      schulter: {
        // Schäufele = Schulterblattstück (oben), Braten/Bug darunter.
        points: '430,470 600,335 650,345 655,555 595,608 505,615 440,565',
        labelX: 540, labelY: 468, fontSize: 24,
        subCuts: [
          { id: 'schaeufele', points: '430,470 600,335 650,345 652,450 470,510', x: 558, y: 425 },
          { id: 'schulterbraten', points: '470,510 652,450 655,555 595,608 505,615 440,565', x: 552, y: 535 },
        ],
      },
      kotelett: {
        // Kasseler vorn oben, Kotelettstrang hinten oben, Karree vorn unten,
        // Filetstrang der Länge nach unter dem Rücken (hinten unten).
        points: '605,152 700,148 800,144 900,150 1005,170 1000,320 600,330',
        labelX: 800, labelY: 240, fontSize: 26,
        subCuts: [
          { id: 'kasseler', points: '605,152 700,148 700,240 603,245', x: 652, y: 198, fontSize: 17 },
          { id: 'kotelett', points: '700,148 800,144 900,150 1005,170 1002,245 700,240', x: 852, y: 196 },
          { id: 'karree', points: '603,245 800,248 800,325 600,330', x: 700, y: 288 },
          { id: 'schweinefilet', points: '800,248 1002,245 1000,320 800,325', x: 900, y: 286 },
          { id: 'pluma', x: 632, y: 300 },
        ],
      },
      bauch: {
        // Rippenbögen oben (Baby Backs rückennah, darunter Spareribs),
        // Bauch/Bacon unten; Abanico (Fächer über den Rippen) als Chip.
        points: '655,345 1000,322 1000,488 870,533 700,510 655,470',
        labelX: 828, labelY: 425, fontSize: 26,
        subCuts: [
          { id: 'baby-back-ribs', points: '655,345 1000,322 1000,360 655,385', x: 828, y: 355, fontSize: 17 },
          { id: 'spareribs', points: '655,385 1000,360 1000,410 655,435', x: 828, y: 398 },
          { id: 'schweinebauch', points: '655,435 1000,410 1000,488 870,533 700,510 655,470', x: 820, y: 462 },
          { id: 'abanico', x: 700, y: 490 },
        ],
      },
      schinken: {
        // Oberschale innen/vorn, Nuss vorn unten, Schinkenbraten hinten oben,
        // Schnitzel (aus der Keule geschnitten) hinten unten.
        points: '1005,168 1085,185 1135,235 1160,300 1150,390 1115,470 1005,480 1000,320',
        labelX: 1075, labelY: 320, fontSize: 22,
        subCuts: [
          { id: 'oberschale-schwein', points: '1005,168 1085,185 1090,320 1002,330 1000,320', x: 1045, y: 255, fontSize: 15 },
          { id: 'schinkenbraten', points: '1085,185 1135,235 1160,300 1152,380 1090,320', x: 1124, y: 288, fontSize: 13 },
          { id: 'nuss-schwein', points: '1002,330 1090,320 1080,470 1005,480', x: 1042, y: 400 },
          { id: 'schweineschnitzel', points: '1090,320 1152,380 1150,390 1115,470 1080,470', x: 1116, y: 412, fontSize: 13 },
        ],
      },
      haxe: {
        points: '1030,475 1130,475 1145,650 1040,655',
        labelX: 1088, labelY: 568, fontSize: 20,
        subCuts: [
          { id: 'haxe', points: '1036,482 1124,482 1138,642 1046,647', x: 1088, y: 540 },
          { id: 'eisbein', x: 1088, y: 600 },
        ],
      },
    },
  },
};
