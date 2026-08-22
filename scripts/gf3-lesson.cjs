#!/usr/bin/env node
/**
 * GF3 Lektion des Tages — Automated Stop Hook
 *
 * Feuert am Ende jeder Claude Code Session.
 * Synthesiert eine strukturierte "Lektion für Gründer" aus den
 * jüngsten claude-mem Observations und speichert sie zurück.
 *
 * Geschäftsfeld 3: "Ehrliches System" — transparente Dokumentation
 * wie die Steakakademie aufgebaut wurde, für andere Gründer.
 */

'use strict';

const https = require('https');
const http  = require('http');
const fs    = require('fs');
const path  = require('path');
const os    = require('os');

// ─── Config ────────────────────────────────────────────────────────────────
const WORKER_PORT      = parseInt(process.env.CLAUDE_MEM_WORKER_PORT || '37777', 10);
const PROJECT          = 'Uwe';
const GF3_LOG_FILE     = path.join(os.homedir(), '.claude', 'gf3-log.json');
const PROJECT_ROOT     = 'C:\\Dev\\steakakademie-v2';
const MEMORY_MD        = path.join(PROJECT_ROOT, 'memory.md');
const ENV_LOCAL        = path.join(PROJECT_ROOT, '.env.local');
const MEMORY_MAX       = 40; // jüngste Einträge in memory.md behalten (Rest in claude-mem + Git-Historie)
const OBS_LIMIT        = 20;

// API-Key: erst Env, dann sicher aus der gitignored .env.local (nie in Git/Settings).
function resolveApiKey() {
  if (process.env.ANTHROPIC_API_KEY) return process.env.ANTHROPIC_API_KEY;
  try {
    const m = fs.readFileSync(ENV_LOCAL, 'utf-8').match(/^\s*ANTHROPIC_API_KEY\s*=\s*"?([^"\r\n]+)"?/m);
    if (m) return m[1].trim();
  } catch { /* ignore */ }
  return null;
}
const ANTHROPIC_API_KEY = resolveApiKey();
// ───────────────────────────────────────────────────────────────────────────

function httpRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const lib = (options.port === 443) ? https : http;
    const req = lib.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try   { resolve({ status: res.statusCode, data: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, data }); }
      });
    });
    req.setTimeout(8000, () => { req.destroy(); reject(new Error('timeout')); });
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

// ── 1. Prüfen ob Worker läuft ───────────────────────────────────────────────
async function workerHealthy() {
  try {
    const r = await httpRequest({
      hostname: 'localhost', port: WORKER_PORT,
      path: '/api/search?query=*&limit=1', method: 'GET'
    });
    return r.status < 400;
  } catch { return false; }
}

// ── 2. Jüngste Observations holen ──────────────────────────────────────────
// WICHTIG (Fix 03.07.2026): Der frühere Fallback auf /api/context/inject
// nahm einen generischen Meta-Text (Token-/Observation-Statistiken, keine
// echten Session-Fakten) und reichte ihn als "Observation" an Haiku weiter.
// Ergebnis: Haiku halluzinierte plausibel klingende, aber frei erfundene
// GF3-Lektionen (falsche Payment-Provider, erfundene Nutzerzahlen etc.),
// die dauerhaft in memory.md landeten. Der Fallback ist deshalb entfernt —
// ohne echte, konkrete Observations wird lieber NICHTS geschrieben
// (siehe "Keine Observations — übersprungen" in main()).
async function getRecentObservations() {
  try {
    const r = await httpRequest({
      hostname: 'localhost', port: WORKER_PORT,
      path: `/api/search?query=*&project=${PROJECT}&limit=${OBS_LIMIT}`,
      method: 'GET'
    });
    if (r.status === 200 && Array.isArray(r.data)) {
      // Qualitäts-Gate: nur Observations mit echtem Inhalt (narrative/facts
      // von sinnvoller Länge) zählen — reine Platzhalter/Leerobjekte raus.
      return r.data.filter((o) => {
        const text = (o && (o.narrative || o.facts)) ? String(o.narrative || o.facts) : '';
        return text.trim().length >= 40;
      });
    }
  } catch (err) {
    process.stderr.write(`[gf3] fetch obs error: ${err.message}\n`);
  }
  return [];
}

