# Übergabe: Steakakademie — Website-Relaunch

## ⚠️ Vorab, nicht verhandelbar: Die bestehende Website wird ABGELEGT, nicht gelöscht

Die aktuell live stehende Website wird **archiviert und bleibt vollständig erhalten**. Sie wird nicht überschrieben, nicht in place umgebaut, und ihre Dateien werden nicht entfernt.

Verbindliches Vorgehen, bevor eine einzige Datei des Relaunches entsteht:

1. Vollständige Kopie des jetzigen Stands sichern — Quellcode **und** Inhalte **und** Assets. Bei Git: eigener Branch oder Tag (z. B. `archiv/website-v1-2026-09`), zusätzlich ein Verzeichnis-Abbild außerhalb des Arbeitsbaums.
2. Datenbank-Abbild ziehen, falls Inhalte dort liegen.
3. Erst danach den Relaunch in einem **neuen** Verzeichnis bzw. Branch beginnen.
4. Die Archivfassung muss ohne Bastelarbeit wieder lauffähig sein. Wer sie nicht starten kann, hat sie nicht archiviert.

Kein Schritt des Relaunches rechtfertigt das Löschen der alten Fassung. Wenn eine Aufgabe das nahelegt, ist die Aufgabe falsch formuliert — zurückfragen, nicht löschen.

---

## Überblick

