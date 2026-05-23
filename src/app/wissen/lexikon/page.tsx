import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'BBQ-Lexikon — Begriffe & Definitionen | Steakakademie',
  description: 'Das BBQ-Lexikon der Steakakademie: Alle wichtigen Begriffe aus der Welt des Grillens und BBQs — kurz, präzise und auf den Punkt erklärt.',
  alternates: { canonical: 'https://steakakademie.de/wissen/lexikon' },
};

type LexikonEntry = {
  term: string;
  definition: string;
  category: 'cuts' | 'technik' | 'geraet' | 'chemie';
};

const ENTRIES: LexikonEntry[] = [
  // Cuts
  {
    term: 'Brisket',
    definition: 'Die Rinderbrust — bestehend aus Flat (mager) und Point (fettreich). Das klassische Texas BBQ-Stück. Wird 12–18 Stunden bei 110–125°C gesmokt bis 93–96°C Kerntemperatur.',
    category: 'cuts',
  },
  {
    term: 'Ribeye',
    definition: 'Cut aus dem langen Rückenstrecker (Longissimus dorsi) zwischen der 6. und 12. Rippe. Besteht aus drei Muskeln: Longissimus (Hauptauge), Spinalis (Deckel/Cap) und Complexus. Der Spinalis ist der geschmacksintensivste Teil.',
    category: 'cuts',
  },
  {
    term: 'Boston Butt',
    definition: 'US-Bezeichnung für den oberen Teil der Schweineschulter. Trotz des Namens kein Hinterteil. Klassisches Pulled-Pork-Ausgangsstück wegen hohem Bindegewebe- und Fettanteil.',
    category: 'cuts',
  },
  {
    term: 'Flat Iron',
    definition: 'Aus dem Schulterblatt (Infraspinatus-Muskel) — eines der zartesten und günstigsten Cuts überhaupt. In Deutschland auch als "Schaufelstück" bekannt. Durch die Mitte verläuft eine Sehne, die vor dem Servieren entfernt wird.',
    category: 'cuts',
  },
  {
    term: 'Tomahawk',
    definition: 'Ribeye mit langer, freigescharrter Rippe (typisch 30–45cm). Kein eigener Cut — reines Marketingprodukt. Der Steak-Anteil ist identisch mit einem normalen Ribeye; du bezahlst für Optik.',
    category: 'cuts',
  },
  {
    term: 'Picanha',
    definition: 'Brasilianisches Nationalgericht: der Schwanzdeckel (Rumpdeckel) mit Fettkappe. Wird traditionell in dicke Scheiben geschnitten, U-förmig aufgespießt und direkt gegrillt. In Deutschland auch als "Tafelspitzdeckel" oder "Culotte" bekannt.',
    category: 'cuts',
  },
  // Technik
  {
    term: 'Reverse Sear',
    definition: 'Umgekehrte Garmethode: zuerst langsam im Ofen oder Smoker auf Zieltemperatur bringen, dann kurz und heiß für die Kruste anbraten. Ergibt eine gleichmäßige Garstufe von Rand bis Mitte (kein grauer Ring).',
    category: 'technik',
  },
  {
    term: 'Low & Slow',
    definition: 'BBQ-Methode bei 100–135°C über mehrere Stunden. Klassisch für Brisket, Pulled Pork, Ribs. Die niedrige Temperatur gibt dem Kollagen Zeit, sich in Gelatine umzuwandeln und macht zähes Fleisch zart.',
    category: 'technik',
  },
  {
    term: 'Der Stall (The Stall)',
    definition: 'Temperaturplateau beim Long Cook, typisch bei 65–80°C Kerntemperatur. Das Fleisch kühlt sich durch Verdunstung selbst und die Temperatur steigt stundenlang nicht. Lösung: Texas Crutch (Einwickeln in Butcher Paper oder Folie).',
    category: 'technik',
  },
  {
    term: 'Texas Crutch',
    definition: 'Methode zum Überbrücken des Stalls: Das Fleisch bei ~70°C Kerntemperatur in Butcher Paper oder Alufolie einwickeln. Unterbindet die Verdunstung und beschleunigt das Garen. Kann den Bark weich machen — deshalb kurz vor Ende aufmachen.',
    category: 'technik',
  },
  {
    term: 'Bark',
    definition: 'Die dunkle, aromatische Außenkruste beim BBQ — entstanden durch Maillard-Reaktion, Karamellisierung und Dehydrierung der Rub-Schicht. Ein guter Bark ist ein Qualitätsmerkmal bei Brisket und Pulled Pork.',
    category: 'technik',
  },
  {
    term: 'Sous-vide',
    definition: 'Garmethode im Vakuumbeutel im Wasserbad bei präzise kontrollierter Temperatur. Nicht klassisches BBQ, aber ideal in Kombination mit Searing (sogenanntes "Sous-vide + Sear"). Sehr hohe Reproduzierbarkeit.',
    category: 'technik',
  },
  // Geräte
  {
    term: 'Kamado',
    definition: 'Keramikgrill japanischen Ursprungs (kamado = Herd). Speichert Wärme extrem gut, hält lange Temperaturen stabil und hält das Garraum feucht. Ideal für Long Cooks. Bekannte Marken: Big Green Egg, Kamado Joe.',
    category: 'geraet',
  },
  {
    term: 'Offset-Smoker',
    definition: 'Smoker mit seitlicher Feuerbox. Rauch und Hitze ziehen durch die Garkammer. Klassisches BBQ-Gerät — schwierig zu kontrollieren, aber erzeugt den authentischsten Smoke-Flavor. Lernkurve ist steil.',
    category: 'geraet',
  },
  {
    term: 'Pelletgrill',
    definition: 'Automatisierter Smoker, der Holzpellets als Brennstoff verwendet. Digitale Temperaturkontrolle, sehr konsistente Ergebnisse. Schwäche: maximale Temperatur oft begrenzt (< 250°C), direktes Grillen eingeschränkt.',
    category: 'geraet',
  },
  // Chemie & Wissenschaft
  {
    term: 'Maillard-Reaktion',
    definition: 'Chemische Reaktion zwischen Aminosäuren und Zucker bei >140°C — verantwortlich für die braune Kruste und Röstaromen. Keine Karamellisierung (die ist Zucker allein) — die Maillard-Reaktion ist komplexer und aromatischer.',
    category: 'chemie',
  },
  {
    term: 'Kollagen',
    definition: 'Bindegewebe in Fleisch, das bei >70°C zu Gelatine umgewandelt wird. Je mehr Kollagen ein Cut hat (z.B. Brisket, Schulter), desto mehr Feuchtigkeit und Saftigkeit entsteht beim langen Garen. Kein Kollagen = kein Pulled Pork.',
    category: 'chemie',
  },
  {
    term: 'Marmorierung (BMS)',
    definition: 'Intramuskuläres Fett — Fett, das direkt im Muskel eingelagert ist. Gemessen auf dem Beef Marbling Score (BMS) von 1–12. Je höher der Score, desto mehr Fett, desto mehr Saftigkeit und Geschmack. Wagyu BMS 9+ ist das Maximum.',
    category: 'chemie',
  },
  {
    term: 'Dry Aging',
    definition: 'Kontrolliertes Trockenreifen von Fleisch in der Luft bei 0–4°C und 70–85% Luftfeuchtigkeit über Wochen bis Monate. Enzyme bauen Muskelproteine ab (Zartheit), Wasser verdunstet (Konzentration der Aromen). Ergibt nussig-buttrige Geschmacksprofile.',
    category: 'chemie',
  },
  {
    term: 'Ruhephase (Resting)',
    definition: 'Wartezeit nach dem Garen, bevor das Fleisch angeschnitten wird. Während des Garens zieht sich das Fleisch zusammen und presst Säfte nach innen. Beim Ruhen entspannt es sich wieder. 5–30 Minuten je nach Größe. Unverzichtbar.',
    category: 'technik',
  },
];

