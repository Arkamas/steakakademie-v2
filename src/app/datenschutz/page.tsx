import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Datenschutzerklärung — Steakakademie',
  robots: { index: false, follow: false },
};

export default function DatenschutzPage() {
  const linkClass = 'text-brand-fire hover:underline';
  const h2Class = 'font-sans text-sm font-bold tracking-[0.12em] uppercase text-text-primary mb-3';

  return (
    <>
      <Header />
      <main className="min-h-screen bg-surface-base">
        <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-14">

          <nav className="flex items-center gap-1.5 text-xs font-sans text-text-muted mb-8" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-brand-gold transition-colors">Start</Link>
            <ChevronRight size={12} />
            <span>Datenschutz</span>
          </nav>

          <h1 className="font-serif text-3xl font-bold text-text-primary mb-2">Datenschutzerklärung</h1>
          <p className="text-sm font-sans text-text-muted mb-10">Stand: Mai 2026</p>

          <div className="max-w-content space-y-8 font-body text-text-secondary leading-relaxed">

            <section>
              <h2 className={h2Class}>1. Verantwortlicher</h2>
              <p>
                Uwe Yendell<br />
                Stahlsberg 73<br />
                42279 Wuppertal<br />
                E-Mail:{' '}
                <a href="mailto:info@steakakademie.de" className={linkClass}>
                  info@steakakademie.de
                </a>
              </p>
            </section>

            <section>
              <h2 className={h2Class}>2. Allgemeine Hinweise zur Datenverarbeitung</h2>
              <p>
                Die Nutzung dieser Website ist grundsätzlich ohne Angabe personenbezogener Daten
                möglich. Soweit personenbezogene Daten erhoben werden, erfolgt dies auf freiwilliger
                Basis. Diese Daten werden ohne deine ausdrückliche Zustimmung nicht an Dritte
                weitergegeben, außer es ist zur Erbringung des Dienstes erforderlich.
              </p>
            </section>

            <section>
              <h2 className={h2Class}>3. Hosting (Netlify)</h2>
              <p className="mb-3">
                Diese Website wird bei Netlify Inc., 44 Montgomery Street, Suite 300, San Francisco,
                CA 94104, USA gehostet. Server-Standort: Europa (EU-Rechenzentrum). Beim Aufruf der
                Website werden automatisch Serverlog-Daten gespeichert (IP-Adresse, Browsertyp,
                Betriebssystem, Referrer-URL, Uhrzeit des Zugriffs). Diese Daten werden nicht mit
                anderen Datenquellen zusammengeführt.
              </p>
              <p>
                Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse am
                störungsfreien Betrieb). Details:{' '}
                <a href="https://www.netlify.com/privacy/" target="_blank" rel="noopener noreferrer" className={linkClass}>
                  netlify.com/privacy
                </a>
              </p>
            </section>

            <section>
              <h2 className={h2Class}>4. CDN & DNS (Cloudflare)</h2>
              <p className="mb-3">
                Wir nutzen Cloudflare Inc., 101 Townsend St., San Francisco, CA 94107, USA als
                DNS-Anbieter und Content Delivery Network (CDN). Dabei werden Anfragen an unsere
                Website über Cloudflare-Server geleitet, um Sicherheit und Ladegeschwindigkeit
                zu verbessern. Cloudflare kann dabei technische Daten (u. a. IP-Adressen) verarbeiten.
              </p>
              <p>
                Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO. Details:{' '}
                <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener noreferrer" className={linkClass}>
                  cloudflare.com/privacypolicy
                </a>
              </p>
            </section>

            <section>
              <h2 className={h2Class}>5. Newsletter & E-Mail-Benachrichtigungen (Loops)</h2>
              <p className="mb-3">
                Wenn du dich für unseren Newsletter anmeldest, übermittelst du deine E-Mail-Adresse
                an Loops Software Inc. (loops.so). Loops verarbeitet diese Daten ausschließlich zur
                Zustellung unserer E-Mails. Eine Weitergabe an Dritte findet nicht statt.
              </p>
              <p className="mb-3">
                Die Einwilligung zur Speicherung und Nutzung deiner E-Mail-Adresse für den Versand
                des Newsletters kann jederzeit widerrufen werden (Abmelde-Link in jedem Newsletter
                oder per E-Mail an{' '}
                <a href="mailto:info@steakakademie.de" className={linkClass}>info@steakakademie.de</a>).
              </p>
              <p>
                Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO (Einwilligung). Details:{' '}
                <a href="https://loops.so/privacy" target="_blank" rel="noopener noreferrer" className={linkClass}>
                  loops.so/privacy
                </a>
              </p>
            </section>

            <section>
              <h2 className={h2Class}>6. KI-Chatassistent „Marco" (Anthropic)</h2>
              <p className="mb-3">
                Diese Website bietet einen KI-gestützten Chat-Assistenten an. Nachrichten, die du
                in den Chat eingibst, werden zur Verarbeitung an Anthropic PBC, 548 Market St,
                PMB 90375, San Francisco, CA 94104, USA übermittelt. Anthropic verarbeitet diese
                Daten zur Generierung von Antworten. Es werden keine Chateingaben dauerhaft
                gespeichert oder mit deiner Person verknüpft.
              </p>
              <p className="mb-3">
                Wir empfehlen, keine personenbezogenen Daten in den Chat einzugeben.
              </p>
              <p>
                Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der
                Bereitstellung des Dienstes). Details:{' '}
                <a href="https://www.anthropic.com/privacy" target="_blank" rel="noopener noreferrer" className={linkClass}>
                  anthropic.com/privacy
                </a>
              </p>
            </section>

            <section>
              <h2 className={h2Class}>7. Cookies & Local Storage</h2>
              <p>
                Diese Website verwendet ausschließlich technisch notwendige Local-Storage-Einträge
                (z. B. Theme-Einstellung). Es werden keine Tracking-Cookies, Werbe-Cookies oder
                Analyse-Cookies gesetzt. Eine Einwilligung nach § 25 TTDSG ist daher nicht
                erforderlich.
              </p>
            </section>

            <section>
              <h2 className={h2Class}>8. Externe Links & Affiliate-Links</h2>
              <p className="mb-3">
                Diese Website enthält Links zu externen Websites Dritter, auf deren Inhalte
                wir keinen Einfluss haben. Für die Inhalte der verlinkten Seiten ist stets
                der jeweilige Anbieter oder Betreiber verantwortlich.
              </p>
              <p>
                Produktempfehlungen können Affiliate-Links enthalten (gekennzeichnet mit *).
                Bei einem Kauf über solche Links erhalten wir eine Provision ohne Mehrkosten
                für dich.
              </p>
            </section>

            <section>
              <h2 className={h2Class}>9. Deine Rechte</h2>
              <p className="mb-3">Du hast gemäß DSGVO folgende Rechte:</p>
              <ul className="list-disc list-inside space-y-1.5 mb-3">
                <li>Auskunft über gespeicherte Daten (Art. 15 DSGVO)</li>
                <li>Berichtigung unrichtiger Daten (Art. 16 DSGVO)</li>
                <li>Löschung deiner Daten (Art. 17 DSGVO)</li>
                <li>Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
                <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
                <li>Widerspruch gegen die Verarbeitung (Art. 21 DSGVO)</li>
                <li>Widerruf einer erteilten Einwilligung (Art. 7 Abs. 3 DSGVO)</li>
              </ul>
              <p>
                Wende dich dazu an:{' '}
                <a href="mailto:info@steakakademie.de" className={linkClass}>
                  info@steakakademie.de
                </a>
              </p>
            </section>

            <section>
              <h2 className={h2Class}>10. Beschwerderecht bei der Aufsichtsbehörde</h2>
              <p>
                Du hast das Recht, dich bei der zuständigen Datenschutz-Aufsichtsbehörde
                zu beschweren. Zuständig ist die Landesbeauftragte für Datenschutz und
                Informationsfreiheit Nordrhein-Westfalen:{' '}
                <a href="https://www.ldi.nrw.de" target="_blank" rel="noopener noreferrer" className={linkClass}>
                  ldi.nrw.de
                </a>
              </p>
            </section>

            <p className="text-sm text-text-muted pt-6 border-t border-border-subtle">
              Erstellt mit Unterstützung von{' '}
              <a href="https://www.e-recht24.de" target="_blank" rel="noopener noreferrer" className={linkClass}>
                eRecht24
              </a>
            </p>

          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
