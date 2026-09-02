# Animations-Pläne

Ergebnis eines Motion-Audits vom 02.09.2026 (Skills `improve-animations` + `find-animation-opportunities`) auf Commit `14448e2`.

Jeder Plan ist selbsttragend: exakte Dateipfade, aktueller Code im Zitat, exakte Zielwerte, Grenzen und Verifikation. Er lässt sich von einem Agenten ohne Kontext aus diesem Gespräch ausführen.

## Pläne

| # | Titel | Severity | Kategorie | Umfang | Status |
| --- | --- | --- | --- | --- | --- |
| [001](001-fortschrittsbalken-scalex.md) | Startseiten-Fortschrittsbalken von `width` auf `scaleX` umstellen | HIGH | Performance | 1 Datei, ~6 Zeilen | **DONE**¹ |
| [002](002-reduced-motion-framer.md) | Reduced-Motion-Vertrag für framer-motion einlösen | HIGH | Accessibility | 1 neue Datei + 2 Dateien | TODO |
| [003](003-transition-all-ersetzen.md) | `transition-all` durch benannte Properties ersetzen | MEDIUM | Performance | 75 Stellen in 41 Dateien | TODO |
| [004](004-hover-nur-mit-echtem-zeiger.md) | Hover-Motion nur noch bei echtem Zeigegerät auslösen | LOW | Accessibility | 1 Datei, 3 Zeilen | **DONE**¹ |
| [005](005-mobiles-menue-animieren.md) | Mobiles Menü mit Ein- und Ausblendung versehen | MEDIUM | Missed opportunity | 1 Datei, ~10 Zeilen | TODO |

¹ Umgesetzt am 02.09.2026. Mechanische Verifikation vollständig (`tsc --noEmit`, `next lint`, `next build` mit 501 Seiten, CSS-Ausgabe geprüft). Die Feel Checks im Browser stehen noch aus.

## Empfohlene Reihenfolge

```
004  →  001  →  002  →  005  →  003
```

1. **004** zuerst: drei Zeilen Konfiguration, kein Komponenten-Risiko, wirkt sofort projektweit. Guter erster Durchlauf, um die Verifikationskette (`build` + Feel Check) einzuspielen.
2. **001** danach: isoliert, höchster Einzelhebel, berührt keinen anderen Plan.
3. **002** setzt für seinen Kontrollschritt 3 voraus, dass 001 erledigt ist.
4. **005** setzt 002 voraus, damit das neue Menü Reduced Motion von Anfang an respektiert.
5. **003** zuletzt: der mit Abstand größte Plan, und er berührt `FrischSaisonal.tsx` sowie `Header.tsx` — beide werden vorher von 001 und 005 geändert. Diese Reihenfolge vermeidet Konflikte in denselben Dateien.

## Abhängigkeiten

| Plan | hängt ab von | warum |
| --- | --- | --- |
| 002 | 001 | Schritt 3 kontrolliert den Balken, den 001 auf `scaleX` umstellt. Ohne 001: Schritt überspringen und vermerken |
| 005 | 002 | Reduced Motion kommt über den `MotionProvider` aus 002, nicht über eigenen Code im Header |
| 003 | 001, 005 | Gleiche Dateien (`FrischSaisonal.tsx`, `Header.tsx`), unterschiedliche Zeilen — Reihenfolge vermeidet Merge-Konflikte |
| 001, 004 | — | unabhängig |

## Nicht in Plänen enthalten

Aus dem Audit bestätigt, aber bewusst nicht eingeplant:

- **`EmberGlow` repaintet einen bildschirmfüllenden Gradient** (`src/components/ui/EmberGlow.tsx:105-110`, `transition: background 700ms` + `willChange: background`, pro Scroll-Frame retargetet). Braucht erst eine Messung (DevTools → Paint Flashing beim Scrollen), bevor sich ein Umbau auf zwei Opacity-Layer rechtfertigen lässt.
- **Vier weitere Fortschrittsbalken auf `width`** — `AgingClient.tsx:137-139`, `diplome/simulation/page.tsx:107-108`, `NicheValidator.tsx:585-587`, `AnimatedBar.tsx:33-36`. Gleiche Ursache wie 001, aber einmalig statt im Loop.
- **`MarcoWidget`-Panel skaliert aus der Mitte statt vom FAB** (`src/components/ai/MarcoWidget.tsx:157-160`); `transform-origin` kommt in `src/` kein einziges Mal vor.
- **Keine Motion-Tokens** — Dauern von 0,2 s bis 1,0 s handgetippt über die Codebase verstreut, Easing meist das schwache eingebaute `'easeOut'`.
- **Entrances laufen beim Mount statt per `whileInView`** (`ManifestClient`, `TerroirClient`, `RettungClient`, `urkunde`) — Inhalt unter dem Fold ist fertig animiert, bevor er sichtbar wird.
- **Framer-Kurzformen `x`/`y`/`scale` statt vollständiger Transform-Strings**, am ehesten spürbar beim Endlos-Shimmer in `ExitIntent.tsx:21-23`.

Abgelehnt und nicht wieder aufzunehmen: Stagger auf Artikel-Listen (zu hohe Frequenz), zusätzliche Pulsation in `EmberGlow` (dokumentierte Entscheidung gegen Dauerschleifen), Ausbau des Desktop-Dropdowns (bereits korrekt bei 150 ms), Umbau der Akkordeon-Höhe in `RettungClient.tsx:192-195` (Höhen-Transition ist für Akkordeons der vorgesehene Weg), Motion auf Rechner-Ergebnissen in `TaxCalculator`/`PortionCalculator`/`CookCoach` (funktionale Zahlen bewegen sich nicht).
