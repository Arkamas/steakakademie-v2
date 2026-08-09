# Steakakademie — Pflicht-Briefing für jede Videoproduktion

> **Für Agenten in OpenMontage.** Diese Datei wird von `scripts/openmontage-setup.sh`
> nach `tools/openmontage/STEAKAKADEMIE-BRIEF.md` kopiert. Wer in `tools/openmontage/`
> ein Video für die Steakakademie baut, liest **zuerst diese Datei**, dann den
> Pipeline-Manifest.
>
> Kanonische Quelle: `docs/openmontage/steakakademie-brief.md` im Hauptrepo.
> Änderungen dort machen, nicht in der Kopie.

---

## 0. Rangfolge bei Konflikten

**Recht → Fakten → Marke → ROI → Reichweite → Tempo.**

Wenn ein kreativer Wunsch mit Recht oder Fakten kollidiert, gewinnt Recht bzw. Fakten —
ohne Rückfrage. Wenn er mit der Marke kollidiert, wird gestoppt und Uwe gefragt.

---

## 1. Nicht verhandelbar (aus `CLAUDE.md` des Hauptrepos)

### Regel 8c — Fakten-Genauigkeit
Temperaturen, Cuts und Reifungszeiten **nie raten**. Kanonische Referenz ist
`data/kerntemperatur-referenz.yaml` im Hauptrepo. Vor dem Script-Stage einlesen,
im Script-Artefakt die Quelle vermerken. Genauigkeit ist der stärkste Burggraben
der Marke — ein falscher Wert im Video kostet mehr Vertrauen, als das Video bringt.

### Regel 3 — Marken-DNA
- Farben: `#C8882A` (Gold), `#E85018` (Ember), `#120C07` (Dunkel).
- **Kein persönlicher Auftritt von Uwe Yendell.** Kein Gesicht, keine Stimme, kein Name
  als Sprecher. Es spricht das Avatar-System:
  - **Marco „Der Meister"** — präzise, ruhig, wissend. Technische Guides, Methoden,
    Kerntemperaturen. Standard-Sprecher für Erklärvideos.
  - **Jonas „Der Enthusiast"** — begeistert, ehrlich, lernt aus Fehlern. Social, Anfänger.
  - **Elena „Die Stimme"** — eloquent, neugierig. Reportage, Terroir, internationale Cuts.
- Ton: handwerklich, präzise, nie marktschreierisch.

### Regel 1 — Werbekennzeichnung (LG Köln, 12.05.2026)
Enthält das Video Werbung, Affiliate-Links oder Kooperationen, muss **„Werbung"
oder „Anzeige" bereits im Cover/Thumbnail sichtbar** sein — **vor dem ersten Klick**.
„Ad" genügt nicht. Gilt fürs Grid-Vorschaubild, nicht nur für die Beschreibung.
Das ist im `publish`-Stage ein hartes Gate.

### Regel 4 — Human-gated
Agenten produzieren **Entwürfe**. **Uwe gibt frei.** Kein Auto-Posting, kein
Veröffentlichen ohne explizite Freigabe. OpenMontages Approval-Gates
(`proposal`, `script`, `scene_plan`, `assets`, `publish`) bleiben aktiv — nicht
auf `auto` stellen.

### Regel 5 — No black-hat
Kein Spam, keine Fake-Entities, keine erfundenen Testimonials oder Bewertungen.

### Regel 7 — Epistemische Ehrlichkeit
Keine erfundenen Studien, Zahlen oder Quellen im Script. Was nicht belegt ist,
kommt nicht ins Video. Unsicheres wird als unsicher formuliert oder gestrichen.

### KI-Transparenz
KI-generierte Stimmen und Bilder werden gekennzeichnet — im Video oder in der
Beschreibung, konsistent mit `/ki-disclaimer` auf der Website.

---

## 2. Kosten-Gate

**Alles Kostenpflichtige ist human-gated.** Bevor ein kostenpflichtiger Provider
(Veo, Kling, Runway, ElevenLabs, Suno, HeyGen …) aufgerufen wird: Kostenschätzung
vorlegen und Freigabe einholen. Der Free-Path (Piper TTS, Pexels/Pixabay/Archive.org,
Remotion/HyperFrames, FFmpeg) ist der Standard, nicht die Notlösung.

---

## 3. Was tatsächlich gebraucht wird (Priorität)

Abgeleitet aus den kritischen Blockern in `CLAUDE.md` §5 und der Kanal-Strategie
in `marketing_agent.txt`:

| Prio | Format | Pipeline | Zweck |
|---|---|---|---|
| 1 | 60–90 s Vertical, Kerntemperatur-Erklärer (Avatar Marco) | `animated-explainer` | TikTok 3×/Woche — Traffic auf den Leadmagnet `/kerntemperatur-spickzettel` |
| 2 | Cut-Porträt Ribeye, 90–120 s | `documentary-montage` | Flankiert die Pillar Page `/cuts/ribeye` (18k Suchen/Monat) |
| 3 | Methoden-Guide Reverse-Sear, 8–15 min | `talking-head` / `hybrid` | YouTube 1×/Woche, E-E-A-T-Signal |
| 4 | Diplom-/Produkt-Trailer | `cinematic` | Monetarisierung, Digistore24-Funnel |

Style-Playbook für alle vier: `styles/steakakademie.yaml`.

---

## 4. Standard-Setup je Lauf

```
style_playbook: steakakademie
voice:          Piper (Free-Path) — Avatar-Rolle im Script benennen
sprache:        Deutsch, Du-Ansprache, keine Corporate-Prosa
untertitel:     Pflicht bei Vertical
zielordner:     tools/openmontage/output/  (gitignored)
```

Fertige Videos, die live gehen sollen, werden **nicht** ins Hauptrepo committet
(Binärgröße) — sie gehen nach Freigabe in R2/den jeweiligen Kanal.

---

## 5. Checkliste vor `compose`

- [ ] Alle Temperaturen gegen `data/kerntemperatur-referenz.yaml` geprüft
- [ ] Kein reales Gesicht, kein Uwe-Auftritt, Avatar-Rolle benannt
- [ ] Werbekennzeichnung im Thumbnail, falls Werbung/Affiliate
- [ ] KI-Kennzeichnung gesetzt
- [ ] Keine unbelegte Zahl, keine erfundene Quelle im Script
- [ ] Kostenschätzung freigegeben, falls Paid-Provider im Spiel
- [ ] Uwe hat Script und Scene-Plan gesehen
