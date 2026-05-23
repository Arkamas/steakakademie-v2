'use strict';
/**
 * Steakakademie QA Manager
 *
 * Scannt alle Routen der Website mit einem echten Chromium-Browser:
 *   • HTTP-Status-Check (200 / 404 / 500)
 *   • Browser-Konsole: Hydration Errors, JS-Fehler, fehlende Assets
 *   • Netzwerk: 404-Bilder (.webp / .jpg / .png)
 *   • Layout-Check: Header sichtbar, keine kritischen Überlappungen
 *   • Ausgabe: Terminal (farbig) + qa-report.log + qa-report.json
 *
 * Voraussetzung:
 *   npm install -D playwright
 *   npx playwright install chromium
 *
 * Verwendung:
 *   npm run qa-scan              (startet eigenen Dev-Server falls keiner läuft)
 *   QA_PORT=3000 npm run qa-scan (gegen laufenden Server)
 */

const { chromium } = (() => {
  try {
    return require('playwright');
  } catch {
    console.error('\x1b[31m✗ Playwright nicht installiert.\x1b[0m');
    console.error('  → npm install -D playwright');
    console.error('  → npx playwright install chromium');
    process.exit(1);
  }
})();

const { spawn }    = require('child_process');
const { promises: fs } = require('fs');
const path         = require('path');
const net          = require('net');
const http         = require('http');

// ─── CONFIG ───────────────────────────────────────────────────────────────────

const ROOT          = path.join(__dirname, '..');
const CONTENT_DIR   = path.join(ROOT, 'content');
const SCREENSHOTS   = path.join(ROOT, 'qa-screenshots');
const REPORT_LOG    = path.join(ROOT, 'qa-report.log');
const REPORT_JSON   = path.join(ROOT, 'qa-report.json');
const QA_PORT       = parseInt(process.env.QA_PORT || '3737', 10);
const BASE_URL      = `http://localhost:${QA_PORT}`;
const TIMEOUT_MS    = 15_000;
const VIEWPORT      = { width: 1280, height: 800 };

// Selektoren für visuelle Checks
const SELECTORS = {
  header:        'header',
  nav:           'header nav, nav[aria-label]',
  footer:        'footer',
  emailPopup:    '[data-exit-intent], .exit-intent, [class*="ExitIntent"]',
  emailBanner:   '[class*="newsletter"], [class*="Newsletter"], [class*="email-banner"]',
};

// Konsolen-Kategorisierung
const ERROR_PATTERNS = [
  { re: /hydration|did not match|server.*client|Minified React error/i,   category: 'HYDRATION',     severity: 'CRITICAL' },
  { re: /Failed to load resource|net::ERR_/i,                             category: 'MISSING_ASSET', severity: 'ERROR'    },
  { re: /Unhandled.*rejection|TypeError|ReferenceError|SyntaxError/i,     category: 'JS_ERROR',      severity: 'ERROR'    },
  { re: /Warning: Each child.*key|Warning: Cannot update/i,               category: 'REACT_WARN',    severity: 'WARN'     },
  { re: /404/,                                                             category: 'NOT_FOUND',     severity: 'WARN'     },
];

// ─── COLOUR HELPERS ───────────────────────────────────────────────────────────

const c = {
  red:    s => `\x1b[31m${s}\x1b[0m`,
  yellow: s => `\x1b[33m${s}\x1b[0m`,
  green:  s => `\x1b[32m${s}\x1b[0m`,
  bold:   s => `\x1b[1m${s}\x1b[0m`,
  dim:    s => `\x1b[2m${s}\x1b[0m`,
  cyan:   s => `\x1b[36m${s}\x1b[0m`,
};

// ─── ROUTE DISCOVERY ──────────────────────────────────────────────────────────

async function readContentSlugs(subdir) {
  try {
    const files = await fs.readdir(path.join(CONTENT_DIR, subdir));
    return files
      .filter(f => f.endsWith('.mdx') || f.endsWith('.md'))
      .map(f => path.basename(f, path.extname(f)));
  } catch { return []; }
}

