# `cookingMethod` normalisieren — Vorschlag zur Abnahme

**Ausgangslage:** 93 Rezepte, **70 verschiedene Freitextwerte** im Feld `cookingMethod`.
`Low and Slow` und `Low & Slow` stehen als zwei getrennte Werte nebeneinander, ebenso
`Direktgrill` / `Direkt` / `Direkt, heiss` / `Direkt, kurz` / `Direkt, hohe Hitze`.

Solange das so bleibt, kann kein Tool und kein Filter zuverlässig auswählen. Das ist die
Voraussetzung für den Cut-Berater — nicht Beiwerk.

## Vorgeschlagene kontrollierte Liste — 8 Werte

| Wert | Bedeutung | Anzahl Rezepte |
|---|---|---|
| `direkt` | über der Hitzequelle, kurz und heiß | 24 |
| `indirekt` | neben der Hitzequelle, mit Deckel | 16 |
| `kombiniert` | indirekt garen, direkt Kruste ziehen (inkl. Reverse Sear) | 11 |
| `low-and-slow` | Smoker oder indirekt über Stunden | 12 |
| `spiess` | Mangal, Rotisserie, Drehspieß, Satay | 12 |
| `sous-vide` | Wasserbad, danach Sear | 1 |
| `geschmort` | Dutch Oven, Topf, Schmorgericht | 2 |
| `kalt` | Saucen, Rubs, Salate, Marinaden ohne Garvorgang | 7 |

Der bisherige Freitext geht **nicht verloren**: Er wandert in ein neues Feld
`cookingDetail` und bleibt als Anzeigetext auf der Rezeptseite stehen
(„Parrilla, direkt", „Bananenblatt, Holzkohle"). Sortiert und gefiltert wird über
`cookingMethod`, gelesen wird `cookingDetail`.

## Zuordnung im Einzelnen

**→ `direkt`**
australische-riesengarnelen-barbie, boerewors-braai, braaibroodjies, thit-nuong-vietnam,
gemuese-spiesse-grill, maiskolben-elote, ganze-dorade-grill, ganze-makrele-grill,
barramundi-grill, t-bone-fiorentina, lamb-chops-braai-sa, romana-salatherzen-grill,
rotbarbe-grill, lammkoteletts-mediterran, gruener-spargel-grill, gegrillter-pfirsich-bourbon,
t-bone-direktgrill, bavette-skirt-steak, flank-steak-grillen, iberico-secreto, mahi-mahi-grill,
onglet-hanger-steak, schwertfisch-steak-grill, tagliata-di-manzo, iberico-pluma,
iberico-presa, bun-cha-hanoi, sardinen-vom-grill, thunfisch-steak-grill, wagyu-steak-braten,
wagyu-yakiniku, korean-bbq-bulgogi, chorizo-argentino-choripan, entrana-asado-argentino,
asado-de-tira, ca-nuong-bananenblatt, ikan-bakar-singapur, pla-pao-salzkruste,
smash-burger, wagyu-burger

**→ `indirekt`**
aussie-lamb-leg-butterflied, faecherkartoffeln-grill, cedar-plank-lachs, ente-vom-grill,
beer-can-chicken, drillinge-salzkruste, cheesecake-vom-grill, spatchcock-haehnchen,
naan-pizzastein, smoked-baked-potatoes, mac-and-cheese-smoker, krustenbraten-grill

**→ `kombiniert`**
porterhouse-grill, tri-tip-santa-maria, chateaubriand-filet, lammkarree-grillen,
gai-yang-isaan, entrecote-grillen, dry-aged-ribeye, roastbeef-reverse-sear,
tomahawk-reverse-sear, picanha-churrasco

**→ `low-and-slow`**
brisket-low-slow, pulled-pork-boston-butt, beef-back-ribs, pulled-chicken, beef-short-ribs,
burnt-ends, spareribs-3-2-1, maple-glazed-spareribs-kanada, nackenbraten-kraeuter-rub,
costela-gaucha-churrasco, mollejas-asado, smoked-arctic-char-kanada

**→ `spiess`**
adana-kebab, kofte-mangal, sis-kebab-tuerkisch, tavuk-sis-kebab, sosaties-braai,
singapore-satay, moo-ping, frango-churrasco-brasil, lammkeule-drehspiess

**→ `sous-vide`** — ribeye-sous-vide
**→ `geschmort`** — ochsenbaeckchen-geschmort, iberico-carrillera
**→ `kalt`** — alabama-white-sauce, carolina-mustard-sauce, kansas-city-bbq-sauce,
saucen-espresso-bbq, texas-coleslaw, texas-dry-rub, bourbon-brisket-pairing

## Zwei Fälle, die eine Entscheidung brauchen

1. **`picanha-churrasco`** steht auf „Spiess / indirekt". Auf dem Churrasco-Spieß läuft es
   über offener Glut — das ist eher `spiess` als `kombiniert`. Deine Entscheidung.
2. **`mollejas-asado`** („Parrilla, langsam") — Bries auf der Parrilla ist langsam, aber
   direkt über der Glut. `low-and-slow` passt begrifflich schlecht, `direkt` auch.

## Nebenbefund, unabhängig davon

`bavette-skirt-steak.mdx` behandelt Bavette und Skirt als dasselbe Rezept — Titel und
Keywords nennen beides. Im Katalog sind es zwei getrennte Cuts (`bavette`, `skirt`), und
seit heute haben wir für `skirt` eine eigene Kachel. Das Rezept sollte aufgeteilt werden,
sonst widerspricht der Rezeptbereich dem Cut-Atlas.
