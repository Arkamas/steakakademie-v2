import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'AGB — Steakakademie',
  robots: { index: false, follow: false },
};

export default function AgbPage() {
  const h2Class = 'font-sans text-sm font-bold tracking-[0.12em] uppercase text-text-primary mb-3';
  const linkClass = 'text-brand-fire hover:underline';

  return (
    <>
      <Header />
      <main className="min-h-screen bg-surface-base">
        <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-14">

          <nav className="flex items-center gap-1.5 text-xs font-sans text-text-muted mb-8" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-brand-gold transition-colors">Start</Link>
            <ChevronRight size={12} />
            <span>AGB</span>
          </nav>

          <h1 className="font-serif text-3xl font-bold text-text-primary mb-2">
            Allgemeine Geschäftsbedingungen
          </h1>
          <p className="text-sm font-sans text-text-muted mb-10">Stand: Mai 2026</p>

          <div className="max-w-content space-y-8 font-body text-text-secondary leading-relaxed">

            <section>
              <h2 className={h2Class}>§ 1 Geltungsbereich</h2>
              <p>
                Diese AGB gelten für alle Bestellungen und Leistungen, die über steakakademie.de
                abgeschlossen werden. Vertragspartner ist <strong className="text-text-primary">Uwe Yendell</strong>{' '}
                (vollständige Angaben im{' '}
                <Link href="/impressum" className={linkClass}>Impressum</Link>).
              </p>
            </section>

            <section>
              <h2 className={h2Class}>§ 2 Vertragsschluss</h2>
              <p>
                Mit dem Absenden einer Bestellung oder der Anmeldung zu einem kostenpflichtigen
                Angebot gibst du ein verbindliches Kaufangebot ab. Der Vertrag kommt mit
                unserer Bestätigung per E-Mail zustande.
              </p>
            </section>

            <section>
              <h2 className={h2Class}>§ 3 Preise & Zahlung</h2>
              <p>
                Alle Preise sind Endpreise in Euro inkl. gesetzlicher Mehrwertsteuer (sofern
                anwendbar). Als Kleinunternehmer gemäß § 19 UStG kann keine Umsatzsteuer
                ausgewiesen werden. Verfügbare Zahlungsmethoden werden beim Bestellvorgang
                angezeigt.
              </p>
            </section>

            <section>
              <h2 className={h2Class}>§ 4 Lieferung (physische Produkte)</h2>
              <p>
                Für physische Produkte (z.&nbsp;B. Urkunden) beträgt die Lieferzeit 3–7 Werktage
                nach Zahlungseingang innerhalb Deutschlands. Versandkosten werden im
                Bestellvorgang ausgewiesen.
              </p>
            </section>

            <section>
              <h2 className={h2Class}>§ 5 Digitale Inhalte & Kurse</h2>
              <p>
                Digitale Inhalte (Kurse, Downloads, Zertifikate) werden nach Zahlungseingang
                und Vertragsschluss zur Verfügung gestellt. Mit Freischaltung des digitalen
                Inhalts erlischt das Widerrufsrecht gemäß § 356 Abs. 5 BGB, sofern du vorab
                ausdrücklich zugestimmt hast.
              </p>
            </section>

            <section>
              <h2 className={h2Class}>§ 6 Widerrufsrecht (physische Produkte)</h2>
              <p className="mb-3">
                Du hast das Recht, diesen Vertrag innerhalb von 14 Tagen ohne Angabe von
                Gründen zu widerrufen. Die Frist beginnt ab Erhalt der Ware.
              </p>
              <p>
                Widerruf per E-Mail an:{' '}
                <a href="mailto:info@steakakademie.de" className={linkClass}>
                  info@steakakademie.de
                </a>
              </p>
            </section>

            <section>
              <h2 className={h2Class}>§ 7 Gewährleistung</h2>
              <p>
                Es gelten die gesetzlichen Gewährleistungsrechte. Bei Mängeln wende dich
                innerhalb von 2 Jahren nach Erhalt der Ware an uns.
              </p>
            </section>

            <section>
              <h2 className={h2Class}>§ 8 Haftungsbeschränkung</h2>
              <p>
                Für Schäden aus der Nutzung der auf dieser Website bereitgestellten
                Informationen (Grillempfehlungen, Kerntemperaturen, Zubereitungshinweise)
                wird keine Haftung übernommen. Alle Angaben sind nach bestem Wissen erstellt;
                eine Garantie für Richtigkeit und Vollständigkeit wird nicht übernommen.
              </p>
            </section>

            <section>
              <h2 className={h2Class}>§ 9 Anwendbares Recht</h2>
              <p>
                Es gilt das Recht der Bundesrepublik Deutschland. Gerichtsstand ist
                Wuppertal, sofern du Kaufmann oder juristische Person des öffentlichen
                Rechts bist.
              </p>
            </section>

          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
