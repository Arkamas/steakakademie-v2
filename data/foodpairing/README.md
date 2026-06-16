# Foodpairing — Rohdaten (Aroma-Netzwerk)

Ablageort für das **bipartite Zutat↔Aromamolekül-Dataset**, das
`scripts/foodpairing-import.mjs` nach Supabase importiert
(Tabellen `aroma_ingredient` / `aroma_compound` / `aroma_ingredient_compound`).
Architektur & Rechtslage: `docs/foodpairing-steckbrief.md`.

> ⚖️ **Nur ein offenes, kommerziell freigegebenes Dataset hier ablegen.**
> „Frei einsehbar" ≠ „frei weiterverbreitbar". Empfohlen ist das offen publizierte
> Flavor-Network (Ahn et al. 2011, Sci. Rep. 1:196, DOI 10.1038/srep00196, CC BY 4.0).
> **VCF, FlavorDB (CC-BY-NC), FoodKG, FEMA-Liste,
> Aroma-Wheel** sind hier NICHT zulässig. Diese Dateien sind bewusst **nicht** im
> Repo eingecheckt — Lizenz vor dem Einspielen klären.

## Erwartete Dateien

| Datei | Spalten (tab- oder kommagetrennt) |
|---|---|
| `ingr_info.tsv` | `id  name  category` |
| `comp_info.tsv` | `id  name  CAS` |
| `ingr_comp.tsv` | `ingredient_id  compound_id` |

Kommentar-/Headerzeilen mit `#` werden übersprungen. Die `id`-Werte stammen aus dem
Quelldatensatz → Import ist idempotent (re-runnable).

## Import

```bash
node scripts/foodpairing-import.mjs --dir data/foodpairing --dry-run   # Vorschau
node scripts/foodpairing-import.mjs --dir data/foodpairing             # → Supabase
```

Voraussetzung: Migration `supabase/migrations/20260615_aroma_pairings.sql` eingespielt,
`NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`.
