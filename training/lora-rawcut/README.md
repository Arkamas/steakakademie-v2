# LoRA „Rohes Fleisch / Metzger" — Cut-Stil (fal.ai / FLUX)

Style-LoRA für **rohe** Fleisch-/Cut-Bilder (Cuts-Seiten, Fleischkunde).
Look: rohes, marmoriertes Rindfleisch auf **dunklem/warmem Holzbrett**, Metzger-Stil,
warmes Licht. Gegenstück zur gegrillten LoRA (`../lora-warm-rustikal`).

## ✅ Trainiert 04.06.2026
- Dataset: 14 kuratierte CC0-Bilder (Pexels) — weiße Hintergründe + Wasserzeichen
  bewusst rausgeworfen.
- Modell: `fal-ai/flux-lora-fast-training`, `is_style:true`, 1000 Steps, Trigger `sa_rawcut`.
- **LoRA-Weights:** `https://v3b.fal.media/files/b/0a9cfb6d/As_0SxQomWhTxnCArXtU7_pytorch_lora_weights.safetensors`
- Validierung: Testbild = rohes marmoriertes Steak auf warmem Holz, dunkler Hintergrund — top.

## ⏳ Noch NICHT verdrahtet
Es gibt aktuell keine Bild-Generierung für Cuts-Seiten. Sobald wir eine Cut-Bild-
Funktion bauen, einbinden wie bei der gegrillten LoRA: Endpoint `fal-ai/flux-lora`,
`loras:[{path:<obige URL>, scale:0.9}]`, Trigger `sa_rawcut` im Prompt.
Env-Override-Empfehlung: `FAL_LORA_RAWCUT`.

## Dataset-Regeln
Wie `../lora-warm-rustikal/README.md`: keine Wasserzeichen/Logos (z. B. „BIG DEAL",
„BBQ"-Stempel), keine Collagen, keine weißen/Edelstahl-Hintergründe, rechtefrei (CC0).

Bilder lokal/gitignored.
