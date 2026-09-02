#!/usr/bin/env node
// ── Ops-Alert → Jira (KAN) ────────────────────────────────────────────────────
// Erzeugt aus einem Ops-Alert automatisch ein Jira-Ticket. Wiederverwendbar:
// jeder Workflow kann das aufrufen (Env setzen + node scripts/ops-alert-to-jira.mjs).
//
// Pflicht-Env: JIRA_BASE_URL, JIRA_EMAIL, JIRA_API_TOKEN, JIRA_PROJECT_KEY
// Alert-Env:   ALERT_SUMMARY (Pflicht), ALERT_DESCRIPTION, ALERT_LABELS (komma),
//              ALERT_ISSUETYPE (Default "Bug"), ALERT_DEDUP_LABEL
//
// Secrets-Guard: fehlt JIRA_API_TOKEN/JIRA_EMAIL → sauberes Skippen (exit 0),
// damit der Workflow nicht rot wird, bevor du die Secrets gesetzt hast.
// Dedup: ist ALERT_DEDUP_LABEL gesetzt und existiert ein offenes Ticket mit dem
// Label, wird KEIN Duplikat erzeugt — stattdessen wird ESKALIERT (siehe unten).
//
// ESKALATION (02.09.2026)
// -----------------------
// Vorher endete der Dedup-Fall mit einer Logzeile und sonst nichts. Folge: Die
// Content-Pipeline ist von Juli bis September bei JEDEM Wochenlauf gescheitert,
// acht Mal in Folge — und meldete jedes Mal brav "Offenes Ticket existiert
// bereits". Das Ticket (KAN-62) wurde nie wieder angefasst, das Signal wurde
// nie lauter, niemand merkte es. Der Fehler war sichtbar, seine Wiederholung
// nicht.
//
// Jetzt gilt bei einem Dedup-Treffer:
//   1. Kommentar am bestehenden Ticket mit Vorfallnummer und Run-Link. Das hebt
//      das "aktualisiert"-Datum und loest Jira-Benachrichtigungen aus.
//   2. Ab ALERT_ESCALATE_AFTER Vorfaellen (Default 3) einmalig: Label
//      "ops-eskaliert" setzen und Prioritaet anheben.
// Beides ist best-effort: Schlaegt es fehl, wird geloggt und mit exit 0 beendet.
// Der Workflow ist an dieser Stelle ohnehin schon rot — ein roter Ops-Hook
// wuerde nur die eigentliche Ursache verdecken.

import { pathToFileURL } from 'node:url';

const {
  JIRA_BASE_URL,
  JIRA_EMAIL,
  JIRA_API_TOKEN,
  JIRA_PROJECT_KEY,
  ALERT_SUMMARY,
  ALERT_DESCRIPTION = '',
  ALERT_LABELS = '',
  ALERT_ISSUETYPE = 'Bug',
  ALERT_DEDUP_LABEL = '',
  ALERT_ESCALATE_AFTER = '3',
} = process.env;

/** Marker in jedem Bot-Kommentar — daran werden die Vorfaelle gezaehlt. */
export const VORFALL_MARKER = 'ops-alert-to-jira · Vorfall';

/**
 * Zaehlt die bisherigen Bot-Kommentare an einem Ticket. Reine Funktion, damit
 * sie ohne Jira testbar ist (scripts/ops-alert-to-jira.test.mjs).
 * Der Kommentar-Body ist ADF (verschachteltes JSON) — der Marker wird deshalb
 * im serialisierten Body gesucht, nicht im Text eines bestimmten Knotens.
 */
export function zaehleVorfaelle(comments = [], marker = VORFALL_MARKER) {
  return comments.filter((c) => JSON.stringify(c?.body ?? '').includes(marker)).length;
}

