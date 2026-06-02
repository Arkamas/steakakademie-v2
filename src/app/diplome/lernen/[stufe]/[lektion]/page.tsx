import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { allDiplomLektions } from 'contentlayer/generated';
import { useMDXComponent } from 'next-contentlayer2/hooks';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { ChevronRight, ChevronLeft, ArrowRight, BookOpen, Lightbulb } from 'lucide-react';
import { Schnelluebersicht, Achtung, ProTipp, TempBox } from '@/components/mdx/Callouts';

interface Props {
  params: { stufe: string; lektion: string };
}

// Stufen-Meta (Metall + Titel) — Spiegel von diplome/roadmap stages
const STUFE_META: Record<number, { cert: string; title: string; color: string }> = {
  1: { cert: 'Bronze',  title: 'Der Funke',                color: '#CD7F32' },
  2: { cert: 'Silber',  title: 'Die Flamme bezähmen',     color: '#C0C0C0' },
  3: { cert: 'Gold',    title: 'Hitzekontrolle',           color: '#FFD700' },
  4: { cert: 'Platin',  title: 'Präzision & Geschmack',    color: '#E5E4E2' },
  5: { cert: 'Meister', title: 'Der vollendete Pitmaster', color: '#FF6B35' },
};

function lessonFrom(params: Props['params']) {
  const stufeNum = Number(params.stufe.replace('stufe-', ''));
  return allDiplomLektions.find(
    (l) => l.stufe === stufeNum && l.lektionSlug === params.lektion,
  );
}

