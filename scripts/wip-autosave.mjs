#!/usr/bin/env node
/**
 * wip-autosave — Sicherungsnetz gegen verlorene Arbeitsstände.
 *
 * WARUM ES DAS GIBT (23.08.2026):
 * Eine fertige Homepage im Texas-Monthly-Stil lag tagelang uncommittet im
 * Arbeitsbaum und ist spurlos verschwunden — überschrieben, weggeräumt oder
 * mit einer Projektkopie gelöscht. Git konnte nichts davon retten, weil Git
 * nur schützt, was committet ist. Genau diese Lücke schließt dieses Skript.
 *
 * WAS ES TUT:
 * Schreibt den kompletten aktuellen Arbeitsbaum als Commit auf den Branch
 * `wip/auto` — und zwar über Git-Plumbing (write-tree / commit-tree /
 * update-ref) mit einem SEPARATEN Index. Dadurch bleiben unangetastet:
 *   • der Arbeitsbaum (keine Datei wird angefasst)
 *   • der aktuelle Branch und HEAD
 *   • der normale Staging-Bereich (`git add`-Stand des Nutzers)
 * Es gibt keinen Checkout, kein Stash, kein Reset. Der Lauf ist read-only
 * gegenüber allem, womit gerade gearbeitet wird.
 *
 * WAS ES NICHT TUT:
 * Nichts wird gepusht. `wip/auto` ist rein lokal — ein Netz, kein Verlauf.
 * Aufräumen kann man später; wiederherstellen kann man nur, was existiert.
 *
 * WIEDERHERSTELLEN:
 *   git log --oneline wip/auto            # Stände ansehen
 *   git show wip/auto:src/app/page.tsx    # einzelne Datei ansehen
 *   git checkout wip/auto -- src/app/page.tsx   # einzelne Datei zurückholen
 *
 * AUFRUF:
 *   node scripts/wip-autosave.mjs           # normal
 *   node scripts/wip-autosave.mjs --quiet   # nur bei Fehlern melden (Hook)
 */

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, rmSync } from 'node:fs';
import path from 'node:path';

const QUIET = process.argv.includes('--quiet');
const BRANCH = 'refs/heads/wip/auto';

function git(args, opts = {}) {
  return execFileSync('git', args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    ...opts,
  }).trim();
}

function log(msg) {
  if (!QUIET) console.log(msg);
}

try {
  // Kein Repo? Dann ist hier nichts zu sichern.
  const gitDir = git(['rev-parse', '--absolute-git-dir']);
  const repoRoot = git(['rev-parse', '--show-toplevel']);

  // Mitten in Merge/Rebase/Bisect nicht eingreifen — dort ist der Index
  // ein Arbeitsmittel und Fremdzugriff riskant.
  const busyMarkers = ['MERGE_HEAD', 'REBASE_HEAD', 'rebase-merge', 'rebase-apply', 'BISECT_LOG'];
  for (const marker of busyMarkers) {
    if (existsSync(path.join(gitDir, marker))) {
      log(`wip-autosave: übersprungen (${marker} aktiv)`);
      process.exit(0);
    }
  }

  // Gibt es überhaupt Uncommittetes? (inkl. neuer, noch unversionierter Dateien)
  const dirty = git(['status', '--porcelain', '--untracked-files=all']);
  if (!dirty) {
    log('wip-autosave: nichts zu sichern — Arbeitsbaum ist sauber.');
    process.exit(0);
  }

  // Separater Index, damit der echte Staging-Bereich unberührt bleibt.
  // Eindeutiger Name je Lauf: Auf manchen Dateisystemen (Netzlaufwerke,
  // Container-Mounts) schlägt das Löschen fehl — ein frischer Name verhindert,
  // dass dann versehentlich ein alter Index weiterverwendet wird.
  const tmpDir = path.join(gitDir, 'wip-autosave');
  mkdirSync(tmpDir, { recursive: true });
  const indexFile = path.join(tmpDir, `index-${process.pid}-${Date.now()}`);
  const tidy = (f) => { try { rmSync(f, { force: true }); } catch { /* egal */ } };

  const env = { ...process.env, GIT_INDEX_FILE: indexFile };
  const opts = { cwd: repoRoot, env };

  // Alles einsammeln, was nicht per .gitignore ausgeschlossen ist.
  // Ignorierte Pfade (node_modules, .next, …) bleiben bewusst draußen.
  git(['add', '--all', '.'], opts);
  const tree = git(['write-tree'], opts);

  // Eltern: der bisherige wip/auto-Stand (Verlauf) und HEAD (Bezugspunkt).
  const parents = [];
  const prevWip = (() => {
    try { return git(['rev-parse', '--verify', '--quiet', BRANCH]); } catch { return ''; }
  })();
  const head = (() => {
    try { return git(['rev-parse', '--verify', '--quiet', 'HEAD']); } catch { return ''; }
  })();
  if (prevWip) parents.push('-p', prevWip);
  if (head && head !== prevWip) parents.push('-p', head);

  // Unverändert gegenüber dem letzten Stand? Dann keinen Leer-Commit anlegen.
  if (prevWip) {
    const prevTree = git(['rev-parse', `${prevWip}^{tree}`]);
    if (prevTree === tree) {
      tidy(indexFile);
      log('wip-autosave: unverändert seit der letzten Sicherung.');
      process.exit(0);
    }
  }

  const branchName = (() => {
    try { return git(['rev-parse', '--abbrev-ref', 'HEAD']); } catch { return 'unbekannt'; }
  })();
  const changed = dirty.split('\n').length;
  const stamp = new Date().toISOString().replace('T', ' ').slice(0, 16);
  const message =
    `wip: Autosicherung ${stamp} (${branchName}, ${changed} Datei${changed === 1 ? '' : 'en'})\n\n` +
    `Automatisch erzeugt von scripts/wip-autosave.mjs. Nicht pushen, nicht mergen —\n` +
    `dieser Branch ist ein Sicherungsnetz, kein Verlauf.\n\n${dirty}\n`;

  const commit = execFileSync('git', ['commit-tree', tree, ...parents], {
    cwd: repoRoot,
    encoding: 'utf8',
    input: message,
  }).trim();

  git(['update-ref', BRANCH, commit, ...(prevWip ? [prevWip] : [])], { cwd: repoRoot });
  tidy(indexFile);

  log(`wip-autosave: ${changed} Datei(en) gesichert → wip/auto (${commit.slice(0, 8)})`);
} catch (err) {
  // Ein Sicherungsnetz darf niemals die eigentliche Arbeit blockieren.
  // Fehler werden gemeldet, aber nie mit einem harten Abbruch quittiert.
  console.error(`wip-autosave: übersprungen — ${err.message?.split('\n')[0] ?? err}`);
  process.exit(0);
}
