# PM-Status-Generator — Entwurf und Betriebsregeln

> Status: Ebene 1–3 gebaut, zwei von acht Bereichen migriert (Avatar-System,
> Tech-Stack & Tools). Stand 13.08.2026.

Dieses Dokument legt fest, **was** der Generator misst und **warum** er es so
misst. Die Kriterien selbst stehen in `data/pm-status-kriterien.yaml`, der Code
in `scripts/generate-pm-context.mjs`, das Ergebnis in
`src/lib/pm-agent-context.generated.ts`.

## Vorgeschichte: der Fehler, der das ausgelöst hat

Bis August 2026 enthielt `pm-agent-context.generated.ts` Bereichsprozente aus
einem einmaligen Lauf vom 25.06.2026. Zwei davon — „Auth & Community 0 %" und
„Agenten & Automation 0 %" — hat das Konsistenz-Audit vom 10.08.2026 als
nachweislich falsch belegt (CLAUDE.md §1).

Die Nullen bedeuteten nie „0 % fertig". Sie bedeuteten **„nicht gemessen"**.
Das Datenformat konnte den Unterschied nicht ausdrücken, und so wurde aus einer
fehlenden Messung eine Tatsachenbehauptung — im Admin-Dashboard als Balken, im
System-Prompt des PM-Agenten als Fakt.

Zwei weitere Befunde aus derselben Untersuchung:

- Der Generator `generate-pm-context.js`, auf den sich der Dateikopf berief,
  lag nicht im Repo und war **nie committet**. Die Datei wurde faktisch von
  Hand gepflegt.
- Die vier Listen (`completed`, `critical`, `next`, `open`) enthielten 76
  Einträge mit inneren Widersprüchen: „Physisches Diplom" stand gleichzeitig
  in `completed` und `open`, „Supabase Auth abschließen" in `critical` **und**
  `next`, obwohl Auth live ist. `critical` zählte 19 Einträge, während
  CLAUDE.md §5 fünf Blocker führt — der Prompt behauptete dem Agenten
  gegenüber „19 kritische Blocker".

Daraus folgen die Regeln unten. Sie sind keine Stilfragen.

## Die drei Ebenen

**Ebene 1 — Fakten.** Interpretationsfreie Messungen. Eine Zahl oder ein
Boolean, den zwei Personen unabhängig gleich ermitteln. Vier Quellen:

| Quelle | Beispiele |
|---|---|
| Repo | Dateien, Routen, Frontmatter, Konfigurationswerte |
| Lokale Tools | `npm audit --json`, `tsc --noEmit`, `npm ls` |
| GitHub-API | Workflow-Läufe und ihre Ergebnisse |
| DNS / HTTP | NS-, MX-, TXT-Records, `server`-Header der Live-Seite |

**Ebene 2 — Kriterien.** Falsifizierbare **Sätze**, je auf genau einen Fakt
gestützt. Keine Substantive: „Supabase" kann weder wahr noch falsch sein,
„Jeder Avatar-Zustand hat ein Video-Asset" schon.

**Ebene 3 — Score.** `erfüllt ÷ prüfbar`, pro Bereich und gesamt. Nie ohne
Nenner ausgeliefert.

## Regel 1: Drei Zustände, nicht zwei

Jedes Kriterium ist `erfuellt`, `nicht_erfuellt` oder **`nicht_messbar`**.

Nicht-messbare Kriterien fallen aus dem Nenner. Sie zählen **nicht** als
nicht erfüllt. Ohne diese Regel entsteht wieder eine Null, die „nicht
gemessen" heißt und als „0 % fertig" gelesen wird.

## Regel 2: Fehlschlag ist kein Ergebnis

Ein DNS-Timeout, eine nicht erreichbare API, ein abgestürztes Tool ergeben
`nicht_messbar` — niemals `nicht_erfuellt`.

Dieser Fehler ist im Projekt schon einmal passiert: Am 09.08.2026 meldete
`direct_clip_search` `clips: [], errors: []`, obwohl in Wahrheit die
Netzverbindung gesperrt war. Der Fehlschlag wurde still als „0 Treffer"
verbucht (siehe memory.md).

## Regel 3: Fehlgeschlagenes Parsen bricht ab

Findet der Generator die Blocker-Sektion in CLAUDE.md nicht — Überschrift
umbenannt, Format geändert —, schreibt er **keine leere Liste**, sondern
beendet sich mit Exit-Code 1. Eine leere Blockerliste würde dem Agenten
„null Blocker" erzählen, also das Gegenteil der Wahrheit.

Dasselbe gilt für jede andere Quelle, deren Struktur sich ändern kann.

## Regel 4: Kriterien sind Daten, nicht Code

Die Kriterien leben in `data/pm-status-kriterien.yaml`. Eine
Definitionsänderung ist damit ein lesbarer Content-Diff, kein Code-Review.
Der Generator hält nur die Prüf-Implementierungen unter ihrer `pruefung`-ID.

Ein Kriterium ohne zugeordnete Prüfung ist ein harter Fehler — sonst
verschwindet es still aus dem Nenner.

## Die Felder

