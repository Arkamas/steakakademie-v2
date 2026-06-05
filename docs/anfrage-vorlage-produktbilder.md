# Anfrage-Vorlage: Produktbilder für redaktionellen Einsatz

> Zweck: Hersteller um Freigabe offizieller Produktfotos für die redaktionelle
> Nutzung auf steakakademie.de bitten. Vor dem Versand die **[Platzhalter]** füllen.
> Zielkontakte (laut Roadmap): Beefer, DRY AGER, Kamado Joe, Weber, KitchenAid.

---

## E-Mail-Vorlage (DE)

**Betreff:** Bildanfrage für redaktionellen Test/Ratgeber – [Produktname] auf steakakademie.de

Sehr geehrtes Team von [Hersteller],

ich betreibe **Steakakademie** ([https://steakakademie.de](https://steakakademie.de)),
ein redaktionelles Fachportal rund um Grillen, BBQ und Fleischzubereitung. Wir
testen und erklären Equipment praxisnah und methodisch – unabhängig und ehrlich.

Im Rahmen unseres Beitrags **„[Artikel-/Ratgeber-Titel]"** möchten wir das
**[Produktname]** vorstellen. Dafür würden wir gern **offizielle Produktfotos**
in hoher Auflösung verwenden.

Konkret bitte ich um:

- **Nutzungsrecht** für redaktionelle Zwecke auf steakakademie.de (inkl. der
  zugehörigen Social-Media-Kanäle der Marke)
- **Bildmaterial** in Web-Auflösung (idealerweise freigestellt/transparent oder
  auf neutralem Hintergrund), gern mehrere Perspektiven
- Hinweis auf den gewünschten **Bildnachweis** (z. B. „© [Hersteller]")

Selbstverständlich nennen wir [Hersteller] als Bildquelle und verlinken auf
Wunsch die offizielle Produktseite. Eine Gegenleistung ist damit nicht verbunden –
es geht uns um eine korrekte, hochwertige Darstellung Ihres Produkts.

Über eine kurze Rückmeldung – auch zu Ihren Bedingungen – freue ich mich sehr.

Mit freundlichen Grüßen
[Vorname Nachname]
Steakakademie · [https://steakakademie.de](https://steakakademie.de)
[E-Mail] · [optional: Telefon]

---

## English version (for non-German manufacturers)

**Subject:** Image request for editorial review – [Product name] on steakakademie.de

Dear [Manufacturer] team,

I run **Steakakademie** ([https://steakakademie.de](https://steakakademie.de)), an
editorial site about grilling, BBQ and meat preparation. We test and explain
equipment in a hands-on, methodical and independent way.

For our article **"[Article title]"** we would like to feature the
**[Product name]** and would be grateful for permission to use **official product
photos** in high resolution.

Specifically, we kindly ask for:

- **Usage rights** for editorial use on steakakademie.de (incl. the brand's
  associated social channels)
- **Image files** in web resolution (ideally cut-out/transparent or on a neutral
  background), several angles if possible
- The **credit line** you would like us to use (e.g. "© [Manufacturer]")

We will of course credit [Manufacturer] as the image source and link to the
official product page on request. No compensation is involved – our goal is an
accurate, high-quality presentation of your product.

I would greatly appreciate a brief reply, including any conditions on your side.

Kind regards,
[First name Last name]
Steakakademie · [https://steakakademie.de](https://steakakademie.de)
[Email] · [optional: phone]

---

## Nach Erhalt der Freigabe — technische Checkliste

1. Bild in `public/images/products/[slug].webp` (oder `.jpg`) ablegen
2. In `products/registry.yaml` beim Produkt setzen:
   - `imageUrl: "/images/products/[slug].webp"`
   - `imageType: "official"`
3. `imageAlt` aussagekräftig füllen (Produktname + Kontext)
4. Bildnachweis gemäß Hersteller-Vorgabe hinterlegen
5. `npm run check-links` ausführen

## Kontaktstatus (pflegen)

| Hersteller | Kontaktweg | Angefragt am | Status |
|---|---|---|---|
| Beefer | | | offen |
| DRY AGER | | | offen |
| Kamado Joe | | | offen |
| Weber | | | offen |
| KitchenAid | | | offen |
