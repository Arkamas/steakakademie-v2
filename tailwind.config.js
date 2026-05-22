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
        'brand-gold': '#F5A623',
        'brand-fire': '#B43C00',
        'surface-base': '#FAF8F5',
        'surface-card': '#FFFFFF',
        'text-primary': '#0D0D0D',
        'text-secondary': '#6B6B6B',
        'text-muted': '#9B9B9B',
        'border-subtle': '#E8E3DB',
        'border-strong': '#0D0D0D',
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        body: ['Source Serif 4', 'Georgia', 'serif'],
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        editorial: '1280px',
        content: '720px',
      },
      typography: {
        DEFAULT: {
          css: {
            '--tw-prose-body': '#0D0D0D',
            '--tw-prose-headings': '#0D0D0D',
            '--tw-prose-links': '#B43C00',
            '--tw-prose-bold': '#0D0D0D',
            '--tw-prose-counters': '#6B6B6B',
            '--tw-prose-bullets': '#6B6B6B',
            '--tw-prose-hr': '#E8E3DB',
            '--tw-prose-quotes': '#0D0D0D',
            '--tw-prose-quote-borders': '#F5A623',
            '--tw-prose-captions': '#6B6B6B',
            '--tw-prose-code': '#B43C00',
            fontFamily: 'Source Serif 4, Georgia, serif',
            fontSize: '1.125rem',
            lineHeight: '1.75',
            h2: { fontFamily: 'Playfair Display, Georgia, serif', fontWeight: '700' },
            h3: { fontFamily: 'Playfair Display, Georgia, serif', fontWeight: '600' },
            a: {
              textDecoration: 'underline',
              textDecorationColor: '#F5A623',
              textDecorationThickness: '2px',
              textUnderlineOffset: '3px',
            },
            blockquote: {
              borderLeftWidth: '3px',
              borderLeftColor: '#F5A623',
              fontStyle: 'italic',
            },
          },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
