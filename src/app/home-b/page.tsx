import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, Flame, Menu, Search } from 'lucide-react';
import Footer from '@/components/layout/Footer';
import { STARTSEITEN_ARTIKEL } from '../page';
import type { ArticleMeta } from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// Startseiten-Variante B — "Editorial Ember" (A/B-Test)
//
// NEU AUFGEBAUT 26.08.2026 (Uwe): Die erste Fassung war nur ein CSS-Layer
// (.theme-ember) über der dunklen Seite und sah entsprechend kaputt aus.
// Diese Fassung ist das ECHTE Editorial-Layout nach der Texas-Monthly-
// Referenz (C:\Dev\texasmonthly-ref, ideas.md "Editorial Ember"):
//   · Cremeweiß #FAFAF7, Tinte #1C1512, Glut-Orange #D4521A als Akzent
//   · zentrierte Serif-Wortmarke, dünne Haarlinien, Versalien-Kategorielabels
//   · asymmetrisches 3-Spalten-Hero-Grid (55/25/20) wie Texas Monthly
// Datenquelle: dieselben Artikel wie Variante A (Export aus ../page).
//
// DOKTRIN (CLAUDE.md Regel 8) gilt auch hier: Inhalt zuerst — das Hero-Grid
// und die Rubriken stehen VOR dem Mitglieder-CTA, der Diplom-Teaser weiter
// unten. Besucher erreichen diese Route nur über den Middleware-Rewrite
// (Cookie sa_ab_home=b, Schalter AB_HOME_ENABLED=1); direkt aufgerufen ist
// sie noindex mit Canonical auf "/".
// ─────────────────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  // `absolute` verhindert das Root-Template ' | Steakakademie' — unter der
  // Adresse '/' stand sonst ein doppelter Markenname im Tab.
  title: { absolute: 'Steakakademie — BBQ Wissen, Cuts & Grillmeister-Diplome' },
  robots: { index: false, follow: true },
  alternates: { canonical: 'https://steakakademie.de/' },
};

// Editorial-Ember-Palette (ideas.md, Idee 1)
const INK = '#1C1512';
const PAPER = '#FAFAF7';
const EMBER = '#D4521A';
const HAIR = '#E3DCCE';
const MUT = '#5D554B';

const NAV = [
  { label: 'Grilltechniken', href: '/methoden' },
  { label: 'Cuts & Fleischkunde', href: '/cuts' },
  { label: 'Wissen', href: '/wissen' },
  { label: 'Rezepte', href: '/rezepte' },
  { label: 'Ausrüstung', href: '/kategorie/ausruestung' },
  { label: 'Community', href: '/rezepte/community' },
  { label: 'USA-Expedition', href: '/usa-expedition' },
  { label: 'Ehrliches System', href: '/ehrliches-system' },
];

function CategoryLabel({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="font-sans text-[0.7rem] font-bold uppercase"
      style={{ color: EMBER, letterSpacing: '0.12em' }}
    >
      {children}
    </span>
  );
}

function Byline({ a, className = '' }: { a: ArticleMeta; className?: string }) {
  return (
    <div className={`flex items-center gap-2 text-xs font-sans ${className}`} style={{ color: MUT }}>
      <span>{a.formattedDate}</span>
      <span>—</span>
      <span>{a.author}</span>
    </div>
  );
}

function HeroCard({ a }: { a: ArticleMeta }) {
  return (
    <article className="group">
      <Link href={a.url}>
        <div className="overflow-hidden mb-4">
          <Image
            src={a.image} alt={a.imageAlt ?? a.title} width={880} height={550} priority
            className="w-full aspect-[16/10] object-cover group-hover:scale-[1.02] transition-transform duration-500"
          />
        </div>
        <CategoryLabel>{a.category}</CategoryLabel>
        <h2
          className="font-serif text-3xl sm:text-4xl font-bold mt-2 mb-3 leading-tight transition-colors duration-150 group-hover:text-[#D4521A]"
          style={{ color: INK }}
        >
          {a.title}
        </h2>
        <p className="font-sans text-sm leading-relaxed mb-3 line-clamp-3" style={{ color: '#443D34' }}>
          {a.excerpt}
        </p>
        <Byline a={a} />
      </Link>
    </article>
  );
}

