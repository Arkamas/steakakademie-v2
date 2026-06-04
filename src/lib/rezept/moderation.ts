import { z } from 'zod';

/**
 * KI-Moderation für User-Rezepte — zwei Tore:
 *   Tor 1 (safe):       keine Hassrede, Beleidigungen, Diskriminierung, Spam, Werbung, PII.
 *   Tor 2 (is_recipe):  ein echtes, kohärentes Koch-/Grillrezept — kein „geistiger Dünnschiss".
 *
 * Das Modell gibt zusätzlich einen Qualitäts-Score (0–100) und eine höfliche
 * Nutzer-Nachricht zurück. Die Freigabe-Logik (approve / review / reject) liegt
 * in der API-Route, nicht hier — diese Datei liefert nur das Urteil.
 */

export const RezeptVerdictSchema = z.object({
  safe: z
    .boolean()
    .describe('true, wenn KEIN problematischer Inhalt: keine Hassrede, Beleidigungen, Diskriminierung, Gewalt, sexueller Inhalt, Spam, Fremd-Werbung, Links oder personenbezogene Daten.'),
  is_recipe: z
    .boolean()
    .describe('true, wenn es ein ECHTES, kohärentes Koch-/Grillrezept ist: Zutaten ergeben zusammen ein plausibles Gericht, die Schritte verarbeiten die Zutaten logisch (Hitze, Zeit, Technik), Mengen/Zeiten sind realistisch. false bei Unsinn, Platzhaltern, Test-Eingaben oder Metaphern wie „Rezept für Erfolg".'),
  quality_score: z
    .number()
    .min(0)
    .max(100)
    .describe('Gesamtqualität 0–100: Vollständigkeit, Präzision (Temperatur/Zeit/Technik), Originalität, Klarheit. 0 = unbrauchbar, 100 = redaktionsreif.'),
  category_guess: z
    .string()
    .describe('Kurze Einordnung des Gerichts/Stils, z. B. "Texas BBQ — Brisket" oder "Deutsch — Schweinenacken". Leerer String wenn unklar.'),
  reasons: z
    .string()
    .describe('1–2 Sätze interne Begründung des Urteils (Deutsch), für Redaktion/Logs.'),
  user_message: z
    .string()
    .describe('Höfliche, konstruktive Nachricht an den Einreicher auf Deutsch — bei Ablehnung mit konkretem Verbesserungshinweis, bei Freigabe ein anerkennender Satz. Niemals beleidigend.'),
});

export type RezeptVerdict = z.infer<typeof RezeptVerdictSchema>;

export const MODERATION_SYSTEM = `Du bist der Qualitäts- und Sicherheits-Prüfer der Steakakademie — einer seriösen deutschen BBQ-Wissensplattform. Du bewertest von Nutzern eingereichte Rezepte streng, aber fair.

Deine Aufgabe hat ZWEI Tore:

TOR 1 — SICHERHEIT (safe):
Lehne alles ab, was Hassrede, Beleidigungen, Diskriminierung (Herkunft, Religion, Geschlecht, sexuelle Orientierung), Gewaltverherrlichung, sexuelle Inhalte, Spam, Fremd-Werbung, fremde Links/URLs oder personenbezogene Daten (Klarnamen Dritter, Adressen, Telefonnummern) enthält.

TOR 2 — IST ES EIN ECHTES REZEPT? (is_recipe):
Ein gültiges Rezept hat: (a) Zutaten, die zusammen ein plausibles, essbares Gericht ergeben; (b) Zubereitungsschritte, die die Zutaten logisch verarbeiten (Hitze, Zeit, Technik); (c) realistische Mengen und Zeiten. Lehne ab: zusammenhanglosen Unsinn, Platzhalter-/Test-Eingaben („asdf", „Test123", „bla bla"), Trolling, oder Metaphern statt Essen („Rezept für ein glückliches Leben"). Ein Rezept muss ein KOCH-/GRILLREZEPT sein.

BEWERTUNG:
- quality_score 0–100 nach Vollständigkeit, Präzision (Temperatur/Zeit/Technik), Klarheit, Originalität.
- Sei wohlwollend bei ehrlichen Hobby-Rezepten, streng bei Unsinn.

Antworte ausschließlich über das vorgegebene Schema. Die user_message ist immer höflich und konstruktiv — auch bei Ablehnung. Bei klarem Trolling/Hass bleibt die user_message sachlich und knapp ("Diese Einreichung entspricht nicht unseren Regeln.").`;

export function buildModerationPrompt(input: {
  title: string;
  description: string;
  portions?: string;
  prep_time?: string;
  ingredients: { menge: string; einheit: string; name: string }[];
  steps: { beschreibung: string }[];
}): string {
  const zutaten = input.ingredients
    .map((z) => `- ${z.menge} ${z.einheit} ${z.name}`)
    .join('\n');
  const schritte = input.steps
    .map((s, i) => `${i + 1}. ${s.beschreibung}`)
    .join('\n');

  return `Prüfe dieses eingereichte Rezept nach beiden Toren und bewerte es.

TITEL: ${input.title}
KURZBESCHREIBUNG: ${input.description}
PORTIONEN: ${input.portions ?? '—'}
ZUBEREITUNGSZEIT: ${input.prep_time ?? '—'}

ZUTATEN:
${zutaten || '(keine)'}

ZUBEREITUNG:
${schritte || '(keine)'}`;
}
