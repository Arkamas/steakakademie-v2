/**
 * Fragenbank der Stufenpruefungen — eine Quelle fuer Client (Anzeige, Sofort-
 * Feedback) und Server (Bewertung, Eintrag des Ergebnisses).
 *
 * Jede Frage traegt `lektionSlug`: die Lektion, in der die Antwort steht.
 * Damit hat jede Pruefungsfrage einen Bezug zum Lernstoff (Regel 8b, Punkt e)
 * und bei einer falschen Antwort kann direkt dorthin verwiesen werden.
 *
 * Temperaturen folgen data/kerntemperatur-referenz.yaml (Regel 8c). Korrigiert
 * am 06.09.2026: Schweinefilet 63–65 °C (vorher 58–62, unter dem
 * Sicherheits-Minimum 63 °C), Lachs 48–52 °C, Lamm 54–57 °C. Die fruehere
 * Formulierung „seit 2011 lebensmittelrechtlich okay" ist entfernt — Regel 10,
 * keine juristischen Aussagen. Am 07.09.2026 die komplette Rind-Garstufen-Skala
 * auf die von Uwe bestaetigte Referenztabelle umgestellt: rare 45–49, medium
 * rare 52–55 (Standard 54, oberer Rand — vorher 54–58), medium 55–60 (vorher
 * 58–63), well done 70+ (vorher 68+).
 */

import { QUIZ_BESTEHENSGRENZE, type StufeKey } from './stufen';

export type QuizFrage = {
  q: string;
  options: readonly string[];
  /** Index der richtigen Option */
  correct: number;
  explain: string;
  /** Lektion (lektionSlug), in der die Antwort steht */
  lektionSlug: string;
};

export type Flashcard = { front: string; back: string };

