/**
 * Relaunch 2026-09 — die vier Kataloge der Übersicht.
 *
 * Quelle: handoff/website-relaunch/Steakakademie Prototyp.dc.html, Struktur `KAT`.
 * Die Inhalte sind laut Handoff-README redaktionell geschrieben und übernehmbar
 * („Fidelity: hifi"). Jeder Eintrag trägt dieselben sechs Felder — genau deshalb
 * trägt EIN Muster (src/app/relaunch/[katalog]) alle vier Kataloge.
 *
 * Fakten-Regel 8c (CLAUDE.md): Temperaturen hier stammen aus dem Handoff-Text,
 * nicht aus data/kerntemperatur-referenz.yaml. Vor dem Umschalten auf Produktion
 * gegen die Referenz abgleichen — siehe Abschnitt „Nicht geprüft" in
 * docs/website-relaunch-2026-09.md.
 *
 * `href` ist ein bewusst kuratierter Verweis auf eine bereits existierende
 * Detailseite der Live-Site. Fehlt er, gibt es die Detailseite noch nicht
 * (Handoff, offener Punkt 4) — die Karte zeigt dann „Detailseite folgt" statt
 * eines toten Links. Nichts davon ist erfunden: jede Zuordnung wurde gegen
 * content/ bzw. src/app/ geprüft (05.09.2026).
 */

export type KatalogKey = 'cuts' | 'streitfaelle' | 'rezepte' | 'techniken';

export interface KatalogEintrag {
  /** Titel */
  titel: string;
  /** Wert auf der Filterachse (Tierart / Urteil / Hitze) */
  filter: string;
  /** Meta 1 — z. B. Lage am Tier, Nummer, Schwierigkeit, Temperaturfenster */
  meta1: string;
  /** Abzeichen rechts oben — Preisklasse / Urteil / Dauer / Zone */
  badge: string;
  /** Meta 2 — Garart, Themenfeld, Technik, Dicke */
  meta2: string;
  /** Einzeiler */
  text: string;
  /** Verweis auf existierende Detailseite, sonst undefined */
  href?: string;
}

export interface Katalog {
  key: KatalogKey;
  /** Kurzname für Brotkrümel und Reiter */
  label: string;
  /** Reiter-Beschriftung */
  tab: string;
  titel: string;
  lead: string;
  /** Name der Filterachse */
  dim: string;
  /** Werte der Filterachse — „Alle" wird vorangestellt */
  dims: string[];
  /** Bedeutung des Abzeichens */
  badge: string;
  eintraege: KatalogEintrag[];
}

