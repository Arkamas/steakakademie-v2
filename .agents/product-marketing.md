# Product Marketing Context

**Document version:** v1
**Last updated:** 2026-09-05
**Quelle:** Entwurf aus `CLAUDE.md`, `marketing_agent.txt`, `docs/konzept-diplom-stufe-2-5.md`, `docs/konzept-bbq-grundkurs.md`, `products/registry.yaml`. Alles mit **[offen]** ist nicht belegt und von Uwe zu füllen — nichts davon raten (Regel 7).
**Vorrang:** Bei Widerspruch gelten `CLAUDE.md` (Regeln 1–8) und `marketing_agent.txt` (Marken-DNA, Werbekennzeichnung). Diese Datei ergänzt, sie ersetzt nicht.

## Product Overview
**One-liner:** Steakakademie.de — Deutschlands BBQ-Wissensplattform: exakte Cuts, Kerntemperaturen, Methoden und Rezepte, mit Diplom-Ausbildung für Ernsthafte.
**What it does:** Redaktionelles Fachwissen (Cuts, Grilltechniken, Wissen, Rezepte, Ausrüstung) frei zugänglich; darauf aufbauend ein gestuftes Diplom-Programm (Bronze → höhere Stufen), Mitgliederbereich („SteakAdemiker"), Newsletter, geprüfte Ausrüstungsempfehlungen mit Affiliate-Links.
**Product category:** Wissens- und Lernplattform Food/BBQ (DACH, deutschsprachig).
**Product type:** Content-Site + digitales Bildungsprodukt (Online-Diplom) + Community.
**Business model:** Freemium-Content → E-Mail-Liste → Affiliate → Diplom-Verkauf (Digistore24: SEPA/Klarna/PayPal) → Kurs (Teachable) → Display-Werbung erst ab 10.000 Besucher/Monat.

## Target Audience
**Target companies:** B2C-Fokus. B2B nachrangig: Gastronomie, Corporate Events, Catering.
**Decision-makers:** Der Griller selbst (B2C); Küchenleitung/Eventmanager (B2B).
**Primary use case:** Systematisch besser grillen — mit verlässlichen Zahlen statt Bauchgefühl.
**Jobs to be done:**
- Ein teures Stück Fleisch beim ersten Versuch richtig hinbekommen (Cut erkennen, Temperatur treffen, Ruhezeit).
- Vom Zufallsgriller zum Könner werden — nachweisbar (Diplom).
- Die richtige Ausrüstung kaufen, ohne Fehlkauf.
- Ein Geschenk für einen BBQ-Begeisterten finden (Diplom als Geschenkidee).
**Use cases:**
- Nachschlagen vor dem Grillen (Kerntemperatur, Cut-Steckbrief, Methode).
- Strukturiert lernen (Diplom-Curriculum).
- Kaufberatung Thermometer/Messer/Grills.

## Personas
| Persona | Cares about | Challenge | Value we promise |
|---------|-------------|-----------|------------------|
| Ambitionierter Hobbygriller (30–55, DACH, primär) | Qualität über Quantität, Präzision, Anerkennung im Freundeskreis | Widersprüchliche Infos im Netz, teure Fehlversuche | Exakte, geprüfte Zahlen und ein System, das ihn messbar besser macht |
| Einsteiger | Erste Erfolge ohne Blamage | Überforderung durch Ausrüstungs- und Methoden-Dschungel | Klarer Einstieg (BBQ-Grundkurs, kostenlos) |
| Schenkende(r) | Passendes, hochwertiges Geschenk | Kennt sich selbst nicht aus | Diplom-Gutschein als greifbares Geschenk |
| B2B (Gastro/Event) | ROI, Prozesssicherheit, Schulung des Teams | Personalwechsel, Qualitätsschwankung | Standardisiertes Fachwissen, professioneller Ton |

## Problems & Pain Points
**Core problem:** Grillwissen im deutschsprachigen Netz ist fragmentiert, oft ungenau (Temperaturen, Cuts, Reifung) und von Produktwerbung getrieben.
**Why alternatives fall short:**
- YouTube/Blogs: unterhaltsam, aber selten präzise und nicht systematisch.
- Foren: viel Meinung, keine Redaktion.
- Präsenz-Grillkurs (100–200 € für einen Nachmittag): teuer, einmalig, nicht nachschlagbar.
**What it costs them:** Verdorbenes Premium-Fleisch, Fehlkäufe bei Ausrüstung, Stillstand im Können.
**Emotional tension:** Will als Könner gelten — fürchtet das Versagen vor Gästen.

## Competitive Landscape
**Direct:** [offen] — Top-3-Wettbewerber für Diplom/Kurs sind im Repo nicht benannt. Im Kontext erwähnt: Weber Grillakademie (Präsenzkurse), Grillsportverein (Forum). Analyse ausstehend (Skill `competitors`).
**Secondary:** Präsenz-Grillkurse regional — kein Nachschlagewerk, keine Progression.
**Indirect:** YouTube-Kanäle, Blogs, Kochbücher, Händler-Ratgeber (Grillfürst, Santos — zugleich Affiliate-Partner, keine Konkurrenz im Wissensprodukt).

## Differentiation
**Key differentiators:**
- Faktengenauigkeit als Burggraben: kanonische Referenz `data/kerntemperatur-referenz.yaml`, nichts wird geraten (Regel 8c).
- Gründer-Dreifachkompetenz: gelernter Profi-Koch und Weber-zertifizierter Grillmeister (Genusskunst GmbH, Eventküche mit Grillakademie 2013–2021), Marketing-Manager, 22 Jahre Sport-/Gymnastiklehrer (Didaktik, Motivation).
- Redaktioneller Anspruch (Referenz: Texas Monthly — Qualitätsjournalismus trifft Handwerk).
- GEO-Fokus: entity-dichte Antwortblöcke, Schema.org Pflicht je Seite → Sichtbarkeit in Perplexity/ChatGPT/Gemini.
**How we do it differently:** Inhalt zuerst, Angebot danach (Startseiten-Hierarchie Regel 8). Kein Guru, kein Clickbait, kein persönlicher Auftritt — drei Avatare (Marco/Jonas/Elena) mit klaren Rollen.
**Why that's better:** Vertrauen entsteht durch Präzision und Freigiebigkeit, nicht durch Druck.
**Why customers choose us:** [offen] — noch keine Kundenaussagen belegt.

## Objections
| Objection | Response |
|-----------|----------|
| „Das steht alles kostenlos im Netz." | Ja — verstreut und widersprüchlich. Hier: geprüft, kanonisch, mit System. Das Diplom ist Struktur + Nachweis, nicht Information. |
| „149 € für ein Online-Diplom?" | Vergleich: Präsenzkurs 100–200 € für einen Nachmittag, nichts zum Nachschlagen. Gründungspreis 99 € (erste 100). Leistungsumfang: siehe `docs/konzept-diplom-stufe-2-5.md` (in Ausarbeitung). |
| „Ich brauche kein Zertifikat." | Dann reicht der freie Bereich + Newsletter. Kein Druck (Reciprocity vor Verkauf). |
| „Affiliate = gekaufte Empfehlung?" | Regel: nur Produkte, die Uwe selbst nutzen würde; sichtbare Kennzeichnung bei jedem Link. |

**Anti-persona:** Schnäppchenjäger, Massenmarkt-Konsument, „Grill-Influencer-Wannabe" ohne Interesse am Handwerk; B2B-Kunden, die Hobbyisten-Content erwarten.

## Switching Dynamics
**Push:** Frust über Fehlversuche, widersprüchliche Angaben, Fehlkäufe.
**Pull:** Exakte Zahlen, klarer Lernpfad, Diplom als Anerkennung.
**Habit:** Erstes YouTube-Video, das auftaucht; Forum-Suche.
**Anxiety:** „Ist Online-Lernen beim Grillen sinnvoll?", „Bekomme ich das Geld wert?"

## Customer Language
**How they describe the problem:**
- [offen] — keine Verbatims erhoben. Skill `customer-research` einsetzen, bevor Copy entsteht.
**How they describe us:**
- [offen]
**Words to use:** Cut, Kerntemperatur, Reifung, Ruhezeit, Pitmaster, Methode, präzise, handwerklich, kampferprobt, Ernsthafte.
**Words to avoid:** Guru-Speak, leere Superlative, Clickbait-Formeln, „Ad" als Werbekennzeichnung (unzulässig — „Werbung"/„Anzeige" sichtbar vor dem Klick), Hobbyisten-Slang in B2B-Copy.
**Glossary:**
| Term | Meaning |
|------|---------|
| SteakAdemiker | Mitglied im Mitgliederbereich |
| Diplom Bronze | Erste Ausbildungsstufe (Digistore24), weitere Stufen in Konzept |
| Cut | Fleischzuschnitt; kanonische Steckbriefe unter /cuts |
| GEO | Generative Engine Optimization — Sichtbarkeit in KI-Antworten |

## Brand Voice
**Tone:** Direkt, präzise, handwerklich, leidenschaftlich. Premium und autoritativ, nie belehrend.
**Style:** „High-Tech & Smoke" — Bourbon-Dunkel #120C07, Whiskey-Gold #C8882A, Glut-Orange #E85018 (CTAs). Referenz Texas Monthly.
**Personality:** Drei Avatare, kein persönlicher Auftritt von Uwe: **Marco** (Meister — Guides, Temperaturen, Chat), **Jonas** (Enthusiast — Social, Community, Einsteiger), **Elena** (Stimme — Reportagen, USA, Terroir). Newsletter: persönlich, „aus der Küche", keine Corporate-Prosa.

## Proof Points
**Metrics:** [offen] — Traffic/Liste/Umsatz nicht in der Doku belegt. Verkaufsfähigkeit 52 % (interner Score, Stand 04.06.2026).
**Customers:** [offen]
**Testimonials:**
> [offen] — keine belegten Zitate. Keine erfinden.
**Value themes:**
| Theme | Proof |
|-------|-------|
| Präzision | Kanonische Kerntemperatur-Referenz, Regel 8c |
| Erfahrung | Profi-Koch, Weber-Grillmeister, 8 Jahre Grillakademie-Betrieb |
| Unabhängigkeit | Affiliate-Regel „nur was Uwe selbst nutzen würde" + sichtbare Kennzeichnung |

## Goals
**Business goal:** Umsatz: Traffic-Asset (Ribeye-Pillar `/cuts/ribeye`, 18k Suchen/Monat) → Funnel (Welcome-Sequenz 5 Mails/14 Tage) → Diplom Bronze.
**Conversion action:** Newsletter-Anmeldung (primär), Diplom-Kauf via Digistore24 (sekundär), Affiliate-Klick (tertiär).
**Current metrics:** [offen] — GA4 in Vercel noch nicht verdrahtet (siehe CLAUDE.md §5).

## Compliance-Leitplanken (projektspezifisch, gelten für jeden Skill-Output)
- Werbekennzeichnung nach LG Köln 12.05.2026: „Werbung"/„Anzeige" sichtbar im Grid/Vorschaubild vor dem ersten Klick.
- Temperaturen, Cuts, Reifung nie raten — nur aus `data/kerntemperatur-referenz.yaml`.
- Human-gated: Marketing/Publishing/Außenauftritt sind Entwürfe, Uwe gibt frei. Kein Auto-Posting, kein Black-Hat.
- Startseite: Inhalt zuerst, Diplom-Teaser nie above the fold.

## Changelog
*Newest first. One line per revision: what changed and why.*
- v1 (2026-09-05) — Erstentwurf aus Repo-Doku; [offen]-Felder markiert, keine Kundendaten/Metriken belegt.
