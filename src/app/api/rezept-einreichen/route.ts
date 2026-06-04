/**
 * POST /api/rezept-einreichen   (application/json)
 *
 * Flow:
 *  1. Auth — eingeloggter Nutzer (Kosten-/Spam-Schutz, Attribution für Hall of Fame)
 *  2. Input validieren (Zod, Spiegel des Frontend-Schemas)
 *  3. KI-Moderation (Doppel-Tor: safe + is_recipe) via generateObject
 *  4. Status ableiten: approved | needs_review | rejected
 *  5. Slug erzeugen (eindeutig), Insert via Service-Role
 *  6. Antwort { status, slug?, message }
 */

import { anthropic } from '@ai-sdk/anthropic';
import { generateObject } from 'ai';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import {
  RezeptVerdictSchema,
  MODERATION_SYSTEM,
  buildModerationPrompt,
} from '@/lib/rezept/moderation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const EINHEITEN = ['g', 'kg', 'ml', 'l', 'EL', 'TL', 'Stück', 'Bund', 'Prise', 'Msp.'] as const;

const InputSchema = z.object({
  titel: z.string().min(3).max(70),
  beschreibung: z.string().min(20).max(200),
  portionen: z.string().min(1).max(20),
  zubereitungszeit: z.string().min(1).max(20),
  zutaten: z
    .array(
      z.object({
        menge: z.string().min(1).max(20),
        einheit: z.enum(EINHEITEN),
        name: z.string().min(2).max(80),
      }),
    )
    .min(1)
    .max(40),
  schritte: z
    .array(z.object({ beschreibung: z.string().min(10).max(1200) }))
    .min(1)
    .max(30),
});

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 60) || 'rezept';
}

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY fehlt.' }, { status: 500 });
  }

  // 1) Auth
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { error: 'Bitte melde dich an, um ein Rezept einzureichen.', needsLogin: true },
      { status: 401 },
    );
  }

  // 2) Input
  let input: z.infer<typeof InputSchema>;
  try {
    const body = await req.json();
    input = InputSchema.parse(body);
  } catch {
    return NextResponse.json({ error: 'Ungültige Eingabe.' }, { status: 400 });
  }

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  // 3) KI-Moderation
  let verdict;
  try {
    const result = await generateObject({
      model: anthropic(process.env.MODERATION_MODEL ?? 'claude-3-5-haiku-latest'),
      schema: RezeptVerdictSchema,
      system: MODERATION_SYSTEM,
      prompt: buildModerationPrompt({
        title: input.titel,
        description: input.beschreibung,
        portions: input.portionen,
        prep_time: input.zubereitungszeit,
        ingredients: input.zutaten,
        steps: input.schritte,
      }),
    });
    verdict = result.object;
  } catch (err) {
    console.error('[rezept-einreichen] moderation failed', err);
    return NextResponse.json(
      { error: 'Die KI-Prüfung ist momentan nicht erreichbar. Bitte später erneut versuchen.' },
      { status: 503 },
    );
  }

  // 4) Status ableiten
  let status: 'approved' | 'needs_review' | 'rejected';
  if (!verdict.safe || !verdict.is_recipe) {
    status = 'rejected';
  } else if (verdict.quality_score >= 65) {
    status = 'approved';
  } else if (verdict.quality_score >= 45) {
    status = 'needs_review';
  } else {
    status = 'rejected';
  }

  // Autor-Name (für Hall of Fame): Profil-Anzeigename > E-Mail-Lokalteil
  let authorName = user.email?.split('@')[0] ?? 'Pitmaster';
  const { data: profile } = await admin
    .from('profiles')
    .select('display_name')
    .eq('user_id', user.id)
    .maybeSingle();
  if (profile?.display_name) authorName = profile.display_name;

  // 5) Slug eindeutig machen
  const base = slugify(input.titel);
  let slug = base;
  for (let n = 2; n < 50; n++) {
    const { data: clash } = await admin
      .from('user_recipes')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();
    if (!clash) break;
    slug = `${base}-${n}`;
  }

  const { error: insErr } = await admin.from('user_recipes').insert({
    user_id: user.id,
    author_name: authorName,
    slug,
    title: input.titel,
    description: input.beschreibung,
    portions: input.portionen,
    prep_time: input.zubereitungszeit,
    ingredients: input.zutaten,
    steps: input.schritte,
    status,
    moderation: verdict,
    rejection_reason: status === 'rejected' ? verdict.user_message : null,
    quality_score: verdict.quality_score,
    published_at: status === 'approved' ? new Date().toISOString() : null,
  });

  if (insErr) {
    console.error('[rezept-einreichen] insert failed', insErr);
    return NextResponse.json({ error: 'Speichern fehlgeschlagen.' }, { status: 500 });
  }

  // 6) Antwort
  if (status === 'approved') {
    return NextResponse.json({
      status,
      slug,
      message: verdict.user_message || 'Dein Rezept ist freigegeben und jetzt live.',
    });
  }
  if (status === 'needs_review') {
    return NextResponse.json({
      status,
      message:
        verdict.user_message ||
        'Dein Rezept sieht gut aus und wird noch kurz redaktionell geprüft. Es erscheint in Kürze.',
    });
  }
  return NextResponse.json({
    status,
    message:
      verdict.user_message ||
      'Diese Einreichung entspricht noch nicht unseren Standards. Schau dir gerne veröffentlichte Rezepte als Orientierung an.',
  });
}
