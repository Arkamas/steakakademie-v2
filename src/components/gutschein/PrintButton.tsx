'use client';

import { Printer } from 'lucide-react';

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 border border-border-subtle px-4 py-2 text-sm font-sans text-text-secondary hover:text-brand-gold hover:border-brand-gold transition-colors print:hidden"
    >
      <Printer size={15} /> Gutschein drucken
    </button>
  );
}
