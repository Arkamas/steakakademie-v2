import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ChevronRight, ArrowRight, Flame, Clock, CheckCircle,
  Play, BookOpen, Target, Thermometer, Star, AlertCircle,
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

// â”€â”€ Metadata â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const metadata: Metadata = {
  title: 'BBQ Grundkurs â€” Systematisch besser grillen | Steakakademie',
  description:
    'Der erste vollstÃ¤ndige BBQ-Videokurs der Steakakademie. Feuer, Temperatur, 5 Cuts, echte Technik. Earlybird 79â‚¬ statt 127â‚¬ â€” PDFs sofort, Videos ab Juli 2026.',
  alternates: { canonical: 'https://steakakademie.de/bbq-grundkurs' },
  openGraph: {
    title: 'BBQ Grundkurs â€” Wer jetzt lernt, dominiert den Rest der Saison',
    description:
      'Kein YouTube-Chaos. Kein Trial-and-Error. Ein strukturierter Lernweg der dich in einem Sommer weiter bringt als Jahre davor.',
    url: 'https://steakakademie.de/bbq-grundkurs',
    type: 'website',
    images: [{ url: '/images/og-default.jpg', width: 1200, height: 630, alt: 'BBQ Grundkurs â€” Steakakademie' }],
  },
  twitter: { card: 'summary_large_image', creator: '@steakakademie' },
};

// â”€â”€ Kursinhalte â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const MODULES = [
  {
    nr: '01',
    title: 'Feuer & Hitze',
    Icon: Flame,
    desc: 'Direkte vs. indirekte Hitze, Temperaturzonen einrichten, Kohlemengen berechnen, Gas- und Pelletgrills richtig einstellen. Was auf deinem Rost wirklich passiert.',
    lessons: ['Zwei-Zonen-Feuer aufbauen', 'Temperaturkontrolle ohne Thermometer', 'HÃ¤ufigste AnfÃ¤ngerfehler'],
  },
  {
    nr: '02',
    title: 'Kerntemperatur & Timing',
    Icon: Thermometer,
    desc: 'Warum Kerntemperatur das einzige ist, dem du vertrauen kannst. Carryover Cooking verstehen, Ruhephasen richtig nutzen, Timing fÃ¼r mehrere Cuts gleichzeitig.',
    lessons: ['Thermometer korrekt einsetzen', 'Carryover-Tabelle fÃ¼r alle Garstufen', 'Paralleles Grillen planen'],
  },
  {
    nr: '03',
    title: 'Die 5 Grundcuts',
    Icon: Target,
    desc: 'Ribeye, EntrecÃ´te, Rumpsteak, Flank Steak, HÃ¤hnchenbrust â€” die fÃ¼nf Cuts die jeder Grillmeister beherrscht. Worin sie sich unterscheiden, was sie verzeihen und was nicht.',
    lessons: ['Cut-Anatomie & Fettmarmorierung', 'Marinieren vs. Dry Brine', 'Schnittrichtung & PrÃ¤sentation'],
  },
  {
    nr: '04',
    title: 'Techniken meistern',
    Icon: BookOpen,
    desc: 'Reverse Sear, direktes Searing, Plancha, Rotisserie-Grundlagen â€” wann welche Technik die richtige ist und wie du sie auf jedem Grill umsetzt.',
    lessons: ['Reverse Sear Schritt fÃ¼r Schritt', 'Die perfekte Kruste â€” Maillard-Reaktion', 'Plancha & Gusseisenplatte'],
  },
  {
    nr: '05',
    title: 'Troubleshooting & Wiederholung',
    Icon: CheckCircle,
    desc: 'Was tun wenn es schiefgelaufen ist. HÃ¤ufigste Fehlerbilder und ihre Ursachen â€” damit du aus jedem Grillergebnis lernst statt fluchst.',
    lessons: ['Zu trocken â€” 5 Ursachen', 'Verbannt auÃŸen, roh innen', 'Planen fÃ¼r 4â€“10 Personen'],
  },
];

const WHATS_INCLUDED = [
  { label: '5 Video-Module', detail: '~4 Stunden Lernzeit, abrufbar wann du willst', Icon: Play },
  { label: 'Begleit-PDFs sofort', detail: 'Kerntemperatur-Tabellen, Cut-Guides, Checklisten â€” nach Kauf verfÃ¼gbar', Icon: BookOpen },
  { label: '8-Wochen-Lernplan', detail: 'Strukturierter Zeitplan damit du weiÃŸt was wann drankommt', Icon: Clock },
  { label: 'Lebenslanger Zugang', detail: 'Einmal gekauft, immer verfÃ¼gbar â€” inkl. Updates', Icon: CheckCircle },
];

