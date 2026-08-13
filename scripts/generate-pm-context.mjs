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
import dns from 'node:dns/promises';
import { createRequire } from 'node:module';
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

  // ── SEO & Traffic ─────────────────────────────────────────────────────

  // Nur INDEXIERBARE Seiten. Admin-, Auth- und Profilseiten sind in robots.txt
  // gesperrt bzw. in next-sitemap.config.js ausgeschlossen — dass sie keine
  // Metadata haben, ist konsequent und kein Mangel (Regel 5).
  'indexierbare-seiten-mit-metadata': () => {
    const seiten = seitenRouten();
    const aus = ausgeschlossenePfade();
    const indexierbar = seiten.filter((s) => !aus.some((pre) => s.route === pre || s.route.startsWith(pre + '/')));
    if (!indexierbar.length) return unklar('keine indexierbaren Seiten ermittelt');
    const ohne = indexierbar.filter((s) => !/export const metadata|generateMetadata/.test(readFileSync(s.datei, 'utf8')));
    return ohne.length
      ? nein(`${ohne.length} von ${indexierbar.length} ohne Metadata: ${ohne.slice(0, 6).map((s) => s.route).join(', ')}`)
      : ok(`alle ${indexierbar.length} indexierbaren Seiten haben Metadata (${seiten.length - indexierbar.length} bewusst ausgeschlossen)`);
  },

  'jedes-rezept-in-sitemap': async () => {
    if (OFFLINE) return unklar('--offline: Sitemap nicht abgerufen');
    const slugs = readdirSync(p('content/rezepte'))
      .filter((f) => f.endsWith('.mdx'))
      .map((f) => f.replace(/\.mdx$/, ''));
    if (!slugs.length) return unklar('keine Rezept-MDX gefunden');
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), 20000);
    let xml;
    try {
      const r = await fetch(`https://${DOMAIN}/sitemap-0.xml`, { signal: ctl.signal });
      xml = await r.text();
    } catch {
      return unklar('Sitemap nicht abrufbar');
    } finally {
      clearTimeout(t);
    }
    // Rezept-URLs sind nach Kategorie verschachtelt (/rezepte/beilagen/<slug>),
    // der Slug ist also das LETZTE Pfadsegment — nicht direkt nach /rezepte/.
    const fehlend = slugs.filter((s) => !xml.includes(`/${s}</loc>`));
    return fehlend.length
      ? nein(`${fehlend.length} von ${slugs.length} Rezepten fehlen: ${fehlend.slice(0, 5).join(', ')}`)
      : ok(`alle ${slugs.length} Rezepte in der Sitemap`);
  },

  'robots-verweist-auf-sitemap': () => {
    if (!existsSync(p('public/robots.txt'))) return nein('public/robots.txt fehlt');
    const txt = lies('public/robots.txt');
    const m = txt.match(/^Sitemap:\s*(\S+)/mi);
    return m ? ok(m[1]) : nein('robots.txt nennt keine Sitemap');
  },

  'gsc-verifiziert': async () => {
    if (OFFLINE) return unklar('--offline: Netz-Prüfung übersprungen');
    const txt = await dnsRecords('TXT');
    if (txt === null) return unklar('TXT-Auflösung fehlgeschlagen');
    const rec = txtFlach(txt).find((t) => t.startsWith('google-site-verification='));
    return rec
      ? ok('Search-Console-Verifikation als DNS-TXT vorhanden')
      : nein('keine google-site-verification im DNS');
  },

  // GEO-Strategie (CLAUDE.md): Answer-Engine-Crawler sind ausdrücklich erwünscht.
  'ki-crawler-ausdruecklich-erlaubt': (k) => {
    if (!existsSync(p('public/robots.txt'))) return nein('public/robots.txt fehlt');
    const txt = lies('public/robots.txt');
    const fehlend = k.crawler.filter((c) => !new RegExp(`User-agent:\\s*${c}\\b`, 'i').test(txt));
    return fehlend.length
      ? nein(`${fehlend.length} von ${k.crawler.length} nicht genannt: ${fehlend.join(', ')}`)
      : ok(`alle ${k.crawler.length} Answer-Engine-Crawler ausdrücklich adressiert`);
  },

  'datei-enthaelt': (k) => {
    if (!existsSync(p(k.datei))) return nein(`${k.datei} fehlt`);
    const txt = lies(k.datei);
    const fehlend = k.enthaelt.filter((m) => !txt.includes(m));
    return fehlend.length
      ? nein(`${k.datei} enthält nicht: ${fehlend.join(', ')}`)
      : ok(`${k.datei} enthält ${k.enthaelt.join(', ')}`);
  },

  // Ehrlich negativ statt nicht_messbar: dass keine Quelle angebunden ist,
  // lässt sich einwandfrei feststellen — es ist ein Befund, kein Messfehler.
  'traffic-datenquelle-angebunden': (k) => {
    const treffer = quelldateien().filter((f) => {
      const txt = readFileSync(f, 'utf8');
      return k.marker.some((m) => txt.includes(m));
    });
    return treffer.length
      ? ok(`serverseitige Traffic-Quelle angebunden (${treffer.length} Stelle(n))`)
      : nein(
          'keine serverseitige Traffic-Quelle: weder Search-Console- noch GA4- oder ' +
          'Plausible-API. Traffic ist damit für den Generator unmessbar.',
        );
  },

  // ── Kurse & Diplom-System ─────────────────────────────────────────────

  'lektionsraster-vollstaendig': () => {
    const st = lektionen();
    const stufen = [...new Set(st.map((l) => l.stufe))].sort();
    if (!stufen.length) return unklar('keine Lektionen gefunden');
    const zahl = stufen.map((s) => st.filter((l) => l.stufe === s).length);
    const gleich = zahl.every((n) => n === zahl[0]);
    return gleich
      ? ok(`${stufen.length} Stufen à ${zahl[0]} Lektionen (${st.length} gesamt), lückenlos`)
      : nein(`ungleiche Stufen: ${stufen.map((s, i) => `${s}=${zahl[i]}`).join(', ')}`);
  },

  'lektions-order-eindeutig': () => {
    const st = lektionen();
    const kollision = [];
    for (const s of [...new Set(st.map((l) => l.stufe))]) {
      const o = st.filter((l) => l.stufe === s).map((l) => l.order);
      const dup = [...new Set(o.filter((v, i) => o.indexOf(v) !== i))];
      if (dup.length) kollision.push(`Stufe ${s}: order ${dup.join('/')}`);
    }
    return kollision.length
      ? nein(kollision.join(' · '))
      : ok(`keine doppelte order in ${st.length} Lektionen`);
  },

  'lektionslugs-eindeutig': () => {
    const sl = lektionen().map((l) => l.lektionSlug);
    const dup = [...new Set(sl.filter((v, i) => sl.indexOf(v) !== i))];
    return dup.length
      ? nein(`doppelte lektionSlugs: ${dup.join(', ')}`)
      : ok(`alle ${sl.length} lektionSlugs eindeutig`);
  },

  'lektions-pflichtfelder': (k) => {
    const st = lektionen();
    const luecken = [];
    for (const feld of k.felder) {
      const ohne = st.filter((l) => !l[feld]);
      if (ohne.length) luecken.push(`${feld}: ${ohne.length}`);
    }
    return luecken.length
      ? nein(`fehlende Felder — ${luecken.join(', ')}`)
      : ok(`alle ${k.felder.length} Pflichtfelder in allen ${st.length} Lektionen gesetzt`);
  },

  'medaillenbilder-vorhanden': () => {
    const src = lies('src/components/diplome/Medal.tsx');
    const pfade = [...src.matchAll(/'(\/images\/diplome\/[^']+)'/g)].map((m) => m[1]);
    if (!pfade.length) return unklar('keine Medaillenpfade in Medal.tsx gefunden');
    const fehlend = [...new Set(pfade)].filter((f) => !existsSync(p('public' + f)));
    return fehlend.length
      ? nein(`${fehlend.length} fehlen: ${fehlend.join(', ')}`)
      : ok(`alle ${new Set(pfade).size} Medaillenbilder vorhanden`);
  },

  // Gleiche Logik wie bei den Modell-IDs: verstreute Definitionen driften.
  'stufen-zentral-definiert': (k) => {
    if (existsSync(p(k.zentraleDatei))) return ok(`zentrale Definition in ${k.zentraleDatei}`);
    const doppelt = k.verdaechtige.filter((f) => existsSync(p(f)) && new RegExp(k.muster).test(lies(f)));
    return doppelt.length > 1
      ? nein(`keine zentrale Datei; ${doppelt.length} Stellen definieren Stufen: ${doppelt.join(', ')}`)
      : ok(`nur eine Definitionsstelle`);
  },

  // ── KI-System & Automation ────────────────────────────────────────────

  // Nicht dasselbe wie "Modell-IDs gepinnt" (Tech-Stack): dort geht es um die
  // Version, hier um den Ort. 18 Literale an 18 Stellen sind der Grund, warum
  // sechs Schreibweisen auseinanderdriften konnten.
  'zentrale-modell-definition': (k) => {
    const literale = quelldateien().filter((f) =>
      /['"]claude-[a-z0-9.-]+['"]/.test(readFileSync(f, 'utf8')),
    );
    const zentral = existsSync(p(k.zentraleDatei));
    if (zentral && literale.length <= 1) {
      return ok(`Modell-IDs zentral in ${k.zentraleDatei}`);
    }
    const rel = literale.map((f) => f.replace(ROOT + '\\', '').replace(ROOT + '/', '').replace(/\\/g, '/'));
    return nein(
      `${literale.length} Dateien mit Modell-Literal, keine zentrale Definition` +
      ` (${rel.slice(0, 4).join(', ')}${rel.length > 4 ? ` … +${rel.length - 4}` : ''})`,
    );
  },

  'jeder-workflow-hat-trigger': () => {
    const ws = workflows();
    const ohne = ws.filter((w) => !w.trigger.length);
    return ohne.length
      ? nein(`${ohne.length} ohne Trigger: ${ohne.map((w) => w.datei).join(', ')}`)
      : ok(`alle ${ws.length} Workflows haben mindestens einen Trigger`);
  },

  // Nur geplante Workflows: dispatch-only-Werkzeuge (LoRA-Training,
  // Bildgenerierung) sollen selten laufen — deren Stille ist kein Mangel.
  'geplante-workflows-laufen': () => {
    if (OFFLINE) return unklar('--offline: GitHub-API nicht abgefragt');
    const l = workflowLaeufe();
    if (!l) return unklar('GitHub-API nicht erreichbar');
    const geplant = workflows().filter((w) => w.trigger.includes('schedule'));
    if (!geplant.length) return unklar('kein Workflow mit schedule');
    const still = geplant.filter((w) => !l.has(w.name));
    return still.length
      ? nein(`${still.length} von ${geplant.length} geplanten ohne Lauf: ${still.map((w) => w.name).join(', ')}`)
      : ok(`alle ${geplant.length} geplanten Workflows sind gelaufen`);
  },

  // Regel 8c: Temperaturen/Cuts/Reifung NIE raten — kanonische Referenz
  // data/kerntemperatur-referenz.yaml.
  'generatoren-lesen-faktenreferenz': (k) => {
    const fehlend = k.generatoren.filter((g) => {
      if (!existsSync(p(g))) return true;
      return !readFileSync(p(g), 'utf8').includes(k.referenz);
    });
    return fehlend.length
      ? nein(`${fehlend.length} von ${k.generatoren.length} lesen ${k.referenz} nicht: ${fehlend.join(', ')}`)
      : ok(`alle ${k.generatoren.length} Generatoren lesen die kanonische Referenz`);
  },

  // Regel 4: Agenten produzieren Entwürfe, Uwe gibt frei.
  'generatoren-pushen-nicht-direkt': () => {
    const dir = p('.github/workflows');
    const dateien = readdirSync(dir).filter((f) => /\.ya?ml$/.test(f));
    const direkt = dateien.filter((f) => {
      const src = readFileSync(join(dir, f), 'utf8');
      const pusht = /^\s*git push\s*$/m.test(src) || /\bgit push\b/.test(src);
      const perPr = /create-pull-request|gh pr create/.test(src);
      return pusht && !perPr;
    });
    return direkt.length
      ? nein(`${direkt.length} Workflows pushen direkt statt per PR: ${direkt.join(', ')}`)
      : ok(`kein Workflow pusht ohne Pull Request`);
  },

  'moderation-fuer-einreichungen': () => {
    const f = 'src/app/api/rezept-einreichen/route.ts';
    if (!existsSync(p(f))) return unklar(`${f} fehlt`);
    const src = lies(f);
    const hatGate = /needs_review|rejected/.test(src) && /moderation/i.test(src);
    return hatGate
      ? ok('Einreichungen durchlaufen ein Moderations-Gate (approved/needs_review/rejected)')
      : nein('kein Moderations-Gate erkennbar');
  },

  'embedding-modell-konfigurierbar': () => {
    const treffer = quelldateien().filter((f) => /process\.env\.VOYAGE_MODEL/.test(readFileSync(f, 'utf8')));
    return treffer.length
      ? ok(`über VOYAGE_MODEL konfigurierbar (${treffer.length} Stelle(n))`)
      : nein('Embedding-Modell ist fest verdrahtet');
  },

  'ki-routen-mit-fehlerbehandlung': () => {
    const dir = p('src/app/api');
    const routen = [];
    const gehe = (d) => {
      for (const e of readdirSync(d, { withFileTypes: true })) {
        const voll = join(d, e.name);
        if (e.isDirectory()) gehe(voll);
        else if (e.name === 'route.ts') routen.push(voll);
      }
    };
    gehe(dir);
    const kiRouten = routen.filter((f) => /['"]claude-/.test(readFileSync(f, 'utf8')));
    if (!kiRouten.length) return unklar('keine KI-Routen gefunden');
    const ohne = kiRouten.filter((f) => !/\bcatch\b/.test(readFileSync(f, 'utf8')));
    const kurz = (f) => f.split(/[\\/]api[\\/]/)[1]?.replace(/\\/g, '/');
    return ohne.length
      ? nein(`${ohne.length} von ${kiRouten.length} ohne catch: ${ohne.map(kurz).join(', ')}`)
      : ok(`alle ${kiRouten.length} KI-Routen fangen Fehler ab`);
  },

  // ── Monetarisierung ───────────────────────────────────────────────────
  // Vorsicht bei den Kriterien hier: zwei naheliegende Prüfungen wären falsch.
  // (1) "Alle Amazon-Links sind /dp/-Deeplinks" — Such-URLs sind bei
  //     US-Eigenvertrieb eine bewusste Entscheidung gegen tote Deeplinks
  //     (memory.md, 25.06.2026).
  // (2) "Der Digistore-Webhook prüft eine sha_sign-Signatur" — der genutzte
  //     IPN-Typ unterstützt das nicht; Token-in-URL ist dokumentiert gewollt.

  'amazon-links-mit-partner-tag': (k) => {
    const ps = produkte();
    const amazon = ps.filter((x) => /amazon\./i.test(x.affiliateUrl || ''));
    if (!amazon.length) return unklar('keine Amazon-Links in der Registry');
    const ohne = amazon.filter((x) => !new RegExp(`[?&]tag=${k.tag}(&|$)`).test(x.affiliateUrl));
    return ohne.length
      ? nein(`${ohne.length} von ${amazon.length} ohne tag=${k.tag}: ${ohne.map((x) => x.id).join(', ')}`)
      : ok(`alle ${amazon.length} Amazon-Links tragen tag=${k.tag}`);
  },

  'keine-platzhalter-links': () => {
    const ps = produkte();
    const platz = ps.filter((x) =>
      /PLATZHALTER|EXAMPLE\.|TODO|DEIN[-_ ]|xxxx/i.test(x.affiliateUrl || ''),
    );
    return platz.length
      ? nein(`${platz.length} Platzhalter: ${platz.map((x) => x.id).join(', ')}`)
      : ok(`kein Platzhalter unter ${ps.length} Produkten`);
  },

  // Ein Link ohne Tracking-Parameter verdient bei Klick nichts.
  'jeder-produktlink-mit-tracking': () => {
    const ps = produkte().filter((x) => x.affiliateUrl);
    if (!ps.length) return unklar('keine Produkte mit affiliateUrl');
    const ohne = ps.filter((x) => !/[?&](tag|ref|aff|partner|utm_source|a_aid|campaign)=/i.test(x.affiliateUrl));
    return ohne.length
      ? nein(`${ohne.length} von ${ps.length} Links ohne Tracking-Parameter: ${ohne.map((x) => x.id).join(', ')}`)
      : ok(`alle ${ps.length} Produktlinks tragen einen Tracking-Parameter`);
  },

  // affiliate-programs.yaml erklärt selbst: "Produkte verweisen über ihr
  // provider-Feld auf das passende Programm". Das wird hier durchgesetzt.
  'provider-in-programmregistry': () => {
    const bekannt = new Set();
    for (const prog of programme()) for (const pr of prog.providers || []) bekannt.add(pr);
    const ps = produkte();
    const unbekannt = [...new Set(ps.map((x) => x.provider).filter((v) => v && !bekannt.has(v)))];
    return unbekannt.length
      ? nein(`${unbekannt.length} provider ohne Programmeintrag: ${unbekannt.join(', ')}`)
      : ok(`alle provider-Werte sind Programmen zugeordnet`);
  },

  'mindestens-ein-programm-aktiv': () => {
    const ps = programme();
    const aktiv = ps.filter((x) => x.status === 'active');
    return aktiv.length
      ? ok(`${aktiv.length} von ${ps.length} aktiv: ${aktiv.map((x) => x.id).join(', ')}`)
      : nein(`kein Programm auf status: active (${ps.length} gelistet)`);
  },

  'produktdaten-aktuell': (k) => {
    const ps = produkte().filter((x) => x.lastChecked);
    if (!ps.length) return unklar('kein Produkt hat ein lastChecked-Datum');
    const jetzt = Date.now();
    const alter = (d) => Math.round((jetzt - new Date(d).getTime()) / 86400000);
    const alt = ps.filter((x) => alter(x.lastChecked) > k.maxTage);
    const aeltester = Math.max(...ps.map((x) => alter(x.lastChecked)));
    return alt.length
      ? nein(`${alt.length} von ${ps.length} älter als ${k.maxTage} Tage (ältester: ${aeltester} Tage)`)
      : ok(`ältester Eintrag ${aeltester} Tage alt, Grenze ${k.maxTage}`);
  },

  'alle-produkte-mit-pruefdatum': () => {
    const ps = produkte();
    const ohne = ps.filter((x) => !x.lastChecked);
    return ohne.length
      ? nein(`${ohne.length} von ${ps.length} ohne lastChecked: ${ohne.map((x) => x.id).join(', ')}`)
      : ok(`alle ${ps.length} Produkte haben ein lastChecked-Datum`);
  },

  // Regel 1 (Werbekennzeichnung) ist im Projekt nicht verhandelbar.
  'werbekennzeichnung-in-komponenten': () => {
    const dir = p('src/components/affiliate');
    if (!existsSync(dir)) return unklar('src/components/affiliate fehlt');
    const dateien = readdirSync(dir).filter((f) => f.endsWith('.tsx'));
    if (!dateien.length) return unklar('keine Komponenten gefunden');
    const muster = /werbung|anzeige|affiliate-link|provision|partnerlink/i;
    const ohne = dateien.filter((f) => !muster.test(readFileSync(join(dir, f), 'utf8')));
    return ohne.length
      ? nein(`${ohne.length} von ${dateien.length} ohne Kennzeichnung: ${ohne.join(', ')}`)
      : ok(`alle ${dateien.length} Affiliate-Komponenten kennzeichnen Werbung`);
  },

  'webhook-weist-ohne-token-ab': () => {
    const f = 'src/app/api/webhooks/digistore24/route.ts';
    if (!existsSync(p(f))) return nein(`${f} fehlt`);
    const src = lies(f);
    const prueft = /DIGISTORE_WEBHOOK_TOKEN/.test(src);
    const lehntAb = /\b401\b/.test(src);
    return prueft && lehntAb
      ? ok('Token wird geprüft, sonst 401')
      : nein(`Token-Prüfung ${prueft ? 'vorhanden' : 'fehlt'}, 401-Antwort ${lehntAb ? 'vorhanden' : 'fehlt'}`);
  },

  'workflow-zuletzt-gruen': (k) => {
    if (OFFLINE) return unklar('--offline: GitHub-API nicht abgefragt');
    const l = workflowLaeufe();
    if (!l) return unklar('GitHub-API nicht erreichbar');
    const treffer = [...l.entries()].find(([n]) => n.toLowerCase().includes(k.workflow.toLowerCase()));
    if (!treffer) return unklar(`kein Lauf für Workflow "${k.workflow}" gefunden`);
    return treffer[1] === 'success'
      ? ok(`"${treffer[0]}" zuletzt success`)
      : nein(`"${treffer[0]}" zuletzt ${treffer[1]}`);
  },

  // ── Technische Infrastruktur ──────────────────────────────────────────
  // Fast alles hier ist nur von außen prüfbar. Ohne Netz bleibt der Bereich
  // bewusst weitgehend nicht_messbar, statt einen Repo-Zustand als
  // Betriebszustand auszugeben.

  'live-erreichbar': async () => {
    if (OFFLINE) return unklar('--offline: Netz-Prüfung übersprungen');
    const a = await liveAntwort();
    if (!a) return unklar(`https://${DOMAIN} nicht erreichbar (Netzfehler oder Timeout)`);
    return a.status === 200
      ? ok(`HTTP ${a.status}`)
      : nein(`HTTP ${a.status}`);
  },

  'header-gesetzt': async (k) => {
    if (OFFLINE) return unklar('--offline: Netz-Prüfung übersprungen');
    const a = await liveAntwort();
    if (!a) return unklar('Live-Antwort nicht verfügbar');
    const fehlend = k.header.filter((h) => !a.header(h));
    return fehlend.length
      ? nein(`nicht gesetzt: ${fehlend.join(', ')}`)
      : ok(k.header.map((h) => `${h}: ${a.header(h)}`).join(' · '));
  },

  'dns-cloudflare': async () => {
    if (OFFLINE) return unklar('--offline: Netz-Prüfung übersprungen');
    const ns = await dnsRecords('NS');
    if (ns === null) return unklar('NS-Auflösung fehlgeschlagen');
    const cf = ns.filter((n) => /\.ns\.cloudflare\.com$/i.test(n));
    return cf.length
      ? ok(`${cf.length} Cloudflare-Nameserver: ${cf.join(', ')}`)
      : nein(`Nameserver nicht bei Cloudflare: ${ns.join(', ') || 'keine'}`);
  },

  'mail-empfang': async () => {
    if (OFFLINE) return unklar('--offline: Netz-Prüfung übersprungen');
    const mx = await dnsRecords('MX');
    if (mx === null) return unklar('MX-Auflösung fehlgeschlagen');
    return mx.length
      ? ok(`${mx.length} MX-Einträge: ${mx.map((m) => m.exchange).join(', ')}`)
      : nein('keine MX-Einträge — die Domain empfängt keine Mail');
  },

  'spf-vorhanden': async () => {
    if (OFFLINE) return unklar('--offline: Netz-Prüfung übersprungen');
    const txt = await dnsRecords('TXT');
    if (txt === null) return unklar('TXT-Auflösung fehlgeschlagen');
    const spf = txtFlach(txt).find((t) => t.startsWith('v=spf1'));
    return spf ? ok(spf) : nein('kein SPF-Record');
  },

  // p=none protokolliert nur. Erst quarantine/reject weisen Fälschungen ab.
  'dmarc-erzwingend': async () => {
    if (OFFLINE) return unklar('--offline: Netz-Prüfung übersprungen');
    const txt = await dnsRecords('TXT', `_dmarc.${DOMAIN}`);
    if (txt === null) return unklar('DMARC-Auflösung fehlgeschlagen');
    const rec = txtFlach(txt).find((t) => t.toLowerCase().startsWith('v=dmarc1'));
    if (!rec) return nein('kein DMARC-Record');
    const politik = (rec.match(/\bp\s*=\s*(none|quarantine|reject)\b/i) || [])[1]?.toLowerCase();
    return politik && politik !== 'none'
      ? ok(`p=${politik}`)
      : nein(`p=${politik ?? 'unbekannt'} — protokolliert nur, weist nichts ab`);
  },

  'pfad-live-erreichbar': async (k) => {
    if (OFFLINE) return unklar('--offline: Netz-Prüfung übersprungen');
    const ergebnisse = [];
    for (const pfad of k.pfade) {
      const ctl = new AbortController();
      const t = setTimeout(() => ctl.abort(), 15000);
      try {
        const r = await fetch(`https://${DOMAIN}${pfad}`, { method: 'HEAD', signal: ctl.signal });
        ergebnisse.push({ pfad, status: r.status });
      } catch {
        ergebnisse.push({ pfad, status: null });
      } finally {
        clearTimeout(t);
      }
    }
    if (ergebnisse.some((e) => e.status === null)) return unklar('mindestens ein Abruf schlug fehl');
    const schlecht = ergebnisse.filter((e) => e.status !== 200);
    return schlecht.length
      ? nein(schlecht.map((e) => `${e.pfad} → ${e.status}`).join(', '))
      : ok(ergebnisse.map((e) => `${e.pfad} → 200`).join(', '));
  },

  'workflows-ohne-fehlschlag': () => {
    if (OFFLINE) return unklar('--offline: GitHub-API nicht abgefragt');
    const l = workflowLaeufe();
    if (!l) return unklar('GitHub-API nicht erreichbar (gh nicht angemeldet?)');
    if (!l.size) return unklar('keine Workflow-Läufe gefunden');
    const rot = [...l.entries()].filter(([, c]) => c === 'failure').map(([n]) => n);
    return rot.length
      ? nein(`${rot.length} von ${l.size} zuletzt fehlgeschlagen: ${rot.join(', ')}`)
      : ok(`alle ${l.size} Workflows zuletzt ohne Fehlschlag`);
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

/** Alle Seiten-Routen aus src/app, mit ihrem URL-Pfad. */
let _seiten;
function seitenRouten() {
  if (_seiten) return _seiten;
  const base = p('src/app');
  const treffer = [];
  const gehe = (dir) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const voll = join(dir, e.name);
      if (e.isDirectory()) gehe(voll);
      else if (e.name === 'page.tsx') {
        const rel = voll.slice(base.length).replace(/\\/g, '/').replace(/\/page\.tsx$/, '');
        // Routengruppen (gruppe) zählen nicht zum URL-Pfad
        treffer.push({ datei: voll, route: rel.replace(/\/\([^/]+\)/g, '') || '/' });
      }
    }
  };
  gehe(base);
  _seiten = treffer;
  return _seiten;
}

/**
 * Pfade, die bewusst nicht indexiert werden — aus robots.txt (Disallow) und
 * next-sitemap.config.js (exclude). Beide Listen sind erklaerte Absicht, also
 * darf ihr Fehlen von Metadata kein Mangel sein.
 */
let _aus;
function ausgeschlossenePfade() {
  if (_aus) return _aus;
  const raus = new Set();
  if (existsSync(p('public/robots.txt'))) {
    for (const m of lies('public/robots.txt').matchAll(/^Disallow:\s*(\S+)/gim)) {
      raus.add(m[1].replace(/\/$/, ''));
    }
  }
  try {
    const req = createRequire(import.meta.url);
    const cfg = req(p('next-sitemap.config.js'));
    for (const e of cfg.exclude || []) raus.add(e.replace(/\/\*$/, '').replace(/\/$/, ''));
  } catch {
    // Kein Abbruch: die robots.txt-Liste allein ist bereits eine gueltige Basis.
  }
  raus.delete('');
  _aus = [...raus];
  return _aus;
}

/** Alle Diplom-Lektionen mit ihrem Frontmatter. */
let _lektionen;
function lektionen() {
  if (_lektionen) return _lektionen;
  const root = p('content/diplom-lektionen');
  if (!existsSync(root)) abbruch('content/diplom-lektionen fehlt.');
  _lektionen = [];
  for (const stufeDir of readdirSync(root)) {
    const voll = join(root, stufeDir);
    for (const datei of readdirSync(voll).filter((f) => f.endsWith('.mdx'))) {
      const txt = readFileSync(join(voll, datei), 'utf8');
      const m = txt.match(/^---\r?\n([\s\S]*?)\r?\n---/);
      if (!m) continue;
      const fm = {};
      for (const zeile of m[1].split(/\r?\n/)) {
        const kv = zeile.match(/^([a-zA-Z]+):\s*(.*)$/);
        if (kv) fm[kv[1]] = kv[2].replace(/^"|"$/g, '').trim();
      }
      _lektionen.push({ ...fm, stufe: Number(fm.stufe), order: Number(fm.order), datei });
    }
  }
  if (!_lektionen.length) abbruch('keine Diplom-Lektionen gefunden.');
  return _lektionen;
}

/**
 * Alle Workflows mit ihrem echten Namen und ihren Triggern.
 * `on` wird von YAML 1.1 als Boolean true geparst — daher der Fallback.
 */
let _workflows;
function workflows() {
  if (_workflows) return _workflows;
  const dir = p('.github/workflows');
  if (!existsSync(dir)) abbruch('.github/workflows fehlt.');
  _workflows = readdirSync(dir)
    .filter((f) => /\.ya?ml$/.test(f))
    .map((f) => {
      const d = yaml.load(readFileSync(join(dir, f), 'utf8')) || {};
      const on = d.on ?? d[true];
      const trigger =
        on == null ? [] : typeof on === 'string' ? [on] : Array.isArray(on) ? on : Object.keys(on);
      return { datei: f, name: d.name || f, trigger };
    });
  return _workflows;
}

/** Produkt- und Programmregistry, je einmal geladen. */
let _produkte, _programme;
function produkte() {
  if (_produkte) return _produkte;
  _produkte = yaml.load(lies('products/registry.yaml'));
  if (!Array.isArray(_produkte)) abbruch('products/registry.yaml ist keine Liste.');
  return _produkte;
}
function programme() {
  if (_programme) return _programme;
  _programme = yaml.load(lies('products/affiliate-programs.yaml'));
  if (!Array.isArray(_programme)) abbruch('products/affiliate-programs.yaml ist keine Liste.');
  return _programme;
}

/** Domain, gegen die alle Netz-Prüfungen laufen. */
const DOMAIN = 'steakakademie.de';

/**
 * Antwort der Live-Seite, einmal geholt und geteilt. `null` bedeutet
 * "nicht erreichbar" — jede darauf gestützte Prüfung wird nicht_messbar.
 */
let _live;
async function liveAntwort() {
  if (_live !== undefined) return _live;
  if (OFFLINE) return (_live = null);
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), 15000);
  try {
    const r = await fetch(`https://${DOMAIN}`, { method: 'HEAD', signal: ctl.signal });
    _live = { status: r.status, header: (n) => r.headers.get(n) };
  } catch {
    _live = null;
  } finally {
    clearTimeout(t);
  }
  return _live;
}

