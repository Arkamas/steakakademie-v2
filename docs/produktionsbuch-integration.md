# Produktionsbücher (Weber-Grillakademie) → Steakakademie

> Konzept, Stand 12.08.2026. Quelle: Uwes Produktionsbücher aus seiner Zeit als
> Weber-Stephen-Partner (Grillakademie-Kurse), z. B. „Weber ORIGINAL Basic Kurs 1/2016".
> Erstellt mit Cuisine 2000 (© Gerhard Volk, Forum Culinaire).

## 1. Rechtslage zuerst (Regel 1) — WICHTIG

Das Basic-Buch trägt einen expliziten Sperrvermerk:

> „Diese Rezepte dürfen nicht: an Dritte weitergegeben werden ·
> für andere Kurse verwendet werden · veröffentlicht werden."
> — © Gerhard Volk, Forum Culinaire

Konsequenz (nicht verhandelbar):
- **Die PDFs/Originaltexte werden NIE veröffentlicht, committet oder ins RAG ingested.**
- Rechtlich gilt: Eine Zutatenliste + Grundidee eines Gerichts ist als solche nicht
  urheberrechtlich geschützt — die **konkrete Textformulierung, Kalkulation und
  Zusammenstellung** dagegen schon, und der Sperrvermerk kann zusätzlich vertraglich
  binden (alter Partnervertrag prüfen!).
- **Gangbarer Weg:** Die Gerichte werden als **eigenständige Steakakademie-Rezepte neu
  entwickelt** — eigene Worte, eigene Schritte, geerdet an unserer Wissens-DB
  (Kerntemperaturen aus `data/kerntemperatur-referenz.yaml`), eigene Pro-Person-Mengen.
  Das Buch dient nur als private Ideen-/Erfahrungsquelle („welche Gerichte funktionieren
  in Kursen"), nicht als Textvorlage.
- **Human-gated:** Bevor buchbasierte Rezepte live gehen, bestätigt Uwe, dass der alte
  Weber-/Forum-Culinaire-Vertrag der Neuverwertung des Know-hows nicht entgegensteht.

## 2. Warum die Bücher trotzdem Gold wert sind

- **Kurserprobt:** Jedes Menü lief real mit 20 Personen — die Gerichte funktionieren.
- **Didaktische Struktur:** Kursablauf (Brennstoffe, Anzünden, Direkt/Indirekt/50-50/
  Pyramide/Ring/Dreizonen, Räucherchips) = fertiges Curriculum für den BBQ-Grundkurs
  und die Diplom-Stufen.
- **Profi-Workflow:** „Vor dem Kurs / Demo mit Gast / Teller & Garnituren" = Mise-en-place-
  Wissen, das kein Kochbuch liefert — perfekt für ⭐⭐-/⭐⭐⭐-Profi-Tipps.
- **Echte Mengenkalkulation:** Einkaufsliste für 20 Personen → verlässliche
  Pro-Person-Basis (÷ 20), besser als geschätzte Rezeptmengen.

## 3. Integrations-Bausteine

1. **Pro-Person-Engine (LIVE, 12.08.2026):** Rezept-Schmiede kalkuliert intern auf
   **Basis 1 Person**; User wählt Personenzahl (1–20). Der Generator hängt einen
   maschinenlesbaren ```zutaten-basis```-Block (Mengen pro 1 Person, linear/fix) an,
   das UI rechnet Personen **deterministisch** um — ohne LLM-Mathe, ohne API-Call.
   Kern-/Gartemperaturen skalieren nie; Garzeit hängt an Dicke, nicht Menge.
2. **Rezept-Neuentwicklung (nach Freigabe):** Pro Buch-Gericht ein neues
   Steakakademie-Rezept (eigene Formulierung, Niveau-Einstufung ⭐–⭐⭐⭐,
   Pro-Person-Mengen, Temperatur-Referenz-Abgleich). Als MDX unter `content/rezepte/`
   mit `PortionCalculator` (basePortions: 1).
3. **Kurs-Curriculum:** Ablauf-Wissen (Grilltechniken, Brennstoffe, Reinigung) fließt
   als eigene Wissenseinträge in die RAG-DB (`wissensdatenbank-*.csv`, Quelle:
   „Eigene Kurserfahrung Grillakademie") — Fakten sind frei, Formulierung ist unsere.
4. **Menü-Modus (später):** Aus Einzelrezepten ganze Kurs-Menüs komponieren
   (Aperitif→Dessert) inkl. Gesamt-Einkaufsliste für n Personen.

## 4. Offene Punkte

- [ ] Uwe: alten Weber-/Forum-Culinaire-Vertrag auf Verwertungsklauseln prüfen.
- [ ] Nach Freigabe: erste 3 Gerichte neu entwickeln (Vorschlag: Beer Can Chicken,
      Nackenbraten mit Knoblauch-Kräuter-Rub, Drillinge in Salzkruste — Kurs-Klassiker
      mit Suchvolumen).
- [ ] Weitere Produktionsbücher (Aufbaukurse) sichten — nur privat, gleiche Regeln.
