# Master-Orchestrator „Der Intendant" — Architektur

> Bauanleitung für Claude Code. Stand: 2026-09-04. Kampagnenstart: 2026-10-01.
> Quelle der Marken- und Compliance-Regeln: `marketing_agent.txt` (Repo-Wurzel).
> Vollständiges Konzept mit Begründungen: `plans/orchestrator-architektur-lesefassung.html`

---

## 0 · Auftrag in einem Satz

Ein System, das Video-Themen selbst findet, Videos produziert, auf acht Kanälen
veröffentlicht und aus den Ergebnissen lernt — bei 5–7 Veröffentlichungen pro
Woche, ohne dass ein Mensch zwischen den Schritten sitzt.

## 1 · Die tragende Entscheidung

**Volle Autonomie ist nur verantwortbar, wenn die Constraints aus
`marketing_agent.txt` ausführbarer Code sind statt Prosa.**

Solange „Kein werblicher Social-Post ohne sichtbare Werbekennzeichnung" ein Satz
in einer Textdatei ist, ist es eine Bitte an ein Sprachmodell. Als Prüfschritt,
der den Upload blockiert, ist es eine Garantie. Alles Weitere hängt daran.

Praktische Folge für die Implementierung: **Das Prüf-Tor (§6) wird zuerst
gebaut, vor allem anderen.**

## 2 · Leitentscheidungen

| Entscheidung | Begründung |
|---|---|
| Orchestrator **steuert** das Toolkit, ersetzt es nicht | `claude-code-video-toolkit` ist gepflegte Fremdsoftware. Wer forkt, pflegt. Kopplung nur über das Projektverzeichnis-Format. |
| **Werk** und **Ausspielung** sind getrennte Entitäten | 5–7 Veröffentlichungen/Woche ≠ 5–7 Produktionen. 3 Werke → 12–18 Ausspielungen über 8 Kanäle. |
| Der Prüfer ist ein **Tor**, kein Ratgeber | Kein Gutachten, das überstimmbar ist. Er setzt einen Status. Ohne `freigegeben` existiert kein Upload-Pfad im Code. |
| **Mandantenfähig ab Tag eins** | Zweiter Geschäftsbereich kommt kurz nach Kampagnenstart. `mandant`-Spalte kostet jetzt nichts, später sehr viel. |
| Zustand liegt in **Supabase**, nicht im Agentengedächtnis | Agenten vergessen, brechen ab, laufen doppelt. Eine Zeile mit Statusfeld überlebt jeden Absturz, macht jeden Lauf wiederaufnehmbar. |
| Notbremse ist ein **Datensatz**, kein Anruf | `betrieb.pausiert = true` stoppt jede Veröffentlichung binnen einer Minute, vom Handy, ohne Terminal. |

## 3 · Die acht Rollen

Agenten rufen einander **nicht** auf. Jeder liest Vorgänge in seinem
Eingangszustand, arbeitet sie ab, setzt den Folgezustand. Der Intendant weckt
sie per Cron. Das macht jeden Schritt einzeln wiederholbar.

| Rolle | Auftrag | Takt | Output |
|---|---|---|---|
| **Kundschafter** | Signale sammeln (6 Quellen, §5), Themen bewerten und stapeln | täglich 06:00 | bewerteter Themenvorrat |
| **Redakteur** | Werke der kommenden 2 Wochen wählen, auf Kanäle/Termine verteilen, Formatmischung sichern | montags | Redaktionsplan |
| **Autor** | Skript, Hook, Untertitel, Caption, Hashtags im Ton des Avatars; jede Zahl belegen | pro Werk | `script.json` + Faktencheck |
| **Regie** | Toolkit aufrufen (Stimme, Bild, Musik, Rendering), kanalspezifische Schnitte erzeugen | pro Werk | MP4 je Ausspielung |
| **Prüfer** | **Das Tor.** Werbekennzeichnung, KI-Kennzeichnung, Bildlizenz, Faktenbelege, Markenregeln, Tonalität | pro Ausspielung | Prüfprotokoll + Status |
| **Disponent** | Hochladen, zum Termin live schalten, bei Fehlschlag wiederholen, Dauerfehler melden | stündlich | Live-Meldung |
| **Auswerter** | Kennzahlen nach 24 h / 72 h / 14 d holen, Stellgrößen ableiten und zurückschreiben | täglich 22:00 | Kennzahlen + Eingriffe |
| **Intendant** | Master: taktet, wacht über Budget und Frequenz, priorisiert bei Engpässen, zieht die Notbremse | alle 15 min | Wochenbericht freitags |

