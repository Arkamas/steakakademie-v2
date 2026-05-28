# Steakakademie — Roadmap & Offene Punkte

> Letzte Aktualisierung: 2026-05-28

---

## 🔥 Heute erledigen

### Digistore24 Danke-URLs (manuell — nach Netlify-Deploy)
- [ ] Produkt **696394** (Steak-Beichte) → Eigenschaften → Dankeseite:
  `https://steakakademie.de/danke/steak-beichte`
- [ ] Produkt **696396** (Mein Protokoll) → Eigenschaften → Dankeseite:
  `https://steakakademie.de/danke/mein-protokoll`
- [ ] Produkt **696399** (BBQ Grundkurs) → Eigenschaften → Dankeseite:
  `https://steakakademie.de/danke/bbq-grundkurs`

### Amazon PA-API Credentials
- [ ] `AMAZON_ACCESS_KEY` + `AMAZON_SECRET_KEY` in `.env.local` eintragen (NICHT in Git!)
- [ ] Dieselben Keys in **Netlify** → Environment Variables eintragen
- [ ] `npm run fetch-images` ausführen → prüfen ob Bilder geladen werden

### Affiliate-Programme anmelden
- [ ] **Santosgrills** — Affiliate-Programm → echte Weber-URL ersetzen
- [ ] **Grillfürst** — Affiliate-Programm → echte Kamado-Joe-URL ersetzen
- [ ] **Ankerkraut** — Affiliate-Programm → echte Ankerkraut-URL ersetzen
- [ ] **Otto Gourmet** — Affiliate-Programm → echte Wagyu-URL ersetzen

---

## 📋 Diese Woche (KW 22–23)

### Content
- [ ] **Ribeye Pillar Page** `/cuts/ribeye` — P0, 18.000 Suchanfragen/Monat
- [ ] **Autoren-Profile** `/autoren/marco`, `/autoren/jonas`, `/autoren/elena`

### Produktbilder
- [ ] Hersteller kontaktieren: **Beefer**, **DRY AGER**, **Kamado Joe**, **Weber**, **KitchenAid**
- [ ] Anfrage-Vorlage schreiben (Lizenzfrei für redaktionellen Einsatz)
- [ ] Nach Erhalt: `imageUrl` + `imageType: "official"` in registry.yaml

### Links prüfen
- [ ] `npm run check-links` nach jedem Registry-Update ausführen

---

## 🎯 Mittelfristig (KW 24–26)

- [ ] **GA4 Measurement Protocol** — `GA4_MEASUREMENT_ID` + `GA4_API_SECRET` in Netlify
- [ ] **Güde Solingen** — Kontakt wegen Affiliate/Partnerschaft (`info@guede.com`)
  - Kein öffentliches Affiliate-Programm bekannt → direkte Anfrage nötig
- [ ] **Google Search Console** — Indexierungsstatus prüfen nach Sitemap-Fix
- [ ] **Vergleichsseiten** erweitern — `/vergleich/fleischthermometer` live stellen
- [ ] Smoker-Kategorie zur Registry hinzufügen

---

## ✅ Erledigt (KW 22–23)

- [x] Digistore24 — 3 Produkte angelegt (Steak-Beichte, Mein Protokoll, BBQ Grundkurs)
- [x] Checkout-URLs in Landing Pages integriert
- [x] 3× Danke-Seiten erstellt (`/danke/steak-beichte`, `/danke/mein-protokoll`, `/danke/bbq-grundkurs`)
- [x] Amazon PA-API v5 Integration — `scripts/fetch-pa-api-images.mjs`
- [x] `products/images.json` Cache-System
- [x] ProductCard — `imageUrl` aus PA-API mit Vorrang vor `image`
- [x] Sitemap-Fehler in Google Search Console behoben
- [x] Ehrliches-System-Seite — Texte aufgehellt (Kontrast-Fix)
- [x] PLACEHOLDER-URLs in registry.yaml behoben (Amazon-Search-Fallback)
- [x] Link-Checker-Script erstellt (`npm run check-links`)

---

## ⚠️ Bekannte Einschränkungen

| Problem | Status | Lösung |
|---------|--------|--------|
| MEATER Plus (B07VBK2D44) ggf. veraltet | Offen | MEATER 2 Plus als Testsieger erwägen |
| Weber/Kamado/Ankerkraut/Otto ohne echten Affiliate-Code | Offen | Affiliate-Anmeldung nötig |
| Güde — kein öffentliches Affiliate-Programm | Offen | Direktkontakt |
| Keine Stripe-Integration | Bewusst | Nur Digistore24 für digitale Produkte |
| Zwilling — kein Produkt im Portfolio | OK | Kein Handlungsbedarf |

---

## 💼 Rechtliches (was wir verkaufen)

Für Versicherungen/Nachweise:

**Kategorie 1 — Affiliate-Marketing (Provision)**
Wir vermitteln Produkte Dritter gegen Umsatzbeteiligung. Keine eigene Lagerhaltung.
- Thermometer, Grills, Messer, Sous-Vide, Gewürze, Fleisch, Dry-Ager, Küchenmaschinen, Oberhitzegrills
- Partner: Amazon Associates, [geplant: Santosgrills, Grillfürst, Ankerkraut, Otto Gourmet]

**Kategorie 2 — Digitale Informationsprodukte (Direktverkauf via Digistore24)**
Eigenentwickelte digitale Inhalte:
- *Steak-Beichte* — Persönlichkeitstest/Coaching-Eingangsanalyse (PDF, €7/€25)
- *Mein Protokoll* — 8-Wochen-BBQ-Trainingsplan (PDF/Digital, €19/€29)
- *BBQ Grundkurs* — Online-Videokurs (€79/€127)

**Steuerlich relevant:** Digitale Produkte: elektronisch erbrachte Dienstleistungen → OSS-Verfahren prüfen.
