// Gründungs-Bürokratie — kanonische Übersichtsdaten für die Gründer-Schmiede.
//
// Zweck: Menschen abholen, die noch nie mit Gewerbe/Freiberuflichkeit zu tun
// hatten. Drei Tabellen — (1) Schritte zum Selbständigen-Status, (2) was muss
// beantragt werden, (3) welche Kosten in den ersten 6 Monaten ab
// Gewerbeanmeldung — plus ein Rechtsform-Schnellvergleich.
//
// WICHTIG (Regel 8c — Fakten-Recherche): Alle Beträge sind ca.-Werte, Stand 2026,
// recherchiert. Sie ersetzen KEINE Steuer- oder Rechtsberatung. Pflege bei
// Rechtsänderung über Agent 8 (Rechts-Update-Scanner). Quellenstand unten.
//
// Quellen (Stand 06/2026):
// - Kleinunternehmer §19 UStG (seit 2025): Vorjahr ≤ 25.000 €, laufendes Jahr ≤ 100.000 €.
// - GKV freiwillig, Mindestbemessungsgrundlage 2026 = 1.318,33 €/Monat
//   → Mindestbeitrag ca. 260–278 €/Monat (inkl. Pflege).
// - Gewerbeanmeldung: kommunal, i.d.R. 20–60 € je Gemeinde.

export type Pflichtgrad = 'pflicht' | 'meist' | 'optional' | 'situativ';

export interface StatusSchritt {
  nr: number;
  titel: string;
  wer: string; // wen es betrifft
  beschreibung: string;
}

export interface AntragsPunkt {
  was: string;
  wo: string;
  wann: string;
  pflicht: Pflichtgrad;
  hinweis: string;
}

export type KostenArt = 'einmalig' | 'monatlich' | 'jaehrlich' | 'situativ';

export interface KostenPosten {
  posten: string;
  art: KostenArt;
  betragCa: string; // ca.-Spanne als Text, nie hartkodierter Preis
  pflichtgrad: Pflichtgrad;
  hinweis: string;
}

export interface Rechtsform {
  name: string;
  fuerWen: string;
  stammkapital: string;
  haftung: string;
  gruendung: string;
  buchfuehrung: string;
  empfehlung: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1) Schritte zum Selbständigen-Status
