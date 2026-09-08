-- ============================================================
-- Web Vitals — eigene Messung der Core Web Vitals
-- Migration: 20260908070000_web_vitals
--
-- WARUM DIESE TABELLE EXISTIERT
-- Der Perf-Audit vom 02.09.2026 hat das Browser-Tracing des Sentry-SDK aus
-- dem Client-Bundle entfernt (__SENTRY_TRACING__ = false in next.config.mjs,
-- rund 108 kB gespart). Richtig entschieden — nur sind damit auch die
-- Web-Vitals-Messungen echter Besucher verschwunden. Seit dem 02.09. liegen
-- keine LCP-, CLS- oder INP-Werte mehr vor; die letzten belastbaren Zahlen
-- stammen aus der Zeit davor (Startseite: LCP p75 1.017 ms, CLS 0,0005).
--
-- Diese Tabelle holt die Messung zurueck, ohne das Bundle wieder aufzublaehen
-- und ohne einen neuen Auftragsverarbeiter: next/web-vitals (im Framework
-- enthalten) meldet an /api/web-vitals, die Route schreibt hierher.
--
-- WAS BEWUSST NICHT GESPEICHERT WIRD
--   * keine IP-Adresse, kein User-Agent, keine Session- oder Nutzer-ID
--   * kein Cookie, kein Local-Storage-Eintrag auf Client-Seite
--   * keine Query-Parameter (der Pfad wird vor dem Senden abgeschnitten)
-- Damit entstehen aggregierte technische Messwerte ohne Personenbezug.
-- Ein Consent-Banner ist dafuer nicht noetig (kein Zugriff auf Endgeraete-
-- Informationen im Sinne von § 25 TDDDG, keine personenbezogene Auswertung).
--
-- ZUGRIFF
-- RLS ist an, aber es gibt bewusst KEINE Policy: weder anon noch authenticated
-- duerfen lesen oder schreiben. Der einzige Schreibweg ist die Service-Role in
-- src/app/api/web-vitals/route.ts, der einzige Leseweg SQL mit Service-Role.
-- ============================================================

create table if not exists public.web_vitals (
  id           bigint generated always as identity primary key,
  created_at   timestamptz not null default now(),
  -- Pfad ohne Query und Fragment, auf 200 Zeichen begrenzt.
  route        text        not null check (char_length(route) between 1 and 200),
  -- Die fuenf Metriken, die next/web-vitals meldet.
  metric       text        not null check (metric in ('LCP','CLS','INP','FCP','TTFB')),
  -- Millisekunden; Ausnahme CLS, dort ein dimensionsloser Wert < 10.
  value        double precision not null check (value >= 0 and value < 3600000),
  rating       text        not null check (rating in ('good','needs-improvement','poor')),
  navigation   text        not null check (navigation in ('navigate','reload','back-forward','back-forward-cache','prerender','restore')),
  -- 'mobile' | 'desktop', clientseitig ueber matchMedia(pointer:coarse) bestimmt.
  device       text        not null check (device in ('mobile','desktop')),
  -- Git-SHA des Deployments, damit ein Vorher/Nachher-Vergleich moeglich ist.
  release      text        check (release is null or char_length(release) <= 40)
);

comment on table public.web_vitals is
  'Core Web Vitals echter Besucher. Keine personenbezogenen Daten: keine IP, kein User-Agent, keine Nutzer-ID. Schreibzugriff nur ueber die Service-Role in /api/web-vitals.';

-- Auswertung laeuft immer ueber Zeitraum + Route/Metrik.
create index if not exists web_vitals_created_at_idx on public.web_vitals (created_at desc);
create index if not exists web_vitals_route_metric_idx on public.web_vitals (route, metric, created_at desc);

alter table public.web_vitals enable row level security;
-- Absichtlich keine Policy: Clients haben keinerlei Zugriff.
