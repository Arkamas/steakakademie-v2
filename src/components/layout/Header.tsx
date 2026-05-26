'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Menu, X, ChevronDown, Flame } from 'lucide-react';
// Flame kept for Diplome CTA button
import Image from 'next/image';
import { cn } from '@/lib/utils';

const NAV_CATEGORIES = [
  {
    name: 'Grilltechniken',
    href: '/methoden',
    sub: [
      { label: 'Reverse Sear', href: '/methoden/reverse-sear' },
      { label: 'Direkt & Indirekt', href: '/methoden' },
      { label: 'Räuchern', href: '/methoden' },
      { label: 'Sous-vide', href: '/methoden' },
    ],
  },
  {
    name: 'Cuts & Fleischkunde',
    href: '/cuts',
    sub: [
      { label: 'Ribeye', href: '/cuts/ribeye' },
      { label: 'Brisket', href: '/cuts/brisket' },
      { label: 'Pulled Pork', href: '/cuts' },
      { label: 'Tomahawk', href: '/cuts' },
    ],
  },
  {
    name: 'Wissen',
    href: '/wissen',
    sub: [
      { label: 'Kerntemperaturen', href: '/wissen/kerntemperaturen' },
      { label: 'Maillard-Reaktion', href: '/wissen' },
      { label: 'Dry-Aging & Reifung', href: '/aging' },
      { label: 'Persönlichkeiten', href: '/persoenlichkeiten' },
    ],
  },
  {
    name: 'Rezepte',
    href: '/rezepte',
    sub: [
      { label: 'Fleisch-Rezepte', href: '/rezepte/fleisch' },
      { label: 'Beilagen & Salate', href: '/rezepte/beilagen' },
      { label: 'Saucen, Rubs & Injektionen', href: '/rezepte/saucen-rubs' },
      { label: 'Fire-Desserts', href: '/rezepte/desserts' },
      { label: 'Wine & Spirits', href: '/rezepte/wine-spirits' },
    ],
  },
  {
    name: 'Ausrüstung',
    href: '/vergleich',
    sub: [
      { label: 'Fleischthermometer', href: '/vergleich/premium-fleischthermometer' },
      { label: 'Oberhitzegrills', href: '/vergleich/oberhitzegrill-vergleich' },
      { label: 'Dry-Ager', href: '/vergleich/dry-aging-kuehlschrank-vergleich' },
      { label: 'Küchenmaschinen', href: '/vergleich/kuechenmaschine-vergleich' },
    ],
  },
  {
    name: 'USA-Expedition',
    href: '/usa-expedition',
    sub: [
      { label: 'Texas Style', href: '/usa-expedition/texas-style' },
      { label: 'Kansas City', href: '/usa-expedition/kansas-city' },
      { label: 'Memphis', href: '/usa-expedition/memphis' },
      { label: 'Carolinas', href: '/usa-expedition/carolinas' },
    ],
  },
  {
    name: 'Diplome',
    href: '/diplome',
    sub: [],
  },
  {
    name: 'Ehrliches System',
    href: '/ehrliches-system',
    sub: [
      { label: 'Gründung-Sprint', href: '/ehrliches-system#saule-i' },
      { label: 'Steuer-Matrix', href: '/steuer-matrix' },
      { label: 'Agentur-Killer-Sprint', href: '/ehrliches-system#saule-iii' },
      { label: 'Mein Zugang', href: '/mein-system' },
    ],
  },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/suche?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <>
      {/* Top-Bar */}
      <div className="bg-surface-dark border-b border-brand-gold/20 text-[10px] font-sans font-semibold tracking-[0.15em] uppercase text-center py-2 px-4 text-text-light/60">
        Grillmeister-Diplome — 5 Stufen · Bronze bis Meister
        <Link href="/diplome" className="ml-3 text-brand-gold/80 underline underline-offset-2 hover:text-brand-gold transition-colors">
          Jetzt starten →
        </Link>
      </div>

      <header
        className={cn(
          'bg-surface-dark border-b border-brand-gold/15 sticky top-0 z-50 transition-all duration-200',
          scrolled && 'shadow-[0_4px_32px_rgba(0,0,0,0.45),0_1px_0_rgba(200,136,42,0.15)]'
        )}
      >
        {/* Main header row */}
        <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Left: Logo — Marken-Anker */}
            <Link href="/" aria-label="Steakakademie Startseite" className="flex items-center gap-2.5 shrink-0">
              <Image
                src="/images/logo-barrel.jpg"
                alt="Steakakademie"
                width={56}
                height={56}
                className="rounded-full object-cover"
                priority
                style={{
                  filter: 'drop-shadow(0 0 8px rgba(210,125,45,0.35)) drop-shadow(0 0 18px rgba(210,125,45,0.16))',
                }}
              />
              <span className="flex flex-col leading-none select-none">
                <span className="font-serif font-black text-text-light" style={{ fontSize: '21px', letterSpacing: '-0.01em', lineHeight: 1.1 }}>
                  Steak
                </span>
                <span className="font-serif font-normal text-text-light/50 uppercase" style={{ fontSize: '9px', letterSpacing: '0.20em', lineHeight: 1.3 }}>
                  Akademie
                </span>
              </span>
            </Link>

            {/* Right: Actions + mobile Hamburger */}
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 text-text-light/60 hover:text-brand-gold transition-colors"
                aria-label="Suche öffnen"
              >
                <Search size={18} />
              </button>
              <Link
                href="/vergleich/fleischthermometer"
                className="hidden sm:block text-[11px] font-sans font-bold tracking-[0.12em] uppercase text-white hover:text-brand-gold transition-colors px-2 nav-sharp"
              >
                Tests
              </Link>
              <Link
                href="/diplome"
                className="hidden sm:flex items-center gap-1.5 bg-brand-gold text-ink font-sans text-[11px] font-bold tracking-[0.12em] uppercase px-3 py-2 hover:bg-[#b07020] transition-colors"
              >
                <Flame size={12} />
                Diplome
              </Link>
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden w-8 h-8 flex items-center justify-center bg-brand-fire text-white hover:bg-[#cc4412] transition-colors shrink-0 ml-1"
                aria-label={mobileOpen ? 'Menü schließen' : 'Menü öffnen'}
                aria-expanded={mobileOpen}
              >
                {mobileOpen ? <X size={16} /> : <Menu size={16} />}
              </button>
            </div>
          </div>
        </div>

        {/* Search bar */}
        {searchOpen && (
          <div className="border-t border-brand-gold/15 bg-surface-elevated">
            <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-3">
              <form onSubmit={handleSearch} className="flex items-center gap-3">
                <Search size={16} className="text-text-light/40 shrink-0" />
                <input
                  ref={searchRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Brisket, Thermometer, Reverse Sear …"
                  className="flex-1 bg-transparent text-sm font-sans text-text-light placeholder:text-text-light/40 outline-none border-b border-text-light/20 pb-1 focus:border-brand-gold transition-colors"
                />
                <button
                  type="submit"
                  className="text-[11px] font-bold tracking-[0.12em] uppercase font-sans text-brand-fire hover:text-[#cc4412] transition-colors"
                >
                  Suchen
                </button>
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="text-text-light/40 hover:text-text-light transition-colors"
                >
                  <X size={16} />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Category nav — desktop */}
        <nav className="border-t border-brand-gold/15 hidden md:block" aria-label="Hauptnavigation">
          <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8">
            <ul className="flex items-center justify-end">
              {NAV_CATEGORIES.map((cat) => {
                const isActive =
                  pathname === cat.href ||
                  pathname.startsWith(`${cat.href}/`);
                return (
                  <li key={cat.href} className="group relative">
                    <Link
                      href={cat.href}
                      className={cn(
                        'flex items-center gap-1 px-3 py-3 text-[11px] font-sans font-bold tracking-[0.1em] uppercase transition-colors duration-150 border-b-2',
                        isActive
                          ? 'text-brand-fire border-brand-fire'
                          : 'text-white border-transparent hover:text-brand-gold hover:border-brand-gold/40'
                      )}
                    >
                      {cat.name}
                      {cat.sub.length > 0 && (
                        <ChevronDown
                          size={9}
                          className="opacity-40 group-hover:opacity-100 transition-opacity"
                        />
                      )}
                    </Link>

                    {/* Dropdown */}
                    {cat.sub.length > 0 && (
                      <div className="absolute top-full left-0 bg-surface-elevated border border-brand-gold/15 shadow-[0_8px_32px_rgba(0,0,0,0.45)] min-w-[200px] z-50 opacity-0 invisible pointer-events-none group-hover:opacity-100 group-hover:visible group-hover:pointer-events-auto transition-all duration-150 translate-y-1 group-hover:translate-y-0">
                        {cat.sub.map((sub) => (
                          <Link
                            key={sub.href + sub.label}
                            href={sub.href}
                            className="block px-4 py-2.5 text-xs font-sans text-text-light/70 hover:text-brand-gold hover:bg-surface-dark transition-colors border-b border-brand-gold/10 last:border-0"
                          >
                            {sub.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>
      </header>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-surface-dark overflow-y-auto md:hidden pt-16">
          <div className="p-6">
            <p className="text-[10px] font-sans font-bold tracking-[0.15em] uppercase text-text-light/40 mb-4">
              Kategorien
            </p>
            <ul className="space-y-0">
              {NAV_CATEGORIES.map((cat) => (
                <li key={cat.href}>
                  <Link
                    href={cat.href}
                    className="block py-4 border-b border-brand-gold/15 font-serif text-xl text-text-light hover:text-brand-gold transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-8 space-y-4">
              <Link
                href="/vergleich/fleischthermometer"
                className="block text-sm font-sans font-semibold text-text-light/60 hover:text-brand-gold transition-colors"
              >
                Produkttests &amp; Vergleiche
              </Link>
              <Link
                href="/diplome"
                className="inline-flex items-center gap-2 bg-brand-gold text-ink font-sans text-sm font-bold tracking-wide uppercase px-5 py-3 hover:bg-[#b07020] transition-colors"
              >
                <Flame size={14} />
                Grillmeister-Diplome starten
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
