# Anwalts-Testat 18.08.2026 — Maßnahmenplan

**Quelle:** Homepagecheck, RAin Petra Nieweg, Steinhagen — geprüft: https://www.steakakademie.de
**Ergebnis:** 14 von 18 Prüfpunkten ohne Beanstandung, 4 Prüfpunkte „nicht erfüllt" mit insgesamt **8 Einzelmängeln**.

## Priorität 1 — laufende Verstöße, sofort beheben

| # | Mangel | Norm | Jira | Aufwand |
|---|---|---|---|---|
| 1 | **Kontaktformular sendet per GET** — Name, E-Mail, Nachricht stehen in URL und Server-Logs | Art. 5, 32 DSGVO | KAN-70 | 1 Zeile |
| 2 | **Amazon-Produktbilder laden vor Einwilligung** — IP geht beim Scrollen an Amazon | Art. 6 DSGVO / TDDDG | KAN-71 | mittel |
| 3 | **Cookie-Banner überdeckt Impressum/Datenschutz/AGB** — Links nicht anklickbar | § 5 Abs. 1 DDG | KAN-72 | CSS |

Warum P1: Punkt 1 ist ein laufendes Datenleck mit personenbezogenen Daten. Punkte 2 und 3 sind die klassischen Abmahn-Fallgruppen (vgl. Google-Fonts-Welle) — sie treffen bei *jedem* Seitenaufruf zu.

## Priorität 2 — Pflichtangaben & Kennzeichnung

| # | Mangel | Norm | Jira |
|---|---|---|---|
| 4 | **Kontaktformular ohne Datenschutz-Checkbox** (Nachweis fehlt) | Art. 5 Abs. 2 DSGVO | KAN-70 |
| 5 | **Marco-Chatbot ohne KI-Hinweis** am Button | Art. 50 Abs. 1 AI Act (seit 02.08.2026) | KAN-73 |
| 6 | **Toter ODR-Link** im Impressum (Plattform seit 20.07.2025 eingestellt) | § 5 DDG | KAN-74 |

## Priorität 3 — technische Härtung

| # | Mangel | Norm | Jira |
|---|---|---|---|
| 7 | **Content-Security-Policy fehlt** | Art. 32 DSGVO | KAN-75 |
| 8 | **Kein DKIM, DMARC auf p=none** | Art. 32 DSGVO | KAN-76 |

## Zwei eigene Anmerkungen zum Testat

1. **Plattform-Verwechslung:** Der Prüfer nennt für den CSP-Header `vercel.json`. Unsere Doku sagt: **Prod = Netlify**. Vor dem Fix klären, welche Plattform tatsächlich ausliefert — sonst setzen wir den Header ins Leere. (KAN-75)
2. **Bestätigung unserer eigenen Analyse:** Der AI-Act-Befund zu Marco deckt sich exakt mit der offenen Flanke, die wir am selben Tag in KAN-66 notiert hatten. Die heute abgeschlossene KI-Bildkennzeichnung (110 Bilder) wurde vom Prüfer nicht beanstandet — Prüfpunkt 3 (Urheberrecht Texte/Bilder) ist „ohne Beanstandungen".

## Reihenfolge der Abarbeitung

1. KAN-70 (Formular GET→POST + Checkbox) — kleinster Aufwand, größter Effekt
2. KAN-72 (Banner/Footer) — CSS, sofort verifizierbar
3. KAN-74 (ODR-Link) + KAN-73 (Marco-Hinweis) — Textänderungen
4. KAN-71 (Amazon-Bilder lokal) — eigenes Arbeitspaket
5. KAN-75 (CSP, erst Report-Only!) + KAN-76 (DKIM/DMARC, DNS — Uwe)

**Nach Abschluss:** Testat-Punkte erneut prüfen lassen und das PDF zusammen mit dem Nachweis der Behebung archivieren (Compliance-Ordner).
