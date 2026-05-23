import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, Thermometer, Info, AlertTriangle } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { howToSchema, faqSchema, breadcrumbSchema, articleSchema } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Kerntemperaturen Fleisch — Komplette Tabelle & Guide 2026',
  description:
    'Kerntemperaturen für Rind, Schwein, Lamm, Geflügel und Fisch — mit Carry-over-Rechner, Resting-Zeiten und Plateauphase erklärt. Getestet an Kamado, Kugelgrill und Oberhitzegrill.',
  alternates: { canonical: 'https://steakakademie.de/wissen/kerntemperaturen' },
  openGraph: {
    title: 'Kerntemperaturen Fleisch — Kompletter Guide | Steakakademie',
    description: 'Alle Kerntemperaturen auf einen Blick: Rind, Schwein, Lamm, Geflügel. Mit Carry-over, Plateauphase und Thermometer-Tipps.',
    url: 'https://steakakademie.de/wissen/kerntemperaturen',
    type: 'article',
  },
};

// ── Temperaturtabellen ────────────────────────────────────────────────────────

const RIND = [
  { garstufe: 'Bleu / Raw', temp: '46–49 °C', beschreibung: 'Kaum Denaturierung, fast roh im Kern. Nur für gesichertes Prime-Beef.' },
  { garstufe: 'Rare', temp: '50–53 °C', beschreibung: 'Äußere Schicht fest, Kern leuchtend rot. Myoglobin überwiegend erhalten.' },
  { garstufe: 'Medium Rare ★', temp: '54–57 °C', beschreibung: 'Optimum: Saftmaximum, vollständige Maillard-Kruste, rosa Kern. Benchmark aller Steakhouses.' },
  { garstufe: 'Medium', temp: '58–62 °C', beschreibung: 'Hell-rosa bis grau-rosa, deutlich weniger Saftigkeit durch Myoglobindenaturierung.' },
  { garstufe: 'Medium Well', temp: '63–67 °C', beschreibung: 'Nur noch leicht rosa. Deutlicher Saftverlust durch Muskelproteinshrinkage.' },
  { garstufe: 'Well Done', temp: '68+ °C', beschreibung: 'Vollständig grau, trocken. Kollagen-Gelatinierung beginnt erst ab 70 °C — kein Vorteil mehr.' },
];

const CUTS_SPEZIAL = [
  { cut: 'Brisket (Bruststück)', temp: '88–96 °C', hinweis: 'Plateauphase bei 65–72 °C durch Kollagenumwandlung. Erst bei 88 °C+ ist Kollagen vollständig zu Gelatine geworden.' },
  { cut: 'Pulled Pork (Schweinenacken)', temp: '90–95 °C', hinweis: 'Intramuskuläres Kollagen schmilzt ab 75 °C. Beim Zerziehen (Pulling) sollte das Fleisch sich mit zwei Gabeln ohne Widerstand trennen.' },
  { cut: 'Spare Ribs (Schweinerippchen)', temp: '88–93 °C', hinweis: '3-2-1-Methode: 3h Rauch, 2h gedämpft, 1h glasiert. Bend-Test: Rippe soll sich 90° biegen, ohne zu brechen.' },
  { cut: 'Lammkeule', temp: '60–65 °C', hinweis: 'Rosa (60 °C) vs. durchgegart (70 °C). Thymianlänge beeinflusst die enzymatische Aktivität der Lipasen.' },
  { cut: 'Ganzes Hähnchen (Brust)', temp: '73–75 °C', hinweis: 'HACCP-Pflichttemperatur: 72 °C für 2 Minuten pasteurisiert Salmonellen. Nie roh entnehmen.' },
  { cut: 'Lachsfilet', temp: '50–52 °C', hinweis: 'Niedertemperatur-Lachs: Kollagen der Myocommata schmilzt, Fleisch löst sich in Scheiben. Ab 60 °C trocken.' },
];

