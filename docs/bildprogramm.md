# Bildprogramm Steakakademie

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

## Prompt-Handwerk (fal.ai / FLUX) — gelernte Regeln

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

**Offene Flanke:** Für KI-generierte Bilder existiert bislang weder ein CREDITS-Eintrag
noch eine Kennzeichnung. Angesichts der AI-Act-Regel für Personas und Inhalte ist das
separat zu klären.

---

## Offene Punkte

- [ ] `reverse-sear.mdx` hängt noch am Platzhalter `hero-ribeye.png`
- [ ] Unsplash-Hotlinks lokal spiegeln: `direktes-grillen`, `searing-perfekte-kruste`,
      `smoken-low-and-slow`, `sous-vide`
- [ ] `public/images/methoden/CREDITS.md` und `public/images/articles/CREDITS.md` anlegen
- [ ] Kennzeichnungskonzept für KI-Bilder (AI Act Art. 50)
- [x] Ribeye-Artikelbild: nach drei gescheiterten Pipeline-Runden extern generiert und
      abgenommen (16.08.2026). Im Skript als `manual: true` gegen --force geschuetzt.
- [ ] `usa-expedition/page.tsx:150` nutzt das Ribeye-Bild fuer die Whole-Hog-Reise
      "Carolinas" — Rind als Aufmacher fuer Schwein. Platzhalter, nie ersetzt.
