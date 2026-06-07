// Verschenkbare Produkte (produktspezifische Geschenkgutscheine).
// Nur kurs-basierte Produkte, die über grant_course_access einlösbar sind.
// checkoutUrl = Digistore24-Checkout der "Geschenkgutschein"-Produktvariante;
// fehlt sie (env nicht gesetzt) → CTA zeigt „In Vorbereitung".
//
// Uwe-Schritte je Produkt: (1) Digistore24 Gutschein-Produkt anlegen,
// (2) NEXT_PUBLIC_DS_VOUCHER_* env setzen, (3) in digistore_products mappen
// (ds_product_id → course_id, is_voucher=true).
//
// NICHT enthalten (Nachzügler): steak-beichte (Credit-Modell, braucht
// Credit-Einlöse-Variante) · Diplom (noch nicht monetarisiert).

export interface GiftableProduct {
  courseSlug: string;
  title: string;
  priceLabel: string;
  blurb: string;
  checkoutUrl?: string;
}

export const GIFTABLE_PRODUCTS: GiftableProduct[] = [
  {
    courseSlug: 'bbq-grundkurs',
    title: 'BBQ-Grundkurs',
    priceLabel: '79 €',
    blurb: 'Der komplette Einsteiger-Kurs: Feuer, Temperatur, Grundtechniken — vom ersten Funken zum sicheren Steak.',
    checkoutUrl: process.env.NEXT_PUBLIC_DS_VOUCHER_BBQ_GRUNDKURS,
  },
  {
    courseSlug: 'mein-protokoll',
    title: 'Mein Protokoll',
    priceLabel: '19 €',
    blurb: 'Ein persönlicher 8-Wochen-Grillplan — Cuts, Techniken und Progression, abgestimmt auf Setup und Ziel.',
    checkoutUrl: process.env.NEXT_PUBLIC_DS_VOUCHER_MEIN_PROTOKOLL,
  },
];
