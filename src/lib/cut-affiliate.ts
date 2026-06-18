// Fleisch-Affiliate-Brücke für den Cut-Generator.
//
// Strategie (config-driven, Burggraben + ROADMAP): Premium-Fleischversand als
// Primärpartner (Otto Gourmet — Status "planned", siehe ROADMAP). Solange nicht
// freigeschaltet, greift ein SAUBERER FALLBACK auf die Amazon-Suche mit aktivem
// Partner-Tag — exakt das Muster der Grill-/Thermometer-Produkte (registry.yaml).
//
// Sobald der Partner live ist: `status: 'active'` setzen + (optional) Deeplink-
// Builder ergänzen. Der Rest (UI, Tracking-Route) bleibt unverändert.

import type { Cut } from './cuts-catalog';

const AMAZON_TAG = 'steakakademie-21';

type PartnerStatus = 'planned' | 'active';

interface MeatPartner {
  id: string;
  name: string;
  status: PartnerStatus;
  /** baut die Ziel-URL für einen Cut (Suche oder Deeplink) */
  buildUrl: (cut: Cut) => string;
}

// Primärpartner — hochpreisiger Fleischversand (hoher €-Betrag/Sale).
const PRIMARY: MeatPartner = {
  id: 'otto-gourmet',
  name: 'Otto Gourmet',
  status: 'planned', // ← auf 'active' setzen, sobald Affiliate freigeschaltet
  buildUrl: (cut) =>
    `https://www.ottogourmet.de/search?q=${encodeURIComponent(cut.nameDE)}`,
};

// Fallback — Amazon-Suche mit aktivem Partner-Tag (immer verfügbar).
const FALLBACK: MeatPartner = {
  id: 'amazon',
  name: 'Amazon',
  status: 'active',
  buildUrl: (cut) =>
    `https://www.amazon.de/s?k=${encodeURIComponent(`${cut.nameDE} ${cut.nameEN} Fleisch`)}&tag=${AMAZON_TAG}`,
};

/** Aktiver Partner: Primär falls live, sonst Fallback. */
export function activeMeatPartner(): MeatPartner {
  return PRIMARY.status === 'active' ? PRIMARY : FALLBACK;
}

/** Externe Ziel-URL (für die Redirect-Route /go-fleisch/[cut]). */
export function buildMeatTargetUrl(cut: Cut): string {
  return activeMeatPartner().buildUrl(cut);
}

export interface MeatOffer {
  href: string; // interner Redirect (getrackt)
  partnerName: string;
  label: string;
  disclosure: string;
  /** true = Premium-Partner aktiv; false = Fallback (Hinweis anzeigen) */
  premiumActive: boolean;
}

/** UI-Sicht: Button-Daten für „Diesen Cut kaufen". */
export function getMeatOffer(cut: Cut): MeatOffer {
  const premiumActive = PRIMARY.status === 'active';
  const partner = activeMeatPartner();
  return {
    href: `/go-fleisch/${cut.id}`,
    partnerName: partner.name,
    label: premiumActive ? `${cut.nameDE} bei ${partner.name} kaufen` : `${cut.nameDE} kaufen`,
    disclosure:
      'Affiliate-Link: Kaufst du über diesen Link, erhalten wir eine Provision — ohne Mehrkosten für dich.',
    premiumActive,
  };
}