export function generateStaticParams() {
  return allDiplomLektions.map((l) => ({
    stufe: `stufe-${l.stufe}`,
    lektion: l.lektionSlug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const l = lessonFrom(params);
  if (!l) return {};
  const title = l.seoTitle ?? l.title;
  const description = l.seoDescription ?? l.excerpt;
  return {
    title,
    description,
    alternates: { canonical: `https://steakakademie.de${l.url}` },
    openGraph: {
      title,
      description,
      url: `https://steakakademie.de${l.url}`,
      type: 'article',
    },
  };
}

const mdxComponents = {
  h2: (p: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className="font-serif text-2xl sm:text-3xl font-bold text-text-primary mt-10 mb-4 leading-tight border-b border-border-subtle pb-3" {...p} />
  ),
  h3: (p: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="font-serif text-xl font-bold text-text-primary mt-8 mb-3" {...p} />
  ),
  p: (p: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="font-body text-[1.0625rem] leading-[1.8] text-text-primary mb-5" {...p} />
  ),
  ul: (p: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="list-disc list-outside ml-5 space-y-2 mb-5 font-body text-[1.0625rem]" {...p} />
  ),
  ol: (p: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className="list-decimal list-outside ml-5 space-y-2 mb-5 font-body text-[1.0625rem]" {...p} />
  ),
  strong: (p: React.HTMLAttributes<HTMLElement>) => (
    <strong className="font-bold text-text-primary" {...p} />
  ),
  blockquote: (p: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote className="border-l-4 border-brand-gold pl-5 my-6 font-body text-lg italic text-text-secondary" {...p} />
  ),
  hr: () => <hr className="border-border-subtle my-10" />,
  Schnelluebersicht, Achtung, ProTipp, TempBox,
};

export default function DiplomLektionPage({ params }: Props) {
  const lektion = lessonFrom(params);
  if (!lektion) notFound();

  const meta = STUFE_META[lektion.stufe] ?? STUFE_META[1];
  const MDXContent = useMDXComponent(lektion.body.code);

  // Geschwister-Lektionen derselben Stufe, nach order sortiert
  const siblings = allDiplomLektions
    .filter((l) => l.stufe === lektion.stufe)
    .sort((a, b) => a.order - b.order);
  const idx = siblings.findIndex((l) => l.lektionSlug === lektion.lektionSlug);
  const prev = idx > 0 ? siblings[idx - 1] : null;
  const next = idx < siblings.length - 1 ? siblings[idx + 1] : null;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    name: lektion.title,
    description: lektion.excerpt,
    educationalLevel: `Stufe ${lektion.stufe} — ${meta.cert}`,
    learningResourceType: 'Lesson',
    datePublished: lektion.publishedAt,
    inLanguage: 'de',
    isPartOf: {
      '@type': 'Course',
      name: 'Grillmeister-Ausbildung',
      provider: { '@type': 'Organization', name: 'Steakakademie', url: 'https://steakakademie.de' },
    },
  };

  return (
    <>
      <Header />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <main className="bg-surface-base">
        {/* Header-Band */}
        <section className="bg-surface-dark border-b" style={{ borderColor: `${meta.color}30` }}>
          <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
            <nav className="flex items-center gap-1.5 text-xs font-sans text-text-light/40 mb-6" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-brand-gold transition-colors">Start</Link>
              <ChevronRight size={12} />
              <Link href="/diplome" className="hover:text-brand-gold transition-colors">Diplom-System</Link>
              <ChevronRight size={12} />
              <Link href="/diplome/roadmap" className="hover:text-brand-gold transition-colors">Roadmap</Link>
              <ChevronRight size={12} />
              <span className="text-text-light/65">{lektion.title}</span>
            </nav>
            <div className="flex items-center gap-2 mb-4">
              <span
                className="inline-block text-[10px] font-sans font-bold tracking-[0.18em] uppercase px-2.5 py-1 rounded-full"
                style={{ background: `${meta.color}20`, color: meta.color, border: `1px solid ${meta.color}50` }}
              >
                Stufe {lektion.stufe} · {meta.cert}
              </span>
              <span className="text-[10px] font-sans text-text-light/40 uppercase tracking-wider">
                Lektion {lektion.order} · Level {lektion.level}
              </span>
            </div>
            <h1 className="font-serif text-3xl lg:text-5xl font-bold text-text-light leading-tight mb-4 max-w-3xl">
              {lektion.title}
            </h1>
            <p className="font-body text-lg text-text-light/60 leading-relaxed max-w-2xl">
              {lektion.excerpt}
            </p>
          </div>
        </section>

        <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-12">
            <article className="max-w-content">
              <MDXContent components={mdxComponents} />

              {/* Merksatz */}
              <div
                className="mt-10 p-6 rounded-r-sm border-l-[3px]"
                style={{ borderLeftColor: meta.color, background: `${meta.color}10` }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb size={15} style={{ color: meta.color }} />
                  <span className="font-sans text-[11px] font-bold tracking-[0.14em] uppercase" style={{ color: meta.color }}>
                    Merksatz
                  </span>
                </div>
                <p className="font-serif text-lg italic text-text-primary leading-relaxed">
                  „{lektion.merksatz}"
                </p>
              </div>

              {/* Prev / Next */}
              <div className="mt-10 flex items-stretch justify-between gap-4">
                {prev ? (
                  <Link href={prev.url} className="group flex-1 border border-border-subtle hover:border-brand-gold/40 p-4 transition-colors">
                    <span className="flex items-center gap-1 text-[10px] font-sans uppercase tracking-wider text-text-muted mb-1">
                      <ChevronLeft size={12} /> Vorherige
                    </span>
                    <span className="font-serif text-sm font-bold text-text-primary group-hover:text-brand-fire transition-colors">{prev.title}</span>
                  </Link>
                ) : <div className="flex-1" />}
                {next ? (
                  <Link href={next.url} className="group flex-1 border border-border-subtle hover:border-brand-gold/40 p-4 text-right transition-colors">
                    <span className="flex items-center justify-end gap-1 text-[10px] font-sans uppercase tracking-wider text-text-muted mb-1">
                      Nächste <ChevronRight size={12} />
                    </span>
                    <span className="font-serif text-sm font-bold text-text-primary group-hover:text-brand-fire transition-colors">{next.title}</span>
                  </Link>
                ) : <div className="flex-1" />}
              </div>
            </article>

            {/* Sidebar: alle Lektionen der Stufe */}
            <aside>
              <div className="bg-surface-elevated border border-border-subtle p-5 sticky top-24">
                <div className="border-t-2 -mt-5 mb-4 pt-4" style={{ borderColor: meta.color }}>
                  <h2 className="font-sans font-bold text-sm text-text-primary flex items-center gap-2">
                    <BookOpen size={14} style={{ color: meta.color }} /> Stufe {lektion.stufe} · {meta.title}
                  </h2>
                </div>
                <ol className="space-y-1">
                  {siblings.map((l) => {
                    const active = l.lektionSlug === lektion.lektionSlug;
                    return (
                      <li key={l.lektionSlug}>
                        <Link
                          href={l.url}
                          className="flex items-start gap-2 text-sm font-sans py-1.5 transition-colors"
                          style={{ color: active ? meta.color : undefined }}
                        >
                          <span className="text-xs font-bold mt-0.5 w-4 shrink-0" style={{ color: meta.color }}>{l.order}</span>
                          <span className={active ? 'font-bold' : 'text-text-secondary hover:text-text-primary'}>{l.title}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ol>
                <Link
                  href="/diplome/roadmap"
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-sans font-bold uppercase tracking-wider hover:opacity-80 transition-opacity"
                  style={{ color: meta.color }}
                >
                  Zur Prüfung <ArrowRight size={13} />
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