/**
 * Entscheidet, was bei einem Dedup-Treffer passieren soll.
 * `vorfall` ist die laufende Nummer INKLUSIVE des aktuellen Fehlschlags.
 * Eskaliert wird genau einmal, beim Ueberschreiten der Schwelle — danach wird
 * nur noch kommentiert, sonst haette man das Rauschen bloss verlagert.
 */
export function eskalationsPlan(vorfall, schwelle) {
  return {
    kommentieren: true,
    eskalieren: Number.isFinite(schwelle) && schwelle > 0 && vorfall === schwelle,
    ueberSchwelle: Number.isFinite(schwelle) && schwelle > 0 && vorfall >= schwelle,
  };
}

function skip(msg) {
  console.log(`⏭️  ops-alert-to-jira übersprungen: ${msg}`);
  process.exit(0);
}

/** Env-Pruefung. Steht in einer Funktion, damit ein Import (Tests) nicht
 *  ueber process.exit stolpert — aufgerufen wird sie nur aus main(). */
function pruefeEnv() {
  if (!JIRA_API_TOKEN || !JIRA_EMAIL) {
    skip('JIRA_EMAIL / JIRA_API_TOKEN nicht gesetzt (Secrets fehlen).');
  }
  if (!JIRA_BASE_URL || !JIRA_PROJECT_KEY) {
    skip('JIRA_BASE_URL / JIRA_PROJECT_KEY nicht gesetzt.');
  }
  if (!ALERT_SUMMARY) {
    console.error('❌ ALERT_SUMMARY fehlt — kein Ticket-Titel.');
    process.exit(1);
  }
}

// Lazy statt Modul-Ebene: Ein Import (Tests) darf keine Env voraussetzen und
// nicht schon beim Laden an einem fehlenden JIRA_BASE_URL scheitern.
const auth = () => 'Basic ' + Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString('base64');
const base = () => (JIRA_BASE_URL || '').replace(/\/$/, '');
const labels = ALERT_LABELS.split(',').map((s) => s.trim()).filter(Boolean);

