'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Suchfeld in der Kopfzeile (05.09.2026 — im Handoff NICHT entworfen,
 * Entscheidung Uwe: „Was in der neuen Seite fehlt sind die Shop-Produkte und
 * eine Suche.").
 *
 * WARUM: Die Tiefe der Site (64 Cuts, 118 Rezepte, Glossar, Streitfälle) ist
 * der Burggraben und war ohne Suchfeld unsichtbar. Marco kann zwar suchen,
 * wird aber als Support-Widget gelesen und deshalb übersehen. Rollenteilung:
 * Suche = navigieren („wo ist X"), Marco = beraten („was nehme ich für Y") —
 * Marco steht als Auffangnetz unter den Treffern, nicht statt der Suche.
 *
 * Ab 900px steht das Feld offen in der Leiste, darunter klappt es aus der
 * Lupe aus — sonst frisst es die Navigation. Ohne JavaScript funktioniert es
 * auch: ein gewöhnliches GET-Formular auf /relaunch/suche.
 */
export default function SucheFeld() {
  const [offen, setOffen] = useState(false);
  const [wert, setWert] = useState('');
  const feld = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (offen) feld.current?.focus();
  }, [offen]);

  // „/" öffnet die Suche, Escape schließt sie. Kostet nichts und ist für
  // Vielnutzer der schnellste Weg — solange es nicht beim Tippen zuschlägt.
  useEffect(() => {
    const taste = (e: KeyboardEvent) => {
      const ziel = e.target as HTMLElement | null;
      const tippt = !!ziel && (/^(INPUT|TEXTAREA|SELECT)$/.test(ziel.tagName) || ziel.isContentEditable);
      if (e.key === '/' && !tippt) { e.preventDefault(); setOffen(true); }
      if (e.key === 'Escape' && offen) { setOffen(false); feld.current?.blur(); }
    };
    window.addEventListener('keydown', taste);
    return () => window.removeEventListener('keydown', taste);
  }, [offen]);

  return (
    <form
      className={`sk-suche${offen ? ' sk-suche--offen' : ''}`}
      action="/relaunch/suche"
      method="get"
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        const q = wert.trim();
        if (!q) { setOffen(true); feld.current?.focus(); return; }
        router.push(`/relaunch/suche?q=${encodeURIComponent(q)}`);
        setOffen(false);
      }}
    >
      <button
        type="button"
        className="sk-suche__lupe"
        aria-label={offen ? 'Suche schließen' : 'Suche öffnen'}
        aria-expanded={offen}
        onClick={() => setOffen((v) => !v)}
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.6-3.6" strokeLinecap="round" />
        </svg>
      </button>
      <label htmlFor="sk-suche-feld" className="sk-sr">Website durchsuchen</label>
      <input
        id="sk-suche-feld"
        ref={feld}
        name="q"
        type="search"
        className="sk-suche__feld"
        placeholder="Cuts, Rezepte, Techniken …"
        maxLength={80}
        autoComplete="off"
        value={wert}
        onChange={(e) => setWert(e.target.value)}
        onBlur={() => { if (!wert.trim()) setOffen(false); }}
      />
    </form>
  );
}