const FAQ = [
  {
    q: 'Wann sind die Videos verfÃ¼gbar?',
    a: 'Die Begleit-PDFs sind sofort nach Kauf abrufbar. Die Video-Module werden ab Juli 2026 freigeschaltet â€” Earlybird-KÃ¤ufer bekommen automatisch Zugang zum Kursstart.',
  },
  {
    q: 'FÃ¼r wen ist dieser Kurs?',
    a: 'FÃ¼r alle die strukturiert besser grillen wollen â€” Einsteiger die das Chaos beenden wollen, und Fortgeschrittene die endlich verstehen wollen warum ihr Ergebnis mal gut und mal schlecht ist.',
  },
  {
    q: 'Brauche ich einen bestimmten Grill?',
    a: 'Nein. Die Techniken im Kurs funktionieren auf Kugelgrill, Gasgrill, Kamado und Pelletgrill. Wo es Unterschiede gibt, werden sie erklÃ¤rt.',
  },
  {
    q: 'Gibt es ein Widerrufsrecht?',
    a: 'Ja, 14 Tage ab Kauf â€” solange du die PDF-Inhalte noch nicht heruntergeladen hast. Sobald digitale Inhalte bereitgestellt wurden, erlischt das Widerrufsrecht gemÃ¤ÃŸ Â§356 Abs. 5 BGB.',
  },
  {
    q: 'Was ist, wenn ich schon einige Grundlagen kenne?',
    a: 'Der Kurs baut auf solide Grundlagen. Modul 3 (5 Grundcuts) und Modul 4 (Techniken) sind auch fÃ¼r erfahrene Griller wertvoll â€” die meisten haben LÃ¼cken die ihnen nicht bewusst sind.',
  },
  {
    q: 'Kann ich den Kurs verschenken?',
    a: 'Ja. Nach Kauf bekommst du Zugangsdaten die du weitergeben kannst. Kein separates Geschenk-Prozedere.',
  },
];

