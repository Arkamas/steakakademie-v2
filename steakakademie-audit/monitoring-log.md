# SEO-Monitoring-Log — Steakakademie

> Wöchentlicher Status-Check gegen die Audit-Baseline vom 07.07.2026.
> Neuester Eintrag oben. Erhebung via US-basierter WebSearch → DE-SERP kann abweichen (Caveat je Zeile).

## KW29 — 13.07.2026

### Rankings (Google Top 10)

| Keyword | steakakademie.de Top 10? | Wer stattdessen (Top 3) | Δ Baseline |
|---|---|---|---|
| „Kerntemperatur Steak" | ❌ nein | Grillfürst · Block House · Grillcenter Nord | = (unverändert) |
| „Ribeye" (grillen/Anleitung) | ❌ nein | die-frau-am-grill · thekitchn (US) · grillportal | neu gemessen |
| „Reverse Sear" | ❌ nein | jessicagavin · foodnetwork · kosmosq — ⚠️ SERP fast rein US/EN, DE-Wert unklar | neu gemessen |
| „Brisket Anleitung" | ❌ nein | bbqlicate · Grillfürst · Burnhard | neu gemessen |
| „Steakakademie" (Brand) | ❌ nicht sichtbar | Oberpfalz Beef · GrillKonzept · steak-akademie.nrw / FB Bochum | ⚠️ siehe Hinweis |

> ⚠️ **Brand-Hinweis (ehrlich):** Baseline-„Platz 1" bezog sich auf die Long-Tail-Query
> „steakakademie.de Kerntemperatur" (→ /temperatur-guide). Der **nackte Gattungs-/Markenbegriff
> „Steakakademie"** ist von fremden Präsenz-Anbietern (Oberpfalz Beef, GrillKonzept/Grillakademie Ruhr,
> steak-akademie.nrw) belegt — steakakademie.de taucht in der US-Websuche dort **nicht** in den Top-Treffern auf.
> Das ist **kein** Widerspruch zur Baseline, sondern eine schärfere Messung. Deckt sich mit der Doktrin:
> Domain-Autorität/Entity fehlt noch. Manueller DE-Inkognito-Check empfohlen zur Bestätigung.

### Off-Page-Delta

Query `"steakakademie.de" -site:steakakademie.de`: **0 echte externe Erwähnungen/Backlinks** auf
steakakademie.de gefunden — alle Treffer betreffen **fremde** Steak-Akademien (Oberpfalz Beef, GrillKonzept,
Metzgerei Lotter u. a.). **Δ Baseline (0): unverändert 0.**

### Technik-Status

| Check | Ergebnis | Status |
|---|---|---|
| www → non-www Redirect | `https://www.steakakademie.de/` → `https://steakakademie.de/` | 🟢 ok |
| `/llms.txt` erreichbar | HTTP 200, aber **Inhalt leer** (0 Byte Body) | 🔴 leer |
| `/robots.txt` endet mit Sitemap-Zeile | `Sitemap: https://steakakademie.de/sitemap.xml` vorhanden | 🟢 ok |

### Offene Punkte / GEO

- **GEO-Prerequisites erledigt** (positiv): Wikidata-Item **Q140455747** steht in `src/lib/schema.ts` (`sameAs`);
  AI-Abfragen-Tabelle in `docs/geo-baseline.md` ist gefüllt (ChatGPT/Perplexity/Google-AIO am 07.07. erhoben).
  → hier ist nichts offen.
- **llms.txt liefert leeren Body** — für AI-Crawler wertlos, sollte befüllt werden.
- **Backlinks/Entity-Autorität = 0** bleibt der strukturelle Engpass (unverändert zur Doktrin).

### Ampeln

- Rankings: 🔴 (null generische Sichtbarkeit, unverändert)
- Off-Page: 🔴 (weiter 0 Backlinks)
- Technik: 🟡 (www-Redirect + robots ok; llms.txt leer)
- GEO-Setup: 🟢 (Wikidata + AI-Baseline erledigt)

### Handlungsempfehlung (1)

**`/llms.txt` mit Inhalt füllen** (Titel, Kurzbeschreibung, Links zu /temperatur-guide, /cuts, /methoden,
/diplome). Kleiner, voll in Code-Kontrolle liegender GEO-Hebel — 200 = ok, aber leerer Body bringt AI-Crawlern nichts.
Strategisch bleibt der große Hebel unverändert: **erste externe Backlinks** (Affiliate-/Partner-Anmeldungen, Erwähnungen).

**Trend vs. Vorwoche:** Erster Log-Eintrag — keine Vorwoche; ggü. Baseline 07.07. keine Ranking-/Off-Page-Bewegung (erwartungsgemäß, da Wikidata/Backlinks noch nicht greifen), Technik-Neubefund: llms.txt leer.
