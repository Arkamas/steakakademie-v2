'use client';

import { openConsentSettings } from '@/lib/consent';

/** Footer-Link: öffnet den Consent-Dialog erneut (Widerruf/Änderung der Einwilligung). */
export default function ConsentSettingsLink({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={openConsentSettings}
      className={['transition-colors duration-150', className].filter(Boolean).join(' ')}
    >
      Cookie-Einstellungen
    </button>
  );
}
