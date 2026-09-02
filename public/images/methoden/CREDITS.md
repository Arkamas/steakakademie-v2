# Methoden-Bildquellen (Provenienz)

Hero-Bilder der Methodenseiten (`content/methoden/*.mdx`). Es gilt dieselbe Rechts-Doktrin
wie im Cut-Atlas (siehe `public/images/cuts/CREDITS.md`):

> Nur CC0 / Unsplash-, Pexels-, Pixabay-frei / Foodiesfeed / bezahlte Stock-Lizenz mit
> Nachweis / Eigenfotos. **Keine** Händler- oder Shop-Produktbilder — auch nicht
> freigestellt, das bleibt ein Derivat des Originals.

Bildsprache dieser Seiten: **Spur B (Reportage)** nach `docs/bildprogramm.md` —
Tageslicht, echtes Gerät, Hände und Menschen ausdrücklich erlaubt.

---

## Echtfotos

| Datei | Motiv | Fotograf | Pexels-ID | Quelle |
|---|---|---|---|---|
| `plancha-feuerplatte.jpg` | Feuerplatte über offener Glut, Spieße dicht an dicht auf dem Stahlring, Gussrost über den Kohlen | Sergei Starostin (`sejio402`) | 29274607 | https://www.pexels.com/photo/29274607/ |
| *(Reserve, noch nicht eingebunden)* | Feuerplatte mit offener Feuerschale, Warmhalte-Etage darüber, Kräuterkruste am Außenring | Ann H | 36318468 | https://www.pexels.com/photo/36318468/ |
| `direktes-grillen.jpg` | Kugelgrill von oben, Holzkohle mit grauem Ascheüberzug, rote Glut schimmert durch, leerer Rost | Stefan Maritz | 35963583 | https://www.pexels.com/photo/35963583/ |

Beide Pexels-Lizenz: kommerzielle Nutzung frei, Bearbeitung erlaubt, **keine
Attributionspflicht** — die Angaben hier dienen der eigenen Nachweisführung.
Abgebildete Personen sind nicht identifizierbar (Hände, unscharfer Oberkörper).

**Reserve-Bild Ann H (36318468):** zeigt die Zonenlogik noch deutlicher als das Hero —
offene Feuerschale in der Mitte, Gargut auf dem Außenring, zusätzliche Warmhalte-Etage
darüber. Hochformat, deshalb nicht als Hero geeignet, aber ein guter Kandidat als
Inline-Bild im Abschnitt „Warum Kontakthitze anders schmeckt".

**Warum hier ein Echtfoto steht:** Der Artikel definiert die Feuerplatte über die
Feueröffnung in der Mitte, aus der die Zonenlogik folgt (Mitte scharf → Rand warmhalten).
Drei fal.ai-Runden lieferten durchweg eine geschlossene Platte ohne Öffnung — das Bild
hätte dem Text an genau der Stelle widersprochen, die er erklärt. FLUX kennt
„Grillplatte", aber nicht die Bauform einer Feuerplatte. Regel dazu in
`docs/bildprogramm.md`: *Erklärt die Seite ein Gerät → Echtfoto. Erklärt sie ein
Gargut → KI möglich.*

---

## KI-generiert (fal.ai FLUX + Hausstil-LoRA `sa_foodstyle`)

Erzeugt mit `scripts/hero-images.mjs`. Prompts und Abnahme-Notizen stehen dort je Brief.

| Datei | Motiv | Runde | Abgenommen |
|---|---|---|---|
| `oberhitze-grillen.jpg` | Steak unter glühendem Oberhitzebrenner | 1 | 16.08.2026 |
| `rotisserie-drehspiess.jpg` | Gebundener Braten am Drehspieß über Glut | 2 | 16.08.2026 |
| `searing-perfekte-kruste.jpg` | Steak in heißer Gusseisenpfanne, Dampf steigt über der bräunenden Oberfläche auf | Pexels | 13854062 | https://www.pexels.com/photo/13854062/ |
| `smoken-low-and-slow.jpg` | Barrel-Smoker im Freien, geöffneter Deckel, Fleischstücke auf dem Rost | Pexels | 37931814 | https://www.pexels.com/photo/37931814/ |
| `sous-vide.jpg` | Rohes, fein marmoriertes Steak vakuumverpackt in Folie | Unsplash | TDwxg8i8lfE | https://unsplash.com/photos/TDwxg8i8lfE |

> **Offen:** Für KI-generierte Bilder gibt es bislang keine Kennzeichnung im Frontend.
> Mit Blick auf EU AI Act Art. 50 separat zu klären — betrifft auch die bestehenden
> Cut- und Rezeptbilder.

---

## Noch nicht versorgt

- `searing-perfekte-kruste`, `smoken-low-and-slow`, `sous-vide`
  hotlinken live auf `images.unsplash.com` — kein lokales Asset, keine
  `next/image`-Optimierung, externer Request bei jedem Seitenaufruf.
- `reverse-sear` nutzt weiterhin den Platzhalter `/images/hero-ribeye.jpg`
  (bis zum Perf-Audit 02.09.2026 eine PNG-Datei mit 9,2 MB, seitdem JPEG mit 182 kB).

**Erledigt 29.08.2026:** `direktes-grillen` auf lokales Pexels-Foto umgestellt
(`scripts/bild-ingest.mjs`). Damit entfaellt dort der externe Request vor Consent.
