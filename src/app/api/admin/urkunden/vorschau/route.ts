export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { istAdminPasswort } from '@/lib/admin-auth';
import { dienstClient } from '@/lib/urkunde/produktion';
import { rendereUrkunde, urkundenDatum } from '@/lib/urkunde/render';

/**
 * GET /api/admin/urkunden/vorschau?id=… — die Urkunde ansehen, bevor Geld
 * fliesst.
 *
 * Ist bereits gedruckt worden, zeigt die Vorschau die tatsaechlich an Gelato
 * geschickte Datei. Vorher wird frisch gerendert, mit Platzhalter-Nummer:
 * Die echte Nummer wird erst bei der Freigabe vergeben, damit eine Vorschau
 * keine Luecke in die Nummernfolge reisst.
 *
 * Der Sinn dieser Route ist das Vier-Augen-Prinzip auf einem Dokument, das
 * hinterher gedruckt und verschickt wird: Ein falsch geschriebener Name faellt
 * hier auf und nicht beim Empfaenger.
 */
export async function GET(req: Request) {
  if (!istAdminPasswort(cookies().get('admin_auth')?.value)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Parameter id fehlt.' }, { status: 400 });

  const db = dienstClient();
  if (!db) return NextResponse.json({ error: 'Supabase-Dienstschlüssel fehlt.' }, { status: 503 });

  const { data, error } = await db
    .from('urkunden_bestellungen')
    .select('stufe, name_auf_urkunde, urkunde_nr, druck_datei, freigegeben_am')
    .eq('id', id)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: 'Bestellung nicht gefunden.' }, { status: 404 });

  // Schon produziert: die echte Datei zeigen, nicht eine Neuberechnung.
  if (data.druck_datei) {
    const { data: signiert } = await db.storage.from('urkunden').createSignedUrl(data.druck_datei, 300);
    if (signiert?.signedUrl) return NextResponse.redirect(signiert.signedUrl);
  }

  try {
    const { png } = await rendereUrkunde({
      stufe: data.stufe,
      name: data.name_auf_urkunde,
      datum: urkundenDatum(data.freigegeben_am ? new Date(data.freigegeben_am) : new Date()),
      nr: `Urkunden-Nr. ${data.urkunde_nr ?? 'SA-XXXX-XXXX'}`,
    });
    return new Response(new Uint8Array(png), {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'no-store',
        'Content-Disposition': `inline; filename="vorschau-${id}.png"`,
      },
    });
  } catch (e) {
    const text = e instanceof Error ? e.message : String(e);
    console.error('[urkunde/vorschau]', id, text);
    return NextResponse.json({ error: text }, { status: 500 });
  }
}