/** DNS-Records eines Typs. `null` = Auflösung fehlgeschlagen (≠ leer). */
async function dnsRecords(typ, name = DOMAIN) {
  if (OFFLINE) return null;
  try {
    return await dns.resolve(name, typ);
  } catch (e) {
    // NODATA/NOTFOUND heißt "es gibt keinen solchen Record" — das ist ein
    // Ergebnis. Alles andere (Timeout, kein Netz) ist ein Fehlschlag.
    if (e.code === 'ENODATA' || e.code === 'ENOTFOUND') return [];
    return null;
  }
}

/** Flacht TXT-Records ab (jeder Record ist ein Array von Chunks). */
const txtFlach = (recs) => (recs || []).map((r) => (Array.isArray(r) ? r.join('') : String(r)));

/** Letzter Lauf je Workflow über die GitHub-CLI. */
let _laeufe;
function workflowLaeufe() {
  if (_laeufe !== undefined) return _laeufe;
  if (OFFLINE) return (_laeufe = null);
  try {
    const aus = shell('gh run list --limit 100 --json name,conclusion,createdAt');
    const alle = JSON.parse(aus);
    const letzter = new Map();
    for (const l of alle) if (!letzter.has(l.name)) letzter.set(l.name, l.conclusion);
    _laeufe = letzter;
  } catch {
    _laeufe = null;
  }
  return _laeufe;
}

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
