/**
 * Admin-Erkennung — EINE Stelle für den Vergleich mit ADMIN_PASSWORD.
 *
 * Haertung 05.09.2026: Bis dahin stand an sechs Stellen
 * `cookie === process.env.ADMIN_PASSWORD`. Ist die Variable in einer Umgebung
 * nicht gesetzt (Preview-Deployment ohne Scope, lokale Kopie, Build-Gate),
 * vergleicht das `undefined === undefined` — und JEDER Besucher ist Admin:
 * /admin, /api/admin/*, /api/pm-agent/* und die Volltexte der Bezahl-Lektionen
 * stehen dann offen. Ohne gesetztes Passwort gibt es ab jetzt keinen Admin.
 */
export function istAdminPasswort(value: string | null | undefined): boolean {
  const pw = process.env.ADMIN_PASSWORD;
  return typeof pw === 'string' && pw.length > 0 && typeof value === 'string' && value === pw;
}
