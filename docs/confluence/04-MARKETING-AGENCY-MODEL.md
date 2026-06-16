# [MARKETING-AGENCY-MODEL] — Betriebsmodell der virtuellen Agentur

> **Zweck:** Das Agenten-System der Steakakademie agiert wie eine **international
> anerkannte, international agierende Marketing-Agentur** — AI-first, human-gated,
> wirtschaftlich stabil. Diese Seite definiert **Hierarchie, Prioritäten, Reihenfolge
> (wer beginnt, was kommt als Nächstes) und den geschlossenen Team-Reflex** auf jede
> Marketing-Frage. Angelegt 16.06.2026.
> **Verwandt:** `00-AGENT-MATRIX.md` (Bestand), `01-STRATEGY.md` (Burggräben),
> `marketing_agent.txt` (CMO-Doktrin), `docs/geo-manager-agent.md`.

---

## 1. Organigramm & Prioritäts-Tiers (wer steht wo)

```
                 ┌─────────────────────────────┐
   INHABER       │  Uwe Yendell — finale Freigabe (human gate)   │
                 └──────────────┬──────────────┘
   P0 FÜHRUNG    ┌──────────────┴──────────────┐
                 │  PM-Agent „Der Chef" (Managing Director)      │  ← Intake, Triage, Priorisierung
                 └──────────────┬──────────────┘
   P0.5 MARKETING ┌─────────────┴──────────────┐
                 │  CMO = Marketing-Autonomie-Agent (marketing_agent.txt) │ ← Marketing-Strategie & Briefing
                 └──────────────┬──────────────┘
   P1 KERN-DISZIPLINEN (Fachabteilungs-Leitungen)
     ├── SEO Manager                    (in Google ranken)
     ├── GEO Manager                    (von KI zitiert werden — baut auf SEO)
     ├── Social Media Senior Director   (Reichweite, Community, Kanäle)
     ├── Content & Culinary Expert      (Pitmaster-Doktrin, Texte, Fakten)
     └── Brand & UX Designer            („High-Tech & Smoke", FLUX-Bilder)
   P2 ENABLER / SUPPORT
     ├── Tech & Automation Engineer     (Martech, Pipelines, Deploy, Analytics-Setup)
     ├── Legal & Compliance             (Rechts-Check, Werbekennzeichnung, DSGVO)
     ├── Analytics & Data               (KPIs, GA4/GSC, Performance-Report)
     └── CRM & Monetization             (E-Mail/Loops, Affiliate, Digistore24)
```

**Prinzip:** P0 entscheidet & priorisiert, P0.5 übersetzt in Marketing-Strategie,
P1 liefert das Fach-Handwerk, P2 macht es technisch/rechtlich/messbar möglich.

---

## 2. Prioritäts-Logik bei Konflikten (was schlägt was)

Wenn zwei Rollen sich widersprechen, gilt diese **feste Rangfolge** (oben gewinnt):

1. **Recht & Compliance** — nicht verhandelbar (Abmahnung killt Wirtschaftlichkeit).
2. **Fakten-Genauigkeit / Pitmaster-Doktrin** (Regel 8c) — der stärkste Burggraben.
3. **Marken-DNA** (`marketing_agent.txt`) — Ton, Farben, „kein persönlicher Auftritt Uwe".
4. **Verkaufsfähigkeit / ROI** — trägt zur Umsatz-Fähigkeit bei (PM-Agent-Nordstern).
5. **Reichweite & Sichtbarkeit** — SEO/GEO/Social.
6. **Tempo / Volumen** — zuletzt; nie auf Kosten von 1–3.

> Merksatz: **Erst legal & wahr, dann markenkonform & profitabel, dann sichtbar & schnell.**

---

## 3. Standard-Pipeline — wer beginnt, was kommt als Nächstes

Jeder größere Marketing-Output durchläuft diese Phasen. **Lead** = führt die Phase,
**zuarbeitend** = liefert zu, **Gate** = muss passieren, bevor es weitergeht.

| # | Phase | Lead | Zuarbeitend | Output / Gate |
|---|-------|------|-------------|---------------|
| 0 | **Intake & Triage** | PM-Agent | — | Anfrage klassifiziert, Priorität gesetzt |
| 1 | **Strategie & Briefing** | CMO | SEO/GEO/Social je nach Ziel | Briefing (Ziel, Zielgruppe, Kanal, KPI) |
| 2 | **Recherche & Fakten** | Content & Culinary Expert | SEO Manager (Keywords), GEO Manager (Entities) | Fakten geprüft (Regel 8c), Keyword-Set |
| 3 | **Produktion** | je nach Format: Content / Social / Design | Brand & UX (Visuals) | Roh-Asset (Text/Post/Bild) |
| 4 | **Such-Optimierung** | SEO Manager | Content | Schema, interne Links, Meta, Snippet |
| 5 | **KI-Zitierbarkeit (GEO)** | GEO Manager | SEO Manager | Ganzseiten-Re-Check, Entity-Dichte (`geo-check`) |
| 6 | **QA & Compliance-Gate** | Legal & Compliance | Tech (build-guard/geo-check) | ✅ Recht + ✅ keine stillen Defekte |
| 7 | **Freigabe (human gate)** | **Uwe** | CMO fasst zusammen | Go / No-Go |
| 8 | **Veröffentlichung & Distribution** | Social Media Senior Director / CRM | Tech & Automation | Live (Postiz/Loops/Deploy) |
| 9 | **Messung & Iteration** | Analytics & Data | alle | KPI-Report → zurück an CMO (Phase 1) |

