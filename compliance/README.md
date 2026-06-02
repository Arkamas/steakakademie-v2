# Compliance — Rechts-Check-Kataloge

Maschinenlesbare Check-Komponenten-Kataloge, die unsere Rechts-Agenten als
**Single Source of Truth** für ihre Prüfungen nutzen. Quelle der Komponenten:
ARAG Homepagecheck (RA Dr. Fröhlich, 02.06.2026, Punkte 1–18) + bisherige
Agent-Prüfpunkte.

## Dateien

| Datei | Wer nutzt sie | Zweck |
|-------|---------------|-------|
| `website-rechtscheck.yaml` | **Agent 1** (AGB-Compliance-Scanner) + **Agent 8** (Rechts-Update-Scanner) | Self-Audit von steakakademie.de gegen alle 18 + Bestandskomponenten |
| `gruendung-sprint-rechtscheck.yaml` | **Gründung-Sprint** (Produkt F) Rechts-Check-Modul | Kunden-Audit der NEUEN Gründer-Website — gleiche 18 Komponenten |

## So konsumiert der Agent den Katalog

Der Compliance-Scanner liest die YAML, iteriert über `komponenten[]` und prüft
steakakademie.de gegen jede `pruefung`. Ergebnis pro Komponente → Report.
`status` + `befund` halten den letzten bekannten Stand fest; `monitor` markiert
Komponenten, die erst bei künftigen Änderungen (z. B. Meta-Pixel/GA4) scharf werden.

```
status: ok | fix-needed | not-applicable | monitor
neu:    true  = durch ARAG-Auswertung neu in den Agenten aufgenommen
        false = war bereits Agent-Bestand
```

## Pflege

- Neue Rechtslage / neues Tool → Komponente ergänzen + `version` erhöhen.
- Nach jedem Fix: `status`/`befund` der Komponente aktualisieren (mit Commit-Ref).
- Beide Kataloge synchron halten (Self-Audit vs. Kunden-Audit decken dieselben 18 Punkte ab).

## Aktueller Self-Audit-Stand steakakademie.de (02.06.2026)

- **Behoben:** #5/#9 Speicherdauer/Löschfristen (Commit `a8a97f2`)
- **ok:** 1–4, 6–9, 13–18
- **not-applicable (cookieless):** #10 Cookies, #11 Social-Plugins, #12 Embeds
  → werden PFLICHT (`monitor`), sobald Meta-Pixel/GA4 oder ein Embed scharf gehen
- Voller Beleg/Auswertung: `OneDrive/Privat/Steakakademie - Website/Versicherungen/ARAG/ARAG-Testat_Auswertung_Steakakademie_2026-06-02.md`
