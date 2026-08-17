# Personal-Coaching in der Gründer-Schmiede — Spezifikation

**Stand:** 17.08.2026 · **Entscheider:** Uwe · **Status:** Spezifikation, nichts gebaut

Entscheidungen aus einer Claude-Code-Sitzung, die nirgends persistiert wurden. Dieses
Dokument ist ab jetzt die Quelle — die Datenbank ist die operative Wahrheit, dieses
Dokument die Begründung dazu.

---

## 1. Produkt

Personal-Coaching als **Zusatzbuchung innerhalb** der Gründer-Schmiede (99 €), nicht als
eigenes Produkt und nicht als Abo. Stundenpakete, einmalig zahlbar, vom Kunden autonom
in Termine umgesetzt.

| Paket | Preis | Preis/Stunde |
|---|---|---|
| 3 Stunden | 387,00 € | 129,00 € |
| 5 Stunden | 595,00 € | 119,00 € |
| 7 Stunden | 693,00 € | 99,00 € |
| 10 Stunden | 890,00 € | 89,00 € |

Die Degression ist sauber und monoton (129 → 119 → 99 → 89). Der größte Sprung liegt
zwischen 5 und 7 Stunden — das ist die Stufe, die im Verkauf beworben werden sollte.

**Geschäftslogik-Hinweis:** Das kleinste Paket ist knapp das Vierfache des Kursprei­ses.
Der Kurs ist damit der Einstieg, das Coaching der eigentliche Umsatzträger. Das ist
tragfähig, sollte aber in der Preiskommunikation nicht wie ein Nachgedanke aussehen.

---

## 2. Befund: Quenza kann das nicht allein

Geplant war „Coaching findet online mit Quenza statt" plus „direkte Kalender-Anbindung
zur autonomen Terminbuchung". **Quenza leistet beides nicht.**

Quenza (PositivePsychology.com) ist eine Plattform für die Arbeit *zwischen* Sitzungen:
Activities (200+ Übungen und eigene Formulare), Programs, Client Portal, Chat, Notes,
Tasks, File Sharing, White Label. Es gibt **keine Videokonferenz** und **keinen
Buchungskalender**. Die Integrationsliste nennt Kalender-Anbindung, aber als Anbindung
an externe Kalender, nicht als eigene Terminvergabe.

Konsequenz: Es braucht drei Werkzeuge statt einem.

| Aufgabe | Werkzeug |
|---|---|
| Autonome Terminbuchung 08–17 Uhr | Buchungstool (Cal.com empfohlen) |
| Die Sitzung selbst | Videokonferenz (Meet/Zoom, über das Buchungstool erzeugt) |
| Arbeit zwischen den Sitzungen, Aufgaben, Notizen | Quenza |
| Fragebogen nach Kauf | siehe Abschnitt 4 — Empfehlung: in der eigenen App |

**Empfehlung Buchungstool: Cal.com.** Open Source, selbst hostbar oder als EU-Cloud,
Verfügbarkeitsfenster und Puffer frei konfigurierbar, API zum Setzen von Kontingenten,
erzeugt den Videolink automatisch. Calendly ist bequemer, aber US-Hosting und teurer
pro Sitz.

---

## 3. Das eigentliche Kernstück: das Stundenkonto

Wer Stundenpakete verkauft, verkauft ein **Guthaben**, keinen Termin. Ein Buchungstool
allein kennt kein Guthaben — es kennt nur freie Slots. Ohne Gegenbuchung könnte ein
Kunde mit 3 gekauften Stunden zwanzig Termine legen.

Es braucht daher ein Konto pro Kunde:

- Kauf schreibt Stunden **gut** (Webhook von Digistore24)
- Bestätigte Buchung schreibt Stunden **ab**
- Storno innerhalb der Frist schreibt **zurück**
- Buchungslink ist nur erreichbar, solange Restguthaben > 0
- Kunde sieht sein Restguthaben jederzeit im Konto

Das ist derselbe Mechanismus wie beim Gutschein-System — die Logik lässt sich
weiterverwenden.

---

## 4. Fragebogen nach dem Kauf

Zweck: Uwe weiß vor der ersten Sitzung, wer da sitzt und woran gearbeitet wird. Damit
ist die erste Stunde Arbeit statt Aufwärmen.

