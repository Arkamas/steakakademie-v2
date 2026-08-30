# Bildquellen-Whitelist Steakakademie (Stand 18.08.2026, KAN-64)

Geprüft: kommerzielle Nutzung auf steakakademie.de inkl. Bearbeitung (KI-Editing).
Generell gilt bei ALLEN Quellen: Lizenzen decken nur das Urheberrecht — Persönlichkeitsrechte
erkennbarer Personen (KUG) und Markenrechte (Logos auf Grills!) bleiben unsere Verantwortung.
Und: Vor Übernahme IMMER Einzelbild-Prüfung auf KI-Kennzeichnung (Doktrin bildprogramm.md).

## ✅ GRÜN — frei nutzbar

| Quelle | Lizenz | Attribution | Auflagen |
|---|---|---|---|
| pexels.com | Pexels-Lizenz | nein | KI-Uploads per ToS verboten → sauberste Quelle. Kein Verkauf unveränderter Kopien |
| unsplash.com | Unsplash-Lizenz (geklärt 14.08.) | nein | Foto nie als Marken-Kennzeichen |
| stocksnap.io | CC0 | nein | Keine KI-Policy der Plattform → Einzelbild selbst beurteilen |
| kaboompics.com | eigene (Lizenzseite: /page/license-and-faq) | nein | „Editorial Use Only"-markierte Bilder aussparen |
| gratisography.com | eigene | nein | KI-Kollektion ist separat geführt → bei KI-Bildern imageAI: true |
| Burst (shopify.com/stock-photos) | CC0 + Shopify Photo License | nein | Kein Weiterverkauf unveränderter Dateien |

## ⚠️ GELB — nur mit Auflagen

| Quelle | Status | Auflagen |
|---|---|---|
| pixabay.com | Pixabay Content License | KI-Bilder vorhanden, aber GEKENNZEICHNET und im Filter abwählbar → nur Nicht-KI wählen ODER imageAI: true setzen. Keine Bilder mit erkennbaren Marken/Logos |
| foodiesfeed.com | eigene | Hostet echte UND KI-Bilder, kennzeichnet KI auf der Bildseite → Einzelbild-Prüfung Pflicht (Doktrin seit 17.08., Fall rinder-tacos) |
| commons.wikimedia.org | CC-Lizenz **pro Datei** | "Frei" heisst frei LIZENZIERT, nicht rechtefrei. Meist CC BY oder CC BY-SA -> Namensnennung PFLICHT; bei BY-SA gilt Share-Alike auch fuer Bearbeitungen (eingedeutschte Fassung waere selbst CC BY-SA). Nur PD/CC0 ist auflagenfrei. ACHTUNG: Die englische Wikipedia hostet Logos und Cover unter US-Fair-Use — in Deutschland NICHT nutzbar; nur verwenden, was auf Commons liegt. Lizenz je Datei ueber den Knopf "Weiterverwenden" auf der Dateiseite pruefen |
| magnific.com/de/bilder | = umbenanntes FREEPIK | Free-Account: ATTRIBUTIONSPFLICHT (Nennung Freepik/Magnific)! Exakte Formel laut Lizenzzertifikat: `designed by <autor> Magnific.com`, verlinkt auf magnific.com. Lizenz-PDF beim Download IMMER mitspeichern (einzige Quelle mit Beweispflicht). Mischbestand mit KI, nicht durchgängig gekennzeichnet. „Editorial only"-Assets tabu. KI-Assets meiden (separate AI-Terms). Empfehlung: nur nachrangig nutzen |

## ❌ ROT — nicht (mehr) verwenden

| Quelle | Grund |
|---|---|
| nos.twnsnd.co (New Old Stock) | Reguläre Fotos ausdrücklich NUR „personal and non-commercial" — für steakakademie.de NICHT zulässig (Ausnahme: kostenpflichtige Pro Photo Packs). Falls NOS-Bilder bereits live sind: identifizieren und ersetzen! |
| reshot.com | Plattform Januar 2026 eingestellt (redirectet zu Envato). Alt-Downloads bleiben unter alter Lizenz nutzbar, aber Beweisproblem — Lizenzkopie lokal archivieren. Keine Neuakquise möglich |

## Konsequenz fürs Beschaffungs-Skript

Erlaubte Such-Domains in Priorität: pexels → unsplash → stocksnap → kaboompics → burst → gratisography → pixabay (Nicht-KI-Filter) → foodiesfeed (nur mit Einzelbild-Check). Magnific/Freepik manuell und nachrangig. NOS + Reshot: gesperrt.

## Offener Folge-Check

Bestandsprüfung: Stammen live verwendete Bilder (v. a. Artikel/Cuts) aus NOS oder Reshot?
NOS-Funde ersetzen; Reshot-Funde: Lizenznachweis archivieren.

## Ablage beim Download (Fundgrube)

Rohdownloads liegen in `C:\Dev\_bilder-fundgrube\` — **ausserhalb des Repos**, weil das
Repo oeffentlich ist und ein versehentlich committetes Stock-Original dauerhaft in der
Git-History steht.

| Regel | Warum |
|---|---|
| Unterordner = Quelle (`pexels/`, `pixabay/`, `magnific/`, `unsplash/`, `shopify-burst/`, `eigene-fotos/`, `ki-eigen/`) | Der Pfad traegt die Herkunft, ohne dass beim Ablegen etwas dokumentiert werden muss |
| Bild-ID vorn im Dateinamen (`5252598-grill-holzkohle.jpg`) | Aus der ID laesst sich Autor und Lizenz jederzeit rekonstruieren |
| Attributionstexte NICHT in den Dateinamen | Windows bricht bei 260 Zeichen Pfadlaenge; `&` und `=` stoeren Skripte |
| Nur bei Magnific: Lizenz-PDF danebenlegen | Einzige Quelle mit Attributionspflicht = einzige mit Beweispflicht |
| Nichts in den Wurzelordner | Ohne Quellordner ist die Herkunft verloren |
| `_unsortiert/` ist Durchlaufstation, kein Lager | Wird vom Ingest hart ignoriert; nach ~30 Tagen ist die Chrome-Download-Historie weg und die Herkunft nicht mehr belegbar |

Verarbeitung: `node scripts/bild-ingest.mjs` — leitet Quelle aus Ordner und ID aus Dateiname
ab, setzt `imageSource`/`imageAI` und schreibt die CREDITS.md-Zeile.