const cuts: Katalog = {
  key: 'cuts',
  label: 'Atlas',
  tab: 'Cuts',
  titel: 'Cuts & Fleischkunde',
  badge: 'Preisklasse',
  lead: 'Vierzig Teilstücke, jedes mit Lage am Tier, Preisklasse und der Garart, für die es gebaut ist. Wer den Cut kennt, braucht kein Rezept.',
  dim: 'Tierart',
  dims: ['Rind', 'Schwein', 'Lamm'],
  eintraege: [
    { titel: 'Ribeye', filter: 'Rind', meta1: 'Hohe Rippe', badge: '€€€', meta2: 'Kurzgebraten', text: 'Fettauge in der Mitte, verzeiht Hitze wie kein zweiter Cut.', href: '/cuts/ribeye' },
    { titel: 'Rumpsteak', filter: 'Rind', meta1: 'Roastbeef', badge: '€€', meta2: 'Kurzgebraten', text: 'Fettdeckel an der Kante — den einschneiden, nicht abschneiden.' },
    { titel: 'Filet', filter: 'Rind', meta1: 'Innerer Rücken', badge: '€€€', meta2: 'Kurzgebraten', text: 'Mager und zart, hat wenig Eigengeschmack. Kein Cut für Anfänger.' },
    { titel: 'T-Bone', filter: 'Rind', meta1: 'Rücken hinten', badge: '€€€', meta2: 'Kurzgebraten', text: 'Filet und Roastbeef am Knochen — zwei Garzeiten auf einem Teller.' },
    { titel: 'Porterhouse', filter: 'Rind', meta1: 'Rücken hinten', badge: '€€€', meta2: 'Kurzgebraten', text: 'Wie T-Bone, nur mit dem dicken Ende des Filets.' },
    { titel: 'Tomahawk', filter: 'Rind', meta1: 'Hohe Rippe', badge: '€€€', meta2: 'Rückwärts garen', text: 'Ribeye mit langer Rippe. Optik kostet, Geschmack ist derselbe.' },
    { titel: 'Flank Steak', filter: 'Rind', meta1: 'Bauchlappen', badge: '€€', meta2: 'Kurz & scharf', text: 'Grobe Faser, quer aufschneiden — sonst zäh, egal wie gut gegart.' },
    { titel: 'Skirt Steak', filter: 'Rind', meta1: 'Zwerchrippe', badge: '€€', meta2: 'Kurz & scharf', text: 'Der Geschmackssieger. Braucht Marinade und zwei Minuten pro Seite.' },
    { titel: 'Hanger Steak', filter: 'Rind', meta1: 'Nierenzapfen', badge: '€€', meta2: 'Kurz & scharf', text: 'Nur eines pro Tier. Mittelsehne raus, dann Metzgerstück.' },
    { titel: 'Flat Iron', filter: 'Rind', meta1: 'Schulter', badge: '€€', meta2: 'Kurzgebraten', text: 'Zart wie Filet, kostet ein Drittel. Der am meisten unterschätzte Cut.' },
    { titel: 'Tri Tip', filter: 'Rind', meta1: 'Hüfte', badge: '€€', meta2: 'Rückwärts garen', text: 'Faserrichtung wechselt mitten im Stück — vor dem Schneiden ansehen.' },
    { titel: 'Picanha', filter: 'Rind', meta1: 'Hüftdeckel', badge: '€€', meta2: 'Rückwärts garen', text: 'Fettdeckel nach oben, Salz und nichts weiter. Brasiliens Standard.' },
    { titel: 'Brisket', filter: 'Rind', meta1: 'Brust', badge: '€€', meta2: 'Niedrigtemperatur', text: 'Zwölf Stunden, zwei Muskeln, ein Plateau bei 68 Grad. Geduldsprobe.', href: '/cuts/brisket' },
    { titel: 'Short Ribs', filter: 'Rind', meta1: 'Brustrippe', badge: '€€', meta2: 'Niedrigtemperatur', text: 'Massiv marmoriert. Unter 90 Grad Kern bleibt das Bindegewebe hart.' },
    { titel: 'Beef Ribs', filter: 'Rind', meta1: 'Hohe Rippe', badge: '€€', meta2: 'Niedrigtemperatur', text: 'Die Dinosaurier-Rippe. Fleisch oben drauf statt dazwischen.' },
    { titel: 'Denver Cut', filter: 'Rind', meta1: 'Nacken', badge: '€€', meta2: 'Kurzgebraten', text: 'Aus dem Nacken geschnitten, überraschend marmoriert und günstig.' },
    { titel: 'Bavette', filter: 'Rind', meta1: 'Bauchlappen', badge: '€€', meta2: 'Kurz & scharf', text: 'Franzosen-Cut, lose Faser, saugt Marinade wie ein Schwamm.' },
    { titel: 'Onglet', filter: 'Rind', meta1: 'Nierenzapfen', badge: '€€', meta2: 'Kurz & scharf', text: 'Hanger auf Französisch. Innereien-Note, die man mag oder nicht.' },
    { titel: 'Rinderbacke', filter: 'Rind', meta1: 'Kopf', badge: '€', meta2: 'Schmoren', text: 'Reines Bindegewebe. Vier Stunden Schmoren macht daraus Samt.' },
    { titel: 'Ochsenschwanz', filter: 'Rind', meta1: 'Schwanz', badge: '€€', meta2: 'Schmoren', text: 'Gelatine pur. Die Basis für jede Sauce, die kleben soll.' },
    { titel: 'Beinscheibe', filter: 'Rind', meta1: 'Hinterbein', badge: '€', meta2: 'Schmoren', text: 'Mit Knochenmark in der Mitte — das gehört mit in den Topf.' },
    { titel: 'Hüftsteak', filter: 'Rind', meta1: 'Hüfte', badge: '€€', meta2: 'Kurzgebraten', text: 'Der ehrliche Alltagscut. Wenig Fett, klare Faser, gutes Preis-Verhältnis.' },
    { titel: 'Chuck Roll', filter: 'Rind', meta1: 'Nacken', badge: '€', meta2: 'Niedrigtemperatur', text: 'Pulled Beef kommt hier her, nicht aus der Schulter.' },
    { titel: 'Roastbeef', filter: 'Rind', meta1: 'Rücken', badge: '€€€', meta2: 'Rückwärts garen', text: 'Am Stück garen, dann tranchieren. Nie in Scheiben vorschneiden.' },
    { titel: 'Schweinenacken', filter: 'Schwein', meta1: 'Nacken', badge: '€', meta2: 'Niedrigtemperatur', text: 'Fett durchzogen, praktisch nicht zu ruinieren. Pulled-Pork-Klassiker.' },
    { titel: 'Kotelett', filter: 'Schwein', meta1: 'Rücken', badge: '€', meta2: 'Kurzgebraten', text: 'Am Knochen kaufen. Ohne wird es trocken, bevor es gar ist.' },
    { titel: 'Schweinefilet', filter: 'Schwein', meta1: 'Innerer Rücken', badge: '€€', meta2: 'Kurzgebraten', text: 'In acht Minuten fertig, in zehn ruiniert. Kerntemperatur 58 Grad.' },
    { titel: 'Schäufele', filter: 'Schwein', meta1: 'Schulter', badge: '€', meta2: 'Schmoren', text: 'Mit Schwarte und Schulterblatt. Fränkische Institution.' },
    { titel: 'Schweinebauch', filter: 'Schwein', meta1: 'Bauch', badge: '€', meta2: 'Niedrigtemperatur', text: 'Erst weich garen, dann Schwarte krachen lassen. Zwei Schritte, nie einer.' },
    { titel: 'Spare Ribs', filter: 'Schwein', meta1: 'Bauchrippe', badge: '€', meta2: 'Niedrigtemperatur', text: 'Mehr Fleisch, mehr Fett, mehr Zeit als Baby Back.' },
    { titel: 'Baby Back Ribs', filter: 'Schwein', meta1: 'Rückenrippe', badge: '€€', meta2: 'Niedrigtemperatur', text: 'Kürzer, magerer, schneller fertig. Silberhaut muss runter.' },
    { titel: 'Presa', filter: 'Schwein', meta1: 'Schulterspitze', badge: '€€', meta2: 'Kurzgebraten', text: 'Iberico-Stück, marmoriert wie Rind. Medium servieren, nicht durch.' },
    { titel: 'Secreto', filter: 'Schwein', meta1: 'Unter der Schulter', badge: '€€', meta2: 'Kurz & scharf', text: 'Das versteckte Stück. Flach, fettdurchzogen, zwei Minuten pro Seite.' },
    { titel: 'Pluma', filter: 'Schwein', meta1: 'Rückenende', badge: '€€', meta2: 'Kurzgebraten', text: 'Federförmig, zart, klein. Vom Grill direkt aufs Brett.' },
    { titel: 'Haxe', filter: 'Schwein', meta1: 'Hinterbein', badge: '€', meta2: 'Niedrigtemperatur', text: 'Erst garen, dann grillen. Die Schwarte entscheidet über alles.' },
    { titel: 'Lammkarree', filter: 'Lamm', meta1: 'Rücken', badge: '€€€', meta2: 'Kurzgebraten', text: 'Fettdeckel scoren, Knochen parieren. 56 Grad, keinesfalls mehr.' },
    { titel: 'Lammkeule', filter: 'Lamm', meta1: 'Hinterbein', badge: '€€', meta2: 'Rückwärts garen', text: 'Am Knochen aromatischer, ohne leichter zu tranchieren.' },
    { titel: 'Lammschulter', filter: 'Lamm', meta1: 'Schulter', badge: '€', meta2: 'Schmoren', text: 'Sechs Stunden bei 140 Grad. Dann zerfällt sie unter der Gabel.' },
    { titel: 'Lammlachs', filter: 'Lamm', meta1: 'Rücken ausgelöst', badge: '€€€', meta2: 'Kurz & scharf', text: 'Der Filetstrang vom Rücken. Vier Minuten, dann ruhen.' },
    { titel: 'Lammhaxe', filter: 'Lamm', meta1: 'Vorderbein', badge: '€€', meta2: 'Schmoren', text: 'Klein, sehnig, dankbar. Rotwein und Zeit.' },
  ],
};

