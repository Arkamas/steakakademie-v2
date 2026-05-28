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
                <a href="mailto:pitmaster@steakakademie.de" className={linkClass}>
                  pitmaster@steakakademie.de
                </a>
              </p>
            </section>

            <section>
              <h2 className={h2Class}>2. Allgemeine Hinweise zur Datenverarbeitung</h2>
              <p>
                Die Nutzung dieser Website ist grundsätzlich ohne Angabe personenbezogener Daten
                möglich. Soweit personenbezogene Daten erhoben werden, erfolgt dies auf freiwilliger
                Basis. Diese Daten werden ohne deine ausdrückliche Zustimmung nicht an Dritte
                weitergegeben, außer es ist zur Erbringung des Dienstes erforderlich oder gesetzlich
                vorgeschrieben.
              </p>
            </section>

            <section>
              <h2 className={h2Class}>3. Hosting (Netlify)</h2>
              <p className="mb-3">
                Diese Website wird bei Netlify Inc., 44 Montgomery Street, Suite 300, San Francisco,
                CA 94104, USA gehostet. Beim Aufruf der Website werden automatisch Serverlog-Daten
                gespeichert (IP-Adresse, Browsertyp, Betriebssystem, Referrer-URL, Uhrzeit des
                Zugriffs). Diese Daten werden nicht mit anderen Datenquellen zusammengeführt.
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
                DNS-Anbieter und Content Delivery Network (CDN). Dabei werden Anfragen über
                Cloudflare-Server geleitet, um Sicherheit und Ladegeschwindigkeit zu verbessern.
                Cloudflare kann dabei technische Daten (u.&nbsp;a. IP-Adressen) verarbeiten.
              </p>
              <p>
                Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO. Details:{' '}
                <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener noreferrer" className={linkClass}>
                  cloudflare.com/privacypolicy
                </a>
              </p>
            </section>

            <section>
              <h2 className={h2Class}>5. Webanalyse (Plausible Analytics)</h2>
              <p className="mb-3">
                Diese Website nutzt Plausible Analytics der Plausible Insights OÜ, Västriku tn 2,
                50403 Tartu, Estland. Plausible ist ein datenschutzfreundliches Analysetool, das
                keine Cookies setzt, keine personenbezogenen Daten speichert und keine
                geräteübergreifende Verfolgung vornimmt.
              </p>
              <p className="mb-3">
                Plausible erhebt ausschließlich aggregierte, anonyme Nutzungsstatistiken
                (Seitenaufrufe, Herkunftsland, Gerätekategorie, Referrer). Es werden keine
                IP-Adressen gespeichert. Eine Einwilligung nach § 25 TTDSG ist nicht erforderlich.
              </p>
              <p>
                Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der
                Verbesserung unseres Angebots). Details:{' '}
                <a href="https://plausible.io/privacy" target="_blank" rel="noopener noreferrer" className={linkClass}>
                  plausible.io/privacy
                </a>
              </p>
            </section>

            <section>
              <h2 className={h2Class}>6. Newsletter & E-Mail-Benachrichtigungen (Loops)</h2>
              <p className="mb-3">
                Wenn du dich für unseren Newsletter anmeldest, übermittelst du deine E-Mail-Adresse
                an Loops Software Inc. (loops.so). Die Anmeldung erfolgt im Double-Opt-In-Verfahren:
                Du erhältst eine Bestätigungs-E-Mail und wirst erst nach Klick auf den
                Bestätigungslink in den Verteiler aufgenommen.
              </p>
              <p className="mb-3">
                Loops verarbeitet diese Daten ausschließlich zur Zustellung unserer E-Mails.
                Die Einwilligung kann jederzeit widerrufen werden (Abmelde-Link in jedem
                Newsletter oder per E-Mail an{' '}
                <a href="mailto:pitmaster@steakakademie.de" className={linkClass}>pitmaster@steakakademie.de</a>).
              </p>
              <p>
                Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO (Einwilligung). Details:{' '}
                <a href="https://loops.so/privacy" target="_blank" rel="noopener noreferrer" className={linkClass}>
                  loops.so/privacy
                </a>
              </p>
            </section>

            <section>
              <h2 className={h2Class}>7. Exit-Intent-Overlay (Newsletter-Anmeldung)</h2>
              <p className="mb-3">
                Diese Website zeigt nach einer bestimmten Verweildauer ein Overlay-Fenster an,
                das zur Newsletter-Anmeldung einlädt. Das Overlay wird durch Mausbewegung in
                Richtung Seitenrand ausgelöst und erscheint pro Browsersitzung maximal einmal
                (technische Speicherung via sessionStorage — wird nach Schließen des Browsers
                gelöscht, kein dauerhaftes Tracking).
              </p>
              <p>
                Wenn du deine E-Mail-Adresse eingibst, gilt dasselbe wie unter Abschnitt 6
                (Newsletter). Kein Pflichtfeld — das Overlay kann jederzeit geschlossen werden.
              </p>
            </section>

            <section>
              <h2 className={h2Class}>8. Nutzerkonten & Kursdaten (Supabase)</h2>
              <p className="mb-3">
                Für die Nutzung von kostenpflichtigen Inhalten (Kurse, Steuer-Matrix-Rechner,
                digitale Produkte) ist ein Nutzerkonto erforderlich. Kontodaten werden bei
                Supabase Inc. (EU-Rechenzentrum Frankfurt) gespeichert. Supabase verarbeitet
                im Rahmen einer Auftragsverarbeitung (Art. 28 DSGVO) folgende Daten:
              </p>
              <ul className="list-disc pl-5 space-y-1 mb-3">
                <li>E-Mail-Adresse und Authentifizierungsdaten</li>
                <li>Kursbuchungen und Zugangsberechtigungen</li>
                <li>Lernfortschritt und Diplom-Status</li>
              </ul>
              <p>
                Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung). Details:{' '}
                <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className={linkClass}>
                  supabase.com/privacy
                </a>
              </p>
            </section>

            <section>
              <h2 className={h2Class}>9. Zahlungsabwicklung (Digistore24)</h2>
              <p className="mb-3">
                Zahlungen für digitale Produkte werden über Digistore24 GmbH abgewickelt.
                Im Rahmen des Bestellvorgangs erhebt Digistore24 die für die Kaufabwicklung
                erforderlichen Daten (Name, E-Mail, Zahlungsdaten). Diese Daten werden
                ausschließlich von Digistore24 verarbeitet; wir haben keinen Zugriff auf
                vollständige Zahlungsdaten.
              </p>
              <p>
                Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung). Details:{' '}
                <a href="https://www.digistore24.com/datenschutz" target="_blank" rel="noopener noreferrer" className={linkClass}>
                  digistore24.com/datenschutz
                </a>
              </p>
            </section>

            <section>
              <h2 className={h2Class}>10. KI-Assistenten „Marco" (Anthropic)</h2>
              <p className="mb-3">
                Diese Website bietet den KI-Assistenten „Marco" als Chat-Widget an.
              </p>
              <ul className="list-disc pl-5 space-y-2 mb-3">
                <li>
                  <strong className="text-text-primary">Zweck:</strong>{' '}
                  Bereitstellung von Grillberatung via Chat (Cuts, Temperaturen, Techniken).
                </li>
                <li>
                  <strong className="text-text-primary">Verarbeitete Daten:</strong>{' '}
                  Eingegebene Chat-Nachrichten (temporär, keine serverseitige Speicherung
                  nach Sitzungsende, keine Verknüpfung mit Nutzerprofilen).
                </li>
                <li>
                  <strong className="text-text-primary">Empfänger / Auftragsverarbeiter:</strong>{' '}
                  Anthropic PBC, 548 Market Street, San Francisco, CA 94104, USA
                  (Auftragsverarbeiter gemäß Art. 28 DSGVO).
                </li>
                <li>
                  <strong className="text-text-primary">Drittlandübermittlung:</strong>{' '}
                  USA — Rechtsgrundlage: EU-Standardvertragsklauseln (SCC)
                  gemäß Art. 46 Abs. 2 lit. c DSGVO.
                </li>
                <li>
                  <strong className="text-text-primary">Rechtsgrundlage:</strong>{' '}
                  Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse: Bereitstellung
                  des Beratungsdienstes).
                </li>
                <li>
                  <strong className="text-text-primary">Speicherdauer:</strong>{' '}
                  Keine serverseitige Speicherung nach Sitzungsende.
                </li>
              </ul>
              <p className="mb-3">
                Wir empfehlen, keine sensiblen personenbezogenen Daten in den Chat einzugeben.
                Marco ist ein KI-Assistent — keine Rechts-, Steuer- oder Gesundheitsberatung.
              </p>
              <p>
                Weitere Informationen:{' '}
                <Link href="/ki-disclaimer" className={linkClass}>
                  KI-Disclaimer
                </Link>
                {' '}· Anthropic-Datenschutz:{' '}
                <a href="https://www.anthropic.com/privacy" target="_blank" rel="noopener noreferrer" className={linkClass}>
                  anthropic.com/privacy
                </a>
              </p>
            </section>

            <section>
              <h2 className={h2Class}>11. Cookies & lokale Speicherung</h2>
              <p className="mb-3">
                Diese Website verwendet ausschließlich technisch notwendige Speichermechanismen:
              </p>
              <ul className="list-disc pl-5 space-y-1 mb-3">
                <li><strong className="text-text-primary">localStorage:</strong> Theme-Einstellung (hell/dunkel) — dauerhaft, lokal im Browser</li>
                <li><strong className="text-text-primary">sessionStorage:</strong> Exit-Intent-Status (wurde das Overlay bereits gezeigt?) — wird nach Schließen des Browsers automatisch gelöscht</li>
                <li><strong className="text-text-primary">Supabase Auth-Token:</strong> Für eingeloggte Nutzer — sicherer JWT-Token zur Sitzungsverwaltung</li>
              </ul>
              <p>
                Es werden keine Tracking-Cookies, Werbe-Cookies oder Analyse-Cookies gesetzt.
                Eine Einwilligung nach § 25 TTDSG ist für die genannten Speichermechanismen
                nicht erforderlich, da sie ausschließlich technisch notwendig sind.
              </p>
            </section>

            <section>
              <h2 className={h2Class}>12. Externe Links & Affiliate-Links</h2>
              <p className="mb-3">
                Diese Website enthält Links zu externen Websites Dritter, auf deren Inhalte
                wir keinen Einfluss haben. Für die Inhalte der verlinkten Seiten ist stets
                der jeweilige Anbieter oder Betreiber verantwortlich.
              </p>
              <p>
                Produktempfehlungen können Affiliate-Links enthalten (gekennzeichnet mit * oder
                dem Hinweis „Affiliate-Link"). Bei einem Kauf über solche Links erhalten wir
                eine Provision ohne Mehrkosten für dich.
              </p>
            </section>

            <section>
              <h2 className={h2Class}>12a. Schriftarten — lokal gehostet</h2>
              <p>
                Diese Website nutzt die Schriftarten Playfair Display, Source Serif 4
                und DM Sans. Diese werden während des Build-Vorgangs auf unsere Server
                heruntergeladen und von dort ausgeliefert — es findet <strong>keine
                Verbindung zu Google-Servern</strong> statt. Deine IP-Adresse wird daher
                nicht an Google übermittelt.
              </p>
            </section>

            <section>
              <h2 className={h2Class}>12b. Hosting & CDN — Netlify und Vercel</h2>
              <p className="mb-3">
                Diese Website wird gehostet bei <strong>Netlify, Inc.</strong>,
                512 2nd Street, Fl 2, San Francisco, CA 94107, USA. Für einzelne
                technische Komponenten (z. B. Edge-Funktionen, KI-Anfragen) kann
                zusätzlich <strong>Vercel Inc.</strong>, 440 N Barranca Avenue #4133,
                Covina, CA 91723, USA, eingesetzt werden.
              </p>
              <p className="mb-3">
                Bei jedem Seitenaufruf werden technisch notwendige Daten verarbeitet
                (IP-Adresse, Browser-Typ, Datum/Uhrzeit, aufgerufene URL, Referrer).
                Diese Daten werden zur Bereitstellung der Website und zur Abwehr von
                Angriffen benötigt.
              </p>
              <p className="mb-3">
                <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. f DSGVO
                (berechtigtes Interesse am sicheren, performanten Betrieb der Website).
              </p>
              <p>
                <strong>Drittlandübermittlung:</strong> Beide Anbieter sind nach dem
                EU-US Data Privacy Framework zertifiziert; zusätzlich werden
                EU-Standardvertragsklauseln (Art. 46 Abs. 2 lit. c DSGVO) verwendet.
                Datenschutzerklärungen:{' '}
                <a href="https://www.netlify.com/privacy" target="_blank" rel="noopener noreferrer" className={linkClass}>
                  netlify.com/privacy
                </a>{' '}
                ·{' '}
                <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className={linkClass}>
                  vercel.com/legal/privacy-policy
                </a>.
              </p>
            </section>

            <section>
              <h2 className={h2Class}>13. Deine Rechte</h2>
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
                <a href="mailto:pitmaster@steakakademie.de" className={linkClass}>
                  pitmaster@steakakademie.de
                </a>
              </p>
            </section>

            <section>
              <h2 className={h2Class}>14. Beschwerderecht bei der Aufsichtsbehörde</h2>
              <p>
                Du hast das Recht, dich bei der zuständigen Datenschutz-Aufsichtsbehörde
                zu beschweren. Zuständig ist die Landesbeauftragte für Datenschutz und
                Informationsfreiheit Nordrhein-Westfalen:{' '}
                <a href="https://www.ldi.nrw.de" target="_blank" rel="noopener noreferrer" className={linkClass}>
                  ldi.nrw.de
                </a>
              </p>
            </section>

          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