export const FRAGEN: Record<StufeKey, readonly QuizFrage[]> = {
  bronze: [
    {
      q: 'Wann ist Holzkohle bereit zum Grillen?',
      options: ['Sobald die Flammen lodern', 'Wenn schwarze Kohlen glühen', 'Sobald ein grauer Aschefilm sichtbar ist', 'Nach genau 5 Minuten'],
      correct: 2,
      explain: 'Grauer Aschefilm zeigt: gleichmäßige Glut, ideale Temperatur.',
      lektionSlug: 'grillarten',
    },
    {
      q: 'Welche Temperatur hat die direkte Hitze-Zone?',
      options: ['100–150 °C', '160–200 °C', '230–290 °C', '300–400 °C'],
      correct: 2,
      explain: '230–290 °C ist die Zone fürs scharfe Angrillen und die Kruste.',
      lektionSlug: 'direkte-indirekte-hitze',
    },
    {
      q: 'Wofür nutzt man indirekte Hitze (150–180 °C)?',
      options: ['Schnelles Anbraten', 'Große Stücke schonend durchgaren', 'Maillard-Reaktion', 'Scharfes Angrillen'],
      correct: 1,
      explain: 'Indirekt = schonend fertig garen (Geflügel, Gemüse, Braten). Echtes Low & Slow für Brisket läuft noch kühler: 100–130 °C.',
      lektionSlug: 'direkte-indirekte-hitze',
    },
    {
      q: 'Was verhindert ein gefährliches Aufflackern?',
      options: ['Mehr Holzkohle nachlegen', 'Deckel schließen', 'Wasser drauf spritzen', 'Fett vom Fleisch schneiden'],
      correct: 1,
      explain: 'Sauerstoffmangel durch geschlossenen Deckel erstickt Flammen.',
      lektionSlug: 'sicherheit-brandschutz',
    },
    {
      q: 'Mindest-Abstand Kohle zu Rost?',
      options: ['2–5 cm', '5–8 cm', '10–15 cm', '20–25 cm'],
      correct: 2,
      explain: '10–15 cm — sonst verbrennt das Fleisch außen, bevor es innen gar ist.',
      lektionSlug: 'temperaturzonen',
    },
  ],
  anatomie: [
    { q: 'Aus welchem Teilstück ist ein Ribeye?', options: ['Bauch', 'Hohe Rippe', 'Hüfte', 'Schulter'], correct: 1, explain: 'Ribeye = Kern der hohen Rippe, stark marmoriert.', lektionSlug: 'rinder-cuts' },
    { q: 'Wie heißt der Brustkern auf Englisch?', options: ['Sirloin', 'Brisket', 'Chuck', 'Flank'], correct: 1, explain: 'Brisket = Rinderbrust, der König der Low-&-Slow-Cuts.', lektionSlug: 'rinder-cuts' },
    { q: 'Welcher Cut ist besonders stark marmoriert?', options: ['Filet', 'Onglet', 'Ribeye', 'Hüfte'], correct: 2, explain: 'Ribeye trägt das meiste intramuskuläre Fett — Geschmacks-Champion.', lektionSlug: 'marmorierung' },
    { q: 'Dry-Aging-Dauer minimal für spürbaren Effekt?', options: ['3 Tage', '7 Tage', '21 Tage', '60 Tage'], correct: 2, explain: 'Ab 21 Tagen entstehen die typischen nussigen Aromen.', lektionSlug: 'dry-wet-aging' },
    { q: 'Optimale Fleisch-Lagertemperatur?', options: ['−2 bis 0 °C', '0 bis 2 °C', '2 bis 4 °C', '4 bis 6 °C'], correct: 1, explain: '0–2 °C maximiert Haltbarkeit ohne Gewebeschaden.', lektionSlug: 'fleisch-lagern' },
  ],
  thermometer: [
    { q: 'Kerntemperatur medium rare beim Rind (serviert)?', options: ['45–49 °C', '52–55 °C', '60–64 °C', '66–70 °C'], correct: 1, explain: '52–55 °C serviert: rosa Kern, warm, saftig — Steakakademie-Standard 54 °C, oberer Rand. Bei 50–51 °C vom Grill nehmen — das Nachziehen macht den Rest.', lektionSlug: 'kerntemperaturen' },
    { q: 'Hähnchenbrust sichere Endtemperatur?', options: ['62 °C', '68 °C', '72–75 °C', '85 °C'], correct: 2, explain: 'Ab 72 °C ist Geflügel sicher — und bei 72–75 °C noch saftig.', lektionSlug: 'kerntemperaturen' },
    { q: 'Schweinefilet saftig und sicher?', options: ['54 °C', '63–65 °C', '70 °C', '78 °C'], correct: 1, explain: '63 °C ist das Sicherheits-Minimum für Schwein — darüber bleibt das Filet saftig, darunter geht es nicht.', lektionSlug: 'kerntemperaturen' },
    { q: 'Was passiert ab 140 °C an der Fleischoberfläche?', options: ['Saftverlust', 'Maillard-Reaktion', 'Kollagenabbau', 'Verkohlung'], correct: 1, explain: 'Maillard = die Bräunungs-Reaktion, Aromen-Explosion.', lektionSlug: 'maillard-kruste' },
    { q: 'Reverse Sear: Welche Reihenfolge?', options: ['Sear → Niedrig garen', 'Niedrig garen → Sear', 'Nur Sear', 'Nur niedrig garen'], correct: 1, explain: 'Erst sanft auf Kerntemperatur, dann scharf für die Kruste.', lektionSlug: 'reverse-sear' },
  ],
  holz: [
    { q: 'Hickory passt am besten zu?', options: ['Lachs', 'Geflügel zart', 'Brisket', 'Käse'], correct: 2, explain: 'Hickory ist robust — perfekt für Brisket und Pulled Pork.', lektionSlug: 'holz-rauch-mopping' },
    { q: 'Apfelholz-Aroma?', options: ['Stark, würzig', 'Mild, leicht süß', 'Bitter, scharf', 'Erdig, kräftig'], correct: 1, explain: 'Apfel ist sanft — ideal für Geflügel und Schwein.', lektionSlug: 'holz-rauch-mopping' },
    { q: 'Was ist ein Smoke Ring?', options: ['Werbe-Logo', 'Rosa Ring unter der Kruste', 'Rauch-Tornado im Smoker', 'Werkzeug'], correct: 1, explain: 'Stickstoff-Reaktion: rosa Verfärbung unter der Kruste, Zeichen guten Smokes.', lektionSlug: 'holz-rauch-mopping' },
    { q: 'Die Stall-Phase tritt typisch auf bei?', options: ['65–75 °C', '50–60 °C', '85–95 °C', '40–50 °C'], correct: 0, explain: 'Bei 65–75 °C verdunstet Wasser und kühlt die Oberfläche — Geduld!', lektionSlug: 'bbq-wissenschaft' },
    { q: 'Optimale Holz-Feuchtigkeit zum Räuchern?', options: ['0–5 %', '15–20 %', '30–35 %', '50–60 %'], correct: 1, explain: '15–20 % gibt sauberen Rauch ohne Bitterkeit.', lektionSlug: 'holz-rauch-mopping' },
  ],
  kcbs: [
    { q: 'Wie viele Hähnchenstücke kommen in die KCBS-Box?', options: ['1 ganzes Tier', '4 Brüste', '6 gleiche Stücke', '8 Schenkel'], correct: 2, explain: '6 einheitliche Stücke — Optik zählt.', lektionSlug: 'wettbewerbsgrillen' },
    { q: 'KCBS-Brisket-Wettkampfgewicht typisch?', options: ['1–2 kg', '3–4 kg', '6–7 kg', '12–15 kg'], correct: 2, explain: 'Packer-Brisket mit Flat + Point, 6–7 kg sind Standard.', lektionSlug: 'wettbewerbsgrillen' },
    { q: 'KCBS-Bewertungsskala pro Kriterium?', options: ['1–5', '1–10', '2–9', '6–9 + Disqualifikation'], correct: 3, explain: '6 = durchschnittlich, 9 = exzellent. Unter 6 = Disqualifikation.', lektionSlug: 'wettbewerbsgrillen' },
    { q: 'Was zählt zum „Appearance"-Score?', options: ['Geschmack', 'Konsistenz', 'Optik in der Turn-In-Box', 'Geruch'], correct: 2, explain: 'Box-Layout, Farbe, Glanz — der erste Eindruck zählt.', lektionSlug: 'praesentation-anrichten' },
    { q: 'Standard-KCBS-Turn-In-Box?', options: ['Eigene Box', 'Styropor, weiß, 9×9 inch', 'Holzkiste', 'Glasdose'], correct: 1, explain: 'Weiße Styropor-Box, einheitlich 9×9 inch.', lektionSlug: 'wettbewerbsgrillen' },
  ],
};

