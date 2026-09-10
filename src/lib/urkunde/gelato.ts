import 'server-only';

/**
 * Gelato — Druck und Versand der gedruckten Urkunden.
 *
 * Produkt und Preise am 10.09.2026 ueber die Katalog-API festgestellt:
 *   cards_pf_a4_pt_250-gsm-coated-silk_cl_4-0_hor
 *   ein A4-Bogen quer, 250 g/m², seidenmatt gestrichen, 4/0 (einseitig)
 *   Druck 3,51 € · Versand ab 6,49 € (DHL Warenpost) bzw. 8,70 € (UPS Standard)
 *
 * Bewusst UPS Standard statt der billigeren Warenpost: Die Warenpost ist
 * unversichert und nicht nachverfolgbar. Auf der Urkunde steht eine
 * fortlaufende Nummer — geht die Sendung verloren, gibt es sonst weder
 * Nachweis noch Ersatz. Die 2,21 € Unterschied sind im Verkaufspreis drin.
 *
 * Die Datei geht als URL an Gelato, nicht als Upload: Die v4-API laedt sie
 * selbst herunter. Deshalb eine zeitlich begrenzte, signierte Supabase-URL —
 * auf dem Blatt steht ein Klarname.
 */

export const GELATO_PRODUKT_UID = 'cards_pf_a4_pt_250-gsm-coated-silk_cl_4-0_hor';

/**
 * Versandart. „ups_standard_tariff" ist nachverfolgbar; „normal" ueberliesse
 * Gelato die Wahl und damit womoeglich die unversicherte Warenpost.
 */
export const GELATO_VERSANDART = 'ups_standard_tariff';

const GELATO_ORDER_URL = 'https://order.gelatoapis.com/v4/orders';

export type GelatoAdresse = {
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postCode: string;
  state?: string;
  /** ISO 3166-1 alpha-2 */
  country: string;
  email: string;
};

export type GelatoAuftrag = {
  /** Unsere Bestell-ID — taucht in Gelatos Oberflaeche wieder auf */
  referenz: string;
  kundenReferenz: string;
  /** Oeffentlich erreichbare URL der Druckdatei (PNG, 300 dpi) */
  dateiUrl: string;
  adresse: GelatoAdresse;
  /** true legt den Auftrag als Entwurf an: nichts wird produziert oder berechnet */
  entwurf?: boolean;
};

export type GelatoErgebnis = {
  id: string;
  fulfillmentStatus?: string;
  financialStatus?: string;
  rohdaten: unknown;
};

export class GelatoFehler extends Error {
  constructor(message: string, readonly status: number, readonly rohdaten: unknown) {
    super(message);
    this.name = 'GelatoFehler';
  }
}

/** Kuerzt auf die von der Gelato-API erlaubte Laenge — lieber hier als dort scheitern. */
function kuerze(wert: string, max: number): string {
  const w = wert.trim();
  return w.length <= max ? w : w.slice(0, max);
}

export async function sendeAuftrag(auftrag: GelatoAuftrag): Promise<GelatoErgebnis> {
  const key = process.env.GELATO_API_KEY;
  if (!key) throw new GelatoFehler('GELATO_API_KEY ist nicht gesetzt.', 0, null);

  const koerper = {
    orderType: auftrag.entwurf ? 'draft' : 'order',
    orderReferenceId: auftrag.referenz,
    customerReferenceId: auftrag.kundenReferenz,
    currency: 'EUR',
    shipmentMethodUid: GELATO_VERSANDART,
    items: [
      {
        itemReferenceId: `urkunde-${auftrag.referenz}`,
        productUid: GELATO_PRODUKT_UID,
        quantity: 1,
        files: [{ type: 'default', url: auftrag.dateiUrl }],
      },
    ],
    shippingAddress: {
      firstName: kuerze(auftrag.adresse.firstName, 25),
      lastName: kuerze(auftrag.adresse.lastName, 25),
      addressLine1: kuerze(auftrag.adresse.addressLine1, 35),
      ...(auftrag.adresse.addressLine2 ? { addressLine2: kuerze(auftrag.adresse.addressLine2, 35) } : {}),
      city: kuerze(auftrag.adresse.city, 30),
      postCode: kuerze(auftrag.adresse.postCode, 15),
      ...(auftrag.adresse.state ? { state: kuerze(auftrag.adresse.state, 35) } : {}),
      country: auftrag.adresse.country.toUpperCase().slice(0, 2),
      email: auftrag.adresse.email,
    },
  };

  const antwort = await fetch(GELATO_ORDER_URL, {
    method: 'POST',
    headers: { 'X-API-KEY': key, 'Content-Type': 'application/json' },
    body: JSON.stringify(koerper),
    cache: 'no-store',
  });

  const text = await antwort.text();
  let daten: unknown = null;
  try { daten = text ? JSON.parse(text) : null; } catch { daten = text; }

  if (!antwort.ok) {
    const meldung = (daten as { message?: string } | null)?.message ?? `HTTP ${antwort.status}`;
    throw new GelatoFehler(`Gelato hat den Auftrag abgelehnt: ${meldung}`, antwort.status, daten);
  }

  const id = (daten as { id?: string } | null)?.id;
  if (!id) throw new GelatoFehler('Gelato hat keine Auftrags-ID zurueckgegeben.', antwort.status, daten);

  return {
    id,
    fulfillmentStatus: (daten as { fulfillmentStatus?: string }).fulfillmentStatus,
    financialStatus: (daten as { financialStatus?: string }).financialStatus,
    rohdaten: daten,
  };
}
