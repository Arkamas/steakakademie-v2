'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ImagePlus, Loader2 } from 'lucide-react';

export default function GenerateImageButton({ slug }: { slug: string }) {
  const router = useRouter();
  const [state, setState] = useState<'idle' | 'loading' | 'error'>('idle');
  const [msg, setMsg] = useState('');

  async function generate() {
    setState('loading');
    setMsg('');
    try {
      const res = await fetch('/api/rezept-bild', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) {
        setState('error');
        setMsg('Bitte melde dich an, um ein Bild zu generieren.');
        return;
      }
      if (!res.ok) {
        setState('error');
        setMsg(data.error ?? 'Bildgenerierung fehlgeschlagen.');
        return;
      }
      // Erfolg → Seite neu laden, Bild erscheint
      router.refresh();
    } catch {
      setState('error');
      setMsg('Netzwerkfehler — bitte später erneut.');
    }
  }

  return (
    <div className="mb-10 border border-dashed border-brand-gold/30 bg-surface-elevated p-6 text-center">
      <p className="font-body text-sm text-text-secondary mb-4">
        Noch kein Bild für dieses Rezept. Lass eines von der KI erstellen — markenkonform, in Sekunden.
      </p>
      <button
        onClick={generate}
        disabled={state === 'loading'}
        className="inline-flex items-center gap-2 px-6 py-3 bg-brand-gold text-ink font-sans font-bold text-xs tracking-[0.12em] uppercase disabled:opacity-60 transition duration-150 ease-out active:scale-[0.98] motion-reduce:active:scale-100 disabled:active:scale-100"
      >
        {state === 'loading'
          ? <><Loader2 size={14} className="animate-spin motion-reduce:animate-none" /> Wird erstellt…</>
          : <><ImagePlus size={14} /> Bild generieren</>}
      </button>
      {state === 'error' && <p className="text-xs font-sans text-brand-fire mt-3">{msg}</p>}
      {state === 'loading' && <p className="text-[11px] font-sans text-text-muted mt-3">Das dauert ~15–30 Sekunden. Bitte nicht schließen.</p>}
    </div>
  );
}
