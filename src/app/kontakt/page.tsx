'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Mail, MessageSquare, Award } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

type FormState = 'idle' | 'sending' | 'sent' | 'error';

const CONTACT_OPTIONS = [
  {
    icon: MessageSquare,
    title: 'Frage zum Diplom-System',
    desc: 'Hilfe bei Levels, Freischaltung oder Urkunden.',
    mailto: 'masterclass@steakakademie.de',
    label: 'masterclass@steakakademie.de',
  },
  {
    icon: Mail,
    title: 'Allgemeiner Kontakt',
    desc: 'Feedback, Ideen, Kooperationen, Presse.',
    mailto: 'info@steakakademie.de',
    label: 'info@steakakademie.de',
  },
  {
    icon: Award,
    title: 'Rezept-Idee einreichen',
    desc: 'Du hast ein BBQ-Rezept das die Welt kennen muss?',
    mailto: 'inspiration@steakakademie.de',
    label: 'inspiration@steakakademie.de',
  },
];

export default function KontaktPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [state, setState] = useState<FormState>('idle');

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setState('sending');
    // Formspree / Loops / mailto fallback — für jetzt: simuliert
    await new Promise(r => setTimeout(r, 1000));
    setState('sent');
  }

  const inputClass = 'w-full bg-surface-dark border border-brand-gold/20 px-4 py-3 text-text-primary text-sm font-body focus:outline-none focus:border-brand-gold/50 transition-colors placeholder:text-text-muted';
  const labelClass = 'block text-[10px] font-sans font-bold tracking-[0.18em] uppercase text-brand-fire mb-1.5';

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
              <span className="text-text-light/65">Kontakt</span>
            </nav>
            <span className="inline-block text-[10px] font-sans font-bold tracking-[0.18em] uppercase text-brand-fire mb-4">
              Steakakademie · Kontakt
            </span>
            <h1 className="font-serif text-4xl lg:text-5xl font-bold text-text-light leading-tight mb-4">
              Schreib uns.
            </h1>
            <p className="font-body text-lg text-text-light/60 max-w-xl leading-relaxed">
              Fragen, Ideen, Feedback — wir antworten persönlich.
              Kein Bot, kein Callcenter.
            </p>
          </div>
        </section>

        {/* Direct email options */}
        <section className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            {CONTACT_OPTIONS.map(opt => (
              <a
                key={opt.mailto}
                href={`mailto:${opt.mailto}`}
                className="group block border border-brand-gold/15 bg-surface-elevated p-6 hover:border-brand-gold/40 transition-all"
              >
                <opt.icon size={20} className="text-brand-gold mb-3" />
                <h3 className="font-serif font-bold text-text-primary mb-1 group-hover:text-brand-gold transition-colors">
                  {opt.title}
                </h3>
                <p className="text-xs font-body text-text-muted mb-3 leading-relaxed">{opt.desc}</p>
                <span className="text-xs font-sans text-brand-gold/70">{opt.label}</span>
              </a>
            ))}
          </div>

          {/* Contact form */}
          <div className="max-w-xl mx-auto">
            <h2 className="font-serif text-2xl font-bold text-text-primary mb-6 text-center">
              Oder Formular nutzen
            </h2>

            {state === 'sent' ? (
              <div className="text-center py-16 border border-brand-gold/20 bg-surface-elevated">
                <div className="text-6xl mb-4">🔥</div>
                <h3 className="font-serif text-2xl font-bold text-text-primary mb-2">Nachricht gesendet!</h3>
                <p className="text-text-muted font-body text-sm">
                  Wir melden uns innerhalb von 24–48 Stunden bei dir.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="border border-brand-gold/15 bg-surface-elevated p-8 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Name</label>
                    <input name="name" value={form.name} onChange={handleChange} required
                      placeholder="Max Mustermann" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>E-Mail</label>
                    <input name="email" type="email" value={form.email} onChange={handleChange} required
                      placeholder="max@example.de" className={inputClass} />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Betreff</label>
                  <select name="subject" value={form.subject} onChange={handleChange} className={inputClass}>
                    <option value="">Bitte wählen…</option>
                    <option value="diplom">Frage zum Diplom-System</option>
                    <option value="rezept">Rezept-Idee einreichen</option>
                    <option value="kooperation">Kooperationsanfrage</option>
                    <option value="feedback">Feedback zur Website</option>
                    <option value="presse">Presse / Media</option>
                    <option value="sonstiges">Sonstiges</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Nachricht</label>
                  <textarea name="message" value={form.message} onChange={handleChange} required
                    rows={5} placeholder="Deine Nachricht…"
                    className={`${inputClass} resize-none`} />
                </div>

                <p className="text-text-muted text-xs font-body leading-relaxed">
                  Deine Daten werden ausschließlich zur Beantwortung deiner Anfrage verwendet.
                  Weitere Infos in der{' '}
                  <Link href="/datenschutz" className="text-brand-gold hover:underline">Datenschutzerklärung</Link>.
                </p>

                <button
                  type="submit"
                  disabled={state === 'sending'}
                  className="w-full py-4 border border-brand-gold/50 bg-brand-gold/10 text-brand-gold font-sans font-bold tracking-[0.1em] uppercase text-sm hover:bg-brand-gold/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {state === 'sending' ? 'Wird gesendet…' : 'Nachricht senden →'}
                </button>
              </form>
            )}
          </div>
        </section>

        {/* Marco Widget hint */}
        <section className="border-t border-border-subtle py-12 px-4 text-center bg-surface-dark">
          <p className="text-text-light/40 text-sm font-sans mb-3">
            Sofortantwort gewünscht?
          </p>
          <p className="font-body text-text-light/60 text-sm max-w-md mx-auto">
            Marco — unser KI-Guide — beantwortet Fragen zu Cuts, Kerntemperaturen und
            Techniken rund um die Uhr. Unten rechts auf der Seite.
          </p>
        </section>

      </main>
      <Footer />
    </>
  );
}
