# Phase 2 — Technisches SEO (07.07.2026)

## Findings + Status

| # | Severity | Finding | Status |
|---|----------|---------|--------|
| C1 | Critical | www-Homepage liefert 200 statt 301 (unkanonisiertes Duplikat; Unterseiten redirecten korrekt) | ✅ GEFIXT: netlify.toml Root-Redirect-Regeln (https+http) + `alternates: canonical '/'` in page.tsx |
| H1 | High | Doppeltes Middleware-File: Root-`middleware.ts` (Admin-Cookie-Gate) in Prod TOT — deployed wird nur src/middleware.ts → Admin-Schutz fraglich | ✅ GEFIXT: Admin-Gate + API-401-Gate + Supabase-Login-Gate in src/middleware.ts gemerged; Root-Datei → middleware.ts.DELETE_ME.bak (bitte `git rm middleware.ts` + .bak löschen) |
| H2 | High | Title-Verdopplung "… \| Steakakademie \| Steakakademie" auf ~40 Seiten (Layout-Template + hartes Suffix) | ✅ GEFIXT: Suffix-Sweep über alle Top-Level-Titles + cut-generator + 2 generateMetadata-Fallbacks. openGraph-Titles bewusst unverändert (Template greift dort nicht) |
| H3 | High | Verkaufs-Landingpages fehlen in Sitemap (SSR wg. Supabase-Preis → nicht im Prerender-Manifest): /gruender-schmiede, /ehrliches-system, /steuer-matrix, /agentur-killer-sprint, /erste-kunden-sprint, /seo-sprint, /cut-generator, /steak-beichte, /mein-protokoll, /rezepte/community | ✅ GEFIXT: `additionalPaths` in next-sitemap.config.js (priority 0.8) |
| H4 | High | /prive in Sitemap trotz noindex (Widerspruchssignal) | ✅ GEFIXT: exclude |
| H5 | High | `unoptimized` auf großen LCP-Bildern (tomahawk-hero.png 1,86 MB roh; uwe-yendell.png 1,48 MB auf 5 Seiten) | ✅ GEFIXT: `unoptimized` entfernt (6 Dateien; community-Rezepte mit externen URLs bewusst belassen) |
| M1 | Medium | Sitemap-Exclude ≠ noindex bei Geld-Seiten (gemischte Signale) | ✅ GEFIXT: steak-beichte + mein-protokoll = live-Produkte → in Sitemap; /fleischpass (Produkt C, nicht gelauncht) → noindex bis Launch |
| M2 | Medium | /meine-kurse ohne noindex | ✅ GEFIXT: robots index:false |
| M3 | Medium | zzp-niche Cross-Domain-Canonical auf steakakademie.nl (Domain nicht erreichbar, Timeout) | ✅ GEFIXT: Canonical entfernt → noindex |
| M4 | Medium | Kein not-found.tsx (englische Default-404, keine Recovery-Links) | ✅ GEFIXT: deutsche 404 mit Header/Footer + 6 internen Links |
| M5 | Medium | Page-openGraph ohne images verdrängt Layout-OG-Bild (shallow merge) | ✅ TEILGEFIXT: /api/og-Images bei steak-beichte, mein-protokoll, gruender-schmiede ergänzt. REST-SWEEP OFFEN (weitere Seiten mit openGraph ohne images prüfen) |
| M6 | Medium | lastmod fake (new Date() je Build, nur 11 URLs) | ✅ GEFIXT: lastmod entfernt (ehrlicher als fake) |
| M7 | Medium | Junk-URLs in Sitemap: /icon.svg, /diplome/profil; fehlende Wildcards steak-beichte/diagnose, mein-protokoll/fragebogen+plan | ✅ GEFIXT: excludes |
| M8 | Medium | robots.txt: /admin/ crawlbar | ✅ GEFIXT: Disallow /admin/ |
| L1 | Low | Ribeye seoTitle-Typo "Anatomy" | ✅ GEFIXT: "Anatomie" |
| L2 | Low | Ribeye og:image = Unsplash-URL | ✅ GEFIXT: eigenes Bild /images/articles/ribeye-premium-cut.webp |
| L3 | Low | Keine CSP in next.config (sonst Header gut) | ⏳ OFFEN (Hardening-Backlog, braucht Inventar aller Script-Quellen) |
| L4 | Low | avif fehlte in image formats | ✅ GEFIXT: ['image/avif','image/webp'] |
| L5 | Low | Stale Sitemap-Artefakte committet | ✅ GEFIXT: .gitignore public/sitemap*.xml (git rm --cached beim Commit) |
| L6 | Low | 73 MB public/images; hero-thermometer 9,9 MB, hero-ribeye 8,9 MB; 4 mutmaßlich tote Assets (image.png, Medaillen Final.png, Firefly_*.png, 2026-05-15_*.png) | ⏳ OFFEN: Kompression/Löschung = visueller Eingriff → Uwe-Freigabe (human-in-the-loop) |
| L7 | Low | Kaputte Diakritika-Slugs /glossar/entrec-te, /glossar/ib-rico; Gründer-Schmiede-Modul 05 fehlt (Lücke 00–04,06) | ⏳ OFFEN → Phase 3 (Content) |

## Offene Messpunkte
- **PSI/CWV:** PageSpeed-API-JSON im Sandbox-Fetch nicht lesbar → keine Lab-/Felddaten. Manuell: pagespeed.web.dev für / und /cuts/ribeye. GSC-Service-Account (M6) würde das dauerhaft lösen.
- **Build-Verifikation:** Sandbox-Mount zeigt truncated Dateien (bekannte Falle) → tsc im Sandbox unbrauchbar. VOR PUSH auf Host: `npm run build` (Pflicht).

## What works ✅
Unterseiten-Canonicals durchgängig, generateMetadata in allen 4 Content-Templates, Noindex-Hygiene danke/admin/auth/legal sauber, Security-Header (HSTS preload, XFO DENY, nosniff), robots.txt + Sitemap-Referenz, kein Soft-404, next/image-Konfig sauber, Prioritäten-Transform sinnvoll.
