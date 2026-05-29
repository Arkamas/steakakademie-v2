// ── BBQ-News Datenquelle ─────────────────────────────────────────────────────
// Liest freigegebene Entwürfe (status='approved') aus Supabase `content_drafts`,
// gefiltert auf die /bbq-news zugeordneten Kategorien (siehe content-routing.ts).
//
// ISR-kompatibel: nutzt einen Cookie-freien Anon-Client (keine dynamische
// Server-Rendering-Erzwingung). RLS-Policy `read_approved` erlaubt anonymen
// SELECT auf status='approved'.
//
// Fällt auf redaktionelle FALLBACK_NEWS zurück, wenn keine Live-Daten/kein Env.

import { createClient } from '@supabase/supabase-js';
import { ROUTE_CATEGORIES, type ContentCategory } from '@/lib/content-routing';

export type NewsRegion = 'USA' | 'Deutschland' | 'International';

export interface NewsItem {
  id: string;
  region: NewsRegion;
  category: string;
  title: string;
  summary: string;
  date: string;     // Anzeige, z.B. "27. Mai 2026"
  isoDate: string;  // ISO für Schema
  source?: string;
  href?: string;
  featured?: boolean;
  image?: string;   // optional — fehlt → markenkonformer Smoke-Placeholder
}

const BBQ_NEWS_CATEGORIES = ROUTE_CATEGORIES['/bbq-news'] ?? [];

// Kategorie → Anzeige-Region
const CATEGORY_REGION: Partial<Record<ContentCategory, NewsRegion>> = {
  usa: 'USA',
  'championship-2026': 'Deutschland',
  'general-bbq': 'International',
  argentinien: 'International',
  brasilien: 'International',
  japan: 'International',
  korea: 'International',
  suedafrika: 'International',
  thailand: 'International',
  tuerkei: 'International',
  spanien: 'International',
};

// Kategorie → Anzeige-Label für den Chip
const CATEGORY_LABEL: Partial<Record<ContentCategory, string>> = {
  usa: 'USA',
  'championship-2026': 'Meisterschaft',
  'general-bbq': 'BBQ',
  argentinien: 'Argentinien',
  brasilien: 'Brasilien',
  japan: 'Japan',
  korea: 'Korea',
  suedafrika: 'Südafrika',
  thailand: 'Thailand',
  tuerkei: 'Türkei',
  spanien: 'Spanien',
};

const DE_DATE = new Intl.DateTimeFormat('de-DE', { day: 'numeric', month: 'long', year: 'numeric' });

interface DraftRow {
  id: string;
  category: string;
  title: string;
  slug: string;
  seo_description: string | null;
  content_body: string;
  generated_at: string;
}

