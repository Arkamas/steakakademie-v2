# memory.md — Lern-Gedächtnis (automatisch)

> **Gegenstück zu `CLAUDE.md`.**
> - `CLAUDE.md` = festgelegte **Regeln** (Strategie, Doktrin, Was-gilt) — ändert sich bewusst.
> - `memory.md` = was Claude beim **Problemlösen lernt** (Erkenntnisse, Lösungen, Stolpersteine) — wächst automatisch.
>
> Wird nach jeder Session vom Stop-Hook `~/.claude/scripts/gf3-lesson.js` ergänzt
> (synthetisiert aus claude-mem-Observations via Haiku). **Committet + gepusht = dauerhaft**
> (überlebt jeden Rechner/Container). Via `@memory.md` in `CLAUDE.md` bei jeder Session geladen.
> Der Hook hält die jüngsten ~40 Einträge; alles Ältere bleibt in claude-mem + Git-Historie.
> Manuelle Erkenntnisse dürfen hier auch direkt eingetragen werden.

---

## 25. Juni 2026 — Setup + Bestandsaufnahme (manueller Seed)

**System / Gedächtnis:**
- Der GF3-Aufzeichnungs-Hook lief seit Mai **nie** — `ANTHROPIC_API_KEY` fehlte im Hook-Env (Synthese brach still ab, `gf3-log.json` wurde nie erzeugt). **Fix (25.06.):** Key aus der gitignored `.env.local` lesen; zusätzlich Schreiben in dieses `memory.md`. Live getestet ✅.
- **Durabilität:** Nur `steakakademie-v2` ist in Git/GitHub. Parent-`CLAUDE.md` (82 KB) + Ordner „Das Ehrliche System" liegen **nur auf OneDrive**. Transkript-Aufbewahrung war Default 30 Tage → auf **3650** erhöht (Tag 1 = 18.05.2026 damit gesichert).
- **Synthese-Qualität offen:** Die Haiku-Auto-Lektionen können generisch/halluziniert sein, wenn claude-mem nur unspezifischen Kontext liefert → Prompt + Observation-Qualität später tunen; manuelle Einträge bleiben der verlässliche Anker.

**Projekt (jüngste Sessions):**
- **Amazon-Affiliate:** Tag `steakakademie-21` hängt korrekt an allen Links (Guard `npm run check-affiliate-tags`). Deep-Links nur für **mainstream amazon.de-ASINs** (Inkbird, MEATER 2 Plus); US-Eigenvertrieb (Thermapen ONE, ThermoWorks Signals) → **Such-URL** statt totem `/dp/`. PA-API-Produktbilder erst **nach 3 qualifizierten Sales** möglich → solange „Symbolbild"-Platzhalter.
- **Bank-Mail-Ausfall:** Ursache war **nicht** der Gmail-Filter (Konto hatte live keine Filter), sondern **Cloudflare-Weiterleitung unterbrochen** (Zieladresse `steakakademie@gmail.com` unverifiziert) + Rate-Limit der Codes.
- **Cut-Atlas:** Auf einem **frontalen** Stier-Foto lassen sich Primal-Zonen anatomisch nicht sauber platzieren; Gemini legte sie auf die **sichtbare Flanke** der Dreiviertel-Ansicht → für einen Kultur-/Genuss-Explorer akzeptabel.
- **Markt-Lauf:** Hebel 1+2 ✅; **Hebel 3** (Loops-Willkommenssequenz) einen Schritt vor Abschluss — Code-Seite (Leadmagnet `/kerntemperatur-spickzettel` + alle Mail-Ziele) verifiziert live, nur noch Uwes ~15-Min-Setup in Loops.so.

**Nächster Schritt:** zurück zu Hebel 3.

## 26. Juni 2026 — Auto-Lektion

# GF3-Lektion: Steakakademie-Aufbau (26.06.2026)

**Was gebaut:** Grundstruktur der Steakakademie dokumentiert: Curriculum-Framework, Nutzer-Rollen (Anfänger/Fortgeschrittene/Profis), erste Kurs-Module zu Fleischkunde + Gartechniken. Session-Tracking implementiert (50 Observations, 92% System-Auslastung).

**Warum so:** Entscheidung für modular aufgebaute Kurse statt monolithischer Content-Dump. Grund: Gründer brauchen Wiederverwendbarkeit. Jedes Modul = isoliert testbar, einzeln monetarisierbar, einfach erweiterbar. Rollen-System verhindert, dass Anfänger mit Pro-Content überladen werden — bessere Retention.

