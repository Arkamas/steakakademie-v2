'use client';

/**
 * Drei Werkzeug-Boxen im Head-Bereich der Startseite (User-Magnete):
 *   🔥 Cut-Generator · 🧪 Foodpairing · 🍳 Rezept-Schmiede (⭐-Stufen)
 *
 * „Jetzt mit Fallback": Foodpairing & Rezept-Schmiede rufen ihre Endpoints
 * (/api/foodpairing, /api/kochwissen/generieren) live auf. Solange die
 * Wissens-DB / Keys noch nicht scharf sind, fangen wir das sauber ab und
 * zeigen einen Demo-/„Bald verfügbar"-Zustand — nichts wirkt kaputt.
 */

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Flame, FlaskConical, ChefHat, ChevronRight, Search, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type Pairing = { partner: string; category: string | null; shared: number; shared_examples: string[] | null };

// Demo-Vorschau (verifizierte Aroma-Molekülbrücken aus foods-oa), bis die DB live ist.
const DEMO_PAIRINGS: Pairing[] = [
  { partner: 'Kaffee', category: 'geröstet', shared: 7, shared_examples: ['2-Methyl-3-furanthiol', 'Pyrazine'] },
  { partner: 'Kakao', category: 'geröstet', shared: 6, shared_examples: ['Pyrazine', 'Strecker-Aldehyde'] },
  { partner: 'Champignon', category: 'Gemüse', shared: 5, shared_examples: ['1-Octen-3-ol'] },
  { partner: 'Thunfisch', category: 'Fisch', shared: 4, shared_examples: ['2-Methyl-3-furanthiol'] },
  { partner: 'Röstzwiebel', category: 'Gemüse', shared: 4, shared_examples: ['Pyrazine'] },
];

function Bar({ value, max }: { value: number; max: number }) {
  const pct = Math.max(8, Math.round((value / max) * 100));
  return (
    <span className="inline-block h-1.5 rounded-full bg-brand-gold/80" style={{ width: `${pct}%` }} aria-hidden />
  );
}

