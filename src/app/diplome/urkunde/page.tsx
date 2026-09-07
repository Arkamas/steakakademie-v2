'use client';

import { useEffect, useState } from 'react';
import { m as motion } from 'framer-motion';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { createClient } from '@/lib/supabase/client';
import { LEVELS, STUFEN, stufeByNr } from '@/lib/diplome/stufen';

/**
 * Gedruckte Urkunde — Audit 06.09.2026, R5.
 *
 * Vorher: handleSubmit wartete 1,2 Sekunden, meldete „Urkunde bestellt!" und
 * tat nichts — kein Request, kein Datensatz, keine Mail. Das Level waehlte der
 * Besucher frei aus zehn Optionen, ohne Bezug zum Fortschritt.
 *
 * Jetzt: Die Bestellung geht ueber /api/kontakt (Betreff „urkunde"), wird in
 * kontaktanfragen gespeichert und per Loops an pitmaster@ zugestellt — genau
 * die Strecke, die schon fuer das Kontaktformular gilt (KAN-70, inkl.
 * Einwilligung). Bestellbar sind nur Level, deren Stufe im Konto als bestanden
 * steht; ohne Konto gibt es keine Bestellung, nur die Vorschau.
 */

type FormState = 'idle' | 'submitting' | 'success' | 'error';
type Konto = { userId: string; email: string; bestandeneStufen: Set<number> } | null | 'laedt';

const CONSENT_TEXT =
  'Ich bin einverstanden, dass meine Angaben zur Bearbeitung dieser Bestellung gespeichert und per E-Mail an die Steakakademie übermittelt werden.';

