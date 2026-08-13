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
// Label, wird KEIN Duplikat erzeugt (nur Hinweis).

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
} = process.env;

function skip(msg) {
  console.log(`⏭️  ops-alert-to-jira übersprungen: ${msg}`);
  process.exit(0);
}

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

const auth = 'Basic ' + Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString('base64');
const base = JIRA_BASE_URL.replace(/\/$/, '');
const labels = ALERT_LABELS.split(',').map((s) => s.trim()).filter(Boolean);

async function jira(path, init = {}) {
  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: { Authorization: auth, Accept: 'application/json', 'Content-Type': 'application/json', ...(init.headers || {}) },
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Jira ${res.status} ${path}: ${text.slice(0, 400)}`);
  return text ? JSON.parse(text) : {};
}

async function main() {
  // Dedup: offenes Ticket mit dem Label schon da?
  if (ALERT_DEDUP_LABEL) {
    const jql = encodeURIComponent(
      `project = ${JIRA_PROJECT_KEY} AND labels = "${ALERT_DEDUP_LABEL}" AND statusCategory != Done`,
    );
    // Neues Such-API (das alte /search wurde von Atlassian entfernt, CHANGE-2046);
    // liefert kein "total" mehr — Existenz über issues[] prüfen.
    const found = await jira(`/rest/api/3/search/jql?jql=${jql}&maxResults=1&fields=key`);
    if (found.issues?.length > 0) {
      console.log(`ℹ️  Offenes Ticket existiert bereits (${found.issues[0].key}) — kein Duplikat erstellt.`);
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
  console.log(`✅ Jira-Ticket erstellt: ${created.key} (${base}/browse/${created.key})`);
}

main().catch((err) => {
  console.error(`❌ ops-alert-to-jira fehlgeschlagen: ${err.message}`);
  process.exit(1);
});
