import { withContentlayer } from 'next-contentlayer2';
import { withSentryConfig } from '@sentry/nextjs';

/**
 * Content-Security-Policy (KAN-75, Art. 32 DSGVO — 20.08.2026)
 * ============================================================
 * Erlaubt ist genau das, was die Seite nachweislich laedt. Alles andere wird
 * vom Browser blockiert — insbesondere nachtraeglich eingeschleuste Skripte,
 * die Daten an fremde Hosts schicken wuerden.
 *
 * Woher die Eintraege stammen (Inventur 20.08.2026):
 *   plausible.io   Reichweitenmessung, laedt ohne Einwilligung (cookielos)
 *   *.clarity.ms   Microsoft Clarity, laedt NUR nach Einwilligung
 *   *.supabase.co  Datenbank-Abfragen aus dem Browser (NEXT_PUBLIC_SUPABASE_URL)
 * Schriften sind ueber next/font self-hosted, es gibt keine iframes und keine
 * Formulare mit externem action — deshalb font-src 'self' und form-action 'self'.
 *
 * WARUM 'unsafe-inline' bei script-src, obwohl das die Schutzwirkung mindert:
 * Der saubere Weg waeren Nonces. Next vergibt sie aber nur ueber die Middleware,
 * und ein Nonce pro Anfrage macht jede Seite dynamisch — das wuerde die
 * statische Generierung aller 497 Seiten aushebeln. Der Preis waere hier hoeher
 * als der Gewinn. Was die Richtlinie trotzdem leistet: Ein eingeschleustes
 * <script src="fremder-host"> laedt nicht, und exfiltrieren kann ein Angreifer
 * nur zu den drei oben genannten Zielen.
 *
 * Aendern heisst pruefen: Nach jeder Aenderung die Seiten mit externen Skripten
 * im Browser oeffnen und die Konsole auf CSP-Verstoesse ansehen. Eine zu strenge
 * Richtlinie bricht still — es gibt keine Fehlermeldung auf der Seite.
 *
 * 'unsafe-eval' NUR im Dev-Modus: Der Next-Dev-Server (React Refresh,
 * Source-Maps via eval) braucht es, sonst bleibt die Seite unter `next dev`
 * weiss und die E2E-Tests laufen gegen eine leere Seite. `next build` setzt
 * NODE_ENV=production — dort wird der Zusatz nie ausgegeben.
 */
const isDev = process.env.NODE_ENV === 'development';

const CSP = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''} https://plausible.io https://*.clarity.ms`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.clarity.ms",
  "font-src 'self' data:",
  // *.ingest.de.sentry.io: Fehler- und Performance-Meldungen (EU-Region).
  // Fehlt der Host hier, blockiert der Browser jeden Event-Versand STILL —
  // Sentry bleibt leer und niemand merkt es.
  "connect-src 'self' https://plausible.io https://*.clarity.ms https://*.supabase.co https://*.ingest.de.sentry.io",
  "frame-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  'upgrade-insecure-requests',
].join('; ');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Ohne diesen Schalter laedt Next 14 src/instrumentation.ts nicht, und ohne
  // die Datei bleibt die Telemetrie im Marco-Chat wirkungslos (No-op-Tracer).
  // Ab Next 15 ist der Hook stabil und die Zeile entfaellt.
  experimental: { instrumentationHook: true },
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      { protocol: 'https', hostname: '**.steakakademie.de' },
      // 29.08.2026: images.unsplash.com ist hier BEWUSST entfernt — aus demselben
      // Grund wie die Amazon-Hosts unten. Die 13 Seiten, die von dort hotlinkten,
      // liegen jetzt lokal unter public/images/ (scripts/bild-ingest.mjs); ein
      // externer Request beim Seitenaufruf entfaellt damit ersatzlos.
      //
      // Der Eintrag ist der Riegel: Ohne ihn scheitert ein versehentlicher
      // Rueckfall auf einen Hotlink sichtbar beim Rendern, statt still wieder
      // Besucher-IPs an einen US-Host zu schicken. Wieder aufnehmen nur mit
      // Einwilligungsschranke davor.
      //
      // KAN-71 (20.08.2026): Die drei Amazon-Hosts sind hier BEWUSST entfernt.
      //
      // Datenschutz: Ein von Amazon geladenes Produktbild schickt die IP jedes
      // Besuchers beim Scrollen an Amazon — ohne Einwilligung ein Verstoss
      // (Art. 6 DSGVO / TDDDG). Genau das hat das Anwalts-Testat beanstandet.
      //
      // Lizenz: Ein lokaler Spiegel waere kein Ausweg. Das PartnerNet erlaubt
      // Produktbilder grundsaetzlich nur ueber die API-Auslieferung mit kurzen
      // Cache-Fristen; dauerhaft gespeicherte Kopien sind davon nicht gedeckt.
      // Deshalb bleiben die handgepflegten Platzhalter (ProductImagePlaceholder).
      //
      // Diese Zeilen sind der eigentliche Riegel: Ohne passenden remotePattern
      // scheitert ein versehentlicher Rueckfall sichtbar beim Rendern, statt
      // still eine Verletzung zu produzieren. Wieder aufnehmen nur mit
      // geklaerter Lizenz UND einer Einwilligungsschranke davor.
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Content-Security-Policy', value: CSP },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
  async redirects() {
    return [
      // Glossar-Duplikat zusammengelegt (27.08.2026): "Smoker-Temperatur" gab es
      // zweimal, unter /glossar/smoker-temp und /glossar/smoker-temperatur —
      // gleicher Titel, widersprechende Werte (100-130 gegen 100-150 Grad C) und
      // beide bezeichneten die Garraumtemperatur faelschlich als Kerntemperatur.
      // Der laengere Slug ueberlebt; die alte URL leitet dauerhaft dorthin.
      {
        source: '/glossar/smoker-temp',
        destination: '/glossar/smoker-temperatur',
        permanent: true,
      },
    ];
  },
};

/**
 * Sentry-Build-Plugin
 * ===================
 * Laedt Source-Maps hoch (lesbare Stacktraces statt Minifikat) und entfernt
 * sie danach aus dem Deploy (hideSourceMaps) — der Quelltext liegt nicht
 * oeffentlich im Browser.
 *
 * Braucht SENTRY_AUTH_TOKEN (Vercel-Env, Secret). Fehlt der Token, bricht
 * der Build NICHT ab — es fehlen nur die Source-Maps.
 */
export default withSentryConfig(withContentlayer(nextConfig), {
  org: 'steakakademie-4t',
  project: 'javascript-nextjs',
  silent: !process.env.CI,

  widenClientFileUpload: true,
  hideSourceMaps: true,
  // Entfernt Sentry-Debug-Logs aus dem Produktions-Bundle.
  webpack: { treeshake: { removeDebugLogging: true } },

  // Kein tunnelRoute: der Ingest-Host steht offen in der CSP. Ehrlicher
  // gegenueber Adblockern und spart Function-Aufrufe.
});
