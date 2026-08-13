'use client';

/**
 * Aroma-Foodpairing auf Rezeptseiten (Flywheel-Verkettung 2b):
 * Zeigt zum Haupt-Cut des Rezepts die wissenschaftlichen Aroma-Partner
 * (geteilte Moleküle, /api/foodpairing) — jeder Partner verlinkt per
 * Deeplink `/?schmiede=<Auftrag>#werkzeuge` in die Rezept-Schmiede,
 * die den Auftrag automatisch generiert.
 *
 * Graceful: Ohne Treffer (Cut nicht im Aroma-Dataset) rendert die
 * Komponente NICHTS — kein kaputtes Modul, kein Layout-Loch.
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FlaskConical, ChevronRight } from 'lucide-react';

type Pairing = { partner: string; category: string | null; shared: number; shared_examples: string[] | null };

// Rezept-meatType (z. B. "Tomahawk Steak", "Iberico Secreto") → Basiszutat des
// Aroma-Datasets. Reihenfolge zählt: "Short/Back Ribs" ist Rind, erst danach
// greift das generische "ribs" für Schwein.
const AROMA_BASIS: Array<[RegExp, string]> = [
  [/short ribs|back ribs|rind|beef|steak|ribeye|entrec|wagyu|brisket|roastbeef|picanha|tri-tip|flank|bavette|skirt|onglet|hanger|porterhouse|t-bone|tomahawk|chateaubriand|tafelspitz|burnt|hack|bulgogi|yakiniku|entra|tira|costela|mollejas|boerewors/i, 'Rind'],
  [/lamm|lamb/i, 'Lamm'],
  [/schwein|pork|iberico|secreto|presa|pluma|carrillera|spareribs|ribs|nacken|krustenbraten|bauch|moo ping|boston butt|pulled pork/i, 'Schwein'],
  [/h[aä]hnchen|huhn|chicken|gefl[uü]gel|pute|frango|gai|tavuk|satay/i, 'Hähnchen'],
  [/lachs|salmon|saibling|char/i, 'Lachs'],
  [/thunfisch|tuna/i, 'Thunfisch'],
];

function aromaBasis(meatType: string): string | null {
  for (const [re, basis] of AROMA_BASIS) if (re.test(meatType)) return basis;
  return null;
}

export default function AromaPairing({ meatType }: { meatType: string }) {
  const [treffer, setTreffer] = useState<Pairing[]>([]);
  const basis = aromaBasis(meatType) ?? meatType;

  useEffect(() => {
    let aktiv = true;
    fetch('/api/foodpairing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ zutat: basis, limit: 5 }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (aktiv && Array.isArray(data?.treffer) && data.treffer.length) setTreffer(data.treffer);
      })
      .catch(() => {});
    return () => { aktiv = false; };
  }, [basis]);

  if (treffer.length === 0) return null;
  const max = treffer.reduce((m, t) => Math.max(m, t.shared), 1);

  return (
    <div className="not-prose my-8 bg-surface-elevated border border-border-subtle overflow-hidden">
      <div className="border-t-2 border-brand-gold px-6 pt-5 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <FlaskConical size={11} className="text-brand-fire shrink-0" />
          <span className="text-[10px] font-sans font-bold tracking-[0.18em] uppercase text-brand-fire">
            Steakakademie · Aroma-Wissenschaft
          </span>
        </div>
        <p className="font-serif text-base font-bold text-text-light leading-snug">
          Was passt zu {basis}? Partner über geteilte Aromamoleküle
        </p>
      </div>

      <ul className="px-6 pb-3 divide-y divide-border-subtle/60">
        {treffer.map((t) => (
          <li key={t.partner} className="py-2.5">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-sm font-medium text-text-primary">{t.partner}</span>
              <Link
                href={`/?schmiede=${encodeURIComponent(`${basis} mit ${t.partner}`)}#werkzeuge`}
                className="shrink-0 text-[10px] font-sans font-bold uppercase tracking-wide text-brand-gold hover:text-brand-fire transition-colors"
                title={`Rezept-Schmiede: ${basis} mit ${t.partner}`}
              >
                → Rezept schmieden
              </Link>
            </div>
            <span
              className="mt-1 inline-block h-1.5 rounded-full bg-brand-gold/80"
              style={{ width: `${Math.max(8, Math.round((t.shared / max) * 100))}%` }}
              aria-hidden
            />
            <p className="text-[11px] font-sans text-text-muted truncate">
              {t.shared} gemeinsame Moleküle
              {t.shared_examples?.length ? ` · ${t.shared_examples.join(', ')}` : ''}
            </p>
          </li>
        ))}
      </ul>

      <p className="px-6 pb-4 text-[10px] font-sans text-text-muted flex items-center gap-1">
        <ChevronRight size={10} className="text-brand-gold shrink-0" />
        Food-Pairing-Prinzip: Zutaten mit gemeinsamen Schlüssel-Aromastoffen harmonieren.
      </p>
    </div>
  );
}
