import Link from 'next/link';
import { Flame } from 'lucide-react';

const FOOTER_LINKS = {
  Wissen: [
    { label: 'Kerntemperaturen', href: '/temperatur-guide' },
    { label: 'Grilltechniken', href: '/methoden' },
    { label: 'Cuts & Fleischkunde', href: '/cuts' },
    { label: 'BBQ-Lexikon', href: '/glossar' },
    { label: 'Reverse Sear', href: '/methoden/reverse-sear' },
  ],
  Tests: [
    { label: 'Fleischthermometer', href: '/vergleich/fleischthermometer' },
    { label: 'Grills & Smoker', href: '/vergleich' },
    { label: 'Messer', href: '/vergleich' },
    { label: 'Alle Tests', href: '/vergleich' },
  ],
  Cuts: [
    { label: 'Ribeye', href: '/cuts/ribeye' },
    { label: 'Brisket', href: '/cuts/brisket' },
    { label: 'Pulled Pork', href: '/cuts/pulled-pork' },
    { label: 'Alle Cuts', href: '/cuts' },
  ],
  Akademie: [
    { label: 'Grillmeister-Diplome', href: '/diplome' },
    { label: 'Marco, der Pitmaster', href: '/autoren' },
    { label: 'Jonas', href: '/autoren' },
    { label: 'Elena', href: '/autoren' },
    { label: 'Über uns', href: '/ueber-uns' },
  ],
};

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-surface-dark text-text-light mt-16">
      {/* Main footer */}
      <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">

          {/* Brand column */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <Link href="/" className="inline-block">
              <span className="font-serif font-black text-2xl tracking-tight text-white hover:text-brand-gold transition-colors">
                Steakakademie
              </span>
            </Link>
            <p className="mt-3 text-sm font-body text-text-light/60 leading-relaxed max-w-[220px]">
              Deutschlands methodisch tiefste BBQ-Wissensplattform. Für Hobbygriller, die es ernst meinen.
            </p>
            <div className="mt-5 flex items-center gap-1 text-xs font-sans text-text-light/35 tracking-widest uppercase">
              <Flame size={12} className="text-brand-gold" />
              Seit 2026
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-[10px] font-sans font-bold tracking-[0.15em] uppercase text-text-light/35 mb-4">
                {title}
              </h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm font-sans text-text-light/65 hover:text-brand-gold transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Affiliate disclosure + legal */}
      <div className="border-t border-brand-gold/10">
        <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-[11px] font-sans text-text-light/35 leading-relaxed mb-4 max-w-3xl">
            <strong className="text-text-light/50">Affiliate-Hinweis:</strong> Einige Links auf dieser Seite sind Affiliate-Links.
            Wenn du über sie kaufst, erhalten wir eine kleine Provision — der Preis für dich ändert sich nicht.
            Wir empfehlen nur Produkte, die wir selbst getestet haben oder für qualitativ hochwertig halten.
          </p>
          {/* Gesetzlicher Widerrufsbutton (ab 19.06.2026) — ständig und leicht auffindbar, farblich hervorgehoben */}
          <Link
            href="/widerruf"
            className="inline-flex items-center gap-1.5 mb-5 px-4 py-2 border border-brand-gold/50 text-brand-gold text-xs font-sans font-bold tracking-wide uppercase hover:bg-brand-gold/10 transition-colors"
          >
            Vertrag widerrufen
          </Link>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px] font-sans text-text-light/35">
            <span>© {year} Steakakademie</span>
            <Link href="/impressum" className="hover:text-text-light/60 transition-colors">Impressum</Link>
            <Link href="/datenschutz" className="hover:text-text-light/60 transition-colors">Datenschutz</Link>
            <Link href="/agb" className="hover:text-text-light/60 transition-colors">AGB</Link>
            <Link href="/affiliate-disclosure" className="hover:text-text-light/60 transition-colors">Affiliate-Disclosure</Link>
            <Link href="/kontakt" className="hover:text-text-light/60 transition-colors">Kontakt</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
