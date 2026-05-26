import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import {
  ChevronRight, CheckCircle, ArrowRight, Clock, Shield,
  FileText, Globe, Calculator, List, Rocket,
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Gründung-Sprint — In 72 Stunden selbstständig | Steakakademie',
  description:
    'Von der Idee zur rechtssicheren Gewerbeanmeldung und ersten Website in 72 Stunden. Exakt das, was wirklich notwendig ist — kein "Was du brauchen könntest".',
  alternates: { canonical: 'https://steakakademie.de/gruendung-sprint' },
  openGraph: {
    title: 'Gründung-Sprint — In 72 Stunden selbstständig',
    description:
      'Schritt-für-Schritt-System: Gewerbe anmelden, Steuer-Onboarding, erste Website live. Ohne Agentur, ohne Beratungskosten.',
    url: 'https://steakakademie.de/gruendung-sprint',
    type: 'website',
  },
};

const DELIVERABLES = [
  {
    Icon: FileText,
    title: 'Rechtsform-Entscheidung',
    desc: 'Einzelunternehmen, UG oder GmbH — wann was Sinn macht. Konkrete Entscheidungsmatrix ohne Steuerberater-Allgemeinplätze.',
  },
  {
    Icon: List,
    title: 'Gewerbeanmeldung Schritt für Schritt',
    desc: 'Wo, wie, was es kostet. Welches Formular, welche Felder, welche Angaben — ohne Überraschungen beim Amt.',
  },
  {
    Icon: Calculator,
    title: 'Finanzamt-Fragebogen erklärt',
    desc: 'Jede Frage des Fragebogens zur steuerlichen Erfassung verständlich gemacht. Kleinunternehmerregelung: ja oder nein — und warum.',
  },
  {
    Icon: Globe,
    title: 'Domain + Hosting einrichten',
    desc: 'Cloudflare für DNS, Netlify für Hosting — kostenlos, DSGVO-konform, professionell. Einmal richtig gemacht.',
  },
  {
    Icon: Rocket,
    title: 'Erste Website live',
    desc: 'Technisch korrekt, rechtssicher (Impressum, Datenschutz), ohne Agentur-Budget. Der Stack, mit dem steakakademie.de betrieben wird.',
  },
  {
    Icon: CheckCircle,
    title: 'Checkliste erste 30 Tage',
    desc: 'Was nach der Gründung sofort zu erledigen ist — priorisiert, ohne Lücken, ohne "das hätte ich früher wissen müssen".',
  },
];

const FAQ = [
  {
    q: 'Brauche ich Vorkenntnisse in Technik oder Buchhaltung?',
    a: 'Nein. Das System setzt voraus, dass du einen Computer bedienen kannst — sonst nichts. Alle Schritte sind so erklärt, dass sie ohne Vorwissen ausführbar sind.',
  },
  {
    q: 'Was genau bedeutet "72 Stunden"?',
    a: 'Die Kernschritte — Gewerbeanmeldung, Steuer-Anmeldung, Domain kaufen, erste Seite live — sind in drei fokussierten Arbeitstagen abgeschlossen. Kein Vollzeit-Einsatz nötig.',
  },
  {
    q: 'Ist das auch für nebenberufliche Selbstständigkeit geeignet?',
    a: 'Ja. Das System funktioniert für Haupt- und Nebenerwerb. Die relevanten Unterschiede (Kleinunternehmer, Gewerbefreigrenze) sind explizit behandelt.',
  },
  {
    q: 'Was, wenn ich schon gegründet habe?',
    a: 'Der Sprint hilft dir trotzdem: als Prüfung ob alles korrekt aufgesetzt ist, und als Grundlage für die Optimierung deiner digitalen Infrastruktur.',
  },
  {
    q: 'Gibt es Support bei Fragen?',
    a: 'Du erreichst uns unter info@steakakademie.de. Keine automatisierten Ticketsysteme — direkter Kontakt.',
  },
];

