'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ChevronRight, ExternalLink } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { createClient } from '@/lib/supabase/client';

type State = 'loading' | 'anon' | 'ready' | 'saving';

function slugify(s: string) {
  return s.toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 40);
}

export default function ProfilPage() {
  const [state, setState] = useState<State>('loading');
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  const supabase = createClient();

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setState('anon'); return; }
    const { data } = await supabase.from('profiles')
      .select('slug, display_name, is_public').eq('user_id', user.id).maybeSingle();
    if (data) {
      setName(data.display_name ?? '');
      setSlug(data.slug ?? '');
      setIsPublic(!!data.is_public);
    }
    setState('ready');
  }, [supabase]);

  useEffect(() => { void load(); }, [load]);

  async function save() {
    setMsg(null);
    setState('saving');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setState('anon'); return; }
    const finalSlug = slug.trim() || slugify(name);
    const { error } = await supabase.from('profiles').upsert(
      { user_id: user.id, slug: finalSlug || null, display_name: name.trim() || null, is_public: isPublic, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' },
    );
    if (error) {
      setMsg({ text: error.code === '23505' ? 'Dieser Profil-Name (Slug) ist schon vergeben.' : 'Speichern fehlgeschlagen.', ok: false });
    } else {
      setSlug(finalSlug);
      setMsg({ text: 'Gespeichert.', ok: true });
    }
    setState('ready');
  }

  return (
    <>
      <Header />
      <main className="bg-surface-base min-h-screen">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <nav className="flex items-center gap-1.5 text-xs font-sans text-text-muted mb-6">
            <Link href="/diplome" className="hover:text-brand-gold transition-colors">Diplom-System</Link>
            <ChevronRight size={12} /><span>Mein Profil</span>
          </nav>
          <h1 className="font-serif text-3xl font-bold text-text-primary mb-2">Deine Grillmeister-Vita</h1>
          <p className="font-body text-text-secondary mb-8">
            Mach deine bestandenen Stufen öffentlich teilbar — eine eigene Profil-Seite mit deinen Medaillen.
          </p>

          {state === 'loading' && <p className="text-text-muted text-sm">Lädt…</p>}

          {state === 'anon' && (
            <div className="border border-border-subtle bg-surface-elevated p-6">
              <p className="font-body text-text-secondary mb-4">Melde dich an, um dein Profil zu verwalten und deinen Fortschritt zu speichern.</p>
              <Link href="/auth/login" className="inline-flex items-center gap-2 px-5 py-3 bg-brand-fire text-text-light font-sans font-bold uppercase text-sm tracking-[0.08em]">
                Anmelden <ChevronRight size={15} />
              </Link>
            </div>
          )}

          {(state === 'ready' || state === 'saving') && (
            <div className="space-y-5 border border-border-subtle bg-surface-elevated p-6">
              <div>
                <label className="block text-xs font-sans font-bold uppercase tracking-wide text-text-muted mb-1.5">Anzeigename</label>
                <input value={name} onChange={(e) => setName(e.target.value)} maxLength={40}
                  placeholder="z. B. Max Mustermann"
                  className="w-full px-4 py-2.5 bg-surface-base border border-border-subtle text-text-primary font-sans text-sm outline-none focus:border-brand-gold/50" />
              </div>
              <div>
                <label className="block text-xs font-sans font-bold uppercase tracking-wide text-text-muted mb-1.5">Profil-Adresse</label>
                <div className="flex items-center gap-2">
                  <span className="text-text-muted text-sm font-sans">/griller/</span>
                  <input value={slug} onChange={(e) => setSlug(slugify(e.target.value))} maxLength={40}
                    placeholder={slugify(name) || 'dein-name'}
                    className="flex-1 px-4 py-2.5 bg-surface-base border border-border-subtle text-text-primary font-sans text-sm outline-none focus:border-brand-gold/50" />
                </div>
              </div>
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} className="w-4 h-4 accent-brand-gold" />
                <span className="font-body text-sm text-text-secondary">Profil öffentlich sichtbar machen</span>
              </label>

              {msg && <p className={`text-sm font-sans ${msg.ok ? 'text-green-600' : 'text-brand-fire'}`}>{msg.text}</p>}

              <div className="flex items-center gap-3 pt-1">
                <button onClick={() => void save()} disabled={state === 'saving'}
                  className="px-6 py-3 bg-brand-gold text-ink font-sans font-bold uppercase text-sm tracking-[0.08em] disabled:opacity-50">
                  {state === 'saving' ? 'Speichert…' : 'Speichern'}
                </button>
                {isPublic && slug && (
                  <a href={`/griller/${slug}`} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-sans text-brand-gold hover:underline">
                    Profil ansehen <ExternalLink size={13} />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
