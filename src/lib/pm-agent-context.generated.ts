// ⚠️ AUTO-GENERIERT von scripts/generate-pm-context.mjs — NICHT MANUELL BEARBEITEN.
//
// Neu erzeugen mit:  npm run pm:context
// Entwurf & Regeln:  docs/pm-status-generator.md
// Kriterienkatalog:  data/pm-status-kriterien.yaml
//
// Jedes Kriterium hat drei mögliche Zustände: erfuellt | nicht_erfuellt |
// nicht_messbar. "nicht_messbar" fällt aus dem Nenner — es bedeutet
// "konnte nicht geprüft werden", NICHT "ist nicht erfüllt".
//
// readinessScore ist bewusst null, solange nicht alle acht Bereiche einen
// Kriterienkatalog haben. Eine fehlende Kennzahl ist ehrlicher als eine
// geschätzte (CLAUDE.md Regel 7).

export type KriteriumStatus = 'erfuellt' | 'nicht_erfuellt' | 'nicht_messbar'

export interface Kriterium {
  id: string
  frage: string
  status: KriteriumStatus
  beleg: string
}

export interface Bereich {
  name: string
  erfuellt: number
  pruefbar: number
  nichtMessbar: number
  /** null, wenn kein einziges Kriterium prüfbar war */
  score: number | null
  kriterien: Kriterium[]
}

export interface ProjectStatus {
  /** null, solange nicht alle Bereiche gemessen werden */
  readinessScore: number | null
  erfuelltGesamt: number
  pruefbarGesamt: number
  nichtMessbarGesamt: number
  bereiche: Bereich[]
  nichtGemessen: { name: string; grund: string }[]
  /** geparst aus CLAUDE.md §5 — dort ist die Quelle der Wahrheit */
  critical: string[]
  completed: string[]
  open: string[]
  generatedAt: string
  /** true, wenn ohne Netz erzeugt — Netz-Kriterien sind dann nicht_messbar */
  offline: boolean
}

