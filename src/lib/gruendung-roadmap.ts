// Standard-Roadmap als Vorlage für den Arbeitszeit-Planer.
// Grobe Aufwands-Schätzungen in Stunden — vom User frei anpassbar.
// Reihenfolge = sinnvolle Bearbeitungsreihenfolge (Bürokratie → Methode → Website).

export type RoadmapKategorie = 'Bürokratie' | 'Methode' | 'Website';

export interface RoadmapAufgabe {
  id: string;
  title: string;
  category: RoadmapKategorie;
  effortH: number;
}

export const ROADMAP_VORLAGE: RoadmapAufgabe[] = [
  // Bürokratie — selbständig werden
  { id: 'b1', title: 'Tätigkeit einordnen: Gewerbe oder Freiberuf?', category: 'Bürokratie', effortH: 1 },
  { id: 'b2', title: 'Rechtsform wählen', category: 'Bürokratie', effortH: 1 },
  { id: 'b3', title: 'Gewerbe anmelden (falls Gewerbe)', category: 'Bürokratie', effortH: 1 },
  { id: 'b4', title: 'ELSTER-Konto + Fragebogen zur steuerlichen Erfassung', category: 'Bürokratie', effortH: 2 },
  { id: 'b5', title: 'Kranken-/Sozialversicherung klären', category: 'Bürokratie', effortH: 2 },
  { id: 'b6', title: 'Geschäftskonto + Buchhaltungs-Tool aufsetzen', category: 'Bürokratie', effortH: 2 },
  { id: 'b7', title: 'Haftpflicht + Rechtsschutz abschließen', category: 'Bürokratie', effortH: 1 },

  // Methode — KI-gesteuert bauen (die 6 Module)
  { id: 'm1', title: 'Modul 1: Chef-Prinzip — Wahrheitsquelle anlegen', category: 'Methode', effortH: 1.5 },
  { id: 'm2', title: 'Modul 2–3: KI an Tools koppeln (Jira/Confluence)', category: 'Methode', effortH: 2 },
  { id: 'm3', title: 'Modul 4–5: Struktur + Wissensbasis bauen', category: 'Methode', effortH: 2.5 },
  { id: 'm4', title: 'Modul 6: Arbeits-Loop einüben', category: 'Methode', effortH: 1 },

  // Website — bis zum rechtssicheren Go-Live
  { id: 'w1', title: 'Positionierung + erstes Angebot schärfen', category: 'Website', effortH: 3 },
  { id: 'w2', title: 'Domain + Hosting einrichten', category: 'Website', effortH: 1 },
  { id: 'w3', title: 'Website-Grundgerüst bauen', category: 'Website', effortH: 6 },
  { id: 'w4', title: 'Rechtstexte: Impressum, Datenschutz, AGB, Widerruf', category: 'Website', effortH: 3 },
  { id: 'w5', title: 'Rechtssicherheits-Check vor Go-Live', category: 'Website', effortH: 2 },
  { id: 'w6', title: 'Go-Live + erste Sichtbarkeit', category: 'Website', effortH: 2 },
];

export const KATEGORIE_FARBE: Record<RoadmapKategorie, string> = {
  'Bürokratie': '#E85018',
  'Methode': '#C8882A',
  'Website': '#5B7A8C',
};

// Standard-Verfügbarkeit pro Wochentag (Mo..So) in Stunden.
export const DEFAULT_STUNDEN: number[] = [2, 2, 2, 2, 2, 3, 0];

export const WOCHENTAGE = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