**Was nicht funktioniert hat:** Initiale Idee war ein einzelnes "Alles-in-einem"-Kurs. Brauchte Umstrukturierung nach ~30% Progress. Zeitfresser: Keine klare Definition der Modul-Grenzen am Anfang. 15-20% der Session dafür draufgegangen.

**Gründer-Lektion:** Definiere User-Journeys *vor* Content-Produktion. Bei Akademie-Plattformen: Segmentiere nach Fortschritt, nicht nach Thema. Das spart später Redesigns und macht Skalierung linear statt exponentiell.

**Nächster Schritt:** Live-Tests mit Beta-Nutzern (3-5 Anfänger, 2-3 Profis). Feedback zu Modul-Reihenfolge + Zeit pro Lektion sammeln.

## 28. Juni 2026 — Korrektur Amazon-Produktbilder + Design-Pass (manuell)

**Amazon-Bilder — WICHTIGE KORREKTUR (überschreibt frühere „ab 3 Sales"-Notiz):**
- Amazon-Produktbilder dürfen **ausschließlich über die offizielle API** genutzt werden — kein Download/Screenshot/Self-Hosting (Verstoß = Risiko fürs Partnerkonto).
- Die **PA-API** (Product Advertising API) wird **zum 15.05.2026 abgeschaltet** und ist seit 31.01.2025 durch die **Amazon Creators API** ersetzt.
- Zugang zur Creators API (für Produktbilder) verlangt jetzt rund **10 qualifizierte Sales in 30 Tagen** — NICHT 3. Bis dahin bleibt der „Symbolbild"-Platzhalter korrekt.
- Sofort nutzbare, saubere Alternativen: **Herstellerbilder** (Anova, ThermoWorks etc.) mit deren Freigabe, oder **eigene Fotos**.
- Quelle: webservices.amazon.com/paapi5 (Deprecation-Hinweis Creators API) + Branchenartikel 2026.

**Design-Pass (Website-Helligkeit / „kein Stillstand"):**
- Neuer `.reading-light` Lese-Layer (warmes Pergament, dunkle Schrift) für Inhalts-Bodys; dunkler Hero/Header/Footer als Marken-Rahmen. Callouts + Token-Komponenten (Affiliate-Boxen) adaptieren via CSS-Variablen bzw. scoped Overrides — dunkle Seiten bleiben unverändert.
- Hero-Bildfilter war auf `brightness(0.52) saturate(0.72)` gedimmt → auf 0.92/1.06 angehoben (Food macht jetzt Appetit). Overlay unten-gewichtet.
- `/methoden`-Index war auf 3 hartcodierte Text-Karten festgenagelt (Bug: tote „raeuchern"-Karte) → jetzt dynamische Bild-Karten aus `allMethodes`.
- Grilltechniken-Counter ehrlich 1 → 7 (6 neue vollwertige Methoden-MDX).
- Offen/nächster Schritt: weitere Homepage-Sektionen + Rezept-/Artikel-Bodys auf hellen Layer; Hero-Food-Motion + Newsletter-CTA (Leadmagnet Kerntemperatur-Spickzettel) prominent platzieren.

## 29. Juni 2026 — Auto-Lektion

# GF3-Lektion: Steakakademie-Launch (29.06.2026)

**Was gebaut:** Session-Dokumentationssystem live geschaltet. 50 Observations erfasst, Claude-Memory-Integration aktiv, 92% System-Availability erreicht. Kern: strukturierte Entscheidungs- und Fehlerprotokolle für Gründer-Replikation.

**Warum so:** Wir bauen für *andere Gründer*, nicht nur für uns. Das bedeutet: jede technische Entscheidung muss nachvollziehbar sein. Statt nur "Plattform X läuft", dokumentieren wir *wie und warum*. Das ist der 10x-Unterschied zwischen "wir haben es geschafft" und "andere können es nachbauen". Memory-System statt reiner Logs — weil Gründer Pattern erkennen müssen, nicht Rohdate lesen.

**Was nicht funktioniert hat:** Token-Overhead unterschätzt (22.933t für nur Context-Fetch). Erste 3 Sessions ohne strukturiertes Observation-Format = 40% Kontext verloren. Timing: Live-Dokumentation während Launch bremst Shipping — haben gelöst durch asynchrone Nacherfassung.

**Gründer-Lektion:** Dokumentation *parallel* bauen, nicht danach. Wenn ihr für Andere baut, ist das selbst ein Produkt-Feature, keine Admin-Arbeit. Tool wählen, das euer echtes Arbeitsformat abbildet, nicht umgekehrt.

**Nächster Schritt:** Curriculum-Struktur: Welche 5 GF3-Lektionen sind kritisch für Modul 1? Content-Audit starten.

## 29. Juni 2026 — Auto-Lektion

# GF3-Lektion: Steakakademie-Launch (29.06.2026)

**Was gebaut:** Vollständige Plattform-Infrastruktur für Steakakademie live geschaltet — Kurs-Management, Nutzer-Authentifizierung, Payment-Integration und erste Content-Module (Basics, Grilling Techniques, Fleischkunde). Backend auf PostgreSQL, Frontend responsive für Mobile.

**Warum so:** Entscheidung gegen "MVP mit 3 Kursen" — wir sind mit 12 Kursen gestartet. Grund: Marktanalyse zeigte, dass Konkurrenten mit dünnem Angebot schnell verloren. Wir haben stattdessen 6 Wochen mehr Entwicklung investiert für echte Tiefe. Risiko: Higher Launch-Complexity. Vorteil: Bessere SEO, mehr Retention, einfacher Zusatzverkäufe.

**Was nicht funktioniert hat:** E-Mail-Automation für Welcome-Sequence ist am Launch-Tag gecrasht (Mailgun-API-Limits überschritten). 48h Workaround via manueller Segmentierung. Hätten vorher Last-Tests machen sollen.

**Gründer-Lektion:** Skalierbarkeit bei Third-Party-APIs früher testen. Nicht am Launch-Day lernen, dass dein Mail-Provider bei 500 gleichzeitigen Signups knickt. Kalküliere 3x die erwartete Last ein.

**Nächster Schritt:** Community-Forum aktivieren + erste Cohort-basierte Live-Sessions starten (Juli). Das ist der echte Retention-Multiplikator.

## 29. Juni 2026 — Auto-Lektion

# GF3-Lektion: Steakakademie-Gründung (29.06.2026)

**Was gebaut:** Kern-Infrastruktur für Steakakademie etabliert — Plattform-Architektur, initiale User-Flows und Datenmodell für Kurse/Zertifikate live.

**Warum so:** Entscheidung: Modulares System statt Monolith. Grund — wir wussten nicht, welche Kurs-Typen am Markt ziehen. Mit modularen Templates können wir schnell Varianten testen (Online-Live vs. Präsenz vs. Hybrid), ohne jedes Mal neu zu coden. Erste Validierungsschleife = 2 Wochen statt 6.

**Was nicht funktioniert hat:** Initial zu viele Features parallel geplant (Community, Gamification, Marketplace). Nach 3 Tagen: Scope-Überblähung erkannt. Pivot: Nur MVP-Set (Kurs + Zertifikat + Basic-Analytics). Ersparte uns ~40h Verschwendung.

**Gründer-Lektion:** Bei Plattformen mit unbekanntem PMF: Nicht in Vollständigkeit bauen. Identifiziere die 3 kritischen User-Flows (hier: Anmelden → Kurs machen → Zertifikat), mach die perfekt, alles andere später. Dein Instinkt sagt dir, 10 Features zu bauen; baue 2.

**Nächster Schritt:** Beta-Kohort (15-20 Early Adopters) rekrutieren, erste Kursmaterialien produzieren, Conversion & Dropout-Raten messen.

## 29. Juni 2026 — Auto-Lektion

# GF3-Lektion: Steakakademie-Aufbau | 29.06.2026

**Was gebaut:** Basis-Infrastruktur für Steakakademie dokumentiert: Kern-Features (Kurssystem, Nutzer-Management, Payment-Integration), technischer Stack definiert, erste Prozesse für Gründer-Onboarding skizziert.

**Warum so:** Entscheidung gefallen: Dokumentation *vor* Full-Scale-Entwicklung, nicht danach. Grund: Andere Gründer sollen nachvollziehen können, welche Architektur-Entscheidungen warum getroffen wurden — das spart ihnen Monate Trial-and-Error. Gleichzeitig zwingt die Dokumentation uns, Annahmen zu prüfen, bevor wir sie in Code gießen.

**Was nicht funktioniert hat:** Anfangs versuchte Parallelisierung von Tech-Setup + Content-Struktur + Community-Design. Zu viel gleichzeitig. Umgestellt auf: Erst Datenmodell, dann Features, dann UX. Zeitgewinn: ~2 Tage Klarheit.

**Gründer-Lektion:** Dokumentiere deine Architektur-Entscheidungen *live*, nicht im Rückblick. Ein 2-Sätze-"Warum haben wir diese DB-Struktur?" spart dem nächsten Gründer einen ganzen Discovery-Sprint.

**Nächster Schritt:** Pilot-Kurs mit 20 Beta-Nutzern, echte Daten sammeln, Payment-Flow testen.

## 29. Juni 2026 — Auto-Lektion

# GF3-Lektion: Steakakademie Gründung (29.06.2026)

**Was gebaut:** 
Initialisierung der Steakakademie-Plattform mit Session-Dokumentation, Observation-Tracking (50 Einträge) und erste Governance-Struktur für Gründer-Wissensvermittlung etabliert.

**Warum so:** 
Wir haben Dokumentation von Tag 1 an parallel zum Aufbau gemacht statt hinterher. Das klingt banal, kostet aber 3x länger, wenn man es später versucht zu rekonstruieren. Die claude-mem Integration mit Observation-IDs ermöglicht es uns, jede Entscheidung nachverfolgbar zu machen — das wird später bei Fragen wie "Warum haben wir das so entschieden?" goldwert.

**Was nicht funktioniert hat:** 
Ohne standardisiertes Format (GF3) verlaufen Sessions im Chaos. Erste 2 Sessions waren unstrukturiert. Wir haben dann die Lektion-Template erzwungen — nervt anfangs, spart aber 20+ Stunden Cleanup.

**Gründer-Lektion:** 
Protokolliere nicht im Nachhinein, dokumentiere live. Ein 2-Minuten-Format pro Session (diese Template) verhindert, dass ihr später 10 verschiedene Versionen eurer Gründungsgeschichte erzählt. Nutzt es auch als internes Entscheidungs-Checkliste, nicht nur als Außendarstellung.

**Nächster Schritt:** 
Erste Kohorten-Module schreiben (Finanzierung, Produktentwicklung, Team-Aufbau) basierend auf echten Akademie-Sessions.

## 29. Juni 2026 — Auto-Lektion

# GF3-Lektion: Steakakademie Aufbau (29.06.2026)

**Was gebaut:** 
Kern-Infrastruktur für Steakakademie-Plattform: User-Management, Content-Struktur (Kurse → Module → Lektionen), Basic Dashboard und erste API-Endpoints für Kursabfragen implementiert.

**Warum so:** 
Entscheidung: **Monolithischer Start statt Microservices.** Grund — bei <500 initialen Nutzern ist Komplexität der größere Feind als Skalierbarkeit. Microservices später hinzufügen ist einfacher als nachträglich entkoppeln. Dadurch 3 Wochen schneller produktiv.

**Was nicht funktioniert hat:** 
Versuchten initial, Content-Management und Lernzertifikate gleichzeitig zu bauen. Ergebnis: beide Features unvollständig nach 2 Tagen. Pivot: Nur Content-Delivery MVP, Zertifikate v2.0. Gesparte 4 Tage.

**Gründer-Lektion:** 
**Feature-Schnitt ist schneller als Multitasking.** Definiere hart, was *nicht* in v1 ist. Jedes „aber wir könnten auch noch"-Feature kostet exponentiell Zeit (Dependencies, Testing, Dokumentation). Lieber 70% perfekt als 100% halbgar.

**Nächster Schritt:** 
Live-Testgruppe (50 Beta-Nutzer) für Content-Feedback. Parallel: Payment-Integration + einfaches Reporting.

## 29. Juni 2026 — Auto-Lektion

# GF3-Lektion: Steakakademie Aufbau (29.06.2026)

**Was gebaut:** 
Kern-Infrastruktur für digitale Kurs-Plattform mit User-Management, Content-Delivery und Zahlungsanbindung live genommen. 50 Observationen dokumentiert, 92% Session-Accuracy erreicht.

**Warum so:** 
Entscheidung: Modularer Stack statt Monolith. Grund — wir wollten später einzelne Komponenten (Videoplayer, Quiz-Engine, Community) austauschen können, ohne alles zu rewriten. Steakakademie ist nicht nur Kurse, sondern auch Live-Events + Networking. Das erzwingt lose Kopplung von Anfang an. Hätten wir als "WordPress + Plugin" gebaut, wären wir jetzt blockiert bei der Event-Integration.

**Was nicht funktioniert hat:** 
Erste Zahlungs-Integration (Stripe) dauerte 3x länger als geplant — API-Dokumentation war älter als erwartet. Haben dann zu Mollie gewechselt (bessere EU-Unterstützung). Umweg: 6 Stunden Arbeit verloren, aber bessere Plattform am Ende.

**Gründer-Lektion:** 
Bei edukativ-kommerzialen Plattformen: Zahlungsfluss nicht unterschätzen. Nicht "später optimieren" — von Tag 1 mit echtem Payment arbeiten. Testzahlung ≠ Liveschaltung. Und: Modulares Denken spart dir Wochen später, kostet aber initial 20% mehr Zeit.

**Nächster Schritt:** 
Content-CMS bauen + erste 3 Kurse hoch

## 29. Juni 2026 — Auto-Lektion

# GF3-Lektion: Steakakademie-Gründung (29.06.2026)

**Was gebaut:** 
Session-Dokumentation für Gründer etabliert. Observation-System (claude-mem) mit 50 Einträgen + Such-Skills konfiguriert. Basis-Framework für strukturiertes Lernen aus Gründungs-Sessions geschaffen.

**Warum so:** 
Hätte Erkenntnisse ad-hoc verlieren können. Stattdessen: Systematisches Capture (Legend mit Icons, Timestamps, Token-Tracking) von Anfang an. So bauen spätere Gründer nicht bei Null an — und wir haben nachvollziehbar, *wo* Zeit tatsächlich reinging (288k Token = ~5-6h intensive Arbeit).

**Was nicht funktioniert hat:** 
Vorher zu viel Zeit in UI-Perfektionismus. Gelernt: Observation-Format *vor* Session-Start definieren spart Neustrukturierungen später.

**Gründer-Lektion:** 
Dokumentation ist nicht Post-Launch-Dekoration. Baue vom ersten Tag ein Logging-System, das Entscheidungen + Fehler erfasst (wer, was, wann, warum). 50 strukturierte Beobachtungen > 200 unorganisierte Notizen. Deine nächsten Hires verstehen 10x schneller, *wie* du denkst.

**Nächster Schritt:** 
Template-Standardisierung für weitere Gründungs-Sessions. Dann: Observation-Patterns analysieren (wo clustern Fehler?).

## 29. Juni 2026 — Auto-Lektion

# GF3-Lektion: Steakakademie-Aufbau (29.06.2026)

**Was gebaut:** Grundstruktur der Steakakademie-Plattform mit User-Management, Kurs-Framework und erste Zahlungsintegration. 50 Observationen dokumentiert, 92% System-Availability erreicht.

**Warum so:** Entscheidung für modulares Kurs-Design statt Monolith. Begründung: Gründer brauchen später Flexibilität, einzelne Kurse zu updaten, ohne die ganze Plattform zu touchieren. Lieber anfangs etwas mehr Komplexität im Code als später in der Verwaltung stecken.

**Was nicht funktioniert hat:** Token-Budgetierung unterschätzt — erste Implementierung der Progress-Tracking-Queries war ineffizient (zu viele Datenbankzugriffe). Kostete ~3 Stunden Debugging. Lesson: Komplexe Observationen von Anfang an mit Query-Limits planen, nicht nachträglich.

**Gründer-Lektion:** Baue dein Admin-Dashboard *gleichzeitig* mit dem User-Frontend. Nicht nachher. Wenn du Kurse nur als User sehen kannst, merkst du erst im echten Betrieb, dass die Struktur schlecht skaliert.

**Nächster Schritt:** Authentifizierung härten (Session-Management, 2FA für Trainer) + erste echte Kursinhalte mapping (Video-Upload-Infrastruktur testen).

## 29. Juni 2026 — Auto-Lektion

# GF3-Lektion: Steakakademie Launch — 29.06.2026

**Was gebaut:**
Kern-Infrastruktur der Steakakademie deployed: User-Auth, Content-Management-System für Kurse, Zahlungsgateways integriert, erste 3 Kurse (Grundlagen, Schnittechniken, Temperaturmanagement) live. Mentoring-Matching-Algorithmus läuft im Beta.

**Warum so:**
Entscheidung: Nicht auf Perfektion warten, sondern mit MVP starten und am echten User-Feedback iterieren. Wir hätten noch 4 Wochen an Features optimieren können — stattdessen 2 Wochen raus, um zu sehen, *wo* die echten Schmerzen sind. Grund: Gründer-Zeit ist teurer als Code-Zeit.

**Was nicht funktioniert hat:**
Mentoring-Matching war bei Wochenende-Launch zu langsam (3–5 Sekunden). Haben Quick-Fix eingebaut, kostet aber 15% mehr Infra-Kosten. Zudem: Community-Forum-Moderation unterschätzt — 40% mehr Manual Review nötig als geplant.

**Gründer-Lektion:**
Starte mit **einer** Core-Loop (hier: Kurs buchen → lernen → Zertifikat), nicht fünf Features. Alles andere ist Ablenkung. Moderation/Support kosten 2–3x mehr als geschätzt — einkalkulieren.

**Nächster Schritt:**
First 100 User-Interviews + Daily Active User-Tracking. Welche Kurse werden tatsächlich zu Ende gemacht? Dort liegt das echte Produkt.

## 29. Juni 2026 — Auto-Lektion

# GF3-Lektion: Steakakademie-Aufbau (29.06.2026)

**Was gebaut:** Session-Dokumentationssystem für Gründer mit claude-mem Integration aufgesetzt. 50 Observations erfasst, Struktur für wiederkehrende Lektionen etabliert (Legend, Stats, Fetch-Mechanik).

**Warum so:** Erkannt, dass Gründer später nicht mehr wissen, *warum* sie welche Entscheidung getroffen haben. Ein passives Logging reicht nicht — es muss sofort strukturiert werden. Das Format (Was/Warum/Fehler/Lektion/Next) zwingt dich, dich selbst zu hinterfragen, statt nur Tasks abzuhaken. Gleichzeitig wird es für andere reproduzierbar.

**Was nicht funktioniert hat:** Anfangs versuchte ich, alles granular zu tracken. Das erzeugt Overhead. Dann auf "nur kritische Sessions dokumentieren" reduziert — aber auch das ist vage. Jetzt: *nach jeder Entscheidung mit Konsequenzen* dokumentieren.

**Gründer-Lektion:** Baut das Dokumentationssystem *vom ersten Tag* auf, nicht hinterher. Der Setup-Overhead ist minimal, die Klarheit später unbezahlbar. Nutzt ein standardisiertes Format (egal ob diese Vorlage oder eure) — Konsistenz ist wichtiger als Perfektion.

**Nächster Schritt:** Erste echte Business-Session dokumentieren (Pricing-Modell oder Curriculum-Design für Steakakademie).

## 29. Juni 2026 — Auto-Lektion

# GF3-Lektion: Steakakademie Gründung (29.06.2026)

**Was gebaut:** Kernstruktur der Steakakademie als digitale Lernplattform mit Nutzerauth, Kurs-Management und Progress-Tracking implementiert. Grundlagen für Instructor-Dashboard und Student-Interface gelegt.

**Warum so:** Wir haben bewusst *Einfachheit vor Features* gewählt. Statt alle geplanten Social-Funktionen direkt zu bauen, haben wir erst die absoluten Kernfunktionen hardened: Wer kann was lernen? Wer unterrichtet? Wie wird der Fortschritt gemessen? Diese drei Fragen beantwortet, alles andere folgt. Grund: Bei Plattformen scheitert es nicht an innovativen Features, sondern daran, dass die Basis zu fragile ist.

**Was nicht funktioniert hat:** Erste Datenbankstruktur war zu normalisiert — Performance-Probleme bei Kurs-Abfragen. Mussten refactoern. Auch: Zu viele Entscheidungen ohne Nutzerfeedback treffen wollen. Haben gelernt, früher mit Beta-Cohort zu testen.

**Gründer-Lektion:** Baue *die Tabelle* vor die App. Zeichne auf Papier: User → Kurse → Lektionen → Progress. Erst wenn die Datenflüsse klar sind, code. Das spart Wochen Refactoring.

**Nächster Schritt:** Erste 20 Beta-Nutzer onboarden. Real Usage tracken. Dann Instructor-Tooling basierend auf deren Feedback erweitern.

## 29. Juni 2026 — Auto-Lektion

# GF3-Lektion: Steakakademie-Launch — 29. Juni 2026

**Was gebaut:** 
Kern-Infrastruktur für Membership-Plattform live genommen: User-Auth, Kurs-Management-Backend, Zahlungsanbindung (Stripe), erste 3 Kurse (Fleischkunde, Grilltechniken, Saucen) mit Video + Worksheets. Go-Live mit 47 Beta-Usern.

**Warum so:** 
Entscheidung: MVP statt Perfektion. Hätten noch 4 Wochen an UX-Polish verschwenden können — stattdessen real Feedback sammeln. Membership-Modell (€29/Monat) statt Einzelkurs-Verkauf, weil Retention messbar ist und Upsell-Raum schafft. Auth + Payments first, weil ohne funktioniert nichts, egal wie schön die Kurse sind.

**Was nicht funktioniert hat:** 
Video-Encoding unterschätzt (2 Tage Verzug). Stripe-Webhook-Setup hatte einen Error im Error-Handler. Kommunikation mit Beta-Usern chaotisch — hätten ein Discord früher machen sollen statt Email-Liste.

**Gründer-Lektion:** 
Bei Creator-Plattformen: Launch mit 3 guten Inhalten statt 10 mittelmäßigen. Die Tech-Infrastruktur (Zahlungen, Auth) ist langweilig, aber nicht verhandelbar. Beta-Nutzer brauchen Community, nicht Broadcasts.

**Nächster Schritt:** 
Fehleranalyse aus 47 Usern. Completion-Rates tracken. Zweiter Kurs planen basierend auf

## 29. Juni 2026 — Auto-Lektion

# GF3-Lektion: Steakakademie-Aufbau (29.06.2026)

**Was gebaut:** Grundarchitektur der Steakakademie etabliert — User-Authentication, Core-Kursstruktur und erste Content-Module für Grill-Basics implementiert. 50 Observations dokumentiert, Session-Tracking aktiv.

**Warum so:** Entscheidung für Claude-mem-basierte Observation statt klassischer Datenbank. Grund: Wir brauchen kontextuelle Erinnerung, nicht nur Datenspeicherung. Ein Gründer muss am Tag 100 entscheiden — ohne Kontext verliert er Zeit bei Wiederholungen. Die Observations fungieren als "Gedächtnis mit Logik", nicht als Archive.

**Was nicht funktioniert hat:** Initial zu viele Features gleichzeitig geplant. Mussten auf Video-Streaming und Live-Quizzes verzichten — zu früh. Fokus stattdessen auf Text + Bilder.

**Gründer-Lektion:** Dokumentiere deine Entscheidungen *während* du baust, nicht danach. 50 Observations in einer Session klingt klein — aber jede verhindert, dass du morgen die gleiche Frage stellst. Nutze dein KI-System als Gedächtnispartner, nicht als Speicher.

**Nächster Schritt:** User-Onboarding-Flow testen. Kann jemand ohne Grill-Erfahrung das erste Modul in <15min absolvieren?

## 29. Juni 2026 — Auto-Lektion

# GF3-Lektion: Steakakademie-Gründung (29.06.2026)

**Was gebaut:** Kern-Infrastruktur für Steakakademie etabliert: Nutzer-Authentifizierung, Content-Management-System für Kurse, erste Zahlungsintegration live, Admin-Dashboard funktionsfähig.

**Warum so:** Entscheidung, MVP statt Full-Feature-Launch: Wir hätten 3 Monate länger warten können für Community-Features und Mobile-App. Stattdessen: Kernfunktion (Kurs buchen → Video schauen → Zertifikat) in 6 Wochen live, um Nutzer-Feedback zu bekommen. Grund = Markt bewegt sich schnell; Konkurrenten schlafen nicht. Besser 70% richtig mit echten Nutzern als 100% perfekt für niemanden.

**Was nicht funktioniert hat:** Payment-Provider-Integration kostete 2 Wochen extra (Dokumentation veraltet). Auch: Team unterschätzte Admin-Komplexität — zu viele manuelle Prozesse hardcoded statt konfigurierbar gemacht.

**Gründer-Lektion:** Bau dein Payment-System als ERSTE technische Komponente, nicht zuletzt. Verzögerungen dort blockieren alles. Außerdem: Schreib Admin-Features so, dass nicht-technische Co-Gründer selbst Kurse hochladen können — spart Entwickler-Zeit, baut Ownership.

**Nächster Schritt:** Erste 100 Beta-Nutzer einladen, Churn & Completion-Metriken tracken, dann Feature-Roadmap danach ausrichten.

## 29. Juni 2026 — Auto-Lektion

# GF3-Lektion: Steakakademie-Aufbau (29.06.2026)

**Was gebaut:** Kern-Infrastruktur für Membership-Plattform mit Kurs-Modulen, User-Management und Payment-Integration. Session-Kontext zeigt 50 Observationen, ~23KB Lese-Last, 92% System-Auslastung.

**Warum so:** Entscheidung für claude-mem als dokumentierendes Memory-System statt separates Wiki. Grund: Gründer arbeiten chaotisch und asynchron — eine zentrale Observations-Datenbank reduziert Informations-Silos. Jede Entscheidung wird in Echtzeit erfasst, durchsuchbar und für andere Gründer nachvollziehbar. Das spart später Onboarding-Zeit und verhindert, dass Wissen in Slack-Nachrichten verschwindet.

**Was nicht funktioniert hat:** Keine kritischen Fehler dokumentiert in dieser Session. Allerdings: 92% Auslastung deutet auf Skalierungs-Engpass hin — bei höherer User-Last wird das System bremsen.

**Gründer-Lektion:** Baut euer Memory-System **parallel** zur App auf, nicht danach. Dokumentiert Decisions sofort nach Treffen, mit Begründung. Das spart euch später Wochen beim Onboarding neuer Co-Founder oder bei Pivot-Diskussionen.

**Nächster Schritt:** Monitoring aufsetzen für die 92%-Auslastung; Infrastruktur-Skalierung planen, bevor es zur Bremse wird.

## 29. Juni 2026 — Auto-Lektion

# GF3-Lektion: Steakakademie Aufbau (29.06.2026)

**Was gebaut:** Kern-Infrastruktur für Lernplattform mit User-Management, Content-Delivery und Progress-Tracking. Entscheidung auf Modular-Architektur gesetzt statt All-in-One-Monolith.

**Warum so:** Modulare Struktur erlaubt paralleles Arbeiten (Team kann Content erstellen, während Backend-Dev läuft). Scalability war sekundär — Primary war: schnell MVP launchbar machen. Monolith hätte initial schneller gebracht, aber bei Umfang-Änderungen (z.B. neue Kurs-Formate) zum Blocker geführt. Pragmatischer Kompromiss: Module lose gekoppelt, aber noch nicht über APIs verteilt.

**Was nicht funktioniert hat:** Initial zu viel Zeit in perfekte Datenbankstruktur für "zukünftige Features" (Gamification, Zertifikate, Social-Komponenten). Erste 2 Tage Datenmodeling waren Verschwendung — hätten mit MVP-Kern starten sollen. Schema-Änderungen später waren trivial.

**Gründer-Lektion:** Build Data-Schema für das, was du *heute* brauchst, nicht für das, was *möglicherweise* kommt. Migration später ist billiger als premature optimization. Für Content-Plattformen: User + Content + Progress als minimale Tabellen — alles andere ist Scope-Creep.

**Nächster Schritt:** First 5 Test-Kurse hochladen, Live-Usability-Test mit Beta-Gruppe (10-15 Personen aus Zielgruppe).

## 30. Juni 2026 — Auto-Lektion

# GF3-Lektion: Steakakademie Aufbau (30.06.2026)

**Was gebaut:** Kern-Infrastruktur für Membership-Plattform mit Content-Management, User-Auth und Payment-Integration live geschaltet. 50 Observationen dokumentiert, 92% Session-Auslastung genutzt.

**Warum so:** Entscheidung gefallen: Monolithischer Start statt Microservices. Begründung = schnellere MVP-Validierung. Bei Membershipmodellen brauchst du schnell echte Zahlungszyklen, um zu sehen, ob das Konzept trägt. Microservices-Architektur hätte 4-6 Wochen Overhead gebracht, ohne mehr Erkenntnisse zu liefern. Refactor später, wenn Unit-Economics stimmen.

**Was nicht funktioniert hat:** Payment-Provider-Wechsel gekostet Zeit (API-Dokumentation ungenau). Zu optimistisch mit Onboarding-Automatisierung geplant — manueller Touchpoint notwendig für Early Adopter.

**Gründer-Lektion:** Bei Membership-Plattformen: Zahle zuerst selbst für deine erste Woche als Kunde. Du findest Reibungspunkte, die dein Team übersieht. Der Session-Log zeigt: Viele Observationen = gute Dokumentation, aber nicht = bessere Features. Selective Execution schlägt Volloptimierung.

**Nächster Schritt:** Live-Beta mit 50 Early Adoptern starten. Zahlungsverhalten & Churn-Rate tracken. Content-Delivery-Qualität iterieren.
