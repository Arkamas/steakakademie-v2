/**
 * POST /api/kochwissen   (application/json)
 *
 * RAG-Endpoint der Wissensdatenbank: Frage → Vektor-Retrieval (Voyage + pgvector)
 * → belegte Antwort durch Claude, geerdet an den gefundenen Wissenseinträgen.
 *
 * Body: { frage: string, kategorie?: string, cut?: string, limit?: number }
 * Antwort: { antwort: string, treffer: Array<{ titel, quelle, kategorie, similarity }> }
 *
 * Grundsatz: Claude antwortet AUSSCHLIESSLICH aus dem gelieferten Kontext und
 * erfindet keine Temperaturen/Zeiten/Mengen. Jede Antwort nennt die Quellen.
 *
 * Siehe docs/wissensdatenbank-architektur.md.
 */

import { anthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';
import { NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { searchKochwissen, buildKontext, type Treffer } from '@/lib/kochwissen/retrieval';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// Qualitätssensibel (präzise Technik/Temperatur) → Opus. Für Kosten ggf. auf
// 'claude-sonnet-4-6' wechseln.
const MODEL = 'claude-opus-4-8';

const SYSTEM_PROMPT = `Du bist der Wissens-Assistent der Steakakademie.
Beantworte die Frage AUSSCHLIESSLICH auf Basis der bereitgestellten Wissenseinträge.
Regeln:
- Erfinde nichts. Insbesondere keine Temperaturen, Zeiten, Mengen oder Fakten, die nicht im Kontext stehen.
- Übernimm Zahlenwerte (Temperaturen, Zeiten) wörtlich aus den Einträgen.
- Wenn der Kontext die Frage nicht beantwortet, sage das offen, statt zu raten.
- Antworte auf Deutsch, präzise und praxisnah.
- Nenne am Ende die genutzten Quellen als Liste der "Quelle-Fundstelle"-Angaben.`;

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY fehlt.' }, { status: 500 });
  }
  if (!process.env.VOYAGE_API_KEY) {
    return NextResponse.json({ error: 'VOYAGE_API_KEY fehlt.' }, { status: 500 });
  }

  // 1) Eingabe
  let frage: string;
  let kategorie: string | null;
  let cut: string | null;
  let limit: number;
  try {
    const body = await req.json();
    frage = String(body.frage ?? '').trim();
    kategorie = body.kategorie ? String(body.kategorie) : null;
    cut = body.cut ? String(body.cut) : null;
    limit = Math.min(Math.max(parseInt(body.limit, 10) || 8, 1), 20);
    if (!frage) throw new Error('leer');
  } catch {
    return NextResponse.json({ error: 'Ungültige Eingabe — "frage" fehlt.' }, { status: 400 });
  }

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  // 2) Query-Embedding + Vektor-Retrieval
  let treffer: Treffer[];
  try {
    treffer = await searchKochwissen(admin, frage, { kategorie, cut, limit });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: `Retrieval fehlgeschlagen: ${msg}` }, { status: 502 });
  }

  if (treffer.length === 0) {
    return NextResponse.json({
      antwort: 'Dazu liegt in der Wissensdatenbank (noch) kein passender Eintrag vor.',
      treffer: [],
    });
  }

  // 3) Kontext bauen + geerdete Antwort
  const kontext = buildKontext(treffer);

  let antwort: string;
  try {
    const { text } = await generateText({
      model: anthropic(MODEL),
      system: SYSTEM_PROMPT,
      prompt: `Frage: ${frage}\n\nWissenseinträge:\n${kontext}`,
    });
    antwort = text;
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: `Antwort fehlgeschlagen: ${msg}` }, { status: 502 });
  }

  return NextResponse.json({
    antwort,
    treffer: treffer.map((t) => ({
      titel: t.titel,
      quelle: t.quelle,
      kategorie: t.kategorie,
      similarity: t.similarity,
    })),
  });
}