async function discoverRoutes() {
  const routes = new Set();

  // Statische Routen aus src/app (alle page.tsx ohne dynamische Segmente)
  const staticMap = [
    '/', '/diplome', '/diplome/simulation', '/diplome/urkunde',
    '/cuts', '/methoden', '/vergleich', '/glossar',
    '/wissen', '/wissen/kerntemperaturen', '/wissen/lexikon',
    '/terroir', '/aging', '/manifest', '/rettung',
    '/persoenlichkeiten', '/autoren',
    '/ueber-uns', '/impressum', '/datenschutz',
    '/affiliate-disclosure', '/agb', '/kontakt',
  ];
  for (const r of staticMap) routes.add(r);

  // Dynamische Routen aus Content-Ordnern
  const contentRoutes = [
    ['cuts',             '/cuts/'],
    ['methoden',         '/methoden/'],
    ['vergleich',        '/vergleich/'],
    ['persoenlichkeiten','/persoenlichkeiten/'],
  ];
  for (const [dir, prefix] of contentRoutes) {
    for (const slug of await readContentSlugs(dir)) {
      routes.add(`${prefix}${slug}`);
    }
  }

  // Glossar-Einträge aus terms.json
  try {
    const terms = JSON.parse(
      await fs.readFile(path.join(CONTENT_DIR, 'glossar', 'terms.json'), 'utf-8')
    );
    for (const { slug } of terms.slice(0, 10)) { // max 10 für schnellen Scan
      routes.add(`/glossar/${slug}`);
    }
  } catch { /* noch keine terms.json */ }

  return [...routes].sort();
}

// ─── SERVER MANAGEMENT ────────────────────────────────────────────────────────

function isPortOpen(port) {
  return new Promise(resolve => {
    const s = new net.Socket();
    s.setTimeout(800);
    s.on('connect', () => { s.destroy(); resolve(true); });
    s.on('error',   () => resolve(false));
    s.on('timeout', () => resolve(false));
    s.connect(port, '127.0.0.1');
  });
}

async function waitForServer(port, timeout = 45_000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    if (await isPortOpen(port)) return true;
    await new Promise(r => setTimeout(r, 600));
  }
  return false;
}

function spawnDevServer(port) {
  return spawn('npx', ['next', 'dev', '-p', String(port)], {
    cwd: ROOT,
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: process.platform === 'win32',
  });
}

// ─── BROWSER CHECKS ───────────────────────────────────────────────────────────

function categorise(text, type) {
  if (type === 'error' || type === 'warning') {
    for (const { re, category, severity } of ERROR_PATTERNS) {
      if (re.test(text)) return { category, severity };
    }
    if (type === 'error') return { category: 'CONSOLE_ERROR', severity: 'ERROR' };
  }
  return null;
}

