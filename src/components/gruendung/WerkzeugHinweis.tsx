import { Cpu } from 'lucide-react';

const FIRE = '#E85018';

/**
 * Ehrliche Offenlegung der Werkzeug-Kosten (Claude Code) — zahlt auf
 * „Das ehrliche System" ein. WICHTIG: Der „kein Abo / monatlich kündbar"-
 * Hinweis bezieht sich auf CLAUDE (externes Werkzeug), NICHT auf die
 * Gründer-Schmiede selbst — Produkt-Zahlungs-/Abo-Hinweise gehören NICHT
 * auf die Verkaufsseite (zeigt Digistore24 automatisch an).
 *
 * `variant="inline"` für schmalere Darstellung.
 */
export default function WerkzeugHinweis({
  variant = 'card',
}: { variant?: 'card' | 'inline' }) {
  const compact = variant === 'inline';
  return (
    <aside
      className={`not-prose rounded-r-sm border-l-[3px] ${compact ? 'py-3 pl-4 pr-4' : 'py-4 pl-5 pr-5'}`}
      style={{ borderLeftColor: FIRE, background: `${FIRE}0F` }}
    >
      <div className="mb-2 flex items-center gap-2">
        <Cpu size={15} style={{ color: FIRE }} className="shrink-0" />
        <span className="font-sans text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: FIRE }}>
          Werkzeug-Kosten — ehrlich gesagt
        </span>
      </div>
      <p className="font-body text-[0.92rem] leading-relaxed text-text-secondary">
        Diese Methode baut mit <strong className="text-text-primary">Claude Code</strong> (KI von
        Anthropic). Dafür brauchst du ein eigenes Claude-Abo — unsere Empfehlung ist der{' '}
        <strong className="text-text-primary">Max-Tarif</strong> für ernsthaftes Bauen (für den
        Einstieg genügt oft der kleinere Pro-Tarif).
      </p>
      <ul className="mt-2 space-y-1 font-body text-[0.9rem] leading-relaxed text-text-secondary">
        <li className="flex gap-2">
          <span style={{ color: FIRE }}>•</span>
          <span>Diese Werkzeug-Kosten trägst <strong className="text-text-primary">du selbst</strong> — sie sind <strong className="text-text-primary">nicht</strong> im Preis enthalten.</span>
        </li>
        <li className="flex gap-2">
          <span style={{ color: FIRE }}>•</span>
          <span>Du musst dafür <strong className="text-text-primary">kein langfristiges Abo</strong> abschließen: Claude ist <strong className="text-text-primary">monatlich kündbar</strong>. Abonniere es für die Wochen, in denen du aktiv baust — und kündige danach wieder.</span>
        </li>
        <li className="flex gap-2">
          <span style={{ color: FIRE }}>•</span>
          <span><strong className="text-text-primary">Zur Einordnung:</strong> Eine professionell gebaute Website — selbst halb so groß wie die Steakakademie — kostet bei einer Agentur schnell <strong className="text-text-primary">mehrere tausend Euro</strong>, dazu laufende Kosten bei jeder Änderung. Mit dieser Methode baust und verwaltest du alles selbst: keine Agentur, keine Wartezeiten — nur das Werkzeug, solange du es nutzt.</span>
        </li>
      </ul>
    </aside>
  );
}
