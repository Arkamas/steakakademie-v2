// ── Generischer Content-Feed ─────────────────────────────────────────────────
// Liest freigegebene Entwürfe (status='approved') aus Supabase `content_drafts`
// für eine Ziel-Route (siehe content-routing.ts). ISR-kompatibel (Cookie-freier
// Anon-Client). Gibt [] zurück, wenn kein Env / keine Daten / Fehler — die Seite
// blendet den Feed-Abschnitt dann einfach aus (Editorial-Content bleibt).

import { createClient } from '@supabase/supabase-js';
import { ROUTE_CATEGORIES } from '@/lib/content-routing';

export interface FeedItem {
  id: string;
  title: string;
  summary: string;
  date: string;     // "27. Mai 2026"
  isoDate: string;  // "2026-05-27"
  slug: string;
}

const DE_DATE = new Intl.DateTimeFormat('de-DE', { day: 'numeric', month: 'long', year: 'numeric' });

interface DraftRow {
  id: string;
  title: string;
  slug: string;
  seo_description: string | null;
  content_body: string;
  generated_at: string;
}

function toFeedItem(row: DraftRow): FeedItem {
  const d = new Date(row.generated_at);
  const summary =
    (row.seo_description && row.seo_description.trim()) ||
    `${row.content_body.replace(/[#*_>`\n]/g, ' ').trim().slice(0, 180)}…`;
  return {
    id: row.id,
    title: row.title,
    summary,
    date: DE_DATE.format(d),
    isoDate: d.toISOString().slice(0, 10),
    slug: row.slug,
  };
}

/** Freigegebene Drafts für eine Ziel-Route. Leeres Array = nichts anzeigen. */
export async function getApprovedDrafts(route: string, limit = 9): Promise<FeedItem[]> {
  const cats = ROUTE_CATEGORIES[route] ?? [];
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || cats.length === 0) return [];

  try {
    const supabase = createClient(url, key, { auth: { persistSession: false } });
    const { data, error } = await supabase
      .from('content_drafts')
      .select('id, title, slug, seo_description, content_body, generated_at')
      .eq('status', 'approved')
      .in('category', cats)
      .order('generated_at', { ascending: false })
      .limit(limit);

    if (error || !data) return [];
    return data.map((row) => toFeedItem(row as DraftRow));
  } catch {
    return [];
  }
}