async function checkRoute(browser, route) {
  const url      = BASE_URL + route;
  const consoleIssues  = [];
  const networkIssues  = [];
  const page     = await browser.newPage();

  await page.setViewportSize(VIEWPORT);
  await page.setExtraHTTPHeaders({ 'x-qa-scanner': '1' });

  // Console-Listener
  page.on('console', msg => {
    const cat = categorise(msg.text(), msg.type());
    if (cat) {
      consoleIssues.push({
        ...cat,
        text: msg.text().slice(0, 300),
        location: `${msg.location().url || ''}:${msg.location().lineNumber || ''}`,
      });
    }
  });

  // Unkomprimierte JS-Fehler
  page.on('pageerror', err => {
    consoleIssues.push({
      severity: 'ERROR',
      category: 'JS_ERROR',
      text: err.message.slice(0, 300),
    });
  });

  // Netzwerk-Fehler (fehlende Bilder)
  page.on('response', res => {
    const u = res.url();
    if (res.status() === 404 && /\.(webp|jpg|jpeg|png|svg|woff2?)(\?|$)/.test(u)) {
      networkIssues.push({
        severity: 'ERROR',
        category: 'MISSING_ASSET',
        text: `HTTP 404: ${u.replace(BASE_URL, '')}`,
      });
    }
  });

  const start = Date.now();
  let httpStatus = 0;
  let layoutIssues = [];

  try {
    const response = await page.goto(url, {
      waitUntil: 'networkidle',
      timeout: TIMEOUT_MS,
    });
    httpStatus = response?.status() ?? 0;

    // Kurz warten damit React hydration abschließt
    await page.waitForTimeout(600);

    layoutIssues = await checkVisualLayout(page);
  } catch (err) {
    consoleIssues.push({
      severity: 'ERROR',
      category: 'NAVIGATION',
      text: err.message.slice(0, 200),
    });
  }

  const duration = Date.now() - start;

  // Screenshot bei Fehlern
  const allIssues = [...consoleIssues, ...networkIssues, ...layoutIssues];
  const hasCritical = allIssues.some(i => i.severity === 'CRITICAL' || i.severity === 'ERROR');
  if (hasCritical) {
    try {
      await fs.mkdir(SCREENSHOTS, { recursive: true });
      const slug = route.replace(/\//g, '_').replace(/^_/, '') || 'home';
      await page.screenshot({
        path: path.join(SCREENSHOTS, `${slug}.png`),
        fullPage: false,
      });
    } catch { /* Screenshot optional */ }
  }

  await page.close();

  return {
    route,
    url,
    httpStatus,
    duration,
    issues: allIssues,
    ok: httpStatus >= 200 && httpStatus < 400 && !allIssues.some(i => i.severity === 'CRITICAL'),
  };
}

async function checkVisualLayout(page) {
  const issues = [];

  // Header existiert und ist sichtbar
  const headerBox = await page.evaluate(sel => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const s = window.getComputedStyle(el);
    return {
      top: r.top, left: r.left, right: r.right, bottom: r.bottom,
      width: r.width, height: r.height,
      display: s.display, visibility: s.visibility, opacity: s.opacity,
    };
  }, SELECTORS.header);

  if (!headerBox) {
    issues.push({ severity: 'ERROR', category: 'LAYOUT', text: 'Header-Element nicht gefunden' });
    return issues;
  }
  if (headerBox.height < 20 || headerBox.display === 'none' || headerBox.visibility === 'hidden') {
    issues.push({ severity: 'WARN', category: 'LAYOUT', text: `Header unsichtbar oder kollabiert (height: ${Math.round(headerBox.height)}px)` });
  }

  // Alle fixed/sticky Elemente erfassen
  const fixedEls = await page.evaluate(() => {
    const results = [];
    for (const el of document.querySelectorAll('*')) {
      const s = window.getComputedStyle(el);
      if (s.position !== 'fixed' && s.position !== 'sticky') continue;
      if (s.display === 'none' || s.visibility === 'hidden') continue;
      const r = el.getBoundingClientRect();
      if (r.width < 10 || r.height < 10) continue;
      results.push({
        tag:     el.tagName,
        id:      el.id || '',
        cls:     (el.className || '').toString().slice(0, 60),
        zIndex:  parseInt(s.zIndex) || 0,
        top:     r.top,  left:   r.left,
        right:   r.right, bottom: r.bottom,
        width:   r.width, height: r.height,
      });
    }
    return results;
  });

  // Überlappungscheck zwischen fixed/sticky Elementen
  function overlap(a, b) {
    return !(b.left >= a.right || b.right <= a.left ||
             b.top >= a.bottom || b.bottom <= a.top);
  }

  for (let i = 0; i < fixedEls.length; i++) {
    for (let j = i + 1; j < fixedEls.length; j++) {
      const a = fixedEls[i];
      const b = fixedEls[j];
      if (!overlap(a, b)) continue;

      // Beide auf ähnlichem z-index → echte Überlappung
      const zDiff = Math.abs(a.zIndex - b.zIndex);
      const aLabel = `${a.tag}${a.id ? '#' + a.id : ''}`;
      const bLabel = `${b.tag}${b.id ? '#' + b.id : ''}`;

      // Nur kritisch wenn gleiches z-level (< 5 Differenz)
      if (zDiff < 5) {
        issues.push({
          severity: 'WARN',
          category: 'LAYOUT_OVERLAP',
          text: `Überlappung: ${aLabel} (z:${a.zIndex}) ↔ ${bLabel} (z:${b.zIndex})`,
        });
      }
    }
  }

  // Content-Bereich überschneidet Header (häufiges Problem bei sticky headers)
  const mainClip = await page.evaluate(({ hTop, hBottom }) => {
    const main = document.querySelector('main');
    if (!main) return null;
    const r = main.getBoundingClientRect();
    return r.top < hBottom - 5 ? {
      mainTop: r.top,
      headerBottom: hBottom,
      overlap: hBottom - r.top,
    } : null;
  }, { hTop: headerBox.top, hBottom: headerBox.bottom });

  if (mainClip && mainClip.overlap > 20) {
    issues.push({
      severity: 'WARN',
      category: 'LAYOUT_OVERLAP',
      text: `<main> überlappt Header um ${Math.round(mainClip.overlap)}px — möglicherweise fehlender padding-top`,
    });
  }

  return issues;
}

