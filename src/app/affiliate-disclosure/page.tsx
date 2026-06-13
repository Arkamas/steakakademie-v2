import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { getActivePrograms, getPendingPrograms } from '@/lib/affiliate-programs';

export const metadata: Metadata = {
  title: 'Affiliate-Disclosure — Steakakademie',
  description: 'Transparenz über Affiliate-Links und Vergütungen auf Steakakademie.de.',
  robots: { index: false, follow: false },
};

export default function AffiliateDisclosurePage() {
  const h2Class = 'font-sans text-sm font-bold tracking-[0.12em] uppercase text-text-primary mb-3';
  const linkClass = 'text-brand-fire hover:underline';

  const activePrograms  = getActivePrograms();
  const pendingPrograms = getPendingPrograms();

  return (
    <>
      <Header />
      <main className="min-h-screen bg-surface-base">
        <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-14">

          <nav className="flex items-center gap-1.5 text-xs font-sans text-text-muted mb-8" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-brand-gold transition-colors">Start</Link>
            <ChevronRight size={12} />
            <span>Affiliate-Disclosure</span>
          </nav>

          <h1 className="font-serif text-3xl font-bold text-text-primary mb-2">
            Affiliate-Disclosure
          </h1>
          <p className="text-sm font-sans text-text-muted mb-10">Stand: Juni 2026</p>

          <div className="max-w-content space-y-8 font-body text-text-secondary leading-relaxed">

            <section>
              <h2 className={h2Class}>Was sind Affiliate-Links?</h2>
              <p>
                Einige Links auf steakakademie.de sind sogenannte Affiliate-Links. Das bedeutet:
                Wenn du über einen dieser Links ein Produkt kaufst, erhalte ich eine kleine
                Provision — ohne dass du mehr bezahlst. Der Preis für dich bleibt identisch.
              </p>
            </section>

            <section>
              <h2 className={h2Class}>Welche Affiliate-Programme nutzen wir?</h2>
              <p className="mb-3">
                Steakakademie.de nimmt an folgenden Partnerprogrammen teil:
              </p>
              <ul className="list-disc list-inside space-y-2 pl-2">
                {activePrograms.map((p) => (
                  <li key={p.id}>
                    <strong className="text-text-primary">{p.name}</strong>
                    {p.network ? ` (${p.network})` : ''} —{' '}
                    {p.disclosureNote ??
                      'Über diese Links gekaufte Produkte können mir eine Provision einbringen — ohne Mehrkosten für dich.'}
                  </li>
                ))}
              </ul>

              {pendingPrograms.length > 0 && (
                <>
                  <p className="mt-5 mb-3">
                    Folgende Partnerprogramme sind <strong className="text-text-primary">in Vorbereitung</strong>{' '}
                    und noch nicht aktiv. Sobald sie live gehen, werden ihre Links wie oben gekennzeichnet:
                  </p>
                  <ul className="list-disc list-inside space-y-1.5 pl-2 text-text-muted">
                    {pendingPrograms.map((p) => (
                      <li key={p.id}>
                        <span className="text-text-secondary">{p.name}</span>
                        {p.network ? ` — ${p.network}` : ''}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </section>

            <section>
              <h2 className={h2Class}>Transparenz & Unabhängigkeit</h2>
              <p className="mb-3">
                Alle Produkte, die wir empfehlen, wurden von uns selbst getestet und bewertet.
                Die Affiliate-Vergütung beeinflusst unsere Empfehlungen <strong className="text-text-primary">nicht</strong>.
                Wir lehnen Produkte ab, die unsere Standards nicht erfüllen — unabhängig von
                einer möglichen Provision.
              </p>
              <p>
                Artikel, die Affiliate-Links enthalten, sind am Ende oder direkt neben dem
                jeweiligen Link als solche kenntlich gemacht.
              </p>
            </section>

            <section>
              <h2 className={h2Class}>Kennzeichnung</h2>
              <p>
                Werbliche Empfehlungen mit Affiliate-Links sind auf dieser Website unmittelbar
                am bzw. neben dem Empfehlungs-Element mit dem Hinweis{' '}
                <span className="font-sans text-xs font-bold tracking-wide uppercase bg-surface-base border border-border-subtle px-2 py-0.5 text-text-muted">
                  Anzeige
                </span>{' '}
                gekennzeichnet; ergänzend weisen Fußnoten im Artikel-Text auf den Affiliate-Charakter hin.
              </p>
            </section>

            <section>
              <h2 className={h2Class}>Produktbilder</h2>
              <p className="mb-3">
                Wir nutzen drei Bildquellen, die alle rechtssicher und lizenziert sind:
              </p>
              <ul className="list-disc list-inside space-y-1.5 mb-3">
                <li>
                  <strong className="text-text-primary">Lizenzierte Original-Produktbilder</strong> —
                  bezogen über das Amazon Product Advertising API (PA-API) oder direkt vom Hersteller
                  freigegebene Pressebilder. Diese Bilder zeigen das Originalprodukt.
                </li>
                <li>
                  <strong className="text-text-primary">Symbolbilder</strong> — eigens für
                  Steakakademie.de erstellte oder KI-generierte Darstellungen, die das Produkt
                  repräsentieren, aber optisch vom Originalprodukt abweichen können. Diese
                  sind mit dem Badge{' '}
                  <span className="font-sans text-[10px] font-bold tracking-wider uppercase bg-black/65 text-zinc-200 border border-white/15 px-1.5 py-0.5">
                    Symbolbild
                  </span>{' '}
                  klar gekennzeichnet.
                </li>
                <li>
                  <strong className="text-text-primary">Brand-Initialen-Platzhalter</strong> —
                  wenn kein Produktbild verfügbar ist, zeigen wir die Hersteller-Initialen.
                </li>
              </ul>
              <p>
                Für die verbindliche Produktdarstellung ist immer der jeweilige Händler-Shop
                maßgeblich, auf den der Affiliate-Link verweist.
              </p>
            </section>

            <section>
              <h2 className={h2Class}>Fragen?</h2>
              <p>
                Bei Fragen zu Affiliate-Links oder unserer Empfehlungspolitik erreichst du
                mich unter{' '}
                <a href="mailto:info@steakakademie.de" className={linkClass}>
                  info@steakakademie.de
                </a>
                .
              </p>
            </section>

            <section>
              <h2 className={h2Class}>Weitere rechtliche Informationen</h2>
              <p>
                Weitere rechtliche Informationen findest du in unserem{' '}
                <Link href="/impressum" className={linkClass}>Impressum</Link>,
                der{' '}
                <Link href="/datenschutz" className={linkClass}>Datenschutzerklärung</Link>{' '}
                und unseren{' '}
                <Link href="/agb" className={linkClass}>AGB</Link>.
              </p>
            </section>

          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
