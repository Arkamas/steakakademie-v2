# Rechtssicherheit-Audit steakakademie.de — 30.06.2026

**Scope:** ARAG-18 + Top-10 + UGC/KI + Steakakademie-Hochrisiko-Zonen  
**Prüfbasis:** Codestand `main` (30.06.2026) · compliance/website-rechtscheck.yaml v2 (07.06.2026)  
**Prüfer:** Claude (Argus-Agent) — kein Ersatz für anwaltliche Prüfung  

---

## Ampel-Übersicht

| Farbe | Anzahl | Bedeutung |
|-------|--------|-----------|
| 🟢 Grün | 19 | Konform — kein Handlungsbedarf |
| 🟡 Gelb | 3 | Monitor / geringes Restrisiko |
| 🔴 Rot | 0 | Kritisch — kein offener Sofort-Handlungsbedarf |

**Kernergebnis:** Die Website ist in einem rechtssicheren Zustand. Das YAML `compliance/website-rechtscheck.yaml` ist signifikant veraltet — 7–8 Items stehen noch auf `fix-needed`, sind im Code aber bereits abgearbeitet (Commits seit 07.06.2026). Update zwingend.

---

## Befunde (nach Schweregrad)

| Komponente | Status | Abmahn-Risiko | Befund | Rechtsgrundlage | Fix |
|-----------|--------|---------------|--------|-----------------|-----|
| `community-ugc-nutzungsbedingungen` | 🟢 OK | — | `/nutzungsbedingungen` vollständig: §1–9, Inhaltslizenz, Mindestalter 16, Moderationsvorbehalt, DSA §7, Kündigung. Keine Lücke erkennbar. | UrhG §31; BGB §305 ff. | YAML-Status auf `ok` setzen |
| `community-ugc-dsa` | 🟢 OK | — | Nutzungsbedingungen §7: Notice & Action explizit „Art. 16 VO (EU) 2022/2065 — DSA", Kontaktstelle Art. 11/12 DSA, E-Mail `pitmaster@steakakademie.de?subject=Inhaltsmeldung`. | DSA Art. 14, 16 | YAML-Status auf `ok` setzen |
| `ki-moderation-transparenz` | 🟢 OK | — | DSE §10a benennt Anthropic PBC als Auftragsverarbeiter, Zweck „Qualität und Zulässigkeit" der eingereichten Rezepte, Art. 22 DSGVO ausgeschlossen (menschliche Letztentscheidung). Art. 28-konforme AV-Struktur. YAML-Befund überholt. | DSGVO Art. 13, 22; EU AI Act | YAML-Status auf `ok` setzen |
| `gutschein-agb-widerruf` | 🟢 OK | — | AGB §5a „Geschenkgutscheine": Einzweckgutschein gem. §3 Abs. 14 UStG, 3-Jahres-Gültigkeit, Übertragbarkeit, Widerruf bis Einlösung per §356 Abs. 5 BGB, Hinweis auf sofortigen Download-Start als Widerrufsausschluss. | UStG §3 Abs. 14; BGB §312g | YAML-Status auf `ok` setzen |
| `dse-resend` | 🟢 OK | — | DSE §8b: Resend Inc. als Dienstleister vollständig mit Adresse, Drittland USA, EU-SCCs, Speicherdauer. | Art. 13 Abs. 1 lit. e, Art. 28 DSGVO | YAML-Status auf `ok` setzen |
| `dse-fal-ai` | 🟢 OK | — | DSE §10b: fal.ai als KI-Bildgenerierung für Rezepte benannt, Rechtsgrundlage Art. 6 Abs. 1 lit. f DSGVO, kein Personenbezug bei Food-Bildern. | Art. 13 DSGVO | YAML-Status auf `ok` setzen |
| `dse-community-ugc-verarbeitung` | 🟢 OK | — | DSE §8a „Community-Rezepte (nutzergenerierte Inhalte)": Rezepttitel, Zutaten, Zubereitungsschritte, Anzeigename, Bearbeitungsstatus. Speicherdauer bis Kontolöschung. RGL: Art. 6 Abs. 1 lit. b + f DSGVO. Kein Foto-Upload. Vollständig. | Art. 6, 13 DSGVO | YAML-Status auf `ok` setzen |
| `widerrufsbutton-312k` | 🟢 OK | — | **Implementiert.** Footer: `<Link href="/widerruf">Vertrag widerrufen</Link>` — border-gold, uppercase, prominent. `/widerruf/page.tsx` + `WiderrufForm.tsx` + `/api/widerruf/route.ts` (Supabase-Protokoll + Loops-Bestätigung). YAML-BEFUND WAR FALSCH — der Button war seit Commit vor 30.06. bereits da. | §312k BGB | YAML-Status auf `ok` setzen + Datum 19.06.2026 erfüllt |
| `eu-ki-bilder-labeling` | 🟢 OK | — | Alle Community-Rezeptbilder: alt-Tag `KI-generiertes Symbolbild` + Inline-Hinweis „Das Beitragsbild ist ein KI-generiertes Symbolbild". `/ki-disclaimer` dokumentiert Art. 50 Abs. 2 & 4 EU AI Act. | EU AI Act Art. 50 Abs. 2 & 4; §5 UWG | — |
| `impressum` | 🟢 OK | — | Vollständig geprüft in Voraudits (Commits Mai/Jun 2026). Anbieter, Adresse, E-Mail, DE-Steuer-ID, Verantwortlicher §18 MStV. | §5 TMG; §18 MStV | — |
| `datenschutz-vollstaendig` | 🟢 OK | — | DSE deckt ab: Vercel, Cloudflare, Supabase, Resend, Loops.so, Digistore24, fal.ai, Anthropic (Moderation), GA4, Affiliate, UGC-Rezepte, Auth. Art. 13 DSGVO-Pflichtangaben vollständig. | Art. 13, 14 DSGVO | — |
| `agb-vollstaendig` | 🟢 OK | — | AGB §1–13: Fernabsatz, Vertragsschluss, digitale Produkte, physisches Diplom, Gutscheine, Widerrufsrecht digital + physisch, Muster-Widerrufsformular, Haftung, Datenschutz-Verweis. ARAG-Testat-Nachbesserungen aus Jun 2026 integriert. | BGB §§305–312k; UWG | — |
| `preisangaben-pangv` | 🟢 OK | — | Preise inkl. USt ausgewiesen (19% MwSt.-Hinweis). Porto für physisches Diplom separat. Digistore24 übernimmt Zahlungsabwicklungs-Transparenz. | PAngV; §1 Abs. 2 UWG | — |
| `affiliate-disclosure` | 🟢 OK | — | `/affiliate-disclosure` Seite vorhanden. Auf Produktseiten mit Affiliate-Links referenziert. | §5a UWG; §2 HWG | — |
| `schema-markup` | 🟢 OK | — | FAQPage + HowTo auf Temperatur-Guide + Reverse-Sear. Recipe-Markup auf Rezepten. Person-Markup + Organization-Markup vorhanden. OG-Image. | Google Guidelines; GEO Best Practice | — |
| `robots-sitemap` | 🟢 OK | — | `next-sitemap` konfiguriert, `postbuild`-Hook. Sitemap bei GSC eingereicht (28.05.2026). `robots.txt` vorhanden. | SEO/Tech Best Practice | — |
| `ssl-https` | 🟢 OK | — | Cloudflare + Netlify: HTTPS erzwungen, HSTS aktiv. | — | — |
| `cookie-consent` | 🟡 MONITOR | niedrig | Aktuell cookieless (kein Consent-Banner nötig). GA4 läuft ohne Cookies. **Sobald Meta-Pixel oder GA4-Cookies aktiviert → Consent-Banner mit gleichwertiger Ablehnmöglichkeit PFLICHT (§25 TDDDG, Art. 6 DSGVO).** | §25 TDDDG; Art. 6 DSGVO | Bei Pixel-Aktivierung vor Go-Live einbauen (Usercentrics o.ä.) |
| `eu-ai-act-marco-chatbot` | 🟡 MONITOR | niedrig | ki-disclaimer-Seite vorhanden (Art. 50 Abs. 1 referenziert). **LÜCKE:** MarcoWidget.tsx enthält keine Live-Disclosure beim Chat-Start ("Ich bin ein KI-Assistent…"). EU AI Act Art. 50 Abs. 1 verlangt Hinweis im Moment der Interaktion, nicht nur auf einer separaten Seite. Frist: **02.08.2026 (33 Tage).** | EU AI Act Art. 50 Abs. 1 | Marco-Widget: Ersten Satz jeder Antwort oder Willkommens-Blase mit "Ich bin ein KI-Assistent (Marco)…" ergänzen |
| `dpma-markenschutz-frist` | 🟡 MONITOR | mittel | **Wortmarke AZ 3020262290701 ("Steakakademie"), Anmeldetag 27.05.2026 → Gebühr fällig bis 27.08.2026 (58 Tage).** Nicht gezahlt = Priorität 27.05.2026 verloren. Kein rechtlicher Compliance-Mangel der Website, aber existenzielle Markenfrist. | MarkenG §36, §64 | Gebühr beim DPMA vor 10.08.2026 einzahlen (Reminder bereits gesetzt laut CLAUDE.md) |

