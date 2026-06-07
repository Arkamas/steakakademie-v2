# 🔌 Postiz-Anbindung — Setup & Bedienung

Postiz bündelt alle Social-Kanäle (Instagram, Facebook, TikTok, YouTube) hinter **einer** API.
Das Script `scripts/postiz-push.mjs` schiebt die Promo-Maschinen-Outputs (Video + Caption + Hashtags)
als **Entwürfe** dorthin. **Nichts wird automatisch veröffentlicht** — du gibst in Postiz frei.

---

## 1. Postiz-Konto

- **Cloud (einfachster Weg):** Konto auf [postiz.com](https://postiz.com) anlegen.
- **Self-hosted (optional, kostenlos):** Docker-Image `ghcr.io/gitroomhq/postiz-app`. Dann ist
  `POSTIZ_API_URL` deine eigene Instanz (`https://<deine-domain>/public/v1`).

## 2. Social-Kanäle verbinden (in Postiz)

Im Postiz-Dashboard die 4 Kanäle hinzufügen. Vorab nötig (vgl. Channel-Setup-Komplettpaket):
- **Instagram** → muss **Professionell/Creator** sein **und mit einer Facebook-Seite verknüpft** (Pflicht fürs API-Publishing).
- **Facebook** → Seite (nicht privates Profil).
- **TikTok** → **Business-Konto**.
- **YouTube** → Kanal verbinden (Shorts-Upload).

## 3. API-Key erzeugen

Postiz → **Settings → Developers → Public API** → Key generieren.

## 4. Key lokal hinterlegen (NIE in Git/Chat)

In `steakakademie-v2/.env.local`:

```
POSTIZ_API_KEY=dein-key
# optional, nur bei Self-Hosting:
# POSTIZ_API_URL=https://deine-instanz/public/v1
```

## 5. Kanäle auslesen

```
node scripts/postiz-push.mjs --probe
```
Listet jeden verbundenen Kanal mit **Plattform + ID + Name**. Optional in `.env.local` festlegen,
welche Kanäle bespielt werden:
```
POSTIZ_CHANNELS=id1,id2,id3
```
(ohne diese Zeile → alle aktiven Kanäle)

## 6. Probelauf & Entwürfe anlegen

```
node scripts/postiz-push.mjs --dry-run            # zeigt Plan, kein API-Call
node scripts/postiz-push.mjs --slug tomahawk-reverse-sear --push   # 1 Rezept → Entwurf
node scripts/postiz-push.mjs --limit 5 --push     # 5 Rezepte → Entwürfe
```
Danach in Postiz prüfen (Caption, Cover, Plattform-Felder) und **manuell freigeben/posten**.

TikTok bekommt automatisch die kürzere TikTok-Caption, die anderen Kanäle die volle Caption.

## 7. Optional: terminiert statt Entwurf

```
node scripts/postiz-push.mjs --push --schedule --at 2026-06-10T08:00:00Z --every 1440
```
`--at` = Start (UTC, ISO), `--every` = Abstand in Minuten (1440 = täglich). Auch das ist von dir
kontrolliert — Postiz zeigt die geplanten Posts vor Versand.

> Es gibt **keinen** „jetzt sofort posten"-Modus im Script — bewusst. Doppel-Pushes verhindert ein
> Ledger (`promo-output/.postiz-pushed.json`); mit `--force` überschreibbar.

---

## ⚠️ Rechtlicher Hinweis (vor dem ersten Live-Post klären)

- **Eigenwerbung-Kennzeichnung:** Die Promos verlinken auf steakakademie.de (kommerziell, mit Affiliate-
  Links auf den Methodenseiten). Posts vom Marken-Account sind i. d. R. als Werbung erkennbar; im Zweifel
  (besonders wenn ein Post ein konkretes Affiliate-Produkt zeigt) **„Werbung"/„Anzeige" kennzeichnen**.
  Kurz mit der Rechtsschutz-/Rechtsberatung gegenprüfen (CLAUDE.md Regel 12/13).
- **Musik/Sound:** Falls in Postiz/Plattform Musik hinzugefügt wird, nur lizenzfreie/Plattform-Bibliothek.
- Die Promo-Videos selbst sind 100 % eigener Content (eigene FLUX-Bilder + eigener Text) → kein Fremd-Bildrecht.
