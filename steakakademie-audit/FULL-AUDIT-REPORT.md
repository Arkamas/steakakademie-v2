# SEO-Audit steakakademie.de — Gesamtbericht

**Datum:** 07.07.2026 · **Auditor:** Claude (Lead Technical SEO Director, claude-seo Toolkit) · **Scope:** Technik, Content/E-E-A-T, Schema, GEO/AEO (DACH), Off-Page · **Basis:** Live-Site + lokales Repo (Next.js 14, Netlify)

---

## Executive Summary

**SEO Health Score: 70/100** (vor den heutigen Fixes: ~58/100)

| Kategorie | Gewicht | Score | Kommentar |
|---|---|---|---|
| Technisches SEO | 22 % | 85 | Nach 16 Fixes stark; CWV-Messung offen |
| Content-Qualität | 23 % | 58 | Rezepte/Methoden stark; Glossar = 173 Thin-Pages, 0 Quellen |
| On-Page | 20 % | 65 | Titles/Canonicals/Meta sauber; interne Verlinkung = Einbahn-Trichter |
| Schema/Strukturierte Daten | 10 % | 88 | Nach 10 Fixes nahezu vollständig |
| Performance (CWV) | 10 % | 65* | *Lab-Messung aus Sandbox nicht möglich — konservative Schätzung; Bild-Altlasten bekannt |
| AI-Search-Readiness (GEO) | 10 % | 62 | Formate exzellent, Entity-Signale bei null (Wikidata offen) |
| Bilder | 5 % | 70 | Alt-Texte gut; 73 MB Quell-Ballast, 2 Monster-Heroes |

**Business-Typ:** Content-Publisher + Affiliate + digitale Kurse (kein Local). **Kein Local SEO nötig** — DACH läuft über Sprachrelevanz, hreflang bewusst nicht gesetzt.