const streitfaelle: Katalog = {
  key: 'streitfaelle',
  label: 'Streitfälle',
  tab: 'Streitfälle',
  titel: 'Was jeder sagt. Und was stimmt.',
  badge: 'Urteil',
  lead: 'Regeln, die weitergegeben werden, weil sie plausibel klingen. Wir prüfen sie nach — mit Messwerten, nicht mit Meinung.',
  dim: 'Urteil',
  dims: ['Falsch', 'Halb richtig', 'Stimmt'],
  eintraege: [
    { titel: 'Anbraten schließt die Poren', filter: 'Falsch', meta1: 'Nr. 1', badge: 'Falsch', meta2: 'Physik', text: 'Fleisch hat keine Poren. Die Kruste ist Geschmack, keine Abdichtung.', href: '/streitfaelle/poren-schliessen' },
    { titel: 'Salzen entzieht Wasser', filter: 'Halb richtig', meta1: 'Nr. 2', badge: 'Halb richtig', meta2: 'Chemie', text: 'Kurzfristig ja, nach 40 Minuten kehrt sich der Effekt um.' },
    { titel: 'Der rote Saft ist Blut', filter: 'Falsch', meta1: 'Nr. 5', badge: 'Falsch', meta2: 'Biologie', text: 'Es ist Myoglobin. Blut ist beim Schlachten raus.', href: '/streitfaelle/myoglobin' },
    { titel: 'Nach Zeit grillen funktioniert', filter: 'Falsch', meta1: 'Nr. 7', badge: 'Falsch', meta2: 'Methodik', text: 'Dicke, Starttemperatur und Grill schwanken zu stark.' },
    { titel: 'Ruhen lassen ist Pflicht', filter: 'Stimmt', meta1: 'Nr. 9', badge: 'Stimmt', meta2: 'Messung', text: 'Fünf Minuten kosten zwei Grad und retten den halben Saft.' },
    { titel: 'Marinade zieht ins Fleisch ein', filter: 'Halb richtig', meta1: 'Nr. 12', badge: 'Halb richtig', meta2: 'Chemie', text: 'Zwei Millimeter tief. Alles darüber ist Wunschdenken.' },
    { titel: 'Dry Aging macht zart', filter: 'Halb richtig', meta1: 'Nr. 14', badge: 'Halb richtig', meta2: 'Reifung', text: 'Es macht aromatischer. Zart wird es durch Enzyme, nicht durch Trocknung.' },
    { titel: 'Gasgrill schmeckt nicht nach Grill', filter: 'Halb richtig', meta1: 'Nr. 18', badge: 'Halb richtig', meta2: 'Technik', text: 'Ohne Tropffett kein Raucharoma — mit Umlenkblech kommt es zurück.' },
  ],
};

