import Link from 'next/link';
import { getAuthorBySlug } from '@/lib/authors';

/**
 * Der Satz unter der Autorenzeile — eine Quelle für Cut-, Methoden- und
 * Rezeptseiten.
 *
 * ANLASS (06.09.2026): Dort stand fest verdrahtet „Steakakademie-Autor. Jeder
 * Artikel basiert auf eigener Praxiserfahrung …". Das stimmt für Uwe. Für die
 * KI-Redaktionspersonas Marco, Jonas und Elena ist es sachlich falsch und
 * rechtlich heikel: Art. 50 KI-VO verlangt, dass KI-Herkunft erkennbar ist —
 * hier wurde das Gegenteil behauptet. Der Satz stand so bereits unter 136
 * Persona-Artikeln; aufgefallen ist es, als Uwe die Autorenstimme abgab und
 * 32 weitere Artikel auf Personas umzogen.
 *
 * Regel 6 (Rechtssicherheit → autonom fixen) greift hier.
 */
export default function AutorHinweis({
  authorSlug,
  variante = 'artikel',
  className = 'text-xs font-sans text-text-muted mt-1 leading-relaxed',
  linkClassName = 'underline hover:text-brand-fire',
}: {
  authorSlug: string;
  /** „rezept" nennt den Grilltest, „artikel" die methodische Grundlage. */
  variante?: 'artikel' | 'rezept';
  className?: string;
  linkClassName?: string;
}) {
  const autor = getAuthorBySlug(authorSlug);

  // Unbekannter Slug: lieber die vorsichtige Persona-Formulierung als eine
  // Behauptung über einen Menschen, den es im Autorenregister nicht gibt.
  if (autor?.realPerson) {
    return (
      <p className={className}>
        {variante === 'rezept'
          ? 'Steakakademie-Autor. Alle Rezepte basieren auf eigener Praxiserfahrung und werden mehrfach am Grill getestet, bevor sie veröffentlicht werden.'
          : 'Steakakademie-Autor. Jeder Artikel basiert auf eigener Praxiserfahrung und methodisch belegten Angaben.'}
      </p>
    );
  }

  return (
    <p className={className}>
      KI-Redaktionspersona der Steakakademie. {variante === 'rezept' ? 'Rezepte' : 'Inhalte'}{' '}
      entstehen KI-unterstützt auf Grundlage der kanonischen Temperatur- und Cut-Referenz und
      werden fachlich geprüft und verantwortet von Gründer Uwe Yendell.{' '}
      <Link href="/ki-disclaimer" className={linkClassName}>Mehr im KI-Disclaimer</Link>.
    </p>
  );
}