const CATEGORIES = [
  { key: 'cuts', label: 'Cuts & Fleischkunde' },
  { key: 'technik', label: 'Techniken & Methoden' },
  { key: 'geraet', label: 'Geräte & Zubehör' },
  { key: 'chemie', label: 'Wissenschaft & Chemie' },
] as const;

export default function LexikonPage() {

  return (
    <>
      <Header />
      <main className="min-h-screen bg-surface-base">
        <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-14">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs font-sans text-text-muted mb-8" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-brand-gold transition-colors">Start</Link>
            <ChevronRight size={12} />
            <Link href="/wissen" className="hover:text-brand-gold transition-colors">Wissen</Link>
            <ChevronRight size={12} />
            <span>Lexikon</span>
          </nav>

          {/* Header */}
          <div className="mb-12 pb-10 border-b-2 border-text-primary">
            <p className="text-xs font-sans font-bold tracking-widest uppercase text-brand-fire mb-3">Wissensbereich</p>
            <h1 className="font-serif text-4xl font-bold text-text-primary mb-4">BBQ-Lexikon</h1>
            <p className="font-body text-text-secondary max-w-content">
              Die wichtigsten Begriffe aus der Welt des Grillens und BBQs — kurz, präzise
              und auf den Punkt erklärt. Kein Marketing-Sprech, keine überflüssigen Füllwörter.
            </p>
          </div>

          {/* Category filter (static, visual only) */}
          <div className="flex flex-wrap gap-2 mb-10">
            {CATEGORIES.map((cat) => (
              <span
                key={cat.key}
                className="text-xs font-sans font-bold tracking-wide uppercase px-3 py-1.5 bg-surface-elevated border border-border-subtle text-text-secondary"
              >
                {cat.label}
              </span>
            ))}
          </div>

          {/* Entries by category */}
          <div className="space-y-16">
            {CATEGORIES.map((cat) => {
              const entries = ENTRIES.filter((e) => e.category === cat.key).sort((a, b) =>
                a.term.localeCompare(b.term, 'de')
              );
              return (
                <section key={cat.key}>
                  <div className="border-t-2 border-text-primary pt-4 mb-8">
                    <h2 className="font-sans text-sm font-bold tracking-[0.12em] uppercase text-brand-fire">
                      {cat.label}
                    </h2>
                  </div>
                  <dl className="space-y-6">
                    {entries.map((entry) => (
                      <div key={entry.term} className="grid sm:grid-cols-[200px_1fr] gap-4 pb-6 border-b border-border-subtle">
                        <dt className="font-serif text-lg font-bold text-text-primary leading-tight">
                          {entry.term}
                        </dt>
                        <dd className="font-body text-text-secondary leading-relaxed">
                          {entry.definition}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </section>
              );
            })}
          </div>

          {/* CTA */}
          <div className="mt-16 pt-10 border-t-2 border-text-primary">
            <p className="font-sans text-sm font-bold tracking-wide uppercase text-text-secondary mb-4">
              Mehr Wissen
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/wissen/kerntemperaturen"
                className="font-sans text-sm font-bold tracking-wide uppercase text-brand-fire hover:underline"
              >
                Kerntemperaturen →
              </Link>
              <Link
                href="/kategorie/grilltechniken"
                className="font-sans text-sm font-bold tracking-wide uppercase text-brand-fire hover:underline"
              >
                Grilltechniken →
              </Link>
              <Link
                href="/kategorie/cuts"
                className="font-sans text-sm font-bold tracking-wide uppercase text-brand-fire hover:underline"
              >
                Cuts & Fleischkunde →
              </Link>
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
