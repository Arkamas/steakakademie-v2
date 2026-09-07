'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Check, ArrowRight } from 'lucide-react';
import AnimatedBar from '@/components/diplome/AnimatedBar';
import { createClient } from '@/lib/supabase/client';

/**
 * Lesefortschritt je Lektion — Audit 06.09.2026, R13.
 *
 * Vorher gab es im ganzen System kein Ereignis „Lektion gelesen": Die Leiste
 * in der Seitenspalte rechnete (idx+1)/anzahl aus der Listenposition und
 * zeigte, wo man steht, nicht, was man geschafft hat.
 *
 * Zwei Speicher, absichtlich: localStorage fuer alle (Stufe 1 bleibt
 * anonym nutzbar und die Seite statisch), lesson_progress in Supabase fuer
 * eingeloggte Nutzer (ueberlebt Geraetewechsel). Das ist KEIN Nachweis —
 * kein Zertifikat haengt daran — deshalb darf der Client hier direkt
 * schreiben (RLS: nur eigene Zeilen).
 *
 * variant="leiste": Fortschrittsleiste fuer die Seitenspalte.
 * variant="knopf": „Als gelesen markieren" unter dem Text.
 */

const STORAGE_KEY = 'steakakademie_gelesen';

function ladeLokal(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const arr = raw ? (JSON.parse(raw) as unknown) : [];
    return new Set(Array.isArray(arr) ? arr.filter((x): x is string => typeof x === 'string') : []);
  } catch {
    return new Set();
  }
}

function speichereLokal(set: Set<string>) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(set)));
  } catch {
    /* privater Modus o. ae. — dann bleibt es beim Konto oder gar nichts */
  }
}

type Props = {
  stufe: number;
  lektionSlug: string;
  alleSlugs: readonly string[];
  color: string;
  variant: 'leiste' | 'knopf';
  naechsteUrl?: string | null;
  gesperrt?: boolean;
};

export default function LektionFortschritt({ stufe, lektionSlug, alleSlugs, color, variant, naechsteUrl, gesperrt }: Props) {
  const [gelesen, setGelesen] = useState<Set<string>>(new Set());
  const [userId, setUserId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [fehler, setFehler] = useState<string | null>(null);

  // Laden: lokal sofort, Konto danach dazu mischen.
  useEffect(() => {
    let cancelled = false;
    const lokal = ladeLokal();
    setGelesen(lokal);
    setHydrated(true);
    (async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || cancelled) return;
        setUserId(user.id);
        const { data } = await supabase
          .from('lesson_progress')
          .select('lektion_slug')
          .eq('user_id', user.id)
          .eq('stufe', stufe);
        if (!data || cancelled) return;
        setGelesen((prev) => {
          const next = new Set(prev);
          for (const row of data) next.add(row.lektion_slug as string);
          speichereLokal(next);
          return next;
        });
      } catch {
        /* ohne Konto bleibt der lokale Stand */
      }
    })();
    return () => { cancelled = true; };
  }, [stufe]);

  const markiere = useCallback(async () => {
    setFehler(null);
    const next = new Set(gelesen);
    next.add(lektionSlug);
    setGelesen(next);
    speichereLokal(next);
    if (!userId) return;
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('lesson_progress')
        .upsert({ user_id: userId, lektion_slug: lektionSlug, stufe }, { onConflict: 'user_id,lektion_slug' });
      if (error) setFehler('Auf diesem Gerät gemerkt — im Konto konnte es gerade nicht gespeichert werden.');
    } catch {
      setFehler('Auf diesem Gerät gemerkt — im Konto konnte es gerade nicht gespeichert werden.');
    }
  }, [gelesen, lektionSlug, stufe, userId]);

  const anzahl = alleSlugs.filter((s) => gelesen.has(s)).length;
  const gesamt = alleSlugs.length;
  const dieseGelesen = gelesen.has(lektionSlug);

  if (variant === 'leiste') {
    return (
      <div>
        <AnimatedBar
          percent={gesamt > 0 ? (anzahl / gesamt) * 100 : 0}
          color={color}
          label={hydrated ? `${anzahl} von ${gesamt} gelesen` : `${gesamt} Lektionen`}
        />
        {hydrated && !userId && !gesperrt && (
          <p className="mt-2 text-[11px] font-sans text-text-muted leading-snug">
            Ohne Konto bleibt dein Lesestand auf diesem Gerät.{' '}
            <Link href="/auth/login" className="underline hover:text-brand-fire">Anmelden</Link>, damit er mitkommt.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {dieseGelesen ? (
        <span
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-sans font-bold uppercase tracking-widest"
          style={{ color, border: `1px solid ${color}60`, background: `${color}12` }}
        >
          <Check size={14} /> Gelesen
        </span>
      ) : (
        <button
          type="button"
          onClick={() => { void markiere(); }}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-sans font-bold uppercase tracking-widest text-ink transition-opacity hover:opacity-90"
          style={{ background: color }}
        >
          <Check size={14} /> Als gelesen markieren
        </button>
      )}
      {naechsteUrl && (
        <Link
          href={naechsteUrl}
          className="inline-flex items-center gap-1.5 text-xs font-sans font-bold uppercase tracking-widest text-text-muted hover:text-brand-fire transition-colors"
        >
          Weiter <ArrowRight size={13} />
        </Link>
      )}
      {fehler && <p className="basis-full text-[11px] font-sans text-text-muted">{fehler}</p>}
    </div>
  );
}
