const fs = require('fs');
const path = require('path');

/**
 * Gibt es mindestens einen freigegebenen Artikel?
 *
 * Solange keiner auf reviewed: true steht, rendert /artikel nur den
 * Leerzustand. Eine leere Seite gehoert weder in die Sitemap noch in den Index —
 * sie waere Thin Content und wuerde die Route verbrennen, bevor sie Inhalt hat.
 *
 * Bewusst konditional aus dem Dateibestand gelesen statt als manueller Schalter:
 * Sobald Uwe den ersten Artikel freigibt, faellt der Ausschluss beim naechsten
 * Build von allein weg. Ein Flag muesste jemand zurueckdrehen und wuerde
 * garantiert vergessen.
 *
 * Die Bedingung spiegelt nurVeroeffentlicht() aus src/lib/redaktion.ts.
 * Gelesen wird die Frontmatter direkt, weil diese Datei CommonJS ist und die
 * contentlayer-Ausgabe ESM — der Dateibestand ist ohnehin die Quelle.
 */
function hatFreigegebeneArtikel() {
  const dir = path.join(__dirname, 'content', 'artikel');
  let dateien;
  try {
    dateien = fs.readdirSync(dir).filter((f) => f.endsWith('.mdx'));
  } catch {
    return false; // Verzeichnis fehlt = nichts freigegeben
  }
  return dateien.some((f) => {
    const raw = fs.readFileSync(path.join(dir, f), 'utf8');
    // \r im Zeichensatz wegen CRLF-Dateien im Repo (KAN-26)
    const feld = (k) => {
      const m = raw.match(new RegExp(`^${k}:[ \\t]*(.*?)[ \\t\\r]*$`, 'm'));
      return m ? m[1].replace(/^["']|["']$/g, '').trim() : null;
    };
    const status = feld('status');
    const reviewed = feld('reviewed');
    return status !== 'draft' && status !== 'review' && reviewed !== 'false';
  });
}

const ARTIKEL_FREIGEGEBEN = hatFreigegebeneArtikel();

/**
 * Welche Fleischwissen-Teile sind heute noch NICHT erschienen?
 *
 * Die Serie ist auf den 02./09./16.10.2026 gestaffelt. Ein Teil, der noch nicht
 * erschienen ist, darf nicht in der Sitemap stehen — sonst laedt Google ihn
 * ein, bevor er verlinkt ist, und die Staffelung ist wertlos.
 *
 * Die Regel lebt fachlich in src/lib/fleischwissen.ts. Diese Datei ist CommonJS
 * und die contentlayer-Ausgabe ESM, deshalb wird die Frontmatter hier direkt
 * gelesen — dasselbe Muster wie oben bei den Stufe-1-Lektionen. Wer die Regel
 * dort aendert, aendert sie hier mit; die Konsistenz haelt kein Compiler.
 *
 * Vergleich auf reiner Kalendertagsbasis (String-Vergleich auf YYYY-MM-DD),
 * damit Zeitzone und Uhrzeit nicht mitspielen.
 */
function nichtErschieneneFleischwissenPfade() {
  const dir = path.join(__dirname, 'content', 'fleischwissen');
  let dateien;
  try {
    dateien = fs.readdirSync(dir).filter((f) => f.endsWith('.mdx'));
  } catch {
    return [];
  }
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  const heute = `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;

  return dateien
    .map((f) => {
      const raw = fs.readFileSync(path.join(dir, f), 'utf8');
      // \r wegen CRLF-Dateien im Repo (KAN-26). Kommentarzeilen im Frontmatter
      // beginnen mit '#' und werden von diesem Muster nicht getroffen.
      const m = raw.match(/^publishedAt:[ \t]*(.*?)[ \t\r]*$/m);
      const publishedAt = m ? m[1].replace(/^["']|["']$/g, '').trim() : null;
      if (!publishedAt) return null;
      return publishedAt.slice(0, 10) > heute ? `/fleischwissen/${f.replace(/\.mdx$/, '')}` : null;
    })
    .filter(Boolean);
}

const FLEISCHWISSEN_GESPERRT = nichtErschieneneFleischwissenPfade();

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://steakakademie.de',
  generateRobotsTxt: false,
  changefreq: 'weekly',
  priority: 0.7,
  sitemapSize: 5000,
  exclude: [
    '/home-b',        // A/B-Variante (Editorial Ember) — noindex, Canonical auf /
    // Bezahlprodukt-Schutz (26.08.2026): Stufe 2-5 sind Teil des kostenpflichtigen
    // Grillmeister-Diploms. Oeffentlich bleibt nur der Anreisser auf der Seite
    // selbst — die Volltexte gehoeren nicht in den Index. Stufe 1 (Bronze,
    // kostenloser Trichter) bleibt drin.
    '/diplome/lernen/stufe-2/*',
    '/diplome/lernen/stufe-3/*',
    '/diplome/lernen/stufe-4/*',
    '/diplome/lernen/stufe-5/*',
    '/go/*',
    '/api/*',
    '/admin/*',
    '/mein-system',
    '/meine-kurse',
    '/profil',
    '/steuer-matrix/rechner',
    '/auth/*',
    '/danke/*',
    '/diplome/urkunde',
    '/diplome/simulation',
    '/diplome/roadmap',
    '/fleischpass',
    '/steak-beichte/diagnose',
    '/steak-beichte/diagnose/*',
    '/mein-protokoll/fragebogen',
    '/mein-protokoll/plan',
    '/prive',
    '/icon.svg',
    '/diplome/profil',
    '/tools/*',
    '/zzp-niche',
    '/zzp-niche/*',
    '/eu-steuervergleich',
    '/eu-steuervergleich/*',
    '/affiliate-disclosure',
    '/agb',
    '/datenschutz',
    '/impressum',
    '/kontakt',
  ],
  // SSR-Seiten (dynamisch wegen Supabase-Preisen) fehlen im Prerender-Manifest
  // → next-sitemap sieht sie nicht. Verkaufs-Landingpages hier explizit aufnehmen.
  additionalPaths: async () => {
    // Stufe-1-Lektionen explizit nachtragen. Sie sind der kostenlose Trichter
    // und muessen im Index bleiben. Nicht auf das Build-Manifest verlassen:
    // die Route teilt sich eine Datei mit den Bezahlstufen, und deren
    // Zugangspruefung kann sie jederzeit wieder dynamisch machen. Frontmatter
    // direkt gelesen, weil diese Datei CommonJS ist und contentlayer ESM.
    const stufe1 = (() => {
      const dir = path.join(__dirname, 'content', 'diplom-lektionen', 'stufe-1');
      let dateien;
      try { dateien = fs.readdirSync(dir).filter((f) => f.endsWith('.mdx')); }
      catch { return []; }
      return dateien.map((f) => {
        const raw = fs.readFileSync(path.join(dir, f), 'utf8');
        const m = raw.match(/^lektionSlug:[ \t]*(.*?)[ \t\r]*$/m);
        const slug = m ? m[1].replace(/^["']|["']$/g, '').trim() : null;
        return slug ? { loc: `/diplome/lernen/stufe-1/${slug}`, changefreq: 'monthly', priority: 0.7 } : null;
      }).filter(Boolean);
    })();

    const ssrPaths = [
      '/gruender-schmiede', '/ehrliches-system', '/steuer-matrix',
      '/agentur-killer-sprint', '/erste-kunden-sprint', '/seo-sprint',
      '/cut-generator', '/steak-beichte', '/mein-protokoll', '/rezepte/community',
    ];
    return [
      ...ssrPaths.map((loc) => ({ loc, changefreq: 'weekly', priority: 0.8 })),
      ...stufe1,
    ];
  },
  robotsTxtOptions: {
    additionalSitemaps: [],
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/go/', '/api/'],
      },
    ],
  },
  // Prioritäten nach Content-Typ
  transform: async (config, path) => {
    // /artikel bleibt draussen, solange kein Artikel freigegeben ist (null = ausschliessen).
    // Die Detailseiten brauchen keine Regel: generateStaticParams erzeugt sie in
    // Produktion gar nicht erst, sie stehen also ohnehin nicht im Manifest.
    if (!ARTIKEL_FREIGEGEBEN && path.startsWith('/artikel')) {
      return null;
    }
    // Noch nicht erschienene Serienteile: raus (null = ausschliessen).
    // Die Uebersicht /fleischwissen bleibt drin — sie ist die Serienseite und
    // zeigt die kommenden Teile bewusst als Ankuendigung.
    if (FLEISCHWISSEN_GESPERRT.includes(path)) {
      return null;
    }
    // Serie als Pillar-Content: gleiche Prioritaet wie Cuts/Methoden.
    if (path === '/fleischwissen' || path.startsWith('/fleischwissen/')) {
      return { loc: path, changefreq: 'monthly', priority: 0.9 };
    }
    // Pillar Pages: höchste Priorität
    if (path === '/ehrliches-system' || path.startsWith('/cuts/') || path.startsWith('/vergleich/') || path.startsWith('/methoden/')) {
      return { loc: path, changefreq: 'monthly', priority: 0.9 };
    }
    // Artikel
    if (path.startsWith('/artikel/')) {
      return { loc: path, changefreq: 'monthly', priority: 0.8 };
    }
    // Homepage
    if (path === '/') {
      return { loc: path, changefreq: 'daily', priority: 1.0 };
    }
    return { loc: path, changefreq: config.changefreq, priority: config.priority };
  },
};