| Feld | Herkunft |
|---|---|
| `bereiche` | Gemessene Bereiche: Score, Zähler, Nenner, alle Einzelkriterien mit Beleg |
| `nichtGemessen` | Bereiche ohne Kriterienkatalog. **Explizit gelistet, nicht weggelassen** — sonst sieht das Dashboard vollständig aus, obwohl es sechs Achtel nicht kennt |
| `critical` | Geparst aus **CLAUDE.md §5**. Bereits menschlich kuratiert, priorisiert, versioniert |
| `completed` | Abgeleitet: Kriterien mit Status `erfuellt` |
| `open` | Abgeleitet: Kriterien mit Status `nicht_erfuellt` |
| `readinessScore` | `null`, solange nicht alle acht Bereiche migriert sind |

`completed` und `open` sind damit **zwei Sichten auf einen Datensatz**. Ein
Eintrag kann nicht mehr in beiden stehen — das ist strukturell ausgeschlossen,
nicht bloß einmalig korrigiert.

`next` entfällt ersatzlos. Priorisierung ist ein Urteil, kein Repo-Fakt, und
CLAUDE.md §5 ist bereits nach Priorität nummeriert. Eine zweite, handgepflegte
Reihenfolge war genau das Artefakt, das verrottet ist.

## readinessScore: über Kriterien, nicht über Bereiche

Sobald alle acht Bereiche migriert sind, gilt

```
readinessScore = erfüllte Kriterien (gesamt) ÷ prüfbare Kriterien (gesamt)
```

**Nicht** der Mittelwert der acht Bereichsprozente. Der würde einen Bereich mit
vier Kriterien genauso stark gewichten wie einen mit zwanzig.

Ausgeliefert wird nie die nackte Zahl, sondern immer mit Nenner:
„52 % (37 von 71 prüfbaren Kriterien, 6 nicht messbar)". Damit bekommt auch das
„Ziel 80 %" im Agenten-Prompt zum ersten Mal eine überprüfbare Bedeutung.

Bis dahin bleibt das Feld `null`. Eine fehlende Kennzahl ist ehrlicher als eine
erfundene — und `null` zwingt Dashboard und Prompt, den Zustand zu benennen,
statt eine Zahl zu zeigen.

## Was bewusst nicht gemessen wird

Ersatzlos gestrichen, weil außerhalb des Repos und nicht automatisch prüfbar:
„Sitemap bei Google eingereicht" (die DNS-Verifikation ist prüfbar, die
Einreichung selbst nur über die GSC-API), „Physisches Diplom", die
Social-Accounts, „Portraits generieren", „CLAUDE.md Mindmap-Hook" (liegt in
`~/.claude`, nicht im Repo), sowie alle Substantiv-Einträge ohne Aussage.

Von 25 `completed`-Einträgen überlebt rund ein Drittel als geprüftes Kriterium.
Das ist beabsichtigt: eine kürzere Liste, in der jeder Eintrag stimmt, ist mehr
wert als 25, von denen einer den falschen Hoster nennt — siehe unten.

## Was von außen prüfbar ist (DNS/HTTP)

Am 13.08.2026 gemessen:

| Prüfung | Befund |
|---|---|
| NS | `rohin.ns.cloudflare.com`, `zita.ns.cloudflare.com` → Cloudflare DNS bestätigt |
| MX | `route1/2/3.mx.cloudflare.net` → Cloudflare Email Routing aktiv |
| SPF | `v=spf1 include:_spf.mx.cloudflare.net ~all` — **kein Loops-Include** |
| DMARC | `v=DMARC1; p=none` — vorhanden, aber nur Monitoring |
| GSC | `google-site-verification=…` als TXT → Search Console verifiziert |
| Hosting | `server: Vercel`, `x-vercel-id: fra1::…` |

Zwei Konsequenzen:

1. **Der Eintrag „Netlify Hosting" war falsch.** Die Seite läuft auf Vercel.
   Im Repo liegen `netlify.toml` und `vercel.json` nebeneinander; die
   Netlify-Datei ist ein Überbleibsel. Ein handgepflegter Eintrag hat monatelang
   den falschen Hoster behauptet.
2. **Die Search-Console-API ist verfügbar.** Die Verifikation liegt nicht als
   Meta-Tag im Repo, sondern als DNS-TXT — eine Repo-Suche findet sie nicht.
   Für „SEO & Traffic" sind damit echte Messwerte erreichbar, ebenso GA4.

## Migrationsreihenfolge

Begonnen wurde mit **Avatar-System** und **Tech-Stack & Tools**, weil beide
ihren Nenner bereits mitbringen: der Zustandsautomat definiert acht Zustände,
`npm audit` liefert JSON. Dort ließ sich das Format an echten Daten prüfen,
bevor die strittigen Bereiche drankommen.

Offen: SEO & Traffic · Monetarisierung · Content-Strategie · Technische
Infrastruktur · Kurse & Diplom · KI-System & Automation.

Für „Content-Strategie" ist vorher zu klären, woraus der Nenner kommt — es gibt
weder Keyword-Map noch Redaktionsplan als Datei. Ohne beides ist der Bereich
nicht ehrlich zu bepunkten und bleibt besser `nichtGemessen`.

## Betrieb

```bash
npm run pm:context            # misst und schreibt die generierte Datei
npm run pm:context -- --offline   # überspringt Netz-Prüfungen (→ nicht_messbar)
npm run pm:context -- --check     # schreibt nichts, Exit 1 bei Abweichung (CI)
```

Der Generator ist idempotent: gleicher Repo-Stand, gleiches Ergebnis. Einzige
Ausnahme ist das Feld `generatedAt`, das im `--check`-Modus ignoriert wird.
