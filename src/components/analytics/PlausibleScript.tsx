import Script from 'next/script';

/**
 * Plausible Analytics — Privacy-First, DSGVO-konform
 *
 * Setup:
 *  1. Account anlegen: https://plausible.io
 *  2. Site hinzufügen: steakakademie.de
 *  3. Dieses Script wird automatisch eingebunden
 *
 * Custom Events (in Komponenten via window.plausible()):
 *  plausible('Newsletter_Subscribed', { props: { source: 'mid-article' } })
 *  plausible('Diplom_Started', { props: { level: 'bronze' } })
 *  plausible('Quiz_Completed', { props: { type: grilltyp } })
 *  plausible('KnowledgeBreak_Clicked', { props: { page: '/...' } })
 *
 * Kein Consent-Banner nötig — Plausible speichert keine personenbezogenen Daten,
 * keine Cookies, vollständig DSGVO-konform.
 */
export default function PlausibleScript() {
  return (
    <Script
      defer
      data-domain="steakakademie.de"
      src="https://plausible.io/js/script.tagged-events.js"
      strategy="afterInteractive"
    />
  );
}

/**
 * Type-safe wrapper for Plausible custom events.
 * Usage: trackEvent('Newsletter_Subscribed', { source: 'exit-intent' })
 */
export function trackEvent(
  eventName: string,
  props?: Record<string, string | number | boolean>
) {
  if (typeof window !== 'undefined' && typeof (window as unknown as { plausible?: (n: string, o?: object) => void }).plausible === 'function') {
    (window as unknown as { plausible: (n: string, o?: object) => void }).plausible(eventName, { props });
  }
}
