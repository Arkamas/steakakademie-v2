/**
 * OpenMontage-Launcher (scripts/om.mjs) — Aufloesungslogik
 *
 * Getestet werden die reinen Helfer, nicht der Spawn selbst: venv-Erkennung,
 * PATH-Aufbau und Befehlsaufloesung. Fixtures sind echte Temp-Verzeichnisse,
 * weil die Helfer bewusst das Dateisystem befragen statt process.platform.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { delimiter, join } from 'node:path';

// @ts-expect-error — .mjs ohne Typdeklaration, bewusst untypisiert importiert
import { venvBinDir, buildEnv, resolveCommand, needsShell } from '../../scripts/om.mjs';

// ─── Fixtures ────────────────────────────────────────────────────────────────

let posixTarget: string;   // .venv/bin
let windowsTarget: string; // .venv/Scripts
let emptyTarget: string;   // kein .venv

beforeAll(() => {
  const root = mkdtempSync(join(tmpdir(), 'om-launcher-'));

  posixTarget = join(root, 'posix');
  mkdirSync(join(posixTarget, '.venv', 'bin'), { recursive: true });
  writeFileSync(join(posixTarget, '.venv', 'bin', 'python'), '');

  windowsTarget = join(root, 'windows');
  mkdirSync(join(windowsTarget, '.venv', 'Scripts'), { recursive: true });
  writeFileSync(join(windowsTarget, '.venv', 'Scripts', 'python.exe'), '');
  writeFileSync(join(windowsTarget, '.venv', 'Scripts', 'piper.cmd'), '');

  emptyTarget = join(root, 'leer');
  mkdirSync(emptyTarget, { recursive: true });

  afterAll(() => rmSync(root, { recursive: true, force: true }));
});

// ─── venvBinDir ──────────────────────────────────────────────────────────────

describe('venvBinDir', () => {
  it('findet .venv/bin', () => {
    expect(venvBinDir(posixTarget, false)).toBe(join(posixTarget, '.venv', 'bin'));
  });

  it('findet .venv/Scripts', () => {
    expect(venvBinDir(windowsTarget, true)).toBe(join(windowsTarget, '.venv', 'Scripts'));
  });

  it('findet ein vorhandenes Verzeichnis auch gegen die Plattform-Erwartung', () => {
    // Git Bash unter Windows kann .venv/bin anlegen — das darf nicht durchfallen.
    expect(venvBinDir(posixTarget, true)).toBe(join(posixTarget, '.venv', 'bin'));
    expect(venvBinDir(windowsTarget, false)).toBe(join(windowsTarget, '.venv', 'Scripts'));
  });

  it('liefert null ohne venv', () => {
    expect(venvBinDir(emptyTarget, false)).toBeNull();
    expect(venvBinDir(join(emptyTarget, 'gibtesnicht'), false)).toBeNull();
  });
});

// ─── buildEnv ────────────────────────────────────────────────────────────────

describe('buildEnv', () => {
  it('haengt das venv vorne an den PATH', () => {
    const env = buildEnv({ PATH: `/usr/bin${delimiter}/bin` }, '/venv/bin', '/venv');
    expect(env.PATH).toBe(`/venv/bin${delimiter}/usr/bin${delimiter}/bin`);
  });

  it('respektiert die Windows-Schreibweise "Path" statt einen zweiten Key anzulegen', () => {
    const env = buildEnv({ Path: 'C:\\Windows' }, 'C:\\venv\\Scripts', 'C:\\venv');
    expect(env.Path).toBe(`C:\\venv\\Scripts${delimiter}C:\\Windows`);
    expect(env.PATH).toBeUndefined();
  });

  it('setzt VIRTUAL_ENV und entfernt PYTHONHOME', () => {
    const env = buildEnv({ PATH: '/bin', PYTHONHOME: '/anderes/python' }, '/venv/bin', '/venv');
    expect(env.VIRTUAL_ENV).toBe('/venv');
    expect('PYTHONHOME' in env).toBe(false);
  });

  it('erzeugt keinen leeren PATH-Eintrag, wenn PATH fehlt', () => {
    expect(buildEnv({}, '/venv/bin', '/venv').PATH).toBe('/venv/bin');
  });

  it('laesst das uebergebene env unveraendert', () => {
    const original = { PATH: '/bin' };
    buildEnv(original, '/venv/bin', '/venv');
    expect(original).toEqual({ PATH: '/bin' });
  });
});

// ─── resolveCommand ──────────────────────────────────────────────────────────

describe('resolveCommand', () => {
  const posixBin = () => join(posixTarget, '.venv', 'bin');
  const winBin = () => join(windowsTarget, '.venv', 'Scripts');

  it('loest einen Befehl aus dem venv absolut auf', () => {
    expect(resolveCommand('python', posixBin(), false)).toBe(join(posixBin(), 'python'));
  });

  it('probiert unter Windows die ueblichen Endungen', () => {
    expect(resolveCommand('python', winBin(), true)).toBe(join(winBin(), 'python.exe'));
    expect(resolveCommand('piper', winBin(), true)).toBe(join(winBin(), 'piper.cmd'));
  });

  it('liefert null fuer Befehle ausserhalb des venv — die sucht das OS', () => {
    expect(resolveCommand('make', posixBin(), false)).toBeNull();
    expect(resolveCommand('make', winBin(), true)).toBeNull();
  });

  it('laesst Pfadangaben unangetastet', () => {
    expect(resolveCommand('./local/tool', posixBin(), false)).toBeNull();
    expect(resolveCommand('/usr/bin/python', posixBin(), false)).toBeNull();
  });
});

// ─── needsShell ──────────────────────────────────────────────────────────────

describe('needsShell', () => {
  it('verlangt eine Shell nur fuer .cmd/.bat unter Windows', () => {
    expect(needsShell('C:\\venv\\Scripts\\piper.cmd', true)).toBe(true);
    expect(needsShell('C:\\venv\\Scripts\\run.BAT', true)).toBe(true);
    expect(needsShell('C:\\venv\\Scripts\\python.exe', true)).toBe(false);
    expect(needsShell('/venv/bin/python', false)).toBe(false);
  });
});