## 4 · Zustandsmaschine

Das **Werk** trägt den Zustand bis `produziert`. Danach trägt ihn **jede
Ausspielung einzeln** — ein Reel kann freigegeben sein, während der
YouTube-Schnitt noch hängt.

```
entdeckt → eingeplant → geschrieben → produziert → freigegeben
         → terminiert → live → gemessen

Nebenzustände: zurückgewiesen (→ zurück an Autor oder Regie)
               gesperrt (nur ein Mensch hebt das auf)
```

| Zustand | Wer arbeitet | Übergang wenn |
|---|---|---|
| `entdeckt` | Kundschafter | Punktzahl über Schwelle |
| `eingeplant` | Redakteur | Termin, Avatar, Kanäle gesetzt |
| `geschrieben` | Autor | jede Zahl im Skript hat eine Quelle |
| `produziert` | Regie | alle Schnitte liegen als Datei vor |
| `freigegeben` | Prüfer | **alle** Prüfregeln bestanden |
| `terminiert` | Disponent | hochgeladen, wartet auf die Uhr |
| `live` | Disponent | Plattform bestätigt Veröffentlichung |
| `gemessen` | Auswerter | 14-Tage-Wert erfasst |
| `zurückgewiesen` | Prüfer → Autor/Regie | Mangel behoben; **ab dem 2. Mal → `gesperrt`** |
| `gesperrt` | Intendant | nur manuelle Freigabe |

## 5 · Saisonale Mechanik

Sechs Quellen, zu einer Punktzahl je Thema verrechnet. Gewichte sind
Startwerte — der Auswerter verschiebt sie mit den Monaten selbst.

| Quelle | Auslöser | Vorlauf | Gewicht |
|---|---|---|---|
| Kalender | Grillsaison, Ostern, Vatertag, Weihnachten, Silvester | 21 d | 25 % |
| Wetter | 3 Tage > 18 °C in Folge (DACH) öffnen den Vorrat „Saisonstart" | 2 d | 20 % |
| Google Trends | Suchvolumen + Anstiegsrate je Keyword-Cluster | 7 d | 15 % |
| Eigene Analytics | welche Seiten gerade gelesen werden — verlässlichstes Signal, misst die echte Zielgruppe | 3 d | 20 % |
| Wettbewerber | Themenlücken, nicht Nachahmung | 14 d | 10 % |
| Produkt-Launches | Diplom-Stufen, Kursstarts — setzt **harte Termine**, schlägt alles | 30 d | Vorrang |

**Anti-Monokultur-Regel:** kein Thema zweimal in 21 Tagen; jede Woche mindestens
ein Werk aus einer anderen Rubrik als die beiden übrigen. Sonst produziert ein
gut laufendes Signal drei Wochen lang Kerntemperatur-Videos.

## 6 · Das Prüf-Tor — zuerst bauen

Jede Regel ist eine Funktion `(ausspielung) -> {bestanden: bool, grund: str}`.
Bei `false` gibt es **keinen** Upload-Pfad — nicht „mit Warnung", sondern gar
nicht.

