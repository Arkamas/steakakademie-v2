'use client';

import { useEffect, useState } from 'react';
import { hasAnalyticsConsent } from '@/lib/consent';

export default function ClarityScript() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (hasAnalyticsConsent()) {
      setEnabled(true);
      return;
    }
    const handler = () => setEnabled(true);
    window.addEventListener('sa:consent:analytics', handler);
    return () => window.removeEventListener('sa:consent:analytics', handler);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    import('@microsoft/clarity').then(({ default: Clarity }) => {
      Clarity.init('wv3l573awi');
    });
  }, [enabled]);

  return null;
}