const rezepte: Katalog = {
  key: 'rezepte',
  label: 'Rezepte',
  tab: 'Rezepte',
  titel: 'Rezepte, die eine Methode lehren',
  badge: 'Dauer',
  lead: 'Kein Rezept ohne Grund. Jedes steht für eine Technik, die danach auf zwanzig andere Stücke passt.',
  dim: 'Tierart',
  dims: ['Rind', 'Schwein', 'Lamm'],
  eintraege: [
    { titel: 'Ribeye, Reverse Sear', filter: 'Rind', meta1: 'Mittel', badge: '45 Min', meta2: 'Rückwärts garen', text: 'Erst indirekt auf 50 Grad, dann 90 Sekunden über die Glut.' },
    { titel: 'Brisket, 12 Stunden', filter: 'Rind', meta1: 'Schwer', badge: '12 Std', meta2: 'Niedrigtemperatur', text: 'Das Plateau bei 68 Grad aussitzen. Wer aufdreht, verliert.' },
    { titel: 'Picanha am Spieß', filter: 'Rind', meta1: 'Leicht', badge: '35 Min', meta2: 'Rückwärts garen', text: 'Fettdeckel nach außen, Salz grob, Scheiben von außen abschneiden.' },
    { titel: 'Flank Steak, Chimichurri', filter: 'Rind', meta1: 'Leicht', badge: '20 Min', meta2: 'Kurz & scharf', text: 'Vier Minuten total, dann quer zur Faser in dünne Streifen.' },
    { titel: 'Pulled Pork vom Nacken', filter: 'Schwein', meta1: 'Mittel', badge: '10 Std', meta2: 'Niedrigtemperatur', text: 'Bis 94 Grad Kern. Vorher zieht nichts auseinander.' },
    { titel: 'Krustenbraten, zwei Phasen', filter: 'Schwein', meta1: 'Mittel', badge: '3 Std', meta2: 'Niedrigtemperatur', text: 'Erst feucht bei 150, dann trocken bei 230 für die Schwarte.' },
    { titel: 'Secreto, zwei Minuten', filter: 'Schwein', meta1: 'Leicht', badge: '10 Min', meta2: 'Kurz & scharf', text: 'Volle Hitze, kein Öl, nur Salz. Medium, nicht durch.' },
    { titel: 'Lammkarree, 56 Grad', filter: 'Lamm', meta1: 'Mittel', badge: '30 Min', meta2: 'Kurzgebraten', text: 'Fettdeckel anrösten, indirekt hochziehen, im Ganzen ruhen.' },
  ],
};