async function jira(path, init = {}) {
  const res = await fetch(`${base()}${path}`, {
    ...init,
    headers: { Authorization: auth(), Accept: 'application/json', 'Content-Type': 'application/json', ...(init.headers || {}) },
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Jira ${res.status} ${path}: ${text.slice(0, 400)}`);
  return text ? JSON.parse(text) : {};
}

/**
 * Dedup-Treffer: Ticket existiert schon. Statt stillem Verweis wird der Vorfall
 * am Ticket vermerkt und ab der Schwelle einmalig eskaliert. Alles best-effort —
 * ein Fehler hier darf den ohnehin roten Workflow nicht zusaetzlich verdecken.
 */
async function vermerkeVorfall(key) {
  const schwelle = Number.parseInt(ALERT_ESCALATE_AFTER, 10);
  let vorfall = 1;
  try {
    const { comments = [] } = await jira(`/rest/api/3/issue/${key}/comment?maxResults=100`);
    vorfall = zaehleVorfaelle(comments) + 1;
  } catch (err) {
    console.warn(`⚠️  Kommentare von ${key} nicht lesbar (${err.message}) — zaehle diesen Vorfall als 1.`);
  }

  const plan = eskalationsPlan(vorfall, schwelle);
  const text = [
    `${VORFALL_MARKER} ${vorfall}: ${ALERT_SUMMARY}`,
    ALERT_DESCRIPTION,
    plan.ueberSchwelle
      ? `Dieser Fehler wiederholt sich (${vorfall} Vorfaelle seit Ticket-Erstellung, Schwelle ${schwelle}).`
      : '',
  ].filter((l) => l && l.trim().length).join('\n');

  try {
    await jira(`/rest/api/3/issue/${key}/comment`, {
      method: 'POST',
      body: JSON.stringify({
        body: {
          type: 'doc',
          version: 1,
          content: text.split('\n').map((l) => ({ type: 'paragraph', content: [{ type: 'text', text: l }] })),
        },
      }),
    });
    console.log(`💬 ${key}: Vorfall ${vorfall} als Kommentar vermerkt.`);
  } catch (err) {
    console.warn(`⚠️  Kommentar an ${key} fehlgeschlagen: ${err.message}`);
  }

  if (!plan.eskalieren) {
    console.log(`ℹ️  Offenes Ticket ${key} — kein Duplikat erstellt (Vorfall ${vorfall}/${schwelle}).`);
    return;
  }

  // Schwelle genau jetzt erreicht: Label setzen und Prioritaet anheben.
  let labelGesetzt = false;
  try {
    await jira(`/rest/api/3/issue/${key}`, {
      method: 'PUT',
      body: JSON.stringify({ update: { labels: [{ add: 'ops-eskaliert' }] } }),
    });
    labelGesetzt = true;
    console.log(`🔺 ${key}: Label ops-eskaliert gesetzt (${vorfall}. Vorfall).`);
  } catch (err) {
    console.warn(`⚠️  Label an ${key} nicht setzbar: ${err.message}`);
  }
  try {
    await jira(`/rest/api/3/issue/${key}`, {
      method: 'PUT',
      body: JSON.stringify({ fields: { priority: { name: 'High' } } }),
    });
    console.log(`🔺 ${key}: Prioritaet auf High gesetzt.`);
  } catch (err) {
    // Prioritaet ist projektabhaengig: Feld nicht auf dem Screen oder anderes
    // Namensschema. Solange das Label sitzt, traegt es die Eskalation allein.
    console.warn(
      labelGesetzt
        ? `⚠️  Prioritaet an ${key} nicht setzbar (${err.message}). Label ops-eskaliert steht.`
        : `⚠️  Eskalation an ${key} nicht durchsetzbar — weder Label noch Prioritaet (${err.message}). Der Kommentar oben ist das einzige Signal.`,
    );
  }
}

async function main() {
  pruefeEnv();

  // Dedup: offenes Ticket mit dem Label schon da?
  if (ALERT_DEDUP_LABEL) {
    const jql = encodeURIComponent(
      `project = ${JIRA_PROJECT_KEY} AND labels = "${ALERT_DEDUP_LABEL}" AND statusCategory != Done`,
    );
    // Neues Such-API (das alte /search wurde von Atlassian entfernt, CHANGE-2046);
    // liefert kein "total" mehr — Existenz über issues[] prüfen.
    const found = await jira(`/rest/api/3/search/jql?jql=${jql}&maxResults=1&fields=key`);
    if (found.issues?.length > 0) {
      await vermerkeVorfall(found.issues[0].key);
      return;
    }
  }

  const allLabels = [...new Set([...labels, ...(ALERT_DEDUP_LABEL ? [ALERT_DEDUP_LABEL] : []), 'ops-auto'])];
  const lines = (ALERT_DESCRIPTION || 'Automatischer Ops-Alert.').split('\n').filter((l) => l.trim().length);
  const description = {
    type: 'doc',
    version: 1,
    content: [
      ...lines.map((l) => ({ type: 'paragraph', content: [{ type: 'text', text: l }] })),
      { type: 'paragraph', content: [{ type: 'text', text: '— Automatisch erstellt von ops-alert-to-jira.mjs (GitHub Actions).' }] },
    ],
  };

  const created = await jira('/rest/api/3/issue', {
    method: 'POST',
    body: JSON.stringify({
      fields: {
        project: { key: JIRA_PROJECT_KEY },
        summary: ALERT_SUMMARY.slice(0, 250),
        issuetype: { name: ALERT_ISSUETYPE },
        labels: allLabels,
        description,
      },
    }),
  });
  console.log(`✅ Jira-Ticket erstellt: ${created.key} (${base()}/browse/${created.key})`);
}

// Nur beim direkten Aufruf ausfuehren — ein Import (Tests) soll nichts tun.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error(`❌ ops-alert-to-jira fehlgeschlagen: ${err.message}`);
    process.exit(1);
  });
}
