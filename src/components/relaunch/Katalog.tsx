'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { Katalog as KatalogTyp, KatalogEintrag } from '@/lib/relaunch/katalog';

/**
 * Übersicht-Muster: Filterleiste + Raster/Liste + Leer-Zustand.
 * EIN Muster für vier Kataloge — Filterachse, Abzeichen und Einträge kommen
 * aus dem Katalog-Objekt (src/lib/relaunch/katalog.ts).
 *
 * Verhalten laut Handoff: ohne Nachladen, ohne Verzögerung, ohne Ladezustand.
 * Sortierung „Beliebt" = redaktionelle Reihenfolge, „A–Z" = localeCompare('de').
 * Die Ansicht (Raster/Liste) bleibt beim Katalogwechsel erhalten → localStorage;
 * Filter und Sortierung starten je Katalog neu.
 *
 * Nachholarbeit aus dem Handoff (Punkt 5): aria-pressed auf den Chips,
 * role="group" auf den Umschaltern, Live-Region für die Trefferzahl.
 */
type Sort = 'Beliebt' | 'A–Z';
type Ansicht = 'Raster' | 'Liste';
const ANSICHT_KEY = 'sk.ansicht';

export default function Katalog({ katalog }: { katalog: KatalogTyp }) {
  const [filter, setFilter] = useState<string>('Alle');
  const [sort, setSort] = useState<Sort>('Beliebt');
  const [ansicht, setAnsicht] = useState<Ansicht>('Raster');

  // Ansicht aus localStorage — nach dem ersten Render, damit Server und
  // Client identisch starten (kein Hydration-Sprung).
  useEffect(() => {
    try {
      const v = window.localStorage.getItem(ANSICHT_KEY);
      if (v === 'Liste' || v === 'Raster') setAnsicht(v);
    } catch { /* privater Modus o. ä. — Standard bleibt Raster */ }
  }, []);

  const waehleAnsicht = (v: Ansicht) => {
    setAnsicht(v);
    try { window.localStorage.setItem(ANSICHT_KEY, v); } catch { /* egal */ }
  };

  const rows = useMemo(() => {
    let r = katalog.eintraege
      .map((e, i) => ({ ...e, nr: String(i + 1).padStart(2, '0') }))
      .filter((e) => filter === 'Alle' || e.filter === filter);
    if (sort === 'A–Z') r = [...r].sort((a, b) => a.titel.localeCompare(b.titel, 'de'));
    return r;
  }, [katalog, filter, sort]);

  const chips = ['Alle', ...katalog.dims];

  return (
    <>
      <div className="sk-filterbar">
        <div className="sk-filterbar__inner">
          <div className="sk-filterbar__chips" role="group" aria-label={`Filter nach ${katalog.dim}`}>
            <span className="sk-filterbar__label">{katalog.dim}</span>
            {chips.map((d) => (
              <button
                key={d}
                type="button"
                className={`sk-chip${filter === d ? ' sk-chip--on' : ''}`}
                aria-pressed={filter === d}
                onClick={() => setFilter(d)}
              >
                {d}
              </button>
            ))}
          </div>
          <div className="sk-filterbar__gap" />
          <span className="sk-count" aria-live="polite">{rows.length} von {katalog.eintraege.length}</span>
          <div className="sk-toggle" role="group" aria-label="Sortierung">
            {(['Beliebt', 'A–Z'] as Sort[]).map((x) => (
              <button key={x} type="button" className={`sk-toggle__seg${sort === x ? ' sk-toggle__seg--on' : ''}`} aria-pressed={sort === x} onClick={() => setSort(x)}>
                {x}
              </button>
            ))}
          </div>
          <div className="sk-toggle" role="group" aria-label="Ansicht">
            {(['Raster', 'Liste'] as Ansicht[]).map((x) => (
              <button key={x} type="button" className={`sk-toggle__seg${ansicht === x ? ' sk-toggle__seg--on' : ''}`} aria-pressed={ansicht === x} onClick={() => waehleAnsicht(x)}>
                {x}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="sk-kat-body">
        {rows.length === 0 ? (
          <div className="sk-empty">
            <div className="sk-empty__title">Nichts in dieser Auswahl</div>
            <p className="sk-empty__text">In diesem Katalog gibt es dazu noch keinen Eintrag.</p>
            <button type="button" className="sk-btn sk-btn--ink" onClick={() => setFilter('Alle')}>Filter zurücksetzen</button>
          </div>
        ) : ansicht === 'Raster' ? (
          <div className="sk-raster">
            {rows.map((e) => <Karte key={e.titel} e={e} />)}
          </div>
        ) : (
          <div className="sk-list">
            {rows.map((e) => <Zeile key={e.titel} e={e} />)}
          </div>
        )}
      </div>
    </>
  );
}

type Row = KatalogEintrag & { nr: string };

/**
 * Die Katalogdaten tragen die LIVE-URLs (die beim Umschalten gelten). Solange
 * der Relaunch parallel läuft, bleiben Verweise auf bereits nachgebaute
 * Vorlagen innerhalb von /relaunch — sonst springt die Vorschau ins alte Design.
 */
const IM_RELAUNCH = ['/streitfaelle/', '/rezepte/', '/vergleich/', '/diplome'];
export function relaunchHref(href: string): string {
  return IM_RELAUNCH.some((p) => href.startsWith(p)) ? `/relaunch${href}` : href;
}

/** Raster-Karte. Mit href ein Link, ohne href eine Karte mit „Detailseite folgt". */
function Karte({ e }: { e: Row }) {
  const inner = (
    <>
      <div className="sk-entry__top">
        <span className="sk-h sk-h--card">{e.titel}</span>
        <span className="sk-entry__badge">{e.badge}</span>
      </div>
      <div className="sk-entry__meta">
        <span>{e.filter}</span><span>·</span><span>{e.meta1}</span>
      </div>
      <p className="sk-text">{e.text}</p>
      <div className="sk-entry__foot">
        <span>{e.meta2}</span>
        {e.href ? <span className="sk-entry__go">Ansehen →</span> : <span className="sk-entry__soon">Detailseite folgt</span>}
      </div>
    </>
  );
  return e.href
    ? <Link href={relaunchHref(e.href)} className="sk-card">{inner}</Link>
    : <article className="sk-card">{inner}</article>;
}

/** Listen-Zeile — sechs Spalten wie im Prototyp. */
function Zeile({ e }: { e: Row }) {
  const inner = (
    <>
      <span className="sk-row__nr">{e.nr}</span>
      <span className="sk-h sk-h--row">{e.titel}</span>
      <span className="sk-row__meta">{e.meta1}</span>
      <span className="sk-row__meta">{e.meta2}</span>
      <span className="sk-row__text">{e.text}</span>
      <span className="sk-row__badge">{e.badge}</span>
    </>
  );
  return e.href
    ? <Link href={relaunchHref(e.href)} className="sk-row">{inner}</Link>
    : <div className="sk-row">{inner}</div>;
}
