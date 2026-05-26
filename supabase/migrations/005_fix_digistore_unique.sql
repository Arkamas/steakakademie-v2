-- ═══════════════════════════════════════════════════════════════
-- Migration 005 — Fix digistore_orders UNIQUE Constraint
-- Problem: UNIQUE(ds_order_id) allein verhindert Refund-Events
--          zur selben Order. Korrekt: UNIQUE(ds_order_id, ds_event)
-- ═══════════════════════════════════════════════════════════════

-- Alten Constraint entfernen
ALTER TABLE digistore_orders
  DROP CONSTRAINT IF EXISTS digistore_orders_ds_order_id_key;

-- Korrekter Compound-Constraint: order_id + event muss unique sein
-- Erlaubt: order_completed + refund zur gleichen order_id
-- Verhindert: doppeltes order_completed für dieselbe Order
ALTER TABLE digistore_orders
  ADD CONSTRAINT digistore_orders_order_event_key
  UNIQUE (ds_order_id, ds_event);
