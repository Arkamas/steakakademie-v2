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
  webpack(config, { isServer, webpack }) {
    if (!isServer) {
      // Browser-Tracing des Sentry-SDK aus dem Client-Bundle entfernen
      // (Perf-Audit 02.09.2026, Begruendung in sentry.client.config.ts).
      // Nur Client: der Server behaelt Tracing fuer das Agent-Monitoring.
      config.plugins.push(new webpack.DefinePlugin({ __SENTRY_TRACING__: false }));
    }
    return config;
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    // Optimierte Bilder einen Tag lang cachen (Standard: 60 s). Live gemessen
    // am 02.09.2026: /_next/image kam mit max-age=0 zurueck, der Browser hat
    // also jedes Bild bei jeder Navigation neu angefragt und Vercel hat die
    // Transformation nach einer Minute verworfen. Ein Tag ist der Kompromiss
    // zwischen Wiederbesuch-Tempo und der Sichtbarkeit ausgetauschter Motive
    // (Austausch unter gleichem Dateinamen wird spaetestens nach 24 h sichtbar).
    minimumCacheTTL: 86400,
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
      // Bilder und Videos aus public/: ohne diese Regel liefert Vercel
      // max-age=0 und der Browser fragt jedes Bild bei jeder Navigation neu an
      // (Messung 02.09.2026). Ein Tag frisch, danach eine Woche
      // stale-while-revalidate — Wiederbesucher sehen die Seite sofort, ein
      // ausgetauschtes Motiv unter gleichem Namen spaetestens nach 24 h.
      {
        source: '/(images|videos)/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' },
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
 *
 * NUR IN DER PRODUKTION HOCHLADEN (01./02.09.2026)
 * ------------------------------------------------
 * Am 01.09.2026 ist der Preview-Deploy von PR #35 gescheitert — an einer
 * Markdown-Aenderung ohne eine einzige Zeile Code. Ursache war nicht der
 * Commit, sondern die Sentry-API: fuenf Bloecke HTTP 504 ("Downstream
 * timeout") zwischen 08:10 und 08:38, jedes Mal mit Retries. Der Build lief
 * 45 Minuten und 3 Sekunden und wurde dann von Vercel im Schritt
 * "Collecting page data" abgeschnitten — ohne Fehlermeldung im Log. Der
 * Neuanstoss danach war in 4 Minuten fertig.
 *
 * Weder das Plugin noch sentry-cli kennen eine Timeout-Option (geprueft in
 * @sentry/bundler-plugin-core 10.70.0 und @sentry/cli — es gibt kein
 * SENTRY_*_TIMEOUT). Der einzige wirksame Deckel ist deshalb, den Upload
 * dort wegzulassen, wo er nichts bringt:
 *
 *   Produktion  → Release anlegen + Source-Maps hochladen (unveraendert).
 *                 Lesbare Stacktraces sind genau hier den Aufwand wert.
 *   Preview     → kein Release, kein Deploy-Eintrag, kein Upload. Die Maps
 *                 eines Vorschau-Builds sieht ohnehin nie jemand an.
 *   Lokal       → wie Preview (VERCEL_ENV ist nicht gesetzt).
 *
 * NOTAUSGANG: Haengt ein PRODUKTIONS-Build an Sentry, laesst sich der Upload
 * ohne Code-Aenderung abschalten — Vercel-Env `SENTRY_SOURCEMAPS=off`
 * setzen und neu deployen. Danach wieder entfernen, sonst bleiben die
 * Stacktraces dauerhaft minifiziert.
 *
 * errorHandler: Selbst in der Produktion darf ein Sentry-Ausfall den Build
 * nicht mehr rot machen. Ohne diesen Handler wirft das Plugin und bricht ab;
 * mit ihm bleibt eine Warnung im Log stehen und der Deploy laeuft durch.
 * Er verhindert den Abbruch, nicht die Wartezeit — dafuer ist der
 * Notausgang oben da.
 */
const SENTRY_UPLOAD =
  process.env.VERCEL_ENV === 'production' && process.env.SENTRY_SOURCEMAPS !== 'off';

export default withSentryConfig(withContentlayer(nextConfig), {
  org: 'steakakademie-4t',
  project: 'javascript-nextjs',
  silent: !process.env.CI,

  widenClientFileUpload: true,
  hideSourceMaps: true,

  // Bundle-Deckel (Perf-Audit 02.09.2026): Der Sentry-Browser-Client lag mit
  // ~108 kB (komprimiert) als groesster Einzelchunk in JEDEM First-Load-Bundle.
  // Replay ist per Config aus (Sample-Rate 0, siehe sentry.client.config.ts),
  // Browser-Tracing wird bewusst nicht mehr genutzt (dort ebenfalls entfernt),
  // Debug-Statements gehoeren nicht in die Produktion. Diese Schalter lassen
  // den Bundler den zugehoerigen Code komplett wegwerfen statt ihn nur nicht
  // aufzurufen. Fehler-Erfassung (Exceptions, unhandled rejections, Breadcrumbs)
  // bleibt vollstaendig erhalten.
  // excludeTracing steht hier BEWUSST NICHT: der Schalter wirkt auf alle
  // Kompilate, auch den Server — dort ist Tracing die Grundlage des
  // Agent-Monitorings der KI-Routen (sentry.server.config.ts). Das Browser-
  // Tracing wird stattdessen client-seitig ueber __SENTRY_TRACING__ im
  // webpack-Block von nextConfig abgeschaltet.
  bundleSizeOptimizations: {
    excludeDebugStatements: true,
    excludeReplayIframe: true,
    excludeReplayShadowDom: true,
    excludeReplayWorker: true,
  },
  // Entfernt Sentry-Debug-Logs aus dem Produktions-Bundle.
  webpack: { treeshake: { removeDebugLogging: true } },

  // Plugin-Telemetrie aus, in JEDER Umgebung. Sie meldet Fehler- und
  // Performancedaten des Build-Plugins an Sentry und dient Sentry dazu, das
  // eigene Plugin zu verbessern - fuer uns bringt sie nichts. Nach dem
  // 45-Minuten-Abbruch vom 01.09.2026 ist jeder Netzaufruf zu Sentry waehrend
  // des Builds ein Risiko ohne Gegenwert. Damit ist ein Preview-Build
  // vollstaendig Sentry-frei; in der Produktion bleibt genau ein Kontakt
  // uebrig, der etwas liefert: der Source-Map-Upload.
  telemetry: false,

  // Der Deckel: ausserhalb der Produktion faellt jeder Netzaufruf zu Sentry weg.
  sourcemaps: { disable: !SENTRY_UPLOAD },
  release: {
    create: SENTRY_UPLOAD,
    finalize: SENTRY_UPLOAD,
    // Der Deploy-Eintrag war im Fehlerfall der erste haengende Aufruf
    // (`sentry-cli releases deploys ... new --env vercel-preview`).
    deploy: SENTRY_UPLOAD ? undefined : false,
  },

  errorHandler: (err) => {
    console.warn('[sentry] Upload uebersprungen, Build laeuft weiter:', err.message);
  },

  // Kein tunnelRoute: der Ingest-Host steht offen in der CSP. Ehrlicher
  // gegenueber Adblockern und spart Function-Aufrufe.
});
