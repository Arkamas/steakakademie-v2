# Instagram — Erste Posts (kuratiert, copy-paste-fertig)

> 5 starke Start-Posts für @steakakademie. Bild liegt in `public/images/rezepte/`.
> Kerntemperaturen gegen die kanonische Referenz geprüft (Regel 8c).
> Reihenfolge-Tipp: **3 Posts gleich** (Feed wirkt lebendig), dann 1 alle 2–3 Tage.

---

## Post 1 — Dry-Aged Ribeye  ·  Bild: `public/images/rezepte/dry-aged-ribeye.jpg`
```
Dry-Aged Ribeye, Reverse Sear: der Profi-Trick, den kaum jemand sauber hinbekommt. 🔥

Kerntemperatur 54 °C, Reverse Sear — das ganze Rezept Schritt für Schritt auf steakakademie.de.

Folge @steakakademie für präzises Grillwissen. 🥩

#steakakademie #reversesear #dryaged #ribeye #steak #grillen #bbqdeutschland #grilltipps #grillenlernen #fleisch
```

## Post 2 — Tomahawk Reverse Sear  ·  Bild: `public/images/rezepte/tomahawk-reverse-sear.jpg`
```
Tomahawk, Reverse Sear: außen Kruste, innen perfekt rosa. 🔥

Kerntemperatur 54 °C — keine Faustregel, ein Wert der stimmt. Ganzes Rezept auf steakakademie.de.

Folge @steakakademie für mehr Pitmaster-Wissen. 🥩

#steakakademie #tomahawk #reversesear #steak #grillen #bbqdeutschland #grillmeister #grilltipps #fleisch #steakliebe
```

## Post 3 — Brisket Low & Slow  ·  Bild: `public/images/rezepte/brisket-low-slow.jpg`
```
Warum dein Brisket bisher zäh wurde — und wie es butterzart wird. 🔥

Texas-Style, Low & Slow, Kerntemperatur 93 °C. Das komplette Rezept auf steakakademie.de.

Folge @steakakademie für echtes BBQ-Handwerk. 🥩

#steakakademie #brisket #lowandslow #bbq #smoken #grillen #bbqdeutschland #pitmaster #grilltipps #texasbbq
```

## Post 4 — Picanha Churrasco  ·  Bild: `public/images/rezepte/picanha-churrasco.jpg`
```
Speicher dir das: Picanha Churrasco, richtig gemacht. 📌🔥

Auf dem Spieß, indirekt, Kerntemperatur 54 °C. Ganzes Rezept auf steakakademie.de.

Folge @steakakademie für mehr Grillwissen. 🥩

#steakakademie #picanha #churrasco #steak #grillen #bbqdeutschland #grillenlernen #grilltipps #fleisch #südamerika
```

## Post 5 — Smash Burger  ·  Bild: `public/images/rezepte/smash-burger.jpg`
```
Smash Burger: maximale Kruste, saftig statt trocken — mit der richtigen Technik. 🔥

Smash-Technik, Hack komplett durchgaren (Kerntemperatur 70 °C). Rezept auf steakakademie.de.

Folge @steakakademie für mehr Grillwissen. 🥩

#steakakademie #smashburger #burger #grillen #bbqdeutschland #grilltipps #grillenlernen #beef #patty #streetfood
```

---

## So gehen sie live — zwei Wege

### A) Jetzt manuell (schnellster Start)
- In Chrome am PC: Instagram → **+ Erstellen** → Bild aus `public/images/rezepte/` hochladen → Caption oben einfügen → teilen.
- Empfehlung: **3 Posts hintereinander** posten (Feed ist nicht mehr leer), Rest über die Woche verteilen.

### B) Über Postiz (für laufende Automatisierung) — Voraussetzungen zuerst
> ⚠️ **Blocker aktuell:** Instagram-API-Posting verlangt eine **mit Instagram verknüpfte Facebook-Seite** — bei dir steht FB noch auf „Verknüpfen".

1. **Postiz-Konto** auf postiz.com (oder self-hosted).
2. Instagram (Professionell) **mit Facebook-Seite verknüpfen** → dann IG-Kanal in Postiz hinzufügen.
3. **API-Key**: Postiz → Settings → Developers → Public API.
4. Key in `steakakademie-v2/.env.local`: `POSTIZ_API_KEY=…` (NIE in Git).
5. Sag Bescheid — dann lade ich **alle 48 Promo-Kits als Entwürfe** in Postiz:
   `node scripts/postiz-push.mjs --probe` (Kanäle prüfen) → `--push` (als Draft). **Kein Auto-Posting** — du gibst frei.

---
*Quelle der Captions: `promo-output/` (Promo-Maschine), hier kuratiert + entschärft (#marco intern entfernt, Kerntemperaturen geprüft).*
