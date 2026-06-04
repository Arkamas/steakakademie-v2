'use client';
import { useState, useEffect } from 'react';
import { routeForCategory } from '@/lib/content-routing';

interface Draft {
  id: string;
  category: string;
  title: string;
  slug: string;
  seo_description: string | null;
  content_body: string;
  status: string;
  generated_at: string;
}

export default function ReviewPage() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setErr('');
    try {
      const res = await fetch('/api/admin/drafts');
      if (res.status === 401) { setErr('Nicht eingeloggt — /admin/login'); setLoading(false); return; }
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setDrafts(json.drafts);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Fehler');
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function decide(id: string, status: 'approved' | 'rejected') {
    setBusy(id);
    try {
      const res = await fetch('/api/admin/drafts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setDrafts((prev) => prev.filter((d) => d.id !== id));
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Fehler');
    }
    setBusy(null);
  }

  return (
    <div className="min-h-screen bg-[#0a0805] text-[#e8dcc8] font-mono p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="text-[#c8621a] text-xs tracking-widest">🥩 STEAKAKADEMIE · REVIEW
          <a href="/admin/pm-agent" className="ml-4 text-[#8a7e6a] hover:text-[#d4a53a]">▸ PM-AGENT</a>
          <a href="/admin/rezepte" className="ml-4 text-[#8a7e6a] hover:text-[#d4a53a]">▸ REZEPTE</a>
        </div>
        <button onClick={load} className="text-[#8a7e6a] text-xs hover:text-[#d4a53a]">↻ neu laden</button>
      </div>

      {err && <p className="text-red-400 text-xs mb-4">{err}</p>}
      {loading ? (
        <p className="text-[#8a7e6a] text-sm animate-pulse">Lade Entwürfe…</p>
      ) : drafts.length === 0 ? (
        <p className="text-[#8a7e6a] text-sm">Keine offenen Entwürfe.</p>
      ) : (
        <div className="space-y-3">
          {drafts.map((d) => {
            const target = routeForCategory(d.category);
            const isOpen = open === d.id;
            return (
              <div key={d.id} className="bg-[#16130a] border border-[#2a2416] p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-[10px] tracking-widest mb-1">
                      <span className="text-[#d4a53a] uppercase">{d.category}</span>
                      <span className="text-[#8a7e6a]">→ {target}</span>
                      <span className="text-[#8a7e6a]">· {d.status}</span>
                    </div>
                    <h3 className="text-sm text-[#e8dcc8] leading-snug">{d.title}</h3>
                    <p className="text-xs text-[#8a7e6a] mt-1 line-clamp-2">
                      {d.seo_description || d.content_body.slice(0, 160)}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <button
                      onClick={() => decide(d.id, 'approved')}
                      disabled={busy === d.id}
                      className="bg-[#3a7a3a] text-white text-xs px-3 py-1.5 tracking-wider hover:bg-[#4a9a4a] disabled:opacity-40"
                    >✓ Freigeben</button>
                    <button
                      onClick={() => decide(d.id, 'rejected')}
                      disabled={busy === d.id}
                      className="border border-[#c8621a]/50 text-[#c8621a] text-xs px-3 py-1.5 tracking-wider hover:bg-[#c8621a]/10 disabled:opacity-40"
                    >✕ Ablehnen</button>
                    <button
                      onClick={() => setOpen(isOpen ? null : d.id)}
                      className="text-[#8a7e6a] text-[10px] hover:text-[#d4a53a]"
                    >{isOpen ? 'zuklappen' : 'Volltext'}</button>
                  </div>
                </div>
                {isOpen && (
                  <pre className="mt-3 pt-3 border-t border-[#2a2416] text-xs text-[#bdb3a0] whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
                    {d.content_body}
                  </pre>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-6 text-center text-[#8a7e6a] text-xs">
        Freigegebene Entwürfe erscheinen live · /bbq-news · /grillstil · /pflanzlich
      </div>
    </div>
  );
}
