'use client';

import { useState, type ReactNode } from 'react';
import { fmt, smartConvert, NO_CONVERT, type RecipeIngredient } from '@/components/recipe/PortionCalculator';

/**
 * Rezept-Kopf mit Portionsrechner (Handoff, Ansicht 5): zweispaltig — links
 * Kicker, Titel, Lead und Kennzahlen (inkl. Personen-Stepper 1–12), rechts die
 * Zutatenliste, deren Mengen mitskalieren.
 *
 * Stepper und Liste teilen einen Zustand, deshalb liegt beides in EINER
 * Client-Komponente; die statischen Teile (Titel, Lead, Kennzahlen) kommen als
 * Server-gerenderte Knoten herein. Rechenlogik (Einheiten, Vulgarbrüche,
 * Rundung) stammt aus dem bestehenden PortionCalculator — nur einmal im Repo.
 */
export default function Portionen({
  basis, zutaten, hinweis, kopf, kennzahlen,
}: {
  basis: number;
  zutaten: RecipeIngredient[];
  hinweis?: string;
  kopf: ReactNode;
  kennzahlen: ReactNode;
}) {
  const [n, setN] = useState(basis);
  const faktor = n / basis;

  return (
    <div className="sk-rezept__kopf">
      <div>
        {kopf}
        <div className="sk-kennzahlen">
          {kennzahlen}
          <div>
            <div className="sk-kicker sk-kicker--13 sk-kicker--muted">Personen</div>
            <div className="sk-stepper" role="group" aria-label="Portionen">
              <button type="button" className="sk-stepper__btn" onClick={() => setN((v) => Math.max(1, v - 1))} aria-label="Eine Portion weniger" disabled={n <= 1}>−</button>
              <span className="sk-stepper__n" aria-live="polite">{n}</span>
              <button type="button" className="sk-stepper__btn" onClick={() => setN((v) => Math.min(12, v + 1))} aria-label="Eine Portion mehr" disabled={n >= 12}>+</button>
            </div>
          </div>
        </div>
      </div>
      <div className="sk-zutaten">
        <h2 className="sk-h sk-h--24" style={{ marginBottom: 16 }}>Zutaten</h2>
        <ul className="sk-zutaten__list">
          {zutaten.map((z, i) => {
            let menge: string;
            if (NO_CONVERT.has(z.unit) || !z.amount) {
              menge = z.unit;
            } else {
              const c = smartConvert(z.amount * faktor, z.unit);
              menge = `${fmt(c.amount)} ${c.unit}`;
            }
            return (
              <li key={i} className="sk-zutaten__row">
                <span>{z.name}{z.note ? <span className="sk-meta"> · {z.note}</span> : null}</span>
                <span className="sk-zutaten__menge">{menge}</span>
              </li>
            );
          })}
        </ul>
        {hinweis && <div className="sk-zutaten__hinweis"><span>Aus dem Cut-Atlas:</span> {hinweis}</div>}
      </div>
    </div>
  );
}