const FAQ_ITEMS = [
  {
    question: 'Was ist Carry-over beim Grillen?',
    answer: 'Carry-over (Nachwärme) bezeichnet den Temperaturanstieg, der im Fleisch nach dem Entfernen von der Hitzequelle weiterläuft — durch die gespeicherte Wärme im äußeren Fleischmantel. Faustregel: 2–5 °C je nach Fleischstärke und Garmethode. Ein Ribeye sollte daher bei 51–52 °C (statt 54 °C Zieltemperatur) vom Grill. Nach 5–8 Minuten Resting erreicht es exakt 54 °C im Kern.',
  },
  {
    question: 'Was ist die Plateauphase beim Brisket?',
    answer: 'Die Plateauphase (auch "Stall" genannt) tritt beim Brisket zwischen 65–72 °C auf. Verdunstungskühle durch Feuchtigkeitsabgabe aus dem Fleisch gleicht die Hitzezufuhr exakt aus — die Kerntemperatur stagniert für 2–6 Stunden. Lösung: Texas Crutch (Einwickeln in Butcherpaper) erhöht die Wärmeleitung und verkürzt die Plateauphase um 1–2 Stunden.',
  },
  {
    question: 'Warum ist Resting nach dem Grillen wichtig?',
    answer: 'Beim Grillen zieht sich das Fleischprotein durch Hitzestress zusammen und drückt Zellflüssigkeit in den Kern. Resting für 5–15 Minuten erlaubt den Proteinen zu relaxieren und die Säfte gleichmäßig zu verteilen. Ohne Resting verliert ein Ribeye beim Anschneiden bis zu 40 % mehr Fleischsaft als nach einer Resting-Phase unter Alufolie.',
  },
  {
    question: 'Welches Fleischthermometer ist das Genaueste?',
    answer: 'Sofortlesegeräte (z.B. Thermapen ONE, ±0,4 °C, 1-Sekunden-Messung) sind genauer als Funk-Sonden. Funk-Thermometer wie der MEATER Plus haben eine Toleranz von ±1–2 °C, sind aber für Low-and-Slow-BBQ ideal, da sie kontinuierlich messen. Für das finale Steakabziehen empfehlen wir immer ein Sofortlesegerät zur Verifikation.',
  },
  {
    question: 'Ab welcher Temperatur ist Schweinefleisch sicher?',
    answer: 'Laut EU-Lebensmittelhygieneverordnung muss Schweinefleisch mindestens 70 °C für 2 Minuten oder 75 °C kurz erreichen, um Trichinen und Salmonellen sicher abzutöten. Pulled Pork und Spare Ribs (88–95 °C Zieltemperatur) sind durch die lange Garzeit auf jedem Fall sicher. Schweinesteak kann bei guter Qualität auf 63 °C (USDA-Standard) abgezogen werden.',
  },
  {
    question: 'Was ist der Unterschied zwischen Kamado und Kugelgrill beim indirekten Garen?',
    answer: 'Ein Kamado (z.B. Big Green Egg, Monolith) aus Keramik speichert Wärme deutlich effizienter als ein Stahl-Kugelgrill. Durch die Keramikisolierung stabilisiert er sich auf ±5 °C — ideal für 12-stündige Low-and-Slow-Cooks. Ein Kugelgrill schwankt ±15–20 °C und benötigt häufigere Nachregelung. Für Brisket empfehlen wir Kamado oder Offset-Smoker; für Kurzgebratenes (Steak) spielt der Unterschied keine Rolle.',
  },
];

