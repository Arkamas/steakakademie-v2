// ⚠️ NICHT MEHR AUTO-GENERIERT — diese Datei wird von Hand gepflegt.
//
// Der Dateiname und der frühere Header behaupteten, `generate-pm-context.js`
// schreibe die Datei bei jeder CLAUDE.md-Änderung neu. Das ist unwahr:
// Ein solches Skript liegt nicht im Repo und wurde auch **nie** committet
// (`git log --all --diff-filter=A -- '*generate-pm-context*'` ist leer) — es
// lief nur lokal außerhalb des Repos. Letzter erzeugter Stand: `generatedAt`
// unten, 25.06.2026; seither keine Regeneration mehr möglich.
//
// Konsequenz: Änderungen an CLAUDE.md landen hier NICHT automatisch. Wer
// CLAUDE.md §1 anfasst, muss diese Datei von Hand nachziehen — oder den
// Generator neu bauen und diesen Hinweis wieder entfernen.
//
// Inhaltliche Quelle bleibt: ../../../CLAUDE.md

export interface ProjectStatus {
  readinessScore: number
  completed: string[]
  critical: string[]
  next: string[]
  open: string[]
  branches: Record<string, number>
  generatedAt: string
}

export const PROJECT_STATUS: ProjectStatus = {
  "readinessScore": 52,
  "completed": [
    "Email-Capture",
    "Sitemap & Robots",
    "Temperatur-Guide",
    "Reverse-Sear Guide",
    "Instagram",
    "TikTok",
    "Facebook",
    "ANTHROPIC_API_KEY",
    "Digistore24 Integration",
    "Reverse-Sear Methode",
    "Marco",
    "Jonas",
    "Elena",
    "Portraits generieren",
    "Domain steakakademie.de",
    "Cloudflare DNS",
    "Netlify Hosting",
    "Next.js 14 App Router",
    "CLAUDE.md Mindmap-Hook",
    "OG-Image",
    "Sitemap",
    "Sitemap bei Google eingereicht",
    "E-Mail Aliases",
    "Diplom-Seite",
    "Physisches Diplom"
  ],
  "critical": [
    "Cut-Atlas Redesign",
    "fal.ai",
    "Loops DNS verify (nach MX/SPF/DMARC-Propagation)",
    "Erste-Kunden-Sprint Landingpage (Produkt F)",
    "Ribeye Pillar Page `/cuts/ribeye` (18k searches/Monat)",
    "Digistore24 Danke-URLs eintragen (nach Netlify-Deploy)",
    "Amazon PA-API Credentials: AMAZON_ACCESS_KEY + AMAZON_SECRET_KEY in .env.local + Netlify",
    "Affiliate-Programme anmelden: Santosgrills, Grillfürst, Ankerkraut, Otto Gourmet",
    "Güde Direktkontakt — info@guede.com (kein öffentliches Affiliate-Programm bekannt)",
    "Supabase Auth abschließen (OAuth + Magic Link)",
    "BBQ Grundkurs Struktur in Supabase anlegen",
    "Fleischpass Freemium-Tool (Produkt C) — Supabase sessions-Tabelle",
    "Digistore24 Webhook → Supabase bookings verdrahten",
    "BBQ Grundkurs Kursinhalt (Text + Video-Skripte)",
    "Diplom Bronze über Digistore24 monetarisieren",
    "BBQ Grundkurs Launch",
    "Diplom Silber (Stufe 2)",
    "KI als Produkt (GF 2) — System-Lizenz/Agentur-Paket",
    "Diplom Gold/Meister (Stufe 3)"
  ],
  "next": [
    "YouTube",
    "Affiliate Marketing",
    "Supabase Auth",
    "Stufe 1 Bronze „Der Funke\"",
    "Stufe 2 Silber „Die Flamme Bezähmen\"",
    "Stufe 3 Gold „Hitzekontrolle\"",
    "Stufe 4 Platin „Präzision & Geschmack\"",
    "Stufe 5 Meister „Der vollendete Pitmaster\"",
    "Supabase",
    "Autoren-Profile `/autoren/marco`, `/autoren/jonas`, `/autoren/elena`",
    "Digistore24 Produkt 695797 Titel fix: \"11 Länder\" → \"23 Länder\"",
    "Digistore24 Testbestellungen Produkt 695894 + 695900"
  ],
  "open": [
    "Ribeye Pillar Page",
    "AI-Search GEO",
    "Meta-Pixel Seiten-/Produktdaten nutzen",
    "Instagram Erstes Posting",
    "TikTok Erstes Video",
    "Email-Liste aufbauen",
    "Erster Kurs (Eigenbau via Supabase)",
    "Physisches Diplom",
    "Display-Werbung",
    "Sponsoring & Partner",
    "Meta-Pixel „Detailliertere Seiten-/Produktinfos\" aktivieren",
    "Fortschritt-Tracking",
    "Gamification",
    "\"Steak des Monats\" Challenge",
    "Forum oder Discord",
    "Community Rezept-Plattform",
    "Ribeye Deep-Dive",
    "Autoren-Profile",
    "Präzise Rezepte",
    "Vegetarisch/Vegan BBQ"
  ],
  // ⚠️ UNGEPRÜFT. Alle acht Werte stammen aus demselben Lauf vom 25.06.2026 wie
  // die beiden hier entfernten Einträge "Auth & Community": 0 und
  // "Agenten & Automation": 0. Die zwei Nullen hat das Konsistenz-Audit vom
  // 10.08.2026 als nachweislich falsch belegt (CLAUDE.md §1) — damit ist die
  // Methodik des gesamten Laufs fraglich, nicht nur diese zwei Zahlen.
  // Entfernt statt geschätzt (Regel 7: erst messen, dann eintragen); die
  // verbleibenden acht sind aus demselben Grund nicht als Fakten zu behandeln.
  // Sie werden im Admin-Dashboard (/admin/pm-agent) als Balken gerendert und
  // fließen in den System-Prompt des PM-Agenten (pm-agent-context.ts).
  "branches": {
    "SEO & Traffic": 54,
    "Monetarisierung": 22,
    "Content-Strategie": 17,
    "Avatar-System": 57,
    "Technische Infrastruktur": 75,
    "Kurse & Diplom-System": 50,
    "Tech-Stack & Tools": 76,
    "KI-System & Automation": 58
  },
  "generatedAt": "2026-06-25T18:51:00.989Z"
}