function SmallCard({ a }: { a: ArticleMeta }) {
  return (
    <article className="group flex gap-3 items-start">
      <Link href={a.url} className="shrink-0">
        <div className="overflow-hidden w-20 h-20">
          <Image
            src={a.image} alt={a.imageAlt ?? a.title} width={160} height={160}
            className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
          />
        </div>
      </Link>
      <div className="flex-1 min-w-0">
        <CategoryLabel>{a.category}</CategoryLabel>
        <Link href={a.url}>
          <h4
            className="font-serif text-sm font-bold mt-0.5 leading-snug line-clamp-3 transition-colors duration-150 group-hover:text-[#D4521A]"
            style={{ color: INK }}
          >
            {a.title}
          </h4>
        </Link>
        <p className="text-xs font-sans mt-1" style={{ color: MUT }}>{a.author}</p>
      </div>
    </article>
  );
}

function MediumCard({ a }: { a: ArticleMeta }) {
  return (
    <article className="group">
      <Link href={a.url}>
        <div className="overflow-hidden mb-3">
          <Image
            src={a.image} alt={a.imageAlt ?? a.title} width={560} height={420}
            className="w-full aspect-[4/3] object-cover group-hover:scale-[1.02] transition-transform duration-500"
          />
        </div>
        <CategoryLabel>{a.category}</CategoryLabel>
        <h3
          className="font-serif text-xl font-bold mt-1 mb-2 leading-snug transition-colors duration-150 group-hover:text-[#D4521A]"
          style={{ color: INK }}
        >
          {a.title}
        </h3>
        <p className="font-sans text-sm leading-relaxed mb-2 line-clamp-2" style={{ color: '#443D34' }}>
          {a.excerpt}
        </p>
        <Byline a={a} />
      </Link>
    </article>
  );
}

