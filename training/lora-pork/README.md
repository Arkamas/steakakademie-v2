# LoRA „Schwein" — Subjekt-Trainingsbilder (privat, nicht oeffentlich)

Reale Referenzfotos roher Schweine-Cuts, **nur als Trainingsquelle** fuer den
Schwein-Subjekt-LoRA (`sa_pork`). Sie liegen bewusst **ausserhalb `public/`** und
gehen daher **nie auf die Website** — nur die mit der LoRA spaeter *generierten*
Bilder werden oeffentlich verwendet.

- `dataset/*.jpg` — kuratierte, rechtefreie Cuts (Dateiname = Cut-Slug = Caption-Basis).
- `scripts/train-pork-lora.mjs` liest dieses Verzeichnis (nicht mehr `public/images/cuts/`).
- Training via Workflow `train-pork-lora.yml` (Secret `FAL_KEY`).

Hinweis: aktuell Nacken-lastig (mehrere Nacken-Varianten) — bei Bedarf ausduennen
oder um weitere Cut-Typen ergaenzen.
