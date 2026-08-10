import NewsletterSignup from '@/components/ui/NewsletterSignup';

/**
 * Wochenstart-Erinnerung im Plan — nutzt die zentrale NewsletterSignup-Komponente
 * (DSGVO-Consent, Honeypot, Double-Opt-In-Erfolgszustand) mit Plan-spezifischer
 * Ansprache. Segmentierung über source="mein-protokoll-plan".
 */
export default function PlanNewsletter() {
  return (
    <NewsletterSignup
      source="mein-protokoll-plan"
      eyebrow="Wochenstart-Erinnerung"
      headline="Damit du jede Woche dranbleibst."
      subline="Jeden Montag eine kurze Erinnerung mit dem Wochenthema, einem Tipp zum Cut und der einen Frage, die dich scharf macht. Kein Spam — nur die Dinge, die diese Woche zählen."
      cta="Aktivieren"
      className="print:hidden my-8"
    />
  );
}
