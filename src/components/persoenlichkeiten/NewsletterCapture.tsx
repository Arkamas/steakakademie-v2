'use client';

import { useState } from 'react';
import { Flame, Check } from 'lucide-react';
import { trackEvent } from '@/components/analytics/PlausibleScript';

type State = 'idle' | 'loading' | 'success' | 'error';

interface NewsletterCaptureProps {
  context?: string; // topic context for personalized copy
}

export default function NewsletterCapture({ context = 'BBQ-Meister' }: NewsletterCaptureProps) {
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
        body: JSON.stringify({ email, source: `persoenlichkeiten-article-${context}` }),
      });
      if (res.ok) trackEvent('Newsletter-Anmeldung', { source: context });
      setState(res.ok ? 'success' : 'error');
    } catch {
      setState('error');
    }
  }

  if (state === 'success') {
    return (
      <div className="border border-brand-gold/20 bg-surface-elevated p-6 text-center not-prose my-8">
        <div className="w-10 h-10 bg-brand-gold/15 flex items-center justify-center mx-auto mb-3">
          <Check size={18} className="text-brand-gold" />
        </div>
        <p className="font-serif font-bold text-text-primary mb-1">Dabei.</p>
        <p className="text-xs font-body text-text-muted">
          Jeden Freitag: ein Meister, eine Technik, ein Rezept.
        </p>
      </div>
    );
  }

  return (
    <aside className="border border-brand-gold/15 bg-surface-elevated p-6 not-prose my-8" aria-label="Newsletter">

      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="w-10 h-10 bg-brand-fire/10 border border-brand-fire/25 flex items-center justify-center shrink-0">
          <Flame size={16} className="text-brand-fire" />
        </div>

        <div className="flex-1 min-w-0">
          {/* Label */}
          <p className="text-[10px] font-sans font-bold tracking-[0.18em] uppercase text-brand-fire mb-1">
            Steakakademie · Wissens-Brief
          </p>

          {/* Headline — reciprocity trigger: free value, no hype */}
          <p className="font-serif font-bold text-text-primary text-base mb-1.5 leading-snug">
            Jeden Freitag: ein {context}-Wissen, das bleibt.
          </p>
          <p className="text-xs font-body text-text-muted leading-relaxed mb-4">
            Kein Newsletter-Spam. Nur das Destillat aus 50 Meister-Profilen,
            Techniken und Kerntemperatur-Wissen — direkt ins Postfach.
          </p>

          {/* Form */}
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
              {state === 'loading' ? '…' : 'Dabei sein'}
            </button>
          </form>

          {state === 'error' && (
            <p className="text-xs text-brand-fire mt-2">Fehler — bitte nochmal versuchen.</p>
          )}

          <p className="text-[10px] font-sans text-text-muted/60 mt-2">
            Kostenlos · Jederzeit abmeldbar · Kein Weitergabe
          </p>
        </div>
      </div>
    </aside>
  );
}
