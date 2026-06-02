# Diplom-Grillmeister — Curriculum-Abgleich gegen 5-Säulen-Framework

**Datum:** 2026-06-02
**Quelle Soll:** 5-Säulen-Framework (5 Ts, Gerätekunde, Fleischwissenschaft, HACCP, Didaktik)
**Quelle Ist:** Stufen-Kompetenzen in `src/app/diplome/roadmap/page.tsx` (Stufe 1 hat zusätzlich 7 MDX-Lektionen)

> **Marken-Hinweis:** Im Soll-Framework genannte Eigennamen (Weber Crafted, GBS, Weber
> Connect, Pulse-Serie, Flavorizer Bars) sind **Weber-Marken**. Steakakademie ist
> marken-neutral/premium → Aufnahme **generisch** (z. B. „digitale Pellet-Steuerung"
> statt „Weber Connect", „Grill-Aufsätze: Wok/Dutch Oven/Pizzastein/Plancha" statt
> „Weber Crafted"). Konkrete Marken nur als Beispiel im Lektionstext, nie als Lernziel.

## Legende
- ✅ bereits abgedeckt · ➕ NEU aufgenommen (Lücke) · 🔁 vorhanden, aber geschärft

---

## Säule 1 — Die 5 Ts

| Element | Status | Stufe | Anmerkung |
|---|---|---|---|
| **Temperature** (95–120 °C Low … 300 °C+ Sear) | ✅ | 1 (Zonen) · 3 (Kerntemp) · 4 (Low&Slow) | gedeckt |
| **Time** (Garzeit-Koordination, Menü synchron) | ➕ | **3** | Prüfung hatte „4-Gang-Menü-Garplan", aber Zeitmanagement war keine Kompetenz |
| **Technique** direkt/indirekt | ✅ | 1 | |
| **Technique** Reverse Sear | ✅ | 3 | |
| **Technique** 50/50-Methode (Kombi-Zone) | ➕ | **1** | fehlte |
| **Tools** Grill-Aufsätze (Wok, Dutch Oven, Pizzastein, Plancha) | ➕ | **1** | fehlte komplett |
| **Taste** Rubs & Marinaden | ✅ | 1 | |
| **Taste** Mopping | ➕ | **4** | fehlte (zu Holzrauch-Infusion) |
| **Taste** Holzrauch-Infusion | ✅ | 4 | |

## Säule 2 — System- & Gerätekunde

| Element | Status | Stufe | Anmerkung |
|---|---|---|---|
| Holzkohle: Anzündkamin (Kamineffekt) | ✅ | 1 | in Sicherheits-Lektion |
| Holzkohle: Glutkörbe, Minion-Ring, Lüftungssteuerung | ➕ | **1** | Steuerungs-Detail fehlte |
| Gas: Brennersysteme, Aroma-/Flammschienen, Druckminderer | ➕ | **4** | fehlte |
| Gas: Dichtheitsprüfung (Seifenwassertest) | ✅ | 1 | in Sicherheits-Lektion ergänzt |
| Pellet: Smart Grilling (digitale Steuerung, Förderschnecke, Fühler-Kalibrierung) | ➕ | **4** | nur „Pellet" als Grillart genannt |
| Elektro: Hochleistungs-Heizelemente, Wärmereflektion | 🔁 | 4 | als Grillart genannt; Detail in Gerätekunde-Lektion |

## Säule 3 — Fleischwissenschaft

| Element | Status | Stufe | Anmerkung |
|---|---|---|---|
| Fleischbiologie (Muskel, Bindegewebe/Kollagen, intramusk. Fett) | ✅ | 2 · 4 | |
| Premium-Cuts (Ribeye, Flank, Tomahawk, T-Bone) | ✅ | 2 | |
| BBQ-Schweine-Zuschnitte (Boston Butt, St. Louis Cut Ribs) | ➕ | **2** | fehlte (nur Rind-Cuts) |
| Reifung Dry/Wet Aging | ✅ | 2 | |
| Garchemie Maillard (ab ~140 °C) | ✅ | 3 | |
| Bitterstoffe / schlechter Rauch (Creosote) vermeiden | ➕ | **4** | fehlte |

## Säule 4 — Lebensmittelsicherheit & HACCP

| Element | Status | Stufe | Anmerkung |
|---|---|---|---|
| Kreuzkontamination (rohe Proteine vs. verzehrfertig) | ✅ | 1 (Sicherheit) · 4 (HACCP) | in Sicherheits-Lektion ergänzt |
| Kühlketten-Logistik (Großmengen/Events) | ➕ | **4** | Event-Logistik vorhanden, Kühlkette explizit ergänzt |
| Verbindliche Kerntemperaturen (Geflügel 75 °C etc.) | ✅ | 3 | |

## Säule 5 — Didaktik & Gruppendynamik

| Element | Status | Stufe | Anmerkung |
|---|---|---|---|
| Wissensvermittlung / eigene Kurse leiten | ✅ | 5 | vorhanden |
| Didaktik: Anfänger + „Grill-Nerds" gemeinsam abholen | ➕ | **5** | Niveau-Inklusion fehlte |
| Krisenmanagement: Fehler & Gerichte vor Gästen retten | ➕ | **5** | fehlte |

---

## Umgesetzt (diese Iteration)

Die ➕-Elemente wurden als **Kompetenzen** in die jeweilige Stufe in
`roadmap/page.tsx` aufgenommen (Curriculum-Definition). Damit sind sie Teil des
Lernziel-Katalogs und der Prüfungsbasis.

## Offen (Folge-Arbeit, Regel 8b)

Geschriebene **MDX-Lektionen** existieren bisher nur für **Stufe 1** (7 Stück).
Für die neuen Kompetenzen + alle Stufen 2–5 sind die eigentlichen Lektionstexte
noch zu erstellen — jeweils vorher Elemente + Inhalt gemeinsam planen (Regel 8b),
dann schreiben. Neue Lektions-Kandidaten aus diesem Abgleich:

- **Stufe 1:** „Kombi-Zone & 50/50-Methode" · „Grill-Aufsätze: Wok, Dutch Oven, Pizzastein, Plancha" · „Holzkohle steuern: Glutkörbe, Minion-Ring, Lüftung"
- **Stufe 2:** „Schweine-Zuschnitte: Boston Butt & St. Louis Ribs"
- **Stufe 3:** „Zeitmanagement: ein Menü synchron fertigstellen"
- **Stufe 4:** „Gerätekunde Gas" · „Smart Grilling (Pellet digital)" · „Mopping & sauberer Rauch (Creosote vermeiden)" · „Kühlketten-Logistik für Events"
- **Stufe 5:** „Didaktik: jedes Niveau abholen" · „Krisenmanagement am Grill vor Gästen"
