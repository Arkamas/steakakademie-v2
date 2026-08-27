# Ideen-Radar — Themen-Signale aus US-BBQ-Primärquellen

**Stand 27.08.2026.** Steuerdatei: `data/rezept-quellen.yaml` ·
Skript: `scripts/ideen-radar.mjs` · Automatik: `.github/workflows/ideen-radar.yml`

## Wozu

Die Doktrin verlangt Rezepte aus authentischen Quellen **des jeweiligen Landes**,
danach Übersetzung, Umrechnung und SEO-Aufbereitung. Was bisher fehlte, war der
erste Schritt: **woher kommen die Themen?** Bislang aus einer festen Seed-Liste in
`scripts/recipe-agent.mjs` — die läuft irgendwann leer und kennt keine Saison.

Der Radar füllt diese Lücke. Er liest die RSS-Feeds von acht amerikanischen
BBQ-Seiten und legt daraus einen internen Themenspeicher an. Amerikanische Seiten
bringen Gerichte, die im deutschen Markt kaum jemand hat — aus dem ersten Lauf:
*Birria Smashburgers*, *Venison Burger mit Michigan-Cherry-Sauce*, *Double Smoked
Pineapple Gochujang Ham*, *Kung Pao Chicken Burger*.

## Die Grenze, an der das Ganze arbeitet

Der Radar speichert **ausschließlich Titel, Link, Datum und Kategorien** — auch
dann, wenn der Feed den ganzen Beitrag mitliefert. Fließtext, Zutatenlisten,
Mengen und Bilder werden verworfen.

Der Grund ist keine Vorsicht, sondern eine Rechtsgrenze: Gerichtenamen und Themen
sind nicht schutzfähig, der ausformulierte Text und die Fotos einer Seite sehr
wohl. Aus einem Titel wird bei uns ein *Auftrag* an die bestehende Pipeline, die
aus Primärquellen recherchiert, selbst formuliert, selbst umrechnet und eigene
Bilder erzeugt. Wo eine Quelle den Anstoß gegeben hat, wird sie im fertigen
Beitrag genannt und verlinkt (Regel 1, Regel 5).

## Die acht Quellen

| Quelle | Schwerpunkt | Saison-Slots |
|---|---|---|
| AmazingRibs.com (Meathead Goldwyn) | BBQ-Wissenschaft, Technik, Gerätetests | Frühjahr, Hochsommer, Herbst |
| Hey Grill Hey (Susie Bulloch) | Pellet-Grill, Familienküche, Feiertage | Weihnachten, Silvester, Ostern, Herbst |
| Barbecue Bible (Steven Raichlen) | Internationales Grillen, Grill-Kulturen | Hochsommer, Vatertag, Frühjahr |
| The Grilling Dad | Einsteiger, Alltagsküche | Vatertag, Hochsommer |
| Or Whatever You Do | Pellet und Griddle, große Bandbreite | Weihnachten, Herbst, Silvester |
| Food Fire Friends | Ratgeber, Ausrüstung, Technik | Frühjahr, Weihnachten |
| Vindulge (Mary Cressler) | Wein-Begleitung, Holzfeuer, gehoben | Weihnachten, Silvester, Ostern |
| Grillseeker (Matt Crawford) | Direkte Technik, Saucen und Rubs, Wild | Hochsommer, Vatertag, Halloween |

Zwei davon sind bei uns bereits als Persönlichkeiten geführt — Meathead Goldwyn
und Steven Raichlen. Deren Seiten sollten beim Zitieren dorthin verlinken.

### Zwei Quellen sind ausgeschlossen — und bleiben es

**bbqingwiththenolands.com** sperrt in der robots.txt `ClaudeBot`, `GPTBot`,
`anthropic-ai`, `CCBot`, `Google-Extended`, `Bytespider`, `Amazonbot`,
`Applebot-Extended` und `meta-externalagent` mit `Disallow: /`. Das ist ein
ausdrückliches Opt-out. Unsere eigene robots.txt lädt dieselben Crawler
ausdrücklich ein — wir können nicht zweierlei Maß anlegen.

**usa-kulinarisch.de** untersagt im Impressum die Nutzung durch kommerzielle
Portale wörtlich: *„dass sich kommerzielle Portale zum Nulltarif bei mir bedienen
… betrachte ich meine Urheberrechte als verletzt und werde entsprechend dagegen
vorgehen."* Erlaubt ist es nur nach Rücksprache per Mail. Solange die nicht
vorliegt: draußen. Die Betreiberin lädt zur Anfrage ausdrücklich ein — eine
Kooperation mit gegenseitiger Verlinkung wäre der saubere Weg.

## Die Rotation

Zwei Quellen je Lauf, alle drei Tage, **deterministisch aus dem Tag im Jahr** —
kein Zustand, keine Datei, die verrutschen kann. Derselbe Tag ergibt immer
dieselbe Auswahl, ein ausgefallener Lauf verschiebt nichts.

- **Slot A — Grundrotation:** `quellen[tagImJahr % 8]`. Garantiert, dass jede
  Quelle spätestens nach acht Läufen wieder dran ist.
- **Slot B — Saison-Slot:** aus den Quellen, deren `saison`-Liste das gerade
  aktive Fenster aus `data/saison-kalender.yaml` enthält, ebenfalls per
  `tagImJahr` rotierend. So kommt im November die Feiertagsküche nach oben und
  im Juni die Grillsaison.
- Fällt B auf dieselbe Quelle wie A, rückt B eine Position weiter.

Über ein Jahr ergibt das 122 Läufe und 244 Abrufe: zwischen 22 und 42 je Quelle,
also mindestens alle 16 Tage. Die Spreizung ist gewollt — sie ist die
Saison-Steuerung. Wer sie ändern will, ändert die `saison`-Listen in
`data/rezept-quellen.yaml`, nicht das Skript.

## Bedienung

```bash
node scripts/ideen-radar.mjs --dry-run          # anzeigen, nichts schreiben
node scripts/ideen-radar.mjs                    # Lauf für heute
node scripts/ideen-radar.mjs --tag 2026-12-01   # Rotation für ein Datum simulieren
node scripts/ideen-radar.mjs --alle             # ausnahmsweise alle acht Quellen
```

Der Backlog liegt in `data/ideen-backlog.json`. Jeder Eintrag trägt `status: neu`
und wird über `quelle:titel-slug` entdoppelt — dieselbe Idee landet nie zweimal
drin, auch nicht über Monate.

## Was noch fehlt

Der Radar sammelt, verarbeitet aber noch nichts. Der nächste Schritt ist die
Brücke zum `recipe-agent`: einen Backlog-Eintrag auswählen, ins Deutsche
übertragen, als Auftrag an die Generierung geben, Status auf `verarbeitet`
setzen. Bewusst getrennt gebaut — Sammeln ist harmlos und darf automatisch
laufen, Produzieren bleibt human-gated (Regel 4).