export default function HomeVariantB() {
  const hero = STARTSEITEN_ARTIKEL[0];
  const side = STARTSEITEN_ARTIKEL.slice(1, 4);
  const feature = STARTSEITEN_ARTIKEL[4];
  const sections = [
    { title: 'Cuts & Fleischkunde', href: '/cuts', items: STARTSEITEN_ARTIKEL.filter((a) => a.categorySlug === 'cuts') },
    { title: 'Grilltechniken', href: '/methoden', items: STARTSEITEN_ARTIKEL.filter((a) => a.categorySlug === 'grilltechniken') },
    { title: 'Wissen & Wissenschaft', href: '/wissen', items: STARTSEITEN_ARTIKEL.filter((a) => a.categorySlug === 'wissen') },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: PAPER }}>

      {/* ── KOPF: zentrierte Wortmarke, Haarlinie, Versalien-Navigation ── */}
      <header className="border-b sticky top-0 z-50" style={{ background: '#FFFFFF', borderColor: HAIR }}>
        <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              href="/menue"
              aria-label="Menü öffnen"
              className="w-8 h-8 flex items-center justify-center text-white transition-colors"
              style={{ background: EMBER }}
            >
              <Menu size={16} />
            </Link>
            <div className="flex-1 flex justify-center">
              <Link
                href="/"
                className="font-serif font-black text-3xl sm:text-4xl select-none transition-colors hover:text-[#D4521A]"
                style={{ color: INK, letterSpacing: '-0.02em' }}
              >
                Steakakademie
              </Link>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <Link href="/suche" aria-label="Suche" className="p-2 transition-colors hover:text-[#D4521A]" style={{ color: INK }}>
                <Search size={18} />
              </Link>
              <Link
                href="/diplome"
                className="font-sans text-xs font-bold tracking-widest uppercase px-3 py-2 text-white transition-opacity hover:opacity-90"
                style={{ background: EMBER }}
              >
                Diplome
              </Link>
            </div>
          </div>
        </div>
        <nav className="border-t" style={{ borderColor: HAIR }} aria-label="Rubriken">
          <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8">
            <ul className="flex items-center gap-6 overflow-x-auto h-11 whitespace-nowrap">
              {NAV.map((n) => (
                <li key={n.href}>
                  <Link
                    href={n.href}
                    className="font-sans text-[11px] font-bold tracking-[0.14em] uppercase transition-colors hover:text-[#D4521A]"
                    style={{ color: '#443D34' }}
                  >
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </header>

      <main className="flex-1">
        {/* SEO-H1 — unsichtbar fuers Auge, das Layout selbst ist die Bühne */}
        <h1 className="sr-only">Steakakademie — BBQ Wissen, Cuts &amp; Grillmeister-Diplome</h1>

        {/* ── HERO: asymmetrisches 3-Spalten-Grid (55/25/20) ── */}
        <section className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6">
          <div className="grid grid-cols-1 lg:grid-cols-[55%_25%_20%] gap-6 lg:gap-8">
            <div className="lg:border-r lg:pr-8" style={{ borderColor: HAIR }}>
              <HeroCard a={hero} />
            </div>
            <div className="lg:border-r lg:pr-8" style={{ borderColor: HAIR }}>
              <div className="space-y-5">
                {side.map((a, i) => (
                  <div key={a.slug}>
                    <SmallCard a={a} />
                    {i < side.length - 1 && <div className="border-b mt-5" style={{ borderColor: HAIR }} />}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <article className="group">
                <Link href={feature.url}>
                  <div className="overflow-hidden mb-3">
                    <Image
                      src={feature.image} alt={feature.imageAlt ?? feature.title} width={320} height={240}
                      className="w-full aspect-[4/3] object-cover group-hover:scale-[1.02] transition-transform duration-500"
                    />
                  </div>
                  <CategoryLabel>{feature.category}</CategoryLabel>
                  <h3
                    className="font-serif text-lg font-bold mt-1 mb-2 leading-snug transition-colors group-hover:text-[#D4521A]"
                    style={{ color: INK }}
                  >
                    {feature.title}
                  </h3>
                  <Byline a={feature} className="mb-2" />
                  <p className="font-body text-sm leading-relaxed line-clamp-5" style={{ color: '#443D34' }}>
                    {feature.excerpt}
                  </p>
                  <span className="inline-block mt-3 text-xs font-sans font-semibold hover:underline" style={{ color: EMBER }}>
                    Weiterlesen →
                  </span>
                </Link>
              </article>
            </div>
          </div>
        </section>

        {/* ── RUBRIKEN-SEKTIONEN: fette schwarze Linie, 3er-Grid ── */}
        {sections.map((s) => s.items.length > 0 && (
          <section key={s.href} className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between">
              <Link href={s.href}>
                <h2 className="font-serif text-2xl font-bold transition-colors hover:text-[#D4521A]" style={{ color: INK }}>
                  {s.title}
                </h2>
              </Link>
              <Link
                href={s.href}
                className="flex items-center gap-1 text-xs font-sans font-semibold tracking-wide uppercase hover:underline"
                style={{ color: EMBER }}
              >
                Alle ansehen <ChevronRight size={14} />
              </Link>
            </div>
            <div className="border-t-2 mb-6 mt-2" style={{ borderColor: INK }} />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {s.items.slice(0, 3).map((a) => <MediumCard key={a.slug} a={a} />)}
            </div>
          </section>
        ))}

        {/* ── LEADMAGNET: Spickzettel (Inhalt vor Angebot — Regel 8) ── */}
        <section className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="border p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-5" style={{ borderColor: HAIR, background: '#FFFFFF' }}>
            <div>
              <CategoryLabel>Gratis-Download</CategoryLabel>
              <h2 className="font-serif text-xl sm:text-2xl font-bold mt-1 mb-1" style={{ color: INK }}>
                Der Kerntemperatur-Spickzettel
              </h2>
              <p className="font-sans text-sm" style={{ color: '#443D34' }}>
                Alle Garstufen für Rind, Schwein, Geflügel &amp; Fisch auf einer Seite — fürs Grill-Regal.
              </p>
            </div>
            <Link
              href="/newsletter"
              className="shrink-0 font-sans text-xs font-bold tracking-widest uppercase px-6 py-3 text-white transition-opacity hover:opacity-90"
              style={{ background: EMBER }}
            >
              Jetzt sichern
            </Link>
          </div>
        </section>

        {/* ── DIPLOM-TEASER: dunkles Band, bewusst weit unten (Regel 8) ── */}
        <section className="py-10 my-8" style={{ background: INK }}>
          <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
                  <Flame size={18} style={{ color: '#E8A34C' }} />
                  <span className="text-xs font-bold tracking-widest uppercase font-sans" style={{ color: '#E8A34C' }}>
                    Grillmeister-Ausbildung
                  </span>
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white mb-2">
                  Werde zertifizierter Grillmeister
                </h2>
                <p className="font-sans text-sm text-white/60 max-w-lg">
                  Von Bronze bis Meister — sammle Punkte, bestehe Prüfungen und erhalte
                  dein Diplom in 5 Stufen. Der Einstieg ist kostenlos.
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0" aria-hidden="true">
                {['🥉', '🥈', '🥇', '💎', '🔥'].map((icon, i) => (
                  <span
                    key={icon}
                    className="w-12 h-12 flex items-center justify-center bg-white/10 text-2xl"
                    title={['Bronze', 'Silber', 'Gold', 'Platin', 'Meister'][i]}
                  >
                    {icon}
                  </span>
                ))}
              </div>
              <Link
                href="/diplome"
                className="shrink-0 font-sans text-xs font-bold tracking-widest uppercase px-6 py-3 text-white transition-opacity hover:opacity-90"
                style={{ background: EMBER }}
              >
                Jetzt starten
              </Link>
            </div>
          </div>
        </section>

        {/* ── NEUESTE ARTIKEL + SEITENLEISTE ── */}
        <section className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h2 className="font-serif text-2xl font-bold" style={{ color: INK }}>Neueste Artikel</h2>
          <div className="border-t-2 mb-6 mt-2" style={{ borderColor: INK }} />
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
            <div>
              {STARTSEITEN_ARTIKEL.slice(1).map((a) => (
                <article key={a.slug} className="group flex gap-4 items-start py-4 border-b last:border-0" style={{ borderColor: HAIR }}>
                  <Link href={a.url} className="shrink-0">
                    <div className="overflow-hidden w-28 h-20">
                      <Image
                        src={a.image} alt={a.imageAlt ?? a.title} width={224} height={160}
                        className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
                      />
                    </div>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <CategoryLabel>{a.category}</CategoryLabel>
                    <Link href={a.url}>
                      <h4 className="font-serif text-base font-bold mt-0.5 leading-snug line-clamp-2 transition-colors group-hover:text-[#D4521A]" style={{ color: INK }}>
                        {a.title}
                      </h4>
                    </Link>
                    <Byline a={a} className="mt-1" />
                  </div>
                </article>
              ))}
            </div>
            <aside className="space-y-6">
              <div>
                <div className="border-t-2" style={{ borderColor: INK }}>
                  <h3 className="font-serif text-lg font-bold pt-3 mb-3" style={{ color: INK }}>Rubriken</h3>
                </div>
                <ul>
                  {NAV.slice(0, 5).map((n) => (
                    <li key={n.href}>
                      <Link
                        href={n.href}
                        className="flex items-center justify-between py-2 border-b text-sm font-sans transition-colors hover:text-[#D4521A] group"
                        style={{ borderColor: HAIR, color: '#443D34' }}
                      >
                        {n.label}
                        <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: EMBER }} />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-5" style={{ background: '#F4F0E8' }}>
                <div className="border-t-2" style={{ borderColor: EMBER }}>
                  <h3 className="font-serif text-lg font-bold pt-3 mb-2" style={{ color: INK }}>Mitglied werden</h3>
                </div>
                <p className="text-xs font-sans mb-3" style={{ color: '#443D34' }}>
                  Kostenloser Zugang — dein Diplom-Fortschritt wird gespeichert. Kein Abo, keine Kreditkarte.
                </p>
                <Link
                  href="/auth/login"
                  className="block text-center text-white text-xs font-bold tracking-widest uppercase font-sans py-2.5 transition-opacity hover:opacity-90"
                  style={{ background: EMBER }}
                >
                  Werde SteakAdemiker →
                </Link>
              </div>
            </aside>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
