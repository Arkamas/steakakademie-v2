# Kochwissen — Rohdaten (CSV-Lieferungen)

Quell-CSVs für die Wissensdatenbank. Sie sind die **Roh-Lieferungen**; der
durchsuchbare Index entsteht daraus per `scripts/kochwissen-ingest.mjs`
(→ Supabase-Tabelle `kochwissen`). Architektur: `docs/wissensdatenbank-architektur.md`.

> Interne Wissensbasis (RAG-Kontext für Claude). Für **öffentliche** Inhalte auf
> steakakademie.de werden daraus eigene Formulierungen generiert, nicht der 1:1-Text.

## Format

`Titel; Kategorie; Cut/Zutat; Schwierigkeit; Keywords; Quelle-Fundstelle; Inhalt_normalisiert`

Die Inhaltsspalte darf fehlen → reiner **Index-/Platzhalter-Import** (Eintrag ohne
Volltext, wartet auf spätere Volltext-Lieferung mit gleichem `Titel`).

## Lieferungen & empfohlene `--source`-Namespaces

| Datei | `--source` | Inhalt |
|---|---|---|
| `wissensdatenbank-1.csv`   | `mcgee`     | Index mit Seitenzahlen (z. B. „S. 267"), **ohne** Volltext → Platzhalter |
| `wissensdatenbank-2.csv`   | `modernist` | Garmethoden (Grillen, Braten, Wok, Schmoren, Backen, Frittieren …) mit Volltext |
| `wissensdatenbank-2.2.csv` | `modernist` | Fortsetzung: Sous-vide, Fonds/Brühen, Geschmack extrahieren — mit Volltext |
| `wissensdatenbank-2.3.csv` | `modernist` | Fortsetzung: Aromen/Enfleurage, Saftgewinnung, Filtern/Schönen, Konzentrieren — mit Volltext |
| `wissensdatenbank-2.4.csv` | `modernist` | Fortsetzung: Zerkleinern (Pacojet/Homogenisatoren), Trocknen, Gefriertrocknung, Cryogene/Karbonisieren — mit Volltext |
| `wissensdatenbank-3.csv`   | `modernist` | Pflanzen als Lebensmittel: Zellwände, Stärke, Enzyme/Reifung, Konservieren, kulinarischer Illusionismus — mit Volltext |
| `wissensdatenbank-4.csv`   | `modernist` | Texturen & Kaffee: Viskosität/Verdickungsmittel, Gele/Sphärifikation, Emulsionen, Schäume, Kaffee/Espresso (Kap. 13–18) — mit Volltext |
| `wissensdatenbank-5.csv`   | `modernist` | Band 5 (Chefgerichte), Kap. 19–20 „Zartes/Festes Fleisch": Rezeptmethodik + Techniken/Parameter (Sous-vide, Activa, BBQ, Fermentation …); aus PDF-Rohtext extrahiert; `Quelle = "Band 5: …"` |

`--source` ist nur ein **Namespace für Dedup/Merge**: gleicher `Titel` innerhalb
derselben `source` ergänzt einen vorhandenen Eintrag (Platzhalter → Volltext),
statt zu duplizieren. Die Labels sind frei wählbar — anpassen, falls die echten
Bücher abweichen.

## Ingestion

```bash
node scripts/kochwissen-ingest.mjs --file data/kochwissen/wissensdatenbank-2.csv   --source modernist
node scripts/kochwissen-ingest.mjs --file data/kochwissen/wissensdatenbank-2.2.csv --source modernist
node scripts/kochwissen-ingest.mjs --file data/kochwissen/wissensdatenbank-2.3.csv --source modernist
node scripts/kochwissen-ingest.mjs --file data/kochwissen/wissensdatenbank-2.4.csv --source modernist
node scripts/kochwissen-ingest.mjs --file data/kochwissen/wissensdatenbank-3.csv   --source modernist
node scripts/kochwissen-ingest.mjs --file data/kochwissen/wissensdatenbank-4.csv   --source modernist
node scripts/kochwissen-ingest.mjs --file data/kochwissen/wissensdatenbank-5.csv   --source modernist
node scripts/kochwissen-ingest.mjs --file data/kochwissen/wissensdatenbank-1.csv   --source mcgee
# Vorschau ohne API-Calls:
node scripts/kochwissen-ingest.mjs --file data/kochwissen/wissensdatenbank-2.csv   --source modernist --dry-run
```

Voraussetzung: Migration `supabase/migrations/20260615_kochwissen.sql` eingespielt
und `SUPABASE_SERVICE_ROLE_KEY` + `VOYAGE_API_KEY` in `.env.local`.
