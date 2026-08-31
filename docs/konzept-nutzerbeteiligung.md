# Konzept — Nutzerbeteiligung bei den Streitfällen

Ziel: Interaktion und Wiederkehr erzeugen, ohne einen Kommentarbereich zu betreiben.
Leitgedanke: **Nichts geht live, was nicht freigegeben wurde — und der größte Teil der
Beteiligung braucht überhaupt keine Freigabe.**

---

## 1. Zwei Stufen, bewusst getrennt

### Stufe 1 — Die Umfrage (moderationsfrei)

Unter jedem Streitfall genau eine Frage mit zwei bis drei festen Antworten.

> **Und wie machst du es?**
> ○ Unmittelbar vor dem Auflegen
> ○ Mindestens 45 Minuten vorher
> ○ Erst nach dem Grillen

Ein Klick, fertig. Danach erscheint das Ergebnis als Balken mit Prozentwerten und
Gesamtzahl: *„62 % von 1.240 Grillern salzen unmittelbar vor dem Auflegen."*

**Warum das der Kern ist:** Es gibt keinen Freitext, also gibt es nichts zu moderieren.
Es kostet nichts pro Nutzung. Es erzeugt eine Zahl, die selbst Inhalt ist, die man teilen
kann und die einen Grund gibt wiederzukommen. Und es ist die Ein-Tipp-Interaktion, die
eine junge Zielgruppe macht — ein Kommentarformular füllt sie nicht aus.

**Sichtbarkeit:** Das Ergebnis ist öffentlich, auch ohne Anmeldung — es ist Inhalt und
soll von Google gelesen werden. **Abstimmen erfordert Anmeldung.** Das verhindert
Mehrfachabstimmung und treibt Registrierungen.

### Stufe 2 — Der Erfahrungsbericht (Warteschlange)

Optional darunter ein kurzes Freitextfeld, maximal 600 Zeichen, ein Beitrag pro Nutzer
und Streitfall, nur für Angemeldete.

**Nichts davon erscheint automatisch.** Alles landet in einer Liste im Admin-Bereich.
Der Betreiber liest gelegentlich durch und gibt einzelne Beiträge frei. Freigegebene
erscheinen unter dem Artikel als **„Stimmen aus der Praxis"**, mit Vorname und Ort.

Damit ist die Warteschlange selbst der Filter. Keine Prüfsoftware nötig, keine Kosten pro
Einsendung, kein Wettlauf gegen Beleidigungen, die kein Wörterbuch erkennt.

**Der Preis dieser Lösung, offen gesagt:** Was du freigibst, veröffentlichst du. Damit
bist du inhaltlich verantwortlich, nicht mehr nur Gastgeber. Das ist der Grund, warum
Stufe 2 nachrangig ist und Stufe 1 zuerst gebaut wird.

---

## 2. Datenmodell (Supabase)

```sql
-- Eine Stimme pro Nutzer und Streitfall. Der Unique-Index ist die gesamte
-- Missbrauchsabwehr — keine Rate-Limits, keine Captchas nötig.
create table streitfall_votes (
  id           bigserial primary key,
  slug         text        not null,
  option_key   text        not null,
  user_id      uuid        not null references auth.users(id) on delete cascade,
  created_at   timestamptz not null default now(),
  unique (slug, user_id)
);

create table streitfall_beitraege (
  id             bigserial primary key,
  slug           text        not null,
  user_id        uuid        not null references auth.users(id) on delete cascade,
  text           text        not null check (char_length(text) between 20 and 600),
  status         text        not null default 'neu'
                             check (status in ('neu','freigegeben','abgelehnt')),
  anzeigename    text,        -- vom Betreiber gesetzt, z. B. "Thomas aus Kassel"
  freigegeben_am timestamptz,
  created_at     timestamptz not null default now(),
  unique (slug, user_id)
);
```

**Row Level Security:**

- `votes`: Einfügen nur mit eigener `user_id`. Lesen niemand direkt — das Ergebnis kommt
  aus einer aggregierten Ansicht, damit kein Nutzer sieht, wer wie abgestimmt hat.
- `beiträge`: Einfügen nur mit eigener `user_id`. Lesen nur den eigenen Beitrag, plus
  alle mit `status = 'freigegeben'`.

```sql
create view streitfall_ergebnis as
  select slug, option_key, count(*) as stimmen
  from streitfall_votes group by slug, option_key;
```

Ein Insert, eine aggregierte Abfrage. Mehr passiert nicht.

---

## 3. Wo es auf der Seite steht

Unter dem Merksatz, vor den häufigen Fragen. Also **nach** der Entscheidung — der Nutzer
soll erst die Antwort mit 30 Jahren Praxis lesen und dann sagen, wie er es selbst macht.
Umgekehrt wäre es eine Abstimmung über die Wahrheit, und das ist es ausdrücklich nicht.

Die Antwortmöglichkeiten kommen aus dem Frontmatter des jeweiligen Streitfalls:

```yaml
umfrage:
  frage: "Und wie machst du es?"
  optionen:
    - key: sofort
      label: "Unmittelbar vor dem Auflegen"
    - key: lange
      label: "Mindestens 45 Minuten vorher"
    - key: danach
      label: "Erst nach dem Grillen"
```

