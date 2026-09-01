'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Loader2, ImagePlus, X } from 'lucide-react';

export default function DiagnoseForm() {
  const router = useRouter();

  const [problem,   setProblem]   = useState('');
  const [cut,       setCut]       = useState('');
  const [grillType, setGrillType] = useState('');
  const [file,      setFile]      = useState<File | null>(null);
  const [preview,   setPreview]   = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const canSubmit = problem.trim().length >= 10 && !loading;

  function pickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    if (!f) return;
    if (f.size > 8 * 1024 * 1024) {
      setError('Bild zu groß (max. 8 MB).');
      return;
    }
    setError(null);
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  function clearFile() {
    setFile(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    if (fileInput.current) fileInput.current.value = '';
  }

  async function submit() {
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.set('problem', problem.trim());
      if (cut.trim())       fd.set('cut', cut.trim());
      if (grillType.trim()) fd.set('grillType', grillType.trim());
      if (file)             fd.set('image', file);

      const res  = await fetch('/api/steak-beichte/analyze', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error ?? 'Diagnose fehlgeschlagen.');
      }
      router.push(`/steak-beichte/diagnose/${data.id}`);
    } catch (err: any) {
      setError(err?.message ?? 'Etwas ist schiefgelaufen. Bitte erneut versuchen.');
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <p className="font-serif text-sm font-bold text-text-primary mb-3">
          Was ist passiert?
        </p>
        <textarea
          value={problem}
          onChange={(e) => setProblem(e.target.value)}
          maxLength={2000}
          rows={5}
          placeholder="z. B. Tomahawk war außen verkohlt, innen noch fast roh. Habe direkt über voller Glut gegrillt, ca. 4 Min pro Seite."
          className="w-full border px-4 py-3 text-sm font-sans bg-transparent leading-relaxed"
          style={{ borderColor: 'rgba(200,136,42,0.25)' }}
        />
        <p className="text-xs font-sans text-text-muted mt-1">{problem.length}/2000</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <p className="font-serif text-sm font-bold text-text-primary mb-3">Cut <span className="font-sans font-normal text-text-muted">(optional)</span></p>
          <input
            type="text" value={cut} onChange={(e) => setCut(e.target.value)} maxLength={120}
            placeholder="z. B. Tomahawk 800g"
            className="w-full border px-4 py-2.5 text-sm font-sans bg-transparent"
            style={{ borderColor: 'rgba(200,136,42,0.25)' }}
          />
        </div>
        <div>
          <p className="font-serif text-sm font-bold text-text-primary mb-3">Grilltyp <span className="font-sans font-normal text-text-muted">(optional)</span></p>
          <input
            type="text" value={grillType} onChange={(e) => setGrillType(e.target.value)} maxLength={120}
            placeholder="z. B. Kugelgrill"
            className="w-full border px-4 py-2.5 text-sm font-sans bg-transparent"
            style={{ borderColor: 'rgba(200,136,42,0.25)' }}
          />
        </div>
      </div>

      <div>
        <p className="font-serif text-sm font-bold text-text-primary mb-3">
          Foto des Ergebnisses <span className="font-sans font-normal text-text-muted">(optional, macht die Diagnose präziser)</span>
        </p>
        {preview ? (
          <div className="relative inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Vorschau" className="max-h-64 border" style={{ borderColor: 'rgba(200,136,42,0.25)' }} />
            <button
              type="button" onClick={clearFile}
              className="absolute top-2 right-2 p-1.5 bg-black/70 text-white"
              aria-label="Foto entfernen"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <button
            type="button" onClick={() => fileInput.current?.click()}
            className="inline-flex items-center gap-2 px-5 py-3 text-sm font-sans border transition-colors hover:border-brand-gold/40"
            style={{ borderColor: 'rgba(200,136,42,0.25)', color: 'var(--text-secondary, #555)' }}
          >
            <ImagePlus size={16} /> Foto auswählen
          </button>
        )}
        <input
          ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp,image/heic"
          onChange={pickFile} className="hidden"
        />
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
        type="button" onClick={submit} disabled={!canSubmit}
        className="inline-flex items-center gap-2 px-7 py-3.5 font-sans font-bold text-base transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ background: '#C8882A', color: '#0D0A06' }}
      >
        {loading ? (
          <><Loader2 size={16} className="animate-spin motion-reduce:animate-none" /> Diagnose läuft … (bis zu 60 Sek.)</>
        ) : (
          <>Diagnose anfordern <ArrowRight size={16} /></>
        )}
      </button>

      {loading && (
        <p className="text-xs font-sans text-text-muted">
          Die KI analysiert deine Beichte. Schließe dieses Fenster nicht.
        </p>
      )}
    </div>
  );
}
