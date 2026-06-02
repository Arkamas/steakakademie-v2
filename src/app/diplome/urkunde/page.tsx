'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const DIPLOMA_LEVELS = [
  { level: 1, name: 'Glut-Lehrling', emoji: '🔥' },
  { level: 2, name: 'Marinier-Meister', emoji: '🧂' },
  { level: 3, name: 'Onglet-Kenner', emoji: '🥩' },
  { level: 4, name: 'Dry-Ager', emoji: '🧊' },
  { level: 5, name: 'Flammen-Virtuose', emoji: '🎯' },
  { level: 6, name: 'Cuts-Experte', emoji: '🗺️' },
  { level: 7, name: 'Smoke-Artist', emoji: '💨' },
  { level: 8, name: 'Thermometer-Profi', emoji: '🌡️' },
  { level: 9, name: 'Wagyu-Sommelier', emoji: '🏅' },
  { level: 10, name: 'Master of Steak', emoji: '👑' },
];

type FormState = 'idle' | 'submitting' | 'success' | 'error';

export default function UrkudePage() {
  const [form, setForm] = useState({
    name: '',
    level: '',
    street: '',
    zip: '',
    city: '',
    country: 'Deutschland',
  });
  const [state, setState] = useState<FormState>('idle');

  const selected = DIPLOMA_LEVELS.find(d => d.level === Number(form.level));

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.level || !form.street || !form.zip || !form.city) return;
    setState('submitting');
    await new Promise(r => setTimeout(r, 1200));
    setState('success');
  }

  const inputClass = 'w-full bg-surface-dark border border-brand-gold/20 px-4 py-3 text-text-light text-sm font-body focus:outline-none focus:border-brand-gold/60 transition-colors placeholder:text-text-light/20';
  const labelClass = 'block text-[10px] font-sans font-bold tracking-[0.18em] uppercase text-brand-fire mb-1.5';

  return (
    <>
      <Header />
      <main className="min-h-screen bg-surface-dark">

        {/* Header */}
        <section className="border-b border-brand-gold/15">
          <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
            <nav className="flex items-center gap-1.5 text-xs font-sans text-text-light/40 mb-6" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-brand-gold transition-colors">Start</Link>
              <ChevronRight size={12} />
              <Link href="/diplome" className="hover:text-brand-gold transition-colors">Diplom-System</Link>
              <ChevronRight size={12} />
              <span className="text-text-light/65">Urkunde</span>
            </nav>
            <span className="inline-block text-[10px] font-sans font-bold tracking-[0.18em] uppercase text-brand-fire mb-4">
              Steakakademie · Physische Urkunde
            </span>
            <h1 className="font-serif text-4xl lg:text-6xl font-bold text-text-light leading-tight mb-4">
              Deine Urkunde.<br />
              <span className="text-brand-gold">Auf Papier.</span>
            </h1>
            <p className="font-body text-lg text-text-light/60 max-w-xl leading-relaxed">
              Eine echte Urkunde im Stil des 19. Jahrhunderts — mit deinem Namen
              und deinem Level. Die <strong className="text-text-light/80">digitale Urkunde ist kostenlos</strong>;
              die gedruckte, postfähige Variante kommt für 9,99 € (zzgl. 4,99 € Porto) direkt zu dir nach Hause.
            </p>
          </div>
        </section>

        {/* Preview */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative border-2 border-brand-gold/30 bg-gradient-to-br from-brand-gold/5 to-transparent p-10 md:p-16 text-center overflow-hidden"
          >
            {/* Decorative corners */}
            <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-brand-gold/30" />
            <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-brand-gold/30" />
            <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-brand-gold/30" />
            <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-brand-gold/30" />

            <p className="text-brand-gold/40 text-xs uppercase tracking-[0.3em] font-sans mb-6">
              Steakakademie · Deutschland · MMXXVI
            </p>
            <p className="text-text-light/40 text-sm font-body mb-4">Diese Urkunde bestätigt, dass</p>
            <p className="text-3xl md:text-5xl font-serif font-bold text-text-light mb-4 min-h-[1.4em]">
              {form.name || <span className="text-text-light/20 italic">Dein Name</span>}
            </p>
            <p className="text-text-light/40 text-sm font-body mb-2">die Prüfung zum</p>
            <p className="text-2xl font-serif font-bold text-brand-gold mb-6 min-h-[1.4em]">
              {selected ? `${selected.emoji} ${selected.name}` : <span className="text-text-light/20 italic">Level wählen</span>}
            </p>
            <p className="text-text-light/30 text-sm font-body mb-8">
              erfolgreich abgelegt und das Diplom-Level {form.level || '—'} der Steakakademie erreicht hat.
            </p>
            <div className="flex items-center justify-center gap-8 text-text-light/20 text-xs font-sans">
              <div className="text-center">
                <div className="w-16 border-t border-text-light/15 mb-1 mx-auto" />
                <span>Datum</span>
              </div>
              <div className="text-4xl">🥩</div>
              <div className="text-center">
                <div className="w-16 border-t border-text-light/15 mb-1 mx-auto" />
                <span>Steakakademie</span>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Order Form */}
        <section className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          {state === 'success' ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16 border border-brand-gold/20 bg-surface-elevated p-12"
            >
              <div className="text-6xl mb-6">🎉</div>
              <h2 className="font-serif text-3xl font-bold text-text-light mb-4">Urkunde bestellt!</h2>
              <p className="font-body text-text-light/60 leading-relaxed mb-4">
                Wir schicken dir deine persönliche, gedruckte Urkunde innerhalb von
                5–7 Werktagen per Post zu.
              </p>
              <p className="text-brand-gold text-sm font-sans">
                Betrag 9,99 € + 4,99 € Porto (gesamt 14,98 €) wird separat per PayPal / Überweisung angefragt.
              </p>
            </motion.div>
          ) : (
            <motion.form
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              onSubmit={handleSubmit}
              className="space-y-4 border border-brand-gold/15 bg-surface-elevated p-8"
            >
              <h2 className="font-serif text-2xl font-bold text-text-light mb-6 text-center">
                Gedruckte Urkunde bestellen — 9,99 € + 4,99 € Porto
              </h2>

              <div>
                <label className={labelClass}>Dein vollständiger Name (erscheint auf der Urkunde)</label>
                <input name="name" value={form.name} onChange={handleChange} required
                  placeholder="z. B. Max Mustermann" className={inputClass} />
              </div>

              <div>
                <label className={labelClass}>Erreichtes Diplom-Level</label>
                <select name="level" value={form.level} onChange={handleChange} required
                  className={inputClass}>
                  <option value="">Level wählen…</option>
                  {DIPLOMA_LEVELS.map(d => (
                    <option key={d.level} value={d.level}>
                      Level {d.level} — {d.emoji} {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>Straße & Hausnummer</label>
                <input name="street" value={form.street} onChange={handleChange} required
                  placeholder="Musterstraße 42" className={inputClass} />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className={labelClass}>PLZ</label>
                  <input name="zip" value={form.zip} onChange={handleChange} required
                    placeholder="12345" className={inputClass} />
                </div>
                <div className="col-span-2">
                  <label className={labelClass}>Stadt</label>
                  <input name="city" value={form.city} onChange={handleChange} required
                    placeholder="Berlin" className={inputClass} />
                </div>
              </div>

              <div>
                <label className={labelClass}>Land</label>
                <input name="country" value={form.country} onChange={handleChange} className={inputClass} />
              </div>

              <p className="text-text-light/30 text-xs font-body leading-relaxed pt-2">
                Die digitale Urkunde bleibt kostenlos. Für die gedruckte Variante nehmen wir nach dem
                Absenden Kontakt zur Zahlung auf (9,99 € + 4,99 € Porto = 14,98 €).
                Deine Adresse wird ausschließlich für den Versand verwendet.
              </p>

              <button
                type="submit"
                disabled={state === 'submitting'}
                className="w-full py-4 border border-brand-gold/50 bg-brand-gold/10 text-brand-gold font-sans font-bold tracking-[0.1em] uppercase text-sm hover:bg-brand-gold/20 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {state === 'submitting' ? 'Wird gesendet…' : 'Gedruckte Urkunde bestellen — 14,98 € →'}
              </button>
            </motion.form>
          )}
        </section>

      </main>
      <Footer />
    </>
  );
}
