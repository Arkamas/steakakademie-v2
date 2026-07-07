# GEO-Baseline — Nullpunkt für Erfolgsmessung

> Zweck: dokumentierter Ist-Stand VOR den Entity-/GEO-Maßnahmen. Bei jedem Re-Check
> neue Spalte/Zeile ergänzen, nie überschreiben.

## Messung 1 — 07.07.2026 (Baseline)

### Google (klassische Suche)

⚠️ Methodik-Hinweis: erhoben via US-basierter Websuche — deutsche SERP kann leicht
abweichen. Für den Trend reicht es; ideal wäre zusätzlich 1 manueller Check aus DE
(Inkognito) mit Screenshot.

| Query | steakakademie.de in Top 10? | Wer rankt stattdessen (Top 3) |
|---|---|---|
| „Kerntemperatur Steak" | ❌ nein | Grillfürst, grillclub.amainfo.at, Block House |
| „Kerntemperatur Steak medium Tabelle" | ❌ nein | Block House, Grillfürst, Grillcenter Nord |
| Brand-Query „steakakademie.de Kerntemperatur" | ✅ Platz 1 (/temperatur-guide) | — |

**Befund:** /temperatur-guide ist indexiert und rankt auf Brand-Queries, hat aber
**null generische Sichtbarkeit** auf dem Kern-Keyword. Gegner = Händler mit
Domain-Autorität (Grillfürst, Block House, Weber, Santos). Deckt sich mit der
GEO-Doktrin: Backlinks + Entity fehlen, Content allein reicht nicht.

### AI-Suche (manuell von Uwe zu erheben — je ~5 Min)

Frage jeweils wörtlich: **„Was ist die richtige Kerntemperatur für ein Steak medium?"**

| Plattform | Datum | Steakakademie zitiert/erwähnt? | Wer wird zitiert? | Screenshot abgelegt? |
|---|---|---|---|---|
| ChatGPT | 07.07.2026 | ❌ nein | niemand — antwortete aus Modellwissen, Quellen-Panel: „Keine weiteren Quellen gefunden" (Medium 55–57 °C) | ✅ |
| Perplexity | 07.07.2026 | ❌ nein | 10 Quellen, u. a. Fleisch24.at, Grillfürst, grillclub.amainfo, initiative-tierwohl (Medium 57–60 °C) | ✅ |
| Google AI Overview (google.de, DE-Standort Wuppertal) | 07.07.2026 | ❌ nein | KI-Übersicht zitiert Block House (+4), Grillcenter Nord, Initiative Tierwohl (55–60 °C) | ✅ |

**Zusatzbefund dt. SERP (echter DE-Standort, ersetzt US-Caveat oben):** Organisch Top 10
ebenfalls ohne steakakademie.de — Grillfürst #1, Block House #2, dann YouTube-Videos,
AMA-Grillclub, Little London, Initiative Tierwohl, Grillcenter Nord, Oberpfalz-Beef,
Bell Schweiz. AI-Overview-Quellen ⊂ SERP-Gewinner → GEO folgt SEO, wie in der Doktrin.

Screenshots nach `docs/geo-baseline-screenshots/` (gitignoren falls groß).

## Re-Check-Rhythmus

Alle 4 Wochen dieselben 3 Google-Queries + 3 AI-Abfragen wiederholen und hier
eintragen. Erwartung: Bewegung erst NACH Wikidata-Item + ersten Backlinks.
