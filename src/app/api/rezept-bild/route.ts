/**
 * POST /api/rezept-bild   (application/json { slug })
 *
 * Generiert EIN markenkonformes Food-Foto (fal.ai FLUX.1 + Hausstil-LoRA) für ein
 * FREIGEGEBENES Community-Rezept und schreibt die URL nach user_recipes.image_url.
 * Login-Pflicht (Kosten-/Missbrauchsschutz). Die eigentliche Generierung liegt im
 * gemeinsamen Helper, den auch die Admin-Freigabe (Auto-Bild) nutzt.
 */

import { NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { generateRecipeImage } from '@/lib/rezept/generate-image';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 90;

export async function POST(req: Request) {
  // 1) Auth: Login-Pflicht
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Bitte melde dich an.', needsLogin: true }, { status: 401 });
  }

  // 2) Input
  let slug: string;
  try {
    const body = await req.json();
    slug = String(body.slug ?? '').trim();
    if (!slug) throw new Error('no slug');
  } catch {
    return NextResponse.json({ error: 'Ungültige Eingabe.' }, { status: 400 });
  }

  // 3) Generieren (gemeinsamer Helper)
  const r = await generateRecipeImage(slug);
  if (r.error && !r.image_url) {
    return NextResponse.json({ error: r.error }, { status: r.status ?? 500 });
  }
  return NextResponse.json({ image_url: r.image_url, cached: r.cached ?? false });
}
