-- Perf-Audit 02.09.2026 — Datenbank
-- ==================================
-- Drei Befunde des Supabase-Performance-Advisors, alle ohne Verhaltensaenderung:
--
-- 1. auth_rls_initplan: `auth.uid()` / `auth.role()` in RLS-Policies wird ohne
--    `(select ...)` fuer JEDE Zeile neu ausgewertet. Mit der Subselect-Form
--    wertet Postgres den Aufruf einmal pro Anfrage aus (InitPlan). Die
--    Policies bleiben semantisch identisch — nur der Ausdruck aendert sich.
-- 2. unindexed_foreign_keys: sechs Fremdschluessel ohne Index. Betrifft
--    Joins/Deletes ueber die referenzierte Tabelle (z. B. courses → bookings).
-- 3. duplicate_index: digistore_orders hatte zwei identische Indizes auf
--    ds_email (ds_orders_email_idx, idx_digistore_orders_email).
--
-- NICHT angefasst: die HNSW-Indizes auf knowledge_embeddings / kochwissen
-- (Advisor: "unused"). Der Zaehler ist seit dem letzten Stats-Reset null,
-- die RAG-Suche laeuft aber ueber sie — erst nach 30 Tagen Beobachtung
-- entscheiden, nicht nach einem Schnappschuss.

-- 1) RLS-Policies: auth.*() → (select auth.*())
alter policy "Service role inserts bookings" on public.bookings
  with check ((select auth.role()) = 'service_role');
alter policy "Users can insert own bookings" on public.bookings
  with check ((select auth.uid()) = user_id);
alter policy "Users view own active bookings" on public.bookings
  using (((select auth.uid()) = user_id) and (status = any (array['active'::text, 'pending'::text])));
alter policy "users_own_bookings" on public.bookings
  using ((user_id = (select auth.uid())) and (revoked_at is null));

alter policy "service_full_access" on public.content_drafts
  using ((select auth.role()) = 'service_role');
alter policy "service_full_access_runs" on public.pipeline_runs
  using ((select auth.role()) = 'service_role');

alter policy "users_insert_own_progress" on public.course_progress
  with check (user_id = (select auth.uid()));
alter policy "users_select_own_progress" on public.course_progress
  using (user_id = (select auth.uid()));
alter policy "users_update_own_progress" on public.course_progress
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

alter policy "Authenticated users view own purchased courses" on public.courses
  using (exists (
    select 1 from public.bookings
    where bookings.course_id = courses.id
      and bookings.user_id = (select auth.uid())
      and bookings.status = any (array['active'::text, 'pending'::text])
  ));

alter policy "users_own_credits" on public.diagnose_credits
  using (user_id = (select auth.uid()));
alter policy "users_own_diagnosen" on public.diagnosen
  using (user_id = (select auth.uid()));

alter policy "Users view own orders" on public.digistore_orders
  using (lower(ds_email) = lower((select users.email from auth.users where users.id = (select auth.uid()))::text));

alter policy "users_insert_own_profile" on public.profiles
  with check (user_id = (select auth.uid()));
alter policy "users_select_own_profile" on public.profiles
  using (user_id = (select auth.uid()));
alter policy "users_update_own_profile" on public.profiles
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

alter policy "users_own_protokolle" on public.protokolle
  using (user_id = (select auth.uid()));

alter policy "eigenen beitrag einreichen" on public.streitfall_beitraege
  with check (((select auth.uid()) = user_id) and (status = 'neu'));
alter policy "freigegebene lesen" on public.streitfall_beitraege
  using ((status = 'freigegeben') or ((select auth.uid()) = user_id));

alter policy "eigene stimme abgeben" on public.streitfall_votes
  with check ((select auth.uid()) = user_id);
alter policy "eigene stimme aendern" on public.streitfall_votes
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
alter policy "eigene stimme lesen" on public.streitfall_votes
  using ((select auth.uid()) = user_id);

alter policy "eigene einreichungen lesen" on public.user_recipes
  using ((select auth.uid()) = user_id);

-- 2) Fremdschluessel-Indizes
create index if not exists digistore_orders_booking_id_idx on public.digistore_orders (booking_id);
create index if not exists digistore_orders_course_id_idx on public.digistore_orders (course_id);
create index if not exists digistore_products_course_id_idx on public.digistore_products (course_id);
create index if not exists streitfall_beitraege_user_id_idx on public.streitfall_beitraege (user_id);
create index if not exists streitfall_votes_user_id_idx on public.streitfall_votes (user_id);
create index if not exists vouchers_course_id_idx on public.vouchers (course_id);

-- 3) Doppelter Index
drop index if exists public.ds_orders_email_idx;
