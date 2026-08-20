import { withContentlayer } from 'next-contentlayer2';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '**.steakakademie.de' },
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
    return [];
  },
};

export default withContentlayer(nextConfig);
