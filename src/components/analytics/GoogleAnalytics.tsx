'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';
import { hasAnalyticsConsent } from '@/lib/consent';

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export default function GoogleAnalytics() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    // Beim Mount prüfen ob Consent bereits gegeben
    if (hasAnalyticsConsent()) {
      setEnabled(true);
      return;
    }
    // Auf späteren Consent-Event warten (von CookieConsentBanner)
    const handler = () => setEnabled(true);
    window.addEventListener('sa:consent:analytics', handler);
    return () => window.removeEventListener('sa:consent:analytics', handler);
  }, []);

  if (!enabled || !GA_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}', {
            anonymize_ip: true,
            cookie_flags: 'SameSite=None;Secure'
          });
        `}
      </Script>
    </>
  );
}
