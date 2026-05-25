'use client';

import { useState }       from 'react';
import Link               from 'next/link';
import { useSearchParams } from 'next/navigation';
import { createClient }   from '@/lib/supabase/client';
import { ArrowRight, Mail, Flame } from 'lucide-react';

export default function LoginPage() {
  const searchParams = useSearchParams();
  const redirectTo   = searchParams.get('redirectTo') ?? '/profil';
  const urlError     = searchParams.get('error');

  const [email,   setEmail]   = useState('');
  const [status,  setStatus]  = useState<'idle' | 'loading' | 'sent' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus('loading');
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${redirectTo}`,
      },
    });

    if (error) {
      setStatus('error');
      setMessage(error.message);
    } else {
      setStatus('sent');
    }
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'radial-gradient(circle at center, #2D2218 0%, #120C07 100%)' }}
    >
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <Flame size={28} className="text-brand-fire" />
            <span className="font-serif text-xl font-bold text-text-light">
              Steakakademie
            </span>
          </Link>
          <p className="font-sans text-xs text-text-muted mt-2 uppercase tracking-widest">
            Mitglieder-Login
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-sm border p-6"
          style={{
            borderColor: 'rgba(200,136,42,0.22)',
            background:  '#1E1410',
          }}
        >
          {status === 'sent' ? (

            /* ── Bestätigung ── */
            <div className="text-center py-4 space-y-3">
              <div
                className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-2"
                style={{ background: 'rgba(200,136,42,0.15)', border: '1px solid rgba(200,136,42,0.3)' }}
              >
                <Mail size={22} className="text-brand-gold" />
              </div>
              <h1 className="font-serif text-xl font-bold text-text-light">
                E-Mail unterwegs
              </h1>
              <p className="font-body text-sm text-text-secondary leading-relaxed">
                Wir haben einen Anmelde-Link an{' '}
                <strong className="text-text-light">{email}</strong> geschickt.
                Klick auf den Link — kein Passwort nötig.
              </p>
              <button
                onClick={() => setStatus('idle')}
                className="font-sans text-xs text-brand-gold hover:text-text-light transition-colors mt-2"
              >
                Andere E-Mail verwenden
              </button>
            </div>

          ) : (

            /* ── Formular ── */
            <>
              <h1 className="font-serif text-xl font-bold text-text-light mb-1">
                Willkommen zurück
              </h1>
              <p className="font-body text-sm text-text-secondary mb-6">
                Gib deine E-Mail-Adresse ein. Wir schicken dir einen
                Magic Link — kein Passwort nötig.
              </p>

              {(urlError || status === 'error') && (
                <div
                  className="mb-4 px-4 py-3 rounded-sm border text-sm font-sans"
                  style={{ borderColor: 'rgba(232,80,24,0.4)', background: 'rgba(232,80,24,0.08)', color: '#E85018' }}
                >
                  {message || 'Anmeldung fehlgeschlagen — bitte erneut versuchen.'}
                </div>
              )}

              <form onSubmit={handleMagicLink} className="space-y-4">
                <div>
                  <label
                    htmlFor="email"
                    className="font-sans text-xs font-bold uppercase tracking-wider text-text-muted block mb-2"
                  >
                    E-Mail-Adresse
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="deine@email.de"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-sm font-sans text-sm text-text-light placeholder:text-text-muted outline-none transition-all"
                    style={{
                      background:   '#120C07',
                      border:       '1px solid rgba(58,42,30,0.9)',
                    }}
                    onFocus={e  => e.target.style.borderColor = '#C8882A'}
                    onBlur={e   => e.target.style.borderColor = 'rgba(58,42,30,0.9)'}
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === 'loading' || !email.trim()}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 font-sans font-bold text-sm text-white rounded-sm transition-opacity disabled:opacity-50"
                  style={{ background: '#E85018' }}
                >
                  {status === 'loading' ? 'Wird gesendet …' : 'Magic Link senden'}
                  {status !== 'loading' && <ArrowRight size={14} />}
                </button>
              </form>

              <p className="font-sans text-xs text-text-muted text-center mt-5">
                Noch kein Konto?{' '}
                <Link href="/auth/register" className="text-brand-gold hover:text-text-light transition-colors">
                  Jetzt registrieren
                </Link>
              </p>
            </>

          )}
        </div>

        <p className="font-sans text-xs text-text-muted text-center mt-6">
          <Link href="/" className="hover:text-brand-gold transition-colors">
            ← Zurück zur Startseite
          </Link>
        </p>
      </div>
    </main>
  );
}