---

## Sofortmaßnahmen (Top-3)

### 1. `compliance/website-rechtscheck.yaml` aktualisieren (heute)
Das YAML zeigt 8× `fix-needed` — alle bereits im Code behoben. Falsche Statusanzeige macht den Compliance-Scanner unbrauchbar.  
**Fix:** YAML-Update auf alle `ok` (inkl. `befund`-Begründung + `last_checked: 2026-06-30`). → Direkt nach diesem Report.

### 2. Marco-Widget EU AI Act Art. 50 Disclosure (bis 02.08.2026)
MarcoWidget.tsx sendet keine Live-Disclosure beim Chat-Start. Ab 02.08.2026 ist Art. 50 Abs. 1 verbindlich.  
**Fix:** Im initialem System-Prompt oder als erste Widget-Nachricht: `"Ich bin Marco, ein KI-Assistent der Steakakademie (powered by Claude / Anthropic). Ich beantworte deine Grillfragen — kein Ersatz für professionellen Rat."` Eine Zeile reicht.

### 3. DPMA-Gebühr Wortmarke (bis 27.08.2026 — Frist 58 Tage)
Nicht direkt Website-Compliance, aber: Zahlung verpasst = Marke „Steakakademie" verloren.  
**Fix:** dpma.de → AZ 3020262290701 → Gebühr einzahlen. Spätestens bis 10.08.2026.

