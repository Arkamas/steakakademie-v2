'use client';

/**
 * Konto löschen — dezenter, eingeklappter Bereich am Ende des Profils.
 *
 * DSGVO Art. 17: Eingeloggte Nutzer können ihr Konto selbst und endgültig
 * löschen. Der Bereich ist bewusst zurückhaltend gestaltet (kein Alarm-Rot
 * im eingeklappten Zustand), verlangt aber eine aktive Bestätigung: das
 * Wort „LÖSCHEN" muss exakt eingetippt werden, bevor der Button freischaltet.
 * Serverseitig macht /api/konto-loeschen die eigentliche Arbeit.
 *
 * Die Aufzählung unten ist eine Zusage an den Nutzer und muss mit dem
 * Verhalten von /api/konto-loeschen deckungsgleich bleiben. Insbesondere:
 * Community-Rezepte werden NICHT gelöscht, sondern anonymisiert
 * (author_name → 'Ehemaliges Mitglied', user_id → NULL). Wer dort etwas
 * ändert, ändert es hier mit.
 */

import { useState } from 'react';
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react';

export default function KontoLoeschen() {
  const [offen, setOffen] = useState(false);
  const [eingabe, setEingabe] = useState('');
  const [laeuft, setLaeuft] = useState(false);
  const [fehler, setFehler] = useState<string | null>(null);

  const bestaetigt = eingabe === 'LÖSCHEN';

  async function loeschen() {
    if (!bestaetigt || laeuft) return;
    setFehler(null);
    setLaeuft(true);
    try {
      const res = await fetch('/api/konto-loeschen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bestaetigung: eingabe }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.ok) {
        window.location.href = '/';
        return;
      }
      setFehler(data?.error ?? 'Die Löschung konnte nicht abgeschlossen werden. Bitte versuche es später erneut.');
    } catch {
      setFehler('Verbindung fehlgeschlagen. Bitte prüfe dein Netz und versuche es erneut.');
    }
    setLaeuft(false);
  }

  return (
    <div className="mt-6 border border-border-subtle bg-surface-elevated">
      <button
        type="button"
        onClick={() => setOffen((o) => !o)}
        aria-expanded={offen}
        className="w-full flex items-center justify-between gap-3 px-6 py-4 text-left">
        <span className="font-sans text-xs font-bold uppercase tracking-wide text-text-muted">
          Konto löschen
        </span>
        {offen
          ? <ChevronUp size={14} className="text-text-muted shrink-0" />
          : <ChevronDown size={14} className="text-text-muted shrink-0" />}
      </button>

      {offen && (
        <div className="px-6 pb-6 space-y-4 border-t border-border-subtle pt-5">
          <p className="font-body text-sm text-text-secondary leading-relaxed">
            Wenn du dein Konto löschst, ist das <strong className="text-text-primary">endgültig</strong> —
            eine Wiederherstellung ist nicht möglich. Unwiderruflich gelöscht werden:
          </p>
          <ul className="font-body text-sm text-text-secondary space-y-1 list-disc pl-5">
            <li>dein Konto samt E-Mail-Adresse und Anmeldedaten</li>
            <li>deine Grillmeister-Vita und dein gesamter Lernfortschritt</li>
            <li>deine Abstimmungen, Erfahrungsberichte, Grill-Protokolle und Steak-Diagnosen</li>
          </ul>
          <p className="font-body text-sm text-text-secondary leading-relaxed">
            <strong className="text-text-primary">Deine veröffentlichten Community-Rezepte bleiben bestehen</strong> —
            sie gehören inzwischen zum Inhalt der Seite, andere Griller kochen danach.
            Dein Name wird dabei entfernt und durch &bdquo;Ehemaliges Mitglied&ldquo; ersetzt; eine
            Zuordnung zu dir ist danach nicht mehr möglich.
          </p>
          <p className="font-body text-xs text-text-muted leading-snug">
            Rechnungsdaten zu Käufen müssen wir aus gesetzlichen Gründen aufbewahren
            (§ 257 HGB, § 147 AO) — sie sind danach nicht mehr mit deinem Konto verknüpft.
          </p>

          <div>
            <label htmlFor="konto-loeschen-bestaetigung"
              className="block text-xs font-sans font-bold uppercase tracking-wide text-text-muted mb-1.5">
              Zur Bestätigung tippe: LÖSCHEN
            </label>
            <input
              id="konto-loeschen-bestaetigung"
              value={eingabe}
              onChange={(e) => setEingabe(e.target.value)}
              placeholder="LÖSCHEN"
              autoComplete="off"
              className="w-full px-4 py-2.5 bg-surface-base border border-border-subtle text-text-primary font-sans text-sm focus:border-brand-fire/50" />
          </div>

          {fehler && <p className="text-sm font-sans text-brand-fire">{fehler}</p>}

          <button
            type="button"
            onClick={() => void loeschen()}
            disabled={!bestaetigt || laeuft}
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-brand-fire text-brand-fire font-sans font-bold uppercase text-xs tracking-[0.08em] hover:bg-brand-fire hover:text-text-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-brand-fire">
            <Trash2 size={14} />
            {laeuft ? 'Wird gelöscht…' : 'Konto endgültig löschen'}
          </button>
        </div>
      )}
    </div>
  );
}