Kein Streitfall ohne `umfrage` bekommt einen Block — das Feld bleibt optional.

---

## 4. Moderation

Eine Liste unter `/admin/beitraege`. Der Bereich ist bereits durch die bestehende
Middleware geschützt. Pro Eintrag: Text, Streitfall, Datum, drei Schaltflächen —
freigeben, ablehnen, löschen. Beim Freigeben wird der Anzeigename gesetzt.

Kein E-Mail-Versand, keine Benachrichtigung an den Einsender. Wer etwas schreibt, sieht
den Hinweis: *„Danke. Beiträge werden gelegentlich gesichtet, veröffentlicht wird nur
eine Auswahl."* Keine Erwartung, die du erfüllen musst.

---

## 5. Rechtliches — kein Ersatz für anwaltliche Prüfung

Ich bin kein Anwalt. Was ich sehe:

- **Nichts erscheint ohne Freigabe.** Damit greift die klassische Störerhaftung für fremde
  Inhalte weitgehend nicht — es gibt keine unbekannten Inhalte auf der Seite. Der
  Preis ist, dass du für Freigegebenes selbst geradestehst.
- **Nutzungsbedingungen** für Beiträge nötig: Einräumung von Nutzungsrechten, Hinweis auf
  die Auswahlfreiheit, kein Anspruch auf Veröffentlichung.
- **Meldemöglichkeit** für veröffentlichte Beiträge, plus Kontaktstelle. Der Digital
  Services Act stellt Anforderungen an Hosting-Dienste; Kleinstunternehmen sind von einem
  Teil befreit, nicht von allem.
- **DSGVO:** Stimmen und Beiträge hängen an der `user_id`. Bei Kontolöschung fallen sie
  über `on delete cascade` mit weg. Anzeigename nur mit Vorname und Ort, kein Nachname.
- **Vor dem Livegang von Stufe 2** einmal anwaltlich prüfen lassen. Stufe 1 ist deutlich
  unkritischer, weil sie keine fremden Texte veröffentlicht.

---

## 6. Kosten

Umfrage: null pro Nutzung. Ein Datenbankeintrag, eine Abfrage.
Freitext: null pro Einsendung, weil kein Modell prüft — du prüfst.
Supabase deckt das im vorhandenen Tarif ab.

Das ist der ganze Punkt. Ein KI-Filter pro Einsendung hätte laufende Kosten, die mit dem
Erfolg steigen — dasselbe Problem wie beim Kühlschrank-Tool.

---

## 7. Was ausdrücklich nicht gebaut wird

- Kein Kommentarbereich, keine Antworten auf Antworten, keine Diskussionsstränge.
- Keine Bewertungen von Beiträgen, kein Hoch- und Runterstimmen.
- Keine Benachrichtigungen. Nichts, was dich in eine Antwortpflicht bringt.
- Keine automatische Textprüfung. Die Warteschlange ist der Filter.

Jeder dieser Punkte klingt nach mehr Beteiligung und ist in Wahrheit eine Verpflichtung,
die nie wieder endet.

---

## 8. Reihenfolge

1. **Umfrage** — Tabelle, Ansicht, Komponente, Frontmatter-Feld. Läuft ohne Stufe 2.
2. **Ergebniszahl im Text verwenden** — sobald genug Stimmen da sind, wandert sie in den
   Artikel selbst. Eine Zahl aus der eigenen Leserschaft hat kein Wettbewerber.
3. **Freitext plus Warteschlange** — erst wenn Stufe 1 läuft und die Nutzungsbedingungen
   stehen.
4. **„Stimmen aus der Praxis"** unter dem Artikel.

Stufe 1 ist überschaubar. Stufe 2 ist die Stelle, an der aus einem Feature eine Pflicht
wird — die würde ich erst angehen, wenn die Streitfälle inhaltlich stehen.

---

## 9. Status der Umsetzung

**Stufe 2 implementiert am 30.08.2026, hinter dem Feature-Flag
`STREITFALL_BEITRAEGE_ENABLED`** (nur bei Wert `'1'` wird die Komponente auf der
Streitfall-Seite überhaupt gerendert — serverseitig geprüft). Bestandteile:
Migration `supabase/migrations/20260830130000_streitfall_beitraege.sql`
(Tabelle `streitfall_beitraege`, RLS: Insert nur eigener Beitrag mit Status
`neu`, lesbar nur Freigegebenes plus der eigene Beitrag, kein Client-Update/-Delete),
API `POST /api/streitfall-beitrag`, Komponente
`src/components/streitfaelle/StreitfallBeitraege.tsx` („Stimmen aus der
Praxis"), Moderation unter `/admin/beitraege` (+ `/api/admin/beitraege`,
Service-Role, `admin_auth`-Cookie). Abweichung zum Entwurf in Abschnitt 2: Der
Anzeigename („Thomas aus Kassel") wird vom Nutzer bei der Einsendung angegeben
und bei der Freigabe redaktionell mitgeprüft, statt vom Betreiber nachträglich
gesetzt.

**Offen vor dem Livegang:** anwaltliche DSA-Prüfung + Nutzungsbedingungen-Update
(Abschnitt 5). Erst danach setzt Uwe das Flag.
