'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { User } from 'lucide-react';

// Auth-bewusster Nav-Link: "Anmelden" (ausgeloggt) bzw. "Mein Konto" (eingeloggt).
//
// Der Supabase-Client wird per dynamischem Import geladen (Perf-Audit
// 02.09.2026): Der Header liegt auf jeder Seite, und mit ihm lagen vorher
// ~63 kB (komprimiert) supabase-js im First-Load-Bundle — nur um ein Wort im
// Menü zu bestimmen. Jetzt kommt der Client als eigener Chunk nach der
// Hydration; bis dahin steht "Anmelden", was für jeden Nicht-Eingeloggten
// ohnehin richtig ist.
export default function AccountLink({ mobile = false }: { mobile?: boolean }) {
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    // Kein Supabase-Session-Cookie (sb-<ref>-auth-token) → niemand ist
    // eingeloggt, und die ~47 kB supabase-js muessen gar nicht erst geladen
    // werden. Das trifft auf praktisch jeden anonymen Besucher zu. Der Cookie
    // wird von @supabase/ssr gesetzt (Login-Callback, Middleware-Refresh).
    if (!/(^|;\s*)sb-[^=;]*-auth-token(\.\d+)?=/.test(document.cookie)) {
      setAuthed(false);
      return;
    }
    let active = true;
    let unsubscribe: (() => void) | undefined;
    import('@/lib/supabase/client').then(({ createClient }) => {
      if (!active) return;
      const supabase = createClient();
      supabase.auth.getUser().then(({ data }) => { if (active) setAuthed(!!data.user); }).catch(() => {});
      const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => setAuthed(!!session?.user));
      unsubscribe = () => sub.subscription.unsubscribe();
    }).catch(() => {});
    return () => { active = false; unsubscribe?.(); };
  }, []);

  const href = authed ? '/diplome/profil' : '/auth/login';
  const label = authed ? 'Mein Konto' : 'Anmelden';

  if (mobile) {
    return (
      <Link href={href} className="flex items-center gap-2 text-sm font-sans font-semibold text-text-light/60 hover:text-brand-gold transition-colors">
        <User size={15} /> {label}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className="hidden sm:flex items-center gap-1.5 text-[11px] font-sans font-bold tracking-[0.12em] uppercase text-white hover:text-brand-gold transition-colors px-2"
    >
      <User size={13} /> {label}
    </Link>
  );
}
