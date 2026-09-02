'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, Lock } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BadgeProgression from '@/components/diplome/BadgeProgression';
import Medal, { tierForLevel } from '@/components/diplome/Medal';
import PlattformPuls from '@/components/home/PlattformPuls';
import type { PulsData } from '@/lib/plattform-puls';

const LEVELS = [
  { id: 1,  name: 'Glut-Lehrling',      emoji: '🔥', description: 'Grundlagen des Grillens: Temperaturzonen, direktes vs. indirektes Grillen, Sicherheit.', locked: false },
  { id: 2,  name: 'Marinier-Meister',   emoji: '🧂', description: 'Die Kunst der Wuerzung: Dry Rubs, Marinaden, Salzen und Timing.', locked: false },
  { id: 3,  name: 'Onglet-Kenner',      emoji: '🥩', description: 'Cuts & Anatomie: Welche Fleischteile sind was - und warum?', locked: true },
  { id: 4,  name: 'Dry-Ager',           emoji: '🧊', description: 'Reifung & Lagerung: Wet Aging vs. Dry Aging, optimale Bedingungen.', locked: true },
  { id: 5,  name: 'Flammen-Virtuose',   emoji: '🎯', description: 'Praezisions-Grillen: Kerntemperaturen, Reverse Sear, die perfekte Kruste.', locked: true },
  { id: 6,  name: 'Cuts-Experte',       emoji: '🗺️', description: 'Weltreise der Cuts: Wagyu, Angus, Iberico - Herkunft & Eigenschaften.', locked: true },
  { id: 7,  name: 'Smoke-Artist',       emoji: '💨', description: 'Low & Slow: Smoker, Holzarten, Smoke Rings und BBQ-Wissenschaft.', locked: true },
  { id: 8,  name: 'Thermometer-Profi',  emoji: '🌡️', description: 'Die Physik des Steaks: Maillard-Reaktion, Proteinstruktur, Saftigkeit.', locked: true },
  { id: 9,  name: 'Wagyu-Sommelier',    emoji: '🏅', description: 'Premium-Klasse: Marmorierung, BMS-Score, Verkostung wie ein Profi.', locked: true },
  { id: 10, name: 'Master of Steak',    emoji: '👑', description: 'Das Abschluss-Diplom. Du kennst das Steak von der Weide bis zum Teller.', locked: true },
];