**Empfehlung: in der eigenen App, nicht in Quenza.** Grund: Der Fragebogen muss die
Terminbuchung freischalten. Läge er in Quenza, wäre der Status in einem Fremdsystem und
die App könnte die Buchung nicht davon abhängig machen. Die Antworten können danach nach
Quenza übertragen werden.

**Felder (Vorschlag):**

*Person und Kontext*
- Name, E-Mail (aus dem Kauf vorbelegt)
- Telefon (optional, für Ausfall am Sitzungstag)
- Berufliche Situation: angestellt / nebenberuflich selbstständig / hauptberuflich / in Gründung / arbeitssuchend
- Wie lange schon selbstständig bzw. geplanter Start

*Das Projekt*
- Worum geht es? (Freitext, Pflicht)
- Branche/Nische
- Gibt es schon Kunden? Wenn ja, wie viele
- Website/Profil vorhanden? (URL, optional)
- Was ist bereits versucht worden und hat nicht funktioniert? (Freitext)

*Das Ziel*
- Was soll nach den gebuchten Stunden anders sein? (Freitext, Pflicht)
- Größter Engpass aus eigener Sicht: Angebot / Preis / Sichtbarkeit / Erstkontakt / Abschluss / Organisation / weiß nicht
- Dringlichkeit: Wann muss das Ergebnis stehen

*Organisatorisches*
- Bevorzugte Tageszeit innerhalb 08–17 Uhr
- Womit soll die erste Stunde beginnen? (Freitext)

Pflichtfelder sparsam halten — drei Freitextfelder sind die Substanz, alles andere ist
Auswahl. Wer nach dem Kauf ein Formular mit zwanzig Pflichtfeldern sieht, bricht ab.

---

## 5. Kalender-Regeln

- **Zeitfenster:** Montag–Freitag, 08:00–17:00 Uhr, Zeitzone **Europe/Berlin** fest
  hinterlegen (nicht Browser-Zeitzone — sonst bucht jemand aus Wien 17:30)
- **Sitzungslänge:** zu klären — 60 Minuten als Einheit ist die einfachste Zuordnung
  zum Stundenkonto. 90-Minuten-Blöcke wären inhaltlich oft besser, brauchen dann aber
  Halbstunden-Verrechnung
- **Vorlaufzeit:** mindestens 24 Stunden, damit Uwe den Fragebogen vorher lesen kann
- **Puffer:** 15 Minuten zwischen Sitzungen
- **Maximal offen:** wie viele Termine darf ein Kunde gleichzeitig im Voraus legen?
  Vorschlag: 2 — verhindert, dass jemand sein ganzes Paket in eine Woche legt
- **Absage:** kostenfrei bis 24 Stunden vorher, danach verfällt die Stunde. Muss in den
  Bedingungen stehen, sonst nicht durchsetzbar
- **Feiertage NRW** im Kalender blocken
- **Urlaub** blockbar, ohne dass Guthaben verfällt

---

## 6. Datenmodell (Vorschlag, nicht angelegt)

```
coaching_packages     slug, hours, price, active
                      → 4 Zeilen, Preise NIE hardcoden (Preisangabenverordnung,
                        gleiche Regel wie /ehrliches-system)

coaching_accounts     user_id, hours_purchased, hours_used, hours_remaining (generiert),
                      valid_until, created_at

coaching_intake       user_id, alle Felder aus Abschnitt 4, submitted_at
                      → Buchung erst freigeschaltet wenn submitted_at gesetzt

coaching_sessions     user_id, starts_at, duration_minutes, status
                      (gebucht/durchgeführt/abgesagt/verfallen),
                      external_booking_id (Cal.com), video_url, notes_ref (Quenza)
```

Die Preise gehören in `coaching_packages`, nicht in die TSX. `/prive` macht es derzeit
falsch (Preise hart im Code) — beim Bauen gleich mitziehen.

---

## 7. Beschreibungstext (Entwurf, kundenseitig)

