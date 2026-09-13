/** Hofladen-Radar — oeffentliche Sicht auf einen Hof (View hoefe_public / RPC hoefe_im_umkreis). */
export interface Hof {
  id: string;
  slug: string;
  name: string;
  beschreibung: string | null;
  bio: boolean;
  bio_zertifikat: string | null;
  /** true = Fleisch belegt, false = ausdruecklich keins, null = unbekannt (OSM ohne Angabe). */
  verkauft_fleisch: boolean | null;
  fleischarten: string[];
  oeffnungszeiten: string | null;
  website: string | null;
  telefon: string | null;
  lat: number;
  lng: number;
  strasse: string | null;
  plz: string | null;
  ort: string | null;
  beansprucht: boolean;
  premium: boolean;
  datenquelle: string;
  letzter_import: string | null;
  geaendert_am: string;
}

/** Treffer der Umkreissuche — Teilmenge von Hof plus Entfernung. */
export interface HofTreffer {
  id: string;
  slug: string;
  name: string;
  bio: boolean;
  verkauft_fleisch: boolean | null;
  fleischarten: string[];
  lat: number;
  lng: number;
  strasse: string | null;
  plz: string | null;
  ort: string | null;
  website: string | null;
  telefon: string | null;
  beansprucht: boolean;
  premium: boolean;
  entfernung_km: number;
}

export interface Umkreis {
  lat: number;
  lng: number;
  km: number;
  nurFleisch: boolean;
}

export interface GeocodeTreffer {
  lat: number;
  lng: number;
  label: string;
}
