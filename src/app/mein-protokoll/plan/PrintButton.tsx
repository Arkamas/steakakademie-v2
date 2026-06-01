'use client';

import { Printer } from 'lucide-react';

export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="print:hidden inline-flex items-center gap-2 px-5 py-2.5 font-sans text-sm font-bold border transition-colors hover:bg-brand-gold/10"
      style={{ borderColor: 'rgba(200,136,42,0.6)', color: '#C8882A' }}
    >
      <Printer size={15} />
      Drucken / als PDF speichern
    </button>
  );
}
