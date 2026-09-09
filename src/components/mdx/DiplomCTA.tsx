import Link from 'next/link';
import { ChevronRight, GraduationCap } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// DiplomCTA — Conversion-Block im Fliesstext (MDX)
//
// Aufruf aus content/: <DiplomCTA modul="fleischkunde" headline="…" text="…"
// cta="Modul ansehen" />
//
// WOHIN VERLINKT WIRD:
// Unter /diplome/lernen existiert nur [stufe]/[lektion] — eine Landingpage je
// Stufe gibt es weiterhin nicht. Seit 08.09.2026 gibt es aber
// /diplome/rahmenlehrplan mit Ankern #stufe-1 … #stufe-5 (id am <section>).
// Dorthin verlinkt der Block: ein echtes Ziel, das die Stufe samt Lernzielen
// erklaert, statt der unspezifischen Uebersicht.
//
// KORREKTUR 09.09.2026: Die Labels nannten Stufe 3 bzw. 4 und die Abzeichen
// „Onglet-Kenner" / „Dry-Ager". Beide Abzeichen gehoeren laut ABZEICHEN in
// stufen.ts zu **Stufe 2** — der Block hat Lesern also die falsche Stufe
// genannt. Ausserdem fehlte die Klassifizierung (Grillmeister Bronze …
// Meisterklasse), die am 08.09. eingefuehrt wurde. Wer hier etwas aendert,
// prueft die Zuordnung gegen STUFEN und ABZEICHEN in
// src/lib/diplome/stufen.ts — nicht aus dem Gedaechtnis.
//
// Unbekanntes `modul` faellt auf /diplome — ein Tippfehler im Frontmatter soll
// den Block nicht verschwinden lassen, sondern ihn nur unspezifischer machen.
// ─────────────────────────────────────────────────────────────────────────────

const MODULE: Record<string, { label: string; href: string }> = {
  fleischkunde: {
    label: 'Stufe 2 · Grillmeister Silber — Cuts & Anatomie',
    href: '/diplome/rahmenlehrplan#stufe-2',
  },
  reifung: {
    label: 'Stufe 2 · Grillmeister Silber — Reifung & Lagerung',
    href: '/diplome/rahmenlehrplan#stufe-2',
  },
};

interface DiplomCTAProps {
  /** Schluessel aus MODULE. Unbekannte Werte landen auf der Uebersicht. */
  modul?: string;
  headline: string;
  text: string;
  /** Beschriftung des Buttons. */
  cta?: string;
}

export function DiplomCTA({ modul, headline, text, cta = 'Zum Diplom' }: DiplomCTAProps) {
  const ziel = (modul && MODULE[modul]) || { label: 'Grillmeister-Diplom', href: '/diplome' };

  return (
    <aside
      className="my-12 p-7"
      style={{
        background:
          'linear-gradient(135deg, rgba(232,80,24,0.10) 0%, rgba(200,136,42,0.06) 55%, transparent 100%)',
        border: '1px solid rgba(232,80,24,0.32)',
      }}
    >
      <div className="flex items-center gap-2.5 mb-4">
        <GraduationCap size={18} className="text-brand-fire shrink-0" />
        <span className="font-sans text-[11px] font-bold tracking-[0.14em] uppercase text-brand-fire">
          {ziel.label}
        </span>
      </div>

      <p className="font-serif text-xl sm:text-2xl font-bold text-text-light leading-snug mb-3">
        {headline}
      </p>
      <p className="font-body text-[1.0625rem] leading-[1.75] text-text-light/75 mb-6">{text}</p>

      <Link
        href={ziel.href}
        className="inline-flex items-center gap-2 px-5 py-3 font-sans text-sm font-bold text-white transition-opacity hover:opacity-85"
        style={{ backgroundColor: '#E85018' }}
      >
        {cta}
        <ChevronRight size={16} />
      </Link>
    </aside>
  );
}

export default DiplomCTA;
