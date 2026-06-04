/**
 * POST /api/rezept-bild   (application/json { slug })
 *
 * Generiert EIN markenkonformes Food-Foto (fal.ai FLUX.1 dev) für ein
 * freigegebenes Community-Rezept, lädt es in den öffentlichen Supabase-Storage
 * und schreibt die URL nach user_recipes.image_url.
 *
 * Schutz:
 *  - Login-Pflicht (Kosten-/Missbrauchsschutz)
 *  - nur status='approved'
 *  - idempotent: hat das Rezept bereits ein Bild, wird es zurückgegeben (kein 2. Call, keine Kosten)
 */

import { NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 90;

type Zutat = { menge: string; einheit: string; name: string };

// Bild-Prompt-Doktrin (siehe CLAUDE.md): KEINE Wörter wie "photorealistic"/"4K"/"8k"
// (erzeugen den künstlichen Plastik-Look). Stattdessen Textur- + Kamera-Sprache und
// der "sliced"-Trick. Klassifizierung wählt die richtige Fleisch-Doktrin.
const STEAK_RE  = /\b(ribeye|rib-?eye|entrecote|entrecôte|t-?bone|tomahawk|porterhouse|rumpsteak|sirloin|striploin|roastbeef|picanha|wagyu|flank|onglet|hanger|rindersteak|beef steak|steak)\b/i;
const SMOKED_RE = /\b(brisket|pulled pork|spare ?ribs|baby ?back|ribs|rippchen|short ?rib|smoked|pastrami)\b/i;

// Perspektiven-Rotation (deterministisch je Rezept) → Vielfalt statt Einheits-Close-up.
const PERSPECTIVES = [
  'shot from directly above, clean top-down flat lay on a wooden board',
  'shot from a 45-degree angle on a wooden serving board',
  'shot from a low three-quarter angle at plate level',
  'slightly elevated three-quarter angle showing the whole plating on a dark slate',
];
function pickPerspective(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return PERSPECTIVES[h % PERSPECTIVES.length];
}

function styleClause(text: string): string {
  if (SMOKED_RE.test(text))
    return 'cut into clean slices showing a dark, heavily seasoned bark crust and a vivid pink smoke ring, tender and juicy, resting on peach butcher paper';
  if (STEAK_RE.test(text))
    return 'cut into clean thick slices revealing a smooth, juicy, evenly rosy medium-rare interior, dark caramelized seared crust, a few coarse sea salt flakes';
  return 'glistening with natural juices (not oily), lightly charred where grilled, fresh and appetizing';
}

function buildPrompt(r: { slug?: string; title: string; description: string; moderation: { category_guess?: string } | null; ingredients: Zutat[] }): string {
  const subject = r.moderation?.category_guess?.trim() || r.title;
  const main = (r.ingredients ?? []).slice(0, 3).map((z) => z.name).filter(Boolean).join(', ');
  const hay = `${r.title} ${main} ${r.moderation?.category_guess ?? ''}`;
  return [
    `appetizing professional food photograph of ${subject}, the whole dish in frame`,
    r.description,
    main && `with ${main}`,
    styleClause(hay),
    'plated on a rustic warm wooden board, soft warm natural daylight, a subtle grill and glowing ember atmosphere softly blurred in the background, a little fresh herb garnish, clean and appetizing, subtle steam',
    pickPerspective(r.slug || r.title),
    '50mm lens, f/5.6, balanced focus, appetizing, no text, no watermark, no people',
  ].filter(Boolean).join(', ');
}

export async function POST(req: Request) {
  if (!process.env.FAL_KEY) {
    return NextResponse.json({ error: 'Bildgenerierung ist derzeit nicht konfiguriert (FAL_KEY fehlt).' }, { status: 503 });
  }

  // 1) Auth
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

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  // 3) Rezept holen (nur freigegeben)
  const { data: recipe } = await admin
    .from('user_recipes')
    .select('id, slug, title, description, ingredients, moderation, image_url, status')
    .eq('slug', slug)
    .eq('status', 'approved')
    .maybeSingle();

  if (!recipe) {
    return NextResponse.json({ error: 'Rezept nicht gefunden oder nicht freigegeben.' }, { status: 404 });
  }
  // Idempotent: schon ein Bild → zurückgeben, kein neuer Call
  if (recipe.image_url) {
    return NextResponse.json({ image_url: recipe.image_url, cached: true });
  }

  // 4) fal.ai FLUX.1 dev
  let bytes: ArrayBuffer;
  try {
    const prompt = buildPrompt(recipe as never);
    const falRes = await fetch('https://fal.run/fal-ai/flux/dev', {
      method: 'POST',
      headers: { Authorization: `Key ${process.env.FAL_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, image_size: 'landscape_4_3', num_images: 1, enable_safety_checker: true }),
    });
    if (!falRes.ok) throw new Error(`fal ${falRes.status}: ${(await falRes.text()).slice(0, 160)}`);
    const j = await falRes.json();
    const url = j.images?.[0]?.url;
    if (!url) throw new Error('keine Bild-URL in fal-Antwort');
    const imgRes = await fetch(url);
    if (!imgRes.ok) throw new Error(`Bild-Download ${imgRes.status}`);
    bytes = await imgRes.arrayBuffer();
  } catch (err) {
    console.error('[rezept-bild] fal failed', err);
    return NextResponse.json({ error: 'Bildgenerierung fehlgeschlagen. Bitte später erneut.' }, { status: 502 });
  }

  // 5) In öffentlichen Storage hochladen
  const path = `${slug}.jpg`;
  const { error: upErr } = await admin.storage
    .from('recipe-images')
    .upload(path, Buffer.from(bytes), { contentType: 'image/jpeg', upsert: true });
  if (upErr) {
    console.error('[rezept-bild] upload failed', upErr);
    return NextResponse.json({ error: 'Bild konnte nicht gespeichert werden.' }, { status: 500 });
  }
  const { data: pub } = admin.storage.from('recipe-images').getPublicUrl(path);
  const imageUrl = pub.publicUrl;

  // 6) image_url setzen
  const { error: updErr } = await admin
    .from('user_recipes')
    .update({ image_url: imageUrl, updated_at: new Date().toISOString() })
    .eq('id', recipe.id);
  if (updErr) {
    console.error('[rezept-bild] update failed', updErr);
    return NextResponse.json({ error: 'Bild gespeichert, aber Verknüpfung fehlgeschlagen.' }, { status: 500 });
  }

  return NextResponse.json({ image_url: imageUrl });
}
