/**
 * Voyage-AI-Embeddings für die Kochwissen-Datenbank.
 *
 * Muss dimensionsgleich zur Ingestion sein (scripts/kochwissen-ingest.mjs):
 * Modell `voyage-3.5` → 1024 Dimensionen, passend zu `vector(1024)` in der
 * Tabelle `kochwissen`. Bei Modellwechsel: Spalten-Dimension + Re-Embed anpassen.
 */

const VOYAGE_URL = 'https://api.voyageai.com/v1/embeddings';
const VOYAGE_MODEL = process.env.VOYAGE_MODEL ?? 'voyage-3.5';

/**
 * Bettet einen Suchtext ein. `input_type: 'query'` ist für Retrieval-Anfragen
 * optimiert (gepaart mit `input_type: 'document'` bei der Ingestion).
 */
export async function embedQuery(text: string): Promise<number[]> {
  if (!process.env.VOYAGE_API_KEY) throw new Error('VOYAGE_API_KEY fehlt.');

  const res = await fetch(VOYAGE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.VOYAGE_API_KEY}`,
    },
    body: JSON.stringify({ input: [text], model: VOYAGE_MODEL, input_type: 'query' }),
  });

  if (!res.ok) {
    throw new Error(`Voyage ${res.status}: ${await res.text()}`);
  }
  const json = await res.json();
  return json.data[0].embedding as number[];
}
