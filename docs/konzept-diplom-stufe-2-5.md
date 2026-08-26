# Konzept — Grillmeister-Diplom Stufe 2–5 (Bezahlprodukt)

**Regel-8b-Konzept. Vorlage zur Freigabe durch Uwe — es wird nichts produziert, bevor
dieses Dokument abgenommen ist.**
Stand 26.08.2026 · Produkt: 99 € Gründungs-Preis (erste 100) / 149 € regulär ·
Zielfenster: Weihnachts-Vorverkauf.

---

## 1. Befund: Der Ausgangspunkt ist ein anderer als angenommen

`docs/diplom-curriculum-abgleich.md` sagt: „Geschriebene MDX-Lektionen existieren
bisher nur für Stufe 1 (7 Stück)." **Das stimmt nicht mehr.** Tatsächlicher Stand,
heute im Repo nachgezählt:

| Stufe | Lektionen | Wörter gesamt | Ø je Lektion |
|---|---|---|---|
| 1 — Bronze (kostenlos) | 7 | 3.061 | 437 |
| 2 — Silber | 7 | 2.651 | 379 |
| 3 — Gold | 7 | 2.501 | 357 |
| 4 — Platin | 7 | 2.790 | 399 |
| 5 — Meister | 7 | 2.497 | 357 |
| **gesamt** | **35** | **13.500** | **386** |

Alle 35 Lektionen sind geschrieben, gebaut und erreichbar unter
`/diplome/lernen/stufe-N/<slug>`. Die Curriculum-Abgleich-Datei ist veraltet und
wird korrigiert.

**Damit verschiebt sich die Aufgabe komplett:** Es geht nicht mehr darum, 28 Lektionen
zu schreiben. Es geht darum, aus vorhandenem Text ein Produkt zu machen, das 149 €
wert ist — und es überhaupt erst verkaufbar zu machen.

---

## 2. Die drei Blocker (in dieser Reihenfolge)

### Blocker 1 — Das Bezahlprodukt ist vollständig verschenkt

`/diplome/lernen/stufe-2` bis `stufe-5` sind **öffentlich, ohne jede Zugangsprüfung**.
`src/middleware.ts` schützt `/meine-kurse`, `/profil`, `/steuer-matrix/rechner`,
`/mein-system` — `/diplome/lernen` steht nicht auf der Liste. Es gibt im gesamten
Repo keine Entitlement-Logik für das Diplom (kein `hasAccess`, kein Kauf-Abgleich).
Zusätzlich stehen **alle 35 Lektionen in `sitemap-0.xml`** und sind für Google
freigegeben.

Ein Vorverkauf für 99 € gegen etwas, das derselbe Besucher zwei Klicks weiter gratis
liest, ist nicht verkaufbar — und wäre gegenüber Käufern unredlich.

### Blocker 2 — Die Tiefe trägt den Preis nicht

386 Wörter sind knapp **zweieinhalb Minuten Lesezeit**. Stufe 2–5 sind zusammen
10.400 Wörter — **rund 40 Minuten**. Dafür 149 € zu verlangen, hält keinem Vergleich
stand: der Präsenz-Grillkurs, gegen den wir positionieren, kostet 100–200 € für einen
ganzen Tag.

In den Lektionen selbst gibt es außerdem **kein einziges Bild, kein Video, kein Quiz**
(geprüft über alle 35 Dateien). Es gibt `<Schnelluebersicht>` (35×), `<ProTipp>` (30×),
`<Achtung>` (14×) und `<TempBox>` (5×) — sonst durchgehend Fließtext in gleicher Länge.
Genau dieser Gleichlauf ist der Grund, warum Regel 8b heute kodifiziert wurde.

### Blocker 3 — Die Roadmap verspricht mehr, als das Produkt hält

`roadmap/page.tsx` sagt den Stufen 1–5 zu: 10 / 15 / 20 / 25 / 30 Prüfungsfragen —
**100 Fragen**. Im Code stehen **25** (5 je Modul). Ebenso zugesagt und nicht
vorhanden: die Praxis-Fallstudie (Stufe 3), das Smoke-Protokoll und der Event-Zeitplan
(Stufe 4), die mündliche Videoprüfung mit Peer-Bewertung (Stufe 5) sowie sämtliche
20 interaktiven Lernmethoden (Anatomie-Map, Thermometer-Simulator, Holz-Wheel,
Stall-Kurve, Wagyu-Loupe, Pairing-Lab …). Sie sind als Versprechen ausgeschrieben,
aber nicht gebaut.

