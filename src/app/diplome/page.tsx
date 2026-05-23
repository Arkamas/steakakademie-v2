'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ChevronRight, Lock } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const LEVELS = [
  { id: 1, name: 'Glut-Lehrling', emoji: '🔥', description: 'Grundlagen des Grillens: Temperaturzonen, direktes vs. indirektes Grillen, Sicherheit.', locked: false },
  { id: 2, name: 'Marinier-Meister', emoji: '🧂', description: 'Die Kunst der Würzung: Dry Rubs, Marinaden, Salzen und Timing.', locked: false },
  { id: 3, name: 'Onglet-Kenner', emoji: '🥩', description: 'Cuts & Anatomie: Welche Fleischteile sind was — und warum?', locked: true },
  { id: 4, name: 'Dry-Ager', emoji: '🧊', description: 'Reifung & Lagerung: Wet Aging vs. Dry Aging, optimale Bedingungen.', locked: true },
  { id: 5, name: 'Flammen-Virtuose', emoji: '🎯', description: 'Präzisions-Grillen: Kerntemperaturen, Reverse Sear, die perfekte Kruste.', locked: true },
  { id: 6, name: 'Cuts-Experte', emoji: '🗺️', description: 'Weltreise der Cuts: Wagyu, Angus, Iberico — Herkunft & Eigenschaften.', locked: true },
  { id: 7, name: 'Smoke-Artist', emoji: '💨', description: 'Low & Slow: Smoker, Holzarten, Smoke Rings und BBQ-Wissenschaft.', locked: true },
  { id: 8, name: 'Thermometer-Profi', emoji: '🌡️', description: 'Die Physik des Steaks: Maillard-Reaktion, Proteinstruktur, Saftigkeit.', locked: true },
  { id: 9, name: 'Wagyu-Sommelier', emoji: '🏅', description: 'Premium-Klasse: Marmorierung, BMS-Score, Verkostung wie ein Profi.', locked: true },
  { id: 10, name: 'Master of Steak', emoji: '👑', description: 'Das Abschluss-Diplom. Du kennst das Steak von der Weide bis zum Teller.', locked: true },
];

export default function DiplomePage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-surface-base">

        {/* Header */}
        <section className="bg-surface-dark border-b border-brand-gold/15">
          <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
            <nav className="flex items-center gap-1.5 text-xs font-sans text-text-light/40 mb-6" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-brand-gold transition-colors">Start</Link>
              <ChevronRight size={12} />
              <span className="text-text-light/65">Diplom-System</span>
            </nav>
            <div className="max-w-2xl">
              <span className="inline-block text-[10px] font-sans font-bold tracking-[0.18em] uppercase text-brand-fire mb-4">
                Steakakademie · Diplom-System
              </span>
              <h1 className="font-serif text-4xl lg:text-5xl font-bold text-text-light leading-tight mb-4">
                Das Steak-Diplom
              </h1>
              <p className="font-body text-lg text-text-light/70 leading-relaxed">
                10 Level. Von Glut-Lehrling bis Master of Steak.
                Jede Stufe macht dich besser am Rost.
              </p>
            </div>
          </div>
        </section>

        {/* Level Grid */}
        <section className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {LEVELS.map((level, index) => (
              <motion.div
                key={level.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.04, duration: 0.35 }}
                className={`border p-6 transition-all duration-300 ${
                  level.locked
                    ? 'bg-surface-card border-border-subtle opacity-50'
                    : 'bg-surface-elevated border-brand-gold/30 hover:border-brand-gold/60 cursor-pointer'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="text-4xl shrink-0">
                    {level.locked ? <Lock size={28} className="text-text-muted mt-1" /> : level.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-[10px] font-sans font-bold tracking-[0.18em] uppercase text-brand-fire">
                        Level {level.id}
                      </span>
                      {!level.locked && (
                        <span className="text-[10px] bg-brand-gold/15 text-brand-gold px-2 py-0.5 font-sans font-bold uppercase tracking-wider">
                          Verfügbar
                        </span>
                      )}
                    </div>
                    <h3 className="font-serif text-lg font-bold text-text-primary mb-1">
                      {level.name}
                    </h3>
                    <p className="text-sm font-body text-text-secondary leading-relaxed">
                      {level.description}
                    </p>
                    {!level.locked && (
                      <button className="mt-3 text-sm font-sans font-medium text-brand-gold hover:text-brand-fire transition-colors">
                        Jetzt starten →
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center mt-12 space-y-5 max-w-xl mx-auto">
            <p className="font-body text-text-muted text-sm">
              Erstelle dein kostenloses Konto und speichere deinen Fortschritt.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/diplome/simulation"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand-gold text-ink font-sans font-bold tracking-[0.08em] uppercase text-sm hover:bg-[#b07020] transition-colors"
              >
                🎓 System kennenlernen →
              </Link>
              <Link
                href="/diplome/urkunde"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-brand-gold/50 text-brand-gold font-sans font-bold tracking-[0.08em] uppercase text-sm hover:bg-brand-gold/10 transition-colors"
              >
                📜 Urkunde per Post — 3 €
              </Link>
            </div>
            <Link
              href="/manifest"
              className="inline-block text-xs font-sans text-text-muted/50 hover:text-text-muted transition-colors"
            >
              Das Steak-Manifest →
            </Link>
          </div>
        </section>

        {/* Progression visual */}
        <section className="border-t border-border-subtle py-14 px-4 bg-surface-dark">
          <div className="max-w-editorial mx-auto text-center">
            <span className="inline-block text-[10px] font-sans font-bold tracking-[0.18em] uppercase text-brand-fire mb-4">
              Der Weg nach oben
            </span>
            <h2 className="font-serif text-2xl font-bold text-text-light mb-3">
              Systematisch. Zertifiziert. Unvergesslich.
            </h2>
            <p className="font-body text-text-light/60 text-sm max-w-md mx-auto leading-relaxed mb-10">
              Jedes Level baut auf dem vorherigen auf. Am Ende kennst du das Steak
              von der Weide bis zum perfekten Bissen.
            </p>
            <div className="flex items-center justify-center gap-0 flex-wrap max-w-3xl mx-auto">
              {LEVELS.map((level, i) => (
                <div key={level.id} className="flex items-center">
                  <div className={`w-9 h-9 flex items-center justify-center text-sm border transition-colors ${
                    !level.locked
                      ? 'border-brand-gold bg-brand-gold/20 text-brand-gold'
                      : 'border-brand-gold/15 bg-transparent text-text-light/20'
                  }`}>
                    {level.id}
                  </div>
                  {i < LEVELS.length - 1 && (
                    <div className={`w-4 h-px ${!level.locked ? 'bg-brand-gold/40' : 'bg-brand-gold/10'}`} />
                  )}
                </div>
              ))}
            </div>
            <p className="text-text-light/30 text-xs font-sans mt-4">
              2 von 10 Levels freigeschaltet — weitere folgen
            </p>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
