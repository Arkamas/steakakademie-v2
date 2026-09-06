'use client';

import { useEffect, useState } from 'react';

/**
 * Lokaler Lektionsfortschritt — Platzhalter, wie im Handoff beschrieben:
 * „Kursfortschritt und Kontostand gehören serverseitig. lessonDone im Prototyp
 * ist reine Anzeige." Bis das Konto angebunden ist, merkt sich der Browser die
 * abgeschlossenen Lektionen unter EINEM Schlüssel; die Roadmap der Alt-Site
 * (steakakademie_progress) bleibt unberührt.
 */
const KEY = 'sk.lektionen';

function lese(): Set<string> {
  try {
    const raw = window.localStorage.getItem(KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch { return new Set(); }
}

export function useLektionen() {
  const [done, setDone] = useState<Set<string>>(new Set());
  useEffect(() => { setDone(lese()); }, []);
  const markiere = (url: string) => {
    const next = new Set(lese()); next.add(url);
    try { window.localStorage.setItem(KEY, JSON.stringify(Array.from(next))); } catch { /* egal */ }
    setDone(next);
  };
  return { done, markiere };
}

/** Kreis-Marker vor einer Lektion: erledigt (gefüllt), aktuell (Glutpunkt), offen (Rahmen) */
export function LektionMarker({ url, aktuell = false, gesperrt = false }: { url: string; aktuell?: boolean; gesperrt?: boolean }) {
  const { done } = useLektionen();
  if (done.has(url)) return <span className="sk-marker sk-marker--done" aria-label="erledigt">✓</span>;
  if (gesperrt) return <span className="sk-marker sk-marker--locked" aria-label="Konto erforderlich" />;
  if (aktuell) return <span className="sk-marker sk-marker--now" aria-label="nächste Lektion"><span /></span>;
  return <span className="sk-marker" aria-label="offen" />;
}

/** Abschluss-Knopf + Zustand „Lektion erledigt" (Prototyp, Ansicht 4) */
export function LektionAbschluss({ url, nr }: { url: string; nr: number }) {
  const { done, markiere } = useLektionen();
  if (done.has(url)) {
    return (
      <div className="sk-cta-row">
        <span className="sk-lektion__done"><span className="sk-dot sk-dot--12" style={{ animation: 'none' }} />Lektion {nr} abgeschlossen</span>
        <a href="/auth/login" className="sk-btn sk-btn--outline">Fortschritt speichern — kostenlos</a>
      </div>
    );
  }
  return (
    <div className="sk-cta-row">
      <button type="button" className="sk-btn sk-btn--primary sk-btn--big" onClick={() => markiere(url)}>Lektion abschließen</button>
      <span className="sk-meta sk-meta--14">Dein Fortschritt wird lokal gemerkt — speichern kannst du ihn später mit einem kostenlosen Account.</span>
    </div>
  );
}

/** Fortschrittsbalken im Kopfstreifen der Lektion: fünf 4px-Segmente je Lektion der Stufe */
export function LektionBalken({ urls, aktuell }: { urls: string[]; aktuell: string }) {
  const { done } = useLektionen();
  return (
    <div className="sk-balken" aria-hidden="true">
      {urls.map((u) => (
        <span key={u} className={`sk-balken__seg${done.has(u) ? ' sk-balken__seg--done' : u === aktuell ? ' sk-balken__seg--now' : ''}`} />
      ))}
    </div>
  );
}
