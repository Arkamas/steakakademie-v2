#!/usr/bin/env node
/**
 * PM-Status-Generator
 *
 * Misst den Projektstatus aus überprüfbaren Fakten und schreibt
 * src/lib/pm-agent-context.generated.ts.
 *
 * Entwurf, Regeln und Begründung: docs/pm-status-generator.md
 * Kriterienkatalog:               data/pm-status-kriterien.yaml
 *
 * Aufruf:
 *   node scripts/generate-pm-context.mjs              # messen + schreiben
 *   node scripts/generate-pm-context.mjs --offline    # ohne Netz-Prüfungen
 *   node scripts/generate-pm-context.mjs --check      # nur prüfen, Exit 1 bei Abweichung
 *
 * Die drei Zustände eines Kriteriums:
 *   erfuellt | nicht_erfuellt | nicht_messbar
 * `nicht_messbar` fällt aus dem Nenner. Ein Fehlschlag (Netz, Tool, Parsing)
 * ergibt IMMER `nicht_messbar`, niemals `nicht_erfuellt` — sonst wird aus
 * "konnte nicht prüfen" die Behauptung "ist nicht erfüllt".
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
// js-yaml v4: `load` nutzt das Default-Schema und kann keine beliebigen Typen
// instanziieren — `safeLoad` wurde in v4 entfernt, weil `load` es ersetzt.
// (Die PyYAML-Warnung vor `yaml.load` trifft hier nicht zu.)
import yaml from 'js-yaml';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const KRITERIEN = join(ROOT, 'data/pm-status-kriterien.yaml');
const ZIEL = join(ROOT, 'src/lib/pm-agent-context.generated.ts');

const argv = process.argv.slice(2);
const OFFLINE = argv.includes('--offline');
const CHECK = argv.includes('--check');

const ERFUELLT = 'erfuellt';
const NICHT_ERFUELLT = 'nicht_erfuellt';
const NICHT_MESSBAR = 'nicht_messbar';

const p = (...t) => join(ROOT, ...t);
const lies = (...t) => readFileSync(p(...t), 'utf8');

// npm/npx sind auf Windows Batch-Dateien; Node >= 18 startet .cmd nur ueber
// eine Shell (Absicherung gegen CVE-2024-27980). execSync mit EINEM festen
// Kommando-String ist die nicht-deprecated Form — es wird nichts verkettet,
// und alle Kommandos hier sind Literale ohne Fremdeingabe.
const shell = (kommando) =>
  execSync(kommando, { cwd: ROOT, stdio: 'pipe', encoding: 'utf8' });

/** Bricht den Lauf ab. Siehe Regel 3: lieber kein Ergebnis als ein falsches. */
function abbruch(grund) {
  console.error('\nABBRUCH: ' + grund);
  console.error('Es wurde nichts geschrieben. Siehe docs/pm-status-generator.md (Regel 3).\n');
  process.exit(1);
}

const ok = (beleg) => ({ status: ERFUELLT, beleg });
const nein = (beleg) => ({ status: NICHT_ERFUELLT, beleg });
const unklar = (beleg) => ({ status: NICHT_MESSBAR, beleg });

// ───────────────────────────── Prüfungen ─────────────────────────────
// Jede Prüfung bekommt das Kriterium-Objekt und gibt {status, beleg} zurück.

