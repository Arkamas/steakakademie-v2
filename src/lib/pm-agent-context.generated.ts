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
    "erfuelltGesamt": 12,
    "pruefbarGesamt": 20,
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
      }
    ],
    "nichtGemessen": [
      {
        "name": "SEO & Traffic",
        "grund": "Struktur-Checks wären sofort möglich. Für echte Messwerte sind Search Console (DNS-verifiziert) und GA4 anzubinden — noch nicht getan."
      },
      {
        "name": "Monetarisierung",
        "grund": "Affiliate-Status und Deeplink-Quote sind auslesbar; Umsatz erst mit Digistore24-API-Zugang."
      },
      {
        "name": "Content-Strategie",
        "grund": "Nenner ungeklärt. Es gibt weder Keyword-Map noch Redaktionsplan als Datei — ohne beides ist der Bereich nicht ehrlich zu bepunkten."
      },
      {
        "name": "Technische Infrastruktur",
        "grund": "Kriterien noch nicht formuliert."
      },
      {
        "name": "Kurse & Diplom-System",
        "grund": "Lektionsraster ist auslesbar (5x7 vollständig); offen ist die Bewertung des Widerspruchs 5 Lektionsstufen gegen 4 Diplom-Stufen im Code."
      },
      {
        "name": "KI-System & Automation",
        "grund": "Workflow-Gesundheit ist über die GitHub-API messbar; Kriterien noch nicht formuliert."
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
      "package-lock.json ist mit package.json synchron."
    ],
    "open": [
      "Jeder in authors.ts referenzierte avatar-Pfad zeigt auf eine existierende Datei.",
      "Jeder sichtbare Zustand des Avatar-Automaten hat ein Video-Asset.",
      "npm audit meldet keine Schwachstelle der Stufe high.",
      ".env.example dokumentiert jede im Code referenzierte Umgebungsvariable.",
      "Es liegt genau eine Deploy-Konfiguration im Repo (netlify.toml oder vercel.json, nicht beide).",
      "Die Deploy-Konfiguration im Repo passt zu dem Hoster, der die Live-Seite ausliefert.",
      "Jede verwendete Claude-Modell-ID ist auf eine konkrete Version gepinnt.",
      "package.json deklariert eine engines.node-Spanne."
    ],
    "generatedAt": "2026-08-13T12:03:15.127Z",
    "offline": false
  }
