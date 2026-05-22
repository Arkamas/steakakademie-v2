/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://steakakademie.de',
  generateRobotsTxt: true,
  changefreq: 'weekly',
  priority: 0.7,
  sitemapSize: 5000,
  exclude: [
    '/go/*',           // Affiliate-Redirects nicht indexieren
    '/api/*',          // API-Routen
    '/admin/*',
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
    if (path.startsWith('/cuts/') || path.startsWith('/vergleich/') || path.startsWith('/methoden/')) {
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
