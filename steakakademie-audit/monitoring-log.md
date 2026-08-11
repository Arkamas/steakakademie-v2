# SEO-Monitoring-Log — Steakakademie

> Wöchentlicher Status-Check gegen die Audit-Baseline vom 07.07.2026.
> Neuester Eintrag oben. Erhebung via US-basierter WebSearch → DE-SERP kann abweichen (Caveat je Zeile).

## KW33 — 10.08.2026

> Vorwoche = **KW32 Lauf 2 (03.08.)**, direkt darunter.

### Rankings (Google Top 10, US-basierte Websuche — DE-SERP kann abweichen)

| Keyword | steakakademie.de Top 10? | Wer stattdessen (Top 3) | Δ KW32 (Lauf 2) | Δ Baseline |
|---|---|---|---|---|
| „Kerntemperatur Steak" | ❌ nein | Grillfürst · LECKER · grillclub.amainfo.at / Block House | 🔴 **zurück auf ❌** (Lauf 2 hatte Pos. 4) | = |
| „Ribeye" | ❌ nein | meatnbone · gamekeepersmeat (AU) · omahasteaks — ⚠️ SERP rein US/EN, DE-Wert **nicht messbar** | = | = |
| „Reverse Sear" | ❌ nein | acabonacfarms · jessicagavin · grillio — ⚠️ SERP rein US/EN, DE-Wert **nicht messbar** | = | = |
| „Brisket Anleitung" | ❌ nein | bbqpit.de · grillkameraden.de · bbqlicate.de | = | = |
| „Steakakademie" (Brand) | ❌ nicht sichtbar | FB Bochum (Grillakademie Ruhr) · Beisser · GrillKonzept / steak-akademie.nrw | = | = |

**Auflösung des KW32-Positiv-Funds:** Der am 03.08. (Lauf 2) gemessene Top-10-Treffer für
„Kerntemperatur Steak" ist **heute nicht reproduzierbar**. Damit bestätigt sich der damals notierte
Verdacht: **Messrauschen**, keine gesicherte Ranking-Verbesserung. Richtig, dass er nicht als Erfolg
verbucht wurde. Belastbar bleibt nur: `/temperatur-guide` ist indexiert und wird ausgespielt.
Für eine echte Aussage braucht es einen manuellen DE-Inkognito-Check mit Screenshot.

### Off-Page-Delta

Query `"steakakademie.de" -site:steakakademie.de`: **weiterhin 0 echte externe Erwähnungen/Backlinks.**
Alle Treffer = fremde Steak-Akademien (FB Bochum, Beisser, GrillKonzept, Oberpfalz Beef,
Bergische Grillakademie, dfw24, akademie-der-kochenden-kuenste).
**Δ KW32 (0) und Δ Baseline (0): unverändert 0.**

### Technik-Status

| Check | Ergebnis | Status | Δ KW32 |
|---|---|---|---|
| www → non-www Redirect | `https://www.steakakademie.de/` → `https://steakakademie.de/` | 🟢 ok | = |
| `/llms.txt` erreichbar | 1. Fetch: **leerer Body** · 2. Fetch unmittelbar danach: **vollständiger Inhalt** (Kern-Referenzen, Weitere Inhalte, Über) | 🟡 **intermittierend** | ⬆️ von 🔴 (war 4 Wochen durchgehend leer) |
| `/robots.txt` endet mit Sitemap-Zeile | `Sitemap: https://steakakademie.de/sitemap.xml` vorhanden | 🟢 ok | = |

**llms.txt — Stand ehrlich:** Der Inhalt wird jetzt **grundsätzlich ausgeliefert** (Repo `public/llms.txt`,
1557 Byte, live identisch). Aber zwei aufeinanderfolgende Abrufe im selben Lauf lieferten
unterschiedliche Ergebnisse (erst leer, dann voll) → Verdacht auf **Cache-/Kaltstart-Effekt am Edge**,
nicht auf ein Inhaltsproblem. **Nicht als abgeschlossen verbuchen**, nächste Woche gegenprüfen.

### Offene Punkte / GEO

