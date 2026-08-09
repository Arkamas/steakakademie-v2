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

## Messung 2 — 04.08.2026 (Re-Check +4 Wochen)

Maßnahme seit Baseline: Wikidata-Item **Q140455747** live + in `sameAs` des
Organization-Markups verdrahtet (Commit `bf19328`).

### Google (klassische Suche)

⚠️ Methodik-Hinweis: erneut via US-basierter Websuche erhoben (gleiche Methodik wie
Baseline-Tabelle oben, damit vergleichbar). DE-Standort-Gegencheck durch Uwe steht aus.

| Query | steakakademie.de in Top 10? | Wer rankt stattdessen (Top 3) | Δ ggü. Baseline |
|---|---|---|---|
| „Kerntemperatur Steak" | ❌ nein | Grillfürst, Little London, grillclub.amainfo.at | unverändert (Block House aus Top 3 gerutscht) |
| „Kerntemperatur Steak medium Tabelle" | ✅ **ja — Platz 3** (`/temperatur-guide`, Titel „Kerntemperaturen Fleisch — Komplette Tabelle 2026") | Beefbandits, Grillfürst, **steakakademie.de** | 🟢 **erster generischer Treffer überhaupt** (Baseline: ❌) |
| Brand-Query „steakakademie.de Kerntemperatur" | (nicht erneut geprüft) | — | — |

**Befund:** Erster nicht-Brand-Treffer. Die Long-Tail-Variante mit „Tabelle" rankt,
das Kopf-Keyword „Kerntemperatur Steak" weiter nicht. Konkurrenzfeld unverändert:
Händler/Marken mit Domain-Autorität (Grillfürst, Block House, Beefbandits,
Grillcenter Nord). Neu im Feld: beefbandits.de, rewe.de, tastybits.de.

### AI-Suche (manuell von Uwe zu erheben — je ~5 Min)

Frage jeweils wörtlich: **„Was ist die richtige Kerntemperatur für ein Steak medium?"**

| Plattform | Datum | Steakakademie zitiert/erwähnt? | Wer wird zitiert? | Screenshot abgelegt? |
|---|---|---|---|---|
| ChatGPT | — | — | — | ☐ |
| Perplexity | — | — | — | ☐ |
| Google AI Overview (google.de, DE-Standort Wuppertal) | — | — | — | ☐ |

Screenshots nach `docs/geo-baseline-screenshots/`.

## Messung 3 — 09.08.2026 (Re-Check, automatisierter Lauf)

> Hinweis: Die geplante „Messung 2 (+4 Wochen)" wurde bereits am 04.08.2026 erhoben
> (siehe oben). Dieser Lauf ist daher als **Messung 3** ergänzt, nicht überschrieben.

Maßnahme seit Baseline unverändert: Wikidata-Item **Q140455747** live + in `sameAs`
des Organization-Markups verdrahtet (Commit `bf19328`). **Keine neue Maßnahme seit
Messung 2** — dieser Lauf misst nur Stabilität.

### Google (klassische Suche)

⚠️ Methodik-Hinweis: erneut via US-basierter Websuche (gleiche Methodik wie Messung 1+2).
Die Werkzeug-Ausgabe liefert eine Ergebnis-Liste, **keine exakten SERP-Positionen** —
„Platz" = Rang innerhalb der zurückgegebenen Trefferliste, nicht garantiert Google-Rang.
DE-Standort-Gegencheck durch Uwe steht weiterhin aus.

| Query | steakakademie.de in Top 10? | Wer rankt stattdessen (Top 3) | Δ ggü. Messung 2 |
|---|---|---|---|
| „Kerntemperatur Steak" | ❌ nein | Grillfürst, lecker.de, grillclub.amainfo.at | unverändert ❌ (neu im Feld: lecker.de; Block House weiter nur Rang 4) |
| „Kerntemperatur Steak medium Tabelle" | ✅ **ja — Rang 3** (`/temperatur-guide`, Titel „Kerntemperaturen Fleisch — Komplette Tabelle 2026") | Beefbandits, Grillfürst, **steakakademie.de** | 🟢 **gehalten** (identische Position wie 04.08.) |
| Brand-Query „steakakademie.de Kerntemperatur" | (nicht geprüft in diesem Lauf) | — | — |

**DE-Gegencheck (Uwe, 09.08.2026, google.de Inkognito, Wuppertal)** — Frage-Query
wörtlich „Was ist die richtige Kerntemperatur für ein Steak medium":

