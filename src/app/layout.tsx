import type { Metadata } from 'next';
import { Playfair_Display, Source_Serif_4, DM_Sans } from 'next/font/google';
import MarcoWidget from '@/components/ai/MarcoWidget';
import SmokeEffect from '@/components/ui/SmokeEffect';
import PlausibleScript from '@/components/analytics/PlausibleScript';
// DIAGNOSE (Crash-Bisect): Consent/Clarity temporär deaktiviert, um zu prüfen,
// ob der Preview-Runtime-Crash von hier kommt. Wird nach dem Test wieder aktiviert.
// import ClarityScript from '@/components/analytics/ClarityScript';
// import ConsentBanner from '@/components/analytics/ConsentBanner';
import ExitIntent from '@/components/ui/ExitIntent';
import { organizationSchema, websiteSchema } from '@/lib/schema';
import './globals.css';

// Self-hosted Google Fonts via next/font — keine externen Requests, kein DSGVO-Risiko
const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair',
  weight: ['400', '500', '600', '700', '800', '900'],
});

const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-source-serif',
  weight: ['400', '500', '600', '700'],
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-dm-sans',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://steakakademie.de'),
  title: {
    default: 'Steakakademie — Deutschlands BBQ-Wissensplattform',
    template: '%s | Steakakademie',
  },
  description:
    'Die methodisch tiefste BBQ-Wissensplattform auf Deutsch. Cuts, Techniken, Thermometer-Tests und Grillmeister-Diplome. Für Hobbygriller, die es ernst meinen.',
  openGraph: {
    type: 'website',
    locale: 'de_DE',
    url: 'https://steakakademie.de',
    siteName: 'Steakakademie',
    images: [
      {
        url: '/api/og',
        width: 1200,
        height: 630,
        alt: 'Steakakademie — BBQ Wissen auf Deutsch',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@steakakademie',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de" className={`${playfair.variable} ${sourceSerif.variable} ${dmSans.variable}`}>
      <head>
        {/* Global Schema.org — Organization + WebSite + SearchAction */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema()) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema()) }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-surface-base antialiased">
        {children}
        <SmokeEffect />
        <MarcoWidget />
        <ExitIntent />
        {/* Plausible: cookieless, ohne Einwilligung (§ 25 Abs. 2 TDDDG) — läuft immer. */}
        <PlausibleScript />
        {/* DIAGNOSE (Crash-Bisect): temporär deaktiviert.
        <ClarityScript />
        <ConsentBanner /> */}
      </body>
    </html>
  );
}
