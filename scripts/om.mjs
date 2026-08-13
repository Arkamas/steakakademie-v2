#!/usr/bin/env node
// ---------------------------------------------------------------------------
// OpenMontage-Launcher — plattformneutral
//
//   node scripts/om.mjs python -m backlot open
//   node scripts/om.mjs make preflight
//
// Ermittelt das bin-Verzeichnis des OpenMontage-venv (.venv/bin unter
// Linux/macOS, .venv\Scripts unter Windows), haengt es vorne an den PATH und
// startet den uebergebenen Befehl mit cwd = tools/openmontage.
//
// Damit entfaellt der bash-only Einzeiler in package.json ("PATH=... && cd ..."),
// der unter PowerShell nicht laeuft. Der Launcher kennt bewusst keine einzelnen
// Workflows — er reicht durch, was man ihm gibt.
//
// Env-Variablen:
//   OPENMONTAGE_DIR   Installationsverzeichnis (Default: <repo>/tools/openmontage)
// ---------------------------------------------------------------------------
import { spawn } from 'node:child_process';
import { constants as osConstants } from 'node:os';
import { statSync } from 'node:fs';
import { delimiter, dirname, isAbsolute, join, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const IS_WINDOWS = process.platform === 'win32';

/** Installationsverzeichnis — gleicher Vertrag wie openmontage-setup.sh/.ps1. */
export function targetDir(env = process.env) {
  return env.OPENMONTAGE_DIR
    ? resolve(env.OPENMONTAGE_DIR)
    : join(REPO_ROOT, 'tools', 'openmontage');
}

function isDir(p) {
  try {
    return statSync(p).isDirectory();
  } catch {
    return false;
  }
}

function isFile(p) {
  try {
    return statSync(p).isFile();
  } catch {
    return false;
  }
}

/**
 * bin-Verzeichnis des venv. Geprueft wird, was tatsaechlich existiert, statt
 * es aus process.platform abzuleiten: Git Bash und MSYS-Python koennen unter
 * Windows durchaus ein .venv/bin anlegen.
 * @returns {string|null} Pfad oder null, wenn kein venv da ist.
 */
export function venvBinDir(target, isWindows = IS_WINDOWS) {
  const root = join(target, '.venv');
  const order = isWindows ? ['Scripts', 'bin'] : ['bin', 'Scripts'];
  for (const name of order) {
    const dir = join(root, name);
    if (isDir(dir)) return dir;
  }
  return null;
}

/**
 * PATH/VIRTUAL_ENV so setzen, wie es `activate` tut — sonst findet OpenMontage
 * Piper nicht und meldet "tts 0/7".
 */
export function buildEnv(baseEnv, venvBin, venvRoot) {
  const env = { ...baseEnv };
  // Windows fuehrt die Variable als "Path"; ein zusaetzliches "PATH" waere
  // ein zweiter, ignorierter Eintrag.
  const pathKey = Object.keys(env).find((k) => k.toUpperCase() === 'PATH') ?? 'PATH';
  env[pathKey] = [venvBin, env[pathKey]].filter(Boolean).join(delimiter);
  env.VIRTUAL_ENV = venvRoot;
  delete env.PYTHONHOME;
  return env;
}

/**
 * Befehl im venv-bin suchen und absolut aufloesen.
 *
 * Noetig, weil Node einen blossen Befehlsnamen gegen den PATH des *Elternteils*
 * aufloest, nicht gegen das env, das wir gerade gebaut haben. Ohne das hier
 * wuerde `python` das System-Python starten statt das aus dem venv.
 *
 * @returns {string|null} absoluter Pfad oder null (dann soll das OS suchen).
 */
export function resolveCommand(command, venvBin, isWindows = IS_WINDOWS) {
  if (isAbsolute(command) || command.includes('/') || command.includes(sep)) return null;
  const extensions = isWindows ? ['.exe', '.cmd', '.bat', ''] : [''];
  for (const ext of extensions) {
    const candidate = join(venvBin, command + ext);
    if (isFile(candidate)) return candidate;
  }
  return null;
}

/** .cmd/.bat lehnt Node seit 18.20 ohne shell:true mit EINVAL ab. */
export function needsShell(file, isWindows = IS_WINDOWS) {
  return isWindows && /\.(cmd|bat)$/i.test(file);
}

function quote(value) {
  return /[\s"]/.test(value) ? `"${value.replace(/"/g, '\\"')}"` : value;
}

const INSTALL_HINTS = {
  make: IS_WINDOWS
    ? "winget install ezwinports.make   (oder 'choco install make')"
    : 'sudo apt install make   |   macOS: brew install make',
  ffmpeg: IS_WINDOWS
    ? 'winget install Gyan.FFmpeg'
    : 'sudo apt install ffmpeg   |   macOS: brew install ffmpeg',
};

function fail(message, ...details) {
  console.error(`[om] ${message}`);
  for (const line of details) console.error(`     ${line}`);
  process.exit(1);
}

function main(argv = process.argv.slice(2)) {
  if (argv.length === 0 || argv[0] === '--help' || argv[0] === '-h') {
    console.error('Aufruf: node scripts/om.mjs <befehl> [argumente...]');
    console.error('  z. B. node scripts/om.mjs python -m backlot open');
    console.error('        node scripts/om.mjs make preflight');
    process.exit(argv.length === 0 ? 1 : 0);
  }

  const target = targetDir();
  if (!isDir(target)) {
    fail(
      `OpenMontage ist nicht installiert (${target} fehlt).`,
      IS_WINDOWS ? 'npm run video:setup:win' : 'npm run video:setup'
    );
  }

  const venvBin = venvBinDir(target);
  if (!venvBin) {
    fail(
      `Kein venv in ${join(target, '.venv')} — das Setup ist nicht durchgelaufen.`,
      IS_WINDOWS ? 'npm run video:setup:win' : 'npm run video:setup'
    );
  }

  const [command, ...args] = argv;
  const resolved = resolveCommand(command, venvBin);
  const file = resolved ?? command;
  const shell = needsShell(file);
  const env = buildEnv(process.env, venvBin, join(target, '.venv'));

  const child = spawn(shell ? quote(file) : file, shell ? args.map(quote) : args, {
    cwd: target,
    env,
    stdio: 'inherit',
    shell,
  });

  child.on('error', (err) => {
    if (err.code === 'ENOENT') {
      const hint = INSTALL_HINTS[command];
      fail(
        `'${command}' wurde weder im venv noch im PATH gefunden.`,
        ...(hint ? [hint] : [])
      );
    }
    fail(`'${command}' konnte nicht gestartet werden: ${err.message}`);
  });

  child.on('exit', (code, signal) => {
    if (signal) process.exit(128 + (osConstants.signals[signal] ?? 0));
    process.exit(code ?? 1);
  });
}

// Nur ausfuehren, wenn direkt gestartet — der Test importiert die Helfer.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