// ─────────────────────────────────────────────────────────────────────────────
export const STATUS_SCHRITTE: StatusSchritt[] = [
  {
    nr: 1,
    titel: 'Tätigkeit einordnen: Gewerbe oder Freiberuf?',
    wer: 'Jeder',
    beschreibung:
      'Freie Berufe (Katalogberufe nach §18 EStG — z. B. beratend, schreibend, unterrichtend, künstlerisch, IT-Entwicklung) melden KEIN Gewerbe an, sondern nur beim Finanzamt. Alles Gewerbliche (Handel, Vermittlung, klassische Dienstleistung) braucht eine Gewerbeanmeldung. Bei Mischformen sauber trennen. Im Zweifel: Finanzamt formlos fragen.',
  },
  {
    nr: 2,
    titel: 'Rechtsform wählen',
    wer: 'Jeder',
    beschreibung:
      'Für den Solo-Start fast immer Einzelunternehmen (kein Kapital, keine Notar-/Handelsregister-Kosten). UG/GmbH erst, wenn Haftungsschutz, Außenwirkung oder Kapital es verlangen. Details im Rechtsform-Vergleich unten.',
  },
  {
    nr: 3,
    titel: 'Gewerbe anmelden (nur Gewerbetreibende)',
    wer: 'Gewerbe',
    beschreibung:
      'Beim Gewerbeamt/Ordnungsamt deiner Gemeinde, oft online. Mit der Anmeldung läuft fast alles Weitere automatisch an (Finanzamt, IHK/HWK).',
  },
  {
    nr: 4,
    titel: 'Fragebogen zur steuerlichen Erfassung ausfüllen',
    wer: 'Jeder',
    beschreibung:
      'Kommt nach der Gewerbeanmeldung automatisch — Freiberufler füllen ihn aktiv über ELSTER aus. Hier entscheidest du u. a. über die Kleinunternehmerregelung. Ergebnis: deine Steuernummer.',
  },
  {
    nr: 5,
    titel: 'Kleinunternehmerregelung entscheiden (§19 UStG)',
    wer: 'Jeder',
    beschreibung:
      'Seit 2025: keine Umsatzsteuer, solange Vorjahresumsatz ≤ 25.000 € und laufendes Jahr ≤ 100.000 €. Vorteil: keine USt-Voranmeldung, einfacher. Nachteil: kein Vorsteuerabzug. Bei hohen Anfangsinvestitionen kann freiwillige USt-Pflicht sinnvoll sein — Steuerberater fragen.',
  },
  {
    nr: 6,
    titel: 'Kranken- & Sozialversicherung klären',
    wer: 'Jeder',
    beschreibung:
      'Als hauptberuflich Selbständiger zahlst du deine Krankenversicherung selbst (größter laufender Posten). Krankenkasse VOR Start informieren. Renten-/Pflichtversicherung prüfen (Ausnahmen siehe Anträge-Tabelle).',
  },
  {
    nr: 7,
    titel: 'Geschäftskonto + Buchhaltung aufsetzen',
    wer: 'Jeder',
    beschreibung:
      'Getrenntes Konto (Pflicht bei UG/GmbH, dringend empfohlen sonst) + ein einfaches Buchhaltungs-Tool für die EÜR. Belege ab Tag 1 sammeln.',
  },
  {
    nr: 8,
    titel: 'Absichern: Haftpflicht + Rechtsschutz',
    wer: 'Jeder',
    beschreibung:
      'Betriebs-/Berufshaftpflicht je nach Tätigkeit und — gerade beim digitalen Business — eine Rechtsschutzversicherung mit Internet-/Wettbewerbsrecht. Eine einzige Abmahnung kann sonst den Start kosten.',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 2) Was muss beantragt / erledigt werden?
// ─────────────────────────────────────────────────────────────────────────────
export const ANTRAEGE: AntragsPunkt[] = [
  {
    was: 'Gewerbeanmeldung (GewA 1)',
    wo: 'Gewerbeamt / Ordnungsamt der Gemeinde (oft online)',
    wann: 'Vor / bei Tätigkeitsbeginn',
    pflicht: 'situativ',
    hinweis: 'Pflicht für Gewerbetreibende. Freie Berufe: entfällt.',
  },
  {
    was: 'Fragebogen zur steuerlichen Erfassung',
    wo: 'Finanzamt über ELSTER (elster.de)',
    wann: 'Innerhalb 1 Monats nach Start',
    pflicht: 'pflicht',
    hinweis: 'Ergebnis = Steuernummer. Hier Kleinunternehmer-Wahl treffen.',
  },
  {
    was: 'ELSTER-Benutzerkonto',
    wo: 'elster.de',
    wann: 'So früh wie möglich (Aktivierung dauert einige Tage per Post)',
    pflicht: 'pflicht',
    hinweis: 'Zugang für alle Steuer-Themen. Rechtzeitig beantragen.',
  },
  {
    was: 'IHK- bzw. HWK-Mitgliedschaft',
    wo: 'Läuft automatisch über die Gewerbeanmeldung',
    wann: 'Automatisch',
    pflicht: 'meist',
    hinweis: 'Pflichtmitgliedschaft für Gewerbe. Existenzgründer sind oft die ersten Jahre vom Grundbeitrag befreit (Gewinngrenzen beachten).',
  },
  {
    was: 'Kranken- & Pflegeversicherung (Status „selbständig")',
    wo: 'Eigene Krankenkasse / privater Versicherer',
    wann: 'Vor Tätigkeitsbeginn',
    pflicht: 'pflicht',
    hinweis: 'Hauptberuflich selbständig = du trägst den Beitrag selbst. Einstufung vorab klären.',
  },
  {
    was: 'Renten­versicherungs-Pflicht prüfen',
    wo: 'Deutsche Rentenversicherung (DRV)',
    wann: 'In den ersten Wochen',
    pflicht: 'situativ',
    hinweis: 'Die meisten Gewerbetreibenden sind NICHT pflichtversichert. Pflicht u. a. bei bestimmten Handwerken, Lehrenden/Erziehenden, arbeitnehmerähnlichen Selbständigen.',
  },
  {
    was: 'Geschäftskonto eröffnen',
    wo: 'Bank / Online-Bank',
    wann: 'Vor erster Rechnung',
    pflicht: 'situativ',
    hinweis: 'Pflicht bei UG/GmbH (Einzahlung Stammkapital). Bei Einzelunternehmen dringend empfohlen.',
  },
  {
    was: 'Betriebs-/Berufshaftpflicht + Rechtsschutz',
    wo: 'Versicherer',
    wann: 'Zum Start',
    pflicht: 'optional',
    hinweis: 'Keine Behörde, aber existenziell. Rechtsschutz mit Internet-/Wettbewerbsrecht gegen Abmahnungen.',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 3) Kosten in den ersten 6 Monaten ab Gewerbeanmeldung
//    (Solo, hauptberuflich, Einzelunternehmen, Kleinunternehmer — typischer Fall)
// ─────────────────────────────────────────────────────────────────────────────
export const KOSTEN_6_MONATE: KostenPosten[] = [
  {
    posten: 'Gewerbeanmeldung',
    art: 'einmalig',
    betragCa: 'ca. 20–60 €',
    pflichtgrad: 'situativ',
    hinweis: 'Je Gemeinde unterschiedlich. Freiberufler: 0 €.',
  },
  {
    posten: 'Kranken- & Pflegeversicherung (GKV, freiwillig, Mindestbeitrag)',
    art: 'monatlich',
    betragCa: 'ca. 260–280 €/Monat → ~1.560–1.680 € in 6 Mon.',
    pflichtgrad: 'pflicht',
    hinweis: 'Größter Posten. Mindestbemessungsgrundlage 2026 = 1.318,33 €/Mon. PKV abweichend. Bei Nebenberuf ggf. über Hauptjob gedeckt.',
  },
  {
    posten: 'Renten­versicherung',
    art: 'monatlich',
    betragCa: '0 € oder freiwillig ab ca. 100 €/Monat',
    pflichtgrad: 'situativ',
    hinweis: 'Für die meisten Gewerbetreibenden freiwillig. Bei Pflicht (z. B. Handwerk) deutlich höher — vorab prüfen.',
  },
  {
    posten: 'IHK/HWK-Grundbeitrag',
    art: 'jaehrlich',
    betragCa: 'oft 0 € im 1. Jahr (Gründer-Befreiung), sonst ~30–70 €/Jahr',
    pflichtgrad: 'meist',
    hinweis: 'Existenzgründer i. d. R. die ersten Jahre vom Grundbeitrag befreit (Gewinngrenzen beachten).',
  },
  {
    posten: 'Geschäftskonto',
    art: 'monatlich',
    betragCa: '0–15 €/Monat',
    pflichtgrad: 'situativ',
    hinweis: 'Kostenlose Gründer-Konten existieren; UG/GmbH meist kostenpflichtig.',
  },
  {
    posten: 'Buchhaltungs-Tool',
    art: 'monatlich',
    betragCa: 'ca. 0–30 €/Monat',
    pflichtgrad: 'optional',
    hinweis: 'Für die EÜR. Alternativ Steuerberater (laufend teurer).',
  },
  {
    posten: 'Betriebs-/Berufshaftpflicht',
    art: 'jaehrlich',
    betragCa: 'ca. 50–250 €/Jahr',
    pflichtgrad: 'optional',
    hinweis: 'Stark tätigkeitsabhängig.',
  },
  {
    posten: 'Rechtsschutzversicherung (mit Internet-/Wettbewerbsrecht)',
    art: 'jaehrlich',
    betragCa: 'ca. 150–300 €/Jahr',
    pflichtgrad: 'optional',
    hinweis: 'Dringend empfohlen beim digitalen Business — schützt vor teuren Abmahnungen.',
  },
  {
    posten: 'Domain + Hosting',
    art: 'jaehrlich',
    betragCa: 'Domain ~10–30 €/Jahr + Hosting 0–20 €/Monat',
    pflichtgrad: 'situativ',
    hinweis: 'Für die eigene Website. Viele Plattformen mit kostenlosem Einstieg.',
  },
  {
    posten: 'Steuer-Vorauszahlungen (Einkommensteuer)',
    art: 'situativ',
    betragCa: 'im 1. Halbjahr meist 0 €',
    pflichtgrad: 'situativ',
    hinweis: 'Erst nach dem ersten Steuerbescheid setzt das Finanzamt ggf. Quartals-Vorauszahlungen fest. Rücklage trotzdem ab Tag 1 bilden.',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Rechtsform-Schnellvergleich (Solo-Fokus)
// ─────────────────────────────────────────────────────────────────────────────
export const RECHTSFORMEN: Rechtsform[] = [
  {
    name: 'Einzelunternehmen',
    fuerWen: 'Solo-Start, geringes Risiko, schlank starten',
    stammkapital: 'keines',
    haftung: 'unbeschränkt (privat)',
    gruendung: 'nur Gewerbeanmeldung',
    buchfuehrung: 'EÜR (einfach)',
    empfehlung: 'Standard-Empfehlung für den Anfang',
  },
  {
    name: 'Freiberufler',
    fuerWen: 'Katalogberufe §18 EStG (beraten, schreiben, lehren, IT …)',
    stammkapital: 'keines',
    haftung: 'unbeschränkt (privat)',
    gruendung: 'nur Finanzamt-Anmeldung',
    buchfuehrung: 'EÜR, keine Gewerbesteuer',
    empfehlung: 'wenn die Tätigkeit eindeutig freiberuflich ist',
  },
  {
    name: 'GbR',
    fuerWen: '2+ Gründer, schlanker gemeinsamer Start',
    stammkapital: 'keines',
    haftung: 'unbeschränkt (alle Gesellschafter)',
    gruendung: 'formlos + Gewerbeanmeldung je Person',
    buchfuehrung: 'EÜR',
    empfehlung: 'Gesellschaftervertrag dringend empfohlen',
  },
  {
    name: 'UG (haftungsbeschränkt)',
    fuerWen: 'Haftungsschutz gewünscht, wenig Startkapital',
    stammkapital: 'ab 1 € (Rücklagepflicht)',
    haftung: 'beschränkt auf Gesellschaftsvermögen',
    gruendung: 'Notar + Handelsregister',
    buchfuehrung: 'Bilanz (aufwändiger)',
    empfehlung: 'wenn Haftung/Außenwirkung zählt',
  },
  {
    name: 'GmbH',
    fuerWen: 'höherer Kapitalbedarf, Außenwirkung, Skalierung',
    stammkapital: '25.000 € (min. 12.500 € eingezahlt)',
    haftung: 'beschränkt auf Gesellschaftsvermögen',
    gruendung: 'Notar + Handelsregister',
    buchfuehrung: 'Bilanz',
    empfehlung: 'meist erst bei höherem Gewinn/Kapital',
  },
];

export const BUEROKRATIE_STAND = 'Stand 06/2026';

export const BUEROKRATIE_DISCLAIMER =
  'Diese Übersicht ist eine allgemeine Orientierung und ersetzt KEINE Steuer- oder Rechtsberatung. ' +
  'Alle Beträge sind ca.-Werte (Stand 2026) und hängen vom Einzelfall ab (Bundesland, Gemeinde, ' +
  'Tätigkeit, Versicherungsstatus, haupt-/nebenberuflich). Verbindliche Auskunft geben Finanzamt, ' +
  'Krankenkasse, IHK/HWK und ein:e Steuerberater:in.';
