import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Bestellung bestätigt — BBQ Grundkurs | Steakakademie',
  description: 'Dein BBQ Grundkurs wurde erfolgreich gebucht.',
  robots: { index: false, follow: false },
}

export default function DankeBbqGrundkursPage() {
  return (
    <main className="min-h-screen bg-[#0D0D0D] flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">

        <div className="mx-auto mb-8 w-20 h-20 rounded-full bg-[#F5A623]/10 border border-[#F5A623]/30 flex items-center justify-center">
          <svg className="w-10 h-10 text-[#F5A623]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-white mb-3">
          Willkommen im Kurs.
        </h1>
        <p className="text-[#F5A623] font-semibold text-lg mb-6">
          Feuer. Temperatur. Technik. Ab jetzt.
        </p>

        <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8 text-left space-y-4">
          <h2 className="text-white font-semibold text-sm uppercase tracking-widest mb-4">
            Nächste Schritte
          </h2>

          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-full bg-[#F5A623] text-black text-xs font-bold flex items-center justify-center">1</span>
            <div>
              <p className="text-white text-sm font-medium">E-Mail prüfen</p>
              <p className="text-white/60 text-sm">Du erhältst in wenigen Minuten eine Bestätigung von Digistore24 mit deinem Zugangscode zum Kursbereich.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-full bg-[#F5A623] text-black text-xs font-bold flex items-center justify-center">2</span>
            <div>
              <p className="text-white text-sm font-medium">Kursbereich freischalten</p>
              <p className="text-white/60 text-sm">Mit deinem Code meldest du dich einmalig an — danach hast du jederzeit Zugriff auf alle Module.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-full bg-[#F5A623] text-black text-xs font-bold flex items-center justify-center">3</span>
            <div>
              <p className="text-white text-sm font-medium">Modul 1 starten</p>
              <p className="text-white/60 text-sm">Feuer verstehen, Temperatur kontrollieren — die Grundlagen die alles andere erst möglich machen.</p>
            </div>
          </div>
        </div>

        <p className="text-white/40 text-xs mb-6">
          Die Abbuchung erfolgt durch Digistore24.com
        </p>

        <Link
          href="/"
          className="inline-block text-[#F5A623] hover:text-[#F5A623]/80 text-sm font-medium underline underline-offset-4 transition-colors"
        >
          Zurück zur Startseite
        </Link>
      </div>
    </main>
  )
}
