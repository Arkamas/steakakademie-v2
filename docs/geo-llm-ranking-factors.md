# GEO — LLM-Ranking-Faktoren (Was bringt KI-Zitate?)

> **Übergabe an den GEO-Verantwortlichen der Steakakademie** (GEO = Generative Engine
> Optimization; Burggraben #3 der Strategie: *in KI-Antworten zitiert werden, nicht nur ranken*).
> **Quelle:** OppAlerts — „LLM Ranking Factors", Industry Research Report, **März 2026**.
> https://oppalerts.com/LLM-Ranking-Factors/
> **Methodik (Kurz):** 145 Branchen · 1.595 Buyer-Personas · 105k+ ChatGPT-Prompts (GPT-5.4)
> · 1,1 Mrd. Web-Seiten (Common Crawl) · 5 Mrd. Reddit-Posts · 4 Mrd. Backlinks · 300 Mio.
> Wikimedia-Entities. Spearman-Korrelation (ρ) jedes Signals gegen den LLM-Empfehlungs-Score.
> *Eingepflegt 16.06.2026.*

## Kernerkenntnis (in einem Satz)

**GEO ist kein Gegenteil von SEO — GEO baut auf klassischem SEO auf.** Die stärksten
Prädiktoren dafür, dass ein LLM (ChatGPT) eine Domain empfiehlt, sind **Suchmaschinen-Präsenz
und Backlink-Autorität**, nicht On-Page-Keyword-Dichte. Wer in Google rankt und verlinkt
wird, wird auch von der KI empfohlen.

## Globale Signal-Rangliste (alle Branchen, Spearman ρ)

| # | Signal | Gruppe | ρ | R² | Tier |
|---|--------|--------|----|----|------|
| 1 | Search Engine Appearances (in Google sichtbar) | Search | +0.241 | 15.8% | **Strong** |
| 2 | Best Search Engine Rank (beste Platzierung) | Search | +0.238 | 5.7% | **Strong** |
| 3 | SE Outbound Links (von rankenden Seiten verlinkt) | Search | +0.230 | 5.3% | **Strong** |
| 4 | Backlink Count | Backlinks | +0.204 | 4.2% | **Strong** |
| 5 | BL Authority | Backlinks | +0.200 | 4.0% | **Strong** |
| 6 | BL Authority (Exp) | Backlinks | +0.199 | 3.9% | Confirmed |
| 7 | PageRank | Backlinks | +0.194 | 3.7% | Confirmed |
| 8 | Harmonic Centrality (Erreichbarkeit im Web-Graph) | Backlinks | +0.169 | 2.8% | Confirmed |
| 9 | Common Crawl (allg. Web-Präsenz/Crawlbarkeit) | Web | +0.123 | 1.5% | Confirmed |
| 10 | Wikidata (Entity-Verknüpfung) | Reference | +0.120 | 1.4% | Confirmed |
| 11 | Reddit Comments | Social | +0.111 | 1.2% | Confirmed |
| 12 | Avg Search Engine Rank | Search | +0.096 | 0.9% | Emerging |
| 13 | Reddit Posts | Social | +0.096 | 0.9% | Emerging |
| 14 | Wikipedia Citations | Reference | +0.077 | 0.6% | Emerging |
| 15 | Homepage Keywords (On-Page-Keyword-Relevanz) | Content | +0.072 | 0.5% | Emerging |

**Tier-Logik:** Dominant ρ≥0.30 · Strong 0.20–0.29 · Confirmed 0.10–0.19 · Emerging 0.05–0.09 · Baseline <0.05.

## Relevanter Branchen-Benchmark

Die nächste Analogie zur Steakakademie (Wissens-/Bildungsplattform) ist **„Colleges &
universities"** — dort ist **SE Outbound Links das dominante Signal (ρ=0.448)**: Wer von
Domains verlinkt wird, die selbst in den Suchergebnissen auftauchen, wird von der KI
empfohlen. Dasselbe Muster gilt für **„SEO / content-marketing agencies"** (SE Outbound
Links ρ=0.311). → Für eine Wissensplattform zählt **redaktionelle Verlinkung von
rankenden Quellen** am meisten.

## Aktionsplan Steakakademie (priorisiert)

1. **Klassisches SEO bleibt Fundament (Signal #1+#2).** In Google für die Ziel-Phrasen
   ranken (Cuts, Kerntemperaturen, Methoden). Ohne Such-Präsenz keine KI-Empfehlung.
   Deckt sich mit Burggraben #2 (Content-Maschine) — Tempo MIT Qualitäts-Gate.
2. **Backlinks & Domain-Autorität aufbauen (Signal #3–#8).** Verlinkungen von Seiten,
   die selbst ranken (Food-Blogs, Fachpresse, Hersteller-Ratgeber). Qualität vor Masse,
   kein Black-Hat (siehe Agent-Constraint).
3. **Entity-Präsenz schaffen (Signal #10/#14).** **Wikidata-Eintrag** für „Steakakademie"
   anlegen/pflegen; legitime Wikipedia-Zitate dort verdienen, wo fachlich gerechtfertigt.
   Stützt Burggraben #5 (distinktive Marke besetzt Marken-SERP).
4. **Reddit-Signale kultivieren (Signal #11/#13, Tier Confirmed).** Echte, hilfreiche
   Präsenz in r/grilling, r/BBQ, r/Grillen — Mentions/Comments, kein Spam.
5. **NICHT überinvestieren: Homepage-Keyword-Stuffing (Signal #15, nur Emerging).**
   On-Page-Keyword-Dichte erklärt nur 0.5% der Varianz — Entity-Dichte + präzise Werte
   schlagen Keyword-Wiederholung (deckt sich mit „entity-dichte Antwortblöcke").

## Einordnung / Vorbehalt

Die Studie misst **ChatGPT (GPT-5.4)** und überwiegend **US-/.com-Domains**; für den
**deutschen Markt** und Perplexity/Gemini können Gewichte abweichen. Die Richtung
(SEO+Backlinks+Entity > On-Page-Keywords) ist aber robust und konsistent mit der
bestehenden GEO-First-Mover-Strategie (`docs/confluence/01-STRATEGY.md`, Burggraben #3).
