'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { User } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

// Auth-bewusster Nav-Link: "Anmelden" (ausgeloggt) bzw. "Mein Konto" (eingeloggt).
export default function AccountLink({ mobile = false }: { mobile?: boolean }) {
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createClient();
    let active = true;
    supabase.auth.getUser().then(({ data }) => { if (active) setAuthed(!!data.user); }).catch(() => {});
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => setAuthed(!!session?.user));
    return () => { active = false; sub.subscription.unsubscribe(); };
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
