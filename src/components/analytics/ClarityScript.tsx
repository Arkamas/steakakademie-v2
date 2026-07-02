'use client';

import { useEffect } from 'react';
import { CONSENT_CHANGE_EVENT, hasStatisticsConsent, type ConsentState } from '@/lib/consent';

/**
 * Microsoft Clarity — Heatmaps & Session-Analyse.
 *
 * Lädt AUSSCHLIESSLICH nach aktiver Einwilligung (Kategorie "statistics") und nur,
 * wenn eine Project-ID via NEXT_PUBLIC_CLARITY_ID gesetzt ist. Clarity setzt Cookies
 * und ist damit einwilligungspflichtig (§ 25 Abs. 1 TDDDG, Art. 6 Abs. 1 lit. a DSGVO).
 * Ohne Consent bzw. ohne ID passiert nichts.
 *
 * Setup:
 *  1. clarity.microsoft.com → Projekt für steakakademie.de anlegen
 *  2. Project-ID (z. B. "abcd1234ef") als NEXT_PUBLIC_CLARITY_ID in .env(.local) setzen
 *  3. Im Clarity-Projekt: Masking auf "strict" + AVV/DPA bestätigen
 *
 * Die Project-ID ist öffentlich (steht ohnehin im Client-Code) und daher fest
 * hinterlegt — analog zur Plausible-Domain. Per NEXT_PUBLIC_CLARITY_ID überschreibbar.
 */
const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID || 'wv3l573awi';

let injected = false;

function injectClarity(id: string) {
  if (injected || typeof window === 'undefined') return;
  if (document.getElementById('ms-clarity')) {
    injected = true;
    return;
  }
  const s = document.createElement('script');
  s.id = 'ms-clarity';
  s.type = 'text/javascript';
  s.async = true;
  s.innerHTML =
    '(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};' +
    't=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;' +
    'y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})' +
    `(window,document,"clarity","script","${id}");`;
  document.head.appendChild(s);
  injected = true;
}

export default function ClarityScript() {
  useEffect(() => {
    if (!CLARITY_ID) return;

    if (hasStatisticsConsent()) injectClarity(CLARITY_ID);

    const onChange = (e: Event) => {
      const detail = (e as CustomEvent<ConsentState>).detail;
      if (detail?.statistics) injectClarity(CLARITY_ID);
      // Widerruf: Clarity-Cookies bestmöglich entfernen; volle Wirkung ab nächstem Reload.
      else clearClarityCookies();
    };
    window.addEventListener(CONSENT_CHANGE_EVENT, onChange);
    return () => window.removeEventListener(CONSENT_CHANGE_EVENT, onChange);
  }, []);

  return null;
}

function clearClarityCookies() {
  if (typeof document === 'undefined') return;
  const host = window.location.hostname;
  const domains = [host, `.${host}`, `.${host.split('.').slice(-2).join('.')}`];
  document.cookie.split(';').forEach((c) => {
    const name = c.split('=')[0]?.trim();
    if (name && (name.startsWith('_cl') || name === 'CLID' || name === 'MUID')) {
      domains.forEach((d) => {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${d}`;
      });
    }
  });
}