| Regel | Maschinelle Prüfung | Bei Verstoß |
|---|---|---|
| **Werbekennzeichnung**<br>(LG Köln, 12.05.2026) | Ist `werbung == true`, muss auf dem **Coverbild** „Werbung" oder „Anzeige" stehen — per OCR auf dem tatsächlichen Vorschaubild, nicht im Skript. „Ad" zählt **nicht**. Hinweis nur in der Caption reicht **nicht**. | → Regie |
| **KI-Kennzeichnung** | Tritt ein Avatar auf oder ist die Stimme synthetisch: „KI-Avatar" bzw. „Stimme KI-generiert" sichtbar im Bild **und** im Caption-Text. | → Regie |
| **Faktenbelege** | Jede Temperatur-, Zeit- oder Preisangabe braucht einen Eintrag im Faktencheck mit Verweis auf die Datenquelle (Muster: `video/kerntemperatur-tiktok/script.json`). Unbelegte Zahl = Verstoß. | → Autor |
| **Bildlizenz** | Jedes Bild muss in der Lizenztabelle stehen: Quelle, Urheber, Nutzungsrecht für bezahlte Werbung. Kein Eintrag = kein Einsatz. | → Regie |
| **Kein Auftritt von Uwe** | Gesichtsabgleich gegen Sperrliste. Auch kein Ich-Erzähler im Skript, der als Uwe gelesen werden kann. | **sperren + Mensch wecken** |
| **Markenwerte** | Farbabgleich gegen `brands/steakakademie/brand.json`, Schriftprüfung, Mindestschriftgröße Hochkant, Logo vorhanden. | → Regie |
| **Tonalität** | LLM-Prüfung gegen Verbotsliste: Guru-Speak, leere Superlative, garantierte Ergebnisse, Denglish, Emoji außerhalb Social. | → Autor |
| **Affiliate-Offenlegung** | Partner-Link in der Caption → Hinweis im sichtbaren Teil **vor** dem „mehr"-Umbruch. | → Autor |

**Das Protokoll ist Pflicht.** Bei einer Abmahnung ist es der Nachweis, dass
geprüft wurde: Zeitstempel, Regelfassung, Prüfergebnis je Ausspielung. Unter
voller Autonomie wichtiger als im Handbetrieb, weil niemand aus dem Kopf
bezeugen kann, was er gesehen hat.

## 7 · Auswertung: Messwert wird Eingriff

Eine Kennzahl, die nichts verändert, ist Dekoration.

| Messwert | Automatischer Eingriff |
|---|---|
| Watch-Time < 40 % nach 3 s | Hook-Muster abwerten. Autor bekommt die 3 stärksten Hooks der letzten 30 Tage als Vorlage. Vorlaufzeit vor dem ersten Wort kürzen. |
| Klickrate Link in Bio | Zwei CTA-Formulierungen laufen dauerhaft gegeneinander. Schwächere nach 10 Ausspielungen ersetzen — nie beide gleichzeitig tauschen. |
| E-Mail-Anmeldungen je Werk | Thema im Vorrat heben. Über dem Doppelten des Mittelwerts → Fortsetzung im Redaktionsplan. |
| Diplom-Verkäufe je Kampagne | Unter Zielwert nach 14 d: planmäßig enden, keine Verlängerung. Über Zielwert: +2 Wochen, Budget aus dem Vorrat der Folgewoche. |
| Kommentar-Sentiment | **Kein** automatischer Tonwechsel — zu heikel. Negativer Ausschlag über Schwelle → Meldung an Uwe mit den 5 auslösenden Kommentaren. |
| Kosten je Werk | Monatsbudget auf Restwochen verteilen. Bei Überschreitung günstigere Modelle statt niedrigerer Frequenz — lieber schlichter als seltener. |

## 8 · Verhältnis zum Toolkit

**Der Orchestrator steuert das Toolkit und bleibt außerhalb davon.**

Das Toolkit hat einen eigenen Fahrplan; Skills, Modelle und Werkzeuge wachsen
dort ohne unser Zutun. Wird der Orchestrator hineingebaut, erbt jedes Update
einen Abgleich. Bleibt er außerhalb, profitiert er von jeder Verbesserung gratis.