> ### Wenn du nicht weiterkommst, reden wir.
>
> Die Gründer-Schmiede gibt dir das System. Manchmal ist die Frage aber nicht, was zu
> tun ist — sondern warum es bei dir nicht funktioniert. Dafür gibt es das Coaching.
>
> Kein Kurs, kein Skript, kein Motivationsgespräch. Wir setzen uns online zusammen und
> arbeiten an deinem Fall: dein Angebot, dein Preis, dein Erstkontakt, deine Zahlen.
> Ich sage dir, was ich sehe — auch wenn es nicht das ist, was du hören willst.
>
> **So läuft es ab.** Du buchst ein Stundenpaket. Danach beantwortest du einen kurzen
> Fragebogen zu dir und deinem Projekt — damit die erste Stunde Arbeit ist und nicht
> Vorstellungsrunde. Anschließend legst du deine Termine selbst, wann es dir passt,
> montags bis freitags zwischen 08 und 17 Uhr. Zwischen den Sitzungen bekommst du
> Aufgaben und Material in deinem persönlichen Bereich.
>
> **Deine Stunden gehören dir.** Kein Abo, keine Laufzeit, keine automatische
> Verlängerung. Du buchst so viele Stunden, wie du brauchst, und verteilst sie über den
> Zeitraum, der zu deinem Projekt passt.
>
> Wer mit drei Stunden anfängt, kann jederzeit aufstocken.

*Anzupassen an die tatsächlichen Bedingungen — insbesondere „keine Laufzeit" darf nur
stehen, wenn die Gültigkeit auch wirklich unbefristet oder auf die gesetzliche
Verjährung gesetzt ist (siehe offene Punkte).*

---

## 8. Offene Entscheidungen — gehören zu Uwe

Alles hier ist Geld oder Recht und wird nicht ohne Freigabe gebaut.

1. **Umsatzsteuer.** Die Kursseite sagt „inkl. MwSt." — gilt das auch für die
   Coaching-Pakete? Dann sind 387 € brutto und der Nettoerlös liegt bei 325,21 €.
   Muss auf der Seite genauso ausgewiesen werden.
2. **Widerrufsrecht.** Bei Dienstleistungen 14 Tage. Findet eine Sitzung innerhalb
   dieser Frist statt, braucht es vorher die ausdrückliche Zustimmung des Kunden zum
   vorzeitigen Beginn **und** seine Kenntnisnahme, dass das Widerrufsrecht damit
   erlischt (§ 356 Abs. 4 BGB). Ohne diesen Schritt kann ein Kunde nach drei Sitzungen
   widerrufen und alles zurückverlangen. Das ist der teuerste offene Punkt.
3. **Gültigkeit der Stunden.** Unbefristet, oder Verjährungsende nach § 195 BGB wie beim
   Gutschein? Die Antwort entscheidet über den Satz „keine Laufzeit" im Beschreibungstext.
4. **Ausfallregel.** 24-Stunden-Frist wie vorgeschlagen? Muss in die Bedingungen, sonst
   nicht durchsetzbar.
5. **Sitzungslänge.** 60 oder 90 Minuten (siehe Abschnitt 5).
6. **Quenza und DSGVO.** US-Anbieter. Es braucht einen Auftragsverarbeitungsvertrag und
   eine tragfähige Transfergrundlage, bevor Kundendaten dort landen. Vorher nicht
   einsetzen.
7. **Buchungstool.** Cal.com (Empfehlung) oder Alternative — Entscheidung mit
   Kostenfolge.
8. **Kapazität.** Zehn Pakete à 10 Stunden sind 100 Stunden Lieferverpflichtung. Wie
   viele Coaching-Stunden pro Woche sind realistisch, und soll der Verkauf begrenzt
   werden, wenn die Kapazität erreicht ist?

---

## 9. Reihenfolge beim Bauen

1. Tabellen und Preise in Supabase (Punkt 1 geklärt)
2. Digistore24-Produkte + Zusatzbuchung im Checkout, Webhook auf das Stundenkonto
3. Fragebogen mit Buchungs-Freischaltung
4. Cal.com anbinden, Gegenbuchung ans Stundenkonto
5. Beschreibungsabschnitt auf `/gruender-schmiede` (vor `#kaufen`)
6. Rechtstexte: Widerrufsbelehrung, Ausfallregel, Gültigkeit
7. Quenza erst zuletzt, nach geklärtem AVV
