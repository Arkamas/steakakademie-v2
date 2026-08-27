-- ANGEWENDET am 27.08.2026 auf Projekt bbgdrzhlellxzggbbqcm (per MCP apply_migration),
-- Ledger-Version 20260827235322. Wiederholbar (IF NOT EXISTS / DROP+ADD / idempotentes UPDATE).
--
-- ANLASS: Wie viele Diagnose-Credits ein Kauf gutschreibt, stand hartkodiert im
-- Webhook (CREDIT_PRODUCTS) plus einer Env-Variablen je Paket. Jedes weitere Paket
-- haette damit Code-Aenderung + Deploy gekostet. Ab hier ist ein neues Paket EINE Zeile.
ALTER TABLE public.digistore_products
  ADD COLUMN IF NOT EXISTS credit_amount integer;

ALTER TABLE public.digistore_products
  DROP CONSTRAINT IF EXISTS digistore_products_credit_amount_positive;
ALTER TABLE public.digistore_products
  ADD CONSTRAINT digistore_products_credit_amount_positive
  CHECK (credit_amount IS NULL OR credit_amount > 0);

COMMENT ON COLUMN public.digistore_products.credit_amount IS
  'Diagnose-Credits, die EIN Kauf dieses Produkts gutschreibt. NULL = kein Credit-Produkt. Ersetzt die frueher im Webhook hartkodierte CREDIT_PRODUCTS-Liste: ein neues Paket ist damit eine Zeile, kein Deploy.';

-- Bestand: Einzeldiagnose 7 EUR
UPDATE public.digistore_products SET credit_amount = 1 WHERE ds_product_id = '696394';

-- Nach Anlage der Pakete in Digistore24 (5er 25 EUR, 10er 44 EUR) je eine Zeile:
--   INSERT INTO digistore_products (ds_product_id, course_id, credit_amount)
--   SELECT '<neue-id>', id, 5 FROM courses WHERE slug = 'steak-beichte';