const PRUEFUNGEN = {
  'datei-vorhanden': (k) =>
    existsSync(p(k.datei))
      ? ok(`${k.datei} vorhanden`)
      : nein(`${k.datei} fehlt`),

  'pfad-vorhanden': (k) =>
    existsSync(p(k.datei))
      ? ok(`${k.datei} vorhanden`)
      : nein(`${k.datei} fehlt`),

  'personas-angelegt': () => {
    const src = lies('src/lib/authors.ts');
    const slugs = [...src.matchAll(/slug:\s*'([^']+)'/g)].map((m) => m[1]);
    const soll = ['marco', 'jonas', 'elena'];
    const fehlend = soll.filter((s) => !slugs.includes(s));
    return fehlend.length
      ? nein(`fehlt in authors.ts: ${fehlend.join(', ')}`)
      : ok(`${soll.length} von ${soll.length} Personas angelegt`);
  },

  'avatar-pfade-aufloesbar': () => {
    const src = lies('src/lib/authors.ts');
    const pfade = [...src.matchAll(/avatar:\s*'([^']+)'/g)].map((m) => m[1]);
    if (!pfade.length) return unklar('keine avatar-Pfade in authors.ts gefunden');
    const fehlend = pfade.filter((f) => !existsSync(p('public' + f)));
    return fehlend.length
      ? nein(`${fehlend.length} von ${pfade.length} Pfaden zeigen ins Leere: ${fehlend.join(', ')}`)
      : ok(`alle ${pfade.length} Pfade auflösbar`);
  },

  'zustand-videos-vollstaendig': () => {
    const zustaende = avatarZustaende();
    // 'hidden' ist der geschlossene Zustand — dafür ist kein Asset nötig.
    const sichtbar = zustaende.filter((z) => z !== 'hidden');
    const dir = p('public/videos/marco');
    const dateien = existsSync(dir) ? readdirSync(dir) : [];
    const belegt = sichtbar.filter((z) => dateien.some((f) => f.toLowerCase().startsWith(z)));
    return belegt.length === sichtbar.length
      ? ok(`${belegt.length} von ${sichtbar.length} Zuständen mit Video belegt`)
      : nein(`${belegt.length} von ${sichtbar.length} Zuständen mit Video belegt`);
  },

  'rotations-vollstaendig': () => {
    const zustaende = avatarZustaende();
    const src = lies('src/components/ai/MarcoAvatar.tsx');
    const block = src.match(/ROTATIONS[^=]*=\s*\{([\s\S]*?)\}/);
    if (!block) return unklar('ROTATIONS-Block in MarcoAvatar.tsx nicht gefunden');
    const belegt = [...block[1].matchAll(/^\s*([a-z_]+)\s*:/gm)].map((m) => m[1]);
    const fehlend = zustaende.filter((z) => !belegt.includes(z));
    return fehlend.length
      ? nein(`ohne Rotation: ${fehlend.join(', ')}`)
      : ok(`alle ${zustaende.length} Zustände abgedeckt`);
  },

  'bios-ohne-erfahrungsbehauptung': () => {
    const src = lies('src/lib/authors.ts');
    // Formulierungen, die gelebte Erfahrung oder Eigentests behaupten.
    // Herkunft: der UWG-Fund vom 09.08.2026 (siehe memory.md).
    const muster = [
      /testet? (?:alle )?Produkte selbst/i,
      /\b\d+\+? (?:Grillsessions|Grillkurse)\b/i,
      /(?:seit|über) \d+ Jahren? (?:Grill)?(?:praxis|erfahrung)/i,
      /Nachtschicht am Smoker/i,
      /probiert? (?:alles|jedes) selbst/i,
    ];
    // Nur KI-Personas prüfen — Uwe ist eine reale Person und darf Erfahrung haben.
    const bloecke = src.split(/\{\s*\n/).filter((b) => /slug:\s*'(marco|jonas|elena)'/.test(b));
    if (!bloecke.length) return unklar('keine Persona-Blöcke isolierbar');
    const treffer = [];
    for (const b of bloecke) {
      const slug = (b.match(/slug:\s*'([^']+)'/) || [])[1];
      for (const m of muster) {
        const t = b.match(m);
        if (t) treffer.push(`${slug}: "${t[0]}"`);
      }
    }
    return treffer.length
      ? nein(`Erfahrungsbehauptung gefunden — ${treffer.join(' · ')}`)
      : ok(`${bloecke.length} Persona-Bios ohne Erfahrungsbehauptung`);
  },

  'typecheck-fehlerfrei': () => {
    try {
      shell('npx tsc --noEmit');
      return ok('tsc --noEmit ohne Fehler');
    } catch (e) {
      const aus = String(e.stdout || '') + String(e.stderr || '');
      // Werkzeug nicht ausführbar => nicht messbar. Typfehler => nicht erfüllt.
      if (/is not recognized|command not found|ENOENT/i.test(aus)) {
        return unklar('tsc nicht ausführbar');
      }
      const n = (aus.match(/error TS\d+/g) || []).length;
      return nein(n ? `${n} Typfehler` : 'tsc endete mit Fehler');
    }
  },

  'tsconfig-strict': () => {
    const t = JSON.parse(lies('tsconfig.json').replace(/^\s*\/\/.*$/gm, ''));
    return t.compilerOptions?.strict === true
      ? ok('compilerOptions.strict = true')
      : nein('strict ist nicht aktiv');
  },

  'audit-schwelle': (k) => {
    const v = npmAudit();
    if (!v) return unklar('npm audit lieferte kein verwertbares JSON');
    const n = v[k.stufe] ?? 0;
    return n === 0
      ? ok(`0 Schwachstellen der Stufe ${k.stufe}`)
      : nein(`${n} Schwachstellen der Stufe ${k.stufe}`);
  },

  'env-example-vollstaendig': () => {
    const genutzt = envVarsImCode();
    if (!genutzt.size) return unklar('keine process.env-Referenzen gefunden');
    const doku = new Set(
      lies('.env.example')
        .split(/\r?\n/)
        .map((l) => (l.match(/^\s*([A-Z0-9_]+)\s*=/) || [])[1])
        .filter(Boolean),
    );
    const fehlend = [...genutzt].filter((v) => !doku.has(v)).sort();
    return fehlend.length
      ? nein(`${doku.size} von ${genutzt.size} dokumentiert — es fehlen ${fehlend.length}`)
      : ok(`alle ${genutzt.size} Variablen dokumentiert`);
  },

  'deploy-konfig-eindeutig': () => {
    const da = ['netlify.toml', 'vercel.json'].filter((f) => existsSync(p(f)));
    if (da.length === 1) return ok(`nur ${da[0]}`);
    if (da.length === 0) return nein('keine Deploy-Konfiguration im Repo');
    return nein(`${da.length} konkurrierende Konfigurationen: ${da.join(' + ')}`);
  },

  'deploy-konfig-passt-zum-hoster': async () => {
    if (OFFLINE) return unklar('--offline: Netz-Prüfung übersprungen');
    const hoster = await liveHoster();
    if (!hoster) return unklar('Live-Hoster nicht ermittelbar (Netzfehler oder Timeout)');
    const konfig = existsSync(p('vercel.json'))
      ? existsSync(p('netlify.toml')) ? 'mehrdeutig' : 'vercel'
      : existsSync(p('netlify.toml')) ? 'netlify' : 'keine';
    if (konfig === 'mehrdeutig') {
      return nein(`Live läuft auf ${hoster}, im Repo liegen aber beide Konfigurationen`);
    }
    return konfig === hoster
      ? ok(`Live-Hoster ${hoster} passt zur Konfiguration`)
      : nein(`Live läuft auf ${hoster}, im Repo liegt ${konfig}`);
  },

  'modell-ids-gepinnt': () => {
    const ids = claudeModellIds();
    if (!ids.size) return unklar('keine Claude-Modell-IDs gefunden');
    // Gepinnt = endet auf ein Datum (YYYYMMDD) oder eine Punktversion.
    const frei = [...ids].filter((id) => !/-\d{8}$/.test(id)).sort();
    return frei.length
      ? nein(`${ids.size - frei.length} von ${ids.size} gepinnt — frei: ${frei.join(', ')}`)
      : ok(`alle ${ids.size} Modell-IDs gepinnt`);
  },

  'node-engine-deklariert': () => {
    const pkg = JSON.parse(lies('package.json'));
    return pkg.engines?.node
      ? ok(`engines.node = ${pkg.engines.node}`)
      : nein('package.json deklariert kein engines.node');
  },

  'lockfile-synchron': () => {
    if (!existsSync(p('package-lock.json'))) return nein('package-lock.json fehlt');
    try {
      shell('npm ls --all --json');
      return ok('npm ls meldet keine Abweichung');
    } catch (e) {
      const aus = String(e.stdout || '');
      let problem = 0;
      try {
        const j = JSON.parse(aus);
        problem = (j.problems || []).length;
      } catch {
        return unklar('npm ls lieferte kein verwertbares JSON');
      }
      return nein(`npm ls meldet ${problem} Abweichung(en)`);
    }
  },
};

// ───────────────────────── Fakten-Helfer (Ebene 1) ─────────────────────────

let _zustaende = null;
function avatarZustaende() {
  if (_zustaende) return _zustaende;
  const src = lies('src/hooks/useAvatarStateMachine.ts');
  const typ = src.match(/AvatarState\s*=\s*([^;]+);/);
  if (!typ) abbruch('AvatarState-Typ in useAvatarStateMachine.ts nicht gefunden.');
  _zustaende = [...typ[1].matchAll(/'([a-z_]+)'/g)].map((m) => m[1]);
  if (!_zustaende.length) abbruch('AvatarState enthält keine Zustände.');
  return _zustaende;
}

let _audit;
function npmAudit() {
  if (_audit !== undefined) return _audit;
  let aus = '';
  try {
    aus = shell('npm audit --json');
  } catch (e) {
    // Exit-Code != 0 ist bei Funden normal; das JSON steht trotzdem in stdout.
    aus = String(e.stdout || '');
  }
  try {
    _audit = JSON.parse(aus).metadata.vulnerabilities;
  } catch {
    _audit = null;
  }
  return _audit;
}

function quelldateien() {
  const treffer = [];
  const gehe = (dir) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      if (e.name === 'node_modules' || e.name.startsWith('.')) continue;
      const voll = join(dir, e.name);
      if (e.isDirectory()) gehe(voll);
      else if (/\.(ts|tsx|mjs|js)$/.test(e.name)) treffer.push(voll);
    }
  };
  for (const d of ['src', 'scripts']) if (existsSync(p(d))) gehe(p(d));
  return treffer;
}