export default async function GruendungSprintPage() {
  let price: number | null = null;
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from('courses')
      .select('price')
      .eq('slug', 'gruendung-sprint')
      .single();
    if (data) price = data.price;
  } catch {
    // Graceful degradation
  }

  const eur = (n: number) =>
    new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(n);

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'Gründung-Sprint',
    description:
      'Von der Idee zur rechtssicheren Gewerbeanmeldung und ersten Website in 72 Stunden.',
    brand: { '@type': 'Brand', name: 'Steakakademie' },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'EUR',
      ...(price ? { price } : {}),
      availability: 'https://schema.org/InStock',
    },
  };

  return (
    <>
      <Header />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />

      <main className="bg-surface-base">

        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <section className="bg-surface-dark border-b border-brand-gold/15">
          <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
            <nav
              className="flex items-center gap-1.5 text-xs font-sans text-text-light/40 mb-8"
              aria-label="Breadcrumb"
            >
              <Link href="/" className="hover:text-brand-gold transition-colors">Start</Link>
              <ChevronRight size={12} />
              <Link href="/ehrliches-system" className="hover:text-brand-gold transition-colors">
                Das Ehrliche System
              </Link>
              <ChevronRight size={12} />
              <span className="text-text-light/65">Gründung-Sprint</span>
            </nav>

            <div className="max-w-3xl">
              <span className="inline-block text-[10px] font-sans font-bold tracking-[0.18em] uppercase text-brand-fire mb-4">
                Säule I — Gründung-Sprint
              </span>
              <h1 className="font-serif text-4xl lg:text-5xl xl:text-6xl font-bold text-text-light leading-tight mb-6">
                In 72 Stunden selbstständig —<br className="hidden lg:block" />
                rechtssicher gegründet, Website live.
              </h1>
              <p className="font-serif text-xl lg:text-2xl text-text-light/80 leading-relaxed mb-4">
                Kein Raten. Kein Stundenlang-Recherchieren. Kein teurer Berater für Basics.
              </p>
              <p className="font-body text-base text-text-light/55 leading-relaxed mb-10 max-w-2xl">
                Du bekommst exakt die Schritte, die wirklich notwendig sind — nicht mehr, nicht weniger.
                Gewerbeanmeldung, Steuer-Onboarding, erste Website live. Alles was du brauchst,
                nichts was dich aufhält.
              </p>

              <div className="flex flex-wrap gap-6">
                {[
                  { icon: <Clock size={14} />, text: '72 Stunden bis zur laufenden Website' },
                  { icon: <Shield size={14} />, text: 'Rechtssicher: Impressum, Datenschutz, DSGVO' },
                  { icon: <CheckCircle size={14} />, text: 'Kein Vorwissen, kein Agentur-Budget nötig' },
                ].map(({ icon, text }) => (
                  <div key={text} className="flex items-center gap-2 text-xs font-sans text-text-light/55">
                    <span className="text-brand-gold">{icon}</span>
                    {text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Problem ───────────────────────────────────────────────────────── */}
        <section className="border-b border-border-subtle">
          <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="max-w-content mx-auto">
              <span className="inline-block text-[10px] font-sans font-bold tracking-[0.18em] uppercase text-brand-fire mb-4">
                Das Problem
              </span>
              <h2 className="font-serif text-3xl font-bold text-text-primary mb-8">
                Gründen ist keine Raketenwissenschaft.<br />
                Aber die meisten machen es trotzdem falsch.
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 font-body text-text-secondary leading-relaxed">
                <div className="space-y-4">
                  <p>
                    Du hast die Idee. Du weißt was du anbieten willst. Aber dann: Welche Rechtsform?
                    Gewerbe oder Freiberufler? Finanzamt-Fragebogen — was zur Hölle soll ich da
                    eintragen? Und was kostet ein Steuerberater allein für die Erstberatung?
                  </p>
                  <p>
                    Online-Ratgeber helfen nicht wirklich. Sie sind vollgestopft mit
                    "könnte relevant sein" und "es kommt darauf an". Du liest eine Stunde und
                    weißt danach genauso viel wie vorher — nur frustrierter.
                  </p>
                </div>
                <div className="space-y-4">
                  <p>
                    Die Alternative: Ein Berater. Stundensatz 180–350 Euro. Für Dinge, die
                    eigentlich logisch aufgebaut sind — wenn man sie einmal erklärt bekommt.
                  </p>
                  <p>
                    Dabei ist Gründen handwerklich. Nicht kompliziert — aber man muss die
                    richtige Reihenfolge kennen. Was zuerst, was danach, was kann warten.
                    Das ist exakt das, was dieser Sprint liefert.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Was du bekommst ───────────────────────────────────────────────── */}
        <section className="border-b border-border-subtle bg-surface-dark">
          <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="mb-12">
              <span className="inline-block text-[10px] font-sans font-bold tracking-[0.18em] uppercase text-brand-fire mb-3">
                Was du bekommst
              </span>
              <h2 className="font-serif text-3xl font-bold text-text-light mb-3">
                Sechs Module. Null Füllmaterial.
              </h2>
              <p className="font-body text-text-light/60 max-w-xl">
                Jedes Modul hat eine Aufgabe. Am Ende ist die Aufgabe erledigt — nicht
                "du weißt jetzt mehr darüber".
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {DELIVERABLES.map(({ Icon, title, desc }, i) => (
                <div
                  key={title}
                  className="bg-surface-base border border-border-subtle p-6 flex flex-col gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="shrink-0 w-8 h-8 flex items-center justify-center font-sans text-xs font-bold"
                      style={{ background: 'rgba(200,136,42,0.12)', color: '#C8882A' }}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </div>
                    <Icon size={18} className="text-brand-gold shrink-0 mt-0.5" />
                  </div>
                  <h3 className="font-serif text-base font-bold text-text-light">{title}</h3>
                  <p className="font-body text-sm text-text-light/55 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Differenziator ───────────────────────────────────────────────── */}
        <section className="border-b border-border-subtle">
          <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="max-w-content mx-auto">
              <blockquote className="border-l-4 border-brand-gold pl-6 py-2 mb-12">
                <p className="font-serif text-xl lg:text-2xl text-text-primary italic leading-relaxed">
                  „Nicht 'Was du brauchen könntest' — sondern exakt das, was wirklich
                  notwendig ist."
                </p>
                <footer className="mt-4 text-sm font-sans text-text-muted">
                  — Kernprinzip des Gründung-Sprints
                </footer>
              </blockquote>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                {[
                  {
                    title: 'Praxiserprobt',
                    desc: 'Dieser Stack — Cloudflare, Netlify, Next.js — betreibt steakakademie.de. Kein Theoriemodell, sondern das, was im echten Betrieb funktioniert.',
                  },
                  {
                    title: 'Vollständig',
                    desc: 'Von der Entscheidung für die Rechtsform bis zur ersten Seite im Netz. Keine Lücken, keine "das musst du selbst herausfinden".',
                  },
                  {
                    title: 'Einmalig',
                    desc: 'Kein Abo, kein Coaching-Paket, kein Folgeprodukt als Pflicht. Du kaufst einmal — das System gehört dir.',
                  },
                ].map(({ title, desc }) => (
                  <div key={title}>
                    <h3 className="font-serif text-lg font-bold text-text-primary mb-2">{title}</h3>
                    <p className="font-body text-sm text-text-secondary leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Autor ────────────────────────────────────────────────────────── */}
        <section className="border-b border-border-subtle bg-surface-dark">
          <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="max-w-content mx-auto">
              <span className="inline-block text-[10px] font-sans font-bold tracking-[0.18em] uppercase text-brand-fire mb-6">
                Wer steckt dahinter
              </span>
              <div className="flex flex-col sm:flex-row gap-8 items-start">
                <div className="shrink-0">
                  <div
                    className="w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center font-serif text-3xl font-bold overflow-hidden"
                    style={{ background: 'rgba(200,136,42,0.14)', border: '1px solid rgba(200,136,42,0.28)', color: '#C8882A' }}
                  >
                    {/* Foto → /public/images/uwe-yendell.jpg */}
                    <Image
                      src="/images/uwe-yendell.jpg"
                      alt="Uwe Yendell"
                      width={128}
                      height={128}
                      className="w-full h-full object-cover"
                      onError={undefined}
                      unoptimized
                    />
                  </div>
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-text-light mb-1">Uwe Yendell</h3>
                  <p className="text-sm font-sans text-brand-gold mb-4">
                    Profi-Koch · Zertifizierter Marketing-Manager · Sport- & Gymnastiklehrer
                  </p>
                  <div className="space-y-3 font-body text-sm text-text-light/65 leading-relaxed max-w-xl">
                    <p>
                      Ich bin 59, lebe in Wuppertal und habe steakakademie.de ohne Programmierer,
                      ohne Agentur und ohne Investoren aufgebaut — mit Next.js, Supabase und
                      KI-Werkzeugen, die heute jedem zugänglich sind.
                    </p>
                    <p>
                      Ich habe eine Eventküche durch die Insolvenz verloren. Ich habe eine Domain
                      verloren, weil sie auf dem falschen Namen registriert war. Ich habe gelernt,
                      was es kostet, wenn man die Grundlagen nicht kennt.
                    </p>
                    <p>
                      Der Gründung-Sprint ist das, was ich mir selbst gewünscht hätte — vor zwanzig
                      Jahren. Kein Kurs über Kurse. Ein System, das funktioniert.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Preis + CTA ──────────────────────────────────────────────────── */}
        <section
          id="kaufen"
          className="border-b border-brand-gold/15"
          style={{ background: 'linear-gradient(180deg, rgba(200,136,42,0.06) 0%, transparent 100%)' }}
        >
          <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="max-w-content mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8">
                <div>
                  <span className="inline-block text-[10px] font-sans font-bold tracking-[0.18em] uppercase text-brand-fire mb-2">
                    Einmaliger Zugang
                  </span>
                  <h2 className="font-serif text-3xl font-bold text-text-primary">
                    Gründung-Sprint
                  </h2>
                  {price && (
                    <p className="font-serif text-4xl font-bold text-brand-gold mt-2">
                      {eur(price)}
                    </p>
                  )}
                  <p className="text-sm font-sans text-text-muted mt-1">
                    Einmalig · Sofortzugang · Abgewickelt über Digistore24
                  </p>
                </div>
                <div className="shrink-0">
                  <a
                    href="https://www.digistore24.com/product/695894"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-8 py-4 font-sans font-bold text-base hover:opacity-90 transition-opacity"
                    style={{ background: '#C8882A', color: '#0D0A06' }}
                  >
                    {price ? `${eur(price)} — Jetzt freischalten` : 'Jetzt freischalten'}
                    <ArrowRight size={16} />
                  </a>
                  <p className="text-center text-[10px] font-sans text-text-muted mt-2">
                    Zahlungsabwicklung: Digistore24 · SEPA, PayPal, Kreditkarte
                  </p>
                </div>
              </div>

              <div
                className="border px-5 py-4"
                style={{ borderColor: 'rgba(200,136,42,0.2)', background: 'rgba(200,136,42,0.04)' }}
              >
                <p className="text-xs font-sans text-text-secondary leading-relaxed">
                  <strong className="text-text-primary">Hinweis zum Widerrufsrecht:</strong>{' '}
                  Bei digitalen Inhalten, die nach Zahlung sofort zugänglich gemacht werden,
                  erlischt das gesetzliche 14-tägige Widerrufsrecht mit Beginn der Bereitstellung,
                  sofern du dem ausdrücklich zugestimmt hast. Dies wird beim Checkout abgefragt.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────────────────── */}
        <section className="border-b border-border-subtle">
          <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="max-w-content mx-auto">
              <span className="inline-block text-[10px] font-sans font-bold tracking-[0.18em] uppercase text-brand-fire mb-4">
                Häufige Fragen
              </span>
              <h2 className="font-serif text-3xl font-bold text-text-primary mb-10">FAQ</h2>

              <div className="divide-y divide-border-subtle">
                {FAQ.map(({ q, a }) => (
                  <div key={q} className="py-6">
                    <h3 className="font-serif text-base font-bold text-text-primary mb-2">{q}</h3>
                    <p className="font-body text-sm text-text-secondary leading-relaxed">{a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Navigation ───────────────────────────────────────────────────── */}
        <section className="bg-surface-dark">
          <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="max-w-content mx-auto">
              <h3 className="font-sans text-xs font-bold tracking-[0.14em] uppercase text-text-muted mb-6">
                Alle Säulen
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { label: 'Säule I — Gründung-Sprint', href: '/gruendung-sprint', active: true },
                  { label: 'Säule II — Steuer-Matrix', href: '/steuer-matrix', active: false },
                  { label: 'Säule III — Agentur-Killer-Sprint', href: '/agentur-killer-sprint', active: false },
                ].map(({ label, href, active }) => (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center gap-2 text-sm font-sans py-3 px-4 border transition-colors"
                    style={{
                      borderColor: active ? 'rgba(200,136,42,0.4)' : 'rgba(200,136,42,0.12)',
                      background: active ? 'rgba(200,136,42,0.08)' : 'transparent',
                      color: active ? '#C8882A' : 'rgba(255,255,255,0.5)',
                    }}
                  >
                    <ChevronRight size={12} />
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </>
  );
}