// ── 3. GF3-Lektion via Claude Haiku synthesieren ───────────────────────────
async function synthesizeLesson(observations) {
  if (!ANTHROPIC_API_KEY) return null;

  const obsText = observations
    .slice(0, 15)
    .map((o) => {
      const parts = [];
      if (o.type)      parts.push(`[${o.type}]`);
      if (o.title)     parts.push(o.title);
      if (o.subtitle)  parts.push(`— ${o.subtitle}`);
      if (o.narrative) parts.push(`\n  ${o.narrative.slice(0, 300)}`);
      else if (o.facts) parts.push(`\n  ${String(o.facts).slice(0, 200)}`);
      return parts.join(' ');
    })
    .join('\n\n');

  if (!obsText.trim()) return null;

  const today  = new Date().toLocaleDateString('de-DE', { day:'2-digit', month:'long', year:'numeric' });
  const prompt = `Du dokumentierst den Aufbau der Steakakademie (${today}) für andere Gründer.

Aktuelle Session-Aktivitäten (claude-mem Observations):
---
${obsText}
---

WICHTIG: Nutze AUSSCHLIESSLICH konkrete Fakten, die oben tatsächlich stehen
(echte Dateinamen, Produktnamen, Tickets, Zahlen). Erfinde NICHTS dazu — keine
Nutzerzahlen, Zahlungsanbieter, Architektur-Entscheidungen o.ä., die nicht
explizit in den Observations genannt sind. Falls die Observations zu vage oder
generisch sind, um daraus etwas Konkretes und Wahres zu extrahieren, antworte
exakt mit "SKIP" (nur dieses eine Wort) statt zu spekulieren.

Erstelle eine kompakte GF3-Lektion (max 220 Wörter) exakt in diesem Format:

**Was gebaut:** [1-2 Sätze: Was wurde konkret implementiert/entschieden?]

**Warum so:** [Die wichtigste Entscheidung dieser Session + Begründung — warum dieser Weg, nicht ein anderer?]

**Was nicht funktioniert hat:** [Fehler, Umwege, Zeitfresser — ehrlich. Falls nichts: "Keine Probleme."]

**Gründer-Lektion:** [Übertragbare Erkenntnis für andere, die eine ähnliche Plattform aufbauen — konkret, nicht abstrakt]

**Nächster Schritt:** [Was folgt logisch als nächstes?]

Ton: direkt, ehrlich, keine Marketingsprache. Schreibe für jemanden, der das System nachbauen will.`;

  const body = JSON.stringify({
    model: 'claude-haiku-4-5',
    cache_control: { type: 'ephemeral' },
    max_tokens: 450,
    messages: [{ role: 'user', content: prompt }]
  });

  try {
    const r = await httpRequest({
      hostname: 'api.anthropic.com', port: 443,
      path: '/v1/messages', method: 'POST',
      headers: {
        'Content-Type':      'application/json',
        'x-api-key':         ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Length':    Buffer.byteLength(body),
      }
    }, body);

    if (r.status === 200 && r.data?.content?.[0]?.text) {
      const text = r.data.content[0].text.trim();
      if (text === 'SKIP' || text.startsWith('SKIP')) {
        process.stderr.write('[gf3] Modell meldet SKIP — zu vage für eine belastbare Lektion\n');
        return null;
      }
      return text;
    }
    process.stderr.write(`[gf3] Anthropic error ${r.status}\n`);
    return null;
  } catch (err) {
    process.stderr.write(`[gf3] Anthropic call failed: ${err.message}\n`);
    return null;
  }
}

// ── 4a. Lokal in gf3-log.json speichern ────────────────────────────────────
function saveToLocalLog(lesson, observations) {
  let log = [];
  try {
    if (fs.existsSync(GF3_LOG_FILE)) {
      log = JSON.parse(fs.readFileSync(GF3_LOG_FILE, 'utf-8'));
    }
  } catch { /* start fresh */ }

  log.push({
    datum:       new Date().toISOString(),
    lektion:     lesson,
    obs_count:   observations.length,
    projekt:     PROJECT,
  });

  // Halte maximal 365 Einträge
  if (log.length > 365) log = log.slice(-365);

  fs.writeFileSync(GF3_LOG_FILE, JSON.stringify(log, null, 2), 'utf-8');
  return true;
}

