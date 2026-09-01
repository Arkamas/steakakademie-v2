'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Loader2 } from 'lucide-react';
import {
  GRILL_TYPES, EXPERIENCE, TIME_SLOTS, GOALS,
} from '@/lib/mein-protokoll/schema';

type Step =
  | { key: 'grillType';      label: string; options: readonly string[] }
  | { key: 'experience';     label: string; options: readonly string[] }
  | { key: 'timePerSession'; label: string; options: readonly string[] }
  | { key: 'mainGoal';       label: string; options: readonly string[] };

const STEPS: Step[] = [
  { key: 'grillType',      label: 'Dein Grilltyp',         options: GRILL_TYPES },
  { key: 'experience',     label: 'Dein Erfahrungsstand',  options: EXPERIENCE },
  { key: 'timePerSession', label: 'Zeit pro Session',      options: TIME_SLOTS },
  { key: 'mainGoal',       label: 'Dein Hauptziel',        options: GOALS },
];

export default function FragebogenForm() {
  const router = useRouter();

  const [grillType,      setGrillType]      = useState<string>('');
  const [grillOther,     setGrillOther]     = useState<string>('');
  const [experience,     setExperience]     = useState<string>('');
  const [timePerSession, setTimePerSession] = useState<string>('');
  const [mainGoal,       setMainGoal]       = useState<string>('');
  const [frustration,    setFrustration]    = useState<string>('');

  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const values: Record<string, string> = {
    grillType, experience, timePerSession, mainGoal,
  };
  const setters: Record<string, (v: string) => void> = {
    grillType: setGrillType,
    experience: setExperience,
    timePerSession: setTimePerSession,
    mainGoal: setMainGoal,
  };

  const allSelected = grillType && experience && timePerSession && mainGoal;
  const grillOk     = grillType !== 'Anderes' || grillOther.trim().length > 1;
  const canSubmit   = allSelected && grillOk && frustration.trim().length >= 3 && !loading;

  async function submit() {
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/mein-protokoll/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grillType,
          grillOther: grillType === 'Anderes' ? grillOther.trim() : undefined,
          experience,
          timePerSession,
          mainGoal,
          frustration: frustration.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error ?? 'Plan-Generierung fehlgeschlagen.');
      }
      router.push('/mein-protokoll/plan');
    } catch (err: any) {
      setError(err?.message ?? 'Etwas ist schiefgelaufen. Bitte erneut versuchen.');
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-8">
      {STEPS.map(({ key, label, options }) => (
        <div key={key}>
          <p className="font-serif text-sm font-bold text-text-primary mb-3">{label}</p>
          <div className="flex flex-wrap gap-2">
            {options.map((opt) => {
              const active = values[key] === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setters[key](opt)}
                  className="text-sm font-sans px-4 py-2 border transition-colors"
                  style={
                    active
                      ? { background: '#C8882A', color: '#0D0A06', borderColor: '#C8882A' }
                      : { borderColor: 'rgba(200,136,42,0.25)', color: 'var(--text-secondary, #555)' }
                  }
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {key === 'grillType' && grillType === 'Anderes' && (
            <input
              type="text"
              value={grillOther}
              onChange={(e) => setGrillOther(e.target.value)}
              maxLength={120}
              placeholder="Beschreibe deinen Grilltyp (z. B. Feuergrill, Wok-Station)"
              className="mt-3 w-full border px-4 py-2.5 text-sm font-sans bg-transparent"
              style={{ borderColor: 'rgba(200,136,42,0.25)' }}
            />
          )}
        </div>
      ))}

      <div>
        <p className="font-serif text-sm font-bold text-text-primary mb-3">
          Was nervt dich beim Grillen am meisten?
        </p>
        <textarea
          value={frustration}
          onChange={(e) => setFrustration(e.target.value)}
          maxLength={600}
          rows={4}
          placeholder="Je konkreter, desto präziser adressiert dein Plan genau dieses Problem."
          className="w-full border px-4 py-3 text-sm font-sans bg-transparent leading-relaxed"
          style={{ borderColor: 'rgba(200,136,42,0.25)' }}
        />
        <p className="text-xs font-sans text-text-muted mt-1">{frustration.length}/600</p>
      </div>

      {error && (
        <div
          className="border px-4 py-3 text-sm font-sans"
          style={{ borderColor: 'rgba(180,60,0,0.4)', background: 'rgba(180,60,0,0.06)', color: '#B43C00' }}
        >
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={submit}
        disabled={!canSubmit}
        className="inline-flex items-center gap-2 px-7 py-3.5 font-sans font-bold text-base transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ background: '#C8882A', color: '#0D0A06' }}
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin motion-reduce:animate-none" />
            Plan wird generiert … (bis zu 60 Sek.)
          </>
        ) : (
          <>
            Meinen Plan generieren <ArrowRight size={16} />
          </>
        )}
      </button>

      {loading && (
        <p className="text-xs font-sans text-text-muted">
          Das System baut deinen 8-Wochen-Plan. Schließe dieses Fenster nicht.
        </p>
      )}
    </div>
  );
}
