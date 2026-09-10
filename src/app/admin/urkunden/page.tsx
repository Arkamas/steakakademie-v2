'use client';

import { useCallback, useEffect, useState } from 'react';
import { STUFEN } from '@/lib/diplome/stufen';

/**
 * /admin/urkunden — Freigabe der gedruckten Urkunden.
 *
 * Der bewusst manuelle Schritt der Testphase: ansehen, Zahlung bestaetigen,
 * freigeben. Erst die Freigabe vergibt die Urkunden-Nummer, rendert die
 * Druckdatei und beauftragt Gelato.
 *
 * „Probe" macht dasselbe, legt den Auftrag bei Gelato aber als Entwurf an —
 * nichts wird produziert, nichts berechnet. Damit laesst sich die ganze Kette
 * einmal durchspielen, ohne Papier und Geld zu verbrauchen.
 *
 * Gestaltung wie /admin/review: Terminal-Look, kein Aufwand fuer ein Werkzeug,
 * das nur Uwe sieht.
 */

type Bestellung = {
  id: string;
  email: string;
  stufe: number;
  level_id: number | null;
  name_auf_urkunde: string;
  vorname: string;
  nachname: string;
  strasse: string;
  adresszusatz: string | null;
  plz: string;
  ort: string;
  land: string;
  preis_cents: number;
  status: 'neu' | 'bezahlt' | 'gesendet' | 'fehler' | 'storniert';
  urkunde_nr: string | null;
  druck_datei: string | null;
  gelato_order_id: string | null;
  fehler_text: string | null;
  bestellt_am: string;
  freigegeben_am: string | null;
};

const STATUS_FARBE: Record<Bestellung['status'], string> = {
  neu: '#d4a53a',
  bezahlt: '#7fb069',
  gesendet: '#6a9fd4',
  fehler: '#d45a4a',
  storniert: '#6a6257',
};