// ── 4c. Ins committete memory.md schreiben (dauerhaft via Git) ─────────────
function appendToMemoryMd(lesson) {
  try {
    const today = new Date().toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' });
    const entry = `## ${today} — Auto-Lektion\n\n${lesson.trim()}`;
    let content = '';
    try { content = fs.readFileSync(MEMORY_MD, 'utf-8'); } catch { /* neu */ }
    const idx = content.indexOf('\n## ');
    const header = (idx >= 0 ? content.slice(0, idx) : content).replace(/\s+$/, '');
    const entries = idx >= 0
      ? content.slice(idx + 1).split(/\n(?=## )/).map((s) => s.trim()).filter(Boolean)
      : [];
    entries.push(entry.trim());
    const kept = entries.slice(-MEMORY_MAX);
    fs.writeFileSync(MEMORY_MD, header + '\n\n' + kept.join('\n\n') + '\n', 'utf-8');
    process.stdout.write(`[gf3] ✅ memory.md ergänzt (${MEMORY_MD})\n`);
    return true;
  } catch (err) {
    process.stderr.write(`[gf3] memory.md schreiben fehlgeschlagen: ${err.message}\n`);
    return false;
  }
}

// ── 4b. An claude-mem worker posten ────────────────────────────────────────
async function saveToClaudeMem(lesson) {
  const today   = new Date().toISOString().split('T')[0];
  const payload = JSON.stringify({
    project:              PROJECT,
    type:                 'gf3_lesson',
    title:                `GF3-Lektion ${today}`,
    subtitle:             'Ehrliches System — Auto-generiert',
    narrative:            lesson,
    facts:                JSON.stringify({ geschäftsfeld: 'GF3', automatisch: true }),
    source_tool:          'stop_hook',
    source_input_summary: 'Automatisch nach Session-Ende generiert',
  });

  const endpoints = [
    '/api/observations',
    '/api/memory',
  ];

  for (const ep of endpoints) {
    try {
      const r = await httpRequest({
        hostname: 'localhost', port: WORKER_PORT,
        path: ep, method: 'POST',
        headers: {
          'Content-Type':   'application/json',
          'Content-Length': Buffer.byteLength(payload),
        }
      }, payload);
      if (r.status === 200 || r.status === 201) {
        process.stdout.write(`[gf3] ✅ Gespeichert in claude-mem (${ep})\n`);
        return true;
      }
    } catch { /* try next */ }
  }
  return false;
}

// ── Main ────────────────────────────────────────────────────────────────────
async function main() {
  // Stille Fehlerbehandlung — Hook darf Session nie blockieren
  try {
    const healthy = await workerHealthy();
    if (!healthy) {
      process.stderr.write('[gf3] Worker nicht erreichbar — übersprungen\n');
      return;
    }

    const observations = await getRecentObservations();
    if (!observations.length) {
      process.stderr.write('[gf3] Keine Observations — übersprungen\n');
      return;
    }

    const lesson = await synthesizeLesson(observations);
    if (!lesson) {
      process.stderr.write('[gf3] Synthese fehlgeschlagen — übersprungen\n');
      return;
    }

    // Immer lokal speichern
    saveToLocalLog(lesson, observations);
    process.stdout.write(`[gf3] ✅ GF3-Lektion lokal gespeichert (${GF3_LOG_FILE})\n`);

    // Dauerhaft ins committete memory.md (überlebt Rechner-Verlust via Git)
    appendToMemoryMd(lesson);

    // Zusätzlich in claude-mem (Fehler werden ignoriert)
    await saveToClaudeMem(lesson);

    process.stdout.write('[gf3] ✅ Session dokumentiert\n');

  } catch (err) {
    process.stderr.write(`[gf3] Unerwarteter Fehler: ${err.message}\n`);
  }
}

main().then(() => process.exit(0)).catch(() => process.exit(0));
