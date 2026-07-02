'use client';

import { openConsentSettings } from '@/lib/consent';

/** Footer-Link: öffnet den Consent-Dialog erneut (Widerruf/Änderung der Einwilligung). */
export default function ConsentSettingsLink({ className }: { className?: string }) {
  return (
    <button type="button" onClick={openConsentSettings} className={className}>
      Cookie-Einstellungen
    </button>
  );
}
