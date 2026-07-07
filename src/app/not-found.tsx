import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-24 text-center">
        <p className="text-sm uppercase tracking-widest text-[#E85018]">404</p>
        <h1 className="mt-4 font-serif text-4xl">Diese Seite ist durchgebrannt.</h1>
        <p className="mt-4 text-lg opacity-80">
          Den Link gibt es nicht (mehr). Kein Drama — hier geht&apos;s zurück ans Feuer:
        </p>
        <nav className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-3">
          <Link href="/" className="underline underline-offset-4 hover:text-[#C8882A]">Startseite</Link>
          <Link href="/cuts" className="underline underline-offset-4 hover:text-[#C8882A]">Cut-Atlas</Link>
          <Link href="/rezepte" className="underline underline-offset-4 hover:text-[#C8882A]">Rezepte</Link>
          <Link href="/temperatur-guide" className="underline underline-offset-4 hover:text-[#C8882A]">Kerntemperaturen</Link>
          <Link href="/glossar" className="underline underline-offset-4 hover:text-[#C8882A]">BBQ-Lexikon</Link>
          <Link href="/diplome" className="underline underline-offset-4 hover:text-[#C8882A]">Grillmeister-Diplome</Link>
        </nav>
      </main>
      <Footer />
    </>
  );
}
