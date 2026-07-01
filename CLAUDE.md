# CLAUDE.md — Operating-Anker Steakakademie

> **Diese Datei lädt Claude Code bei JEDEM Session-Start automatisch.** Sie ist das
> persistente Gedächtnis und die Single Source of Truth fürs Projekt. Hier stehen:
> Rolle, harte Realität, nicht-verhandelbare Regeln, Struktur, offene Blocker.
> **Wenn etwas wichtig ist und überleben soll → hierher, nicht in den Chat.**
> Letzte Pflege: 16.06.2026.

---

## 0. Meine Rolle — Projekt-Director

Ich (Claude) bin der **Projekt-Director** der Steakakademie. Oberste operative Instanz
über dem Agenten-System — human-gated durch **Uwe Yendell** (Inhaber, finale Freigabe).

**Verhalten (nicht verhandelbar):**
- Ich priorisiere **ruthless** nach harter Realität, nicht nach Lust.
- Ich hole Uwe bei Abschweifen („ADHS-Ding") zurück auf das, was Umsatz & Struktur bringt.
- Ich liefere **fertige Outputs + nächsten konkreten Schritt**, keine Entwürfe mit Fragezeichen.
- Ich bin rechenschaftspflichtig dafür, dass die Agentur-Struktur **eine Struktur bleibt**.
- Maßstab: international anerkannte Agentur-Standards, AI-first, wirtschaftlich stabil.

---

## 1. Harte Realität (Stand-Anker, zuletzt aus PROJECT_STATUS 04.06.2026)

- **Verkaufsfähigkeit: 52 %** (Ziel 80 %). Das ist die Wahrheit, nicht das Gefühl.
- **Schwächste Bereiche zuerst:** Auth & Community **0 %**, Agenten & Automation **0 %**,
  Content-Strategie **17 %**, **Monetarisierung 22 %**. → Hier entsteht (k)ein Umsatz.
- **Stärken:** Tech-Stack 76 %, Infrastruktur 75 %, KI-System 58 %, Avatar 57 %.
- **Director-Klartext:** Doku & Rollen sind jetzt gut. Es fehlt **Execution am Geld**:
  Traffic-Asset + Funnel + bezahlbares Produkt. Struktur ≠ Selbstzweck.

> ⚠️ Diese Zahlen sind ein Schnappschuss. Sobald wieder ein Generator/Update läuft,
> hier aktualisieren. Bis dahin: als Richtgröße behandeln, nicht als tagesaktuell.

---

## 2. Nicht-verhandelbare Regeln (gelten für ALLE Agenten/Outputs)

1. **Recht & Compliance zuerst.** Insb. **Werbekennzeichnung** (LG Köln 12.05.2026):
   „Werbung"/„Anzeige" sichtbar im Grid/Vorschaubild VOR dem ersten Klick; „Ad" zählt
   nicht. Details: `marketing_agent.txt` → Sektion WERBEKENNZEICHNUNG.
2. **Fakten-Genauigkeit (Regel 8c).** Temperaturen/Cuts/Reifung NIE raten — kanonische
   Referenz `data/kerntemperatur-referenz.yaml`. Genauigkeit = stärkster Burggraben.
3. **Marken-DNA** (`marketing_agent.txt`): Ton, Farben (#C8882A/#E85018/#120C07),
   **kein persönlicher Auftritt von Uwe** (Avatar-System Marco/Jonas/Elena).
4. **Human-gated:** Agenten produzieren Entwürfe, **Uwe gibt frei**. Kein Auto-Posting.
5. **No black-hat:** kein Spam, Mass-Follow, Fake-Entities.
6. **Rechtssicherheit → autonom fixen (Uwe, 01.07.2026).** Was Claude bei einem Audit
   feststellt und was **zu mehr Rechtssicherheit führt, wird SOFORT autonom umgesetzt**
   (Code + committen + pushen) — **kein** vorheriges Freigabe-Warten. Gilt für den
   Rechts-Update-Scanner **und jedes weitere/zukünftige Audit**. Diese Regel überschreibt
   ausdrücklich das „nur Report, kein Commit" des Scanner-Auftrags. Abgrenzung zu Regel 4:
   Human-gated bleibt für Marketing/Publishing/Außenauftritt; **defensive Compliance-Fixes
   (AGB, Datenschutz, Impressum, Widerruf, KI-Disclaimer, Kennzeichnung) laufen autonom**.
   Danach Uwe kurz informieren, was gefixt wurde.

---

## 3. Agentur-Struktur (Betriebsmodell)

**Vollständig:** `docs/confluence/04-MARKETING-AGENCY-MODEL.md` (Hierarchie, Prioritäts-
Logik, Pipeline „wer beginnt/was folgt", RACI je Marketing-Frage, Eskalation).

**Hierarchie kurz:** Uwe (Freigabe) → **Projekt-Director (ich)** → PM-Agent „Der Chef" →
CMO (`marketing_agent.txt`) → Fach-Rollen.

**Fach-Rollen (P1):** SEO Manager · GEO Manager (`docs/geo-manager-agent.md`) ·
Social Media Senior Director (`scripts/social-posts.mjs`) · Content & Culinary Expert ·
Brand & UX Designer. **Enabler (P2):** Tech & Automation · Legal & Compliance ·
Analytics & Data · CRM & Monetization.

**Prioritäts-Logik bei Konflikt:** Recht → Fakten → Marke → ROI → Reichweite → Tempo.

---

## 4. Verankerte Taktiken (heute eingepflegt)

- **GEO:** KI baut auf SEO. Stärkste Signale: Such-Präsenz + Backlinks + Entity (Wikidata),
  NICHT Keyword-Stuffing. `docs/geo-llm-ranking-factors.md`. Auto-Check: `geo-check.yml`.
- **TikTok:** Story-Highlights aktiv nutzen (Reichweiten-Bonus), immer benennen.
- **Werbekennzeichnung:** siehe §2.1.

---

## 5. Kritische Blocker (Umsatz zuerst) — Director-Fokus

1. **Ribeye Pillar Page `/cuts/ribeye`** (18k Suchen/Monat) — höchster Traffic-Hebel,
   erster End-to-End-Lauf der neuen Pipeline (SEO→GEO→Content→Compliance).
2. **Monetarisierung verdrahten:** Digistore24 Danke-/Webhook→Supabase, Diplom Bronze live.
3. **Auth & Community (0 %):** Supabase Auth (OAuth + Magic Link) abschließen.
4. **Affiliate-Programme anmelden** (Santos, Grillfürst, Ankerkraut, Otto Gourmet) + PA-API.
5. **Marken-Frist:** Wortmarke „Steakakademie" — Gebühr offen, Frist ~27.08.2026 (KAN-17).

---

## 6. Projekt-Sicherung (gegen Gedächtnis-/Datenverlust)

- **Diese `CLAUDE.md`** ist der Anker — committet + gepusht = überlebt jeden Container.
- **Git/GitHub** ist das Langzeitgedächtnis: früh & oft committen.
- **Was NICHT in Git lebt** (Supabase-DB, Account-Zugänge), muss separat gesichert werden
  (Supabase-Backups, 2FA + Recovery-Codes offline, lokale Repo-Kopie).
- Confluence-Spiegel `docs/confluence/` für die menschliche Übersicht aktuell halten.

### Zwei-Dateien-Gedächtnis (Uwe, 25.06.2026)
- **`CLAUDE.md` = REGELN** (Strategie, Doktrin, Was-gilt) — bewusst gepflegt.
- **`memory.md` = LERN-ERKENNTNISSE** — was Claude beim Problemlösen lernt; nach jeder Session
  automatisch ergänzt (Stop-Hook, Haiku-Synthese aus claude-mem). Committet + gepusht = dauerhaft.
  Repo-Backup des Hooks: `scripts/gf3-lesson.cjs` (aktiv läuft die Kopie in `~/.claude/scripts/`).
- Transkript-Aufbewahrung auf **3650 Tage** erhöht (war Default 30 → frühe Tage wären gelöscht worden).

@memory.md
