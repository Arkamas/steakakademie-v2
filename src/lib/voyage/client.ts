/**
 * src/lib/voyage/client.ts — zentraler Voyage-AI-Client der Steakakademie.
 *
 * Deckt den vollen API-Umfang ab (Stand 22.08.2026, docs.voyageai.com):
 *  - Text-Embeddings        POST /v1/embeddings               (voyage-4-Familie, 200M Tokens frei)
 *  - Reranking              POST /v1/rerank                   (rerank-2.5 / -lite, 200M Tokens frei)
 *  - Kontext-Embeddings     POST /v1/contextualizedembeddings (voyage-context-4, 200M Tokens frei)
 *  - Multimodal             POST /v1/multimodalembeddings     (voyage-multimodal-3.5, Text+Bild)
 *
 * Modell-Kompatibilität (WICHTIG): Query- und Korpus-Embeddings müssen vom
 * selben Modell-Stamm sein. Die 4er-Serie ist untereinander kompatibel, NICHT
 * mit der 3er-Serie. Deshalb wird das Abfrage-Modell nie hier hartkodiert,
 * sondern vom Aufrufer passend zum jeweiligen Korpus gewählt.
 * Der Reranker ist modell-agnostisch (arbeitet auf Rohtext) und kann daher
 * Kandidaten aus unterschiedlich eingebetteten Korpora gemeinsam sortieren.
 */

const BASE = 'https://api.voyageai.com/v1';
const MAX_RETRIES = 4;
const RETRY_WAIT_MS = 21_000; // Free/Basic-Tier: 3 RPM

/** Aktuelle Modellfamilien als Referenz für Aufrufer. */
export const VOYAGE_MODELS = {
  text: { best: 'voyage-4-large', balanced: 'voyage-4', cheap: 'voyage-4-lite', code: 'voyage-code-3' },
  contextual: { balanced: 'voyage-context-4' },
  multimodal: { balanced: 'voyage-multimodal-3.5' },
  rerank: { best: 'rerank-2.5', fast: 'rerank-2.5-lite' },
  /** Legacy-Modelle (kein Free-Tier mehr) — nur solange Korpora damit eingebettet sind. */
  legacy: { knowledge: 'voyage-3', kochwissen: 'voyage-3.5' },
} as const;

function apiKey(): string {
  const key = process.env.VOYAGE_API_KEY;
  if (!key) throw new Error('VOYAGE_API_KEY fehlt (.env.local)');
  return key;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function post<T>(path: string, body: unknown): Promise<T> {
  let lastErr: Error = new Error('voyage: unbekannter Fehler');
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const res = await fetch(`${BASE}${path}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey()}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.ok) return (await res.json()) as T;
    const text = (await res.text()).slice(0, 300);
    lastErr = new Error(`voyage ${path} ${res.status}: ${text}`);
    // 429/5xx: warten und erneut; alles andere ist endgültig.
    if (res.status !== 429 && res.status < 500) throw lastErr;
    if (attempt < MAX_RETRIES) await sleep(RETRY_WAIT_MS);
  }
  throw lastErr;
}

/* ── Text-Embeddings ─────────────────────────────────────────────────────── */

export interface EmbedOptions {
  model: string;
  /** 'query' für Suchanfragen, 'document' für Korpus-Inhalte. */
  inputType?: 'query' | 'document';
  /** 4er-Serie: 256 | 512 | 1024 (Default) | 2048. Muss zur vector()-Spalte passen. */
  outputDimension?: number;
}

export async function embed(texts: string[], opts: EmbedOptions): Promise<number[][]> {
  const body: Record<string, unknown> = { input: texts, model: opts.model };
  if (opts.inputType) body.input_type = opts.inputType;
  if (opts.outputDimension) body.output_dimension = opts.outputDimension;
  const json = await post<{ data: { embedding: number[] }[] }>('/embeddings', body);
  return json.data.map((d) => d.embedding);
}

export async function embedQuery(text: string, model: string): Promise<number[]> {
  const [v] = await embed([text], { model, inputType: 'query' });
  if (!v) throw new Error('voyage: kein Embedding geliefert');
  return v;
}

/* ── Reranking ───────────────────────────────────────────────────────────── */

export interface RerankResult {
  /** Index in der übergebenen documents-Liste. */
  index: number;
  relevanceScore: number;
}

/**
 * Sortiert Kandidaten nach echter Relevanz zur Query (Cross-Encoder).
 * Modell-agnostisch — Kandidaten dürfen aus beliebigen Korpora stammen.
 */
export async function rerank(
  query: string,
  documents: string[],
  opts: { model?: string; topK?: number } = {},
): Promise<RerankResult[]> {
  if (documents.length === 0) return [];
  const json = await post<{ data: { index: number; relevance_score: number }[] }>('/rerank', {
    query,
    documents,
    model: opts.model ?? process.env.VOYAGE_RERANK_MODEL ?? VOYAGE_MODELS.rerank.fast,
    top_k: opts.topK ?? documents.length,
  });
  return json.data.map((d) => ({ index: d.index, relevanceScore: d.relevance_score }));
}

/* ── Kontextualisierte Chunk-Embeddings (voyage-context-4) ──────────────── */

/**
 * Bettet die Chunks EINES Dokuments gemeinsam ein — jeder Chunk-Vektor trägt
 * den Dokumentkontext (120K-Token-Fenster). inputs = ein Array pro Dokument.
 * Für Queries: einelementiges inneres Array mit inputType 'query'.
 */
export async function embedContextualized(
  documentsChunks: string[][],
  opts: { model?: string; inputType?: 'query' | 'document'; outputDimension?: number } = {},
): Promise<number[][][]> {
  const body: Record<string, unknown> = {
    inputs: documentsChunks,
    model: opts.model ?? VOYAGE_MODELS.contextual.balanced,
  };
  if (opts.inputType) body.input_type = opts.inputType;
  if (opts.outputDimension) body.output_dimension = opts.outputDimension;
  const json = await post<{ data: { data: { embedding: number[] }[] }[] }>(
    '/contextualizedembeddings', body,
  );
  return json.data.map((doc) => doc.data.map((c) => c.embedding));
}

/* ── Multimodale Embeddings (voyage-multimodal-3.5) ─────────────────────── */

export type MultimodalContent =
  | { type: 'text'; text: string }
  | { type: 'image_url'; image_url: string }
  | { type: 'image_base64'; image_base64: string };

/**
 * Bettet gemischte Text/Bild-Inhalte in denselben Vektorraum ein.
 * Kostenhinweis: Abrechnung nach Tokens UND Pixeln — Pipeline-Einsatz
 * (z. B. Rezeptbild-Suche) erst nach Freigabe von Uwe aufsetzen.
 */
export async function embedMultimodal(
  inputs: { content: MultimodalContent[] }[],
  opts: { model?: string; inputType?: 'query' | 'document' } = {},
): Promise<number[][]> {
  const body: Record<string, unknown> = {
    inputs,
    model: opts.model ?? VOYAGE_MODELS.multimodal.balanced,
  };
  if (opts.inputType) body.input_type = opts.inputType;
  const json = await post<{ data: { embedding: number[] }[] }>('/multimodalembeddings', body);
  return json.data.map((d) => d.embedding);
}