function FoodpairingBox({ onSeedRezept }: { onSeedRezept: (zutat: string, partner: string) => void }) {
  const [zutat, setZutat] = useState('');
  const [treffer, setTreffer] = useState<Pairing[] | null>(null);
  const [demo, setDemo] = useState(false);
  const [loading, setLoading] = useState(false);

  async function suchen(e: React.FormEvent) {
    e.preventDefault();
    const q = zutat.trim();
    if (!q) return;
    setLoading(true);
    setTreffer(null);
    setDemo(false);
    try {
      const res = await fetch('/api/foodpairing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zutat: q, limit: 6 }),
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data.treffer) && data.treffer.length) {
        setTreffer(data.treffer);
      } else {
        setTreffer(DEMO_PAIRINGS);
        setDemo(true);
      }
    } catch {
      setTreffer(DEMO_PAIRINGS);
      setDemo(true);
    } finally {
      setLoading(false);
    }
  }

  const max = treffer?.reduce((m, t) => Math.max(m, t.shared), 1) ?? 1;

  return (
    <div className="flex flex-col rounded-xl border border-brand-gold/25 bg-surface-card p-5">
      <div className="flex items-center gap-2 mb-1.5 text-brand-fire">
        <FlaskConical size={18} />
        <h3 className="font-serif text-lg font-bold text-text-light">Foodpairing</h3>
      </div>
      <p className="text-xs text-text-secondary mb-3">Welche Aromen passen zusammen? Wissenschaftlich, über geteilte Moleküle.</p>

      <form onSubmit={suchen} className="flex gap-2">
        <input
          value={zutat}
          onChange={(e) => setZutat(e.target.value)}
          placeholder="z. B. Ribeye"
          className="flex-1 min-w-0 rounded-lg border border-border-subtle bg-surface-base px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-gold focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-1 rounded-lg bg-brand-fire px-3 py-2 text-xs font-bold uppercase tracking-wide text-ink hover:opacity-90 disabled:opacity-50"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />} Finden
        </button>
      </form>

      {treffer && (
        <div className="mt-4 space-y-2">
          {demo && (
            <p className="text-[11px] text-text-muted italic">Vorschau-Beispiel — die Live-Datenbank wird gerade scharfgeschaltet.</p>
          )}
          {treffer.map((t) => (
            <div key={t.partner} className="text-sm">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-text-light font-medium">{t.partner}</span>
                <button
                  type="button"
                  onClick={() => onSeedRezept(zutat, t.partner)}
                  className="shrink-0 text-[10px] font-bold uppercase tracking-wide text-brand-gold hover:text-brand-fire"
                  title={`Rezept: ${zutat} mit ${t.partner}`}
                >
                  → Rezept
                </button>
              </div>
              <Bar value={t.shared} max={max} />
              <p className="text-[11px] text-text-muted truncate">
                {t.shared} Moleküle{t.shared_examples?.length ? ` · ${t.shared_examples.join(', ')}` : ''}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const NIVEAUS = [
  { n: 1, label: '⭐ Einsteiger' },
  { n: 2, label: '⭐⭐ Fortgeschritten' },
  { n: 3, label: '⭐⭐⭐ Profi' },
] as const;

function RezeptSchmiedeBox({ seed }: { seed: { auftrag: string; nonce: number } | null }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [auftrag, setAuftrag] = useState('');
  const [niveau, setNiveau] = useState<1 | 2 | 3>(2);
  const [ergebnis, setErgebnis] = useState<string | null>(null);
  const [hinweis, setHinweis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  // Live-Sekundenzähler während der Generierung — beruhigt und setzt die Erwartung,
  // damit niemand vorzeitig abbricht.
  useEffect(() => {
    if (!loading) return;
    setElapsed(0);
    const t = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [loading]);

  async function generate(text: string) {
    const q = text.trim();
    if (!q) return;
    setLoading(true);
    setErgebnis(null);
    setHinweis(null);
    try {
      const res = await fetch('/api/kochwissen/generieren', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auftrag: q, niveau, art: 'rezept' }),
      });
      const data = await res.json();
      if (res.ok && data.ergebnis) {
        setErgebnis(data.ergebnis);
      } else {
        setHinweis('Die Rezept-Schmiede wird gerade scharfgeschaltet — gleich kannst du hier aus geprüftem Wissen Rezepte erzeugen.');
      }
    } catch {
      setHinweis('Die Rezept-Schmiede wird gerade scharfgeschaltet — gleich kannst du hier aus geprüftem Wissen Rezepte erzeugen.');
    } finally {
      setLoading(false);
    }
  }

  function erstellen(e: React.FormEvent) {
    e.preventDefault();
    generate(auftrag);
  }

  // Verkettung: eine Vorgabe aus der Foodpairing-Box füllt das Feld und erzeugt
  // direkt ein Rezept — der Loop Aroma → Gericht.
  useEffect(() => {
    if (!seed) return;
    setAuftrag(seed.auftrag);
    boxRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    generate(seed.auftrag);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed?.nonce]);

  return (
    <div ref={boxRef} className="flex flex-col rounded-xl border border-brand-gold/25 bg-surface-card p-5">
      <div className="flex items-center gap-2 mb-1.5 text-brand-fire">
        <ChefHat size={18} />
        <h3 className="font-serif text-lg font-bold text-text-light">Rezept-Schmiede</h3>
      </div>
      <p className="text-xs text-text-secondary mb-3">Rezept aus geprüftem Wissen — in deinem Schwierigkeitsgrad.</p>

      <div className="flex gap-1.5 mb-2">
        {NIVEAUS.map(({ n, label }) => (
          <button
            key={n}
            type="button"
            onClick={() => setNiveau(n as 1 | 2 | 3)}
            className={`flex-1 rounded-md px-1 py-1.5 text-[11px] font-bold transition-colors ${
              niveau === n ? 'bg-brand-gold text-ink' : 'bg-surface-base text-text-muted hover:text-text-secondary'
            }`}
            title={label}
          >
            {'⭐'.repeat(n)}
          </button>
        ))}
      </div>

      <form onSubmit={erstellen} className="flex gap-2">
        <input
          value={auftrag}
          onChange={(e) => setAuftrag(e.target.value)}
          placeholder="z. B. Ribeye mit Kaffee-Kruste"
          className="flex-1 min-w-0 rounded-lg border border-border-subtle bg-surface-base px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-gold focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-1 rounded-lg bg-brand-fire px-3 py-2 text-xs font-bold uppercase tracking-wide text-ink hover:opacity-90 disabled:opacity-50"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <ChevronRight size={14} />} Erstellen
        </button>
      </form>

      {loading && (
        <div className="mt-3 flex items-center gap-2 text-[11px] text-brand-gold">
          <Loader2 size={13} className="animate-spin shrink-0" />
          <span>
            Claude schreibt dein Rezept … {elapsed}s{' '}
            <span className="text-text-muted">(meist 10–20 s)</span>
          </span>
        </div>
      )}
      {hinweis && <p className="mt-3 text-[11px] text-text-muted italic">{hinweis}</p>}
      {ergebnis && (
        <div className="mt-3 max-h-72 overflow-y-auto rounded-lg border border-border-subtle bg-surface-base p-3">
          <div className="prose prose-sm max-w-none prose-headings:text-text-light prose-headings:font-serif">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{ergebnis}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ToolBoxes() {
  // Verkettung: Foodpairing → Rezept-Schmiede (nonce, damit auch gleiche Vorgabe erneut auslöst).
  const [seed, setSeed] = useState<{ auftrag: string; nonce: number } | null>(null);
  return (
    <section className="bg-surface-dark border-b border-brand-gold/15">
      <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-12">
        <div className="text-center mb-6">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-sans font-bold tracking-[0.22em] uppercase text-brand-fire">
            <Flame size={12} /> Werkzeuge
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-text-light mt-2">
            Spiel mit Aromen, Cuts & Rezepten
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {/* Cut-Generator → bestehende Cut-Welt */}
          <Link
            href="/cuts"
            className="group flex flex-col rounded-xl border border-brand-gold/25 bg-surface-card p-5 hover:border-brand-gold transition-colors"
          >
            <div className="flex items-center gap-2 mb-1.5 text-brand-fire">
              <Flame size={18} />
              <h3 className="font-serif text-lg font-bold text-text-light">Cut-Atlas</h3>
            </div>
            <p className="text-xs text-text-secondary mb-4">
              Jeder Cut erklärt — Lage, Muskel, Marmorierung und der perfekte Garpunkt.
            </p>
            <span className="mt-auto inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-brand-gold group-hover:gap-2 transition-all">
              Entdecken <ChevronRight size={14} />
            </span>
          </Link>

          <FoodpairingBox
            onSeedRezept={(z, p) => setSeed({ auftrag: `${z} mit ${p}`, nonce: Date.now() })}
          />
          <RezeptSchmiedeBox seed={seed} />
        </div>
      </div>
    </section>
  );
}
