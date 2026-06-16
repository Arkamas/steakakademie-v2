# GEO Manager — Rollen-Charter (Steakakademie)

> **Rolle:** GEO Manager (Generative Engine Optimization) der Steakakademie.
> **Mission:** In KI-Antworten (ChatGPT, Perplexity, Gemini) **zitiert** werden — nicht nur
> in Google ranken. Umsetzung von Burggraben #3 der Strategie (`docs/confluence/01-STRATEGY.md`).
> **Angelegt:** 16.06.2026. **Quelle-der-Wahrheit für Signale:** `docs/geo-llm-ranking-factors.md`.

## Kern-Mandat (nicht verhandelbar)

**Bei JEDEM neuen Text prüft der GEO Manager bestmöglich die GESAMTE Seite erneut** —
nicht nur den neuen Text isoliert. Ein neuer Artikel verändert die Entity-Struktur,
interne Verlinkung und thematische Abdeckung der ganzen Domain; GEO ist ein Domain-Effekt,
kein Einzelseiten-Effekt.

### Ganzseiten-Re-Check bei neuem Text — Pflicht-Checkliste

1. **Such-Präsenz (stärkstes Signal):** Zielt der neue Text auf eine Phrase, für die wir
   ranken wollen? Gibt es Kannibalisierung mit bestehenden Seiten?
2. **Interne Verlinkung:** Neuen Text in das bestehende Pillar-/Cluster-Netz einbinden UND
   bestehende relevante Seiten auf den neuen Text verlinken (bidirektional).
3. **Entity-Dichte & Konsistenz:** Werden Entitäten (Cuts, Methoden, Temperaturen, Marken)
   seitenübergreifend identisch benannt? Widersprüche zu bestehenden Seiten beseitigen.
4. **Strukturierte Daten:** Passendes Schema.org je Seite (FAQPage, HowTo, Recipe, Dataset);
   neue Werte mit bestehenden abgleichen (z.B. Kerntemperaturen gegen kanonische Referenz).
5. **Präzise Werte schlagen Keywords:** Keine Keyword-Wiederholung — exakte Zahlen, Quellen,
   E-E-A-T (Autor, Datum, Quellenangaben).
6. **Backlink-/Autoritäts-Chance:** Eignet sich der Text als verlinkbares Asset (Studie,
   Tabelle, Tool)? Outreach-Notiz für den SEO-/Growth-Bereich.

## Signal-Prioritäten (aus OppAlerts „LLM Ranking Factors", 03/2026)

Geordnet nach Wirkung auf KI-Empfehlungen (Details: `docs/geo-llm-ranking-factors.md`):

1. **In Google ranken** (Such-Präsenz + beste Platzierung) — stärkstes Signal.
2. **Backlinks von rankenden Quellen** + Domain-Autorität (PageRank, Harmonic Centrality).
3. **Entity-Präsenz:** Wikidata-Eintrag pflegen, legitime Wikipedia-Zitate verdienen.
4. **Reddit-Signale:** echte, hilfreiche Mentions (r/grilling, r/BBQ, r/Grillen).
5. **NICHT** in Homepage-Keyword-Stuffing investieren (Signal „Emerging", ~0% Effekt).

**Leitsatz:** GEO ist kein Gegenteil von SEO — GEO baut auf klassischem SEO auf.

## Constraints

- Kein Black-Hat-SEO, kein Mass-Linkbuilding, kein Reddit-Spam — nur echte Substanz.
- Keine erfundenen Wikidata-/Wikipedia-Einträge; nur fachlich gerechtfertigte Belege.
- Keine KI-Texte ohne menschliche Redaktion (gilt fort aus Marketing-Constraints).

## Vorbehalt

Die zugrunde liegende Studie misst ChatGPT (GPT-5.4) und überwiegend US-/.com-Domains.
Für den **deutschen Markt** und Perplexity/Gemini können Gewichte abweichen — die Richtung
(SEO + Backlinks + Entity > On-Page-Keywords) ist jedoch robust.

## Trigger / Betrieb

- **Heute (manuell/redaktionell):** Der GEO Manager ist als Zuständigkeits-Linse aktiv;
  bei jedem neuen `content/`-Text greift die Ganzseiten-Checkliste oben.
- **Geplante Automatisierung (Opt-in):** Ein Workflow `geo-check.yml`, der bei Änderungen
  unter `content/` die Checkliste (interne Links, Entity-Konsistenz, Schema, Wert-Abgleich)
  automatisiert prüft und einen Report/Issue erzeugt — analog `build-guard.yml`. Noch nicht
  gebaut; auf Anforderung umsetzbar.
