/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://steakakademie.de',
  generateRobotsTxt: false,
  changefreq: 'weekly',
  priority: 0.7,
  sitemapSize: 5000,
  exclude: [
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
    const ssrPaths = [
      '/gruender-schmiede', '/ehrliches-system', '/steuer-matrix',
      '/agentur-killer-sprint', '/erste-kunden-sprint', '/seo-sprint',
      '/cut-generator', '/steak-beichte', '/mein-protokoll', '/rezepte/community',
    ];
    return ssrPaths.map((loc) => ({ loc, changefreq: 'weekly', priority: 0.8 }));
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
