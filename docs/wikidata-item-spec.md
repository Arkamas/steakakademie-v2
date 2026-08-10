# Wikidata-Item „Steakakademie" — fertige Spec zum Eintragen

> ✅ **ERLEDIGT 07.07.2026: Item angelegt = [Q140455747](https://www.wikidata.org/wiki/Q140455747)**
> (via API, Account „Yendell", ALLE Statements inkl. YouTube-Kanal-ID
> UCJONYPqtOUubc78rZ5sc-Hg, DPMA-Referenz an P31 + P856).
> sameAs in `src/lib/schema.ts` verdrahtet. Nichts mehr offen.

## ⚠️ Ehrlicher Risiko-Hinweis (vorher lesen)

Wikidata hat eine **Notability-Policy**: Items ohne externe Belege werden gelegentlich
gelöscht. Unser stärkster Beleg = **DPMA-Markenanmeldung AZ 3020262290701** (öffentliches
Register, Anmelder Uwe Yendell). Diesen als Referenz/Beschreibungsquelle nutzen.
Falls das Item gelöscht wird: kein Schaden, später mit mehr Presse-Belegen erneut anlegen.

## Item-Daten

| Feld | Wert |
|---|---|
| Label (de) | Steakakademie |
| Label (en) | Steakakademie |
| Beschreibung (de) | deutschsprachige Online-Wissensplattform für Steak- und BBQ-Zubereitung |
| Beschreibung (en) | German-language online educational platform for steak and BBQ preparation |
| Alias (de) | steakakademie.de |

## Statements (Property → Wert)

| Property | Wert | Sicherheit |
|---|---|---|
| P31 (ist ein(e)) | Q35127 (Website) | ✅ sicher |
| P856 (offizielle Website) | https://steakakademie.de | ✅ sicher |
| P407 (Sprache) | Q188 (Deutsch) | ✅ sicher |
| P17 (Land) | Q183 (Deutschland) | ✅ sicher |
| P571 (Gründung) | 2026 | ✅ sicher |
| P2003 (Instagram-Benutzername) | steakakademie | ✅ sicher |
| P7085 (TikTok-Benutzername) | steakakademie | ✅ sicher |
| P2013 (Facebook-ID) | steakakademie.de | ✅ sicher |
| P2397 (YouTube-Kanal-ID) | *(echte Kanal-ID nötig, beginnt mit „UC…" — YouTube Studio → Einstellungen → Kanal → erweiterte Einstellungen)* | ⚠️ ID nachschlagen |

Referenz an P31/P856 anhängen: „Fundstelle" = DPMA-Register, AZ 3020262290701.

## Nach dem Anlegen

Q-ID (z. B. Q123456789) an Claude geben → wird in `sameAs` des Schema.org-Markups
(Organization/WebSite) verdrahtet. Erst dann wirkt das Entity-Signal.
