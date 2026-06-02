import { Beef, ExternalLink } from 'lucide-react';

/**
 * „Cut → bestellen"-CTA für Rezeptseiten.
 * Verlinkt den Haupt-Cut zu den Premium-Fleisch-Partnern (Otto Gourmet, Albers).
 * Interim: Partner-Suche nach dem Cut. Nach Affiliate-Anmeldung → /go/-Tracking + rel="sponsored".
 */
const PARTNERS = (cut: string) => [
  { name: 'Otto Gourmet', url: `https://www.otto-gourmet.de/catalogsearch/result/?q=${encodeURIComponent(cut)}` },
  { name: 'Albers Food',  url: `https://www.albersfoodshop.de/search?search=${encodeURIComponent(cut)}` },
];

export default function CutBestellen({ cut, kategorie }: { cut?: string; kategorie?: string }) {
  if (kategorie !== 'fleisch' || !cut || cut.trim() === '' || cut.trim() === '—') return null;

  return (
    <aside className="not-prose my-8 border border-brand-gold/25 bg-surface-elevated p-6" aria-label="Cut bestellen">
      <div className="flex items-start gap-3">
        <Beef size={20} className="text-brand-gold shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-sans font-bold tracking-[0.16em] uppercase text-brand-gold mb-1">
            Premium-Fleisch bestellen
          </p>
          <p className="font-body text-sm text-text-secondary leading-relaxed mb-4">
            Diesen Cut — <strong className="text-text-primary">{cut}</strong> — in Premium-Qualität bei
            unseren Partnern, gekühlt nach Hause geliefert:
          </p>
          <div className="flex flex-wrap gap-3">
            {PARTNERS(cut).map((p) => (
              <a
                key={p.name}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 border text-sm font-sans font-bold transition-colors hover:bg-brand-gold/10"
                style={{ borderColor: 'rgba(200,136,42,0.5)', color: '#C8882A' }}
              >
                {p.name} <ExternalLink size={13} />
              </a>
            ))}
          </div>
          <p className="text-[10px] font-sans text-text-muted/70 mt-3">
            Unabhängige Partner-Empfehlung. Affiliate-Tracking folgt nach Anmeldung.
          </p>
        </div>
      </div>
    </aside>
  );
}
