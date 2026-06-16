# LoRA „Schwein" — Subjekt-Dataset (Iberico/Duroc & Co.)

**Zweck:** Subjekt-LoRA, die FLUX das *Fleisch selbst* beibringt (Schweine-Cuts:
Pluma, Secreto, Nacken, Schulter, Filet … — Farbe, Marmorierung, Form).
**Kein** Stil-LoRA: Der warme/dunkle Hausstil kommt zur Render-Zeit aus der
Stil-LoRA (`../lora-warm-rustikal` / `../lora-rawcut`) + Prompt.

> **Darum sind weiße Produktshots hier okay** — und dunkle Hintergründe **nicht
> nötig**. Hintergrund/Lichtstimmung liefert die Stil-LoRA, nicht dieses Set.

## Ablage
Bilder liegen lokal unter `dataset/` und sind per `.gitignore` von Git
ausgeschlossen (nur diese README wird versioniert). Stand: 15.06.2026.

## Auswahl: 23 geliefert → **17 kuratiert** (6 aussortiert)

### ❌ Aussortiert
| Datei | Grund |
|---|---|
| Spanisches Iberico Secreto – Schulterdeckel | **Wasserzeichen** „BEEFBANDITS" flächig (LoRA würde Logo mitlernen) |
| Schweinerücken am Knochen mit Speck | **Adobe-Stock-Wasserzeichen** (+ Bild-Nr.) |
| Schweine Nacken ohne Knochen ganz (Holzbrett) | **Eck-Logo** im Bild |
| Pluma vom Iberico de Bellota Schwein | exaktes **Duplikat** von „Iberico Schweinerückendeckel Pluma" |
| Pluma ibérica de 1ª | exaktes **Duplikat** von „Pluma iberica" |
| Pluma vom Iberico de Bellota | kleinere **Variante** desselben Pluma-Motivs |

### ✅ Behalten (17)
Nacken (mehrere Schnitte/Stücke), Pluma, Schulterdreieck, Schulter mit Schwarte,
Schweinelachs, Filet, Keule/Schinken, Minuten-/Schnitzel-Cuts, Duroc-Bauch.
`15-nacken-ganz-DUNKEL` liegt bereits auf dunklem Schiefer (on-style-Bonus),
`17-…-HIRES` und `21-…-HIRES` sind hochauflösend.

## ⚠️ Offene Qualitäts-/Rechtepunkte (vor dem Training klären)
1. **Auflösung:** Nur 3 Bilder ≥ 1000 px Kantenlänge; viele `.avif` nur ~500 px →
   weicher. Fürs Subjekt-Training brauchbar, aber nicht ideal. Mehr scharfe,
   hochauflösende Cuts würden die LoRA deutlich verbessern.
2. **Rechte:** Es sind **Shop-Produktfotos** (Beef Bandits, Biomanufaktur
   Havelland, „Strohschwein" …), **nicht CC0/eigen**. Die anderen LoRA-READMEs
   bestehen bewusst auf rechtefreiem Material. **Vor kommerziellem Training durch
   eigene/lizenzierte/CC0-Bilder ersetzen oder Rechte sichern.**
3. **Menge:** 17 liegt im akzeptablen Bereich (Minimum 10, ideal 20–30) — am
   oberen Rand auffüllen lohnt sich.

## Training (läuft NICHT auf diesem Branch)
Schwein-Trainings-Pipeline (`scripts/train-pork-lora.mjs`, Workflow
`train-pork-lora.yml`, GitHub-Secret `FAL_KEY`) liegt auf dem Branch
`claude/steakakademie-cut-generators-7pm1iz`. Dort: `dataset/` als ZIP bündeln →
`fal-ai/flux-lora-fast-training` (Trigger z. B. `sa_schwein`) → LoRA-URL in
`scripts/pork-lora.json` → Schwein-Cuts mit `force` neu rendern.
