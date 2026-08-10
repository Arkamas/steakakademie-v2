# SEO-Aktionsplan steakakademie.de — priorisiert (07.07.2026)

> Status-Legende: ✅ heute autonom gefixt · ⏳ offen · ❓ wartet auf Uwe-Input/Freigabe

## Phase A — Sofort erledigt (heute, autonom) ✅

31 Fixes committed-ready im Working Tree, u. a.:
- www-Homepage-Duplikat (Root-301 + Canonical) · Admin-Middleware-Merge (Sicherheit!) · Title-Verdopplung ~40 Seiten
- 10 Verkaufs-Landingpages in die Sitemap (additionalPaths) · Sitemap-Hygiene (prive, icon.svg, fake-lastmod)
- °F/°C-Faktenfehler in 5 Glossar-Einträgen · erfundene Homepage-Stats ersetzt · Avatar-Transparenz (Claims, Person-Schema-Gate, KI-Disclaimer, Profil-Disclosure) · Amazon-Ratings aus Schema + UI-Kennzeichnung
- Schema: Course auf /diplome + /bbq-grundkurs · HowTo→Article (methoden) · authorSchemaRef · DefinedTermSet (174 Begriffe) · absolute Bild-URLs · SearchAction-404 raus
- GEO: llms.txt · AI-Crawler-Block in robots.txt (+ Truncation-Reparatur) · Diakritika-Slugs + 301s · Bio-Konsistenz
- unoptimized-Images entfernt · AVIF aktiviert · deutsche 404-Seite

**Nächster Schritt: `npm run build` (Host) → Commit → Push → Deploy. Danach live verifizieren: www→301, /llms.txt, robots.txt vollständig.**

## Phase B — Woche 1 (kritisch, ~1 Tag Gesamtaufwand)

| # | Aufgabe | Wer | Kosten |
|---|---------|-----|--------|
| B1 | **Wortmarken-Gebühr zahlen** (Frist ~27.08., Priorität 27.05. — strategisch wichtigstes Einzelrisiko, s. Phase 6) | Uwe | Gebühr DPMA |
| B2 | GSC-Links-Report öffnen + **Ahrefs Webmaster Tools** + Bing WMT einrichten (Backlinks messbar machen) | Uwe (Zugänge) | 0 € |
| B3 | Wikidata-Item anlegen (Spec: docs/wikidata-item-spec.md) → Q-ID → sameAs-Verdrahtung | Uwe 10 Min → Claude | 0 € |
| B4 | AI-Baseline: 3 Abfragen ChatGPT/Perplexity/AI Overview (docs/geo-baseline.md Tabelle) | Uwe 10 Min | 0 € |
| B5 | Social-Bio-Links prüfen: alle 4 Profile + YouTube-Kanal → steakakademie.de | Uwe 5 Min | 0 € |
| B6 | Sitemap unter GSC-Domain-Property erneut einreichen | Uwe 2 Min | 0 € |
| B7 | PSI-Messung / und /cuts/ribeye (pagespeed.web.dev) als Performance-Baseline | Uwe 5 Min | 0 € |
| B8 | Bild-Freigabe: hero-thermometer 9,9 MB + hero-ribeye 8,9 MB komprimieren, 4 tote Assets löschen (Liste in phase2) | Uwe-Go → Claude | 0 € |

## Phase C — Wochen 2–3 (hohe Wirkung, skriptbar)

| # | Aufgabe | Hebel |
|---|---------|-------|
| C1 | **Interner Verlinkungs-Sprint** (skriptbar): Glossar→Pillars (rib-eye→/cuts/ribeye, kerntemperatur→/temperatur-guide), Rezepte→Cuts/Methoden/Glossar (3–5 Links/Rezept), Diplom-Lektionen→Glossar | Behebt Einbahn-Trichter — höchster ROI ohne neuen Content |
| C2 | Glossar-Konsolidierung: ~30–45 Keyword-Permutations-Einträge mergen + 301 (wagyu-* ×13, brisket-* ×6 …), shortDefinition-Duplikat im Template fixen, °C-Vollsweep gegen kerntemperatur-referenz.yaml + Plausibilitäts-Check im glossary-agent | HCU-Risiko + Kannibalisierung weg |
| C3 | KeyFacts-/„Kurz & knapp"-Komponente auf temperatur-guide + ribeye (Design → Uwe-Review) | AI-Overview-Liftbarkeit |
| C4 | Presse-Pitch Gründerstory (WZ, IHK, Gründerportale) + Kerntemperatur-Spickzettel als Linkable Asset ausspielen | Erste echte Links |
| C5 | og:image-Sweep: restliche Seiten mit openGraph ohne images | Snippet-Qualität |

## Phase D — Monat 2 (Content & Autorität)

1. Cut-Hubs nach Roadmap: **/cuts/filet → t-bone → tomahawk → rumpsteak** (Spokes existieren bereits!), dann entrecote, picanha-tafelspitz
2. AT/CH-Nomenklatur: Glossar Beiried/Rostbraten/Lungenbraten/Tafelspitz/Hohrücken + Synonymzeilen auf Cut-Seiten (Fakten prüfen, Regel 8c)
3. Wissens-Guides: Fleisch-ruhen-lassen, Steak-salzen/Dry-Brining, Marmorierung/BMS (Diplom-Funnel!)
4. Externe Quellen (2–4 je Pillar) + mehr Uwe-Bylines/reviewedBy auf Pillars
5. Foren-Präsenz GSV/BBQ-Treff (offenes Visier), Affiliate-Programme als Link-Türöffner (= Blocker #4)
6. /diplome/roadmap Bundle 907 kB → Code-Split prüfen

## Phase E — laufend (Monitoring)

- GSC wöchentlich (Agent 2/10 aus CLAUDE.md aufsetzen — Service Account = M6)
- Rank-Tracking Kron-Keywords: Kerntemperatur Steak, Ribeye, Reverse Sear, Brisket + Brand-Query
- AI-Zitier-Check monatlich gegen Baseline (docs/geo-baseline.md)
- Backlink-Wachstum via AWT/GSC monatlich
- CSP-Header (Hardening-Backlog) · Sentry/Uptime (bereits im Ideen-Memo, nach Hebel 3)
