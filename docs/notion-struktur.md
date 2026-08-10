# Aufbau der Steakakademie-Notion-Datenbank

Dieses Dokument beschreibt, **nach welcher Methode** die Steakakademie in Notion
strukturiert ist. Es dient als Referenz, damit die Organisation im Workspace und
im Code-Repo konsistent bleibt.

## Überblick: drei kombinierte Methoden

Die Steakakademie ist kein einzelnes flaches Verzeichnis, sondern folgt drei
ineinandergreifenden Organisationsprinzipien:

1. **Hub-and-Spoke** (Dashboard-Prinzip) — eine zentrale Projektseite verlinkt auf
   thematisch getrennte Datenbanken.
2. **5-Phasen-Modell** (Phase-Gate / Roadmap) — strategische Reihenfolge der
   Umsetzung.
3. **Kanban-/Status-Steuerung** — operative Aufgabensteuerung auf Aufgabenebene.

## 1. Hub-and-Spoke (Dashboard-Prinzip)

Es gibt **eine zentrale Projektseite** „🥩 Steakakademie", die als Drehscheibe
dient. Sie liegt in folgender Hierarchie:

```
Private → 🚀 Projekte → 🍷 Genusskunst Affiliate-Website → 🥩 Steakakademie
```

Von dieser Hub-Seite verzweigen alle Spezial-Datenbanken und Konzept-Unterseiten.
Statt alles in einer Tabelle zu mischen, ist jede Domäne eine eigene **verlinkte
Datenbank**:

| Datenbank | Zweck |
|---|---|
| 📋 Steakakademie Projektplan | Aufgaben-/Umsetzungssteuerung |
| 🍖 Rezept-Datenbank | Content (Rezepte) |
| 📊 Projekt-Tracker | Fortschritts-/KPI-Tracking |
| 🤝 Kooperationspartner & Affiliates | Monetarisierung / Partner |
| 💡 Steakakademie Ideen-Pool | Backlog / Ideen-Sammlung |

Dazu kommen Konzept-Seiten, u. a.:

- 📣 Marketing — Gesamtstrategie
- 🤖 Agenten-System & Prompts
- 🎭 Avatar-System & Video-Identität
- 🔍 Trend-Reports (monatlich)
- Post-Mortem-Analyse
- Geschäftsfeld 3 — Das System als Produkt

## 2. 5-Phasen-Modell (Phase-Gate / Roadmap)

Der Kern — der **Projektplan** — ist nach einem 5-Phasen-Modell strukturiert
(Property `Phase`). Die Phasen bauen logisch aufeinander auf:

1. **Phase 1 – Infrastruktur**
2. **Phase 2 – KI-Infrastruktur**
3. **Phase 3 – Website & Content**
4. **Phase 4 – Monetarisierung**
5. **Phase 5 – Marketing & Launch**

Erst das Fundament/Technik, dann Inhalt, dann Monetarisierung, dann Reichweite.
Diese Reihenfolge ist deckungsgleich mit der `ROADMAP.md` im Code-Repo.

## 3. Kanban-/Status-Steuerung pro Aufgabe

Innerhalb des Projektplans wird jede Aufgabe über **Select-Felder** klassifiziert.
Das ist die eigentliche Arbeitsmethodik. Das Datenbank-Schema:

| Property | Typ | Werte |
|---|---|---|
| Aufgabe | Title | (Freitext) |
| Phase | Select | Phase 1–5 (siehe oben) |
| Status | Select | 📌 Geplant · ⚡ Als nächstes · ⏳ Wartet · 🔄 Läuft · ✅ Erledigt |
| Priorität | Select | 🔴 Hoch · 🟡 Mittel · 🟢 Niedrig |
| Notizen | Text | (Freitext) |

Der Status-Fluss läuft typischerweise:

```
📌 Geplant → ⚡ Als nächstes → ⏳ Wartet → 🔄 Läuft → ✅ Erledigt
```

Dadurch lässt sich dieselbe Datenbank wahlweise als **Kanban-Board** (nach Status),
als **Roadmap** (nach Phase) oder als **Prioritätenliste** filtern.

## Kurzfassung

Die Methode ist eine Kombination aus **Hub-and-Spoke-Dashboard** (zentrale
Projektseite + thematisch getrennte verlinkte Datenbanken), einem
**5-Phasen-Roadmap-Modell** für die strategische Reihenfolge und einer
**Kanban-artigen Status-/Prioritäts-Steuerung** auf Aufgabenebene.