### Die 5 kritischsten Befunde (alle behoben ✅)
1. **Admin-Schutz in Prod tot** — Root-middleware.ts wurde von Next ignoriert → in src/middleware.ts gemerged
2. **www-Homepage = unkanonisiertes Duplikat** (200 statt 301) → Root-Redirect + Canonical
3. **°F-als-°C-Faktenfehler in 5 Glossar-Einträgen** („203 °C Kerntemperatur") — direkter Schaden am erklärten Burggraben → korrigiert
4. **Erfundene Trust-Stats + „drei Experten"-Fake-Bylines** (UWG-/HCU-Risiko, Sports-Illustrated-Muster) → wahre Zahlen, KI-Persona-Transparenz, Person-Schema-Gate
5. **Alle 10 Verkaufs-Landingpages fehlten in der Sitemap** (SSR-Falle) → additionalPaths

### Die 5 größten offenen Hebel
1. **Off-Page = 0** — kein einziger externer Link auffindbar; „Kerntemperatur Steak"-Top-10 ranken über Domain-Autorität, nicht Content (Baseline: docs/geo-baseline.md). → 12-Punkte-Plan, Phase 6
2. **Wortmarken-Gebühr** (Frist ~27.08.) — Namensvettern besetzen die Erwähnungslandschaft; ohne Marke arbeitet dein Content für sie
3. **Interne Verlinkung:** Glossar (173), Rezepte (66), Diplom-Lektionen (35) senden 0 Links — PageRank versickert. Skriptbarer Sprint = höchster ROI ohne neuen Content
4. **Glossar-Konsolidierung:** ~40 Keyword-Permutations-Einträge (Thin/HCU-Risiko), Kannibalisierung der Kron-Keywords (Glossar-rib-eye vs. /cuts/ribeye 18k)
5. **Cut-Hubs:** 3 von ~15 relevanten Cut-Guides existieren, Spokes (Glossar+Rezepte) sind fertig — /cuts/filet (~20k geschätzt) zuerst

### Heute autonom umgesetzt: 31 Fixes
Details je Phase: `findings/phase2-technical.md` (16) · `findings/phase3-content-eeat.md` (8) · `findings/phase4-schema.md` (10) · `findings/phase5-geo-aeo.md` (5) — einzelne Fixes phasenübergreifend gezählt. **Vor Push: `npm run build` auf dem Host (Sandbox-Mount-Falle).**

---

## Kategorie-Details

### 1. Technisches SEO (Phase 2) — findings/phase2-technical.md
Gefixt: www-Root-Redirect, Middleware-Merge (Admin-Gate + Login-Gate), Title-Suffix-Sweep (~40 Seiten), Sitemap additionalPaths + Hygiene (prive/icon.svg/diplome-profil/fake-lastmod), noindex-Politik Geld-Seiten (Beichte+Protokoll indexierbar, Fleischpass noindex bis Launch), kaputtes .nl-Canonical, deutsche 404, robots.txt /admin/, unoptimized-Images, AVIF, .gitignore Sitemap-Artefakte.
Offen: CSP (Backlog), Bild-Kompression (Uwe-Freigabe), PSI-Baseline (manuell), /diplome/roadmap 907 kB Bundle.
Stark: Canonicals flächendeckend, generateMetadata in allen Content-Templates, Security-Header, noindex-Hygiene, kein Soft-404.

### 2. Content & E-E-A-T (Phase 3) — findings/phase3-content-eeat.md
Gefixt: °C-Fakten (5), Trust-Stats, Avatar-Transparenz-Paket, Amazon-Rating-Kennzeichnung, Disclosure-Widerspruch, Marco-Namensvarianten, Diakritika-Slugs + 301s, Ribeye-Typos, Bio-Konsistenz (Weber-zertifiziert ergänzt).
Offen: Glossar-Ausbau/-Konsolidierung, Verlinkungs-Sprint, externe Quellen, mehr Uwe-Bylines, „8 Modelle verglichen"-Claim verifizieren.
Stark: Rezepte (Median 1.328 Wörter, g/°C-präzise), /cuts/ribeye strukturell vorbildlich, Uwes reale Bio glaubwürdig.

### 3. Schema.org (Phase 4) — findings/phase4-schema.md
Gefixt: Course-Schema auf beiden Kurs-Seiten (bewusst ohne Offer bis Launch), ungültiges HowTo→Article, authorSchemaRef (Person nur real), DefinedTermSet 174 Begriffe, absolute Bild-URLs, SearchAction-404, SVG-Publisher-Logos, recipeCategory/Cuisine aus Frontmatter, ItemList-Stubs, Review-Author.
Stark: zentrale typsichere Library, Organization-Entity vollständig, Product/Offer Google-konform, FAQPage korrekt.

### 4. GEO/AEO & DACH (Phase 5) — findings/phase5-geo-aeo.md
Gefixt: llms.txt, AI-Crawler-Allow-Block + robots.txt-Truncation-Reparatur, °C-Normierung Ribeye, inLanguage.
Offen: KeyFacts-Komponente (Design-Review), Wikidata (Spec fertig, 10 Min Uwe), AI-Baseline (10 Min Uwe), AT/CH-Nomenklatur-Content.
Befund Google-Baseline: /temperatur-guide indexiert + Brand Platz 1, aber Kron-Keyword Top-10 ohne uns → Autoritätslücke, kein Content-Problem.

### 5. Backlinks & Off-Page (Phase 6) — findings/phase6-backlinks-offpage.md
Befund: 0 externe Links/Erwähnungen auffindbar (2 Monate alte Domain). „Steakakademie"-Erwähnungen im Netz gehören Namensvettern (GrillKonzept ®-Thema, Lotter). Wettbewerber ranken über Domain-Alter.
Plan: 12 Maßnahmen, alle 0 €: Messbarkeit (GSC/AWT/Bing), Social-Bio-Links, Wikidata, Presse-Gründerstory, Spickzettel als Linkable Asset, Foren (offenes Visier), Affiliate-Beziehungen, Gastbeiträge, GBA-Szene, Building-in-Public, Podcasts.

---

## Messlücken (ehrlich)
- **CWV/PSI:** aus Sandbox nicht messbar → manuelle Baseline (B7) oder GSC-Service-Account (M6)
- **Backlink-Zahlen:** erst nach GSC-Links-Report/AWT-Einrichtung (B2)
- **AI-Zitier-Baseline:** 3 manuelle Abfragen (B4)
- **Keyword-Volumina:** Schätzungen (kein Tool angebunden) — als solche gekennzeichnet
- **DE-SERP:** Baseline US-basiert erhoben, kann minimal abweichen

## Nächster konkreter Schritt
`cd C:\Dev\steakakademie-v2 && npm run build` → Commit („seo: audit fixes phases 2–5") → Push → Live-Checks (www-Redirect, /llms.txt, robots.txt) → Phase B des ACTION-PLAN.md abarbeiten (Wortmarke zuerst).
