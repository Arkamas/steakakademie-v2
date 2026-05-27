'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getConsent, setConsent, ConsentState } from '@/lib/consent';

interface Props {
  /** Callback: wird aufgerufen sobald Consent gesetzt wurde (auch bei Ablehnung) */
  onConsent?: (state: ConsentState) => void;
}

export default function CookieConsentBanner({ onConsent }: Props) {
  const [visible, setVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);

  // Nur anzeigen wenn noch kein Consent gespeichert
  useEffect(() => {
    const existing = getConsent();
    if (!existing) {
      // Kurze Verzögerung — erst nach Render des eigentlichen Inhalts
      const t = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  if (!visible) return null;

  const accept = (analytics: boolean) => {
    const state = setConsent(analytics);
    setVisible(false);
    onConsent?.(state);
    // GA4 + Clarity direkt laden wenn zugestimmt
    if (analytics && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sa:consent:analytics'));
    }
  };

  return (
    <>
      {/* Backdrop für Settings-Modal */}
      {showSettings && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setShowSettings(false)}
        />
      )}

      {/* Haupt-Banner — fixiert am unteren Rand */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Cookie-Einstellungen"
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#0f0f0f]/95 backdrop-blur-md shadow-2xl"
      >
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Text */}
            <p className="text-sm text-zinc-400 leading-relaxed max-w-2xl">
              Wir nutzen Cookies und ähnliche Technologien für{' '}
              <span className="text-zinc-200">Analyse & Optimierung</span>.
              Notwendige Cookies sind immer aktiv.{' '}
              <Link
                href="/datenschutz"
                className="underline underline-offset-2 text-zinc-300 hover:text-[#F5A623] transition-colors"
              >
                Datenschutzerklärung
              </Link>
            </p>

            {/* Buttons */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                onClick={() => setShowSettings(true)}
                className="px-3 py-1.5 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                Einstellungen
              </button>
              <button
                onClick={() => accept(false)}
                className="px-4 py-1.5 text-sm rounded border border-zinc-600 text-zinc-300 hover:border-zinc-400 hover:text-zinc-100 transition-colors"
              >
                Nur notwendige
              </button>
              <button
                onClick={() => accept(true)}
                className="px-4 py-1.5 text-sm rounded bg-[#F5A623] text-black font-semibold hover:bg-[#e09410] transition-colors"
              >
                Alle akzeptieren
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Einstellungs-Modal */}
      {showSettings && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Cookie-Einstellungen anpassen"
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg rounded-xl border border-white/10 bg-[#0f0f0f]/98 shadow-2xl p-6"
        >
          <h2 className="text-base font-semibold text-white mb-4">Cookie-Einstellungen</h2>

          {/* Notwendige — immer aktiv */}
          <div className="flex items-start justify-between py-3 border-b border-white/8">
            <div>
              <p className="text-sm font-medium text-zinc-200">Notwendige Cookies</p>
              <p className="text-xs text-zinc-500 mt-0.5">
                Sitzungsmanagement, Consent-Speicherung. Ohne diese funktioniert die Website nicht.
              </p>
            </div>
            <span className="text-xs text-zinc-500 shrink-0 ml-4 mt-0.5">Immer aktiv</span>
          </div>

          {/* Analytics */}
          <div className="flex items-start justify-between py-3">
            <div>
              <p className="text-sm font-medium text-zinc-200">Analyse & Statistik</p>
              <p className="text-xs text-zinc-500 mt-0.5">
                Google Analytics 4 + Microsoft Clarity — Seitenaufrufe, Nutzungsverhalten,
                Heatmaps. Hilft uns die Website zu verbessern.
              </p>
            </div>
            {/* Toggle */}
            <button
              role="switch"
              aria-checked={analyticsEnabled}
              onClick={() => setAnalyticsEnabled(v => !v)}
              className={`relative ml-4 mt-0.5 h-5 w-9 shrink-0 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F5A623] ${
                analyticsEnabled ? 'bg-[#F5A623]' : 'bg-zinc-700'
              }`}
            >
              <span
                className={`block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${
                  analyticsEnabled ? 'translate-x-[18px]' : 'translate-x-[3px]'
                } mt-[3px]`}
              />
            </button>
          </div>

          {/* Aktionen */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => { setShowSettings(false); accept(analyticsEnabled); }}
              className="flex-1 py-2 text-sm rounded bg-[#F5A623] text-black font-semibold hover:bg-[#e09410] transition-colors"
            >
              Auswahl speichern
            </button>
            <button
              onClick={() => setShowSettings(false)}
              className="px-4 py-2 text-sm rounded border border-zinc-600 text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              Abbrechen
            </button>
          </div>

          <p className="text-xs text-zinc-600 mt-3">
            Einwilligung jederzeit widerrufbar via{' '}
            <Link href="/datenschutz" className="underline hover:text-zinc-400">
              Datenschutzerklärung
            </Link>
            .
          </p>
        </div>
      )}
    </>
  );
}
