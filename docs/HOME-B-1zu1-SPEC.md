# /home-b — 1:1-Bauvertrag (Variante B, A/B-Test Startseite)

**Referenz:** `steakakademie-editorial` (Manus, "Editorial Ember") · `client/src/pages/Home.tsx`, `components/Header.tsx`, `components/ArticleCard.tsx`, `index.css`
**Ziel-Repo:** `C:\Dev\steakakademie-v2` → `/home-b` (Next.js App Router, Tailwind)
**Stand:** 28.08.2026 — Spec vollständig, Umsetzung offen (Repo noch nicht verbunden)

---

## 1. Design-Tokens (verbindlich, oklch 1:1)

| Rolle | Wert | Hex ~ |
|---|---|---|
| Creme (Seiten-BG) | `oklch(0.985 0.003 85)` | #FAFAF7 |
| Karten-BG / Ad | `oklch(0.96 0.003 85)` | #F4F2EE |
| Tinte (Headline/Text) | `oklch(0.12 0.01 50)` | #1C1512 |
| Body-Grau | `oklch(0.45 0.01 50)` | — |
| Meta-Grau | `oklch(0.55 0.01 50)` | — |
| Nav-Grau | `oklch(0.25 0.01 50)` | — |
| Ember (Akzent) | `oklch(0.52 0.18 35)` | #D4521A |
| Ember hover/aktiv | `oklch(0.42 0.16 35)` | — |
| Ember hell (auf dunkel) | `oklch(0.72 0.14 45)` | — |
| Haarlinie | `oklch(0.88 0.005 85)` | — |

**Container:** `max-width: 1280px`, Padding `1rem / sm 1.5rem / lg 2rem`.

**Typo-Stack:**
- Headlines (h1–h6): **Playfair Display**, `font-bold` bzw. `font-black` (Wortmarke)
- Body/UI/Meta: **DM Sans**
- Fließtext-Teaser (rechte Spalte): **Source Serif 4**

**Trennlinien:**
- dünn: `1px solid oklch(0.88 0.005 85)`
- Sektions-Trenner: `2px solid oklch(0.12 0.01 50)` (unter Sektionsüberschrift, `mt-2 mb-6`)

**Utility-Klassen (in globals.css anlegen):**
```css
.category-label { font-family:'DM Sans'; font-size:.7rem; font-weight:700;
  letter-spacing:.12em; text-transform:uppercase; color:oklch(0.52 0.18 35); }
.article-title-link { transition:color 150ms ease-out; }
.article-title-link:hover { color:oklch(0.52 0.18 35); }
.section-divider-thick { border-top:2px solid oklch(0.12 0.01 50); margin-bottom:1.5rem; }
.btn-subscribe { background:oklch(0.52 0.18 35); color:#fff; font-family:'DM Sans';
  font-size:.75rem; font-weight:700; letter-spacing:.08em; text-transform:uppercase;
  padding:.45rem 1rem; transition:background-color 150ms ease-out, transform 100ms ease-out; }
.btn-subscribe:hover { background:oklch(0.42 0.16 35); }
.btn-subscribe:active { transform:scale(.97); }
@keyframes fadeInUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
.animate-fade-in-up { animation:fadeInUp .4s cubic-bezier(.23,1,.32,1) both; }
@media (prefers-reduced-motion:reduce){ .animate-fade-in-up{animation:none} }
```

---

## 2. Seitenaufbau (Reihenfolge exakt)

1. **Ad-/Hinweisleiste** `h-10`, BG `oklch(0.96…)`, 1px Rahmen, Text `.7rem`, `tracking-widest`, uppercase
2. **Header** (sticky, weiß, `border-b` Haarlinie, `shadow-md` ab `scrollY > 40`)
   - Zeile 1 `h-16`: links Hamburger-Button (`w-8 h-8`, BG Ember, weißes Icon) · Mitte zentrierte Wortmarke **Steakakademie** (Playfair, `font-black`, `text-3xl sm:text-4xl`, `letter-spacing:-0.02em`, Tinte, Hover Ember) · rechts Suche-Icon, Textlinks (uppercase, `.75rem`, `tracking-widest`), CTA-Button `.btn-subscribe`
   - ausklappbare Suchleiste (Border-top, BG Creme, Input mit `border-b`, Fokus-Border Ember)
   - Kategorie-Nav `border-t`, **zentriert**, `px-3 py-3`, `.75rem` uppercase, aktiv = Ember + `border-b-2` Ember; Dropdown weiß mit Haarlinien-Rahmen + `shadow-lg`
3. **Hero-Sektion — 3-Spalten-Grid** `grid-cols-1 lg:grid-cols-[55%_25%_20%]`, `gap-6 lg:gap-8`, `pt-8 pb-6`
   - Spalte 1 (55 %): Hero-Card, `lg:border-r` Haarlinie, `lg:pr-8`
   - Spalte 2 (25 %): 3 × Small-Card, `space-y-5`, Trennlinie zwischen den Karten, `lg:border-r`, `lg:pr-8`
   - Spalte 3 (20 %): Feature-Artikel — Bild `aspect-[4/3]`, Label, `text-lg` Playfair, Meta, **Source Serif 4** Teaser `line-clamp-5`, „Weiterlesen →"
