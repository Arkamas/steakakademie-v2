# [CORE-KNOWLEDGE] — Akademische BBQ- & Steak-Expertise

> Quelle: `CLAUDE.md` → Branch `[kurse]`/`[content]`/`[avatar]` + `content/`-Collections.
> **Pflicht-Regel 8c:** Fakten-Recherche VOR Fach-Content. Temperaturen, Garzeiten, Reifung, Cuts NIE aus dem Gedächtnis raten — verlässliche Quellen. Genauigkeit ist der Burggraben (Pitmaster-Doktrin).

## Diplom-Curriculum — 5 Stufen × 7 Lektionen = 35 Lektionen (live)

| Stufe | Titel | Schwerpunkt |
|-------|-------|-------------|
| 1 Bronze | „Der Funke" | 50/50-Methode, Holzkohle-Steuerung (Glutkörbe/Minion/Lüftung), Grill-Aufsätze, Sicherheit |
| 2 Silber | „Die Flamme bezähmen" | Fleischkunde: Anatomie, Rinder-/Schweine-Cuts, Marmorierung (BMS/USDA), Dry/Wet Aging, Einkauf |
| 3 Gold | „Hitzekontrolle" | Kerntemperaturen, Reverse Sear, Maillard, Sous-Vide-Grillen, Wagyu/Angus/Iberico, Herkunft |
| 4 Platin | „Präzision & Geschmack" | Smoker-Typen, Gerätekunde, Pellet/Smart Grilling, Holz/Rauch/Mopping, Kollagen/Stall, HACCP, Event-Logistik |
| 5 Meister | „Der vollendete Pitmaster" | Wagyu-Sensorik, Foodpairing, Getränkebegleitung, Wettbewerb (KCBS/SCA/GBA), Präsentation, Didaktik, Krisenmanagement |

Münz-Renders: 5 Stierkopf-Medaillen (Bronze–Master) als echte PNGs über `/diplome` + Homepage.

## Content-Collections (`content/`, Contentlayer2)

`rezepte` · `glossar` (171 Begriffe live) · `diplom-lektionen` (35) · `methoden` (Grilltechniken) · `cuts` · `artikel` · `persoenlichkeiten` · `usa` (USA-Expedition → 12-Länder-Atlas) · `vergleich`.

**Plattform-Puls** (`src/lib/plattform-puls.ts`) aggregiert Counts + 6 neueste Items live auf `/diplome` — Compounding-Content sichtbar machen.

## Avatar-Hosts (drei KI-Stimmen, kein persönliches Auftreten nötig)

- **Marco „Der Meister"** — Chat-Widget live (Claude Haiku, streaming, global). Diplom-Funnel.
- **Jonas „Der Enthusiast"** — Profil + Prompts (Notion).
- **Elena „Die Stimme"** — Profil + Prompts (Notion).
- 6 Portraits generiert (Marco/Jonas/Elena ×2) via FLUX. Offen: About-Seiten `/autoren/*` (E-E-A-T), Kling-Video, LoRA-Konsistenz.

## Cut-Genauigkeit (Pflicht bei KI-Bildern)

Cut anatomisch prompten und gegen den behaupteten Cut prüfen:
- **Ribeye** = Fettauge + Spinalis-Cap.
- **Porterhouse/T-Bone/Tomahawk** = sichtbarer Knochen (eher roh/bone-in generieren — gegrillt zeigt selten Knochen).
- Bild-Alt-Texte nie eine Eigenschaft behaupten, die das Bild nicht zeigt.