| Toolkit bleibt zuständig für | Orchestrator bringt neu |
|---|---|
| Handwerk: Stimme, Musik, Bildgenerierung, Remotion-Rendering, Untertitel, YouTube-Upload. Marken-/Stimmprofil liegt als `brands/steakakademie`. | Alles *zwischen* den Videos: Themenfindung, Terminplanung, Prüf-Tor, Mehrkanal-Verteilung, Auswertung, Budget, Mandantentrennung. |

**Die Schnittstelle** existiert bereits: Die Regie schreibt ein
Projektverzeichnis nach dem Muster von `video/kerntemperatur-tiktok/`
(`script.json`, `timeline.json`, `README.md`) und startet das Toolkit darauf.
Zurück kommen Dateien. Das ist die ganze Kopplung — sie überlebt jedes
Toolkit-Update, solange das Projektformat bleibt.

## 9 · Mandantenfähigkeit

Drei Dinge entscheiden zwischen „zweiter Mandant in einem Tag" und „zweites
System in drei Monaten":

1. **Jede Tabelle trägt `mandant`** — ohne Ausnahme, auch die Kennzahlen.
   Nachträglich einzuziehen ist die teuerste Änderung überhaupt.
2. **Regelwerk und Marke sind Daten, kein Code** — Farben, Avatare,
   Verbotslisten, Kanal-Frequenzen, Prüfregeln je Mandant in einer Datei.
   Neuer Bereich = neue Datei, kein neuer Agent.
3. **Getrennte Budgets, gemeinsamer Motor** — getrennte Kassen, getrennte
   Notbremsen. Ein Fehler im zweiten Bereich darf die Steakakademie-Kampagne
   nicht anhalten.

## 10 · Ausfallverhalten

Volle Autonomie heißt, dass niemand hinschaut. Das System muss selbst wissen,
wann es aufhört.

| Fall | Verhalten |
|---|---|
| Prüfer weist dasselbe Werk 2× zurück | Werk sperren, Meldung an Uwe. Kein dritter Versuch. |
| Plattform-Upload scheitert 3× | Kanal 24 h aussetzen, übrige laufen weiter. |
| Monatsbudget zu 80 % verbraucht | Umschaltung auf günstige Modelle, Meldung im Wochenbericht. |
| Themenvorrat < 5 Einträge | Frequenz sinkt automatisch, statt Schwaches zu produzieren. Meldung. |
| Kommentar-Sturm / rechtliche Beschwerde | **Sofortige Vollpause aller Kanäle des Mandanten**, Sofortmeldung. Bewusst überempfindlich. |
| Notbremse durch Uwe | Ein Feld setzen. Laufende Produktionen enden, nichts geht mehr live. Bereits Veröffentlichtes bleibt stehen. |

## 11 · Datenmodell (Skizze)

Alle Tabellen mit `mandant text not null` und RLS.

```
mandant           id, name, marke_json, budget_monat, pausiert
thema             id, mandant, titel, rubrik, punktzahl, signale_json,
                  zuletzt_verwendet_am, status
werk              id, mandant, thema_id, avatar, zustand, script_json,
                  faktencheck_json, kosten_cent, erstellt_am
ausspielung       id, werk_id, kanal, format, datei_pfad, cover_pfad,
                  caption, werbung bool, zustand, termin, live_url
pruefprotokoll    id, ausspielung_id, regel, bestanden, grund,
                  regelfassung, geprueft_am
kennzahl          id, ausspielung_id, zeitpunkt (24h/72h/14d),
                  views, watch_time_pct, klicks, anmeldungen, verkaeufe
bildlizenz        id, mandant, datei, quelle, urheber, lizenz,
                  werbung_erlaubt bool, nachweis_pfad
eingriff          id, mandant, ausloeser, aenderung_json, wirksam_ab
```

## 12 · Fahrplan

27 Tage bis Kampagnenstart, und die Website hat Vorrang. Die Reihenfolge folgt
dem **Risiko**: was ohne Aufsicht Schaden anrichten kann, kommt zuerst.

