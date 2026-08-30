import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, Clock, Calendar, Lock } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { collectionPageSchema, breadcrumbSchema } from '@/lib/schema';
import { serie, istErschienen, erscheinungsdatum } from '@/lib/fleischwissen';

// Die Seite ist statisch, die Sichtbarkeitsregel haengt aber am Kalender:
// Am 09.10. und 16.10.2026 muss aus „erscheint am …" ein Link werden, OHNE
// dass jemand deployt. Ohne Revalidierung bliebe die zum Build-Zeitpunkt
// gerenderte Fassung stehen — die Serie wuerde nur weiterlaufen, wenn zufaellig
// jemand pusht. Eine Stunde ist fein genug fuer eine Tagesgrenze und grob
// genug, um keine Last zu erzeugen.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Fleischwissen — woher dein Steak wirklich kommt',
  description:
    'Dreiteilige Serie zur Herkunft: US-Feedlot gegen deutsche Bullenmast, Gras gegen Getreide, und was die letzten 48 Stunden im Leben des Tieres mit deinem Steak machen.',
  alternates: { canonical: 'https://steakakademie.de/fleischwissen' },
  openGraph: {
    title: 'Fleischwissen — woher dein Steak wirklich kommt',
    description:
      'Produktionssysteme, Fütterung, Schlachtstress: die drei Faktoren, die über die Qualität entscheiden, bevor das Fleisch die Theke erreicht. Mit belegten Zahlen.',
    url: 'https://steakakademie.de/fleischwissen',
    type: 'website',
  },
};

export default function FleischwissenPage() {
  const teile = serie();

  const collectionSch = collectionPageSchema(
    'Fleischwissen',
    '/fleischwissen',
    'Dreiteilige Serie zur Herkunft von Rindfleisch: Produktionssysteme, Fütterung und Schlachtstress — mit belegten Zahlen statt Marketing.',
  );
  const breadcrumbSch = breadcrumbSchema([{ name: 'Fleischwissen', url: '/fleischwissen' }]);

  return (
    <>
      <Header />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSch) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSch) }} />

      <main>
        <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <nav className="flex items-center gap-1.5 text-xs font-sans text-text-light/45" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-brand-gold transition-colors">Start</Link>
            <ChevronRight size={12} />
            <Link href="/wissen" className="hover:text-brand-gold transition-colors">Wissen</Link>
            <ChevronRight size={12} />
            <span className="text-text-light/65">Fleischwissen</span>
          </nav>
        </div>

        <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <header className="max-w-content mb-12">
            <span className="category-label">Serie in drei Teilen</span>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-text-light mt-3 mb-5 leading-tight">
              Woher dein Steak wirklich kommt
            </h1>
            <p className="font-body text-lg text-text-light/75 leading-relaxed">
              Über die Qualität eines Steaks ist entschieden, bevor es die Theke erreicht — im
              Produktionssystem, im Futtertrog und in den letzten Stunden im Leben des Tieres.
              Drei Teile, die diese Kette von hinten aufrollen. Mit Primärquellen, mit Zahlen,
              und mit dem offenen Hinweis überall dort, wo etwas nicht belegt ist.
            </p>
          </header>

          <ol className="max-w-content space-y-5">
            {teile.map((teil) => {
              const erschienen = istErschienen(teil);

              const inhalt = (
                <>
                  <div className="flex flex-wrap items-center gap-2.5 mb-3">
                    <span className="font-sans text-[11px] font-bold tracking-[0.12em] uppercase text-brand-gold">
                      Teil {teil.serieTeil} von {teil.serieGesamt}
                    </span>
                    {!erschienen && (
                      <span className="inline-flex items-center gap-1.5 font-sans text-[10px] font-bold tracking-wide uppercase text-text-light/45">
                        <Lock size={11} /> Noch nicht erschienen
                      </span>
                    )}
                  </div>

                  <h2
                    className={`font-serif text-xl sm:text-2xl font-bold mb-3 leading-snug ${
                      erschienen
                        ? 'text-text-light group-hover:text-brand-gold transition-colors'
                        : 'text-text-light/55'
                    }`}
                  >
                    {teil.title}
                  </h2>

                  <p className={`font-body leading-relaxed mb-4 ${erschienen ? 'text-text-light/70' : 'text-text-light/45'}`}>
                    {teil.excerpt}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs font-sans text-text-light/45">
                    {erschienen ? (
                      <span className="flex items-center gap-1.5">
                        <Calendar size={12} />
                        {teil.formattedDate}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-brand-gold font-medium">
                        <Calendar size={12} />
                        Erscheint am {erscheinungsdatum(teil)}
                      </span>
                    )}
                    {teil.readingTime && (
                      <span className="flex items-center gap-1.5">
                        <Clock size={12} />
                        {teil.readingTime} Min. Lesezeit
                      </span>
                    )}
                  </div>
                </>
              );

              // Noch nicht erschienene Teile bekommen KEIN <Link> und kein href.
              // Bewusst kein deaktivierter Link, kein aria-disabled, kein Anker
              // ohne Ziel: Was nicht anklickbar sein soll, ist hier schlicht
              // kein Anker — dann kann es auch kein Crawler als Ziel lesen.
              return (
                <li key={teil.slug}>
                  {erschienen ? (
                    <Link
                      href={teil.url}
                      className="block p-6 transition-colors group"
                      style={{ border: '1px solid rgba(200,136,42,0.18)', background: 'rgba(255,255,255,0.02)' }}
                    >
                      {inhalt}
                    </Link>
                  ) : (
                    <div
                      className="block p-6"
                      style={{ border: '1px dashed rgba(200,136,42,0.22)', background: 'rgba(255,255,255,0.012)' }}
                    >
                      {inhalt}
                    </div>
                  )}
                </li>
              );
            })}
          </ol>

          <div className="max-w-content mt-12">
            <Link
              href="/wissen"
              className="inline-flex items-center gap-2 font-sans text-sm font-bold text-brand-gold hover:opacity-80 transition-opacity"
            >
              Alles aus dem Wissensbereich <ChevronRight size={15} />
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