const techniken: Katalog = {
  key: 'techniken',
  label: 'Techniken',
  tab: 'Techniken',
  titel: 'Zehn Techniken, alles andere sind Varianten',
  badge: 'Zone',
  lead: 'Wer die Hitzeführung versteht, braucht keine Anleitung mehr — nur ein Thermometer.',
  dim: 'Hitze',
  dims: ['Direkt', 'Indirekt', 'Kombiniert'],
  eintraege: [
    { titel: 'Direktes Grillen', filter: 'Direkt', meta1: '250–350 °C', badge: 'Direkt', meta2: 'Bis 3 cm', text: 'Über der Glut, Deckel offen. Alles, was in acht Minuten fertig ist.', href: '/methoden/direktes-grillen' },
    { titel: 'Indirektes Grillen', filter: 'Indirekt', meta1: '120–160 °C', badge: 'Indirekt', meta2: 'Ab 3 cm', text: 'Glut an die Seite, Deckel zu. Der Grill wird zum Ofen.', href: '/methoden/indirektes-grillen' },
    { titel: 'Rückwärts garen', filter: 'Kombiniert', meta1: '110 °C + Vollgas', badge: 'Kombiniert', meta2: 'Ab 4 cm', text: 'Langsam auf Kern, dann kurz für die Kruste. Der beste Kompromiss.', href: '/methoden/reverse-sear' },
    { titel: 'Vorwärts garen', filter: 'Kombiniert', meta1: 'Vollgas + 110 °C', badge: 'Kombiniert', meta2: '2–4 cm', text: 'Kruste zuerst, dann ziehen lassen. Schneller, weniger präzise.' },
    { titel: 'Niedrigtemperatur', filter: 'Indirekt', meta1: '95–120 °C', badge: 'Indirekt', meta2: 'Große Stücke', text: 'Stunden statt Minuten. Bindegewebe wird zu Gelatine.', href: '/methoden/smoken-low-and-slow' },
    { titel: 'Oberhitze', filter: 'Direkt', meta1: '700–800 °C', badge: 'Direkt', meta2: 'Bis 4 cm', text: 'Strahlungshitze von oben. Kruste in 60 Sekunden, Kern bleibt kühl.', href: '/methoden/oberhitze-grillen' },
    { titel: 'Sizzle Zone', filter: 'Direkt', meta1: '400–500 °C', badge: 'Direkt', meta2: 'Bis 3 cm', text: 'Gusseisen im Grill. Flächenkontakt statt Rostabdruck.' },
    { titel: 'Räuchern', filter: 'Indirekt', meta1: '90–110 °C', badge: 'Indirekt', meta2: 'Große Stücke', text: 'Rauch bindet in den ersten drei Stunden. Danach nur noch Wärme.' },
    { titel: 'Schmoren', filter: 'Indirekt', meta1: '140–160 °C', badge: 'Indirekt', meta2: 'Zähe Stücke', text: 'Mit Flüssigkeit im geschlossenen Topf. Kein Grillverfahren, aber nötig.' },
    { titel: 'Direkte Zone am Kohlekorb', filter: 'Kombiniert', meta1: 'Zwei Zonen', badge: 'Kombiniert', meta2: 'Alles', text: 'Halber Rost heiß, halber kalt. Die wichtigste Grundeinstellung.' },
  ],
};

export const KATALOGE: Record<KatalogKey, Katalog> = { cuts, streitfaelle, rezepte, techniken };

/** Reihenfolge der Reiter — wie im Prototyp */
export const KATALOG_REIHENFOLGE: KatalogKey[] = ['cuts', 'streitfaelle', 'rezepte', 'techniken'];

export function istKatalogKey(x: string): x is KatalogKey {
  return x in KATALOGE;
}