| Query | steakakademie.de gefunden? | Position | Umfeld |
|---|---|---|---|
| „Was ist die richtige Kerntemperatur für ein Steak medium" | ✅ ja, aber **Seite 4** (`&start=30`, ca. Platz 33–34) | `/temperatur-guide`, Snippet „Kerntemperaturen Fleisch — Komplette Tabelle 2026" | Die Frau am Grill, Bell Schweiz, **steakakademie.de**, Grillcenter Nord, REWE |

⚠️ **Methodik-Korrektur (wichtig):** Die US-Websuche oben meldete für die verwandte
Query „…medium Tabelle" Rang 3. Der echte DE-SERP zeigt für die Frage-Query Seite 4.
Andere Query → nicht 1:1 vergleichbar, ABER: die US-Werkzeug-Liste ist **keine
verlässliche Positionsangabe** für den deutschen Markt und überschätzt vermutlich.
**Ab Messung 4: DE-Inkognito-Check ist die Leitmessung, US-Websuche nur Indikator.**

**Realistische Einordnung:** Seite 4 ≈ 0 Klicks. Die Seite ist indexiert und thematisch
zugeordnet — aber generisch praktisch unsichtbar. Das deckt sich mit der Doktrin:
Content steht, **Autorität/Backlinks fehlen**.

**Befund:** Kein Rückfall. Der einzige generische Treffer (`Kerntemperatur Steak
medium Tabelle`, Rang 3) ist über 5 Tage **stabil** — spricht gegen ein Zufalls-
Flackern und für eine echte Ranking-Position. Kopf-Keyword „Kerntemperatur Steak"
weiterhin ohne Sichtbarkeit; Feld dort unverändert von Händlern/Marken mit
Domain-Autorität besetzt (Grillfürst #1, dahinter Redaktions-/Händlerseiten).

### AI-Suche (manuell von Uwe zu erheben — je ~5 Min)

Frage jeweils wörtlich: **„Was ist die richtige Kerntemperatur für ein Steak medium?"**

| Plattform | Datum | Steakakademie zitiert/erwähnt? | Wer wird zitiert? | Screenshot abgelegt? |
|---|---|---|---|---|
| ChatGPT | 09.08.2026 | ❌ nein | **niemand** — Antwort aus Modellwissen, Quellen-Panel: „Keine weiteren Quellen gefunden" (Medium 56–58 °C) | ✅ (Chat-Screenshot 11:20) |
| Perplexity (1. Versuch, verworfen) | 09.08.2026 | ⚠️ ungültig | kein Retrieval; lief versehentlich im **„Computer"-Modus** (`/computer/tasks/…`, Modell „Preview (GLM 5.2-based)"), Quellen-Panel leer | ✅ (11:25) |
| **Perplexity (gültige Messung)** | 09.08.2026 | ✅ **JA — erstmals zitiert** | 10 Quellen; **steakakademie.de `/temperatur-guide` im Quellen-Panel gelistet** (Titel „Kerntemperaturen Fleisch — Komplette Tabelle 2026", mit Beschreibungstext „…Wissenschaftlich fundiert, praxiserprobt."). Weitere Quellen u. a. YouTube, shop.block-house. Inline-Zitat im Antworttext ging an `shop.block-hous +1` (Medium 57–60 °C) | ✅ (Screenshot 11:35, `/search/f824c6b7…`) |
| Google AI Overview (google.de, DE-Standort Wuppertal, Inkognito) | 09.08.2026 | ❌ nein (in den sichtbaren Quellen) | **shop.block-house.de** (2× inline + Karte), **Grillfürst** (2× inline + Karte), **Grillcenter Nord** (1× inline). Wert: Medium **54–58 °C**. Panel-Button „Alle anzeigen" nicht geöffnet → vollständige Quellenliste ungeprüft | ✅ (Screenshot 11:40) |

### 🟢 Kern-Befund Messung 3 — erster AI-Zitier-Erfolg

**Perplexity zitiert steakakademie.de erstmals.** Baseline 07.07.: 10 Quellen, keine
davon Steakakademie. Heute: 10 Quellen, **`/temperatur-guide` ist dabei**. Das ist der
erste messbare GEO-Erfolg des Projekts.

Einordnung (bewusst nüchtern):
- **Zitiert ≠ Antwort-Grundlage.** Das Inline-Zitat im Fließtext ging an
  `shop.block-hous +1`; Steakakademie steht in der Quellenliste, hat den genannten
  Wert (57–60 °C) aber nicht geprägt. Nächste Stufe = *inline* zitiert werden.
