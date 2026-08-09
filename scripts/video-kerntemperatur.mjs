#!/usr/bin/env node
/**
 * Baut den Kerntemperatur-Erklärer (TikTok, vertical) end-to-end.
 *
 *   npm run video:kerntemperatur
 *
 * Ablauf:
 *   1. Narration je Szene mit Piper (offline, kostenlos) erzeugen
 *   2. Szenenlängen aus der REAL gemessenen Audiodauer ableiten (nicht schätzen)
 *   3. timeline.json + Untertitel-SRT schreiben
 *   4. Komposition, Schriften und Audio in den Remotion-Composer spiegeln
 *   5. Rendern und das Ergebnis mit ffprobe gegenprüfen
 *
 * Voraussetzung: `npm run video:setup` ist gelaufen und eine deutsche
 * Piper-Stimme liegt unter ~/.piper/models/ (siehe docs/openmontage-integration.md).
 */

import { execFileSync, execSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync, copyFileSync, rmSync } from 'node:fs';
import { homedir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OM = path.join(ROOT, 'tools/openmontage');
const COMPOSER = path.join(OM, 'remotion-composer');
const PROJ = path.join(ROOT, 'video/kerntemperatur-tiktok');
const SRC = path.join(ROOT, 'video/remotion/steakakademie');
const FONTS = path.join(ROOT, 'video/remotion/fonts');
const OUT = path.join(PROJ, 'out');

const PIPER = path.join(OM, '.venv/bin/piper');
const VOICE = process.env.PIPER_VOICE || path.join(homedir(), '.piper/models/de-thorsten-low.onnx');

/** Vor-/Nachlauf je Szene in Sekunden. Gibt den Bildern Zeit zu stehen —
 *  das Playbook verlangt Ruhe (min. 2,5 s Szenenhaltezeit, Zahlen 4 s). */
const PADDING = {
  hook:      { lead: 0.5,  tail: 1.3 },
  problem:   { lead: 0.25, tail: 0.9 },
  zahlen:    { lead: 0.25, tail: 1.2 },
  carryover: { lead: 0.25, tail: 1.1 },
  messen:    { lead: 0.25, tail: 1.0 },
  cta:       { lead: 0.3,  tail: 2.3 },
};

const PIPER_ARGS = ['--length-scale', '1.14', '--sentence-silence', '0.35', '--noise-scale', '0.6'];

const log = (m) => console.log(`\x1b[1;33m==>\x1b[0m ${m}`);
const warn = (m) => console.log(`\x1b[1;31m[!]\x1b[0m ${m}`);

// --- Vorbedingungen ---------------------------------------------------------
if (!existsSync(PIPER)) {
  warn('OpenMontage ist nicht installiert. Erst ausführen:  npm run video:setup');
  process.exit(1);
}
if (!existsSync(VOICE)) {
  warn(`Piper-Stimme nicht gefunden: ${VOICE}`);
  warn('Deutsche Stimme holen (58 MB):');
  warn('  curl -sSL -o /tmp/v.tar.gz https://github.com/rhasspy/piper/releases/download/v0.0.2/voice-de-thorsten-low.tar.gz');
  warn('  mkdir -p ~/.piper/models && tar -xzf /tmp/v.tar.gz -C ~/.piper/models');
  process.exit(1);
}

const script = JSON.parse(readFileSync(path.join(PROJ, 'script.json'), 'utf-8'));

// --- 1 + 2. Narration erzeugen und ausmessen --------------------------------
const audioDir = path.join(PROJ, 'audio');
mkdirSync(audioDir, { recursive: true });
mkdirSync(OUT, { recursive: true });

log('Erzeuge Narration mit Piper (Avatar Marco) und messe die Längen');
let cursor = 0;
const szenen = [];

for (const sc of script.szenen) {
  const wav = path.join(audioDir, `${sc.id}.wav`);
  execFileSync(PIPER, ['-m', VOICE, '-f', wav, ...PIPER_ARGS], {
    input: sc.narration,
    encoding: 'utf-8',
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  const dauerAudio = Number(
    execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', wav],
      { encoding: 'utf-8' }).trim()
  );

  const pad = PADDING[sc.id] || { lead: 0.25, tail: 1.0 };
  const dauer = Number((pad.lead + dauerAudio + pad.tail).toFixed(3));

  szenen.push({
    id: sc.id,
    typ: sc.typ,
    untertitel: sc.untertitel,
    start: Number(cursor.toFixed(3)),
    dauer,
    audio: `steakakademie/audio/${sc.id}.wav`,
    audioDelay: pad.lead,
    visual: sc.visual,
  });

  console.log(`    ${sc.id.padEnd(11)} Sprache ${dauerAudio.toFixed(2)}s  →  Szene ${dauer.toFixed(2)}s`);
  cursor += dauer;
}

const gesamt = Number(cursor.toFixed(3));
log(`Gesamtlänge: ${gesamt.toFixed(2)}s`);

// --- 3. timeline.json + SRT -------------------------------------------------
writeFileSync(path.join(PROJ, 'timeline.json'), JSON.stringify({ szenen }, null, 2) + '\n');

const srtZeit = (s) => {
  const h = String(Math.floor(s / 3600)).padStart(2, '0');
  const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
  const sec = String(Math.floor(s % 60)).padStart(2, '0');
  const ms = String(Math.round((s % 1) * 1000)).padStart(3, '0');
  return `${h}:${m}:${sec},${ms}`;
};
const srt = szenen
  .map((s, i) => `${i + 1}\n${srtZeit(s.start)} --> ${srtZeit(s.start + s.dauer)}\n${s.untertitel}\n`)
  .join('\n');
writeFileSync(path.join(OUT, 'untertitel.srt'), srt);
log('timeline.json und untertitel.srt geschrieben');

// --- 4. In den Composer spiegeln --------------------------------------------
// Eigener Unterordner — keine Upstream-Datei wird angefasst, damit
// `npm run video:setup` (git checkout) konfliktfrei bleibt.
log('Spiegele Komposition, Schriften und Audio in den Remotion-Composer');
const dstSrc = path.join(COMPOSER, 'src/steakakademie');
const dstPub = path.join(COMPOSER, 'public/steakakademie');
rmSync(dstSrc, { recursive: true, force: true });
mkdirSync(dstSrc, { recursive: true });
mkdirSync(path.join(dstPub, 'fonts'), { recursive: true });
mkdirSync(path.join(dstPub, 'audio'), { recursive: true });

for (const f of ['brand.ts', 'Kerntemperatur.tsx', 'useBrandFonts.tsx', 'index.tsx']) {
  copyFileSync(path.join(SRC, f), path.join(dstSrc, f));
}
for (const f of ['PlayfairDisplay.woff2', 'DMSans.woff2']) {
  copyFileSync(path.join(FONTS, f), path.join(dstPub, 'fonts', f));
}

// Marco-Assets. Bestehende Bilder aus public/ — es wird nichts neu generiert.
// Kanonische Beschreibung der Figur: docs/avatare/marco.md
mkdirSync(path.join(dstPub, 'bilder'), { recursive: true });
const MARCO = [
  ['public/images/marco-back.jpg', 'marco-back.jpg'],
  ['public/images/authors/marco-richter.jpg', 'marco.jpg'],
];
for (const [von, nach] of MARCO) {
  const q = path.join(ROOT, von);
  if (!existsSync(q)) {
    warn(`Marco-Asset fehlt: ${von} — Szene rendert ohne Avatar.`);
    continue;
  }
  copyFileSync(q, path.join(dstPub, 'bilder', nach));
}
for (const s of szenen) {
  copyFileSync(path.join(audioDir, `${s.id}.wav`), path.join(dstPub, 'audio', `${s.id}.wav`));
}

// --- 5. Rendern -------------------------------------------------------------
const mp4 = path.join(OUT, 'kerntemperatur-tiktok.mp4');
const roh = path.join(OUT, '.roh.mp4');
const browser = process.env.REMOTION_BROWSER || '';
const browserFlag = browser ? ` --browser-executable ${browser}` : '';

log('Rendere (1080x1920, 30 fps, H.264)');
execSync(
  `npx remotion render src/steakakademie/index.tsx Kerntemperatur ${JSON.stringify(roh)} ` +
  `--props ${JSON.stringify(path.join(PROJ, 'timeline.json'))} --codec h264 --crf 18` +
  browserFlag,
  { cwd: COMPOSER, stdio: 'inherit' }
);

// --- 5b. Lautheit auf Social-Norm ziehen ------------------------------------
// TikTok normalisiert Uploads auf rund -14 LUFS. Piper liefert deutlich leiser;
// ohne diesen Schritt klingt das Video neben anderen Clips dünn.
// Zweistufig: erst messen, dann mit den gemessenen Werten korrigieren.
log('Normalisiere Lautheit auf -14 LUFS (zweistufige Messung)');
const ZIEL = { i: -14, tp: -1.0, lra: 11 };

// ffmpeg schreibt den loudnorm-Report nach stderr, nicht nach stdout.
const messlauf = spawnSync('ffmpeg', [
  '-nostdin', '-i', roh,
  '-af', `loudnorm=I=${ZIEL.i}:TP=${ZIEL.tp}:LRA=${ZIEL.lra}:print_format=json`,
  '-f', 'null', '-',
], { encoding: 'utf-8' });

const messung = messlauf.stderr || '';
const json = messung.slice(messung.lastIndexOf('{'), messung.lastIndexOf('}') + 1);
if (!json) {
  warn('loudnorm-Messung nicht auswertbar — ffmpeg-Ausgabe:');
  console.error(messung.slice(-800));
  process.exit(1);
}
const m = JSON.parse(json);
console.log(`    gemessen: ${m.input_i} LUFS, True Peak ${m.input_tp} dBTP`);

execFileSync('ffmpeg', [
  '-nostdin', '-y', '-i', roh,
  '-af', `loudnorm=I=${ZIEL.i}:TP=${ZIEL.tp}:LRA=${ZIEL.lra}:` +
         `measured_I=${m.input_i}:measured_TP=${m.input_tp}:` +
         `measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:` +
         `offset=${m.target_offset}:linear=true`,
  '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000',
  '-movflags', '+faststart', mp4,
], { stdio: ['pipe', 'pipe', 'pipe'] });

rmSync(roh, { force: true });

// --- 6. Gegenprüfen ---------------------------------------------------------
const probe = JSON.parse(
  execFileSync('ffprobe', ['-v', 'error', '-show_streams', '-show_format', '-of', 'json', mp4],
    { encoding: 'utf-8' })
);
const v = probe.streams.find((s) => s.codec_type === 'video');
const a = probe.streams.find((s) => s.codec_type === 'audio');

console.log('\n==============================================================');
console.log(' Fertig — Entwurf, NICHT veröffentlicht (Regel 4)');
console.log('==============================================================');
console.log(` Datei      : ${path.relative(ROOT, mp4)}`);
console.log(` Auflösung  : ${v.width}x${v.height} @ ${eval(v.r_frame_rate)} fps`);
console.log(` Dauer      : ${Number(probe.format.duration).toFixed(2)}s`);
console.log(` Ton        : ${a ? `${a.codec_name}, ${a.channels} ch, ${a.sample_rate} Hz` : 'FEHLT'}`);
console.log(` Größe      : ${(Number(probe.format.size) / 1024 / 1024).toFixed(1)} MB`);
console.log(` Untertitel : ${path.relative(ROOT, path.join(OUT, 'untertitel.srt'))}`);
console.log('\n Vor Veröffentlichung: Uwe gibt frei.');
console.log('==============================================================');

if (!a) {
  warn('Kein Audiostream im Ergebnis — Render prüfen.');
  process.exit(1);
}
