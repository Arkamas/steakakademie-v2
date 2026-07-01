# Cut-Atlas /cuts — Handoff-Brief für Claude Code (Live-Feinschliff)

> Erstellt von Cowork. Fundament (Daten, Architektur, Silhouette-Clip, Zonen-Koordinaten)
> steht. Was fehlt, ist der **visuelle Feinschliff im laufenden Browser** — genau dein Job:
> `npm run dev` → `localhost:3000/cuts` → ändern → sofort sehen → nachjustieren.

## 0. Warum wichtig
`/cuts` (Cut-Atlas) ist ein **Aushängeschild** der Steakakademie und ein Traffic-/Werbe-Asset.
Es muss perfekt wirken: das interaktive Rind sauber, die Teilstücke exakt auf der Anatomie,
Marken-CI konsequent, alle Cuts nutzbar.

## 1. Zielbild (verbindlich, vom Inhaber)
1. **Zonen sitzen perfekt auf dem Rind** — keine überstehenden/„chaotischen" Felder.
2. **Vorgegebene Marken-Farben** verwenden (siehe §4) — KEIN zinc/amber aus generischen Vorlagen.
3. **Alle bereits vorhandenen Cuts** erscheinen im **Raster unter dem Rind** (Layout wie Mockup),
   und filtern sich, wenn oben ein Teilstück angeklickt wird.

Referenzbilder in diesem Ordner:
- `referenz-angus-chart.png` — American Angus Beef Chart (Lage/Proportionen der Primals).
- `stand-default.png` / `stand-selected.png` — aktueller Cowork-Stand (Simulation, nicht live).
- `kalibrier-raster.png` — Stier-Foto mit 5%-Raster (zum Nachjustieren der Koordinaten).

## 2. Aktueller Stand (was steht)
- Seite: `src/app/cuts/page.tsx` (Server) → rendert `CutAtlasClient`.
- `src/components/cuts/CutAtlasClient.tsx` — Dashboard (State, Info-Panel, Detail-Modal).
- `src/components/cuts/BullPrimalMap.tsx` — **interaktives Stier-Foto + SVG-Overlay** (Zonen,
  Silhouette-Clip, Hover-Glow, DE·EN-Label). **Hier sitzt die Zonen-Logik.**
- `src/components/cuts/AnimalDiagram.tsx` — nur noch Schwein-Fallback (unverändert lassen).
- Daten: `src/lib/cuts-catalog.ts` (`ALL_CUTS`, `BEEF_PRIMALS`, `Cut`, `Primal`, `CookMethod`,
  `METHOD_LABEL`). Jeder Cut hat `primal` (= Teilstück-ID). Primals haben `nameDE`, `nameEN`,
  `blurb` (Muskelgruppen-Beschreibung), `color`.
- Bild: `public/images/cut-atlas-stier.jpg` (1264×842, Dreiviertel-Frontalansicht).

## 3. Layout-Umbau (Mockup-Ziel: Raster UNTER dem Rind)
Aktuell ist es Master-Detail (Rind links, Panel rechts). **Umbauen auf:**
- **Oben:** das interaktive Rind (BullPrimalMap), volle Breite oder 2/3 mit kleiner Info-Karte.
- **Darunter:** das **volle Cut-Raster mit ALLEN Cuts** der aktuellen Spezies
  (`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4`).
  - Kein Teilstück gewählt → **alle** Cuts sichtbar.
  - Teilstück gewählt (Klick aufs Rind ODER Chip) → Raster filtert auf `cut.primal === selectedPrimal`,
    plus sichtbarer „Filter aktiv: <Teilstück> ✕"-Hinweis zum Zurücksetzen.
- Klick auf eine Cut-Karte → bestehendes Detail-Overlay (`CutDetail`, schon vorhanden) öffnen.
- Der frühere „alles im rechten Panel"-Ansatz wird damit ersetzt; die `filteredCuts`-Logik bleibt,
  nur `selectedPrimal ? gefiltert : ALLE` statt `: []`.
- Spezies-Umschalter (Rind/Schwein) und Mobile-Chips beibehalten.

## 4. Marken-Farben (aus CLAUDE.md §2.3 / tailwind.config.js) — VERBINDLICH
- Gold `brand-gold` **#C8882A** — Linien, Rahmen, Akzente.
- Glut/Fire `brand-fire` **#E85018** — aktive Auswahl, CTA.
- Dunkel **#120C07 / #0D0A06** (`surface-dark`, `surface-base`).
- Weitere Tokens: `text-light`, `border-border-subtle`, `surface-elevated`.
- Kein zinc-950/amber-500 (weicht von der Marke ab).

