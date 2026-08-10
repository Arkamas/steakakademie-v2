# Architektur: Intelligente Wissensdatenbank (Notion → Vektor-DB → Claude RAG)

Dieses Dokument beschreibt den Bauplan für die große Steakakademie-Wissensdatenbank:
eine wachsende Sammlung von Kochwissen + Rezepten, die Claude als Wissensbasis nutzen,
verknüpfen, einordnen und zu neuen Inhalten kombinieren kann.

Die Datensammlung wächst **Schritt für Schritt** (laufend neue CSV-Lieferungen). Die
Architektur ist deshalb auf inkrementelles Wachstum und stabile Quellen-Anker ausgelegt.

## Ziel & die vier Fähigkeiten

| Fähigkeit | Umsetzung |
|---|---|
| **untereinander austauschen** | Vektor-Ähnlichkeit + Metadaten-Relations zwischen Einträgen |
| **einordnen** (klassifizieren) | Controlled-Vocabulary-Tags (Kategorie, Cut/Zutat …), per Claude auto-vergeben |
| **verstehen** (Fragen beantworten) | RAG: Retrieval relevanter Einträge → Claude antwortet belegt |
| **neu kreieren** | Claude kombiniert vorhandenes Wissen zu Rezepten/Texten, geerdet + mit Quelle |

## Grundprinzip: Single Source of Truth + abgeleiteter Index

```
Notion (Pflege, menschenlesbar)          ← Single Source of Truth
        │  Export / Sync (CSV im Format von Datei 2)
        ▼
Supabase Postgres + pgvector             ← Speicher + Vektor-Index
        │  Retrieval (Vektor + Metadaten-Filter)
        ▼
Claude (claude-opus-4-8)                 ← verstehen, verknüpfen, neu kreieren
        │
        ▼
Antwort / neues Rezept / Artikel — mit Quelle-Fundstelle
```

Notion bleibt die redaktionelle Wahrheit; die Vektor-DB ist ein **abgeleiteter, jederzeit
neu aufbaubarer Index**. Geht der Index verloren, wird er aus Notion/CSV neu erzeugt.

## Datenmodell (Standard = Format von „Wissensdatenbank_2")

Maßgeblich ist das Schema **mit Inhaltsspalte**:

```
Titel; Kategorie; Cut/Zutat; Schwierigkeit; Keywords; Quelle-Fundstelle; Inhalt_normalisiert
```

