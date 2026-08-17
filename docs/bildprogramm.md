# Bildprogramm Steakakademie

> **Einordnung:** Dieses Dokument ist das AUSFÜHRUNGSDOKUMENT zu den Bild-Regeln
> in der übergeordneten `CLAUDE.md` (OneDrive-Projektordner):
> **8c** (Fakten vor Fach-Content, Bild-gegen-Behauptung-Prüfung, kanonische
> Kerntemperaturen) und **8d** (Bild-Prompt-Doktrin fal.ai/FLUX: keine
> Qualitätswörter, Texturs- und Kamerasprache, Perspektiven-Rotation,
> sliced-Trick, Klassifizierung nach Protein).
> Bei Widerspruch gilt: CLAUDE.md nennt das PRINZIP, dieses Dokument die
> AUSFÜHRUNG — und die jüngste datierte Entscheidung gewinnt.

> **Änderbarkeit (Entscheidung Uwe, 17.08.2026):** Doktrin ist ein Protokoll
> von Entscheidungen mit Datum — kein Gesetz. Kreativität und das Erkennen
> vorteilhafter Veränderungen stehen VOR einer festgeschriebenen Regel.
> Eine Änderung ist erlaubt und erwünscht; sie muss nur als neue datierte
> Entscheidung notiert werden, damit die nächste Sitzung weiß, was gilt.
> Konkreter Anlass: Die Look-Entscheidung „Warm & Rustikal — KEIN
> dunkel-moody-Schiefer" (CLAUDE.md 8d(g), 04.06.2026) entstand für
> REZEPTBILDER und ist dort implementiert (recipe-images.mjs,
> api/rezept-bild). Das am 17.08.2026 abgenommene Ribeye-Artikelbild
> (dunkler Schiefer) bleibt — Artikel-/Cut-Heroes (Spur A) folgen der
> dunklen Marken-Optik, Rezeptbilder (Spur B) bleiben Warm & Rustikal.
> 8d(g) ist damit als Rezeptbild-Regel präzisiert, nicht aufgehoben.

**Stand:** 16.08.2026 · **Auslöser:** Ribeye-/Methoden-Bildrunde, Referenzfotos Feuerplatte (Uwe)

---

## Das Problem, das dieses Dokument löst

Bis heute gab es Bild-Doktrin nur pro Skript: `cut-images.mjs` kannte den Carneo-Look,
`recipe-images.mjs` den Hausstil „Warm & Rustikal", Artikel- und Methodenbilder hatten
gar keine Regel. Ergebnis: vier Methodenseiten mit demselben Platzhalter, drei mit
Unsplash-Hotlinks, und ein Ribeye-Artikelbild, dessen Motiv seit Juni weder zum
Dateinamen noch zum Alt-Text passte.

Die Seite soll Magazin-Dichte bekommen (Vorbild: Texas Monthly). Dichte ohne Lärm
entsteht dort **nicht** durch weniger Bilder, sondern durch **Typ-Disziplin**: Jedes
Bild hat einen Job, und der Leser erkennt nach zwei Scrolls, welcher.

---

## Die zwei Spuren

### Spur A — Referenz (Präzision)

**Wo:** Cut-Atlas, Cut-Detailseiten, Anatomie, Temperatur-Guide, Diagramme.
**Job:** „So sieht dieses Teilstück aus." Das Bild ist eine Aussage, die stimmen muss.

- Studio, freigestellt, dunkler Grund (Schiefer/Holz), Softbox von oben
- Ein Objekt, zentriert, keine Handlung
- **Keine Menschen, keine Hände, kein Werkzeug**
- Anatomie muss lesbar sein: Fettauge, Deckel, Faserverlauf, Knochen nur wenn der Cut ihn hat
- Deko nur als deterministisch rotierender Kräuterzweig (Entscheidung Uwe 06.07.2026)

Werkzeug: `scripts/cut-images.mjs` (LoRA `sa_rawcut`).

