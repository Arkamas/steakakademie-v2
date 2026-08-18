# Bildstrategie — Grading-Werte & Pipeline-Parameter (Stand 18.08.2026)

Quelle: erprobtes Verfahren aus der Cut-Atlas-Arbeit (Cowork-Projektgedächtnis,
hiermit ins Repo überführt). Referenz-Spec: `pyrographic-canon-foto.md`.

## Verfahren (verbindlich)

1. **Basis:** immer echtes Referenzfoto (Unsplash — Lizenz geklärt 14.08.: kommerzielle Nutzung + Bearbeitung erlaubt, keine Attributionspflicht; Foto nie als Marken-Kennzeichen verwenden). Nie Text-zu-Bild für Fleisch-/Fisch-Motive.
2. **Inszenierung/Requisiten:** `fal-ai/nano-banana/edit`, Detailkorrekturen: `fal-ai/nano-banana-pro/edit` (Standardversion reicht dafür nicht). Prompt-Regel: erst BEWAHREN (Form, Knochen, Fettkappe, Textur ausdrücklich benennen), dann ÄNDERN (Hausstil, Licht, Set).
3. **Upload vorab** in fal-Storage: `https://rest.alpha.fal.ai/storage/upload/initiate` → PUT auf `upload_url`.
4. **Farbe/Kontrast:** IMMER deterministisch graden, nie generativ.
5. **Format:** Ziel ist 16:10 Hauptbild + 16:9 Hero.

## Beschnitt-Regel (Entscheidung 18.08.2026)

**Beschneiden ist erlaubt, solange das Gericht VOLLSTÄNDIG im Bild bleibt** — kein
angeschnittenes Spieß-Ende, kein abgeschnittener Fischschwanz, kein Anschnitt des
Motivs am Tellerrand.

**Verboten bleibt Beschnitt bei Cut-Motiven, wo die Anatomie die Aussage ist:**
Knochen, Fettkappe, Anschnittfläche. Dort wird eingepasst, auch um den Preis von
Randflächen — ein halbierter T-Knochen oder eine angeschnittene Fettkappe macht
genau den Fehler, den das Bildprogramm beheben soll.

Vorher galt „einpassen statt beschneiden" pauschal. Das kostete bei 10 von 22
Motiven des Austauschpakets sichtbare Randflächen (sosaties-braai 0.56, braai-
broodjies und die Iberico-Motive je 0.67), ohne dass dort Anatomie auf dem Spiel
stand. Bei einer Schüssel Krautsalat schützt die Regel nichts und schadet der Optik.

Praktisch: Der Beschnitt gehört VOR den Edit, nicht danach — dann arbeitet
Nano-Banana bereits im Zielausschnitt und es entsteht kein zweiter Qualitätsverlust.

## ⚠️ Zwei Pipeline-Kontexte — Werte NICHT verwechseln (Entscheidung 18.08.2026)

- **Cut-Pipeline (Rohfoto ohne Edit):** die untenstehenden Original-Werte gelten
  (flau/kräftig je nach Quelle). Dafür wurden sie kalibriert.
- **Rezept-Pipeline (nach Nano-Banana-Edit):** der Edit liefert bereits warm +
  kontrastreich. Es gilt IMMER das milde, im Trockenlauf 18.08. kalibrierte
  „kraeftig"-Profil NACH dem Edit — nie das flau-Profil (zieht ~19 % Helligkeit,
  Hintergrund säuft ab). Grading vor dem Edit ist verboten: es verfälscht die
  Quelle, die der BEWAHREN-Teil des Prompts schützen soll.

## Grading-Werte (ImageMagick-Notation — bei sharp äquivalent umsetzen)

- **Flaue Quelle:** `-modulate 100,118..120,99 -brightness-contrast -3x14..15 -level 2%,99%,1.03`
- **Bereits kräftige Quelle:** `-modulate 100,104..106,99 -brightness-contrast -2x6..8`
  (mehr säuft die Zeichnung ab — bei Short Ribs passiert: Knochenquerschnitte wurden muddy)
- **Immer:** weiche Vignette + `-unsharp 0x1+0.4..0.6+0.02`

### sharp-Übersetzung (ImageMagick ist NICHT installiert; convert.exe im PATH ist das Windows-Dateisystem-Tool!)

- `-modulate 100,S,99` → `.modulate({ saturation: S/100, hue: -2 })` (Hue-Angabe 99 ≈ −3,6°, praktisch −2..−4)
- `-brightness-contrast BxC` → `.linear(a, b)` mit a ≈ 1 + C/100, b ≈ (B/100)·255 − (C/100)·128 (an 2–3 Referenzbildern gegen Soll-Look kalibrieren, dann Werte einfrieren)
- `-level 2%,99%,1.03` → `.normalise()` vorsichtig ODER `.linear()` + `.gamma(1.03)`
- `-unsharp 0x1+0.5+0.02` → `.sharpen({ sigma: 1, m1: 0.5, m2: 0.5 })`
- Vignette → radialer Gradient als PNG-Overlay via `.composite([{ input, blend: 'multiply' }])`, Deckkraft ~0.12–0.18 an den Rändern

## LoRA `pyrocanon` v2 (nur Hintergründe/abstrakte Motive: Saucen, Rubs, Beilagen)

`https://v3b.fal.media/files/b/0aa6490d/q7z_SaNon5aGtR7TWbIin_pytorch_lora_weights.safetensors`
`is_style: true`, Trigger `pyrocanon`, Scale 1.0. Fleisch-Cuts laufen NICHT über LoRA, sondern über Nano-Banana-Edit ab Echtfoto.

## Kennzeichnung nach Edit

Frontmatter: `imageSource: "Echtfoto-Basis (Unsplash: <Fotograf>), KI-bearbeitet (Nano Banana)"` + `imageAI: true` + CREDITS-Eintrag + `imageAlt` an neues Motiv anpassen.