export default function DiplomeClient({ puls }: { puls?: PulsData }) {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-surface-base">

        {/* Hero -- Leather & Fire-Forge */}
        <section
          className="relative border-b border-brand-gold/20 overflow-hidden"
          style={{
            background: [
              'radial-gradient(ellipse 90% 50% at 50% 110%, rgba(200,136,42,0.10) 0%, transparent 68%)',
              'radial-gradient(ellipse 60% 35% at 50% 110%, rgba(232,80,24,0.06) 0%, transparent 55%)',
              'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.012) 3px, rgba(255,255,255,0.012) 4px)',
              'repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(255,255,255,0.005) 8px, rgba(255,255,255,0.005) 9px)',
              '#0F0A06',
            ].join(', '),
          }}
        >
          {/* Subtle forge-glow at bottom edge */}
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2/3 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(200,136,42,0.4), transparent)' }}
          />

          <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 text-center">
            {/* Breadcrumb */}
            <nav className="flex items-center justify-center gap-1.5 text-xs font-sans text-text-light/30 mb-10" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-brand-gold transition-colors">Start</Link>
              <ChevronRight size={12} />
              <span className="text-text-light/50">Diplom-System</span>
            </nav>

            {/* Kicker */}
            <p
              className="font-serif text-sm sm:text-base font-bold tracking-[0.22em] uppercase mb-5"
              style={{ color: '#C8882A' }}
            >
              Deine Reise zum Grillmeister
            </p>

            {/* Main headline */}
            <h1
              className="font-serif font-bold leading-[1.08] tracking-tight mb-7 mx-auto"
              style={{
                fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                background: 'linear-gradient(160deg, #F0E8D8 30%, #C8882A 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                maxWidth: '820px',
              }}
            >
              Vom Grillen zur Kunst &mdash;<br className="hidden sm:block" /> Erwerbe dein Meisterdiplom
            </h1>

            {/* Subtitle */}
            <p
              className="font-serif text-base sm:text-lg leading-relaxed mx-auto"
              style={{ color: 'rgba(200,136,42,0.75)', maxWidth: '560px' }}
            >
              Belege dein Fachwissen, bestehe exklusive Pruefungen und werde Teil unserer Elite.
              Eine Ausbildung in 5 praezisen Stufen.
            </p>

            {/* Decorative rule */}
            <div className="flex items-center justify-center gap-4 mt-10">
              <div className="h-px w-16 bg-brand-gold/20" />
              <div className="w-1 h-1 bg-brand-gold/40 rotate-45" />
              <div className="h-px w-16 bg-brand-gold/20" />
            </div>

            {/* Medaillen-Schaustück — 5 Medaillon-Fassungen in Reihe */}
            <div className="mt-12 mx-auto" style={{ maxWidth: 880 }}>
              <Image
                src="/images/diplome/medals-hero-v2.png"
                alt="Die Grillmeister-Medaillen — Bronze, Silber, Gold, Platin, Meister"
                width={1600}
                height={420}
                priority
                sizes="(max-width: 640px) 100vw, 880px"
                className="w-full h-auto"
              />
            </div>
          </div>
        </section>

        <BadgeProgression />

        {puls && <PlattformPuls data={puls} />}

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
                className={`border p-6 transition-[background-color,border-color,opacity] duration-300 ${
                  level.locked
                    ? 'bg-surface-card border-border-subtle opacity-50'
                    : 'bg-surface-elevated border-brand-gold/30'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="shrink-0 relative">
                    <Medal tier={tierForLevel(level.id)} level={level.id} locked={level.locked} size={60} />
                    {level.locked && (
                      <Lock size={16} className="text-text-muted absolute -bottom-1 -right-1 bg-surface-card rounded-full p-0.5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-[10px] font-sans font-bold tracking-[0.18em] uppercase text-brand-fire">
                        Level {level.id}
                      </span>
                      {!level.locked && (
                        <span className="text-[10px] bg-text-muted/15 text-text-muted px-2 py-0.5 font-sans font-bold uppercase tracking-wider">
                          In Vorbereitung
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
                      <span className="mt-3 inline-block text-xs font-sans font-medium text-text-muted">
                        Kursinhalt in Vorbereitung
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center mt-12 space-y-5 max-w-xl mx-auto">
            <Link
              href="/diplome/roadmap"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand-fire text-text-light font-sans font-bold tracking-[0.08em] uppercase text-sm hover:bg-brand-fire/90 transition duration-200 ease-out active:scale-[0.98] motion-reduce:active:scale-100"
            >
              Roadmap &mdash; Was du in jeder Stufe lernst &rarr;
            </Link>
            <p className="font-body text-text-muted text-sm">
              Erstelle dein kostenloses Konto und speichere deinen Fortschritt.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/diplome/simulation"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand-gold text-ink font-sans font-bold tracking-[0.08em] uppercase text-sm hover:bg-[#b07020] transition duration-200 ease-out active:scale-[0.98] motion-reduce:active:scale-100"
              >
                System kennenlernen &rarr;
              </Link>
              <Link
                href="/diplome/urkunde"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-brand-gold/50 text-brand-gold font-sans font-bold tracking-[0.08em] uppercase text-sm hover:bg-brand-gold/10 transition duration-200 ease-out active:scale-[0.98] motion-reduce:active:scale-100"
              >
                Urkunde per Post &mdash; 9,99 &euro; + Porto
              </Link>
              <Link
                href="/diplome/profil"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-brand-gold/50 text-brand-gold font-sans font-bold tracking-[0.08em] uppercase text-sm hover:bg-brand-gold/10 transition duration-200 ease-out active:scale-[0.98] motion-reduce:active:scale-100"
              >
                Mein Profil &amp; Vita &rarr;
              </Link>
            </div>
            <Link
              href="/manifest"
              className="inline-block text-xs font-sans text-text-muted/50 hover:text-text-muted transition-colors"
            >
              Das Steak-Manifest &rarr;
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
Diplom-System im Aufbau &mdash; Kursinhalte folgen Schritt fuer Schritt
            </p>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
