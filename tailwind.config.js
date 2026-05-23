/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './content/**/*.{md,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ─ Premium Magazin — Light Mode with Dark Frame ───────────────────
        'brand-gold':       '#C8882A',   // Whiskey-Gold — accents, stars, borders
        'brand-fire':       '#E85018',   // Glut-Orange — primary CTA / affiliate
        'ink':              '#1C1008',   // Bourbon-Dunkel — header, footer, near-black
        // Surfaces (light magazine)
        'surface-base':     '#FAF6EF',   // Ascheweiß — global page background
        'surface-card':     '#F0E8D8',   // Creme — product cards, sidebars
        'surface-elevated': '#2D2218',   // Räuchereiche — dark islands / pull quotes
        'surface-dark':     '#1C1008',   // Bourbon — header, footer background
        // Text (dark on light)
        'text-primary':     '#1C1008',   // Räuchereiche — main body text
        'text-secondary':   '#4A3728',   // Tabak-Mittel — secondary text
        'text-muted':       '#8C7060',   // Tabak-Gedämpft — captions, meta
        'text-light':       '#F0E8D8',   // Pergament — text on dark sections
        // Borders (light page)
        'border-subtle':    '#DDD0BC',   // Creme-Grenze — subtle light border
        'border-strong':    '#C8882A',   // Gold — strong accent border
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        body:  ['Source Serif 4', 'Georgia', 'serif'],
        sans:  ['DM Sans', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        editorial: '1280px',
        content:   '720px',
      },
      typography: {
        DEFAULT: {
          css: {
            '--tw-prose-body':          '#4A3728',
            '--tw-prose-headings':      '#1C1008',
            '--tw-prose-links':         '#E85018',
            '--tw-prose-bold':          '#1C1008',
            '--tw-prose-counters':      '#8C7060',
            '--tw-prose-bullets':       '#C8882A',
            '--tw-prose-hr':            '#DDD0BC',
            '--tw-prose-quotes':        '#1C1008',
            '--tw-prose-quote-borders': '#C8882A',
            '--tw-prose-captions':      '#8C7060',
            '--tw-prose-code':          '#E85018',
            '--tw-prose-pre-bg':        '#F0E8D8',
            fontFamily:  'Source Serif 4, Georgia, serif',
            fontSize:    '1.125rem',
            lineHeight:  '1.8',
            h2: {
              fontFamily: 'Playfair Display, Georgia, serif',
              fontWeight: '700',
              color: '#1C1008',
            },
            h3: {
              fontFamily: 'Playfair Display, Georgia, serif',
              fontWeight: '600',
              color: '#1C1008',
            },
            a: {
              textDecoration: 'underline',
              textDecorationColor: '#C8882A',
              textDecorationThickness: '2px',
              textUnderlineOffset: '3px',
            },
            blockquote: {
              borderLeftWidth: '3px',
              borderLeftColor: '#C8882A',
              fontStyle: 'italic',
              color: '#4A3728',
              paddingLeft: '1.5rem',
              paddingTop: '0.5rem',
              paddingBottom: '0.5rem',
              backgroundColor: 'rgba(200, 136, 42, 0.05)',
            },
            'thead tr': {
              backgroundColor: '#F0E8D8',
            },
            'thead th': {
              color: '#C8882A',
              fontWeight: '700',
            },
            'tbody td': {
              borderBottomColor: '#DDD0BC',
              color: '#4A3728',
            },
            'tbody tr:nth-child(even)': {
              backgroundColor: 'rgba(240, 232, 216, 0.5)',
            },
          },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
