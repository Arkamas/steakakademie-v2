-- 20260822 — knowledge_embeddings: Zeitstempel für RAG-Indexläufe
--
-- Grund: Die Tabelle hatte nur (id, content, metadata, embedding). Dadurch liess
-- sich nicht belegen, WANN der naechtliche Wissensindex-Lauf zuletzt geschrieben
-- hat — die Verifikation des geplanten Tasks lief ins Leere.
--
-- Bewusst OHNE Backfill: die 2.374 Altzeilen bleiben NULL = "Zeitpunkt unbekannt".
-- Ein pauschales now() wuerde behaupten, sie seien heute indexiert worden.
-- Erst `--force` oder die naechste Aenderung der jeweiligen Datei stempelt sie.

alter table public.knowledge_embeddings
  add column if not exists indexed_at timestamptz;

alter table public.knowledge_embeddings
  alter column indexed_at set default now();

create index if not exists knowledge_embeddings_indexed_at_idx
  on public.knowledge_embeddings (indexed_at desc);

comment on column public.knowledge_embeddings.indexed_at is
  'Zeitpunkt des Embedding-Laufs (scripts/generate-embeddings.js). NULL = vor Einfuehrung der Spalte indexiert, Zeitpunkt unbekannt.';
