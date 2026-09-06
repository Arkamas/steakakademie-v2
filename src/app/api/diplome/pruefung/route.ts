export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { z } from 'zod';
import { createClient as createAdminClient, type SupabaseClient } from '@supabase/supabase-js';
import { guardRequest, jsonError, isAdminRequest, userIdFromRequest } from '@/lib/api/guard';
import { bewerte } from '@/lib/diplome/fragen';
import {
  DIPLOM_COURSE_SLUG,
  ERSTE_BEZAHLSTUFE,
  QUIZ_FRAGEN_JE_MODUL,
  isStufeKey,
  stufeByKey,
} from '@/lib/diplome/stufen';

/**
 * POST /api/diplome/pruefung — die einzige Stelle, die ein Pruefungsergebnis
 * verbindlich feststellt und in course_progress schreibt.
 *
 * Warum es diese Route gibt (Audit 06.09.2026, Showstopper S1):
 *  - Vorher bewertete der Browser und schrieb selbst per supabase-js in
 *    course_progress — mit `status: 'bestanden'` unabhaengig vom Ergebnis.
 *  - Die RLS liess das zu (users_insert_own_progress prueft nur user_id).
 *    Jedes Konto konnte sich „Master of Steak" eintragen.
 *  - Die Pruefungen der Bezahlstufen waren frei, nur der Lernstoff gesperrt.
 * Jetzt: Server bewertet, Server prueft die Berechtigung, Server schreibt
 * mit service_role. Die Nutzer-Schreibrechte auf course_progress sind per
 * Migration entzogen.
 *
 * Antwort: { score, bestanden, badge, ergebnisse[], gespeichert, hinweis? }
 *  - gespeichert=false + hinweis, wenn kein Login (Stufe 1 darf anonym
 *    geuebt werden, aber nichts wird eingetragen) oder Speichern unmoeglich.
 */

const Body = z.object({
  modul: z.string().min(1).max(32),
  antworten: z.array(z.number().int().min(-1).max(16)).length(QUIZ_FRAGEN_JE_MODUL),
});

export async function POST(req: Request) {
  const guard = await guardRequest(req, {
    key: 'diplome-pruefung',
    rate: { limit: 30, windowMs: 10 * 60 * 1000 },
    schema: Body,
    auth: 'none',
  });
  if (!guard.ok) return guard.response;

  const { modul, antworten } = guard.body;
  if (!isStufeKey(modul)) return jsonError(400, 'Unbekanntes Modul.');
  const stufe = stufeByKey(modul)!;

  const admin = isAdminRequest(req);
  const userId = await userIdFromRequest(req);
  const bezahlstufe = stufe.nr >= ERSTE_BEZAHLSTUFE;

  // Berechtigung fuer Stufe 2–5: Admin oder aktive Buchung.
  if (bezahlstufe && !admin) {
    if (!userId) return jsonError(401, 'Für diese Prüfung musst du angemeldet sein.');
    const adminDb = adminClient();
    if (!adminDb) return jsonError(503, 'Prüfung derzeit nicht verfügbar.');
    const zugang = await hatDiplomBuchung(adminDb, userId);
    if (!zugang) return jsonError(403, 'diplom_erforderlich');
  }

  const ergebnis = bewerte(modul, antworten);

  let gespeichert = false;
  let hinweis: string | undefined;

  if (!userId) {
    hinweis = 'Ohne Anmeldung wird das Ergebnis nicht gespeichert.';
  } else if (ergebnis.bestanden) {
    const adminDb = adminClient();
    if (!adminDb) {
      hinweis = 'Ergebnis konnte nicht gespeichert werden.';
    } else {
      const { error } = await adminDb.from('course_progress').upsert(
        {
          user_id: userId,
          modul,
          stufe: stufe.nr,
          status: 'bestanden',
          quiz_score: ergebnis.score,
          badge: stufe.badge,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,modul' },
      );
      if (error) {
        console.error('[diplome/pruefung] upsert fehlgeschlagen:', error.message);
        hinweis = 'Ergebnis konnte nicht gespeichert werden.';
      } else {
        gespeichert = true;
      }
    }
  }

  return Response.json({
    score: ergebnis.score,
    bestanden: ergebnis.bestanden,
    badge: ergebnis.bestanden ? stufe.badge : null,
    ergebnisse: ergebnis.ergebnisse,
    gespeichert,
    hinweis,
  });
}

function adminClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createAdminClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

async function hatDiplomBuchung(db: SupabaseClient, userId: string): Promise<boolean> {
  const { data: course } = await db.from('courses').select('id').eq('slug', DIPLOM_COURSE_SLUG).maybeSingle();
  const courseId = (course as { id?: string } | null)?.id;
  if (!courseId) return false;
  const { data: booking } = await db
    .from('bookings')
    .select('status')
    .eq('course_id', courseId)
    .eq('user_id', userId)
    .maybeSingle();
  const status = (booking as { status?: string } | null)?.status;
  return status === 'active' || status === 'confirmed';
}
