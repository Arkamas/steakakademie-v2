import Link from 'next/link';
import Rauchring from './Rauchring';

/**
 * Kopfzeile des Relaunch-Designs (Handoff-README, „Kopfzeile und Navigation").
 *
 * Links: Die vier Kataloge führen ins Übersicht-Muster unter /relaunch/[katalog].
 * „Diplome" und „Über uns" führen auf die Relaunch-Vorlagen. „Ausrüstung" zeigt
 * auf die Live-Übersicht /vergleich, weil der Handoff keine Werkzeug-ÜBERSICHT
 * entwirft — nur die Einzelseite (Ansicht 6), die unter /relaunch/vergleich/[slug] liegt.
 *
 * Kursstatus: Der Zustand „Fortschritt vorhanden" (Stufe 1 · 1/7 mit Glutpunkt)
 * braucht den serverseitigen Kursfortschritt und ist hier noch nicht angebunden.
 * Bis dahin zeigt die Leiste den Zustand „kein Fortschritt".
 *
 * Mobile Navigation: laut Handoff bewusst NICHT entworfen (offener Punkt 2).
 * Unter 1040px fällt „Über uns" aus der Leiste, mehr nicht — genau wie im Prototyp.
 */
export default function Header() {
  return (
    <header className="sk-header">
      <div className="sk-header__inner">
        <Link href="/relaunch" className="sk-brand" aria-label="Steakakademie — Startseite">
          <Rauchring size={40} inner="#15120f" />
          <span className="sk-wordmark">
            Steak<span>akademie</span>
          </span>
        </Link>
        <nav className="sk-nav" aria-label="Hauptnavigation">
          <Link href="/relaunch/techniken" className="sk-nav__link">Grilltechniken</Link>
          <Link href="/relaunch/cuts" className="sk-nav__link">Cuts</Link>
          <Link href="/relaunch/streitfaelle" className="sk-nav__link">Wissen</Link>
          <Link href="/relaunch/rezepte" className="sk-nav__link">Rezepte</Link>
          <Link href="/vergleich" className="sk-nav__link">Ausrüstung</Link>
          <Link href="/relaunch/ueber-uns" className="sk-nav__link sk-nav__link--wide">Über uns</Link>
        </nav>
        <div className="sk-header__actions">
          <Link href="/relaunch/diplome" className="sk-btn sk-btn--ghost">Diplome</Link>
          <Link href="/auth/login" className="sk-btn sk-btn--primary">Anmelden</Link>
        </div>
      </div>
    </header>
  );
}
