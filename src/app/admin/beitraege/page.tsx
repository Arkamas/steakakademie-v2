'use client';
import { useState, useEffect } from 'react';

// Moderations-Warteschlange fuer "Stimmen aus der Praxis" (Stufe 2 der
// Nutzerbeteiligung). Alles, was Nutzer zu Streitfaellen schreiben, landet
// hier mit status 'neu' — nichts erscheint ohne Freigabe. Wer freigibt,
// veroeffentlicht: Der Text erscheint danach woertlich unter dem Streitfall,
// mit dem eingereichten Anzeigenamen (Vorname + Ort, kein Nachname).
// Konzept: docs/konzept-nutzerbeteiligung.md (Abschnitt 4).

interface Beitrag {
  id: number;
  slug: string;
  anzeigename: string;
  beitrag: string;
  created_at: string;
}

export default function BeitragModerationPage() {
  const [beitraege, setBeitraege] = useState<Beitrag[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState<number | null>(null);

  async function load() {
    setLoading(true);
    setErr('');
    try {
      const res = await fetch('/api/admin/beitraege');
      if (res.status === 401) { setErr('Nicht eingeloggt — /admin/login'); setLoading(false); return; }
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setBeitraege(json.beitraege);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Fehler');
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function decide(id: number, status: 'freigegeben' | 'abgelehnt') {
    setBusy(id);
    try {
      const res = await fetch('/api/admin/beitraege', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setBeitraege((prev) => prev.filter((b) => b.id !== id));
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Fehler');
    }
    setBusy(null);
  }

  return (
    <div className="min-h-screen bg-[#0a0805] text-[#e8dcc8] font-mono p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="text-[#c8621a] text-xs tracking-widest">🥩 STEAKAKADEMIE · STIMMEN AUS DER PRAXIS
          <a href="/admin/rezepte" className="ml-4 text-[#8a7e6a] hover:text-[#d4a53a]">▸ REZEPT-MODERATION</a>
        </div>
        <button onClick={load} className="text-[#8a7e6a] text-xs hover:text-[#d4a53a]">↻ neu laden</button>
      </div>

      <p className="text-[#8a7e6a] text-[11px] mb-4">
        Warteschlange der Streitfall-Beiträge (status neu). Was du freigibst, erscheint wörtlich
        unter dem Streitfall — mit dem angegebenen Anzeigenamen. Nichts erscheint automatisch.
      </p>

      {err && <p className="text-red-400 text-xs mb-4">{err}</p>}
      {loading ? (
        <p className="text-[#8a7e6a] text-sm animate-pulse">Lade Beiträge…</p>
      ) : beitraege.length === 0 ? (
        <p className="text-[#8a7e6a] text-sm">Keine offenen Beiträge. 🔥</p>
      ) : (
        <div className="space-y-3">
          {beitraege.map((b) => (
            <div key={b.id} className="bg-[#16130a] border border-[#2a2416] p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center flex-wrap gap-2 text-[10px] tracking-widest mb-1">
                    <a
                      href={`/streitfaelle/${b.slug}`}
                      className="text-[#d4a53a] uppercase hover:underline"
                    >{b.slug}</a>
                    <span className="text-[#8a7e6a]">· von {b.anzeigename}</span>
                    <span className="text-[#8a7e6a]">
                      · {new Date(b.created_at).toLocaleDateString('de-DE')}
                    </span>
                  </div>
                  <p className="text-sm text-[#e8dcc8] leading-relaxed whitespace-pre-wrap">{b.beitrag}</p>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <button
                    onClick={() => decide(b.id, 'freigegeben')}
                    disabled={busy === b.id}
                    className="bg-[#3a7a3a] text-white text-xs px-3 py-1.5 tracking-wider hover:bg-[#4a9a4a] disabled:opacity-40"
                  >✓ Freigeben</button>
                  <button
                    onClick={() => decide(b.id, 'abgelehnt')}
                    disabled={busy === b.id}
                    className="border border-[#c8621a]/50 text-[#c8621a] text-xs px-3 py-1.5 tracking-wider hover:bg-[#c8621a]/10 disabled:opacity-40"
                  >✕ Ablehnen</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
