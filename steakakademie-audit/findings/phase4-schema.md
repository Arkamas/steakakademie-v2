# Phase 4 — Schema.org & strukturierte Daten (07.07.2026)

## Findings + Status

| # | Severity | Finding | Status |
|---|----------|---------|--------|
| F1 | High | HowTo auf /methoden/[slug] OHNE Pflichtfeld `step` → ungültig (GSC „Missing field step") | ✅ GEFIXT: auf Article umgestellt (valide + GEO-tauglich) |
| F2 | High | KI-Personas weiter als Person in Article/Recipe-Schemas (Widerspruch zum Phase-3-Fix) | ✅ GEFIXT: zentraler Helper `authorSchemaRef()` — Person nur bei realPerson, sonst Organization; in articleSchema, RecipeTemplate, cuts, methoden, autoren-ItemList verdrahtet |
| F3 | High | /bbq-grundkurs + /diplome (Kernprodukt-Seiten!) ohne jedes Schema | ✅ GEFIXT: courseSchema (Course + hasCourseInstance, BEWUSST ohne Offer solange „In Vorbereitung") + Breadcrumb; alle 35 Lektionen zeigen via isPartOf-@id auf den kanonischen Kurs-Knoten /diplome#course |
| F4 | Medium | Relative Bild-URLs in Recipe/Article-Schemas (Google verlangt absolut) | ✅ GEFIXT: RecipeTemplate, cuts, methoden prefixen absolut |
| F5 | Medium | SearchAction-Target /suche = 404 (Route existiert nicht; Sitelinks-Searchbox eh eingestellt) | ✅ GEFIXT: potentialAction entfernt |
| F6 | Medium | Publisher-Logo als SVG + Organization-Duplikat statt @id-Referenz (cuts, methoden) | ✅ GEFIXT: publisher → @id /#organization |
| F7 | Low | recipeCategory 'Hauptgericht' + recipeCuisine 'BBQ/Grillen' hardcoded (Braaibroodjies = Beilage/Südafrika — Regel 8c) | ✅ GEFIXT: aus Frontmatter (kategorie-Mapping, land) |
| F8 | Low | ItemList auf /rezepte mit unvollständigen Recipe-Stubs | ✅ GEFIXT: reine ListItems (position + url) |
| F9 | Low | Glossar-GEO-Potenzial: DefinedTerm ohne url/@id, kein DefinedTermSet | ✅ GEFIXT: definedTermSetSchema auf /glossar (174 Begriffe verkettet) + definedTermSchema je Detail |
| F10 | Low | Review-Author als @id-Querverweis über Script-Grenzen | ✅ GEFIXT: inline Organization |
| F11 | Info | Breadcrumb cuts→/kategorie/cuts vs. Navigation→/cuts uneinheitlich | ⏳ Kosmetik, Backlog |

## Hinweise
- `ArticleSchemaInput.authorName` jetzt funktional ungenutzt (Signatur bewusst nicht gebrochen) — bei Gelegenheit aufräumen.
- Mojibake in Kommentaren von bbq-grundkurs/page.tsx (Encoding-Altlast) — separat bereinigen.
- Verifikation: og-image.svg-Publisher 0, potentialAction 0, courseSchema 2×, authorSchemaRef 4×. Build-Check auf Host vor Push (wie Phase 2).

## What works ✅
Zentrale typsichere Schema-Library mit @id-Verkettung; Organization vollständig (JPG-Logo 512², 4× sameAs Social, contactPoint); Product/Offer auf Vergleichsseiten Google-konform (price/priceValidUntil/availability); Recipe-Kern stark (ISO-Zeiten, nutrition, HowToStep); FAQPage überall korrekt; temperatur-guide vorbildlich (FAQ + valides HowTo); Breadcrumbs flächendeckend.