Der dunkle Grund in Spur A steht bewusst NICHT im Widerspruch zu 8d(g)
(„Warm & Rustikal") — siehe Änderbarkeits-Block oben: 8d(g) regelt
Rezeptbilder, Spur A folgt der dunklen Marken-Optik (Entscheidung 17.08.2026).

### Spur B — Reportage (Praxis)

**Wo:** Methodenseiten, Rezept-Heroes, Magazin-/Startseiten-Teaser, Grillschule.
**Job:** „So läuft das ab." Das Bild zeigt Handlung, Gerät, echte Situation.

- Tageslicht oder Golden Hour, gern Außenaufnahme mit unscharfem Hintergrund
- Echtes Gerät, sichtbare Gebrauchsspuren, unperfekt
- **Hände und Menschen sind ausdrücklich erlaubt und erwünscht** — sie beweisen Praxis
- Werkzeug im Bild (Zange, Spachtel, Spieß) ist ein Merkmal, kein Fehler
- Mehrere Gargüter gleichzeitig sind ok — Fülle statt Einzelstück

**Korrektur der bisherigen Praxis (16.08.2026):** Die Regel „keine Hände" stammt aus
Spur A und wurde ungeprüft auf Methodenbilder übertragen. Das war falsch. Sie gilt
weiterhin für Referenzbilder — und nur dort.

---

## Regel: Das Bild muss den Text belegen

Ein Methodenbild ist kein Stimmungsbild, sondern die Illustration der Kernaussage
der Seite. Prüffrage vor jeder Abnahme: **Zeigt das Bild das, was der Artikel erklärt?**

Negativbeispiel `plancha-feuerplatte` (16.08.2026): Der Artikel definiert die
Feuerplatte über die **Feueröffnung in der Mitte** — daraus folgt die Zonenlogik
(Mitte scharf, Rand warmhalten), und genau das ist der Lernkern der Seite. Beide
KI-Runden lieferten eine geschlossene Platte ohne Öffnung. Das Bild widersprach dem
Text an exakt dem Punkt, den der Text erklärt. Der Alt-Text verlangt zusätzlich
Smash Burger in der Mittelzone und Gemüse am Rand — auch das kam nie.

---

## Wann KI, wann Echtfoto

**KI (fal.ai) ist stark bei:** einzelnen Gargütern, Studio-Situationen, generischen
Hitzebildern (Glut, Flamme, Rauch), allem, was formal einfach und häufig fotografiert ist.

**KI versagt bei:** spezifischer Gerätearchitektur. FLUX kennt „Grillplatte", aber
nicht die Bauform einer Feuerplatte (Ring um offene Feuerschale), nicht die Bauform
eines Oberhitzegrills mit Einschubebenen, nicht die Mechanik eines konkreten
Drehspießantriebs. Wo die **Bauform die Aussage ist**, gehört ein Echtfoto hin.

Faustregel: *Erklärt die Seite ein Gerät → Echtfoto. Erklärt sie ein Gargut → KI möglich.*

---

## Prompt-Handwerk (fal.ai / FLUX) — Ergänzungen zu CLAUDE.md 8d

Grundregeln stehen in CLAUDE.md 8d (keine Qualitätswörter, Textur- und
Kamerasprache, Perspektiven-Rotation, sliced-Trick, Protein-Klassifizierung)
und werden hier NICHT wiederholt. Die folgenden Punkte sind die am 16.08.2026
NEU gelernten Regeln, die 8d noch nicht enthält:

1. **Verneinungen im Positiv-Prompt wirken nicht wie ein Negativ-Prompt.**
   „no bone, not a tomahawk" schrieb die Tokens *bone* und *tomahawk* in die
   Konditionierung — Runde 2 lieferte einen prominenteren Knochengriff als Runde 1.
   Dasselbe bei „no spatula" → Hand im Bild. **Unerwünschtes gar nicht erwähnen;
   stattdessen die gewünschte Form positiv und geschlossen beschreiben, oder den
   Bildausschnitt so wählen, dass kein Platz dafür bleibt.**
2. **Form-Anker schlagen Adjektive.** „Braten" erzeugte einen formlosen Klumpen;
   „Zylinder, mit Küchengarn in regelmässigen Abständen gebunden" erzeugte einen
   sauberen Braten. Gleiches Prinzip wie die Anatomie-Anker in `CUT_ANATOMY`.
3. **LoRA-Stärke ist ein Motiv-Regler, kein Stil-Regler.** Der Hausstil-LoRA ist auf
   Hero-Steakfotos trainiert und zieht Richtung Knochen-Cuts. Ab ~0.8 gewinnt dieser
   Bias gegen die Prompt-Angabe. Gerät-geführte Motive: 0.45–0.55.
4. **Keine Qualitätswörter** („photorealistic", „4K", „8k") — erzeugen Plastik-Look.
   Stattdessen Textur- und Kamerasprache (Objektiv, Blende, Perspektive).
5. **Jedes generierte Bild wird vor der Abnahme angesehen.** Es gibt keinen anderen
   Qualitäts-Gate. Ablehnungsrunde 03.07.2026 und die Ribeye-Runden 16.08.2026 sind
   beide durch reine Sichtprüfung aufgefallen, nicht durch Automatik.

---

## Rechts-Doktrin (unverändert, gilt für beide Spuren)

Nur CC0 / Unsplash-, Pexels-, Pixabay-frei / Foodiesfeed / bezahlte Stock-Lizenz mit
Nachweis / Eigenfotos. **Keine** Händler- oder Shop-Produktbilder. Jede Echtfoto-Quelle
bekommt einen Eintrag in der CREDITS-Datei des jeweiligen Verzeichnisses.

**Foodiesfeed: zulässig nur nach Einzelbild-Prüfung.** Die Plattform hostet
mittlerweile echte *und* KI-Bilder und kennzeichnet letztere auf der Bildseite als
„AI-generated". Eine Foodiesfeed-URL allein belegt also keine Echtfoto-Herkunft —
vor der Übernahme ist die Quellseite zu prüfen. Ist das Bild dort als
„AI-generated" markiert, braucht es im Frontmatter `imageAI: true`, auch wenn
`imageSource` auf Foodiesfeed zeigt. Beides zusammen ist kein Widerspruch, sondern
die vollständige Angabe: `imageSource` nennt die Bezugsquelle, `imageAI` die
Entstehungsart. Erster Fall: `content/rezepte/rinder-tacos-guenstiger-cut.mdx`
(Bildseite `delicious-beef-tacos-with-fresh-toppings`).

**Offene Flanke:** Für KI-generierte Bilder existiert bislang weder ein CREDITS-Eintrag
noch eine Kennzeichnung. Angesichts der AI-Act-Regel für Personas und Inhalte ist das
separat zu klären.

---

## Offene Punkte

- [ ] `reverse-sear.mdx` hängt noch am Platzhalter `hero-ribeye.png`
- [ ] Unsplash-Hotlinks lokal spiegeln: `direktes-grillen`, `searing-perfekte-kruste`,
      `smoken-low-and-slow`, `sous-vide`
- [ ] `public/images/methoden/CREDITS.md` und `public/images/articles/CREDITS.md` anlegen
- [ ] Kennzeichnungskonzept für KI-Bilder — Analyse 17.08.2026, Entscheidung offen

      In `src/components/RecipeTemplate.tsx` liegt uncommittet eine Änderung, die
      allen ~115 Rezept-Heroes ein sichtbares Badge „KI-Symbolbild" gibt und
      „— KI-generiertes Symbolbild" an den Alt-Text hängt. Bewusst nicht mit dem
      Bildprogramm-Commit ausgeliefert.

      Rechtliche Prüfung (nachgelesen, nicht geschätzt): EU AI Act Art. 50 gilt seit
      02.08.2026. Art. 50(2) verpflichtet den ANBIETER des KI-Systems zur
      maschinenlesbaren Markierung — das ist fal.ai bzw. Google, nicht die
      Steakakademie. Art. 50(4) verpflichtet den BETREIBER zur Offenlegung, aber für
      DEEPFAKES, also Inhalte, die existierende Personen, Gegenstände, Orte oder
      Ereignisse erkennbar nachbilden. Ein generisches Steak auf Schiefer ist das
      nicht. Ein sichtbares Badge pro Bild ist nach Art. 50 daher sehr wahrscheinlich
      nicht gefordert.

      Der greifende Hebel ist § 5 UWG: Das Bild darf nicht suggerieren, so sehe das
      nachgekochte Gericht aus. Dafür ist die etablierte deutsche Formel
      „Symbolbild" bzw. „Serviervorschlag" — sie trifft den rechtlichen Kern
      ohne Warnhinweis-Ton.

      Empfehlung: Badge behalten, Text auf „Symbolbild" ändern, verlinkt auf das
      bereits vorhandene `/ki-disclaimer`. Dort steht die KI-Herkunft ausführlich —
      zentrale Offenlegung statt Wiederholung auf 115 Seiten. „KI" als Badge vier
      Wochen vor dem Weihnachts-Vorverkauf arbeitet gegen die Positionierung: Wer es
      liest, fragt nicht nach Art. 50, sondern ob auch die Rezepte generiert sind.

      Endentscheidung beim Anwalt — gemeinsam mit Widerrufsbelehrung Coaching und
      `challenge-teilnahmebedingungen`.
- [x] Ribeye-Artikelbild: nach drei gescheiterten Pipeline-Runden extern generiert und
      abgenommen (16.08.2026). Im Skript als `manual: true` gegen --force geschuetzt.
- [ ] `usa-expedition/page.tsx:150` nutzt das Ribeye-Bild fuer die Whole-Hog-Reise
      "Carolinas" — Rind als Aufmacher fuer Schwein. Platzhalter, nie ersetzt.