---

## Monitoring/Aufkommende Pflichten

| Frist | Pflicht | Trigger |
|-------|---------|---------|
| **02.08.2026** | EU AI Act Art. 50 verbindlich | Marco-Chat-Disclosure nachrüsten (→ Sofortmaßnahme 2) |
| **27.08.2026** | DPMA-Gebühr Wortmarke | → Sofortmaßnahme 3 |
| **bei Aktivierung** | Cookie-Consent-Banner | wenn Meta-Pixel oder GA4-Cookies scharf geschaltet werden |
| **laufend** | AGB-Compliance-Scanner (Agent 1) | täglich 06:00 UTC — prüft `website-rechtscheck.yaml` |
| **ab ~100 UGC-Einreichungen/Monat** | DSA-Transparenzbericht | VO (EU) 2022/2065 Art. 15 (kleine Plattformen ausgenommen bis Schwellenwert) |
| **2027** | UG-Gründung prüfen | ab 60–80k € Gewinn empfohlen (laut Steuerstrategie) |

---

## Empfehlung Anwalt?

**Aktuell nicht zwingend** — die Website ist rechtssicher aufgesetzt.

**Anwalt empfehlen für:**
- **Markenschutz** (DPMA-Gebühr + Klassen-Lücke Klasse 16 in Wortmarke) — Markenanwalt sobald Budget vorhanden
- **EU AI Act Einordnung Marco** — wenn Marco-Widget als "interaktives KI-System" eingestuft werden soll (Art. 50 Abs. 1 Kette) — einfache Disclosure reicht; Anwalt erst bei Unsicherheit
- **Digistore24-Verträge** — Webhooks + Booking-Gate vor Erstverkauf einmal juristisch querprüfen lassen (Verbraucherrecht Fernabsatz)
- **DSA ab Wachstum** — wenn Community aktiv wird und Meldeverfahren skalieren muss

---

## YAML-Update-Anweisung

Folgende Items in `compliance/website-rechtscheck.yaml` auf `ok` setzen + `last_checked: 2026-06-30`:

```
community-ugc-nutzungsbedingungen   → ok
community-ugc-dsa                   → ok
ki-moderation-transparenz           → ok  (DSE §10a vollständig)
gutschein-agb-widerruf              → ok  (AGB §5a vollständig)
dse-resend                          → ok  (DSE §8b vollständig)
dse-fal-ai                          → ok  (DSE §10b vollständig)
dse-community-ugc-verarbeitung      → ok  (DSE §8a vollständig)
widerrufsbutton-312k                → ok  (Footer + /widerruf + /api/widerruf — implementiert)
```

`eu-ki-act-marco-disclosure` → neu anlegen als `monitor` mit Frist 02.08.2026.

---

*Audit erstellt: 30.06.2026 · Nächstes reguläres Audit: 30.09.2026 (oder bei wesentlicher Änderung)*