export const PROJECT_STATUS: ProjectStatus = {
    "readinessScore": null,
    "erfuelltGesamt": 52,
    "pruefbarGesamt": 71,
    "nichtMessbarGesamt": 0,
    "bereiche": [
      {
        "name": "Avatar-System",
        "erfuellt": 8,
        "pruefbar": 10,
        "nichtMessbar": 0,
        "score": 80,
        "kriterien": [
          {
            "id": "personas-angelegt",
            "frage": "Alle drei KI-Personas (Marco, Jonas, Elena) sind in authors.ts angelegt.",
            "status": "erfuellt",
            "beleg": "3 von 3 Personas angelegt"
          },
          {
            "id": "avatar-pfade-aufloesbar",
            "frage": "Jeder in authors.ts referenzierte avatar-Pfad zeigt auf eine existierende Datei.",
            "status": "nicht_erfuellt",
            "beleg": "2 von 4 Pfaden zeigen ins Leere: /images/authors/jonas.jpg, /images/authors/elena.jpg"
          },
          {
            "id": "marco-portraet",
            "frage": "Marcos Porträtbild liegt unter public/images/authors/marco-richter.jpg.",
            "status": "erfuellt",
            "beleg": "public/images/authors/marco-richter.jpg vorhanden"
          },
          {
            "id": "marco-rueckenansicht",
            "frage": "Marcos Rückenansicht (Normalzustand am Grill) liegt unter public/images/marco-back.jpg.",
            "status": "erfuellt",
            "beleg": "public/images/marco-back.jpg vorhanden"
          },
          {
            "id": "zustand-videos-vollstaendig",
            "frage": "Jeder sichtbare Zustand des Avatar-Automaten hat ein Video-Asset.",
            "status": "nicht_erfuellt",
            "beleg": "0 von 6 Zuständen mit Video belegt"
          },
          {
            "id": "rotations-vollstaendig",
            "frage": "ROTATIONS in MarcoAvatar.tsx deckt jeden Zustand des Automaten ab.",
            "status": "erfuellt",
            "beleg": "alle 7 Zustände abgedeckt"
          },
          {
            "id": "autorenseiten-route",
            "frage": "Die Autorenseite /autoren/[slug] existiert als Route.",
            "status": "erfuellt",
            "beleg": "src/app/autoren/[slug] vorhanden"
          },
          {
            "id": "ki-disclaimer-route",
            "frage": "Die Seite /ki-disclaimer existiert als Route.",
            "status": "erfuellt",
            "beleg": "src/app/ki-disclaimer vorhanden"
          },
          {
            "id": "avatar-leitlinie-dokumentiert",
            "frage": "Die Avatar-Leitlinie ist in docs/avatare/marco.md festgehalten.",
            "status": "erfuellt",
            "beleg": "docs/avatare/marco.md vorhanden"
          },
          {
            "id": "bios-ohne-erfahrungsbehauptung",
            "frage": "Keine KI-Persona-Bio behauptet selbst gelebte Erfahrung oder eigene Produkttests.",
            "status": "erfuellt",
            "beleg": "3 Persona-Bios ohne Erfahrungsbehauptung"
          }
        ]
      },
      {
        "name": "Tech-Stack & Tools",
        "erfuellt": 4,
        "pruefbar": 10,
        "nichtMessbar": 0,
        "score": 40,
        "kriterien": [
          {
            "id": "typecheck-fehlerfrei",
            "frage": "tsc --noEmit läuft fehlerfrei durch.",
            "status": "erfuellt",
            "beleg": "tsc --noEmit ohne Fehler"
          },
          {
            "id": "tsconfig-strict",
            "frage": "TypeScript läuft im strict-Modus.",
            "status": "erfuellt",
            "beleg": "compilerOptions.strict = true"
          },
          {
            "id": "audit-keine-critical",
            "frage": "npm audit meldet keine Schwachstelle der Stufe critical.",
            "status": "erfuellt",
            "beleg": "0 Schwachstellen der Stufe critical"
          },
          {
            "id": "audit-keine-high",
            "frage": "npm audit meldet keine Schwachstelle der Stufe high.",
            "status": "nicht_erfuellt",
            "beleg": "14 Schwachstellen der Stufe high"
          },
          {
            "id": "env-example-vollstaendig",
            "frage": ".env.example dokumentiert jede im Code referenzierte Umgebungsvariable.",
            "status": "nicht_erfuellt",
            "beleg": "11 von 41 dokumentiert — es fehlen 30"
          },
          {
            "id": "deploy-konfig-eindeutig",
            "frage": "Es liegt genau eine Deploy-Konfiguration im Repo (netlify.toml oder vercel.json, nicht beide).",
            "status": "nicht_erfuellt",
            "beleg": "2 konkurrierende Konfigurationen: netlify.toml + vercel.json"
          },
          {
            "id": "deploy-konfig-passt-zum-hoster",
            "frage": "Die Deploy-Konfiguration im Repo passt zu dem Hoster, der die Live-Seite ausliefert.",
            "status": "nicht_erfuellt",
            "beleg": "Live läuft auf vercel, im Repo liegen aber beide Konfigurationen"
          },
          {
            "id": "modell-ids-gepinnt",
            "frage": "Jede verwendete Claude-Modell-ID ist auf eine konkrete Version gepinnt.",
            "status": "nicht_erfuellt",
            "beleg": "1 von 6 gepinnt — frei: claude-haiku, claude-haiku-4-5, claude-opus-4-7, claude-sonnet-4-5, claude-sonnet-4-6"
          },
          {
            "id": "node-engine-deklariert",
            "frage": "package.json deklariert eine engines.node-Spanne.",
            "status": "nicht_erfuellt",
            "beleg": "package.json deklariert kein engines.node"
          },
          {
            "id": "lockfile-synchron",
            "frage": "package-lock.json ist mit package.json synchron.",
            "status": "erfuellt",
            "beleg": "npm ls meldet keine Abweichung"
          }
        ]
      },
      {
        "name": "SEO & Traffic",
        "erfuellt": 9,
        "pruefbar": 10,
        "nichtMessbar": 0,
        "score": 90,
        "kriterien": [
          {
            "id": "indexierbare-seiten-mit-metadata",
            "frage": "Jede indexierbare Seite hat Metadata.",
            "status": "erfuellt",
            "beleg": "alle 61 indexierbaren Seiten haben Metadata (32 bewusst ausgeschlossen)"
          },
          {
            "id": "jedes-rezept-in-sitemap",
            "frage": "Jedes Rezept im Repo hat einen Eintrag in der Live-Sitemap.",
            "status": "erfuellt",
            "beleg": "alle 93 Rezepte in der Sitemap"
          },
          {
            "id": "robots-verweist-auf-sitemap",
            "frage": "robots.txt nennt die Sitemap.",
            "status": "erfuellt",
            "beleg": "https://steakakademie.de/sitemap.xml"
          },
          {
            "id": "gsc-verifiziert",
            "frage": "Die Search-Console-Verifikation liegt als DNS-TXT-Record vor.",
            "status": "erfuellt",
            "beleg": "Search-Console-Verifikation als DNS-TXT vorhanden"
          },
          {
            "id": "ki-crawler-ausdruecklich-erlaubt",
            "frage": "robots.txt adressiert die Answer-Engine-Crawler ausdrücklich.",
            "status": "erfuellt",
            "beleg": "alle 6 Answer-Engine-Crawler ausdrücklich adressiert"
          },
          {
            "id": "strukturierte-daten-in-rezeptvorlage",
            "frage": "Die Rezeptvorlage gibt strukturierte Daten als JSON-LD aus.",
            "status": "erfuellt",
            "beleg": "src/components/RecipeTemplate.tsx enthält application/ld+json"
          },
          {
            "id": "canonical-basis-gesetzt",
            "frage": "Das Root-Layout setzt metadataBase und einen Standard-Canonical.",
            "status": "erfuellt",
            "beleg": "src/app/layout.tsx enthält metadataBase, canonical"
          },
          {
            "id": "og-bildroute-vorhanden",
            "frage": "Die OG-Bildroute für Social-Vorschauen existiert.",
            "status": "erfuellt",
            "beleg": "src/app/api/og vorhanden"
          },
          {
            "id": "geo-check-gruen",
            "frage": "Der Workflow \"GEO-Check\" ist zuletzt erfolgreich gelaufen.",
            "status": "erfuellt",
            "beleg": "\"GEO-Check\" zuletzt success"
          },
          {
            "id": "traffic-datenquelle-angebunden",
            "frage": "Eine serverseitige Traffic-Datenquelle ist angebunden (Search Console, GA4 oder Plausible-API).",
            "status": "nicht_erfuellt",
            "beleg": "keine serverseitige Traffic-Quelle: weder Search-Console- noch GA4- oder Plausible-API. Traffic ist damit für den Generator unmessbar."
          }
        ]
      },
      {
        "name": "Kurse & Diplom-System",
        "erfuellt": 9,
        "pruefbar": 10,
        "nichtMessbar": 0,
        "score": 90,
        "kriterien": [
          {
            "id": "lektionsraster-vollstaendig",
            "frage": "Jede Diplom-Stufe hat gleich viele Lektionen, das Raster ist lückenlos.",
            "status": "erfuellt",
            "beleg": "5 Stufen à 7 Lektionen (35 gesamt), lückenlos"
          },
          {
            "id": "lektions-order-eindeutig",
            "frage": "Innerhalb einer Stufe vergibt keine Lektion eine doppelte order.",
            "status": "erfuellt",
            "beleg": "keine doppelte order in 35 Lektionen"
          },
          {
            "id": "lektionslugs-eindeutig",
            "frage": "Kein lektionSlug kommt doppelt vor.",
            "status": "erfuellt",
            "beleg": "alle 35 lektionSlugs eindeutig"
          },
          {
            "id": "lektions-pflichtfelder",
            "frage": "Jede Lektion hat alle didaktischen und SEO-Pflichtfelder im Frontmatter.",
            "status": "erfuellt",
            "beleg": "alle 9 Pflichtfelder in allen 35 Lektionen gesetzt"
          },
          {
            "id": "medaillenbilder-vorhanden",
            "frage": "Jede in Medal.tsx referenzierte Medaille hat ihre Bilddatei.",
            "status": "erfuellt",
            "beleg": "alle 5 Medaillenbilder vorhanden"
          },
          {
            "id": "stufen-zentral-definiert",
            "frage": "Die Diplom-Stufen sind zentral definiert, nicht in mehreren Komponenten dupliziert.",
            "status": "nicht_erfuellt",
            "beleg": "keine zentrale Datei; 2 Stellen definieren Stufen: src/app/diplome/roadmap/page.tsx, src/app/diplome/lernen/[stufe]/[lektion]/page.tsx"
          },
          {
            "id": "fortschritt-migriert",
            "frage": "Die Fortschritts-Tabellen liegen als Supabase-Migration vor.",
            "status": "erfuellt",
            "beleg": "supabase/migrations/20260603_course_progress_profiles.sql vorhanden"
          },
          {
            "id": "kurszugriff-migriert",
            "frage": "Die Zugriffsregel für Kursinhalte liegt als Supabase-Migration vor.",
            "status": "erfuellt",
            "beleg": "supabase/migrations/010_course_access_policy.sql vorhanden"
          },
          {
            "id": "urkunden-route",
            "frage": "Die Urkunden-Seite existiert als Route.",
            "status": "erfuellt",
            "beleg": "src/app/diplome/urkunde vorhanden"
          },
          {
            "id": "badge-bildroute",
            "frage": "Die OG-Badge-Route für Diplom-Nachweise existiert.",
            "status": "erfuellt",
            "beleg": "src/app/api/og/badge vorhanden"
          }
        ]
      },
      {
        "name": "KI-System & Automation",
        "erfuellt": 5,
        "pruefbar": 9,
        "nichtMessbar": 0,
        "score": 56,
        "kriterien": [
          {
            "id": "zentrale-modell-definition",
            "frage": "Die Claude-Modell-IDs stehen an einer zentralen Stelle statt als Literale im Code verstreut.",
            "status": "nicht_erfuellt",
            "beleg": "18 Dateien mit Modell-Literal, keine zentrale Definition (src/app/api/chat/route.ts, src/app/api/kochwissen/generieren/route.ts, src/app/api/kochwissen/route.ts, src/app/api/mein-protokoll/generate/route.ts … +14)"
          },
          {
            "id": "jeder-workflow-hat-trigger",
            "frage": "Jeder Workflow im Repo hat mindestens einen Trigger.",
            "status": "erfuellt",
            "beleg": "alle 16 Workflows haben mindestens einen Trigger"
          },
          {
            "id": "geplante-workflows-laufen",
            "frage": "Jeder Workflow mit schedule ist in der Laufhistorie aufgetaucht.",
            "status": "erfuellt",
            "beleg": "alle 5 geplanten Workflows sind gelaufen"
          },
          {
            "id": "generatoren-lesen-faktenreferenz",
            "frage": "Jeder inhaltserzeugende Agent liest die kanonische Kerntemperatur-Referenz (Regel 8c).",
            "status": "nicht_erfuellt",
            "beleg": "1 von 1 lesen kerntemperatur-referenz nicht: scripts/recipe-agent.mjs"
          },
          {
            "id": "generatoren-pushen-nicht-direkt",
            "frage": "Kein Workflow pusht generierte Artefakte direkt, ohne Pull Request (Regel 4).",
            "status": "nicht_erfuellt",
            "beleg": "4 Workflows pushen direkt statt per PR: glossary-grow.yml, recipe-grow.yml, regenerate-recipe-images.yml, train-pork-lora.yml"
          },
          {
            "id": "moderation-fuer-einreichungen",
            "frage": "Nutzereinreichungen durchlaufen ein Moderations-Gate.",
            "status": "erfuellt",
            "beleg": "Einreichungen durchlaufen ein Moderations-Gate (approved/needs_review/rejected)"
          },
          {
            "id": "embedding-modell-konfigurierbar",
            "frage": "Das Embedding-Modell ist über eine Umgebungsvariable konfigurierbar.",
            "status": "erfuellt",
            "beleg": "über VOYAGE_MODEL konfigurierbar (1 Stelle(n))"
          },
          {
            "id": "ki-routen-mit-fehlerbehandlung",
            "frage": "Jede API-Route mit KI-Aufruf fängt Fehler ab.",
            "status": "nicht_erfuellt",
            "beleg": "1 von 8 ohne catch: pm-agent/route.ts"
          },
          {
            "id": "kochwissen-ingest-gruen",
            "frage": "Der Workflow \"Kochwissen ingestieren\" ist zuletzt erfolgreich gelaufen.",
            "status": "erfuellt",
            "beleg": "\"Kochwissen ingestieren (Supabase + Voyage)\" zuletzt success"
          }
        ]
      },
      {
        "name": "Monetarisierung",
        "erfuellt": 8,
        "pruefbar": 10,
        "nichtMessbar": 0,
        "score": 80,
        "kriterien": [
          {
            "id": "amazon-links-mit-partner-tag",
            "frage": "Jeder Amazon-Link trägt den Partner-Tag.",
            "status": "erfuellt",
            "beleg": "alle 26 Amazon-Links tragen tag=steakakademie-21"
          },
          {
            "id": "keine-platzhalter-links",
            "frage": "Kein Produkt verweist noch auf einen Platzhalter-Link.",
            "status": "erfuellt",
            "beleg": "kein Platzhalter unter 32 Produkten"
          },
          {
            "id": "jeder-produktlink-mit-tracking",
            "frage": "Jeder Produktlink trägt einen Tracking-Parameter, verdient also bei Klick.",
            "status": "nicht_erfuellt",
            "beleg": "6 von 32 Links ohne Tracking-Parameter: ankarsrum-assistent-original, otto-gourmet-wagyu-box, beefer-pro-ii, beefer-xl-ii, dry-ager-dx500, dry-ager-dx1000"
          },
          {
            "id": "provider-in-programmregistry",
            "frage": "Jeder provider-Wert in registry.yaml ist in affiliate-programs.yaml hinterlegt.",
            "status": "nicht_erfuellt",
            "beleg": "2 provider ohne Programmeintrag: other, otto-gourmet"
          },
          {
            "id": "mindestens-ein-programm-aktiv",
            "frage": "Mindestens ein Affiliate-Programm steht auf status active.",
            "status": "erfuellt",
            "beleg": "1 von 5 aktiv: amazon"
          },
          {
            "id": "produktdaten-aktuell",
            "frage": "Kein Produkt wurde länger als 90 Tage nicht geprüft.",
            "status": "erfuellt",
            "beleg": "ältester Eintrag 84 Tage alt, Grenze 90"
          },
          {
            "id": "alle-produkte-mit-pruefdatum",
            "frage": "Jedes Produkt trägt ein lastChecked-Datum.",
            "status": "erfuellt",
            "beleg": "alle 32 Produkte haben ein lastChecked-Datum"
          },
          {
            "id": "werbekennzeichnung-in-komponenten",
            "frage": "Jede Affiliate-Komponente kennzeichnet Werbung (Regel 1).",
            "status": "erfuellt",
            "beleg": "alle 6 Affiliate-Komponenten kennzeichnen Werbung"
          },
          {
            "id": "webhook-weist-ohne-token-ab",
            "frage": "Der Digistore-Webhook weist Anfragen ohne gültiges Token mit 401 ab.",
            "status": "erfuellt",
            "beleg": "Token wird geprüft, sonst 401"
          },
          {
            "id": "affiliate-link-check-gruen",
            "frage": "Der Workflow \"Affiliate Link Check\" ist zuletzt erfolgreich gelaufen.",
            "status": "erfuellt",
            "beleg": "\"Affiliate Link Check\" zuletzt success"
          }
        ]
      },
      {
        "name": "Technische Infrastruktur",
        "erfuellt": 9,
        "pruefbar": 12,
        "nichtMessbar": 0,
        "score": 75,
        "kriterien": [
          {
            "id": "live-erreichbar",
            "frage": "Die Live-Seite antwortet über HTTPS mit Status 200.",
            "status": "erfuellt",
            "beleg": "HTTP 200"
          },
          {
            "id": "hsts-aktiv",
            "frage": "Die Live-Seite sendet einen Strict-Transport-Security-Header.",
            "status": "erfuellt",
            "beleg": "strict-transport-security: max-age=63072000; includeSubDomains; preload"
          },
          {
            "id": "basis-security-header",
            "frage": "Die Live-Seite sendet die vier Basis-Security-Header.",
            "status": "erfuellt",
            "beleg": "x-content-type-options: nosniff · x-frame-options: DENY · referrer-policy: strict-origin-when-cross-origin · permissions-policy: camera=(), microphone=(), geolocation=()"
          },
          {
            "id": "csp-gesetzt",
            "frage": "Die Live-Seite sendet eine Content-Security-Policy.",
            "status": "nicht_erfuellt",
            "beleg": "nicht gesetzt: content-security-policy"
          },
          {
            "id": "dns-ueber-cloudflare",
            "frage": "Die Nameserver der Domain liegen bei Cloudflare.",
            "status": "erfuellt",
            "beleg": "2 Cloudflare-Nameserver: rohin.ns.cloudflare.com, zita.ns.cloudflare.com"
          },
          {
            "id": "mail-empfang-konfiguriert",
            "frage": "Die Domain hat MX-Einträge und kann Mail empfangen.",
            "status": "erfuellt",
            "beleg": "3 MX-Einträge: route2.mx.cloudflare.net, route1.mx.cloudflare.net, route3.mx.cloudflare.net"
          },
          {
            "id": "spf-vorhanden",
            "frage": "Die Domain veröffentlicht einen SPF-Record.",
            "status": "erfuellt",
            "beleg": "v=spf1 include:_spf.mx.cloudflare.net ~all"
          },
          {
            "id": "dmarc-erzwingend",
            "frage": "Die DMARC-Politik weist Fälschungen ab (p=quarantine oder p=reject).",
            "status": "nicht_erfuellt",
            "beleg": "p=none — protokolliert nur, weist nichts ab"
          },
          {
            "id": "robots-und-sitemap-live",
            "frage": "robots.txt und sitemap.xml sind auf der Live-Seite abrufbar.",
            "status": "erfuellt",
            "beleg": "/robots.txt → 200, /sitemap.xml → 200"
          },
          {
            "id": "workflows-ohne-fehlschlag",
            "frage": "Kein GitHub-Workflow steht mit seinem letzten Lauf auf failure.",
            "status": "nicht_erfuellt",
            "beleg": "2 von 12 zuletzt fehlgeschlagen: Content-Pipeline (Scout → Draft), Weekly Newsletter"
          },
          {
            "id": "middleware-vorhanden",
            "frage": "Eine Next.js-Middleware ist im Repo angelegt.",
            "status": "erfuellt",
            "beleg": "src/middleware.ts vorhanden"
          },
          {
            "id": "rls-haertung-migriert",
            "frage": "Die Supabase-RLS-Härtung liegt als Migration im Repo.",
            "status": "erfuellt",
            "beleg": "supabase/migrations/008_tighten_rls.sql vorhanden"
          }
        ]
      }
    ],
    "nichtGemessen": [
      {
        "name": "Content-Strategie",
        "grund": "Nenner ungeklärt. Es gibt weder Keyword-Map noch Redaktionsplan als Datei — ohne beides ist der Bereich nicht ehrlich zu bepunkten."
      }
    ],
    "critical": [
      "Ribeye Pillar Page `/cuts/ribeye` (18k Suchen/Monat) — höchster Traffic-Hebel, erster End-to-End-Lauf der neuen Pipeline (SEO→GEO→Content→Compliance).",
      "Monetarisierung verdrahten: Digistore24 Danke-/Webhook→Supabase, Diplom Bronze live.",
      "Community: Supabase Auth (OAuth + Magic Link) ist live — offen ist nur noch der Community-Teil.",
      "Affiliate-Programme anmelden (Santos, Grillfürst, Ankerkraut, Otto Gourmet) + PA-API.",
      "Marken-Frist: Wortmarke „Steakakademie\" — Gebühr offen, Frist ~27.08.2026 (KAN-17)."
    ],
    "completed": [
      "Alle drei KI-Personas (Marco, Jonas, Elena) sind in authors.ts angelegt.",
      "Marcos Porträtbild liegt unter public/images/authors/marco-richter.jpg.",
      "Marcos Rückenansicht (Normalzustand am Grill) liegt unter public/images/marco-back.jpg.",
      "ROTATIONS in MarcoAvatar.tsx deckt jeden Zustand des Automaten ab.",
      "Die Autorenseite /autoren/[slug] existiert als Route.",
      "Die Seite /ki-disclaimer existiert als Route.",
      "Die Avatar-Leitlinie ist in docs/avatare/marco.md festgehalten.",
      "Keine KI-Persona-Bio behauptet selbst gelebte Erfahrung oder eigene Produkttests.",
      "tsc --noEmit läuft fehlerfrei durch.",
      "TypeScript läuft im strict-Modus.",
      "npm audit meldet keine Schwachstelle der Stufe critical.",
      "package-lock.json ist mit package.json synchron.",
      "Jede indexierbare Seite hat Metadata.",
      "Jedes Rezept im Repo hat einen Eintrag in der Live-Sitemap.",
      "robots.txt nennt die Sitemap.",
      "Die Search-Console-Verifikation liegt als DNS-TXT-Record vor.",
      "robots.txt adressiert die Answer-Engine-Crawler ausdrücklich.",
      "Die Rezeptvorlage gibt strukturierte Daten als JSON-LD aus.",
      "Das Root-Layout setzt metadataBase und einen Standard-Canonical.",
      "Die OG-Bildroute für Social-Vorschauen existiert.",
      "Der Workflow \"GEO-Check\" ist zuletzt erfolgreich gelaufen.",
      "Jede Diplom-Stufe hat gleich viele Lektionen, das Raster ist lückenlos.",
      "Innerhalb einer Stufe vergibt keine Lektion eine doppelte order.",
      "Kein lektionSlug kommt doppelt vor.",
      "Jede Lektion hat alle didaktischen und SEO-Pflichtfelder im Frontmatter.",
      "Jede in Medal.tsx referenzierte Medaille hat ihre Bilddatei.",
      "Die Fortschritts-Tabellen liegen als Supabase-Migration vor.",
      "Die Zugriffsregel für Kursinhalte liegt als Supabase-Migration vor.",
      "Die Urkunden-Seite existiert als Route.",
      "Die OG-Badge-Route für Diplom-Nachweise existiert.",
      "Jeder Workflow im Repo hat mindestens einen Trigger.",
      "Jeder Workflow mit schedule ist in der Laufhistorie aufgetaucht.",
      "Nutzereinreichungen durchlaufen ein Moderations-Gate.",
      "Das Embedding-Modell ist über eine Umgebungsvariable konfigurierbar.",
      "Der Workflow \"Kochwissen ingestieren\" ist zuletzt erfolgreich gelaufen.",
      "Jeder Amazon-Link trägt den Partner-Tag.",
      "Kein Produkt verweist noch auf einen Platzhalter-Link.",
      "Mindestens ein Affiliate-Programm steht auf status active.",
      "Kein Produkt wurde länger als 90 Tage nicht geprüft.",
      "Jedes Produkt trägt ein lastChecked-Datum.",
      "Jede Affiliate-Komponente kennzeichnet Werbung (Regel 1).",
      "Der Digistore-Webhook weist Anfragen ohne gültiges Token mit 401 ab.",
      "Der Workflow \"Affiliate Link Check\" ist zuletzt erfolgreich gelaufen.",
      "Die Live-Seite antwortet über HTTPS mit Status 200.",
      "Die Live-Seite sendet einen Strict-Transport-Security-Header.",
      "Die Live-Seite sendet die vier Basis-Security-Header.",
      "Die Nameserver der Domain liegen bei Cloudflare.",
      "Die Domain hat MX-Einträge und kann Mail empfangen.",
      "Die Domain veröffentlicht einen SPF-Record.",
      "robots.txt und sitemap.xml sind auf der Live-Seite abrufbar.",
      "Eine Next.js-Middleware ist im Repo angelegt.",
      "Die Supabase-RLS-Härtung liegt als Migration im Repo."
    ],
    "open": [
      "Jeder in authors.ts referenzierte avatar-Pfad zeigt auf eine existierende Datei.",
      "Jeder sichtbare Zustand des Avatar-Automaten hat ein Video-Asset.",
      "npm audit meldet keine Schwachstelle der Stufe high.",
      ".env.example dokumentiert jede im Code referenzierte Umgebungsvariable.",
      "Es liegt genau eine Deploy-Konfiguration im Repo (netlify.toml oder vercel.json, nicht beide).",
      "Die Deploy-Konfiguration im Repo passt zu dem Hoster, der die Live-Seite ausliefert.",
      "Jede verwendete Claude-Modell-ID ist auf eine konkrete Version gepinnt.",
      "package.json deklariert eine engines.node-Spanne.",
      "Eine serverseitige Traffic-Datenquelle ist angebunden (Search Console, GA4 oder Plausible-API).",
      "Die Diplom-Stufen sind zentral definiert, nicht in mehreren Komponenten dupliziert.",
      "Die Claude-Modell-IDs stehen an einer zentralen Stelle statt als Literale im Code verstreut.",
      "Jeder inhaltserzeugende Agent liest die kanonische Kerntemperatur-Referenz (Regel 8c).",
      "Kein Workflow pusht generierte Artefakte direkt, ohne Pull Request (Regel 4).",
      "Jede API-Route mit KI-Aufruf fängt Fehler ab.",
      "Jeder Produktlink trägt einen Tracking-Parameter, verdient also bei Klick.",
      "Jeder provider-Wert in registry.yaml ist in affiliate-programs.yaml hinterlegt.",
      "Die Live-Seite sendet eine Content-Security-Policy.",
      "Die DMARC-Politik weist Fälschungen ab (p=quarantine oder p=reject).",
      "Kein GitHub-Workflow steht mit seinem letzten Lauf auf failure."
    ],
    "generatedAt": "2026-08-13T12:59:33.069Z",
    "offline": false
  }