Das ist vor dem Verkauf zu klären: entweder bauen oder die Seite ehrlich machen.
Eine bezahlte Ausbildung, deren Prüfungsbeschreibung nicht stimmt, ist ein
rechtliches und ein Vertrauensproblem zugleich.

---

## 3. Vorschlag: Was der Käufer für 99/149 € bekommt

**Leitsatz: Stufe 1 bleibt der offene Trichter. Ab Stufe 2 beginnt das Produkt —
und das Produkt ist die *Ausbildung*, nicht der Text.**

Pro Lektion (Stufen 2–5, 28 Stück) verbindlich:

| Element | Soll | heute |
|---|---|---|
| Fließtext | **900–1.200 Wörter** (statt 386) | 357–399 |
| `<Schnelluebersicht>` | 1 | ✅ |
| Fach-Callout (`<TempBox>` / `<Achtung>` / `<ProTipp>`) | mind. 2 | teils |
| **Bild** (Hausstil, KI-gekennzeichnet) | mind. 1 | ❌ 0 |
| **Lernvideo Marco** (2–4 Min) | 1 | ❌ 0 |
| **Selbsttest** (3 Fragen mit Erklärung) | 1 | ❌ 0 |
| Faktenquelle notiert | Pflicht (Regel 8c) | uneinheitlich |
| Prüfungsbezug notiert | Pflicht | ❌ |

Pro Stufe zusätzlich: die zugesagte Stufenprüfung in voller Fragenzahl, das
digitale Zertifikat, und **eine** der versprochenen interaktiven Lernmethoden —
nicht vier. Lieber eine, die funktioniert, als vier, die im Marketing stehen.

Ergebnis für den Käufer: 28 Lektionen à ~1.000 Wörter (≈ 30.000 Wörter), 28 Videos
(≈ 90 Minuten), 84 Selbsttests, 4 Stufenprüfungen, 4 Zertifikate. Das ist ein Preis
von 149 € wert, und der Gründungs-Preis von 99 € ist dann ein echter Nachlass statt
einer Notlösung.

---

## 4. Reihenfolge (Empfehlung des Projekt-Directors)

1. **Zugang bauen, bevor irgendein Inhalt entsteht.** Middleware + Entitlement gegen
   den Digistore-Kauf, Stufe 2–5 aus dem Sitemap nehmen, für jede Lektion eine
   öffentliche Anreißer-Ansicht (Titel, Merksatz, erste ~120 Wörter) behalten —
   so bleibt der SEO-Wert erhalten, ohne den Inhalt zu verschenken.
   *Ohne diesen Schritt ist alles Weitere wertlos.*
2. **Roadmap ehrlich machen.** Prüfungsbeschreibungen und Lernmethoden auf das
   reduzieren, was existiert oder sicher bis zum Verkaufsstart existiert.
3. **Stufe 2 als Pilot vertiefen** — 7 Lektionen nach dem Raster oben, mit
   Uwe-Abnahme nach der ersten. Erst wenn Stufe 2 abgenommen ist, folgen 3–5.
4. **Videos** erst danach, und erst wenn die Stimme im Hörtest festgeschrieben ist
   (siehe `docs/video-toolkit-setup.md`).

**Termin-Realität, ungeschönt:** Verkaufsstart neuer Produkte ist der 01.10.2026
(Gewerbeanmeldung). Bis dahin sind 28 vertiefte Lektionen **plus** 28 Videos nicht
zu schaffen. Ehrlicher Zuschnitt für den Vorverkauf: **Stufe 2 vollständig fertig,
Stufen 3–5 im vorhandenen Umfang plus Zugangsschutz**, und im Angebot klar gesagt:
„Stufe 2 sofort in voller Tiefe, Stufe 3–5 werden bis <Datum> ausgebaut."
Das ist dieselbe ehrliche Staffelung, die für die Videos schon beschlossen war.

---

## 5. Was Uwe entscheiden muss

1. **Schnitt kostenlos/bezahlt:** Stufe 1 frei, ab Stufe 2 bezahlt — bestätigen?
2. **Anreißer-Ansicht** für bezahlte Lektionen (SEO behalten) — ja oder ganz zu?
3. **Umfangs-Soll 900–1.200 Wörter** je Lektion — bestätigen oder anders setzen?
4. **Roadmap-Versprechen:** die nicht gebauten Lernmethoden streichen oder bauen?
5. **Zuschnitt zum 01.10.:** Stufe 2 tief + Rest im Ausbau — oder Verkaufsstart schieben?
