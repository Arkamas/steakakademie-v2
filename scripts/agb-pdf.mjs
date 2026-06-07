// Erzeugt ein sauberes, helles PDF der live veröffentlichten AGB-Seite (für ARAG).
// Lädt steakakademie.de/agb, blendet Header/Footer aus, erzwingt weißen Hintergrund.
import { chromium } from 'playwright';

const OUT = process.argv[2] || 'Steakakademie-AGB.pdf';
const URL = 'https://steakakademie.de/agb';

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(URL, { waitUntil: 'networkidle', timeout: 60000 });

// Lesbar/druckfreundlich: weißer Grund, dunkler Text, Nav/Header/Footer raus
await page.addStyleTag({
  content: `
    * { background: #ffffff !important; color: #1a1a1a !important; border-color: #cccccc !important; box-shadow: none !important; }
    header, footer, nav, [aria-label="Breadcrumb"] { display: none !important; }
    a { color: #b45309 !important; text-decoration: underline; }
    h1, h2, h3, strong { color: #000000 !important; }
    main { padding-top: 0 !important; }
  `,
});
await page.emulateMedia({ media: 'screen' });

await page.pdf({
  path: OUT,
  format: 'A4',
  printBackground: true,
  margin: { top: '18mm', bottom: '18mm', left: '16mm', right: '16mm' },
  displayHeaderFooter: true,
  headerTemplate: '<span></span>',
  footerTemplate:
    '<div style="font-size:8px;color:#888;width:100%;text-align:center;">Steakakademie — AGB · Seite <span class="pageNumber"></span>/<span class="totalPages"></span></div>',
});

await browser.close();
console.log(`✓ PDF erzeugt: ${OUT}`);
