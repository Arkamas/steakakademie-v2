'use client';

import dynamic from 'next/dynamic';

/**
 * react-markdown + remark-gfm erst laden, wenn tatsächlich Markdown zu rendern
 * ist (Perf-Audit 02.09.2026). Vorher lag der Renderer (~46 kB komprimiert)
 * im Startseiten-Bundle, obwohl er nur nach einer Rezept-Schmiede-Antwort
 * gebraucht wird. ssr:false ist hier korrekt: der Inhalt entsteht immer erst
 * clientseitig aus einer API-Antwort.
 */
const Renderer = dynamic(() => import('./LazyMarkdownRenderer'), {
  ssr: false,
  loading: () => <p className="text-sm text-text-muted">Antwort wird gesetzt …</p>,
});

export default function LazyMarkdown({ children }: { children: string }) {
  return <Renderer>{children}</Renderer>;
}