| Zeitraum | Was fertig wird |
|---|---|
| **bis 14.09.** | **Das Prüf-Tor allein.** CLI-Werkzeug, das ein fertiges Video prüft und ein Protokoll schreibt. Läuft zuerst im Handbetrieb neben Uwe — so zeigt sich, ob es die richtigen Dinge findet, bevor es entscheidet. |
| **bis 21.09.** | **Datenmodell + Disponent.** Vorgänge in Supabase, Upload und Terminierung für die 3 wichtigsten Kanäle. Vorrat für die ersten 3 Kampagnenwochen von Hand gefüllt — nicht vom Kundschafter. |
| **bis 30.09.** | **Intendant, Wochenbericht, Notbremse.** Kampagnenstart mit vorgefülltem Plan, echtem Prüf-Tor, automatischer Veröffentlichung. Kundschafter und Auswerter laufen mit, aber nur beobachtend. |
| **Oktober** | Kundschafter bekommt Entscheidungsrecht, Auswerter darf Gewichte verschieben. Restliche Kanäle dazu. Erst jetzt ist der Kreis geschlossen. |
| **November** | Zweiter Mandant als Datei, nicht als Umbau. Wenn §9 eingehalten wurde: ein Tag Arbeit. |

> **Ehrlicher Hinweis:** Ein vollständig autonomer Orchestrator in 27 Tagen —
> neben dem Website-Abschluss — ist nicht realistisch. Realistisch ist ein
> **hartes Prüf-Tor plus automatische Veröffentlichung eines von Hand gefüllten
> Plans**. Das nimmt ab Tag eins die Arbeit ab, die am 1. Oktober tatsächlich
> blockiert, und lässt die Autonomie im Oktober nachwachsen, während die
> Kampagne läuft.

## 13 · Offene Punkte (Entscheidung durch Uwe)

1. **Monatsbudget für Produktion** — entscheidet über Modellwahl und damit die
   Obergrenze der Frequenz.
2. **Zielwert je Kampagne** — ohne Zahl kann der Auswerter nicht entscheiden,
   ob verlängert oder gestoppt wird.
3. **Wer gibt gesperrte Werke frei**, wenn Uwe im Project-Director-Modus ist?
   Bleibt es bei ihm, ist das der einzige Punkt, an dem das System auf einen
   Menschen wartet.
4. **Zugänge:** Meta Graph (Instagram/Facebook), TikTok Content Posting API,
   YouTube Data API, Pinterest API, Loops.so. Freischaltungen dauern teils Tage
   — **der wahrscheinlichste Grund, warum der 1. Oktober rutscht.**
5. **Zweiter Geschäftsbereich** — grobe Richtung genügt. Ob er dieselben Kanäle
   bespielt, ändert den Zuschnitt des Disponenten.

---

## Anhang · Bestandsaufnahme im Repo

| Was | Wo | Zustand |
|---|---|---|
| Marken-DNA, Avatare, Constraints, Kanal-Frequenzen | `marketing_agent.txt` | vollständig, wird zur Regelquelle des Prüfers |
| Werbekennzeichnungs-Pflicht (LG Köln 12.05.2026) | ebd., Abschnitt WERBEKENNZEICHNUNG | als Prosa vorhanden → muss Code werden |
| Projektformat für ein Video | `video/kerntemperatur-tiktok/` | Muster für die Regie-Schnittstelle, inkl. Faktencheck-Struktur |
| Toolkit mit Skills und Tools | `../claude-code-video-toolkit/` | extern, wird gesteuert, nicht geändert |
| Marken-/Stimmprofil | `../claude-code-video-toolkit/brands/steakakademie/` | `brand.json`, `voice.json`, Logo-Assets vorhanden |
| Bildmaterial mit Lizenzlage | `../_bilder-fundgrube/` | Quellen im Dateinamen kodiert → in `bildlizenz`-Tabelle überführen |