// â”€â”€ Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function BbqGrundkursPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen">

        {/* â”€â”€ Breadcrumb â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div className="border-b border-border-subtle bg-surface-dark">
          <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <nav className="flex items-center gap-1.5 text-xs font-sans text-text-muted" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-brand-gold transition-colors">Start</Link>
              <ChevronRight size={11} />
              <Link href="/diplome" className="hover:text-brand-gold transition-colors">Kurse</Link>
              <ChevronRight size={11} />
              <span className="text-text-secondary">BBQ Grundkurs</span>
            </nav>
          </div>
        </div>

        {/* â”€â”€ Hero â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <section className="border-b border-border-subtle">
          <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="max-w-content mx-auto">

              {/* Earlybird-Badge */}
              <div className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 border"
                   style={{ borderColor: 'rgba(232,80,24,0.4)', background: 'rgba(232,80,24,0.07)' }}>
                <Flame size={12} className="text-brand-fire" />
                <span className="text-[11px] font-sans font-bold tracking-[0.14em] uppercase text-brand-fire">
                  Earlybird â€” 48â‚¬ sparen Â· PDFs sofort verfÃ¼gbar
                </span>
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl font-bold text-text-primary leading-tight mb-5">
                Wer jetzt lernt, dominiert<br className="hidden sm:block" /> den Rest der Saison.
              </h1>

              <p className="font-body text-lg text-text-secondary leading-relaxed mb-8 max-w-2xl">
                Kein YouTube-Chaos. Kein Trial-and-Error. Ein strukturierter Lernweg der dich
                in einem Sommer weiter bringt als Jahre davor. Feuer, Temperatur, 5 Cuts, echte Technik â€”
                der erste vollstÃ¤ndige BBQ-Kurs der Steakakademie.
              </p>

              {/* Kurs-Ãœberblick Chips */}
              <div className="flex flex-wrap gap-3 mb-10">
                {[
                  '5 Video-Module',
                  '~4 Stunden Lernzeit',
                  'PDFs sofort nach Kauf',
                  'Kursstart Juli 2026',
                  'Lebenslanger Zugang',
                ].map((chip) => (
                  <span
                    key={chip}
                    className="text-xs font-sans text-text-secondary border px-3 py-1"
                    style={{ borderColor: 'rgba(200,136,42,0.2)' }}
                  >
                    {chip}
                  </span>
                ))}
              </div>

              {/* Earlybird CTA */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                {/* Digistore24-Link â€” nach Produkt-Anlage eintragen */}
                <a
                  href=""
                  className="inline-flex items-center gap-2 px-8 py-4 font-sans font-bold text-base hover:opacity-90 transition-opacity"
                  style={{ background: '#C8882A', color: '#0D0A06' }}
                >
                  In Vorbereitung
                  <ArrowRight size={16} />
                </a>
                <div>
                  <p className="font-sans text-sm text-text-secondary">Kursinhalt wird erstellt</p>
                  <p className="font-sans text-xs text-text-muted">Inhalt folgt in Vorbereitung</p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* â”€â”€ Was du lernst â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <section className="border-b border-border-subtle bg-surface-dark">
          <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="max-w-content mx-auto">
              <span className="inline-block text-[10px] font-sans font-bold tracking-[0.18em] uppercase text-brand-fire mb-4">
                Kursinhalte
              </span>
              <h2 className="font-serif text-3xl font-bold text-text-primary mb-10">
                5 Module. Ein Sommer. Kein Raten mehr.
              </h2>

              <div className="space-y-0 divide-y divide-border-subtle">
                {MODULES.map(({ nr, title, Icon, desc, lessons }) => (
                  <div key={nr} className="py-8 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6">
                    <div>
                      <div className="flex items-start gap-4 mb-3">
                        <span className="font-serif text-2xl font-bold shrink-0"
                              style={{ color: 'rgba(200,136,42,0.35)' }}>
                          {nr}
                        </span>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Icon size={15} className="text-brand-gold shrink-0" />
                            <h3 className="font-sans font-bold text-base text-text-primary">{title}</h3>
                          </div>
                          <p className="font-body text-sm text-text-secondary leading-relaxed">{desc}</p>
                        </div>
                      </div>
                    </div>
                    <ul className="lg:min-w-[220px] space-y-1.5 pl-0 lg:pl-4">
                      {lessons.map((l) => (
                        <li key={l} className="flex items-start gap-2 text-xs font-sans text-text-muted">
                          <ChevronRight size={11} className="text-brand-gold shrink-0 mt-0.5" />
                          {l}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* â”€â”€ Was du bekommst â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <section className="border-b border-border-subtle">
          <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="max-w-content mx-auto">
              <span className="inline-block text-[10px] font-sans font-bold tracking-[0.18em] uppercase text-brand-fire mb-4">
                Im Lieferumfang
              </span>
              <h2 className="font-serif text-3xl font-bold text-text-primary mb-10">
                Was du nach dem Kauf bekommst
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {WHATS_INCLUDED.map(({ label, detail, Icon }) => (
                  <div
                    key={label}
                    className="flex items-start gap-4 p-5 border"
                    style={{ borderColor: 'rgba(200,136,42,0.15)', background: 'rgba(200,136,42,0.03)' }}
                  >
                    <div className="p-2 shrink-0" style={{ background: 'rgba(200,136,42,0.1)' }}>
                      <Icon size={16} className="text-brand-gold" />
                    </div>
                    <div>
                      <p className="font-sans font-bold text-sm text-text-primary mb-1">{label}</p>
                      <p className="font-body text-xs text-text-secondary leading-relaxed">{detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* â”€â”€ Earlybird Pricing â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <section id="kaufen" className="border-b border-border-subtle bg-surface-dark">
          <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="max-w-content mx-auto">
              <span className="inline-block text-[10px] font-sans font-bold tracking-[0.18em] uppercase text-brand-fire mb-4">
                In Vorbereitung
              </span>
              <h2 className="font-serif text-3xl font-bold text-text-primary mb-2">
                Earlybird â€” solange der Sommer lÃ¤uft.
              </h2>
              <p className="font-body text-sm text-text-secondary mb-10 max-w-xl">
                PDFs sofort nach Kauf. Videos folgen bei Kursstart im Juli 2026.
                Wer den Earlybird verpasst, zahlt 48â‚¬ mehr â€” und hat weniger Sommer Ã¼brig, um das Gelernte anzuwenden.
              </p>

              <div
                className="border p-8 max-w-2xl"
                style={{ borderColor: 'rgba(200,136,42,0.3)', background: 'rgba(200,136,42,0.04)' }}
              >
                {/* Preiszeile */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
                  <div>
                    <div className="flex items-baseline gap-3">
                      <span className="font-serif text-5xl font-bold text-text-primary">In Vorbereitung</span>
                      <span
                        className="font-sans text-xl text-text-muted line-through decoration-brand-fire/60"
                        style={{ textDecoration: 'line-through', textDecorationColor: 'rgba(232,80,24,0.6)' }}
                      >
                        
                      </span>
                    </div>
                    <p className="font-sans text-xs text-text-muted mt-1">
                      Einmalzahlung Â· Keine monatlichen Kosten Â· Lebenslanger Zugang
                    </p>
                  </div>
                  <div className="sm:ml-auto shrink-0">
                    <span
                      className="inline-block font-sans text-xs font-bold tracking-[0.14em] uppercase px-3 py-1.5"
                      style={{ background: 'rgba(232,80,24,0.15)', color: '#E85018', border: '1px solid rgba(232,80,24,0.3)' }}
                    >
                      In Aufbau
                    </span>
                  </div>
                </div>

                {/* Was sofort inklusive */}
                <ul className="space-y-2 mb-8">
                  {[
                    { text: 'Begleit-PDFs â€” sofort nach Kauf verfÃ¼gbar', now: true },
                    { text: '5 Video-Module â€” ab Juli 2026', now: false },
                    { text: '8-Wochen-Lernplan als PDF', now: true },
                    { text: 'Kerntemperatur-Tabellen & Cut-Guides', now: true },
                    { text: 'Updates & neue Module kostenlos', now: true },
                  ].map(({ text, now }) => (
                    <li key={text} className="flex items-start gap-2.5 text-sm font-sans">
                      <CheckCircle size={14} className="text-brand-gold shrink-0 mt-0.5" />
                      <span className="text-text-secondary">
                        {text}
                        {now && (
                          <span
                            className="ml-2 text-[10px] font-bold tracking-wide uppercase px-1.5 py-0.5 align-middle"
                            style={{ background: 'rgba(200,136,42,0.15)', color: '#C8882A' }}
                          >
                            Sofort
                          </span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                  {/* Digistore24-Link â€” nach Produkt-Anlage eintragen */}
                  <a
                    href=""
                    className="flex items-center justify-center gap-2 px-8 py-4 font-sans font-bold text-base hover:opacity-90 transition-opacity"
                    style={{ background: '#C8882A', color: '#0D0A06' }}
                  >
                    In Vorbereitung
                    <ArrowRight size={16} />
                  </a>
                  <div className="flex items-center gap-2 text-xs font-sans text-text-muted">
                    <Star size={11} className="text-brand-gold" />
                    Kursinhalt in Vorbereitung
                  </div>
                </div>
              </div>

              {/* Hinweis */}
              <div
                className="mt-6 border px-5 py-4 max-w-2xl flex items-start gap-3"
                style={{ borderColor: 'rgba(200,136,42,0.15)', background: 'rgba(200,136,42,0.02)' }}
              >
                <AlertCircle size={14} className="text-text-muted shrink-0 mt-0.5" />
                <p className="text-xs font-sans text-text-secondary leading-relaxed">
                  <strong className="text-text-primary">Widerrufsrecht:</strong>{' '}
                  14 Tage ab Kauf, solange digitale Inhalte noch nicht heruntergeladen wurden.
                  Kursinhalt wird derzeit erstellt.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* â”€â”€ FAQ â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <section className="border-b border-border-subtle">
          <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="max-w-content mx-auto">
              <span className="inline-block text-[10px] font-sans font-bold tracking-[0.18em] uppercase text-brand-fire mb-4">
                HÃ¤ufige Fragen
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

        {/* â”€â”€ Navigation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <section className="bg-surface-dark">
          <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="max-w-content mx-auto">
              <h3 className="font-sans text-xs font-bold tracking-[0.14em] uppercase text-text-muted mb-6">
                Weitere BBQ-Tools & Kurse
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { label: 'Steak-Beichte', href: '/steak-beichte', note: 'KI-Diagnose fÃ¼r Grillfehler' },
                  { label: 'Mein Protokoll', href: '/mein-protokoll', note: 'PersÃ¶nlicher 8-Wochen-Plan' },
                  { label: 'Kerntemperatur-Guide', href: '/temperatur-guide', note: 'Alle Cuts & Garstufen' },
                ].map(({ label, href, note }) => (
                  <Link
                    key={href}
                    href={href}
                    className="flex flex-col gap-1 text-sm font-sans py-3 px-4 border transition-colors hover:border-brand-gold/30"
                    style={{ borderColor: 'rgba(200,136,42,0.12)', color: 'rgba(255,255,255,0.5)' }}
                  >
                    <span className="flex items-center gap-2">
                      <ChevronRight size={12} className="text-brand-gold" />
                      {label}
                    </span>
                    <span className="text-[11px] text-text-muted pl-4">{note}</span>
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