- **AI-Re-Check jetzt 6 Tage überfällig.** Fällig war 04.08. (4-Wochen-Rhythmus ab 07.07.).
  Die 3 Abfragen (ChatGPT · Perplexity · Google AI Overview) auf „Was ist die richtige Kerntemperatur
  für ein Steak medium?" sind **nur manuell durch Uwe** erhebbar → Ergebnisse in `docs/geo-baseline.md`.
- Wikidata **Q140455747** in `src/lib/schema.ts` (`sameAs`, Zeile 26/27) ✅ — nichts offen.
- **Backlinks = 0** bleibt der strukturelle Engpass — inzwischen 5 Wochen unverändert.

### Ampeln

- Rankings: 🔴 (**zurückgestuft von 🟡** — KW32-Treffer als Rauschen widerlegt, generische Sichtbarkeit = null)
- Off-Page: 🔴 (weiter 0 Backlinks — Ursache Nr. 1)
- Technik: 🟡 (Redirect + robots ok; llms.txt liefert Inhalt, aber intermittierend)
- GEO-Setup: 🟡 (Prerequisites erledigt, Re-Check überfällig)

### Handlungsempfehlung (1)

**Erste externe Erwähnungen erzeugen — über die seit KW23 offenen Affiliate-Anmeldungen**
(Santosgrills, Grillfürst, Ankerkraut, Otto Gourmet). Deren Partner-/Publisher-Listen und
Freigabe-Seiten sind die günstigste Quelle für die ersten echten Domain-Nennungen.
Technik und Content sind seit Wochen nicht mehr der Engpass — **ohne Backlinks bewegt sich nichts**,
und fünf Wochen Messung ohne jede Ranking-Bewegung belegen genau das.

**Trend vs. Vorwoche (KW32):** Rückschritt auf dem Papier — der einzige Positiv-Fund der Vorwoche
war Messrauschen; einziger realer Fortschritt ist die (noch instabile) llms.txt-Auslieferung.
Substanziell steht das Projekt seit der Baseline unverändert: 0 Backlinks, 0 generische Sichtbarkeit.

---

## KW32 — 03.08.2026 (Lauf 2, Nachtrag)