- **Exakte Rangposition unsicher.** Uwe liest „10. Stelle"; im Screenshot ist
  steakakademie.de die 2. sichtbare Karte im Panel. Panel-Reihenfolge ≠ garantierter
  Rang. Für den Trend irrelevant — Aufnahme in die Quellenmenge ist das Signal.
- **Kausalität zu Wikidata: nicht belegbar.** Perplexity retrievt live aus dem Index;
  ein besser eingebetteter/indexierter Guide erklärt es ebenso gut wie das
  Entity-Signal. Ehrlich: **wir wissen nicht, warum** — nur *dass*.
- **Asymmetrie zur Google-Sichtbarkeit ist der eigentliche Punkt:** google.de organisch
  Seite 4, Perplexity in den Top-10-Quellen. AI-Retrieval bewertet **inhaltliche
  Passung** stärker als Domain-Autorität — genau die Lücke, die die GEO-Doktrin als
  Chance beschreibt. Content-Tiefe zahlt hier schon, bevor Backlinks da sind.

**ChatGPT-Befund:** identisches Muster wie Baseline 07.07. — kein Web-Retrieval,
also **keine Zitier-Chance für irgendeine Domain**. Das ist kein Steakakademie-Problem,
sondern ein Kanal-Befund: Bei dieser Frage antwortet ChatGPT ohne Suche, GEO greift hier
strukturell nicht. Hebel liegt folglich bei Perplexity + Google AI Overview (beide
retrieval-basiert). Werte-Drift zur Baseline: ChatGPT nannte 07.07. 55–57 °C, heute
56–58 °C — Modell-Rauschen, kein Signal.

**AI-Overview-Befund:** unverändert ggü. Baseline — dieselben Player (Block House,
Grillfürst, Grillcenter Nord), Steakakademie nicht dabei. Anders als Perplexity folgt
Googles KI-Übersicht eng den organischen Gewinnern; bei Platz ~33 organisch ist eine
Zitierung nicht zu erwarten. **Hier hilft nur Autorität/Backlinks, nicht mehr Content.**

### Gesamt-Fazit Messung 3 (09.08.2026)

| Kanal | Baseline 07.07. | Messung 3 | Δ |
|---|---|---|---|
| Google DE organisch | nicht in Top 10 | Seite 4 (~Platz 33) | 🟡 sichtbar, aber ohne Klick-Relevanz |
| ChatGPT | nicht zitiert (kein Retrieval) | nicht zitiert (kein Retrieval) | ⚪ unverändert, Kanal strukturell zu |
| **Perplexity** | nicht zitiert (10 Quellen) | ✅ **zitiert** (10 Quellen) | 🟢 **erster GEO-Erfolg** |
| Google AI Overview | nicht zitiert | nicht zitiert | ⚪ unverändert |

**Strategische Ableitung — der Kanal-Split ist der Kernbefund:**
- **Perplexity-Typ (freies Retrieval, Passung > Autorität):** hier gewinnen wir **jetzt
  schon**. Hebel = mehr präzise Fach-Guides.
- **Google-AI-Overview-Typ (folgt organischen Gewinnern):** hier zählt nur
  Domain-Autorität. Hebel = **Backlinks**, nicht Content.
- **ChatGPT-Typ (kein Retrieval bei Standardfragen):** derzeit **nicht adressierbar** —
  keine Ressourcen darauf verschwenden.

**Nebenbefund als Marken-Argument:** Die vier AI-Antworten nannten für „Medium" vier
verschiedene Spannen (ChatGPT 56–58, Perplexity Computer-Modus 55–57, Perplexity Suche
57–60, Google AI 54–58 °C). Der Markt ist bei einem Kernwert uneinheitlich — das stützt
die Positionierung „eine kanonische, geprüfte Referenz" (`data/kerntemperatur-referenz.yaml`)
als Burggraben.

**Wikidata-Wirkung:** weiterhin **nicht kausal belegbar**. Der Perplexity-Erfolg ist
real, seine Ursache offen (Entity-Signal vs. Index-Reifung des Guides). Nächste Messung
sollte prüfen, ob der Perplexity-Treffer **stabil** bleibt — einmalig ≠ Ranking.

Screenshots nach `docs/geo-baseline-screenshots/`.

## Re-Check-Rhythmus

Alle 4 Wochen dieselben 3 Google-Queries + 3 AI-Abfragen wiederholen und hier
eintragen. Erwartung: Bewegung erst NACH Wikidata-Item + ersten Backlinks.
