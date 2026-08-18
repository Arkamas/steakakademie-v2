# Bild-Audit Rezepte — KI-Kennzeichnung (18.08.2026)

**Bestand:** 113 Rezept-Hauptbilder (`content/rezepte/*.mdx` → `image`-Feld)

## Gesamtergebnis

| Befund | Anzahl | Beleg |
|---|---|---|
| KI, **hart belegt** (C2PA-Metadaten fal.ai/FLUX) | 44 | Metadaten-Scan |
| KI, **visuell klassifiziert** (Konfidenz überwiegend hoch) | 66 | 4 unabhängige Bildforensik-Agenten |
| Bereits korrekt getaggt (`imageAI: true`) | 1 | rinder-tacos-guenstiger-cut |
| Vermutlich **echtes Foto** | 1 | picanha-churrasco (Photoshop/Google-EXIF, natürliche Textur) |
| **→ Fehlende `imageAI: true`-Kennzeichnung** | **110** | |

## A) C2PA-belegt KI (44) — imageSource: "KI-generiert (FLUX via fal.ai, C2PA-belegt)"

adana-kebab · alabama-white-sauce · asado-de-tira · avocado-gremolata-grill · baked-alaska-grill · beef-short-ribs · beer-can-chicken · blitz-mayonnaise · blumenkohl-beutel-marinade · boerewors-braai · brisket-low-slow · buttermilchbrot-grill · cheesecake-vom-grill · chicken-wings-bier-injection · chili-kraeuterbutter · costela-gaucha-churrasco · drillinge-salzkruste · dry-aged-ribeye · faecherkartoffeln-grill · frango-churrasco-brasil · ganze-dorade-grill · guinness-sauce · lachsforelle-sabayone · lammhuefte-rotweinsud · maple-glazed-spareribs-kanada · minutensteaks-apfel-chili-lake · mollejas-asado · naan-pizzastein · nackenbraten-kraeuter-rub · paella-vom-grill · pastrami-rinderhuefte · pork-chops-schoko-pfeffer · rinderhuefte-gasgrill-smoke · romana-salatherzen-grill · sardinen-vom-grill · saucen-espresso-bbq · schafskaese-warm-geraeuchert · schoko-soft-cake-grill · schweinekarree-honig-rosmarin · singapore-satay · smoked-arctic-char-kanada · spareribs-3-2-1 · spatchcock-haehnchen · wine-dog

## B) Visuell als KI klassifiziert (66) — imageSource: "KI-generiert (visuell klassifiziert, Metadaten entfernt)"

aussie-lamb-leg-butterflied · australische-riesengarnelen-barbie · barramundi-grill · bavette-skirt-steak · beef-back-ribs · bourbon-brisket-pairing · braaibroodjies · bun-cha-hanoi · burnt-ends · ca-nuong-bananenblatt · carolina-mustard-sauce · cedar-plank-lachs · chateaubriand-filet · chorizo-argentino-choripan · ente-vom-grill · entrana-asado-argentino · entrecote-grillen · flank-steak-grillen · gai-yang-isaan · ganze-makrele-grill · gegrillter-pfirsich-bourbon · gemuese-spiesse-grill · gruener-spargel-grill · iberico-carrillera · iberico-pluma · iberico-presa · iberico-secreto · ikan-bakar-singapur · kansas-city-bbq-sauce · kofte-mangal · korean-bbq-bulgogi · krustenbraten-grill · lamb-chops-braai-sa · lammkarree-grillen · lammkeule-drehspiess · lammkoteletts-mediterran · mac-and-cheese-smoker · mahi-mahi-grill · maiskolben-elote · moo-ping · ochsenbaeckchen-geschmort · onglet-hanger-steak · pla-pao-salzkruste · porterhouse-grill · pulled-chicken · pulled-pork-boston-butt · ribeye-sous-vide · roastbeef-reverse-sear · rotbarbe-grill · sis-kebab-tuerkisch · smash-burger · smoked-baked-potatoes · sosaties-braai · t-bone-direktgrill · t-bone-fiorentina · tagliata-di-manzo · tavuk-sis-kebab · texas-coleslaw · texas-dry-rub · thit-nuong-vietnam · thunfisch-steak-grill · tomahawk-reverse-sear · tri-tip-santa-maria · wagyu-burger · wagyu-steak-braten · wagyu-yakiniku

Einheitliche Signatur wie die C2PA-belegten Geschwister: warmes Feuer-Bokeh, Slate/Holzbrett-Inszenierung, gestempelte Grillrauten, wachsartige Texturen, Rauch ohne Quelle.

## C) PRIORITÄT AUSTAUSCH — Bild zeigt das falsche Gericht / harte Fehler (~22)

Diese Bilder schaden der Glaubwürdigkeit („geprüfte Rezepte") unabhängig von der KI-Frage:

| Rezept | Fehler im Bild |
|---|---|
| bourbon-brisket-pairing | Verstümmelter Schildtext „KINOR FIENGORS NOT BURBON" |
| braaibroodjies | Zeigt Patties statt Grill-Sandwiches |
| bun-cha-hanoi | Fantasie-Patties, keine Nudeln/Brühe |
| ca-nuong-bananenblatt | Kein Bananenblatt, Fisch wirkt wie Hähnchen |
| cedar-plank-lachs | Keine Zedernplanke |
| chateaubriand-filet | Unmögliche Pastrami-Spiralstruktur |
| iberico-carrillera | Backe ohne Knochen — Bild zeigt Kotelett mit Knochen |
| iberico-secreto | Dünner Cut — Bild zeigt Tomahawk mit Knochen |
| onglet-hanger-steak | Onglet ist knochenlos — Bild hat zwei Knochen |
| porterhouse-grill | Kein T-Knochen im Steak |
| moo-ping | Ohne Spieße als Steak-Platte |
| pla-pao-salzkruste | Keine Salzkruste, falsches Gericht |
| sis-kebab-tuerkisch | Kein Kebab: Braten mit zwei Griffen |
| sosaties-braai | Steak statt Spieße |
| tavuk-sis-kebab | Brathähnchen statt Spieße |
| texas-coleslaw | Nudelstränge mit Hackfleisch statt Coleslaw |
| thit-nuong-vietnam | Kotelett auf Gnocchi |
| thunfisch-steak-grill | Interieur ist Rind statt Thunfisch |
| ganze-makrele-grill | Fisch ist keine Makrele |
| ikan-bakar-singapur | Filet auf Omelett-Fladen |
| roastbeef-reverse-sear | Holzgriff steckt sinnlos im Braten |
| wagyu-burger | Bun lehnt am Steak, Burger deformiert |

**Empfehlung:** Diese 22 zuerst über die Nano-Banana-Pipeline (Edit ab echtem Foto, siehe Bildstrategie) ersetzen — nicht nur taggen.

## D) Kein Tagging

- **rinder-tacos-guenstiger-cut** — bereits `imageAI: true` (korrekt)
- **picanha-churrasco** — vermutlich echtes Foto (Photoshop/Google-EXIF, natürliche Fettkappen-Textur). Quelle klären → `imageSource` nachtragen, KEIN `imageAI`.

## Konsequenz

Nach dem Tagging tragen 111/113 Rezepte das „Symbolbild"-Badge. Das ist ehrlich und konsistent mit dem Ehrlichen System + AI-Act-Vorsorge. Mittelfristig: sukzessiver Austausch (Prio-Liste C zuerst) durch Nano-Banana-Edits ab echten Fotos.
