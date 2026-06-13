'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { X, Flame, Check } from 'lucide-react';
import { trackEvent } from '@/components/analytics/PlausibleScript';

type State = 'idle' | 'loading' | 'success';

/**
 * Symmetrische Akzent-Leiste (oben & unten) mit dezentem Glimmer-Sweep.
 * Rahmt das Modal bewusst statt der einzelnen Linie oben; Motion respektiert
 * prefers-reduced-motion (dann nur statischer Gradient, kein Sweep).
 */
function AccentBar() {
  const reduce = useReducedMotion();
  return (
    <div className="relative h-0.5 overflow-hidden bg-gradient-to-r from-brand-fire via-brand-gold to-brand-fire">
      {!reduce && (
        <motion.div
          aria-hidden
          className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/70 to-transparent"
          initial={{ x: '-130%' }}
          animate={{ x: '330%' }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1.4 }}
        />
      )}
    </div>
  );
}

// Routes where the overlay should NOT appear
const EXCLUDED_PATHS = ['/diplome', '/diplome/simulation', '/kontakt', '/impressum', '/datenschutz', '/agb'];

export default function ExitIntent() {
  const [visible, setVisible] = useState(false);
  const [armed, setArmed] = useState(false);
  const [email, setEmail] = useState('');
  const [state, setState] = useState<State>('idle');

  useEffect(() => {
    // Check session storage — don't show twice
    if (typeof window !== 'undefined') {
      const shown = sessionStorage.getItem('sa_exit_shown');
      const currentPath = window.location.pathname;

      // Don't show on excluded paths
      if (shown || EXCLUDED_PATHS.some(p => currentPath.startsWith(p))) return;
    }

    // Arm after 15 seconds on page
    const armTimer = setTimeout(() => setArmed(true), 15_000);

    return () => clearTimeout(armTimer);
  }, []);

  useEffect(() => {
    if (!armed) return;

    function handleMouseLeave(e: MouseEvent) {
      // Only trigger when mouse leaves through the TOP of the viewport
      if (e.clientY > 10) return;
      setVisible(true);
      sessionStorage.setItem('sa_exit_shown', '1');
      document.removeEventListener('mouseleave', handleMouseLeave);
    }

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [armed]);

  // Also close on Escape
  useEffect(() => {
    if (!visible) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setVisible(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [visible]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || state !== 'idle') return;
    setState('loading');
    try {
      await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'exit-intent' }),
      });
      trackEvent('Newsletter-Anmeldung', { source: 'exit-intent' });
      setState('success');
      setTimeout(() => setVisible(false), 2500);
    } catch {
      setState('idle');
    }
  }

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setVisible(false)}
            className="fixed inset-0 bg-black/85 z-[100]"
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, y: -24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            className="fixed top-[10%] left-1/2 -translate-x-1/2 z-[101] w-full max-w-md px-4"
            role="dialog"
            aria-modal="true"
            aria-label="Bevor du gehst"
          >
            <div className="bg-surface-dark border border-brand-gold/25 shadow-[0_24px_64px_rgba(0,0,0,0.7)] overflow-hidden">

              {/* Accent line — oben */}
              <AccentBar />

              {/* Close button */}
              <button
                onClick={() => setVisible(false)}
                className="absolute top-4 right-4 text-text-muted hover:text-text-primary transition-colors"
                aria-label="Schließen"
              >
                <X size={16} />
              </button>

              <div className="p-8">
                {state === 'success' ? (
                  /* Success state */
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-4"
                  >
                    <div className="w-14 h-14 bg-brand-gold/15 border border-brand-gold/40 flex items-center justify-center mx-auto mb-4">
                      <Check size={24} className="text-brand-gold" />
                    </div>
                    <h3 className="font-serif text-xl font-bold text-text-primary mb-2">
                      Willkommen an Bord.
                    </h3>
                    <p className="text-sm font-body text-text-muted">
                      Jeden Freitag: das destillierte Wissen der besten Grillmeister der Welt.
                    </p>
                  </motion.div>
                ) : (
                  /* Capture state */
                  <>
                    {/* Icon */}
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-10 h-10 bg-brand-fire/10 border border-brand-fire/25 flex items-center justify-center shrink-0">
                        <Flame size={18} className="text-brand-fire" />
                      </div>
                      <div>
                        <p className="text-[10px] font-sans font-bold tracking-[0.18em] uppercase text-brand-fire">
                          Warte kurz
                        </p>
                        <p className="text-xs font-sans text-text-muted">
                          Bevor du gehst — das hier ist für dich:
                        </p>
                      </div>
                    </div>

                    {/* Headline */}
                    <h2 className="font-serif text-2xl font-bold text-text-primary mb-3 leading-tight">
                      Jeden Freitag: ein BBQ-Wissen,<br />das wirklich bleibt.
                    </h2>

                    {/* Value prop bullets */}
                    <ul className="space-y-2 mb-6">
                      {[
                        'Porträts der 50 besten Grillmeister der Welt',
                        'Techniken, die dein nächstes Grillen verändern',
                        'Kein Spam · Jederzeit abmeldbar · Einwilligung per Double-Opt-In',
                      ].map((item) => (
                        <li key={item} className="flex items-center gap-2 text-sm font-body text-text-secondary">
                          <div className="w-1 h-1 bg-brand-gold rounded-full shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="flex gap-2">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="deine@email.de"
                        required
                        autoFocus
                        className="flex-1 bg-surface-elevated border border-brand-gold/20 px-4 py-3 text-sm font-body text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-gold/50 transition-colors"
                      />
                      <button
                        type="submit"
                        disabled={state === 'loading'}
                        className="shrink-0 bg-brand-gold text-ink font-sans font-bold text-xs tracking-[0.1em] uppercase px-5 py-3 hover:bg-[#b07020] transition-colors disabled:opacity-50"
                      >
                        {state === 'loading' ? '…' : 'Ja'}
                      </button>
                    </form>

                    <p className="text-[10px] font-sans text-text-muted/50 leading-relaxed mt-3">
                      Anmeldung per Double-Opt-in · jederzeit abmeldbar. Mehr in der{' '}
                      <a href="/datenschutz" className="underline hover:text-text-muted">Datenschutzerklärung</a>.
                    </p>

                    <button
                      onClick={() => setVisible(false)}
                      className="w-full text-center text-[10px] font-sans text-text-muted/50 hover:text-text-muted transition-colors mt-2"
                    >
                      Nein danke, ich verpasse das lieber
                    </button>
                  </>
                )}
              </div>

              {/* Accent line — unten (Symmetrie) */}
              <AccentBar />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