## 5. Silhouette-Clip (fertig, exakt)
Die Stier-Kontur wurde per Bild-Segmentierung (OpenCV GrabCut) extrahiert und als SVG-`clipPath`
eingebaut (`BULL_SILHOUETTE` in BullPrimalMap.tsx). **Dadurch ragt keine Zone über das Tier.**
Wenn das Stier-Bild je getauscht wird, Clip neu erzeugen (Rezept in §8). Aktueller Clip-Pfad
(viewBox 0 0 100 100) steht bereits in der Komponente.

## 6. Zonen-Koordinaten (Stand — live feinjustieren)
Definiert in `BULL_ZONES` (BullPrimalMap.tsx), Prozent im viewBox 0..100. IDs = Primal-IDs.
Mapping DE→EN (aus Katalog): Hals→Neck, Bug→Chuck, Hochrippe→Rib, Roastbeef→Short Loin,
Hüfte→Sirloin, Keule→Round, Brust→Brisket, Dünnung→Plate & Flank, Beinscheibe→Shank.
Feinjustage: `kalibrier-raster.png` daneben legen, Punkte in %-Schritten nachziehen, im Browser prüfen.

## 7. Interaktion & Styling-Spec (Legibilität auf dem SEHR dunklen Rind!)
Wichtig: Dezente Farbflächen sind auf dem fast schwarzen Stier unsichtbar. Deshalb:
- **Grundzustand:** keine Füllung, nur **goldene, gestrichelte Schnitt-Linien** (#C8882A, ~0.6,
  `strokeDasharray`) — wirkt wie eine Metzger-Karte, gut lesbar.
- **Hover:** Zonenfarbe füllen (~0.38) + solide Gold-Kante + `drop-shadow`-Glow in Zonenfarbe.
- **Aktiv/Selected:** Füllung **#E85018** (~0.5) + cremefarbene Kante (#F4E4C6, 2.5) + Fire-Glow.
- Label unten mittig als Pill: „<DE> · <EN>" (z. B. „Roastbeef · Short Loin").
- Alles über `<g clipPath="url(#saBullClip)">`, `vectorEffect="non-scaling-stroke"`.
- Framer Motion / AnimatePresence fürs Panel bzw. Filter-Übergang beibehalten.

## 8. Kalibrier-Rezept (falls Zonen/Clip neu gebraucht werden)
Python im Sandbox/CI:
1. Raster: Stier-Foto mit 5%/10%-Gitter überlagern → Koordinaten ablesen.
2. Clip: `cv2.grabCut` mit fg/bg-Seeds (Bull-Kern = FGD; Ränder + Rauch links-unten + Bodenstreifen
   = BGD) → größte Komponente → `findContours` → `approxPolyDP(eps≈0.0025*peri)` → auf 0..100
   normalisieren → als `<clipPath><polygon points="…"/>`.
3. Verifizieren: Zonen gegen die Maske clippen und rendern, bis kein Überstand.

## 9. Polish-Checklist (Definition of Done)
- [ ] Zonen sitzen im Browser exakt (kein Überstand, kein Versatz bei Resize) — live geprüft.
- [ ] Grundzustand ruhig & lesbar (Gold-Linien), nicht „chaotisch".
- [ ] Marken-Farben durchgängig (#C8882A / #E85018 / #0D0A06), kein zinc/amber.
- [ ] Raster unter dem Rind zeigt **alle** Cuts; Klick aufs Teilstück filtert; Reset sichtbar.
- [ ] Cut-Karte → Detail-Modal (Garstufe, Kerntemperatur, DNA, Rezepte, Kaufen-CTA) funktioniert.
- [ ] DE·EN-Labels korrekt aus dem Katalog.
- [ ] Mobil: Trefferflächen groß genug bzw. Chips-Fallback; Layout bricht sauber um.
- [ ] `npm run build` + `npm run lint` grün.
- [ ] Optional: Klick-Tracking-Event pro Teilstück (für Werbe-Auswertung).

## 10. Bekannte offene Punkte / Empfehlungen
- **Größter Qualitätshebel:** ein **sauberes Seitenprofil-Bild** des Stiers (wie Angus-Chart) ⇒
  lehrbuch-exakte Grenzen und Unter-Cuts direkt am Tier. Dreiviertel-Frontale limitiert Präzision.
- Viele Cuts haben Platzhalter („Foto folgt", `CutImage`). Echte Fotos (eigene / Hersteller /
  Amazon Creators API) heben die Wirkung stark.

## 11. Commands
```
cd C:\Dev\steakakademie-v2
npm run dev            # localhost:3000/cuts
npm run build && npm run lint
```
