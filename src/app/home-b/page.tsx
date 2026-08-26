import type { Metadata } from 'next';
import HomePage from '../page';

// ─────────────────────────────────────────────────────────────────────────────
// Startseiten-Variante B — "Editorial Ember" (A/B-Test)
//
// Rendert EXAKT dieselbe Startseite (gleiche Inhalte, gleiche Doktrin-
// Reihenfolge aus src/app/page.tsx — das Hierarchie-Gate prüft weiterhin die
// eine Quelle), nur eingehüllt in den hellen Editorial-Ember-Look
// (.theme-ember in globals.css).
//
// Besucher erreichen diese Route NIE direkt über die URL-Leiste:
// src/middleware.ts rewritet "/" für die B-Hälfte (Cookie sa_ab_home=b)
// intern hierher — die Adresszeile zeigt weiterhin "/".
// Direktaufrufe von /home-b sind unschädlich: noindex + Canonical auf "/".
// Messung: /api/newsletter hängt für B-Besucher "-vb" an die Loops-source.
// ─────────────────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: 'Steakakademie — BBQ Wissen, Cuts & Grillmeister-Diplome',
  robots: { index: false, follow: true },
  alternates: { canonical: 'https://steakakademie.de/' },
};

export default function HomeVariantB() {
  return (
    <div className="theme-ember" data-ab-variant="ember-b">
      <HomePage />
    </div>
  );
}
