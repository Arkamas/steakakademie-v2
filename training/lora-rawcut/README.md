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

## ✅ Verdrahtet seit 03.07.2026
Aktiv in `scripts/cut-images.mjs` (Endpoint `fal-ai/flux-lora`, `scale: 0.9`,
Trigger `sa_rawcut` im Prompt), über Env `FAL_LORA_RAWCUT` überschreibbar.
Ausgelöst per `.github/workflows/generate-cut-images.yml` bzw. npm-Skripte
`cut-images` / `cut-images:dry` / `cut-images:force`.

Hintergrund: Bis 03.07.2026 nutzte der Cut-Generator fälschlich den
`sa_foodstyle`-LoRA (trainiert für **angerichtete/gegrillte** Rezeptfotos) —
vermutliche Ursache der anatomisch falschen Cut-Bilder, siehe
`training/cut-review/rejected-2026-07-03/`.

⚠️ Generierte Cut-Fotos gehen **nicht** automatisch live: Der Workflow öffnet einen
Pull Request, jedes Bild wird vor dem Merge gegen den `visualBrief` in
`src/lib/cuts-catalog.ts` geprüft (Regel 8c).

## Dataset-Regeln
Wie `../lora-warm-rustikal/README.md`: keine Wasserzeichen/Logos (z. B. „BIG DEAL",
„BBQ"-Stempel), keine Collagen, keine weißen/Edelstahl-Hintergründe, rechtefrei (CC0).

Bilder lokal/gitignored.