function envVarsImCode() {
  const s = new Set();
  for (const f of quelldateien()) {
    for (const m of readFileSync(f, 'utf8').matchAll(/process\.env\.([A-Z0-9_]+)/g)) s.add(m[1]);
  }
  // Von der Laufzeit gestellt, gehören nicht in .env.example.
  for (const v of ['NODE_ENV', 'PATH', 'GITHUB_OUTPUT', 'GITHUB_STEP_SUMMARY']) s.delete(v);
  return s;
}

function claudeModellIds() {
  const s = new Set();
  for (const f of quelldateien()) {
    for (const m of readFileSync(f, 'utf8').matchAll(/claude-[a-z0-9.-]+/g)) s.add(m[0]);
  }
  return s;
}

async function liveHoster() {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), 10000);
  try {
    const r = await fetch('https://steakakademie.de', { method: 'HEAD', signal: ctl.signal });
    const server = (r.headers.get('server') || '').toLowerCase();
    if (r.headers.get('x-vercel-id') || server.includes('vercel')) return 'vercel';
    if (r.headers.get('x-nf-request-id') || server.includes('netlify')) return 'netlify';
    return null;
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

// ─────────────────────── CLAUDE.md §5 (Regel 3) ───────────────────────

function kritischeBlocker() {
  const md = lies('CLAUDE.md');
  const sek = md.split(/^## /m).find((s) => /^\d+\.\s*Kritische Blocker/.test(s));
  if (!sek) {
    abbruch(
      'Die Sektion "Kritische Blocker" wurde in CLAUDE.md nicht gefunden.\n' +
      'Wurde die Überschrift umbenannt? Eine leere Blockerliste würde dem\n' +
      'PM-Agenten "null Blocker" erzählen — deshalb der Abbruch.',
    );
  }
  // Einträge sind mehrzeilig (Folgezeilen eingerückt). Erst am Beginn eines
  // neuen nummerierten Punkts trennen, sonst wird mitten im Satz abgeschnitten.
  // Die erste Zeile ist die Sektionsüberschrift selbst ("5. Kritische Blocker …")
  // und beginnt ebenfalls mit einer Nummer — ohne slice(1) zählt sie als Blocker.
  const zeilen = sek.split(/\r?\n/).slice(1);
  const roh = [];
  for (const z of zeilen) {
    if (/^\d+\.\s+/.test(z)) roh.push(z.replace(/^\d+\.\s+/, ''));
    else if (roh.length && /^\s+\S/.test(z)) roh[roh.length - 1] += ' ' + z.trim();
    else if (/^---\s*$/.test(z.trim())) break; // Sektionsende
  }
  const eintraege = roh
    .map((t) => t.replace(/\*\*/g, '').replace(/\s+/g, ' ').trim())
    .filter(Boolean);
  if (!eintraege.length) {
    abbruch('Die Blocker-Sektion in CLAUDE.md enthält keine nummerierten Einträge.');
  }
  return eintraege;
}

// ───────────────────────────── Auswertung ─────────────────────────────

async function main() {
  if (!existsSync(KRITERIEN)) abbruch(`Kriterienkatalog fehlt: ${KRITERIEN}`);
  const katalog = yaml.load(readFileSync(KRITERIEN, 'utf8'));
  if (!katalog?.bereiche?.length) abbruch('Kriterienkatalog enthält keine Bereiche.');

  const bereiche = [];
  const completed = [];
  const open = [];

  for (const b of katalog.bereiche) {
    const ergebnisse = [];
    for (const k of b.kriterien) {
      const fn = PRUEFUNGEN[k.pruefung];
      // Regel 4: unbekannte Prüfung ist ein harter Fehler, kein stilles Überspringen.
      if (!fn) abbruch(`Kriterium "${k.id}" verweist auf unbekannte Prüfung "${k.pruefung}".`);
      let r;
      try {
        r = await fn(k);
      } catch (e) {
        // Regel 2: Fehlschlag ist kein Ergebnis.
        r = unklar(`Prüfung brach ab: ${e.message}`);
      }
      ergebnisse.push({ id: k.id, frage: k.frage, ...r });
      if (r.status === ERFUELLT) completed.push(k.frage);
      if (r.status === NICHT_ERFUELLT) open.push(k.frage);
    }
    const pruefbar = ergebnisse.filter((r) => r.status !== NICHT_MESSBAR).length;
    const erfuellt = ergebnisse.filter((r) => r.status === ERFUELLT).length;
    bereiche.push({
      name: b.name,
      erfuellt,
      pruefbar,
      nichtMessbar: ergebnisse.length - pruefbar,
      score: pruefbar ? Math.round((erfuellt / pruefbar) * 100) : null,
      kriterien: ergebnisse,
    });
  }

  const critical = kritischeBlocker();
  const nichtGemessen = (katalog.nicht_gemessen || []).map((n) => ({
    name: n.name,
    grund: String(n.grund || '').replace(/\s+/g, ' ').trim(),
  }));

  // readinessScore bleibt null, solange nicht alle acht Bereiche migriert sind.
  const alleMigriert = nichtGemessen.length === 0;
  const gesErfuellt = bereiche.reduce((s, b) => s + b.erfuellt, 0);
  const gesPruefbar = bereiche.reduce((s, b) => s + b.pruefbar, 0);
  const readinessScore =
    alleMigriert && gesPruefbar ? Math.round((gesErfuellt / gesPruefbar) * 100) : null;

  const daten = {
    readinessScore,
    erfuelltGesamt: gesErfuellt,
    pruefbarGesamt: gesPruefbar,
    nichtMessbarGesamt: bereiche.reduce((s, b) => s + b.nichtMessbar, 0),
    bereiche,
    nichtGemessen,
    critical,
    completed,
    open,
    generatedAt: new Date().toISOString(),
    offline: OFFLINE,
  };

  const datei = rendere(daten);

  if (CHECK) {
    const alt = existsSync(ZIEL) ? readFileSync(ZIEL, 'utf8') : '';
    const strip = (s) => s.replace(/"generatedAt":\s*"[^"]*"/, '').replace(/\r\n/g, '\n');
    if (strip(alt) !== strip(datei)) {
      console.error('\n--check: Die generierte Datei ist nicht aktuell.');
      console.error('   npm run pm:context   ausführen und das Ergebnis committen.\n');
      process.exit(1);
    }
    console.log('--check: aktuell.');
    bericht(daten);
    return;
  }

  writeFileSync(ZIEL, datei, 'utf8');
  bericht(daten);
  console.log(`\nGeschrieben: ${ZIEL.replace(ROOT + '\\', '').replace(ROOT + '/', '')}`);
}

function rendere(d) {
  const j = (v) => JSON.stringify(v, null, 2).replace(/\n/g, '\n  ');
  return `// ⚠️ AUTO-GENERIERT von scripts/generate-pm-context.mjs — NICHT MANUELL BEARBEITEN.
//
// Neu erzeugen mit:  npm run pm:context
// Entwurf & Regeln:  docs/pm-status-generator.md
// Kriterienkatalog:  data/pm-status-kriterien.yaml
//
// Jedes Kriterium hat drei mögliche Zustände: erfuellt | nicht_erfuellt |
// nicht_messbar. "nicht_messbar" fällt aus dem Nenner — es bedeutet
// "konnte nicht geprüft werden", NICHT "ist nicht erfüllt".
//
// readinessScore ist bewusst null, solange nicht alle acht Bereiche einen
// Kriterienkatalog haben. Eine fehlende Kennzahl ist ehrlicher als eine
// geschätzte (CLAUDE.md Regel 7).

export type KriteriumStatus = 'erfuellt' | 'nicht_erfuellt' | 'nicht_messbar'

export interface Kriterium {
  id: string
  frage: string
  status: KriteriumStatus
  beleg: string
}

export interface Bereich {
  name: string
  erfuellt: number
  pruefbar: number
  nichtMessbar: number
  /** null, wenn kein einziges Kriterium prüfbar war */
  score: number | null
  kriterien: Kriterium[]
}

export interface ProjectStatus {
  /** null, solange nicht alle Bereiche gemessen werden */
  readinessScore: number | null
  erfuelltGesamt: number
  pruefbarGesamt: number
  nichtMessbarGesamt: number
  bereiche: Bereich[]
  nichtGemessen: { name: string; grund: string }[]
  /** geparst aus CLAUDE.md §5 — dort ist die Quelle der Wahrheit */
  critical: string[]
  completed: string[]
  open: string[]
  generatedAt: string
  /** true, wenn ohne Netz erzeugt — Netz-Kriterien sind dann nicht_messbar */
  offline: boolean
}

export const PROJECT_STATUS: ProjectStatus = ${j(d)}
`;
}

function bericht(d) {
  const zeichen = { erfuellt: '✓', nicht_erfuellt: '✕', nicht_messbar: '?' };
  for (const b of d.bereiche) {
    console.log(`\n${b.name} — ${b.score}% (${b.erfuellt}/${b.pruefbar}${b.nichtMessbar ? `, ${b.nichtMessbar} nicht messbar` : ''})`);
    for (const k of b.kriterien) console.log(`  ${zeichen[k.status]} ${k.frage}\n      ${k.beleg}`);
  }
  console.log(`\nKritische Blocker aus CLAUDE.md §5: ${d.critical.length}`);
  for (const c of d.critical) console.log(`  • ${c}`);
  console.log(`\nNicht gemessen: ${d.nichtGemessen.length} Bereiche`);
  console.log(
    `readinessScore: ${d.readinessScore === null ? 'null (nicht alle Bereiche migriert)' : d.readinessScore + '%'}` +
    ` · gesamt ${d.erfuelltGesamt}/${d.pruefbarGesamt} erfüllt`,
  );
}

main().catch((e) => abbruch(e.stack || e.message));
