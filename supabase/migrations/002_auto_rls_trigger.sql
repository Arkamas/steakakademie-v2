-- ═══════════════════════════════════════════════════════════════
-- Steakakademie — Auto-RLS Trigger
-- Migration: 002_auto_rls_trigger.sql
--
-- Aktiviert Row Level Security automatisch für jede neue Tabelle
-- im public-Schema. Verhindert versehentlich ungeschützte Tabellen.
--
-- Hinweis: Erfordert Superuser-Rechte (postgres-Rolle in Supabase).
-- Falls abgelehnt: RLS weiterhin manuell in jeder Migration setzen.
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION set_rls_on_new_table()
RETURNS event_trigger AS $$
DECLARE
  obj record;
BEGIN
  FOR obj IN SELECT * FROM pg_event_trigger_ddl_commands() LOOP
    IF obj.command_tag = 'CREATE TABLE' AND obj.schema_name = 'public' THEN
      EXECUTE 'ALTER TABLE ' || obj.object_identity || ' ENABLE ROW LEVEL SECURITY';
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Trigger feuert nach jedem DDL-Command — filtert intern auf CREATE TABLE / public
CREATE EVENT TRIGGER trg_auto_enable_rls
  ON ddl_command_end
  WHEN TAG IN ('CREATE TABLE')
  EXECUTE FUNCTION set_rls_on_new_table();