export default function UrkundePage() {
  const [form, setForm] = useState({
    name: '',
    level: '',
    street: '',
    zip: '',
    city: '',
    country: 'Deutschland',
  });
  const [consent, setConsent] = useState(false);
  const [state, setState] = useState<FormState>('idle');
  const [fehler, setFehler] = useState('');
  const [konto, setKonto] = useState<Konto>('laedt');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || cancelled) { if (!cancelled) setKonto(null); return; }
        const { data } = await supabase
          .from('course_progress')
          .select('stufe, status')
          .eq('user_id', user.id);
        const bestanden = new Set<number>(
          (data ?? []).filter((r) => r.status === 'bestanden' && typeof r.stufe === 'number').map((r) => r.stufe as number),
        );
        if (!cancelled) setKonto({ userId: user.id, email: user.email ?? '', bestandeneStufen: bestanden });
      } catch {
        if (!cancelled) setKonto(null);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const waehlbareLevel = konto && konto !== 'laedt'
    ? LEVELS.filter((l) => konto.bestandeneStufen.has(l.stufe))
    : [];
  const selected = LEVELS.find((d) => d.id === Number(form.level));
  const selectedStufe = selected ? stufeByNr(selected.stufe) : undefined;

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!konto || konto === 'laedt') return;
    if (!form.name || !form.level || !form.street || !form.zip || !form.city || !consent) return;
    if (!selected || !konto.bestandeneStufen.has(selected.stufe)) {
      setFehler('Dieses Level steht in deinem Konto nicht als bestanden.');
      setState('error');
      return;
    }
    setState('submitting');
    setFehler('');
    const message = [
      `Bestellung gedruckte Urkunde (9,99 € + 4,99 € Porto)`,
      ``,
      `Name auf der Urkunde: ${form.name}`,
      `Level: ${selected.id} — ${selected.name} (Stufe ${selected.stufe}, ${selectedStufe?.cert ?? ''})`,
      `Konto: ${konto.userId}`,
      ``,
      `Versandadresse:`,
      form.street,
      `${form.zip} ${form.city}`,
      form.country,
    ].join('\n');
    try {
      const res = await fetch('/api/kontakt', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: konto.email,
          subject: 'urkunde',
          message,
          consent: true,
          consent_text: CONSENT_TEXT,
          website: '',
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setFehler(typeof data?.error === 'string' ? data.error : 'Die Bestellung konnte nicht übermittelt werden.');
        setState('error');
        return;
      }
      setState('success');
    } catch {
      setFehler('Keine Verbindung — die Bestellung wurde nicht übermittelt.');
      setState('error');
    }
  }

  const inputClass = 'w-full bg-surface-dark border border-brand-gold/20 px-4 py-3 text-text-light text-sm font-body focus:border-brand-gold/60 transition-colors placeholder:text-text-light/20';
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
              erfolgreich abgelegt und {selectedStufe ? `das ${selectedStufe.cert}` : 'das Diplom-Level —'} der Steakakademie erreicht hat.
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

        {/* Bestellung */}
        <section className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          {konto === 'laedt' && (
            <p className="text-center text-sm font-sans text-text-light/40">Konto wird geprüft …</p>
          )}

          {konto === null && (
            <div className="text-center border border-brand-gold/20 bg-surface-elevated p-10">
              <h2 className="font-serif text-2xl font-bold text-text-light mb-3">Für die Bestellung brauchst du dein Konto</h2>
              <p className="font-body text-text-light/60 leading-relaxed mb-6 max-w-md mx-auto">
                Gedruckt wird nur, was in deinem Konto als bestanden steht. Melde dich an —
                oder fang mit Stufe 1 an, sie ist kostenlos.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link href="/auth/login?redirectTo=/diplome/urkunde" className="inline-flex items-center gap-2 px-6 py-3 bg-brand-fire text-text-light font-sans font-bold uppercase text-sm tracking-[0.08em]">
                  Anmelden <ChevronRight size={15} />
                </Link>
                <Link href="/diplome/lernen/stufe-1/grillarten" className="inline-flex items-center gap-2 px-6 py-3 border border-brand-gold/50 text-brand-gold font-sans font-bold uppercase text-sm tracking-[0.08em]">
                  Stufe 1 lesen
                </Link>
              </div>
            </div>
          )}

          {konto && konto !== 'laedt' && waehlbareLevel.length === 0 && state !== 'success' && (
            <div className="text-center border border-brand-gold/20 bg-surface-elevated p-10">
              <h2 className="font-serif text-2xl font-bold text-text-light mb-3">Noch keine bestandene Stufe</h2>
              <p className="font-body text-text-light/60 leading-relaxed mb-6 max-w-md mx-auto">
                Sobald eine Stufenprüfung in deinem Konto als bestanden steht, kannst du hier die
                gedruckte Urkunde dafür bestellen.
              </p>
              <Link href="/diplome/roadmap" className="inline-flex items-center gap-2 px-6 py-3 bg-brand-fire text-text-light font-sans font-bold uppercase text-sm tracking-[0.08em]">
                Zur Roadmap <ChevronRight size={15} />
              </Link>
            </div>
          )}

          {state === 'success' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16 border border-brand-gold/20 bg-surface-elevated p-12"
            >
              <div className="text-6xl mb-6">📬</div>
              <h2 className="font-serif text-3xl font-bold text-text-light mb-4">Bestellung ist angekommen</h2>
              <p className="font-body text-text-light/60 leading-relaxed mb-4">
                Wir melden uns per E-Mail an {konto && konto !== 'laedt' ? konto.email : 'deine Adresse'} wegen
                der Zahlung (9,99 € + 4,99 € Porto = 14,98 €). Danach geht die Urkunde in den Druck und per Post zu dir.
              </p>
            </motion.div>
          )}

          {konto && konto !== 'laedt' && waehlbareLevel.length > 0 && state !== 'success' && (
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
                <label className={labelClass}>Bestandenes Level</label>
                <select name="level" value={form.level} onChange={handleChange} required className={inputClass}>
                  <option value="">Level wählen…</option>
                  {waehlbareLevel.map((d) => (
                    <option key={d.id} value={d.id}>
                      Level {d.id} — {d.emoji} {d.name} (Stufe {d.stufe}, {STUFEN[d.stufe - 1]?.cert})
                    </option>
                  ))}
                </select>
                <p className="mt-1.5 text-[11px] font-sans text-text-light/40">
                  Angezeigt werden nur Level aus Stufen, die in deinem Konto als bestanden stehen.
                </p>
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

              <label className="flex items-start gap-3 pt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  required
                  className="mt-1 h-5 w-5 shrink-0 accent-brand-fire"
                />
                <span className="text-text-light/50 text-xs font-body leading-relaxed">{CONSENT_TEXT}</span>
              </label>

              <p className="text-text-light/30 text-xs font-body leading-relaxed">
                Die digitale Urkunde bleibt kostenlos. Für die gedruckte Variante nehmen wir nach dem
                Absenden per E-Mail Kontakt zur Zahlung auf (9,99 € + 4,99 € Porto = 14,98 €).
                Deine Adresse wird ausschließlich für den Versand verwendet.
                Gemäß § 19 UStG (Kleinunternehmerregelung) wird keine Umsatzsteuer ausgewiesen.
              </p>

              {state === 'error' && fehler && (
                <p className="text-sm font-sans text-brand-fire">{fehler}</p>
              )}

              <button
                type="submit"
                disabled={state === 'submitting' || !consent}
                className="w-full py-4 border border-brand-gold/50 bg-brand-gold/10 text-brand-gold font-sans font-bold tracking-[0.1em] uppercase text-sm hover:bg-brand-gold/20 transition-[background-color,opacity] duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
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
