import 'server-only';
import { cookies } from 'next/headers';

/**
 * Admin-Erkennung ueber den `admin_auth`-Cookie — die EINE sichere Fassung.
 *
 * Vorher stand an drei Stellen der rohe Vergleich
 * `cookies().get('admin_auth')?.value === process.env.ADMIN_PASSWORD`.
 * Ist ADMIN_PASSWORD nicht gesetzt (Preview-Scope, frische Umgebung), ergibt
 * das `undefined === undefined` — und JEDER Besucher ist Admin, inklusive
 * Umgehung der Diplom-Paywall. Audit 06.09.2026.
 *
 * Fuer Route Handler mit `Request` gibt es das Gegenstueck
 * `isAdminRequest()` in src/lib/api/guard.ts; diese Funktion hier ist fuer
 * Server Components und Routen, die `cookies()` nutzen.
 */
export function adminPasswortGesetzt(): boolean {
  const pw = process.env.ADMIN_PASSWORD;
  return typeof pw === 'string' && pw.length >= 8;
}

export function isAdminCookie(): boolean {
  if (!adminPasswortGesetzt()) return false;
  const value = cookies().get('admin_auth')?.value;
  return typeof value === 'string' && value.length > 0 && value === process.env.ADMIN_PASSWORD;
}