export const FLASHCARDS: Record<StufeKey, readonly Flashcard[]> = {
  bronze: [
    { front: 'Direkte Hitze',          back: '230–290 °C · Kruste, schnelles Anbraten' },
    { front: 'Indirekte Hitze',        back: '150–180 °C · schonend durchgaren, große Stücke & Geflügel' },
    { front: 'Aschefilm',              back: 'Grauer Belag = Kohle ist bereit, gleichmäßige Glut' },
    { front: 'Maillard-Reaktion',      back: 'Bräunung & Aromen · startet ab ~140 °C' },
    { front: 'Reverse Sear',           back: 'Erst niedrig garen, dann kurz scharf für Kruste' },
    { front: 'Deckel zu',              back: 'Erstickt Aufflackern, hält Temperatur konstant' },
    { front: 'Abstand Rost zu Kohle',  back: '10–15 cm · Standard für gleichmäßiges Garen' },
    { front: 'Salz-Timing',            back: 'Direkt vor dem Grillen oder ≥ 40 Min davor' },
  ],
  anatomie: [
    { front: 'Ribeye',       back: 'Hohe Rippe · direkt grillen, medium rare' },
    { front: 'Brisket',      back: 'Rinderbrust · Low & Slow, 12–16 h smoken' },
    { front: 'Onglet',       back: 'Zwerchfellpfeiler · scharf anbraten, rare bis medium rare' },
    { front: 'Tomahawk',     back: 'Ribeye mit langem Knochen · Reverse Sear, ~600 g pro Person' },
    { front: 'Picanha',      back: 'Tafelspitz (Sirloin Cap) · BR-BBQ, mit Fettkappe' },
    { front: 'Flank Steak',  back: 'Bauchlappen · marinieren, quer zur Faser schneiden' },
    { front: 'Hanger Steak', back: 'Onglet-Verwandter · hängt am Zwerchfell, intensiv im Geschmack' },
    { front: 'Wagyu A5',     back: 'Japan-Top · BMS 8–12, sehr dünn aufgeschnitten kurz braten' },
  ],
  thermometer: [
    { front: 'Rind rare',         back: '45–49 °C · roter Kern, weich' },
    { front: 'Rind medium rare',  back: '52–55 °C · rosa Kern, saftig — Standard 54 °C (bei 50–51 °C ziehen)' },
    { front: 'Rind medium',       back: '55–60 °C · rosa-grau, fester' },
    { front: 'Rind well done',    back: '70+ °C · durch, deutlicher Saftverlust' },
    { front: 'Schwein Filet',     back: '63–65 °C · zart, saftig — 63 °C ist das Minimum' },
    { front: 'Hähnchen Brust',    back: '72–75 °C · weiß, sicher, noch saftig' },
    { front: 'Lachs',             back: '48–52 °C · glasig, mi-cuit' },
    { front: 'Lamm Rücken',       back: '54–57 °C · medium rare, rosé' },
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
    { front: 'Pork',        back: 'Schulter/Butt 4–6 kg · Turn-In 13:00' },
    { front: 'Brisket',     back: 'Flat oder Point, 6–7 kg · Turn-In 13:30' },
    { front: 'Appearance',  back: 'Score 6–9 · Box-Layout, Farbe, Glanz' },
    { front: 'Taste',       back: 'Score 6–9 · der wichtigste Faktor' },
    { front: 'Tenderness',  back: 'Score 6–9 · zart, aber nicht zerfallend' },
    { front: 'DQ-Gründe',   back: 'Falsche Garnitur, Box-Sticker fehlt, Sauce-Pool' },
  ],
};

export type Bewertung = {
  score: number;
  bestanden: boolean;
  ergebnisse: { richtig: boolean; explain: string; lektionSlug: string }[];
};

/**
 * Reine Bewertungsfunktion — laeuft identisch im Server (verbindlich) und
 * im Client (Anzeige). Ungueltige Eingaben (falsche Laenge, Index ausserhalb
 * der Optionen) werden als falsch gewertet, nicht als Fehler geworfen.
 */
export function bewerte(modul: StufeKey, antworten: readonly number[]): Bewertung {
  const fragen = FRAGEN[modul];
  const ergebnisse = fragen.map((f, i) => {
    const a = antworten[i];
    const richtig = Number.isInteger(a) && a === f.correct;
    return { richtig, explain: f.explain, lektionSlug: f.lektionSlug };
  });
  const score = ergebnisse.filter((e) => e.richtig).length;
  return { score, bestanden: score >= QUIZ_BESTEHENSGRENZE, ergebnisse };
}