> ⚠️ Zweiter Lauf am selben Tag. Nicht überschrieben, weil sich ein Messergebnis **geändert** hat
> (siehe „Kerntemperatur Steak"). Vergleich hier: gegen **Lauf 1 vom 03.08.** (direkt darunter).

### Rankings (Google Top 10, US-basierte Websuche — DE-SERP kann abweichen)

| Keyword | steakakademie.de Top 10? | Wer stattdessen (Top 3) | Δ Lauf 1 (03.08.) |
|---|---|---|---|
| „Kerntemperatur Steak" | ✅ **JA — `/temperatur-guide` auf Pos. 4** | Grillfürst · grillclub.amainfo.at · Block House | 🟢 **NEU sichtbar** (Lauf 1: ❌) |
| „Ribeye" | ❌ nein | meatnbone · omahasteaks · allenbrothers — ⚠️ SERP rein US/EN, DE-Wert **nicht messbar** | = |
| „Reverse Sear" | ❌ nein | acabonacfarms · jessicagavin · grillio — ⚠️ SERP rein US/EN, DE-Wert **nicht messbar** | = |
| „Brisket Anleitung grillen" | ❌ nein | grillkameraden.de · ofen.de · beefbandits.de | = |
| „Steakakademie" (Brand) | ❌ nicht sichtbar | FB Bochum (Grillakademie Ruhr) · GrillKonzept · Beisser / Oberpfalz Beef | = |

**⚠️ Ehrlichkeits-Caveat zum Positiv-Fund:** Zwei Läufe am selben Tag mit identischer Query liefern
unterschiedliche Ergebnisse. Ob das eine **echte Ranking-Verbesserung** ist oder **Messrauschen**
(personalisierte/rotierende Ergebnisse, US-Standort), ist aus der Ferne **nicht entscheidbar**.
Nicht als gesicherter Erfolg verbuchen — nächste Woche gegenprüfen, idealerweise 1× manuell aus DE
(Inkognito, Screenshot). Fakt bleibt: `/temperatur-guide` ist indexiert und wird ausgespielt.

### Off-Page-Delta

Query `"steakakademie.de" -site:steakakademie.de`: **weiterhin 0 echte externe Erwähnungen/Backlinks.**
Alle Treffer = fremde Steak-Akademien (Facebook Bochum, GrillKonzept, Beisser, Oberpfalz Beef,
Metzgerei Lotter, akademie-der-kochenden-kuenste). **Δ Baseline (0) und Δ Lauf 1 (0): unverändert 0.**

### Technik-Status

| Check | Ergebnis | Status | Δ Lauf 1 |
|---|---|---|---|
| www → non-www Redirect | `https://www.steakakademie.de/` → `https://steakakademie.de/` | 🟢 ok | = |
| `/llms.txt` erreichbar | Body **leer** ausgeliefert (robots.txt liefert im Vergleich sauberen Text) | 🔴 leer | = (**4. Woche offen**) |
| `/robots.txt` endet mit Sitemap-Zeile | `Sitemap: https://steakakademie.de/sitemap.xml` vorhanden | 🟢 ok | = |

**llms.txt bestätigt:** `public/llms.txt` hat lokal echten Inhalt (Kern-Referenzen: temperatur-guide,
ribeye, brisket, reverse-sear, glossar). Live leer → **Deploy-/Auslieferungsproblem, kein Inhaltsproblem.**

### Offene Punkte / GEO

- Wikidata **Q140455747** in `src/lib/schema.ts` (`sameAs`, Zeile 27) ✅ — nichts offen.
- AI-Abfragen-Tabelle in `docs/geo-baseline.md` gefüllt (07.07.) ✅ — **AI-Re-Check (ChatGPT /
  Perplexity / Google AIO) wird morgen, 04.08., fällig** (4-Wochen-Rhythmus). Nur manuell durch Uwe erhebbar.
- Backlinks = 0 bleibt der strukturelle Engpass.

### Ampeln

- Rankings: 🟡 (**hochgestuft von 🔴** — erster generischer Top-10-Treffer gemessen, aber unbestätigt)
- Off-Page: 🔴 (weiter 0 Backlinks — Ursache Nr. 1)
- Technik: 🟡 (Redirect + robots ok; llms.txt 4. Woche leer)
- GEO-Setup: 🟡 (Prerequisites erledigt, Re-Check ab morgen fällig)

### Handlungsempfehlung (1)

**llms.txt-Deploy fixen** — unverändert der einzige offene Punkt vollständig in eigener Code-Kontrolle,
jetzt 4 Wochen alt. Datei hat Inhalt, wird live nicht ausgeliefert → Netlify/Next-Routing prüfen.

**Trend vs. Lauf 1:** Erster möglicher Lichtblick — `/temperatur-guide` in Top 10 auf dem Kern-Keyword,
aber innerhalb eines Tages widersprüchlich gemessen und deshalb nicht als Erfolg gesichert.

---

## KW32 — 03.08.2026 (Lauf 1)

> ⚠️ Lücke: kein Eintrag für KW30/KW31 vorhanden → „Vorwoche" = KW29 (13.07.), Abstand 3 Wochen.

### Rankings (Google Top 10, US-basierte Websuche — DE-SERP kann abweichen)

| Keyword | steakakademie.de Top 10? | Wer stattdessen (Top 3) | Δ KW29 |
|---|---|---|---|
| „Kerntemperatur Steak" | ❌ nein | Grillfürst · Block House · grillclub.amainfo.at | = unverändert |
| „Ribeye grillen Anleitung" | ❌ nein | spice.alibaba · die-frau-am-grill · grillportal | = unverändert (Top-3-Mix leicht rotiert) |
| „Reverse Sear" | ❌ nein | grillio · MeatEater · jesspryles — ⚠️ SERP rein US/EN, DE-Wert nicht messbar | = unverändert |
| „Brisket Anleitung" | ❌ nein | bbqpit.de · grillkameraden.de · bbqlicate.de | = unverändert |
| „Steakakademie" (Brand) | ❌ nicht sichtbar | FB Bochum (Grillakademie Ruhr) · GrillKonzept · Beisser / Oberpfalz Beef | = unverändert |

**Positiv-Befund (neu gemessen):** Long-Tail „steakakademie.de Kerntemperatur Guide" liefert
`steakakademie.de/temperatur-guide` in den Top-Treffern — Seite ist indexiert und wird mit
korrektem Snippet (BfR/EFSA-Bezug, Sous-vide) ausgespielt. Generische Sichtbarkeit bleibt null.

### Off-Page-Delta

Query `"steakakademie.de" -site:steakakademie.de`: **weiterhin 0 echte externe Erwähnungen/Backlinks.**
Alle Treffer betreffen fremde Steak-Akademien (Facebook Bochum, GrillKonzept, Beisser, Oberpfalz Beef,
Metzgerei Lotter, akademie-der-kochenden-kuenste). **Δ Baseline (0) und Δ KW29 (0): unverändert 0.**

### Technik-Status

| Check | Ergebnis | Status | Δ KW29 |
|---|---|---|---|
| www → non-www Redirect | `https://www.steakakademie.de/` → `https://steakakademie.de/` | 🟢 ok | = |
| `/llms.txt` erreichbar | Body **leer** ausgeliefert (kein Content-Type im Response, anders als robots.txt) | 🔴 leer | = (3. Woche offen) |
| `/robots.txt` endet mit Sitemap-Zeile | `Sitemap: https://steakakademie.de/sitemap.xml` vorhanden | 🟢 ok | = |

**Verschärfter Befund zu llms.txt:** Die Datei existiert im Repo (`public/llms.txt`, 1.533 Byte, Stand 07.07.)
— live kommt trotzdem ein leerer Body zurück. Das ist also **kein Content-Problem, sondern ein Deploy-/
Auslieferungs-Problem** (Datei nie deployed oder Route liefert nichts). Unsicher, welches von beidem —
nicht aus der Ferne entscheidbar.

### Offene Punkte / GEO

- Wikidata-Item **Q140455747** steht in `src/lib/schema.ts` (`sameAs`) ✅ — nichts offen.
- AI-Abfragen-Tabelle in `docs/geo-baseline.md` gefüllt (Stand 07.07.) ✅ — **aber: Re-Check-Rhythmus
  ist „alle 4 Wochen" → der AI-Re-Check (ChatGPT / Perplexity / Google AIO) ist seit ~04.08. FÄLLIG.**
  Muss manuell von Uwe erhoben werden (~5 Min je Plattform), Ergebnisse als neue Messung eintragen.
- Backlinks/Entity-Autorität = 0 bleibt der strukturelle Engpass.

### Ampeln

- Rankings: 🔴 (null generische Sichtbarkeit, 4 Wochen ohne Bewegung)
- Off-Page: 🔴 (weiter 0 Backlinks — Ursache Nr. 1 für Rankings)
- Technik: 🟡 (Redirect + robots ok; llms.txt seit 3 Wochen leer)
- GEO-Setup: 🟡 (Prerequisites erledigt, aber Re-Check überfällig)

### Handlungsempfehlung (1)

**Die llms.txt-Auslieferung prüfen und fixen** — Datei liegt mit Inhalt im Repo, wird live aber leer
ausgeliefert. Kein Content-Job, sondern Deploy/Routing. Ist der einzige offene Punkt, der vollständig
in eigener Code-Kontrolle liegt und seit drei Wochen unerledigt ist. Strategischer Haupt-Hebel bleibt
unverändert: **erste externe Backlinks** (Affiliate-/Partner-Anmeldungen, Erwähnungen) — ohne die
bewegt sich bei den Rankings nichts.

**Trend vs. Vorwoche (KW29):** Stillstand — keine Ranking-, keine Off-Page-, keine Technik-Bewegung;
einzige Neuigkeit ist die Präzisierung, dass llms.txt ein Deploy- und kein Inhaltsproblem ist.

---

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