function rowToNewsItem(row: DraftRow, index: number): NewsItem {
  const cat = row.category as ContentCategory;
  const d = new Date(row.generated_at);
  const summary =
    (row.seo_description && row.seo_description.trim()) ||
    `${row.content_body.replace(/[#*_>`\n]/g, ' ').trim().slice(0, 180)}…`;
  return {
    id: row.id,
    region: CATEGORY_REGION[cat] ?? 'International',
    category: CATEGORY_LABEL[cat] ?? 'BBQ',
    title: row.title,
    summary,
    date: DE_DATE.format(d),
    isoDate: d.toISOString().slice(0, 10),
    source: 'Steakakademie Redaktion',
    featured: index === 0,
  };
}

/** Holt freigegebene News (Supabase) oder Fallback. */
export async function getNewsItems(): Promise<NewsItem[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || BBQ_NEWS_CATEGORIES.length === 0) return FALLBACK_NEWS;

  try {
    const supabase = createClient(url, key, { auth: { persistSession: false } });
    const { data, error } = await supabase
      .from('content_drafts')
      .select('id, category, title, slug, seo_description, content_body, generated_at')
      .eq('status', 'approved')
      .in('category', BBQ_NEWS_CATEGORIES)
      .order('generated_at', { ascending: false })
      .limit(12);

    if (error || !data || data.length === 0) return FALLBACK_NEWS;
    return data.map((row, i) => rowToNewsItem(row as DraftRow, i));
  } catch {
    return FALLBACK_NEWS;
  }
}

// ── Redaktioneller Fallback (vor Pipeline-Go-Live / wenn keine Live-Daten) ────
export const FALLBACK_NEWS: NewsItem[] = [
  {
    id: 'pellet-grill-trend-2026',
    region: 'USA',
    category: 'Trend',
    title: 'Pellet-Grills dominieren den US-Markt 2026 — was Deutschland davon lernt',
    summary:
      'In den USA gehört der WLAN-gesteuerte Pellet-Smoker längst zur Standardausrüstung. Wir ordnen ein, warum der Trend jetzt auch deutsche Terrassen erreicht und worauf es bei der Anschaffung wirklich ankommt.',
    date: '27. Mai 2026',
    isoDate: '2026-05-27',
    source: 'Steakakademie Redaktion',
    featured: true,
  },
  {
    id: 'grillsaison-dgr-2026',
    region: 'Deutschland',
    category: 'Szene',
    title: 'Deutsche Grillmeisterschaft 2026: Termine, Disziplinen, Favoriten',
    summary:
      'Die offizielle Wettkampfsaison startet. Überblick über die wichtigsten Termine, die gewerteten Kategorien und wie ambitionierte Hobbygriller selbst einsteigen können.',
    date: '24. Mai 2026',
    isoDate: '2026-05-24',
    source: 'Steakakademie Redaktion',
  },
  {
    id: 'wagyu-preise-2026',
    region: 'International',
    category: 'Markt',
    title: 'Wagyu-Preise im Frühjahr 2026: Warum gutes Marmorfleisch teurer wird',
    summary:
      'Futterkosten, Nachfrage aus Asien und der Boom um echtes A5-Wagyu treiben die Preise. Was das für deutsche Käufer bedeutet — und wann sich die Investition lohnt.',
    date: '21. Mai 2026',
    isoDate: '2026-05-21',
    source: 'Steakakademie Redaktion',
  },
  {
    id: 'reverse-sear-mainstream',
    region: 'Deutschland',
    category: 'Technik',
    title: 'Reverse Sear wird Mainstream: Thermometer-Verkäufe steigen deutlich',
    summary:
      'Die Methode aus dem US-BBQ setzt sich in deutschen Küchen durch. Der Effekt: Kerntemperatur-Messung wird vom Profi-Werkzeug zum Standard. Unsere Einordnung zur Technik.',
    date: '18. Mai 2026',
    isoDate: '2026-05-18',
    source: 'Steakakademie Redaktion',
    href: '/methoden/reverse-sear',
  },
  {
    id: 'texas-brisket-rekord',
    region: 'USA',
    category: 'Kultur',
    title: 'Texas: Neue Generation von Pitmastern verbindet Tradition und Präzision',
    summary:
      'Zwischen Holzfeuer-Romantik und datengetriebener Garführung — wie die junge Pitmaster-Szene in Austin und Lockhart das klassische Brisket neu interpretiert.',
    date: '14. Mai 2026',
    isoDate: '2026-05-14',
    source: 'Steakakademie Redaktion',
    href: '/usa-expedition/texas-style',
  },
  {
    id: 'nachhaltigkeit-holzkohle',
    region: 'Deutschland',
    category: 'Nachhaltigkeit',
    title: 'Nachhaltige Holzkohle: Worauf das FSC-Siegel beim Grillen wirklich hinweist',
    summary:
      'Tropenholz im Kohlesack ist nach wie vor verbreitet. Wir erklären, welche Siegel Orientierung geben und welche heimischen Alternativen beim Grillergebnis überzeugen.',
    date: '11. Mai 2026',
    isoDate: '2026-05-11',
    source: 'Steakakademie Redaktion',
  },
];