- `Inhalt_normalisiert` ist der eigentliche Wissenstext (das, was Claude liest).
- Eine reine Index-Datei ohne Inhaltsspalte (wie „Wissensdatenbank_1") ist nur ein
  Register — sie wird erst nutzbar, wenn ihr Volltext nachgeliefert wird.

### Postgres-Tabelle (vereinfacht)

```sql
create extension if not exists vector;

create table kochwissen (
  id            uuid primary key default gen_random_uuid(),
  titel         text not null,
  kategorie     text not null,
  cut_zutat     text,
  schwierigkeit text,
  keywords      text[],
  quelle        text,          -- z. B. "Grillen: Physik" oder "S. 267"
  inhalt        text not null, -- Inhalt_normalisiert, 1:1
  embedding     vector(1024),  -- Embedding über titel + inhalt
  quelle_key    text,          -- normalisierter Anker, siehe unten
  created_at    timestamptz default now()
);

create index on kochwissen using ivfflat (embedding vector_cosine_ops);
create index on kochwissen (kategorie);
create index on kochwissen (quelle_key);
```

## Die „fragwürdigen Zahlen": Quelle-Fundstelle als Anker

Die Seitenverweise (z. B. „S. 267", „S. 79 (Zeittafel)") sind **heute** scheinbar wertlos,
weil der zugehörige Volltext noch nicht in der Datenbank steht. Sie sind aber die
**Anker, die sich auflösen, sobald der Volltext nachgeliefert wird.**

Deshalb:

1. `Quelle-Fundstelle` wird in `quelle` gespeichert und zusätzlich als **normalisierter
   `quelle_key`** (z. B. `buch-x:s267`).
2. Spätere Lieferungen mit demselben Anker werden **verknüpft**, nicht doppelt angelegt:
   - Index-Eintrag „Spezifische Wärmekapazität · S. 267" (nur Tags) und
   - späterer Volltext-Eintrag mit `quelle_key = …:s267`
   werden über `quelle_key` zusammengeführt → aus dem Platzhalter wird ein vollwertiger,
   abrufbarer Eintrag.

So entsteht aus zwei heute getrennten Lieferungen am Ende **ein** belegter Wissenseintrag —
genau der „später ergibt das einen Sinn"-Effekt.

## Inkrementelle Ingestion (Schritt für Schritt)

Jede neue CSV-Lieferung durchläuft dieselbe Pipeline (idempotent):

1. **Parsen** der CSV (Format oben).
2. **Normalisieren**: Tags gegen Controlled Vocabulary prüfen; `quelle_key` bilden.
3. **Dedup/Merge**: existiert ein Eintrag mit gleichem `quelle_key` oder sehr ähnlichem
   Titel+Inhalt? → ergänzen statt duplizieren (Index-Platzhalter mit Volltext füllen).
4. **Embedding** erzeugen (über `titel` + `inhalt`) und speichern.
5. **Upsert** in Postgres.

Weil Schritte 1–5 wiederholbar sind, kann der Index jederzeit vollständig aus den
CSV-Lieferungen neu aufgebaut werden.

## Retrieval (RAG) zur Laufzeit

Eine Frage wird so beantwortet:

1. Query-Embedding bilden.
2. **Hybrid-Retrieval**: Vektor-Ähnlichkeit (`<=>`) + optionaler Metadaten-Filter
   (`kategorie`, `cut_zutat`, `schwierigkeit`).
3. Top-k Einträge (inkl. `quelle`) als Kontext an Claude.
4. Claude antwortet **nur aus dem gelieferten Kontext** und nennt die `Quelle-Fundstelle`.

## Grounding & „neu kreieren" ohne Halluzination

- Generierte Rezepte/Artikel werden an die abgerufenen Einträge gebunden; fehlende
  Fakten (z. B. eine Kerntemperatur, die nicht in der Quelle steht) werden **nicht
  erfunden**, sondern als offen markiert.
- Jede generierte Aussage trägt die `Quelle-Fundstelle` ihres Belegs.
- Zahlen/Temperaturen/Zeiten werden bevorzugt wörtlich aus `inhalt` übernommen.

## Tech-Stack (bereits im Repo vorhanden)

| Baustein | Wahl | Status |
|---|---|---|
| Speicher + Vektor-Index | **Supabase Postgres + pgvector** | Supabase bereits in Nutzung (`supabase/`) |
| LLM (verstehen/erzeugen) | **Claude `claude-opus-4-8`** via `@anthropic-ai/sdk` | SDK bereits in `package.json` |
| Orchestrierung | **Vercel `ai`-SDK** | bereits in `package.json` |
| Embeddings | externer Embedding-Provider (z. B. Voyage AI) | **noch einzurichten** — Anthropic bietet keine eigene Embeddings-API |
| Redaktion / SSoT | **Notion** (CSV-Export im Format von Datei 2) | bestehend |

Damit ist die Vektor-DB **kein neues Infrastruktur-Projekt**, sondern eine pgvector-Tabelle
im vorhandenen Supabase — das deckt den Roadmap-Punkt „Vector-Datenbank für Embeddings
aufsetzen" ab.

## Qualitäts-Regeln (damit es „intelligent" bleibt)

1. **Atomar**: ein Konzept pro Eintrag (saubere Retrieval-Chunks).
2. **Inhaltsspalte Pflicht**: ohne `Inhalt_normalisiert` kein Verständnis.
3. **Controlled Vocabulary**: nur definierte Tag-Werte; neue Werte bewusst aufnehmen.
4. **Quelle pflegen**: `Quelle-Fundstelle` ist die Grundlage für Belegbarkeit (E-E-A-T)
   und für das spätere Auflösen der Anker.
5. **Index ist ableitbar**: niemals Logik allein im Index — Notion/CSV bleiben Wahrheit.

## Rechtlicher Hinweis (Publikation)

Als **interne** Wissensbasis (RAG-Kontext für Claude) ist 1:1-Quelltext unkritisch.
Für **öffentliche** Inhalte auf steakakademie.de sollten daraus eigene Formulierungen
generiert werden; der 1:1-Bestand bleibt als interne Belegquelle im Hintergrund.

## Umsetzungs-Reihenfolge

1. pgvector-Tabelle `kochwissen` in Supabase anlegen (Migration).
2. Embedding-Provider einrichten (API-Key, Modellwahl).
3. Ingestion-Skript (CSV → normalize → embed → upsert, idempotent + Merge über `quelle_key`).
4. Retrieval-Endpoint (Frage → Hybrid-Retrieval → Claude-Antwort mit Quellen).
5. Generierungs-Endpoint (geerdetes Rezept/Artikel aus abgerufenem Wissen).
