# Loops — Konfigurationsstand (Audit 20.08.2026)

Team: `Steakakademie` (`cmpfjky941x0e0jy5g2dv77kf`)

## Transaktionale Templates → Env-Variablen

| Env-Variable | Template-ID | Name in Loops | Published | Variablen |
|---|---|---|---|---|
| `LOOPS_DOI_TEMPLATE_ID` | `cmsufizv80g7a0jyvr6gwgtzq` | DOI Bestätigung Wissens-Brief | ja | `confirmUrl` |
| `LOOPS_MAGIC_LINK_TEMPLATE_ID` | `cmpr6ctsj034n0j1augvw7puo` | LogIn Link | ja | `magic_link` |
| `LOOPS_WIDERRUF_TEMPLATE_ID` | `cmpus12wa2hm60jxk0ek9c6f2` | Widerruf — Eingangsbestätigung | ja | `datum`, `Zeit`, `product`, `order_ref` |
| `LOOPS_KONTAKT_TEMPLATE_ID` | `cmt1yg44p0cln0k090q9kifkn` | Kontaktformular — Eingang (an Postfach) | ja | `name`, `absender`, `thema`, `datum`, `zeit`, `nachricht`, `betreff_tag` |
| `LOOPS_VOUCHER_TEMPLATE_ID` | `cmpfkyigy0bw401dneu24vuo2` | Gutschein — Zustellung nach Kauf | ja | `voucher_code`, `voucher_url`, `course_title` |

**KORREKTUR 21.08.2026:** Produktion läuft auf **Vercel**, nicht Netlify
(verifiziert: `server: Vercel` auf steakakademie.de). Env-Variablen gehören in
das Vercel-Dashboard; der folgende Netlify-Abgleich ist damit gegenstandslos
und bleibt nur als Protokoll stehen. Netlify baut als Altlast weiter bei jedem
Push mit — Rückbau geplant.

**Netlify-Abgleich 20.08.2026 (obsolet, s. o.):** `LOOPS_VOUCHER_TEMPLATE_ID` und
`LOOPS_WIDERRUF_TEMPLATE_ID` fehlten in den Netlify-Env-Variablen; das
Voucher-Template war leer/unveröffentlicht (inzwischen geschrieben und published,
Test-Preview verschickt). `LOOPS_KONTAKT_TEMPLATE_ID` existierte in Netlify,
bevor das Template angelegt wurde — Wert auf `cmt1yg44p0cln0k090q9kifkn` prüfen/setzen.
Alle Env-Änderungen wirken erst nach reaktivierten Builds + Deploy
(Builds gestoppt seit 13.08., 98 Commits nicht live).

## Workflows

| ID | Name | Status |
|---|---|---|
| `cmt1wxrmn07uo0j0aofqglkmv` | Willkommenssequenz Wissens-Brief | **Sending** (aktiv seit 20.08.2026) |
| `cmr0ayxxf066d0jzrzlx3wvwn` | Wöchentlicher Newsletter | **defekt** — Node `n3` liefert HTTP 500, Loops-Ticket #20060 |
| `cmpfkykpz0bw701dndvv296g6` | Starte dein Steak-Diplom | Draft seit 21.05.2026 — zum Löschen vorgesehen |

## Kampagnen

| ID | Name | Status |
|---|---|---|
| `cmpfkylb50bw901dndiv5u3o2` | Werde Master of Steak | Draft seit 21.05.2026 — zum Löschen vorgesehen |

## Nur in der UI löschbar

Die Loops-API hat **keine** DELETE-Endpunkte für Workflows, Kampagnen oder
transaktionale Templates (alle drei antworten mit HTTP 405). Löschen geht
ausschliesslich über app.loops.so.

Zu löschen:
- Workflow „Starte dein Steak-Diplom" (`cmpfkykpz0bw701dndvv296g6`)
- Kampagne „Werde Master of Steak" (`cmpfkylb50bw901dndiv5u3o2`)
- Template „Blank transactional" `cmt1sqdw80fe20jwexf3ok3kg` (leer, unveröffentlicht)
- Template „Blank transactional" `cmptu8cci090h0jt92hfoq93h` (leer, unveröffentlicht)
- Template „Blank transactional" `cmpoh96s500760jxktp9k1pcb` (leer, aber published — laut Netlify-Abgleich zeigt keine LOOPS_*-Variable darauf, sofern KONTAKT korrigiert wird)

## Sonstiges

- Keine Mailing Lists, keine Audience Segments — Segmentierung läuft über den
  `source`-Filter (siehe Willkommenssequenz).
- Custom Contact Property: `doiConfirmedAt` (string).
