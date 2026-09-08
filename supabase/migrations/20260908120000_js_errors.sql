-- ============================================================
-- JS-Fehler — eigene Erfassung von Browser-Fehlern
-- Migration: 20260908120000_js_errors
--
-- WARUM DIESE TABELLE EXISTIERT
-- Entscheidung Uwe, 08.09.2026: Der gebuendelte Sentry-Browser-Client lag mit
-- 61,7 kB (gzip) in JEDER Seite — auch in reinen Inhaltsseiten ohne eigenes
-- JavaScript und damit in gut der Haelfte des gemeinsamen 121-kB-Bundles.
-- Tracing und Session Replay waren zu dem Zeitpunkt bereits abgeschaltet; das
-- war der Rest, den reine Fehlererfassung im Browser kostet.
--
-- Der Ersatz (src/lib/fehler-melden.ts, rund 1 kB) faengt dieselben drei
-- Quellen ab und schreibt ueber /api/js-errors hierher:
--   * window 'error'            — geworfene Ausnahmen ohne catch
--   * 'unhandledrejection'      — abgelehnte Promises ohne catch
--   * global-error.tsx          — Render-Fehler, die das Root-Layout zerlegen
--
-- WAS WIR DAFUER AUFGEBEN
-- Symbolisierte Stacktraces (Source Maps), automatische Gruppierung gleich-
-- artiger Fehler, Alarm-E-Mails. Gespeichert wird der Stack so, wie der
-- Browser ihn liefert — bei minifiziertem Code also mit Chunk-Namen statt
-- Quelldateien. Server-seitiges Sentry (API-Routen, SSR, Agent-Monitoring der
-- KI-Routen) bleibt unveraendert; dort kostet die SDK kein Byte im Browser.
--
-- WAS BEWUSST NICHT GESPEICHERT WIRD
--   * keine IP-Adresse, kein vollstaendiger User-Agent (nur die grobe
--     Browser-Familie), keine Session- oder Nutzer-ID
--   * kein Cookie, kein Local-Storage-Eintrag auf Client-Seite
--   * keine Query-Parameter (der Pfad wird vor dem Senden abgeschnitten)
--
-- ZUGRIFF
-- Wie bei web_vitals: RLS an, bewusst KEINE Policy. Einziger Schreibweg ist
-- die Service-Role in src/app/api/js-errors/route.ts, einziger Leseweg SQL
-- mit Service-Role.
-- ============================================================

create table if not exists public.js_errors (
  id           bigint generated always as identity primary key,
  created_at   timestamptz not null default now(),
  kind         text        not null check (kind in ('error','unhandledrejection','render')),
  -- Fehlermeldung, auf 500 Zeichen begrenzt.
  message      text        not null check (char_length(message) between 1 and 500),
  -- Stacktrace wie vom Browser geliefert (minifiziert), auf 4000 Zeichen begrenzt.
  stack        text        check (stack is null or char_length(stack) <= 4000),
  -- Datei/Chunk, in dem der Fehler auftrat.
  source       text        check (source is null or char_length(source) <= 300),
  lineno       integer     check (lineno is null or lineno >= 0),
  colno        integer     check (colno is null or colno >= 0),
  -- Next.js-Digest bei Render-Fehlern; verbindet Client- und Server-Log.
  digest       text        check (digest is null or char_length(digest) <= 64),
  -- Pfad ohne Query und Fragment.
  route        text        not null check (char_length(route) between 1 and 200),
  -- Grobe Browser-Familie statt User-Agent: reicht fuer "geht nur im Safari
  -- kaputt" und identifiziert niemanden.
  browser      text        not null check (browser in ('chrome','safari','firefox','edge','opera','andere')),
  device       text        not null check (device in ('mobile','desktop')),
  release      text        check (release is null or char_length(release) <= 40)
);

comment on table public.js_errors is
  'Browser-Fehler echter Besucher. Keine personenbezogenen Daten: keine IP, kein voller User-Agent, keine Nutzer-ID. Schreibzugriff nur ueber die Service-Role in /api/js-errors.';

-- Auswertung laeuft ueber Zeitraum, Route und Meldung.
create index if not exists js_errors_created_at_idx on public.js_errors (created_at desc);
create index if not exists js_errors_route_idx on public.js_errors (route, created_at desc);
create index if not exists js_errors_message_idx on public.js_errors (message, created_at desc);

alter table public.js_errors enable row level security;
-- Absichtlich keine Policy: Clients haben keinerlei Zugriff.
