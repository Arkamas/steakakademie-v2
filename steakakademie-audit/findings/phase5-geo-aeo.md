# Phase 5 — GEO/AEO & DACH (07.07.2026)

Scope-Korrektur (Uwe): DACH-weit, kein Local SEO Wuppertal.

## Findings + Status

| # | Severity | Finding | Status |
|---|----------|---------|--------|
| GEO-1 | Hoch | Keine llms.txt — billigster Hebel für Burggraben 3 (KI-Zitierbarkeit) ungenutzt | ✅ GEFIXT: public/llms.txt mit kuratierten Pillar-URLs (llmstxt.org-Format) |
| GEO-2 | Mittel | robots.txt ohne explizite AI-Crawler-Behandlung (nur `*`) | ✅ GEFIXT: expliziter Allow-Block für GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot, Google-Extended, Applebot-Extended, Amazonbot, CCBot, Bytespider u. a. |
| GEO-3 | Hoch (Integrität) | robots.txt war auf dem Host TRUNCATED (Sitemap-Zeile abgeschnitten — Folge einer sed-Schreiboperation) | ✅ GEFIXT: Datei komplett neu geschrieben. ⚠️ Nach Pull in Claude Code gegenprüfen: `type public\robots.txt` muss mit `Sitemap: …/sitemap.xml` enden |
| GEO-4 | Mittel | Kein „Kurz & knapp"/KeyFacts-Block auf Pillar-Seiten (das Format, das AI Overviews/Perplexity liften) | ⏳ ROADMAP: KeyFacts-Komponente (UI-Änderung → Uwe-Freigabe, human-in-the-loop) |
| GEO-5 | Mittel | °C-Spannen uneinheitlich: Guide „54–56", Ribeye „54–57", YAML-Kanon [54–58, c:54] | ✅ TEILGEFIXT: Ribeye auf 54–56 normiert (= Guide, innerhalb Kanon). Grundsatzfrage offen: Werte künftig aus kerntemperatur-referenz.yaml RENDERN statt hardcoden (nie wieder Divergenz) |
| GEO-6 | Mittel | Entity-Verankerung fehlt: kein Wikidata-Item, keine sameAs-Profile | ✅ GEFIXT (07.07. abends): Wikidata-Item **Q140455747** angelegt + in organizationSchema.sameAs verdrahtet (schema.ts:27, committed+gepusht). Offen: LinkedIn o. ä. als Person-sameAs für Uwe. Wikipedia: bewusst NICHT versuchen (Relevanzkriterien) |
| GEO-7 | Niedrig (Chance) | AT/CH-Cut-Nomenklatur unbedient (Beiried, Rostbraten, Lungenbraten, Tafelspitz, Hohrücken) — LLMs beantworten diese Fragen heute ohne Steakakademie | ⏳ ROADMAP: Glossar-Synonym-Einträge + Synonymzeile auf Cut-Seiten. Fakten vor Publikation prüfen (Regel 8c) |
| GEO-8 | Niedrig | inLanguage 'de' statt 'de-DE' (gruender-schmiede/lernen) | ✅ GEFIXT |

## Bewusste Nicht-Maßnahmen (korrekt so)
- **hreflang: NICHT nachrüsten.** Eine Sprachversion für DE/AT/CH = kein hreflang-Anwendungsfall; Annotationen ohne Länderversionen wären Fehlkonfiguration. AT/CH-Content-Split würde die Autorität der einen Version schwächen.
- **GSC-Geo-Targeting: kein Handlungsbedarf** (.de rankt in AT/CH über Sprachrelevanz). Offen bleibt nur: Sitemap unter der Domain-Property erneut einreichen (bereits in CLAUDE.md).

## Offene Messpunkte — Update 07.07.2026 (Vorarbeit erledigt)
1. ✅ Google-Baseline erhoben (`docs/geo-baseline.md`): „Kerntemperatur Steak" Top 10 = KEIN steakakademie.de (es ranken Grillfürst, Block House, Weber). Brand-Query = Platz 1, /temperatur-guide indexiert. Befund: Content da, Autorität/Entity fehlt. Caveat: US-basierte Suche, dt. SERP kann abweichen.
2. ⏳ UWE (~10 Min): 3 AI-Abfragen (ChatGPT/Perplexity/Google AI Overview) — Tabelle in docs/geo-baseline.md ausfüllen.
3. ✅ Wikidata vorgeprüft: KEIN Item vorhanden. Fertige Spec: `docs/wikidata-item-spec.md` (inkl. DPMA-Markenanmeldung als Notability-Anker; Löschrisiko ohne externe Belege vermerkt). ⏳ UWE (~10 Min): Item anlegen → Q-ID zurückmelden → sameAs-Verdrahtung folgt.
4. ⏳ /llms.txt nach Deploy live testen.

## What works ✅
temperatur-guide ist GEO-vorbildlich (definitorischer Intro, FAQ im Snippet-Format mit BfR/EFSA-Nennung, Tabellen, HowTo); Ribeye mit Frage-H2s + sichtbarem FAQ = Schema-konsistent; Glossar-shortDefinitions ideale Antwort-Einheiten (174×); Organization-Entity konsistent (Fass-Logo, 4× sameAs); keine Header/Middleware, die AI-Crawler blockieren.
