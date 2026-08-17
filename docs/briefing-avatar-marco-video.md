# Briefing: Video-Avatar „Marco" — Produktion

**Stand:** 16.08.2026 · Grundlage: Entscheidung Avatar-System synthetisch (16.08.)

---

## 1. Die Kernentscheidung: KEIN sprechender Kopf

**Empfehlung: Marco ist eine Stimme und eine wiedererkennbare Figur — kein lippensynchrones
Gesicht.** Begründung:

- **Handwerk lehrt, Gesichter nicht.** Das Mikasa-Vorbild funktioniert, weil die Kamera auf der
  *Arbeit* liegt. Drei Minuten sprechendes Gesicht vermitteln weniger als drei Minuten Fleisch,
  Glut und Thermometer.
- **Uncanny Valley = Billig-Signal.** Lippensynchrone KI-Avatare (HeyGen & Co.) sind 2026 das
  Erkennungszeichen für schnell produzierten KI-Content — das Gegenteil einer Premium-Marke.
- **Kosten.** Talking-Head-Dienste sind kostenpflichtige Abos. Stimme (Piper) + Bilder (fal.ai)
  kosten fast nichts.
- **Rechtlich schlanker.** Kein synthetisches Gesicht, das Menschen für echt halten könnten —
  die Art.-50-Kennzeichnung bleibt einfach und ehrlich.

**Marcos Auftritt im Video besteht aus drei Elementen:**

1. **Stimme** — durchgehend, eine feste Piper-Stimme (siehe 3.)
2. **Figur** — im Intro/Outro und an Übergängen: am Grill, von hinten oder halbseitlich,
   arbeitend, nie frontal sprechend. `marco-back.jpg` ist bereits genau diese Bildidee.
3. **Hände** — Nahaufnahmen der eigentlichen Arbeit: Schneiden, Wenden, Messen.

---

## 2. Was produziert werden muss: Charakter-Konsistenz

Damit Marco in jeder Szene derselbe Mann ist, braucht es eine **Charakter-LoRA** —
dasselbe Verfahren, das im Projekt bereits für Bildstile läuft
(`FAL_LORA_RAWCUT`, `FAL_LORA_FOODSTYLE`, Workflow `train-pork-lora.yml`).

**Ablauf (ca. 1 Arbeitstag, gehört in Woche 1 des Produktionsplans):**

1. **Referenz sichten:** `public/images/authors/marco-richter.jpg` + `marco-back.jpg` sind
   der Ausgangspunkt — Marcos Aussehen ist damit bereits festgelegt und darf sich NICHT ändern
   (er steht seit Monaten auf der Autorenseite).
2. **Trainingsset erzeugen:** über fal.ai per Bild-zu-Bild aus der Referenz ~25–30 Varianten
   (verschiedene Winkel, Lichter, Abstände — immer dieselbe Person).
3. **Kuratieren:** nur die Bilder behalten, die zweifelsfrei dieselbe Person zeigen. Lieber 15
   saubere als 30 wacklige.
4. **LoRA trainieren** über fal.ai → Ergebnis als `FAL_LORA_MARCO` in die Umgebungsvariablen,
   analog zu den bestehenden LoRAs.
5. **Abnahmetest:** fünf Testszenen aus unterschiedlichen Lektionen generieren. Erkennt man ihn
   in allen fünf wieder? Wenn nein: Trainingsset nachschärfen, nicht weitermachen.

**Wichtig:** Nur Marco. Jonas und Elena kommen erst, wenn Stufe 1 fertig ist — eine Figur
sauber schlägt drei Figuren halb.

---

## 3. Stimme

- **Werkzeug:** Piper TTS (offline, 0 €, liegt in `.venv/bin/piper` über OpenMontage)
- **Auswahl:** Aus den verfügbaren deutschen Piper-Stimmen **eine** aussuchen, die zu Marcos
  Charakter passt — „ruhig, präzise, erklärt ohne Effekthascherei" (siehe `authors.ts`).
  Männlich, mittlere Tonlage, kein Nachrichtensprecher-Pathos.
- **Dann sperren.** Die Stimme ist ab Lektion 1 Markenzeichen und wird nie gewechselt.
  In `docs/` dokumentieren, welche Stimme + welche Parameter (Tempo, Pausen).
- **Test vor Sperre:** Ein Absatz aus einer echten Lektion vorlesen lassen und anhören.
  Klingt es nach jemandem, dem man Kerntemperaturen glaubt?

---

## 4. Bildsprache je Lektion (wiederkehrendes Raster)

| Rolle | Inhalt | Quelle |
|---|---|---|
| Hook (0–5 s) | Ein starkes Bild zur Kernaussage der Lektion | fal.ai |
| Marco-Anker | Figur am Grill, arbeitend, von hinten/halbseitlich | fal.ai + `FAL_LORA_MARCO` |
| Arbeitsschritte | Hände, Fleisch, Werkzeug in Nahaufnahme | fal.ai + `FAL_LORA_RAWCUT` |
| Datenbild | Temperatur-/Zeitgrafik im Marken-Look | Remotion (generiert, keine KI) |
| Merksatz | Overlay in Gold `#C8882A` auf Halbschatten | Remotion |
| Ergebnis-Shot | Das fertige Ergebnis der Lektion | fal.ai + `FAL_LORA_FOODSTYLE` |

Kerntemperatur-Werte in Datenbildern **ausschließlich** aus `data/kerntemperatur-referenz.yaml`.

---

## 5. Was Uwe freigeben muss

1. **Kosten-Go fal.ai** — Trainingsset (~30 Bilder) + LoRA-Training. Einmalig, danach nur noch
   Cent-Beträge pro Szenenbild.
2. **Stimm-Abnahme** — nach dem Hörtest, vor der Sperre.
3. **Charakter-Abnahme** — nach dem Fünf-Szenen-Test.

Danach läuft die Nacht-Pipeline ohne weitere Rückfragen.
