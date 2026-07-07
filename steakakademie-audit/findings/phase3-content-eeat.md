# Phase 3 — E-E-A-T & Content (07.07.2026)

## Findings + Status

| # | Severity | Finding | Status |
|---|----------|---------|--------|
| C1 | Critical | °F-als-°C-Fehler in 5 Glossar-Einträgen (203 °C „Kerntemperatur", 225–275 °C „Kammertemperatur") — Verstoß Regel 8c, Burggraben-Schaden | ✅ GEFIXT: 3-2-1 (71/88/93–95 °C), smoker-monitoring (107–135 °C), brisket-evangelium/kugelgrill (110 °C Garraum), wagyu-brisket (107–110 °C). ⏳ Vollsweep aller 173 Einträge + Plausibilitäts-Check im Glossar-Agent = Follow-up |
| C2 | Critical | Erfundene Trust-Bar-Stats auf Homepage („200+ Cuts analysiert" bei 3 Cut-Seiten; „8 Thermometer selbst getestet" bei testedCount 3) — UWG-§5-Risiko | ✅ GEFIXT: „35 Diplom-Lektionen — Bronze bis Meister" + „3 Thermometer im 8-Wochen-Test" |
| C3 | Critical | KI-Avatare live als „drei Experten mit echter Praxiserfahrung" verkauft + volles Person-Schema (Fake-Bylines-Muster à la Sports Illustrated; Irreführungsrisiko) | ✅ GEFIXT: /autoren-Claims umformuliert (KI-Personas, Verantwortung Uwe), Person-Schema nur noch bei realPerson, „KI-Redaktionspersona"-Label + Disclosure-Absatz auf Avatar-Profilen, KI-Disclaimer um Artikel-Autorenschaft erweitert |
| H1 | High | AggregateRating aus statischen Amazon-Fremdwerten im Product-Schema (Google-Review-Snippet-Richtlinie + Omnibus) | ✅ GEFIXT: aggregateRating aus schema.ts entfernt (redaktionelle Review bleibt); UI-Sterne als „Ø Amazon" / „Amazon-Bewertungen" gekennzeichnet. ⚠️ Werte veralten (lastChecked 05/2026) — PA-API-Anbindung (C1/M8) löst das |
| H2 | High | Glossar = 173 uniform-dünne Einträge (137–217 W, 100 % <300 W) + shortDefinition-Duplikat im Body + 30–45 Keyword-Permutations-Einträge (wagyu-* ×13, brisket-* ×6, kollagen ×4…) — HCU-Risiko | ⏳ ROADMAP: Top-30 ausbauen, ~40 mergen + redirecten, Template-Duplikat im glossary-agent fixen |
| H3 | High | Interne Verlinkung = Einbahn-Trichter: Glossar (173), Rezepte (66), Diplom-Lektionen (35), USA (4) senden 0 Links; 0 Links auf /aging, /rezepte, /diplome | ⏳ ROADMAP #0 (höchster ROI): Auto-Verlinkungs-Sprint |
| H4 | High | Kannibalisierung Kron-Keywords: Glossar rib-eye vs. /cuts/ribeye (18k!), 3× Kerntemperatur-Glossar vs. /temperatur-guide | ⏳ ROADMAP: eindampfen + Canonical-Links auf Pillars |
| H5 | High | 0 externe Quellen im gesamten Fach-Content | ⏳ ROADMAP: 2–4 autoritative Referenzen je Pillar |
| H6 | High | Marco in 4 Namensvarianten + toter authorSlug marco-richter | ✅ GEFIXT: Marco Fierro→Marco (3), Marco Richter/marco-richter→Marco/marco (1). „Marco" vs. „Marco, der Pitmaster" (Kosmetik) offen |
| M1 | Medium | Kaputte Diakritika-Slugs entrec-te / ib-rico | ✅ GEFIXT: → entrecote / iberico (Frontmatter + Datei) + 301-Redirects in netlify.toml |
| M2 | Medium | Disclosure-Widerspruch: „ALLE Produkte selbst getestet" vs. 1 dokumentierter Test | ✅ GEFIXT: Formulierung an Footer angeglichen |
| M3 | Medium | Uwe-Bio-Widerspruch: /ueber-uns („Weber-zertifiziert, 30 J. Marketing") vs. authors.ts/CLAUDE.md („zert. Marketing-Manager, 20 J. Trainer") | ❓ UWE ENTSCHEIDEN: welche Fassung stimmt? Dann vereinheitlichen + sameAs (LinkedIn/Wikidata) setzen |
| M4 | Medium | Uwe (stärkstes E-E-A-T-Asset) zeichnet nur 10 von ~150 Artikeln | ⏳ ROADMAP: reviewedBy-Schema + mehr Uwe-Bylines auf Pillars |
| M5 | Medium | Homepage-/Artikel-Claim „8 Modelle verglichen" (Thermometer) vs. testedCount 3 — evtl. korrekt (verglichen ≠ getestet) | ❓ VERIFIZIEREN: Vergleichstabelle zählen, ggf. Titel anpassen |
| L1 | Low | Ribeye-Typos (makellosse, marmoriért, Hauptaugenmuster, „Fett zu verlassen") | ✅ GEFIXT |
| L2 | Low | Gründer-Schmiede Modul-Lücke 05 (00–04, 06 vorhanden) | ❓ UWE: gewollt? |

## Cluster-Karte & Content-Roadmap (Kurzfassung)
Topische Basis breit (277 Content-Assets), aber Archipel statt Cluster. Verlinkungsstatistik: 130× →glossar, 22× →methoden, 4× →temperatur-guide, je 0× →rezepte/aging/diplome/usa.
**Roadmap (Traffic × Conversion):** #0 Verlinkungs-Sprint (skriptbar, 0 neue Seiten) → 1 /cuts/filet (~20k geschätzt) → 2 /cuts/t-bone → 3 /cuts/tomahawk → 4 /cuts/rumpsteak → 5 Glossar-Konsolidierung → 6 /cuts/entrecote → 7 Rückwärtsgaren (DE-Keyword) → 8 Fleisch-ruhen-lassen → 9 Steak-salzen/Dry-Brining → 10 /cuts/picanha-tafelspitz → 11 Marmorierung/BMS → 12 Snake-Methode. Alle Suchvolumina = Schätzungen (kein Keyword-Tool angebunden).

## What works ✅
Rezepte/Methoden/Cuts solide Tiefe (Median 1.328 W, exakte g/°C-Angaben), /cuts/ribeye strukturell vorbildlich (H-Hierarchie, Tabellen, FAQ, TOC), Uwes reale Bio stark (/ueber-uns ehrlich + glaubwürdig), Vergleichs-Content methodisch sauber dokumentiert, Werbekennzeichnung vorhanden.
