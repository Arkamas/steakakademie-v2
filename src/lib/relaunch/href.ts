/**
 * Verweise innerhalb der Relaunch-Vorschau halten.
 *
 * Die Katalogdaten und die Contentlayer-Dokumente tragen die LIVE-URLs — die
 * URLs, die nach dem Umschalten gelten (keine Slug-Änderung, SEO-Kriterium).
 * Solange der Relaunch parallel unter /relaunch läuft, würde ein Klick darauf
 * die Vorschau verlassen und im alten Design landen. Für die Bereiche, für die
 * schon eine Relaunch-Vorlage existiert, setzen wir deshalb /relaunch davor.
 *
 * WARUM EIGENE DATEI (05.09.2026): Die Funktion stand in Katalog.tsx — einer
 * Client-Komponente. Ein Server-Bauteil, das sie von dort importiert, bekommt
 * keine Funktion, sondern einen Client-Verweis; die Suchseite quittierte das
 * zur Laufzeit mit „(0 , c.s) is not a function" (im Build unsichtbar, weil
 * die Seite dynamisch ist). Gemeinsam genutzte Logik gehört nicht in ein
 * 'use client'-Modul.
 */
const IM_RELAUNCH = ['/streitfaelle/', '/rezepte/', '/vergleich/', '/diplome'];

export function relaunchHref(href: string): string {
  return IM_RELAUNCH.some((p) => href.startsWith(p)) ? `/relaunch${href}` : href;
}
