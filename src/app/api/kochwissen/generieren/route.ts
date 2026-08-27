/**
 * POST /api/kochwissen/generieren   (application/json)
 *
 * Erzeugt aus dem abgerufenen Wissen ein NEUES Rezept oder einen Artikel —
 * streng geerdet an den gefundenen Einträgen (kein freies Halluzinieren).
 *
 * Body: { auftrag: string, art?: 'rezept' | 'artikel', niveau?: 1 | 2 | 3,
 *         personen?: number, kategorie?: string, cut?: string, limit?: number }
 * Antwort: { ergebnis: string, niveau, personen, verwendete_quellen: Array<{ titel, quelle, similarity }> }
 *
 * Pro-Person-Prinzip: Alle Rezept-Mengen werden intern auf 1 Person normiert
 * (Basis-Einheit) und für die gewünschte Personenzahl ausgegeben. Zusätzlich
 * hängt jedes Rezept einen maschinenlesbaren ```zutaten-basis```-Block an
 * (Mengen pro 1 Person), damit das UI die Personenzahl NACHTRÄGLICH
 * deterministisch umrechnen kann — ohne neuen API-Call, ohne LLM-Mathe.
 *
 * Siehe docs/wissensdatenbank-architektur.md („neu kreieren" mit Grounding).
 */

import { anthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';
import { NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { searchKochwissen, buildKontext, type Treffer } from '@/lib/kochwissen/retrieval';
import { z } from 'zod';
import { guardRequest } from '@/lib/api/guard';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 90;

// Im Projekt erprobtes, gültiges API-Modell (wie contentAgent/pm-agent).
const MODEL = 'claude-sonnet-4-6';

const SYSTEM_PROMPT = `Du bist Rezept- und Content-Autor der Steakakademie.
Erstelle den gewünschten Inhalt STRENG auf Basis der bereitgestellten Wissenseinträge.
Regeln:
- Nutze ausschließlich belegte Fakten aus den Einträgen.
- Erfinde keine Temperaturen, Zeiten oder Mengen. Fehlt ein nötiger Wert, schreibe "(zu prüfen)".
- Übernimm Zahlenwerte (Temperaturen, Zeiten) wörtlich aus den Einträgen.
- Schreibe in der Markenstimme der Steakakademie: fachkundig, präzise, praxisnah, auf Deutsch.
- Verankere das Gericht an den Leit-/Hub-Aromastoffen (Röst-Pyrazine, 2-Methyl-3-furanthiol, 1-Octen-3-ol, 2-Acetyl-1-pyrrolin, Strecker-Aldehyde, Räucherphenole): nenne kurz, auf welchen es aufbaut und warum die Kombination harmoniert — sofern die Einträge das belegen.
- Nenne am Ende einen Abschnitt "Quellen" mit den genutzten "Quelle-Fundstelle"-Angaben.

Bei art="rezept": Struktur = Titel, kurze Einleitung, Zutaten (Liste, mit Personenzahl in der Überschrift, z. B. "## Zutaten (für 4 Personen)"), Zubereitung (nummerierte Schritte), Profi-Tipps.
Bei art="artikel": Struktur = Überschrift, Einleitung, Fließtext mit Zwischenüberschriften, Fazit.

MENGEN & PERSONEN (nur bei art="rezept"):
- Kalkuliere alle Zutatenmengen intern auf Basis 1 Person und gib sie in der Zutatenliste exakt für die angegebene Personenzahl aus.
- Kerntemperaturen und Gartemperaturen ändern sich NIE mit der Personenzahl. Garzeiten hängen von Dicke/Stückgröße ab, nicht von der Menge — weise darauf hin, wenn relevant.
- Hänge GANZ AM ENDE der Antwort einen maschinenlesbaren Block an, exakt in diesem Format (Mengen = pro 1 Person, Dezimalpunkt, keine Kommentare):
\`\`\`zutaten-basis
{"basis_personen":1,"zutaten":[{"menge":200,"einheit":"g","name":"Ribeye","skalierung":"linear"},{"menge":1,"einheit":"Prise","name":"Meersalz","skalierung":"fix"}]}
\`\`\`
- "skalierung":"linear" = Menge wächst proportional zur Personenzahl (Normalfall). "skalierung":"fix" = bleibt konstant (Prisen, "nach Geschmack", Öl zum Einpinseln, Räucherchips).
- Erlaubte Einheiten: g, kg, ml, l, EL, TL, Prise, Stk., Zweig, Blatt, Zehe, Dose, n.B.`;

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

const GenerierenBody = z.object({
  auftrag:   z.string().trim().min(3).max(500),
  art:       z.enum(['rezept', 'artikel']).default('rezept'),
  niveau:    z.coerce.number().int().pipe(z.union([z.literal(1), z.literal(2), z.literal(3)])).catch(2), // Default: ⭐⭐ Fortgeschritten
  personen:  z.coerce.number().catch(2).transform((n) => Math.min(Math.max(Math.trunc(n) || 2, 1), 20)),
  kategorie: z.string().trim().max(80).nullish().transform((v) => v || null),
  cut:       z.string().trim().max(80).nullish().transform((v) => v || null),
  limit:     z.coerce.number().catch(12).transform((n) => Math.min(Math.max(Math.trunc(n) || 12, 1), 20)),
});

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY fehlt.' }, { status: 500 });
  }
  if (!process.env.VOYAGE_API_KEY) {
    return NextResponse.json({ error: 'VOYAGE_API_KEY fehlt.' }, { status: 500 });
  }

  // 1) Guard: Same-Origin, Rate-Limit, Login ODER Admin, Schema.
  //    Teuerster Endpunkt (Voyage-Retrieval + Claude, bis 90 s) → nicht anonym.
  const guard = await guardRequest(req, {
    key: 'kochwissen-generieren',
    rate: { limit: 10, windowMs: 60 * 60_000 },
    schema: GenerierenBody,
    auth: 'user-or-admin',
  });
  if (!guard.ok) return guard.response;
  const { auftrag, art, niveau, personen, kategorie, cut, limit } = guard.body;

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
      prompt: `art=${art}\nniveau=${niveau}\npersonen=${personen}\n\nAuftrag: ${auftrag}\n\nWissenseinträge (einzige erlaubte Faktenbasis):\n${kontext}`,
    });
    ergebnis = text;
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: `Generierung fehlgeschlagen: ${msg}` }, { status: 502 });
  }

  return NextResponse.json({
    ergebnis,
    niveau,
    personen,
    verwendete_quellen: treffer.map((t) => ({
      titel: t.titel,
      quelle: t.quelle,
      similarity: t.similarity,
    })),
  });
}
