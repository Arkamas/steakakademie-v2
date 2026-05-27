import type { Metadata } from 'next';
import MarcoWidget from '@/components/ai/MarcoWidget';
import SmokeEffect from '@/components/ui/SmokeEffect';
import PlausibleScript from '@/components/analytics/PlausibleScript';
import GoogleAnalytics from '@/components/analytics/GoogleAnalytics';
import ClarityScript from '@/components/analytics/ClarityScript';
import CookieConsentBanner from '@/components/consent/CookieConsentBanner';
import ExitIntent from '@/components/ui/ExitIntent';
import { organizationSchema, websiteSchema } from '@/lib/schema';
import './globals.css';

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
        url: '/images/og-default.jpg',
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
    <html lang="de">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
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
        <PlausibleScript />
        {/* GA4 + Clarity: nur nach expliziter Einwilligung (TTDSG §25 + DSGVO Art. 6 I a) */}
        <GoogleAnalytics />
        <ClarityScript />
        <CookieConsentBanner />
      </body>
    </html>
  );
}
