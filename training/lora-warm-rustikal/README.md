# LoRA „Warm & Rustikal" — Food-Foto-Hausstil (fal.ai / FLUX)

Ziel: eine eigene Style-LoRA, damit **jedes** generierte Rezeptbild garantiert den
Steakakademie-Look hat (warmes Holzbrett, weiches Tageslicht, dezente Glut/Grill-
Atmosphäre, glatte appetitliche Schnittflächen, frische Garnitur).

## Dataset-Regeln (entscheidend für Qualität)

**Konsistenz schlägt Menge.** Alle Bilder müssen DENSELBEN Stil zeigen.

✅ **Nimm rein:**
- ~**15–30 Bilder** (10 Minimum, 20–30 ideal)
- Einheitlicher Look: **warmes Holzbrett oder dunkler Schiefer**, warmes Naturlicht
- **Hochauflösend & scharf** (mind. ~1000 px Kante), Originaldateien (JPG/PNG)
- **Vielfalt im Motiv, Einheit im Stil:** verschiedene Cuts/Winkel — aber gleiche
  Lichtstimmung, gleicher Hintergrund-Typ, gleicher Bildcharakter
- Appetitlich: glatte rosa Schnittflächen, glänzende Säfte, etwas Kräuter/Salz

❌ **Lass weg (ruiniert die LoRA):**
- **Wasserzeichen, Text, Logos, Bewertungs-Badges** (die LoRA lernt sie mit!)
- **Collagen / Bildraster** (mehrere Fotos in einem) — absolut tabu
- Screenshots mit Browser-/UI-Rändern, niedrige Auflösung, unscharf
- Menschen/Gesichter, fremde Marken
- Stark abweichende Stile (hell-clean-Studio gemischt mit dunkel-moody) → trübt den Stil

## Ablage
- Echte Bilddateien lokal sammeln (dieser Ordner ist per `.gitignore` von Git
  ausgeschlossen — Trainingsbilder gehören NICHT ins Repo/Deploy).
- Dateinamen egal, einfach reinlegen: `01.jpg`, `02.jpg`, …

## Training (übernimmt Claude, wenn das Set steht)
1. Bilder als ZIP bündeln → fal.ai-Training `fal-ai/flux-lora-fast-training`
   (Trigger-Wort z. B. `sa_foodstyle`, ~20 Min, ~paar €).
2. Ergebnis: LoRA-Weights-URL.
3. Verdrahtung in beide Generatoren: fal-Request um `loras:[{path:<url>,scale:~0.9}]`
   + Trigger-Wort im Prompt erweitern. Danach hat jedes Bild den Hausstil.

Stand 04.06.2026.
