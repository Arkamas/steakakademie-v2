/**
 * POST /api/kochwissen/generieren   (application/json)
 *
 * Erzeugt aus dem abgerufenen Wissen ein NEUES Rezept oder einen Artikel —
 * streng geerdet an den gefundenen Einträgen (kein freies Halluzinieren).
 *
 * Body: { auftrag: string, art?: 'rezept' | 'artikel', niveau?: 1 | 2 | 3,
 *         kategorie?: string, cut?: string, limit?: number }
 * Antwort: { ergebnis: string, niveau, verwendete_quellen: Array<{ titel, quelle, similarity }> }
 *
 * Siehe docs/wissensdatenbank-architektur.md („neu kreieren" mit Grounding).
 */

import { anthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';
import { NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { searchKochwissen, buildKontext, type Treffer } from '@/lib/kochwissen/retrieval';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 120;

const MODEL = 'claude-opus-4-8';

const SYSTEM_PROMPT = `Du bist Rezept- und Content-Autor der Steakakademie.
Erstelle den gewünschten Inhalt STRENG auf Basis der bereitgestellten Wissenseinträge.
Regeln:
- Nutze ausschließlich belegte Fakten aus den Einträgen.
- Erfinde keine Temperaturen, Zeiten oder Mengen. Fehlt ein nötiger Wert, schreibe "(zu prüfen)".
- Übernimm Zahlenwerte (Temperaturen, Zeiten) wörtlich aus den Einträgen.
- Schreibe in der Markenstimme der Steakakademie: fachkundig, präzise, praxisnah, auf Deutsch.
- Nenne am Ende einen Abschnitt "Quellen" mit den genutzten "Quelle-Fundstelle"-Angaben.

Bei art="rezept": Struktur = Titel, kurze Einleitung, Zutaten (Liste), Zubereitung (nummerierte Schritte), Profi-Tipps.
Bei art="artikel": Struktur = Überschrift, Einleitung, Fließtext mit Zwischenüberschriften, Fazit.`;

// Schwierigkeitsstufen (⭐/⭐⭐/⭐⭐⭐): identische Wissensbasis, andere Flughöhe.
// Jede Stufe schränkt Technik & Equipment ein — gegroundet bleibt die Generierung.
const NIVEAU_REGELN: Record<1 | 2 | 3, string> = {
  1: `NIVEAU: ⭐ Einsteiger.
- Nur Standard-Haushaltsgeräte: Topf, Pfanne, Backofen, Grill, ggf. Küchenthermometer.
- VERBOTEN: Sous-vide/Vakuumgaren, Hydrokolloide (Xanthan, Agar, Gellan, Alginat, Sphärifikation), Flüssigstickstoff, Activa/Transglutaminase, Pacojet, Zentrifuge, Dörrschrank, Sahnesiphon, Rotationsverdampfer.
- Supermarkt-Zutaten, höchstens 3–4 Komponenten, lineare Schritte. Fachbegriffe kurz erklären.
- Wähle aus den Einträgen nur die konventionell umsetzbaren Methoden; lasse modernistische Schritte weg.`,
  2: `NIVEAU: ⭐⭐ Fortgeschritten.
- Erlaubt: Sous-vide, präzise Kerntemperaturen, getrennt gegarte Komponenten, einfache Reduktionen/Emulsionen, eine Prise Xanthan zum Binden.
- VERBOTEN: Flüssigstickstoff, Activa, Sphärifikation, Zentrifuge, Gefriertrocknung, exotische Texturas.
- Bis ~5 Komponenten, etwas Anspruch, aber zuhause gut machbar.`,
  3: `NIVEAU: ⭐⭐⭐ Profi / Modernist.
- Alle Techniken & Zutaten der Wissensbasis erlaubt (Vakuum, Hydrokolloide, Activa, Flüssigstickstoff, Sphärifikation, Zentrifuge …).
- Mehrkomponentig auf Restaurant-Niveau; nenne Spezialgeräte und exakte Parameter.`,
};

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY fehlt.' }, { status: 500 });
  }
  if (!process.env.VOYAGE_API_KEY) {
    return NextResponse.json({ error: 'VOYAGE_API_KEY fehlt.' }, { status: 500 });
  }

  // 1) Eingabe
  let auftrag: string;
  let art: 'rezept' | 'artikel';
  let niveau: 1 | 2 | 3;
  let kategorie: string | null;
  let cut: string | null;
  let limit: number;
  try {
    const body = await req.json();
    auftrag = String(body.auftrag ?? '').trim();
    art = body.art === 'artikel' ? 'artikel' : 'rezept';
    const n = parseInt(body.niveau, 10);
    niveau = n === 1 || n === 3 ? n : 2; // Default: ⭐⭐ Fortgeschritten
    kategorie = body.kategorie ? String(body.kategorie) : null;
    cut = body.cut ? String(body.cut) : null;
    limit = Math.min(Math.max(parseInt(body.limit, 10) || 12, 1), 20);
    if (!auftrag) throw new Error('leer');
  } catch {
    return NextResponse.json({ error: 'Ungültige Eingabe — "auftrag" fehlt.' }, { status: 400 });
  }

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  // 2) Wissensbasis abrufen
  let treffer: Treffer[];
  try {
    treffer = await searchKochwissen(admin, auftrag, { kategorie, cut, limit });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: `Retrieval fehlgeschlagen: ${msg}` }, { status: 502 });
  }

  if (treffer.length === 0) {
    return NextResponse.json(
      { error: 'Keine passenden Wissenseinträge gefunden — Generierung ohne Beleg abgelehnt.' },
      { status: 422 },
    );
  }

  // 3) Geerdete Generierung
  const kontext = buildKontext(treffer);
  let ergebnis: string;
  try {
    const { text } = await generateText({
      model: anthropic(MODEL),
      system: `${SYSTEM_PROMPT}\n\n${NIVEAU_REGELN[niveau]}`,
      prompt: `art=${art}\nniveau=${niveau}\n\nAuftrag: ${auftrag}\n\nWissenseinträge (einzige erlaubte Faktenbasis):\n${kontext}`,
    });
    ergebnis = text;
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: `Generierung fehlgeschlagen: ${msg}` }, { status: 502 });
  }

  return NextResponse.json({
    ergebnis,
    niveau,
    verwendete_quellen: treffer.map((t) => ({
      titel: t.titel,
      quelle: t.quelle,
      similarity: t.similarity,
    })),
  });
}
