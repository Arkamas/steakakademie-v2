/**
 * Steak-Beichte (Produkt A) — Schemas
 *
 * Diagnose-Input (Beschreibung + optionales Foto) + generierter Report.
 * Geteilt zwischen Analyze-API (server) und Anzeige (server).
 */

import { z } from 'zod';

// ─── Diagnose-Input ─────────────────────────────────────────────────────────

export const DiagnoseInputSchema = z.object({
  problem:   z.string().min(10).max(2000).describe('Was ist schiefgelaufen? So konkret wie möglich.'),
  cut:       z.string().max(120).optional().describe('Welcher Cut, optional (z.B. "Tomahawk 800g")'),
  grillType: z.string().max(120).optional().describe('Grilltyp, optional (z.B. "Kugelgrill")'),
});

export type DiagnoseInput = z.infer<typeof DiagnoseInputSchema>;

// ─── Generierter Report ─────────────────────────────────────────────────────

export const UrsacheSchema = z.object({
  titel:      z.string().describe('Kurze Überschrift der Ursache'),
  erklaerung: z.string().describe('Warum genau das passiert ist — konkret, mit Temperatur/Zeit wo möglich'),
});

export const KorrekturSchema = z.object({
  schritt: z.string().describe('Konkrete Handlung, imperativ'),
  detail:  z.string().describe('Wie genau — mit Zahlen (°C, Minuten, cm Abstand)'),
});

export const ReportSchema = z.object({
  kurzdiagnose: z.string().describe('1–2 Sätze: das Kernproblem auf den Punkt'),
  ursachen: z.array(UrsacheSchema).min(1).max(4)
    .describe('Ursachen-Analyse: was wirklich passiert ist (nicht Symptome)'),
  fehlerEinordnung: z.string()
    .describe('Fehler-Einordnung: wie gravierend, was war knapp daneben vs. grundlegend falsch — ehrlich, aber konstruktiv'),
  korrekturProtokoll: z.array(KorrekturSchema).min(2).max(6)
    .describe('Korrektur-Protokoll: konkrete Schritte, die das Problem beim nächsten Mal verhindern'),
  naechsteSession: z.object({
    ziel:             z.string().describe('Ein klares Ziel für die nächste Session'),
    setup:            z.string().describe('Konkretes Setup: Cut, Methode, Temperaturen'),
    erfolgskriterium: z.string().describe('Messbar: woran erkennst du, dass es geklappt hat'),
  }).describe('Nächste-Session-Plan'),
});

export type Report = z.infer<typeof ReportSchema>;
