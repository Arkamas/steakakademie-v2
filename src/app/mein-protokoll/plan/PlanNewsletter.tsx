'use client';

import { useState } from 'react';
import { CalendarClock, Check } from 'lucide-react';
import { trackEvent } from '@/components/analytics/PlausibleScript';

type State = 'idle' | 'loading' | 'success' | 'error';

export default function PlanNewsletter() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<State>('idle');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || state === 'loading') return;
    setState('loading');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'mein-protokoll-plan' }),
      });
      if (res.ok) trackEvent('Newsletter-Anmeldung', { source: 'mein-protokoll-plan' });
      setState(res.ok ? 'success' : 'error');
    } catch {
      setState('error');
    }
  }

  if (state === 'success') {
    return (
      <div className="print:hidden border border-brand-gold/20 bg-surface-elevated p-6 text-center my-8">
        <div className="w-10 h-10 bg-brand-gold/15 flex items-center justify-center mx-auto mb-3">
          <Check size={18} className="text-brand-gold" />
        </div>
        <p className="font-serif font-bold text-text-primary mb-1">Eingetragen.</p>
        <p className="text-xs font-body text-text-muted">
          Montags kommt deine Wochen-Erinnerung. Bestätige noch kurz die E-Mail in deinem Postfach.
        </p>
      </div>
    );
  }

  return (
    <aside className="print:hidden border border-brand-gold/15 bg-surface-elevated p-6 my-8" aria-label="Wochenstart-Erinnerung">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 bg-brand-fire/10 border border-brand-fire/25 flex items-center justify-center shrink-0">
          <CalendarClock size={16} className="text-brand-fire" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-sans font-bold tracking-[0.18em] uppercase text-brand-fire mb-1">
            Wochenstart-Erinnerung
          </p>
          <p className="font-serif font-bold text-text-primary text-base mb-1.5 leading-snug">
            Damit du jede Woche dranbleibst.
          </p>
          <p className="text-xs font-body text-text-muted leading-relaxed mb-4">
            Jeden Montag eine kurze Erinnerung mit dem Wochenthema, einem Tipp zum Cut
            und der einen Frage, die dich scharf macht. Kein Spam — nur die Dinge, die diese Woche zählen.
          </p>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="deine@email.de"
              required
              className="flex-1 min-w-0 bg-surface-dark border border-brand-gold/20 px-3 py-2 text-sm font-body text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-gold/50 transition-colors"
            />
            <button
              type="submit"
              disabled={state === 'loading'}
              className="shrink-0 bg-brand-gold text-ink font-sans text-xs font-bold tracking-[0.1em] uppercase px-4 py-2 hover:bg-[#b07020] transition-colors disabled:opacity-40"
            >
              {state === 'loading' ? '…' : 'Aktivieren'}
            </button>
          </form>
          {state === 'error' && (
            <p className="text-xs text-brand-fire mt-2">Fehler — bitte nochmal versuchen.</p>
          )}
          <p className="text-[10px] font-sans text-text-muted/60 mt-2">
            Kostenlos · Jederzeit abmeldbar · Keine Weitergabe
          </p>
        </div>
      </div>
    </aside>
  );
}
