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
    '/steak-beichte',
    '/mein-protokoll',
    '/fleischpass',
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
      return { loc: path, changefreq: 'monthly', priority: 0.9, lastmod: new Date().toISOString() };
    }
    // Artikel
    if (path.startsWith('/artikel/')) {
      return { loc: path, changefreq: 'monthly', priority: 0.8, lastmod: new Date().toISOString() };
    }
    // Homepage
    if (path === '/') {
      return { loc: path, changefreq: 'daily', priority: 1.0, lastmod: new Date().toISOString() };
    }
    return { loc: path, changefreq: config.changefreq, priority: config.priority };
  },
};
