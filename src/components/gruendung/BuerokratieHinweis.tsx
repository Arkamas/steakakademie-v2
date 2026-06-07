import Link from 'next/link';
import { Landmark, ArrowRight } from 'lucide-react';

const GOLD = '#C8882A';

/**
 * Kompakter Sidebar-/Inline-Hinweis auf die Gründungs-Bürokratie.
 * Für Modul-Seiten und MDX: <BuerokratieHinweis /> — verweist auf die volle
 * Übersicht (Status-Schritte, Anträge, Kosten erste 6 Monate, Rechtsformen).
 *
 * Optional `variant="inline"` für schmalere Darstellung im Fließtext.
 */
export default function BuerokratieHinweis({
  variant = 'card',
}: { variant?: 'card' | 'inline' }) {
  const compact = variant === 'inline';
  return (
    <aside
      className={`not-prose rounded-sm border border-border-subtle bg-surface-elevated ${compact ? 'p-4' : 'p-5'}`}
    >
      <div className="mb-2 flex items-center gap-2">
        <Landmark size={15} style={{ color: GOLD }} className="shrink-0" />
        <span className="font-sans text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: GOLD }}>
          Bürokratie nicht vergessen
        </span>
      </div>
      <p className="font-body text-[0.9rem] leading-relaxed text-text-secondary">
        Noch nie mit Gewerbe oder Freiberuflichkeit zu tun gehabt? Die komplette Orientierung —
        <strong className="text-text-primary"> was du angehen musst</strong>,
        <strong className="text-text-primary"> was du beantragst</strong> und
        <strong className="text-text-primary"> welche Kosten</strong> in den ersten 6 Monaten ab
        Gewerbeanmeldung auf dich zukommen.
      </p>
      <Link
        href="/gruender-schmiede/gruendung-basics"
        className="mt-3 inline-flex items-center gap-1.5 font-sans text-[0.85rem] font-semibold transition-colors hover:opacity-80"
        style={{ color: GOLD }}
      >
        Zur Gründungs-Übersicht
        <ArrowRight size={14} />
      </Link>
    </aside>
  );
}