export default function UrkundenAdminSeite() {
  const [bestellungen, setBestellungen] = useState<Bestellung[]>([]);
  const [laedt, setLaedt] = useState(true);
  const [fehler, setFehler] = useState('');
  const [meldung, setMeldung] = useState('');
  const [beschaeftigt, setBeschaeftigt] = useState<string | null>(null);
  const [vorschau, setVorschau] = useState<string | null>(null);

  const laden = useCallback(async () => {
    setLaedt(true);
    setFehler('');
    try {
      const res = await fetch('/api/admin/urkunden');
      if (res.status === 401) { setFehler('Nicht eingeloggt — /admin/login'); setLaedt(false); return; }
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setBestellungen(json.bestellungen);
    } catch (e) {
      setFehler(e instanceof Error ? e.message : 'Fehler');
    }
    setLaedt(false);
  }, []);

  useEffect(() => { laden(); }, [laden]);

  async function aktion(id: string, aktion: 'bezahlt' | 'freigeben' | 'probe' | 'stornieren') {
    if (aktion === 'freigeben' && !confirm('Wirklich freigeben? Das löst einen kostenpflichtigen Druckauftrag aus und verschickt echte Post.')) return;
    setBeschaeftigt(id);
    setFehler('');
    setMeldung('');
    try {
      const res = await fetch('/api/admin/urkunden', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, aktion }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      if (json.urkundeNr) {
        setMeldung(`${json.entwurf ? 'Probe' : 'Freigegeben'}: ${json.urkundeNr} · Gelato ${json.gelatoOrderId}`);
      }
      await laden();
    } catch (e) {
      setFehler(e instanceof Error ? e.message : 'Fehler');
    }
    setBeschaeftigt(null);
  }

  const offen = bestellungen.filter((b) => b.status === 'neu' || b.status === 'bezahlt' || b.status === 'fehler');
  const erledigt = bestellungen.filter((b) => b.status === 'gesendet' || b.status === 'storniert');

  return (
    <div className="min-h-screen bg-[#0a0805] text-[#e8dcc8] font-mono p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="text-[#c8621a] text-xs tracking-widest">
          🥩 STEAKAKADEMIE · URKUNDEN
          <a href="/admin/review" className="ml-4 text-[#8a7e6a] hover:text-[#d4a53a]">▸ REVIEW</a>
          <a href="/admin/pm-agent" className="ml-3 text-[#8a7e6a] hover:text-[#d4a53a]">▸ PM-AGENT</a>
        </div>
        <button onClick={laden} className="text-xs text-[#8a7e6a] hover:text-[#d4a53a]">↻ neu laden</button>
      </div>

      {fehler && <p className="mb-4 text-sm text-[#d45a4a]">{fehler}</p>}
      {meldung && <p className="mb-4 text-sm text-[#7fb069]">{meldung}</p>}
      {laedt && <p className="text-sm text-[#8a7e6a]">lädt …</p>}

      {!laedt && offen.length === 0 && (
        <p className="text-sm text-[#8a7e6a]">Keine offenen Bestellungen.</p>
      )}

      {offen.map((b) => (
        <Karte
          key={b.id}
          b={b}
          beschaeftigt={beschaeftigt === b.id}
          onAktion={aktion}
          onVorschau={() => setVorschau(b.id)}
        />
      ))}

      {erledigt.length > 0 && (
        <>
          <h2 className="mt-10 mb-3 text-xs tracking-widest text-[#8a7e6a]">ERLEDIGT</h2>
          {erledigt.map((b) => (
            <Karte
              key={b.id}
              b={b}
              beschaeftigt={beschaeftigt === b.id}
              onAktion={aktion}
              onVorschau={() => setVorschau(b.id)}
            />
          ))}
        </>
      )}

      {vorschau && (
        <div
          className="fixed inset-0 z-50 bg-black/85 p-4 overflow-auto"
          onClick={() => setVorschau(null)}
        >
          <p className="text-center text-xs text-[#8a7e6a] mb-3">Klicken zum Schließen</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/api/admin/urkunden/vorschau?id=${vorschau}`}
            alt="Vorschau der Urkunde"
            className="mx-auto max-w-full h-auto border border-[#3a332a]"
          />
        </div>
      )}
    </div>
  );
}

function Karte({
  b, beschaeftigt, onAktion, onVorschau,
}: {
  b: Bestellung;
  beschaeftigt: boolean;
  onAktion: (id: string, a: 'bezahlt' | 'freigeben' | 'probe' | 'stornieren') => void;
  onVorschau: () => void;
}) {
  const stufe = STUFEN.find((s) => s.nr === b.stufe);
  const preis = (b.preis_cents / 100).toFixed(2).replace('.', ',');
  const datum = new Date(b.bestellt_am).toLocaleString('de-DE', { timeZone: 'Europe/Berlin' });

  return (
    <div className="mb-3 border border-[#3a332a] bg-[#12100c] p-4 text-sm">
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 mb-2">
        <span style={{ color: STATUS_FARBE[b.status] }} className="text-[11px] tracking-widest uppercase">
          {b.status}
        </span>
        <span className="font-bold text-[#e8dcc8]">{b.name_auf_urkunde}</span>
        <span className="text-[#8a7e6a]">
          Stufe {b.stufe} · {stufe?.cert ?? '—'}{b.level_id ? ` · Level ${b.level_id}` : ''}
        </span>
        <span className="text-[#8a7e6a]">{preis} €</span>
        <span className="text-[#6a6257] text-xs">{datum}</span>
        {b.urkunde_nr && <span className="text-[#d4a53a]">{b.urkunde_nr}</span>}
      </div>

      <div className="text-[#a89a84] leading-relaxed mb-3">
        {b.vorname} {b.nachname} · {b.strasse}
        {b.adresszusatz ? `, ${b.adresszusatz}` : ''} · {b.plz} {b.ort} · {b.land}
        <br />
        <span className="text-[#6a6257]">{b.email}</span>
        {b.gelato_order_id && <span className="text-[#6a9fd4]"> · Gelato {b.gelato_order_id}</span>}
      </div>

      {b.fehler_text && (
        <p className="mb-3 border-l-2 border-[#d45a4a] pl-3 text-xs text-[#d45a4a]">{b.fehler_text}</p>
      )}

      <div className="flex flex-wrap gap-2">
        <button onClick={onVorschau} className="border border-[#3a332a] px-3 py-1.5 text-xs hover:border-[#d4a53a]">
          Vorschau
        </button>
        {b.status !== 'gesendet' && b.status !== 'storniert' && (
          <>
            {b.status === 'neu' && (
              <button
                disabled={beschaeftigt}
                onClick={() => onAktion(b.id, 'bezahlt')}
                className="border border-[#3a332a] px-3 py-1.5 text-xs hover:border-[#7fb069] disabled:opacity-40"
              >
                Zahlung eingegangen
              </button>
            )}
            <button
              disabled={beschaeftigt}
              onClick={() => onAktion(b.id, 'probe')}
              className="border border-[#3a332a] px-3 py-1.5 text-xs hover:border-[#6a9fd4] disabled:opacity-40"
            >
              Probe (Gelato-Entwurf)
            </button>
            <button
              disabled={beschaeftigt}
              onClick={() => onAktion(b.id, 'freigeben')}
              className="border border-[#8a5a1a] bg-[#2a1c08] px-3 py-1.5 text-xs text-[#d4a53a] hover:border-[#d4a53a] disabled:opacity-40"
            >
              {beschaeftigt ? 'läuft …' : 'Freigeben & drucken'}
            </button>
            <button
              disabled={beschaeftigt}
              onClick={() => onAktion(b.id, 'stornieren')}
              className="border border-[#3a332a] px-3 py-1.5 text-xs text-[#8a7e6a] hover:border-[#d45a4a] disabled:opacity-40"
            >
              Stornieren
            </button>
          </>
        )}
      </div>
    </div>
  );
}
