-- Das Ehrliche System — Seed Data
-- Run in Supabase Dashboard → SQL Editor
-- 3 Säulen = 3 eigenständige Produkte
-- Note: published = false (default) — set to true when course content is ready

-- 1. Alte BBQ-Kurse entfernen (falls vorhanden)
DELETE FROM courses WHERE slug IN ('steak-masterclass', 'grill-science', 'advanced-bbq');

-- 2. Die 3 Säulen des Ehrlichen Systems eintragen
INSERT INTO courses (title, description, price, slug)
VALUES
  (
    'Der Gründung-Sprint',
    'Von der Idee zur rechtssicheren Gewerbeanmeldung und ersten Website in 72h. Kein Agentur-Modell, keine vagen Versprechen — konkrete Schritte, reale Kosten, reproduzierbare Ergebnisse.',
    297.00,
    'gruendung-sprint'
  ),
  (
    'Die Steuer-Matrix',
    'Datengestützte Entscheidungshilfe durch Netto-Vergleiche. GmbH vs. Einzelunternehmen, Gewinnentnahme-Optimierung, KI-Modelle für Solo-Selbstständige. Kein Steuerberater-Ersatz — ein Entscheidungs-Werkzeug.',
    197.00,
    'steuer-matrix'
  ),
  (
    'Der Agentur-Killer-Sprint',
    'Befreiung von Drittanbieter-Abhängigkeiten durch Full-Ownership in 72h. Website-Migration zu Next.js + Vercel, GitHub-Ownership, Claude Code als dein Werkzeug. Einmal aufgesetzt, für immer unabhängig.',
    497.00,
    'agentur-killer-sprint'
  )
ON CONFLICT (slug) DO NOTHING;