Neugestaltung der Steakakademie-Website: eine deutschsprachige BBQ-Wissensplattform mit Nachschlagewerk (Cuts, Techniken), redaktionellem Teil („Streitfälle"), Rezepten, Ausrüstungsvergleichen und einem gestuften Kursprogramm mit Diplomen (fünf Stufen, 35 Lektionen, Stufe 1 frei, ab Stufe 2 Konto erforderlich).

Der gestalterische Kern: **dunkles Feuer für Emotion, helles Papier für Inhalt.** Dunkle Sektionen (`#15120f`) tragen Hero, Manifest, Kursprogramm und Fußbereich; helle Sektionen (`#f4ede3`) tragen alles, was gelesen wird. Kein Verlaufs-Kitsch, keine abgerundeten Kästen mit farbigem Balken links, keine Emoji. Die Wärme kommt aus einer einzigen Glut-Animation im Hero und aus zwei Akzentfarben, sonst aus nichts.

## Zu den Design-Dateien in diesem Paket

Die HTML-Dateien in diesem Bündel sind **Design-Referenzen, kein Produktionscode.** Es sind Prototypen, die Aussehen und Verhalten festhalten. Sie sind nicht dafür gedacht, übernommen oder eingebettet zu werden.

Die Aufgabe ist, diese Entwürfe **in der Zielumgebung nachzubauen** — mit deren eigenen Mustern, Komponenten und Bibliotheken. Steht noch keine Umgebung, ist das Framework passend zu wählen (Next.js App Router wäre für dieses Projekt naheliegend: viel statischer Inhalt, gute Auffindbarkeit nötig, wenig echte Interaktivität außer Filtern und Kursfortschritt).

Ausdrücklich **nicht** übernehmen: die Inline-Styles. Sie sind ein Artefakt der Prototyping-Umgebung. In der Zielumgebung gehören diese Werte in Tokens und Komponenten — die Werte selbst sind aber verbindlich und unten vollständig dokumentiert.

Ebenfalls nicht übernehmen: die Bildschirm-Umschaltung über einen `screen`-Zustand. Im Prototyp liegen alle Ansichten in einer Datei, weil das beim Entwerfen praktisch ist. In der Anwendung sind das echte Routen.

## Fidelity: hifi

Farben, Typografie, Abstände und Zustände sind final und pixelgenau nachzubauen. Die Inhalte sind ebenfalls echt und übernehmbar — die 40 Cuts, 8 Streitfälle, 8 Rezepte und 10 Techniken in der Übersicht sind redaktionell geschrieben, keine Blindtexte. Ausnahmen sind unten unter „Offene Punkte" benannt.

---

## Design-Tokens

### Farben — dunkle Ebene

| Zweck | Wert |
|---|---|
| Grund | `#15120f` |
| Karte / erhöhte Fläche | `#201b17` |
| Rahmen, Trennlinien | `#332b25` |
| Text | `#f4ede3` |
| Text, zweite Stufe | `#d9cfc2` |
| Text, dritte Stufe | `#c9bfb2` |
| Text, gedämpft | `#b3a798` |
| Text, am schwächsten | `#7d7166` |
| Akzent auf dunkel | `#ffb35c` |

### Farben — helle Ebene

| Zweck | Wert |
|---|---|
| Grund | `#f4ede3` |
| Karte | `#faf6ef` |
| Karte, Hover / Zeile hervorgehoben | `#fff8ee` |
| Rahmen | `#e3d9c9` |
| Rahmen, stärker / innere Trennlinie | `#e8ddcb` |
| Rahmen, gestrichelt (Leer-Zustand) | `#d4c8b6` |
| Text | `#1a1613` |
| Fließtext | `#4a413a` |
| Text, gedämpft | `#7d7166` |
| Text, am schwächsten (Zählnummern) | `#c9bfb2` |

### Akzent

| Zweck | Wert |
|---|---|
| Primär (Glut) | `#e2531f` |
| Primär, Hover | `#ff8a3d` |
| Primär auf dunklem Grund | `#ffb35c` |

Regel: `#e2531f` auf hellem Grund, `#ffb35c` auf dunklem. Nicht vertauschen — `#e2531f` auf `#15120f` erreicht nur 2,9:1.

### Typografie

Zwei Schriften, keine dritte.

**Big Shoulders Display** (600, 800, 900) — alle Überschriften, Etiketten, Zahlen, Knopftexte. Immer `text-transform: uppercase`. Ersatz: `Impact, sans-serif`.

**Literata** (400, 600, kursiv 400) — Fließtext, Bildunterschriften, Tabelleninhalte. Ersatz: `Georgia, serif`.

Einbindung im Prototyp:
```
https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@600;800;900&family=Literata:ital,opsz,wght@0,7..72,400;0,7..72,600;1,7..72,400&display=swap
```

Größenstufen (Display-Schrift, alle `text-transform: uppercase`):

| Rolle | Größe | Gewicht | Zeilenhöhe | Laufweite |
|---|---|---|---|---|
| Hero-Titel | `clamp(52px, 9vw, 136px)` | 900 | .92 | -.01em |
| Seitentitel | `clamp(40px, 6vw, 80px)` | 900 | .92–.94 | — |
| Sektionstitel, groß | `clamp(40px, 5.5vw, 76px)` | 900 | .92 | — |
| Sektionstitel | `clamp(32px, 3.6vw, 48px)` | 800 | 1 | — |
| Unterabschnitt | 36px / 32px | 800 | 1 | — |
| Karten-Titel | 26px | 800 | 1 | — |
| Listenzeile | 20px | 800 | 1.05 | — |
| Reiter | 19px | 800 | — | .06em |
| Etikett (Kicker) | 13–14px | 700 | — | .16–.18em |

Fließtext (Literata):

| Rolle | Größe | Zeilenhöhe | Farbe hell / dunkel |
|---|---|---|---|
| Lead groß | 22px | 1.55 | `#4a413a` / `#b3a798` |
| Lead | 18px | 1.5–1.55 | `#4a413a` / `#b3a798` |
| Hero-Lead | `clamp(18px, 1.6vw, 22px)` | 1.5 | `#d9cfc2` |
| Fließtext | 17–19px | 1.55–1.7 | `#4a413a` |
| Karten-Text | 15px | 1.5 | `#4a413a` |
| Meta, Bildunterschrift | 13–14px | 1.4–1.5 | `#7d7166` |

Auf längeren Textblöcken `text-wrap: pretty`, auf Titeln `text-wrap: balance`. Lesebreite: `56ch`–`66ch`, nie mehr.

### Abstände

Grundraster 2px, benutzt werden 4, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 32, 36, 40, 44, 48, 56.

Sektionspolsterung: `clamp(56px, 7vw, 96px) 20px`, bei betonten Sektionen `clamp(64px, 8vw, 112px) 20px`.
Inhaltsbreiten: `1240px` (Standard), `1100px` (mittel), `960px` (Lektion), `860px`/`760px` (Lesetext).
Rasterabstand: `14px`–`16px` bei Karten, `48px` zwischen Spalten, `56px` zwischen Blöcken.

### Radien

`4px` (Knopf innen), `6px` (Umschalter, Bild klein), `8px` (Karte, Bild, Kasten — der Standard), `999px` (Pille, Chip, Hauptknopf), `50%` (Profilbild).

Keine Schatten. Tiefe entsteht durch Flächenwechsel (`#faf6ef` auf `#f4ede3`) und Rahmen, nicht durch Weichzeichnung. Einzige Ausnahme: `box-shadow: 0 0 10px` auf den kleinen pulsierenden Glutpunkten.

### Bewegung

```css
@keyframes emberBreathe { 0%,100% { opacity:.55 } 50% { opacity:1 } }
@keyframes glowIn { 0% { color:#ffb35c; text-shadow:0 0 18px rgba(255,138,61,.9) } 100% { color:#f4ede3; text-shadow:0 0 0 rgba(255,138,61,0) } }
@keyframes flicker { 0%,100% { opacity:1 } 92% { opacity:1 } 94% { opacity:.6 } 96% { opacity:1 } }
@media (prefers-reduced-motion:reduce) { * { animation:none !important } }
```

Übergänge: `.15s` auf Karten-Hover (`border-color`, `transform`), sonst keine. Karten heben sich beim Hover um `translateY(-2px)`.

---

## Die Glut-Animation — verbindliche Regeln

Sie ist das einzige bewegte Element der Website und **ausschließlich im Hero der Startseite** erlaubt. Sie wurde bewusst aus Manifest, Kursprogramm, Über uns und Fußbereich wieder entfernt: mehrfach eingesetzt wirkt sie billig und kostet Rechenzeit auf jeder Seite.

Vorgabe ist die Stufe **Ruhig**. „Lebendig" existiert als Schalter, ist aber nicht der Ausgangszustand.

Technische Umsetzung (die Punkte sind das Ergebnis einer Messung — bei 5 fps war die Seite unbenutzbar, alle vier sind nötig):

1. **Farbverläufe einmal bauen**, nicht pro Bild. Neu erzeugen nur, wenn sich die Canvas-Breite ändert.
2. **Kein `shadowBlur` pro Partikel.** Der Schein kommt aus einer 32×32 vorgerenderten Radialverlauf-Grafik, die per `drawImage` skaliert gezeichnet wird. Das war der teuerste Posten.
3. **Nur zeichnen, wenn sichtbar** — `IntersectionObserver` mit `rootMargin: 120px`, Schleife läuft weiter, Zeichnen setzt aus.
4. **Auf ~30 Bilder/s begrenzen** (`if (now - last < 32) return`) und die Canvas-Auflösung auf 900px Breite deckeln.

Physik der Funken (feine, realistische Glut — nicht Konfetti):

- Ursprung: unten, mittig gewichtet — `x = w * (0.08 + sk * 0.84)` mit `sk = (rand + rand) / 2`.
- Radius meist `0.3–0.8px`, in 7 % der Fälle `0.95–1.5px`.
- Auftrieb nimmt mit der Abkühlung ab: `vy = vy * 0.995 - 0.0075 * (1 - fortschritt)`.
- Luftwiderstand bremst die Seitwärtsdrift: `vx *= 0.985`.
- Turbulenz aus drei überlagerten Sinuskurven mit den Perioden 46, 121 und 17.
- Farbe folgt der Temperatur `temp = (1 - fortschritt)^1.6`: von weißglühend über orange nach tiefrot. Grün `90 + 145 * temp`, Blau `24 + 150 * temp^3.4`, Rot konstant 255.
- Flackern pro Funke, individuell in Stärke und Phase.
- Zeichenmodus `lighter`, damit Funken sich gegenseitig aufhellen statt sich zu übermalen.
- Obergrenze 34 Funken (Ruhig) bzw. 90 (Lebendig).

Zusätzlich im Hero: ein Radialverlauf von unten (Radius `max(w,h) * .46`, `rgba(255,138,61,.52)` → transparent) und ein Lichtband über die unteren 24 % der Höhe (`rgba(255,179,92,.32)` → transparent), beides mit einer langsamen Atmung von 0,55 bis 1,0 über etwa 14 Sekunden moduliert. Diese Werte sind bereits zweimal auf Wunsch verkleinert worden — nicht wieder aufdrehen.

Auf `prefers-reduced-motion: reduce` wird nicht animiert.

---

## Ansichten

Sieben umgesetzte Ansichten. Jede ist im Prototyp über den Zustand `screen` erreichbar, in der Anwendung sind es Routen.

### 1. Startseite (`/`)

**Zweck:** Einordnen, was diese Seite ist, und in einen der fünf Bereiche führen.

**Aufbau, von oben:**

- **Hero**, dunkel, `min-height: 78vh`, Inhalt unten ausgerichtet (`align-items: flex-end`). Darin: Glut-Canvas, darüber ein Verlaufsschleier (`180deg`, `rgba(21,18,15,.2)` oben → transparent bei 40 % → `rgba(21,18,15,.35)` unten), darauf der Inhalt. Kicker mit 28px-Strich in `#e2531f`, Titel in der Hero-Stufe, Lead auf `56ch`.
- **Hero-Einstieg:** fünf Pillen (Cuts & Fleischkunde, Grilltechniken, Wissen, Rezepte, Ausrüstung) — `#201b17`, Rahmen `#332b25`, `12px 20px`, Radius 999px, im Hover Rahmen `#ff8a3d`. **Dies ist die abgenommene Variante.** Eine Alternative mit drei größeren Karten existiert im Prototyp als Schalter, ist aber verworfen.
- **Streitfälle**, hell: Titel „Was jeder sagt. Und was stimmt." mit Verweis „Alle Streitfälle →" rechts oben, darunter Kartenraster.
- **Manifest + Im Feuer**, dunkel, zweispaltig (`auto-fit, minmax(320px, 1fr)`, Abstand 48px): links Zitat, rechts eine hervorgehobene Karte mit pulsierendem Glutpunkt („Im Feuer — diese Woche").
- **Cuts & Techniken**, hell, zwei Blöcke mit je Titel, Verweis und Kartenraster.
- **Kursprogramm**, dunkel: „Fünf Stufen. Ein Diplom.", darunter fünf Stufenkarten (`auto-fit, minmax(180px, 1fr)`) mit SVG-Siegel, Stufe 1 mit Rahmen `#e2531f`, Stufen 2–5 mit `#332b25`.
- **Werkzeuge + Über uns**, hell, zweispaltig.
- **Fußbereich**, dunkel, mit dem Spickzettel — genau einmal auf der ganzen Website.

### 2. Übersicht (`/cuts`, `/streitfaelle`, `/rezepte`, `/techniken`)

**Das wichtigste Muster der Website.** Eine Ansicht, vier Kataloge. Wenn hiervon vier separate Seiten gebaut werden, ist die Übergabe missverstanden.

**Zweck:** Stöbern und Vergleichen. Diese Seiten werden am häufigsten aufgerufen.

**Aufbau:**

1. **Dunkler Kopf** (`#15120f`), Polsterung `40px 20px 0`, Breite 1240px. Brotkrümel („Start / Katalogname", 14px, `#7d7166`), Titel auf `22ch`, Lead auf `58ch` in `#b3a798`, darunter die Katalog-Reiter.
2. **Katalog-Reiter:** vier Knöpfe, Display-Schrift 19px/800, Laufweite .06em, Polsterung `12px 16px`, unten 3px Rahmen. Aktiv: Text `#f4ede3`, Rahmen `#e2531f`. Inaktiv: Text `#a89b8c`, Rahmen transparent. Hover `#ffb35c`. **Achtung:** der aktive Reiter steht auf dunklem Grund — helle Textfarbe, nicht die Textfarbe der hellen Ebene.
3. **Filterleiste**, hell (`#faf6ef`), `border-bottom: 1px solid #e3d9c9`, **`position: sticky; top: 0; z-index: 5`**. Polsterung `14px 20px`. Von links: Filter-Etikett (12px/700, Laufweite .16em, `#7d7166`), Filter-Chips, dehnbare Lücke, Trefferzahl („12 von 40"), Sortier-Umschalter, Ansichts-Umschalter.
4. **Filter-Chips:** Pillen, `7px 15px`, 14px, `white-space: nowrap` (zwingend — „Halb richtig" bricht sonst aus der Pille). Aktiv: Grund `#1a1613`, Text `#f4ede3`, Rahmen `#1a1613`. Inaktiv: Grund `#faf6ef`, Text `#4a413a`, Rahmen `#e3d9c9`. Hover: Rahmen `#e2531f`. Erster Chip ist immer „Alle".
5. **Umschalter** (Sortierung und Ansicht): Gruppe mit Rahmen `#e3d9c9`, Radius 6px, Polsterung 2px, Grund `#f4ede3`. Aktives Segment: Grund `#e8ddcb`, Text `#1a1613`, Radius 4px. Inaktiv: transparent, Text `#7d7166`.
6. **Inhalt**, Polsterung `36px 20px 88px`.

**Raster-Ansicht:** `repeat(auto-fill, minmax(280px, 1fr))`, Abstand 16px. Karte: Grund `#faf6ef`, Rahmen `#e3d9c9`, Radius 8px, Polsterung 22px, Spalte mit 10px Abstand. Inhalt von oben: Titelzeile (Titel 26px/800 links, Abzeichen rechts in `#e2531f`, 15px/800, `white-space: nowrap`), Meta-Zeile („Rind · Hohe Rippe", 13px, `#7d7166`), Beschreibung (15px/1.5, `#4a413a`), unten abgesetzt durch `border-top: 1px solid #e8ddcb` die vierte Angabe links und „Ansehen →" in `#e2531f` rechts. Hover: Rahmen `#e2531f`, `translateY(-2px)`, `.15s`.

**Listen-Ansicht:** ein Block mit Rahmen und Radius 8px, Grund `#faf6ef`, Zeilen als Raster `44px minmax(160px,1.4fr) minmax(120px,1fr) minmax(120px,1fr) minmax(0,2fr) 90px`, Abstand 16px, Polsterung `16px 20px`, `border-bottom: 1px solid #e3d9c9`. Spalten: laufende Nummer (zweistellig, `#c9bfb2`), Titel (20px/800), zwei Meta-Spalten, Beschreibung, Abzeichen rechtsbündig. Hover: Grund `#fff8ee`.

**Leer-Zustand:** gestrichelter Rahmen `#d4c8b6`, Radius 8px, Polsterung `56px 28px`, mittig. Titel „Nichts in dieser Auswahl" (28px/800), Erklärung, Knopf „Filter zurücksetzen" (Grund `#1a1613`, Hover `#e2531f`).

**Die vier Kataloge und ihre Filterachse:**

| Katalog | Einträge | Filterachse | Werte | Abzeichen |
|---|---|---|---|---|
| Cuts | 40 | Tierart | Rind, Schwein, Lamm | Preisklasse (€/€€/€€€) |
| Streitfälle | 8 | Urteil | Falsch, Halb richtig, Stimmt | Urteil |
| Rezepte | 8 | Tierart | Rind, Schwein, Lamm | Dauer |
| Techniken | 10 | Hitze | Direkt, Indirekt, Kombiniert | Zone |

Jeder Eintrag hat dieselben sechs Felder: Titel, Filterwert, Meta 1, Abzeichen, Meta 2, Beschreibung. Genau deshalb trägt ein Muster alle vier. Die vollständigen Inhalte stehen im Prototyp in der Struktur `KAT` und sind übernehmbar.

Sortierung: „Beliebt" (die redaktionelle Reihenfolge, wie hinterlegt) und „A–Z" (`localeCompare` mit Gebietseinstellung `de`). Die gewählte Ansicht bleibt beim Katalogwechsel erhalten, der Filter wird zurückgesetzt.

### 3. Streitfall (`/streitfaelle/[slug]`)

Redaktioneller Artikel, Lesebreite 760px, helle Ebene. Kicker mit Nummer, Titel auf Seitentitel-Stufe, Lead 20px, darunter eine Metazeile zwischen zwei Linien (`#e3d9c9`) mit Autor und Datum. Im Text ein interaktiver Frageblock mit zwei Antwortmöglichkeiten: gewählte richtige Antwort `rgba(226,83,31,.35)` mit Rahmen `#ff8a3d`, gewählte falsche `rgba(255,255,255,.08)` mit Rahmen `#7d7166`, ungewählt `#201b17` mit `#332b25`.

### 4. Lektion (`/akademie/[stufe]/[lektion]`)

Lesebreite 960px. Dunkler Kopfstreifen mit Stufenanzeige und Fortschrittsbalken (fünf 4px-Segmente: erledigt `#e2531f`, aktuell `#ff8a3d` mit `emberBreathe`, offen `#332b25`). Danach hell: Titel, Kennzahlenkarten (`auto-fit, minmax(280px, 1fr)`), Abschnitte mit nummerierten Überschriften, eine Temperaturtabelle, drei Regelkarten, am Ende der Abschluss-Knopf, der den Zustand „Lektion erledigt" setzt.

### 5. Rezept (`/rezepte/[slug]`)

Breite 1100px. Zweispaltiger Kopf, Kennzahlenzeile, Zutatenliste mit **Portionsrechner** (1–12, Mengen skalieren mit), Ablauf als nummerierte Schritte mit `72px 1fr`-Raster und Trennlinien.

### 6. Werkzeug (`/ausruestung/[slug]`)

Breite 1100px. Vergleichstest mit Messwerten. Titel auf `16ch`, Lead auf `64ch`, darunter Vergleichstabelle und Einzelbewertungen.

### 7. Diplome (`/akademie`)

Dunkler Kopf, danach hell. Fünf Stufen als Blöcke, je mit Siegel-SVG, Stufennummer, Titel und Lektionsliste. Erledigte Lektionen mit gefülltem Kreis `#e2531f`, offene mit Rahmen `#e2531f`. Stufe 1 ist frei, ab Stufe 2 Konto erforderlich.

### 8. Über uns (`/ueber-uns`)

Dunkler Kopf mit Titel auf `88px`-Stufe, danach Lesetext auf 760px in drei Kapiteln (Die Weide, Die Reifung, Das Handwerk), zwei Bilder, ein hervorgehobenes Zitat auf dunklem Grund, am Ende die Redaktionsliste.

---

## Kopfzeile und Navigation

`position: sticky; top: 0; z-index: 20`, Grund `#15120f`, `border-bottom: 1px solid #332b25`, Polsterung `12px 20px`, Breite 1240px.

Von links: Markenzeichen (38px SVG) mit Wortmarke, Navigation (Grilltechniken, Cuts, Wissen, Rezepte, Ausrüstung, ab 1040px zusätzlich Über uns), rechts der Kursstatus und der Hauptknopf.

Navigationsknöpfe: 14px, Farbe `#c9bfb2`, Hover `#ffb35c`, Polsterung `8px 9px`.

Kursstatus, zwei Zustände:
- kein Fortschritt: „Akademie" — Grund `#201b17`, Rahmen `#332b25`, Text `#f4ede3`, Pille.
- Fortschritt vorhanden: „Stufe 1 · 1/7" — Rahmen `#e2531f`, Text `#ffb35c`, davor ein 8px-Glutpunkt mit `emberBreathe 4s` und `box-shadow: 0 0 10px #ff8a3d`.

Hauptknopf: Grund `#e2531f`, Text `#15120f`, Display-Schrift 15px/800, Pille, `8px 16px`.

**Das Markenzeichen ist entschieden: „2b Rauchring".** Im Prototyp liegen neun Varianten als Schalter — die anderen acht sind Entwurfsstände und nicht zu implementieren. Die Zeichnung liegt als SVG in `assets/` (`rauchring-mark.svg`, `rauchring-mark-dark.svg`, Favicon und PNG-Größen).

---

## Interaktion und Verhalten

**Navigation:** Jeder Knopf, der auf eine andere Ansicht führt, setzt zusätzlich `window.scrollTo(0, 0)`. In der Anwendung übernimmt das der Router — aber das Verhalten muss dasselbe bleiben.

**Filtern und Sortieren:** ohne Nachladen, ohne Verzögerung, ohne Ladezustand. Bei diesen Mengen (max. 40 Einträge) wird vollständig ausgeliefert und im Browser gefiltert. Die Trefferzahl aktualisiert sich sofort.

**Zustände, die es geben muss:** Hover auf allen Karten, Zeilen, Chips und Knöpfen; Fokus sichtbar für Tastaturbedienung (im Prototyp nicht ausgearbeitet — hier ist Nachholarbeit nötig, siehe unten); der Leer-Zustand der Übersicht.

**Was es nicht gibt:** Ladeschleier, Skeleton-Platzhalter, Aufklapp-Animationen, Seitenübergänge.

## Zustand

| Zustand | Werte | Ausgelöst durch | Anmerkung |
|---|---|---|---|
| `screen` | die acht Ansichten | Navigation | In der Anwendung: Route |
| `katalog` | cuts, streitfaelle, rezepte, techniken | Reiter, Navigation | In der Anwendung: Routen-Parameter |
| `tier` | Alle + Achsenwerte | Filter-Chip | Beim Katalogwechsel auf „Alle" |
| `sort` | Beliebt, A–Z | Umschalter | Beim Katalogwechsel auf „Beliebt" |
| `ansicht` | Raster, Liste | Umschalter | Bleibt beim Katalogwechsel erhalten. Gehört in der Anwendung in `localStorage` |
| `lessonDone` | wahr/falsch | Abschluss-Knopf | Platzhalter für echten Kursfortschritt |
| `answer` | null, A, B | Frageblock | Pro Streitfall |
| `servings` | 1–12 | Portionsrechner | Pro Rezept |
| `wideNav` | wahr/falsch | Fenstergröße ≥ 1040px | Ersetzen durch CSS-Umbruchpunkt, nicht in JS messen |

Kursfortschritt und Kontostand gehören serverseitig. `lessonDone` im Prototyp ist reine Anzeige.

## Assets

In `assets/` dieses Pakets:

| Datei | Verwendung |
|---|---|
| `rauchring-mark.svg`, `rauchring-mark-dark.svg` | Markenzeichen |
| `rauchring-favicon.svg`, `rauchring-32.png`, `rauchring-180.png`, `rauchring-512.png` | Favicon und Kachelgrößen |
| `weide-gras-abend.jpg` | Über uns, Kapitel „Die Weide" |
| `weide-morgennebel.jpg`, `weide-weite.jpg` | Vorgesehen für Streitfall-Artikel, noch nicht platziert |
| `glut-briketts.jpg`, `schwenkgrill-glut.jpg` | Glut-Motive |
| `logo-barrel.png`, `medals-preview.png` | Entwurfsmaterial |

Lizenzen und Herkunft: `bildlizenzen.md` im Paket. **Vor Veröffentlichung prüfen** — für die Motive `weide-morgennebel`, `weide-weite` und `weide-gras-abend` liegt noch kein Lizenzvermerk vor.

Die Social-Assets (Profilbilder, Banner, Story-Cover, Pinterest-Vorlagen, Werbekennzeichnung) liegen im Projekt unter `handoff/steakakademie-marke/social/` und gehören nicht zur Website-Implementierung.

## Dateien in diesem Paket

| Datei | Inhalt |
|---|---|
| `Steakakademie Prototyp.dc.html` | Alle acht Ansichten, die Referenz |
| `support.js` | Laufzeit der Prototyping-Umgebung. **Nicht übernehmen** |
| `assets/` | Bilder und Markenzeichen |
| `bildlizenzen.md` | Herkunft und Lizenzstand der Fotos |

Zum Ansehen genügt es, die HTML-Datei im Browser zu öffnen. Die Schalter für Markenzeichen, Hero-Variante und Glut-Stufe sind Entwurfswerkzeuge — die abgenommenen Werte sind die Vorgaben (2b Rauchring, 5 Rubriken, Ruhig).

---

## Offene Punkte — bewusst nicht entworfen

Diese Dinge fehlen. Sie sind nicht vergessen, sondern verschoben. **Nicht selbst erfinden** — sie kommen als Entwurf nach.

1. **Registrierung und Anmeldung.** Stufe 1 ist frei, ab Stufe 2 braucht es ein Konto. Diese Hürde ist die wichtigste Seite der Website und existiert noch nicht.
2. **Mobile Navigation.** Unter 1040px verschwindet „Über uns" aus der Leiste. Was stattdessen kommt — Schublade, Bodenleiste, Aufklappmenü — ist offen. Die Mehrheit der Nutzer kommt vom Handy.
3. **Customer Journey und Klickpfade.** Ausdrücklich später.
4. **Detailseiten der Kataloge.** Im Prototyp führt jeder Übersichtseintrag auf dieselbe Beispiel-Detailseite. Die echten Vorlagen für Cut, Technik und Rezept sind vorhanden, die Verknüpfung ist Platzhalter.
5. **Tastaturbedienung und Vorlesbarkeit.** Im Prototyp nicht ausgearbeitet. Sichtbarer Fokus, Sprungmarke zum Inhalt, ARIA für die Umschalter (`role="tablist"` bei den Katalog-Reitern, `aria-pressed` bei den Filter-Chips) und geprüfte Kontraste sind bei der Umsetzung nachzuholen. Die Kontrastregel für die Akzentfarbe steht oben unter „Akzent".
6. **Bildmotiv Reifekammer.** Bei „Die Reifung" auf Über uns steht ein Ersatzbild mit dem Hinweis „Vorläufig · Reifekammer-Motiv folgt". Der Hinweis bleibt sichtbar, bis ein echtes Motiv da ist.
7. **Suche.** Bei 40 Cuts noch verzichtbar, ab etwa 100 Einträgen nicht mehr. Nicht entworfen.

## Wenn etwas unklar ist

Bei gestalterischen Fragen — Abstand, Farbe, welche Variante — nicht selbst entscheiden. Der Prototyp ist die Referenz; wo er schweigt, ist die Frage offen und gehört zurückgestellt. Erfundene Zwischenlösungen sind später teurer als eine Rückfrage.