export default function KerntemperaturenPage() {
  const howToSch = howToSchema({
    name: 'Fleisch korrekt auf Kerntemperatur grillen',
    description:
      'Schritt-für-Schritt Anleitung für präzises Grillen auf Kerntemperatur — mit Thermometer-Einsatz, Carry-over-Kalkulation und optimaler Resting-Phase.',
    url: '/wissen/kerntemperaturen',
    totalTime: 'PT45M',
    steps: [
      { name: 'Thermometer kalibrieren', text: 'Sofortlesethermometer im Eiswasserbad (0 °C) und in kochendem Wasser (100 °C) prüfen. Toleranz über ±1 °C → Rekalibrierung oder Neukauf.' },
      { name: 'Zieltemperatur minus Carry-over bestimmen', text: 'Zieltemperatur festlegen (z.B. 54 °C Medium Rare), 3–4 °C Carry-over abziehen → Fleisch bei 50–51 °C vom Grill nehmen.' },
      { name: 'Messung im thermischen Zentrum', text: 'Thermometer-Spitze in den geometrischen Mittelpunkt des dicksten Fleischbereichs einstechen, nicht an Knochen oder Fett. Messwert nach 3–5 Sekunden ablesen.' },
      { name: 'Resting unter loser Alufolie', text: 'Fleisch 5–10 Minuten (bei großen Cuts: 15–20 Min.) unter loser Alufolie ruhen lassen. Kein luftdichtes Einwickeln — sonst schwitzt die Kruste auf.' },
      { name: 'Finaltemperatur kontrollieren', text: 'Nach dem Resting Kerntemperatur erneut messen. Bei exakt 54 °C: Sofort anschneiden und servieren. Bei Untertemperatur: 2 Minuten nachgaren.' },
    ],
  });

  const faqSch = faqSchema(FAQ_ITEMS);

  const articleSch = articleSchema({
    headline: 'Kerntemperaturen Fleisch — Komplette Tabelle & Guide 2026',
    description:
      'Kerntemperaturen für Rind, Schwein, Lamm, Geflügel und Fisch — mit Carry-over, Resting und Plateauphase erklärt.',
    image: '/images/og-default.jpg',
    datePublished: '2026-01-15',
    dateModified: '2026-05-23',
    authorName: 'Marco Lauer',
    authorSlug: 'marco',
    url: '/wissen/kerntemperaturen',
    keywords: ['Kerntemperatur', 'Fleisch', 'Grillen', 'Carry-over', 'Resting', 'Plateauphase', 'Brisket', 'Steak', 'Thermometer'],
  });

  const breadcrumbSch = breadcrumbSchema([
    { name: 'Wissen', url: '/wissen' },
    { name: 'Kerntemperaturen', url: '/wissen/kerntemperaturen' },
  ]);

  return (
    <>
      <Header />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSch) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSch) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSch) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSch) }} />

      <main className="bg-surface-base">
        {/* Breadcrumb */}
        <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <nav className="flex items-center gap-1.5 text-xs font-sans text-text-muted" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-brand-gold transition-colors">Start</Link>
            <ChevronRight size={12} />
            <Link href="/wissen" className="hover:text-brand-gold transition-colors">Wissen</Link>
            <ChevronRight size={12} />
            <span className="text-text-secondary">Kerntemperaturen</span>
          </nav>
        </div>

        <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-12">

            {/* Hauptinhalt */}
            <article>
              <header className="mb-10">
                <span className="category-label">Wissen · Thermik & Messtechnik</span>
                <h1 className="font-serif text-4xl lg:text-5xl font-bold text-text-primary mt-3 mb-5 leading-tight">
                  Kerntemperaturen Fleisch — Komplette Tabelle & Guide
                </h1>
                <p className="font-body text-lg text-text-secondary leading-relaxed">
                  Die Kerntemperatur ist die einzige objektiv messbare Größe beim Grillen. Kein
                  Finger-Test, kein Timing, kein Augenmaß ersetzt ein kalibriertes
                  Sofortlesethermometer. Hier findest du alle Temperaturen für alle Fleischarten —
                  plus die Physik dahinter.
                </p>
              </header>

              {/* RIND-TABELLE */}
              <section className="mb-12">
                <h2 className="font-serif text-2xl font-bold text-text-primary mb-2 pb-3" style={{ borderBottom: '1px solid rgba(200,136,42,0.2)' }}>
                  Rind: Garstufen & Kerntemperaturen
                </h2>
                <p className="font-body text-text-secondary mb-6 text-sm leading-relaxed">
                  Maßgeblich für Steaks (Ribeye, Entrecôte, T-Bone, Tomahawk) und Braten. Bei
                  Langzeitgarmethoden wie Brisket (Low &amp; Slow, 12–18h) gelten eigene Werte durch
                  Kollagen-Gelatinierung.
                </p>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm font-sans border-collapse">
                    <thead>
                      <tr style={{ backgroundColor: '#1C1008' }}>
                        <th className="px-4 py-3 text-left text-[11px] font-bold tracking-[0.1em] uppercase text-brand-gold border-b border-brand-gold/20">Garstufe</th>
                        <th className="px-4 py-3 text-left text-[11px] font-bold tracking-[0.1em] uppercase text-brand-gold border-b border-brand-gold/20">Kerntemperatur</th>
                        <th className="px-4 py-3 text-left text-[11px] font-bold tracking-[0.1em] uppercase text-brand-gold border-b border-brand-gold/20">Beschreibung</th>
                      </tr>
                    </thead>
                    <tbody>
                      {RIND.map((row, i) => (
                        <tr key={row.garstufe} style={{ backgroundColor: i % 2 === 0 ? 'transparent' : 'rgba(240,232,216,0.35)' }}>
                          <td className="px-4 py-3 font-semibold text-text-primary border-b border-border-subtle">
                            {row.garstufe}
                          </td>
                          <td className="px-4 py-3 font-bold text-brand-gold border-b border-border-subtle whitespace-nowrap">
                            {row.temp}
                          </td>
                          <td className="px-4 py-3 text-text-secondary border-b border-border-subtle leading-relaxed">
                            {row.beschreibung}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Info-Box Carry-over */}
                <div className="mt-5 p-4 flex gap-3" style={{ background: 'rgba(200,136,42,0.06)', border: '1px solid rgba(200,136,42,0.2)' }}>
                  <Info size={16} className="text-brand-gold shrink-0 mt-0.5" />
                  <p className="text-sm font-sans text-text-secondary leading-relaxed">
                    <strong className="text-text-primary">Carry-over beachten:</strong> Fleisch 3–5 °C
                    vor Zieltemperatur vom Grill nehmen. Die gespeicherte Wärme im äußeren
                    Fleischmantel heizt den Kern beim Resting weiter auf.
                  </p>
                </div>
              </section>

              {/* SPEZIAL-CUTS */}
              <section className="mb-12">
                <h2 className="font-serif text-2xl font-bold text-text-primary mb-2 pb-3" style={{ borderBottom: '1px solid rgba(200,136,42,0.2)' }}>
                  Low & Slow Cuts — Spezialtemperaturen
                </h2>
                <p className="font-body text-text-secondary mb-6 text-sm leading-relaxed">
                  Brisket, Pulled Pork und Ribs folgen einer anderen Logik als Steaks: Ziel ist nicht
                  das Erhalten von Saft, sondern die vollständige Umwandlung von Kollagen in Gelatine —
                  was erst bei hohen Kerntemperaturen (88–96 °C) gelingt.
                </p>
                <div className="space-y-4">
                  {CUTS_SPEZIAL.map((cut) => (
                    <div key={cut.cut} className="border border-border-subtle p-5 bg-surface-card">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h3 className="font-sans font-bold text-text-primary">{cut.cut}</h3>
                        <span className="font-bold text-brand-gold font-sans text-sm whitespace-nowrap">{cut.temp}</span>
                      </div>
                      <p className="text-sm font-body text-text-secondary leading-relaxed">{cut.hinweis}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 p-4 flex gap-3" style={{ background: 'rgba(232,80,24,0.06)', border: '1px solid rgba(232,80,24,0.2)' }}>
                  <AlertTriangle size={16} className="text-brand-fire shrink-0 mt-0.5" />
                  <p className="text-sm font-sans text-text-secondary leading-relaxed">
                    <strong className="text-text-primary">Plateauphase (Stall):</strong> Brisket und
                    Pulled Pork pausieren bei 65–72 °C für 2–6 Stunden. Keine Panik —
                    Verdunstungskühle bremst den Temperaturanstieg. Texas Crutch (Butcherpaper)
                    verkürzt die Stall-Phase erheblich.
                  </p>
                </div>
              </section>

              {/* HowTo-Abschnitt */}
              <section className="mb-12">
                <h2 className="font-serif text-2xl font-bold text-text-primary mb-6 pb-3" style={{ borderBottom: '1px solid rgba(200,136,42,0.2)' }}>
                  So misst du richtig: 5-Schritte-Methode
                </h2>
                <ol className="space-y-4">
                  {[
                    { n: '01', title: 'Thermometer kalibrieren', body: 'Im Eiswasserbad (0 °C) und in kochendem Wasser (100 °C) prüfen. Toleranz >±1 °C → Gerät ersetzen oder kalibrieren lassen. Sofortlesegeräte wie Thermapen ONE halten typischerweise ±0,4 °C.' },
                    { n: '02', title: 'Zieltemperatur minus Carry-over', body: 'Für Medium Rare (54 °C Ziel): Fleisch bei 50–51 °C vom Grill nehmen. Bei dünnen Steaks <2 cm genügen 2 °C Abzug, bei dicken Cuts (>4 cm) oder nach Hochtemperatur-Sear bis 5 °C.' },
                    { n: '03', title: 'Messung im thermischen Zentrum', body: 'Fühler-Spitze muss im geometrischen Mittelpunkt des dicksten Fleischbereichs sitzen — nicht am Knochen (leitet zu viel Wärme), nicht im Fett (schmilzt bei niedrigerer Temperatur). 3–5 Sekunden warten.' },
                    { n: '04', title: 'Resting — der unterschätzte Schritt', body: '5–10 Minuten unter loser Alufolie. Kein luftdichtes Einwickeln — Kruste wird weich. Die Proteinfibrillen entspannen sich und reabsorbieren die während des Grillens zentral gedrängten Fleischsäfte. Saftgewinn: bis zu 40 %.' },
                    { n: '05', title: 'Finaltemperatur kontrollieren', body: 'Nach dem Resting nochmals messen. Liegt der Wert exakt auf Zieltemperatur → anschneiden. Zu niedrig → 2 Minuten nachgaren und erneut messen. Nie nach Gefühl entscheiden.' },
                  ].map((step) => (
                    <li key={step.n} className="flex gap-4 p-5 border border-border-subtle bg-surface-card">
                      <span className="font-serif text-2xl font-bold text-brand-gold/40 shrink-0 leading-none mt-0.5">{step.n}</span>
                      <div>
                        <h3 className="font-sans font-bold text-text-primary mb-2">{step.title}</h3>
                        <p className="text-sm font-body text-text-secondary leading-relaxed">{step.body}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </section>

              {/* FAQ */}
              <section className="mb-12">
                <h2 className="font-serif text-2xl font-bold text-text-primary mb-6 pb-3" style={{ borderBottom: '1px solid rgba(200,136,42,0.2)' }}>
                  Häufige Fragen
                </h2>
                <div className="space-y-4">
                  {FAQ_ITEMS.map((item) => (
                    <details key={item.question} className="border border-border-subtle group">
                      <summary className="flex items-center justify-between p-5 cursor-pointer font-sans font-semibold text-text-primary hover:text-brand-gold transition-colors list-none gap-3">
                        <span>{item.question}</span>
                        <ChevronRight size={14} className="shrink-0 text-brand-gold/60 group-open:rotate-90 transition-transform" />
                      </summary>
                      <div className="px-5 pb-5 font-body text-sm text-text-secondary leading-relaxed">
                        {item.answer}
                      </div>
                    </details>
                  ))}
                </div>
              </section>
            </article>

            {/* Sidebar */}
            <aside className="space-y-6">
              {/* Schnell-Referenz */}
              <div className="bg-surface-dark border border-brand-gold/20 p-5 sticky top-24">
                <div className="flex items-center gap-2 mb-4">
                  <Thermometer size={14} className="text-brand-gold" />
                  <h3 className="font-sans text-[11px] font-bold tracking-[0.14em] uppercase text-brand-gold">
                    Schnell-Referenz
                  </h3>
                </div>
                <ul className="space-y-2">
                  {[
                    { label: 'Steak Medium Rare', value: '54–57 °C' },
                    { label: 'Steak Medium', value: '58–62 °C' },
                    { label: 'Brisket / Pulled Pork', value: '90–95 °C' },
                    { label: 'Lammkeule (rosa)', value: '60–65 °C' },
                    { label: 'Hähnchen (sicher)', value: '73–75 °C' },
                    { label: 'Lachs (Niedertemperatur)', value: '50–52 °C' },
                  ].map(({ label, value }) => (
                    <li key={label} className="flex items-center justify-between text-xs font-sans py-2 border-b border-brand-gold/10 last:border-0">
                      <span className="text-text-light/65">{label}</span>
                      <span className="font-bold text-brand-gold">{value}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Silo-Querverweise */}
              <div className="bg-surface-card border border-border-subtle p-5">
                <h3 className="font-sans text-[11px] font-bold tracking-[0.14em] uppercase text-text-muted mb-4">
                  Verwandte Guides
                </h3>
                <ul className="space-y-0">
                  {[
                    { label: 'Thermometer-Vergleich', href: '/vergleich/premium-fleischthermometer' },
                    { label: 'Reverse Sear Methode', href: '/methoden/reverse-sear' },
                    { label: 'Ribeye: Cut-Guide', href: '/cuts/ribeye' },
                    { label: 'Brisket: Plateauphase', href: '/cuts/brisket' },
                    { label: 'Grillmeister-Diplom', href: '/diplome' },
                  ].map(({ label, href }) => (
                    <li key={href}>
                      <Link
                        href={href}
                        className="flex items-center justify-between text-sm font-sans text-text-secondary hover:text-brand-fire transition-colors group py-3 border-b border-border-subtle/50 last:border-0"
                      >
                        {label}
                        <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity text-brand-fire" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