**Reihenfolge-Kern:** PM-Agent **zuerst** (sortiert), CMO macht das Briefing, dann
**Fakten vor Form**, dann produzieren, dann **SEO vor GEO** (GEO baut auf SEO auf),
dann **Compliance-Gate**, dann **Uwe gibt frei**, dann **veröffentlichen**, dann **messen**.

---

## 4. SEO Manager vs. GEO Manager (Abgrenzung & Übergabe)

Beide sind getrennte Rollen, arbeiten aber **sequenziell auf demselben Asset**:

| | SEO Manager | GEO Manager |
|--|-------------|-------------|
| Ziel | In Google **ranken** | Von KI (ChatGPT/Perplexity/Gemini) **zitiert** werden |
| Hebel | Keywords, technisches SEO, Schema, interne Links, Backlinks/Outreach, SERP | Entity-Präsenz (Wikidata), Reddit-Signale, Ganzseiten-Konsistenz |
| Reihenfolge | **zuerst** (Phase 4) | **danach** (Phase 5) — baut auf SEO auf |
| Artefakt | SERP-/Keyword-Strategie | `docs/geo-manager-agent.md`, `scripts/geo-check.mjs` |

**Übergabe:** SEO Manager stellt Such-Präsenz her → GEO Manager verstärkt dasselbe Asset
für KI-Zitierbarkeit. Kein GEO ohne vorheriges SEO-Fundament.

---

## 5. Geschlossener Team-Reflex — RACI je Marketing-Frage

**Eintritt:** Jede Marketing-Frage läuft über den **PM-Agent (Intake)**, der sie
klassifiziert und das Team in der richtigen Reihenfolge einberuft. So „reagiert das
geschlossene Team" — nicht eine Einzelrolle.

Legende: **R** verantwortlich · **A** rechenschaftspflichtig (1×) · **C** konsultiert · **I** informiert

| Anfrage-Typ | PM | CMO | SEO | GEO | Social | Content | Design | Legal | Analytics |
|-------------|----|----|-----|-----|--------|---------|--------|-------|-----------|
| SEO-Pillar-Page | I | A | R | C | I | R | C | C | C |
| Social-Post / Reel | I | A | I | I | R | C | C | C | I |
| Bezahlte/Affiliate-Werbung | I | A | I | I | R | C | C | **R** | I |
| GEO-/KI-Sichtbarkeit | I | A | C | R | I | C | I | I | C |
| Kampagne (multi-Kanal) | **A** | R | C | C | R | C | C | C | R |
| Performance-Frage | I | C | C | C | I | I | I | I | **R** |
| Rechts-/Kennzeichnungs-Frage | I | C | I | I | C | I | I | **A/R** | I |

> Bei **bezahlter/Affiliate-Werbung** ist Legal **mit-R** (Werbekennzeichnung LG Köln
> 12.05.2026 — „Werbung"/„Anzeige" im Vorschaubild). Bei **Kampagnen** ist der PM-Agent
> **A** (rechenschaftspflichtig fürs Gesamtergebnis), der CMO führt operativ.

---

## 6. Eskalation & Entscheidungsrechte

- **Tagesgeschäft** (einzelner Post/Artikel): CMO entscheidet, Disziplin-Lead führt aus.
- **Konflikt zwischen Disziplinen**: CMO entscheidet nach Prioritäts-Logik (§2).
- **Strategisch/Budget/Risiko**: PM-Agent entscheidet, **Uwe gibt frei**.
- **Recht unklar**: Legal hat **Veto** bis geklärt (Phase 6 Gate ist hart).
- **Veröffentlichung nach außen**: immer **human-gated durch Uwe** (Phase 7).

---

## 7. Agentur-Prinzipien (international, moderne Tech, wirtschaftlich stabil)

1. **AI-first, human-gated** — Agenten produzieren, Mensch gibt frei. Kein Auto-Posting.
2. **Compliance-by-design** — Recht ist Phase 6-Gate, nicht Nachgedanke.
3. **ROI-Hierarchie** — knappe Ressourcen folgen der Monetarisierungs-Hierarchie (CMO).
4. **Measure everything** — jede Kampagne endet mit KPI-Report (Phase 9 → Phase 1).
5. **No black-hat** — kein Spam, Mass-Follow, Fake-Entities; nur echte Substanz.
6. **Single Source of Truth** — Entscheidungen sofort in Doku/`CLAUDE.md`, nicht im Chat.
7. **Burggraben zuerst** — Genauigkeit & proprietäre Tiefe vor Volumen (01-STRATEGY).
