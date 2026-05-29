// TEMPORÄRE Diagnose — gibt NUR Booleans zurück, niemals Werte.
// Zweck: prüfen, welche Env-Vars die Server-Funktion zur Laufzeit sieht.
// NACH der Diagnose wieder löschen.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return Response.json({
    DIGISTORE_WEBHOOK_TOKEN: !!process.env.DIGISTORE_WEBHOOK_TOKEN,
    DIGISTORE_WEBHOOK_TOKEN_len: (process.env.DIGISTORE_WEBHOOK_TOKEN || '').length,
    LOOPS_API_KEY: !!process.env.LOOPS_API_KEY,
    SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    LOOPS_MAGIC_LINK_TEMPLATE_ID: !!process.env.LOOPS_MAGIC_LINK_TEMPLATE_ID,
    DIGISTORE_PRODUCT_BEICHTE_5ER: !!process.env.DIGISTORE_PRODUCT_BEICHTE_5ER,
  });
}
