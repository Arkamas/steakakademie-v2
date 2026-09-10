import 'server-only';
import { KONTAKT_EMPFAENGER } from '@/lib/kontakt';

/**
 * Meldet eine neue Urkunden-Bestellung an pitmaster@.
 *
 * Bewusst ueber dieselbe Loops-Transaktionsvorlage wie das Kontaktformular
 * (LOOPS_KONTAKT_TEMPLATE_ID): Die Variablen passen, und eine eigene Vorlage
 * waere eine weitere Sache, die vor dem Start in Loops angelegt und gepflegt
 * werden muesste.
 *
 * Scheitert der Versand, ist das kein Grund, die Bestellung abzulehnen — sie
 * steht in der Datenbank und erscheint unter /admin/urkunden. Die Mail ist
 * die Bequemlichkeit, nicht der Nachweis.
 */
export async function meldeBestellung(text: string, absender: string): Promise<boolean> {
  const apiKey = process.env.LOOPS_API_KEY;
  const templateId = process.env.LOOPS_KONTAKT_TEMPLATE_ID;
  if (!apiKey || !templateId) {
    console.warn('[urkunde] LOOPS_API_KEY oder LOOPS_KONTAKT_TEMPLATE_ID fehlt — Bestellung nur gespeichert.');
    return false;
  }

  const d = new Date();
  try {
    const resp = await fetch('https://app.loops.so/api/v1/transactional', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transactionalId: templateId,
        email: KONTAKT_EMPFAENGER,
        // Loops-Variablennamen sind case-sensitive → beide Schreibweisen, wie in /api/kontakt.
        dataVariables: {
          betreff_tag: '[Urkunde]', Betreff_tag: '[Urkunde]',
          name: 'Urkunden-Bestellung', Name: 'Urkunden-Bestellung',
          absender, Absender: absender,
          reply_to: absender, Reply_to: absender,
          nachricht: text, Nachricht: text,
          thema: 'Gedruckte Urkunde', Thema: 'Gedruckte Urkunde',
          datum: d.toLocaleDateString('de-DE', { timeZone: 'Europe/Berlin' }),
          Datum: d.toLocaleDateString('de-DE', { timeZone: 'Europe/Berlin' }),
          zeit: d.toLocaleTimeString('de-DE', { timeZone: 'Europe/Berlin', hour: '2-digit', minute: '2-digit' }),
          Zeit: d.toLocaleTimeString('de-DE', { timeZone: 'Europe/Berlin', hour: '2-digit', minute: '2-digit' }),
        },
      }),
    });
    if (!resp.ok) console.error('[urkunde] loops', resp.status, (await resp.text()).slice(0, 300));
    return resp.ok;
  } catch (e) {
    console.error('[urkunde] loops error', e);
    return false;
  }
}