// ─── REPORT ───────────────────────────────────────────────────────────────────

function severityIcon(s) {
  return s === 'CRITICAL' ? '🔴' : s === 'ERROR' ? '🟠' : '🟡';
}

function printResult(result) {
  const statusColor = result.httpStatus >= 500 ? c.red
    : result.httpStatus === 404 ? c.yellow
    : c.green;

  const statusStr = statusColor(`[${result.httpStatus || 'ERR'}]`);
  const timeStr   = c.dim(`${result.duration}ms`);

  const critical = result.issues.filter(i => i.severity === 'CRITICAL').length;
  const errors   = result.issues.filter(i => i.severity === 'ERROR').length;
  const warnings = result.issues.filter(i => i.severity === 'WARN').length;

  const badge = critical ? c.red(` ✗ ${critical} CRITICAL`) :
                errors   ? c.red(` ✗ ${errors} error${errors > 1 ? 's' : ''}`) :
                warnings ? c.yellow(` △ ${warnings} warn${warnings > 1 ? 's' : ''}`) :
                           c.green(' ✓');

  console.log(`  ${statusStr} ${result.route.padEnd(45)} ${timeStr}${badge}`);
  for (const issue of result.issues) {
    console.log(`      ${severityIcon(issue.severity)} ${c.dim(`[${issue.category}]`)} ${issue.text}`);
  }
}