4. **Werbe-/Affiliate-Banner** (Leaderboard)
5. **Dunkle Diplom-Sektion** — BG Tinte, `py-10 my-8`, links Flame-Icon + Kicker (Ember hell, `tracking-widest`) + Playfair `text-2xl sm:text-3xl` weiß + Subline `text-white/60`; Mitte 5 Rang-Kacheln `w-12 h-12` `bg-white/10`; rechts CTA-Button Ember
6. **Kategorie-Sektionen** (4×): Überschrift Playfair `text-2xl` + „Alle ansehen →" (Ember, uppercase), darunter `.section-divider-thick`, dann `grid sm:grid-cols-2 lg:grid-cols-3 gap-8` mit je 3 Medium-Cards; nach jeder 2. Sektion ein Banner
7. **Neueste Artikel + Sidebar** — `grid lg:grid-cols-[1fr_300px] gap-8`
   - links: 6 × Horizontal-Card
   - rechts: Rectangle-Banner · Kategorien-Liste (Zeilen `py-2` + Haarlinie, Chevron erscheint bei Hover) · Shop-/Affiliate-Kasten (BG `oklch(0.96…)`, `p-5`, `border-t-2` Ember, CTA-Button)
8. **Footer**

---

## 3. ArticleCard — 4 Varianten (Maße 1:1)

| Variante | Bild | Titel | Teaser | Verwendung |
|---|---|---|---|---|
| `hero` | `aspect-[16/10]`, `mb-4` | Playfair `text-3xl sm:text-4xl`, `leading-tight` | DM Sans `text-sm`, `line-clamp-3` | Hero-Spalte |
| `medium` | `aspect-[4/3]`, `mb-3` | Playfair `text-xl`, `leading-snug` | `line-clamp-2` | Kategorie-Grids |
| `small` | `w-20 h-20`, Flex `gap-3` | Playfair `text-sm`, `line-clamp-3` | — (nur Autor) | Mittelspalte |
| `horizontal` | `w-28 h-20`, Flex `gap-4`, `py-4` + `border-b`, `last:border-0` | Playfair `text-base`, `line-clamp-2` | — (Datum — Autor) | Neueste Artikel |

Alle: `.category-label` über dem Titel · Bild-Hover `scale-[1.02]` (small/horizontal `1.04`), `duration-500` · Titel-Hover → Ember, `duration-150` · Meta-Zeile `Datum — Autor`, DM Sans `text-xs`, Meta-Grau.

---

## 4. Abweichungen von der Referenz — bewusst, nicht optional

Die Referenz ist ein Manus-Prototyp mit Platzhalter-Realität. Diese fünf Punkte werden **nicht** 1:1 übernommen, weil sie sonst live Schaden anrichten:

1. **Kein Fake-Werbebanner.** Der Referenztext „PREMIUM MITGLIEDSCHAFT – 30 TAGE KOSTENLOS TESTEN" ist eine Preis-/Leistungszusage für ein Produkt, das es nicht gibt (irreführende Werbung, und laut Vorgabe keine Preiszusagen ohne Rücksprache). Slot bleibt im Layout, Inhalt = echter Affiliate-Platz oder Diplom-Hinweis.
2. **Rangsystem statt Emoji-Medaillen.** Referenz zeigt 🥉🥈🥇💎🔥 „Bronze/Silber/Gold/Platin/Meister". Korrekt ist das Feuer-Rang-System: **FUNKE · GLUT · FLAMME · FEUER · MEISTER DES FEUERS**. Kacheln bleiben, Beschriftung und Icons kommen aus dem echten System.
3. **Nur existierende Routen verlinken.** Referenz nutzt `/artikel/*`, `/kategorie/*`, `/grillmeister`, `/schulen`. Vor dem Bau wird jede Ziel-URL gegen die reale Sitemap gemappt — Lehre aus dem `/suche`-404, der jahrelang lief.
4. **Keine eigene Client-Suche.** Referenz filtert Artikel im State. Produktiv existiert die serverseitige `/suche` über 9 Kollektionen — Header-Suche zeigt dorthin, kein zweiter Suchpfad.
5. **Kontrast wird vor Abnahme gemessen.** Genau daran ist Variante B im ersten Anlauf gescheitert (Nav 1,05:1, Wortmarke 2,86:1). Zu prüfen: Ember auf Creme, Weiß auf Ember, `text-white/60` auf Tinte, Ember-hell auf Tinte. Ziel WCAG AA (4,5:1 Text / 3:1 große Schrift). Was durchfällt, wird in der Helligkeit korrigiert — nicht durchgewinkt.

---

## 5. Datenanbindung

Referenz liest aus `@/lib/data` (statisches Array). Produktiv:
- Ersatz für `PLACEHOLDER_ARTICLES` (aktuell aus `src/app/page.tsx` exportiert) durch echte Contentlayer-Daten.
- Benötigte Felder je Artikel: `slug, title, excerpt, image, category, categorySlug, date, author, featured`.
- Auswahl: `heroArticle` = featured[0] · `sideArticles` = latest[1..3] · `featureArticle` = featured[1] · Kategorie-Sektionen je 3 · „Neueste" = latest[4..9].
- **A und B müssen dieselben Artikel zeigen** — sonst misst der Test Inhalt statt Layout.

---

## 6. Sicherungen (unverändert lassen)

- Test läuft nur bei `AB_HOME_ENABLED=1` (Vercel-Env). Default AUS.
- Middleware: Crawler (`IS_CRAWLER`) sehen **immer** Variante A. `/home-b` bleibt `noindex`.
- Freigabe-Reihenfolge: lokaler Build grün → Kontrastmessung → optische Abnahme Uwe auf `/home-b` → **erst dann** Env-Flag setzen.

---

## 7. Nächste Schritte

1. `C:\Dev\steakakademie-v2` in Cowork verbinden (blockiert alles Weitere)
2. Ist-Stand `/home-b` + Middleware lesen → Gap-Liste gegen diese Spec
3. Umbau, lokaler Build, Kontrastmessung
4. Push über Claude Code (`git push`) — VM hat keine GitHub-Credentials
5. Optische Abnahme, dann Env-Flag
