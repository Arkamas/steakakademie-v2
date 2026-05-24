import { Flame, Wine, ExternalLink } from 'lucide-react';

interface BBQPairingProps {
  meatType: string;
  whiskeyName: string;
  whiskeyProfile: string;
  affiliateLinkWhiskey: string;
  wineName: string;
  wineProfile: string;
  affiliateLinkWine: string;
  whiskeyType?: string;
  wineType?: string;
}

export default function BBQPairing({
  meatType,
  whiskeyName,
  whiskeyProfile,
  affiliateLinkWhiskey,
  wineName,
  wineProfile,
  affiliateLinkWine,
  whiskeyType = 'Bourbon',
  wineType = 'Rotwein',
}: BBQPairingProps) {
  return (
    <aside
      className="my-10 not-prose bg-surface-elevated border border-brand-fire/30 overflow-hidden"
      aria-label={`Getränk-Pairing für ${meatType}`}
    >
      {/* Glut-orange top accent + header */}
      <div className="border-t-2 border-brand-fire px-6 pt-5 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <Flame size={11} className="text-brand-fire" />
          <span className="text-[10px] font-sans font-bold tracking-[0.18em] uppercase text-brand-fire">
            Steakakademie · Pairing-Empfehlung
          </span>
        </div>
        <p className="font-serif text-base font-bold text-text-light leading-snug">
          Das perfekte Getränk zum {meatType}
        </p>
      </div>

      <div className="border-t border-border-subtle" />

      {/* Two-column grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-border-subtle">

        {/* ── Left: Spirituosen-Tipp ────────────────────────────── */}
        <div className="p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <Flame size={13} className="text-brand-gold shrink-0" />
            <span className="text-[10px] font-sans font-bold tracking-[0.15em] uppercase text-brand-gold">
              Der Spirituosen-Tipp
            </span>
          </div>

          <span className="text-[10px] font-sans font-bold tracking-[0.12em] uppercase text-text-muted mb-1">
            {whiskeyType}
          </span>
          <h3 className="font-serif text-lg font-bold text-text-primary mb-3 leading-snug">
            {whiskeyName}
          </h3>
          <p className="font-body text-sm text-text-secondary leading-relaxed mb-6 flex-1">
            {whiskeyProfile}
          </p>

          <a
            href={affiliateLinkWhiskey}
            className="btn-affiliate w-full justify-center"
            rel="nofollow noopener noreferrer"
            target="_blank"
          >
            <ExternalLink size={14} />
            Jetzt ansehen
          </a>
        </div>

        {/* ── Right: Wein-Empfehlung ────────────────────────────── */}
        <div className="p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <Wine size={13} className="text-brand-gold shrink-0" />
            <span className="text-[10px] font-sans font-bold tracking-[0.15em] uppercase text-brand-gold">
              Die Wein-Empfehlung
            </span>
          </div>

          <span className="text-[10px] font-sans font-bold tracking-[0.12em] uppercase text-text-muted mb-1">
            {wineType}
          </span>
          <h3 className="font-serif text-lg font-bold text-text-primary mb-3 leading-snug">
            {wineName}
          </h3>
          <p className="font-body text-sm text-text-secondary leading-relaxed mb-6 flex-1">
            {wineProfile}
          </p>

          <a
            href={affiliateLinkWine}
            className="btn-affiliate w-full justify-center"
            rel="nofollow noopener noreferrer"
            target="_blank"
          >
            <ExternalLink size={14} />
            Jetzt ansehen
          </a>
        </div>
      </div>

      {/* Affiliate disclosure */}
      <div className="border-t border-border-subtle px-6 py-3">
        <p className="text-[10px] font-sans text-text-muted text-center">
          * Affiliate-Links — Preis für dich unverändert · Offenlegungspflicht gemäß §5a UWG
        </p>
      </div>
    </aside>
  );
}