async function writeReport(results, duration) {
  const now = new Date().toISOString();
  const total    = results.length;
  const passed   = results.filter(r => r.ok && r.issues.length === 0).length;
  const warnings = results.filter(r => r.ok && r.issues.some(i => i.severity === 'WARN') && !r.issues.some(i => i.severity === 'ERROR' || i.severity === 'CRITICAL')).length;
  const errors   = results.filter(r => !r.ok || r.issues.some(i => i.severity === 'ERROR' || i.severity === 'CRITICAL')).length;

  // ── Plain-text log ────────────────────────────────────────────────────────
  const lines = [
    '═══════════════════════════════════════════════════════════════',
    `  Steakakademie QA Report`,
    `  Erstellt:  ${now}`,
    `  Dauer:     ${(duration / 1000).toFixed(1)}s`,
    `  Basis-URL: ${BASE_URL}`,
    '═══════════════════════════════════════════════════════════════',
    '',
    'ZUSAMMENFASSUNG',
    '───────────────',
    `  Routen getestet: ${total}`,
    `  ✓ Bestanden:     ${passed}`,
    `  △ Warnungen:     ${warnings}`,
    `  ✗ Fehler:        ${errors}`,
    '',
  ];

  const criticalResults = results.filter(r =>
    r.issues.some(i => i.severity === 'CRITICAL' || i.severity === 'ERROR') || r.httpStatus >= 400
  );
  if (criticalResults.length) {
    lines.push('FEHLER & KRITISCHE ISSUES', '──────────────────────────');
    for (const r of criticalResults) {
      lines.push(`  ${r.httpStatus >= 400 ? `HTTP ${r.httpStatus}` : '     '} ${r.route}`);
      for (const issue of r.issues.filter(i => i.severity === 'CRITICAL' || i.severity === 'ERROR')) {
        lines.push(`         [${issue.category}] ${issue.text}`);
      }
    }
    lines.push('');
  }

  const warnResults = results.filter(r =>
    r.issues.some(i => i.severity === 'WARN') &&
    !r.issues.some(i => i.severity === 'CRITICAL' || i.severity === 'ERROR')
  );
  if (warnResults.length) {
    lines.push('WARNUNGEN', '──────────');
    for (const r of warnResults) {
      for (const issue of r.issues.filter(i => i.severity === 'WARN')) {
        lines.push(`  △ ${r.route.padEnd(40)} [${issue.category}] ${issue.text}`);
      }
    }
    lines.push('');
  }

  lines.push('ALLE ROUTEN', '────────────');
  for (const r of results) {
    const icon = r.issues.some(i => i.severity === 'CRITICAL') ? '✗' :
                 r.issues.some(i => i.severity === 'ERROR')    ? '✗' :
                 r.issues.some(i => i.severity === 'WARN')     ? '△' : '✓';
    lines.push(`  ${icon} [${r.httpStatus || '???'}] ${r.route.padEnd(42)} ${r.duration}ms`);
  }
  lines.push('');

  await fs.writeFile(REPORT_LOG, lines.join('\n'), 'utf-8');

  // ── JSON report ────────────────────────────────────────────────────────────
  await fs.writeFile(REPORT_JSON, JSON.stringify({
    generatedAt: now,
    baseUrl: BASE_URL,
    durationMs: duration,
    summary: { total, passed, warnings, errors },
    results,
  }, null, 2), 'utf-8');

  return { total, passed, warnings, errors };
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n${c.bold('🔥 Steakakademie QA Manager')}\n`);
  const globalStart = Date.now();

  // ── Server starten falls nötig ─────────────────────────────────────────────
  let serverProc = null;
  const alreadyRunning = await isPortOpen(QA_PORT);

  if (alreadyRunning) {
    console.log(`${c.green('✓')} Server läuft bereits auf Port ${QA_PORT}`);
  } else {
    console.log(`${c.dim('⏳')} Starte Next.js Dev-Server auf Port ${QA_PORT}...`);
    serverProc = spawnDevServer(QA_PORT);

    serverProc.stderr?.on('data', d => {
      const line = d.toString().trim();
      if (line.includes('Error') || line.includes('error')) {
        process.stderr.write(`${c.dim('   [next]')} ${line}\n`);
      }
    });

    const ready = await waitForServer(QA_PORT, 60_000);
    if (!ready) {
      console.error(c.red('✗ Server nicht gestartet (Timeout 60s). Abbruch.'));
      serverProc?.kill();
      process.exit(1);
    }
    console.log(`${c.green('✓')} Server bereit auf Port ${QA_PORT}`);
  }

  // ── Routen entdecken ───────────────────────────────────────────────────────
  const routes = await discoverRoutes();
  console.log(`${c.dim('📍')} ${routes.length} Routen gefunden\n`);

  // ── Browser starten ────────────────────────────────────────────────────────
  let browser;
  try {
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-dev-shm-usage'],
    });
  } catch (err) {
    console.error(c.red('✗ Chromium nicht verfügbar.'));
    console.error('  → npx playwright install chromium');
    serverProc?.kill();
    process.exit(1);
  }

  // ── Scan ───────────────────────────────────────────────────────────────────
  const results = [];
  console.log(c.dim('Route'.padEnd(50) + 'Status   Dauer'));
  console.log(c.dim('─'.repeat(65)));

  for (const route of routes) {
    const result = await checkRoute(browser, route);
    results.push(result);
    printResult(result);
  }

  await browser.close();

  // ── Report ─────────────────────────────────────────────────────────────────
  const totalDuration = Date.now() - globalStart;
  const summary = await writeReport(results, totalDuration);

  console.log(`\n${c.dim('─'.repeat(65))}`);
  console.log(`${c.bold('Ergebnis')} — ${(totalDuration / 1000).toFixed(1)}s`);
  console.log(`  ${c.green(`✓ ${summary.passed} bestanden`)}  ${summary.warnings ? c.yellow(`△ ${summary.warnings} Warnungen`) : ''}  ${summary.errors ? c.red(`✗ ${summary.errors} Fehler`) : ''}`);
  console.log(`\n  ${c.dim('📄')} qa-report.log`);
  console.log(`  ${c.dim('📊')} qa-report.json`);
  if (await fs.access(path.join(SCREENSHOTS)).then(() => true).catch(() => false)) {
    console.log(`  ${c.dim('📸')} qa-screenshots/ (Fehler-Screenshots)`);
  }
  console.log();

  // ── Cleanup ────────────────────────────────────────────────────────────────
  if (serverProc) {
    serverProc.kill();
    // Auf Windows: ganze Process-Gruppe beenden
    if (process.platform === 'win32') {
      try { spawn('taskkill', ['/pid', String(serverProc.pid), '/f', '/t'], { stdio: 'ignore' }); } catch {}
    }
  }

  process.exit(summary.errors > 0 ? 1 : 0);
}

main().catch(err => {
  console.error(c.red('\n✗ QA-Manager Fehler:'), err.message);
  process.exit(1);
});
