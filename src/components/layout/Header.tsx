'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Menu, X, ChevronDown, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_CATEGORIES = [
  {
    name: 'Grilltechniken',
    slug: 'grilltechniken',
    sub: ['Direkt & Indirekt', 'Reverse Sear', 'Räuchern', 'Sous-vide'],
  },
  {
    name: 'Cuts & Fleischkunde',
    slug: 'cuts',
    sub: ['Ribeye', 'Brisket', 'Pulled Pork', 'Tomahawk', 'Dry Aged'],
  },
  {
    name: 'Rezepte',
    slug: 'rezepte',
    sub: [],
  },
  {
    name: 'Ausrüstung',
    slug: 'ausruestung',
    sub: ['Grills & Smoker', 'Thermometer', 'Messer', 'Zubehör'],
  },
  {
    name: 'Wissen',
    slug: 'wissen',
    sub: ['Kerntemperaturen', 'Marmorierung', 'Reifung', 'BBQ-Lexikon'],
  },
  {
    name: 'Diplome',
    slug: 'diplome',
    sub: [],
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
      <div className="bg-text-primary text-white text-[10px] font-sans font-semibold tracking-[0.15em] uppercase text-center py-2 px-4">
        Grillmeister-Diplome — 5 Stufen · Bronze bis Meister
        <Link href="/diplome" className="ml-3 underline underline-offset-2 hover:text-brand-gold transition-colors">
          Jetzt starten →
        </Link>
      </div>

      <header
        className={cn(
          'bg-white border-b border-border-subtle sticky top-0 z-50 transition-shadow duration-200',
          scrolled && 'shadow-[0_2px_12px_rgba(0,0,0,0.08)]'
        )}
      >
        {/* Main header row */}
        <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Left: Hamburger */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="w-8 h-8 flex items-center justify-center bg-brand-fire text-white hover:bg-[#912e00] transition-colors shrink-0"
                aria-label={mobileOpen ? 'Menü schließen' : 'Menü öffnen'}
                aria-expanded={mobileOpen}
              >
                {mobileOpen ? <X size={16} /> : <Menu size={16} />}
              </button>
            </div>

            {/* Center: Logo */}
            <div className="flex-1 flex justify-center">
              <Link href="/" aria-label="Steakakademie Startseite">
                <span
                  className="font-serif font-black text-[2rem] sm:text-[2.5rem] tracking-[-0.02em] text-text-primary hover:text-brand-fire transition-colors duration-200 select-none leading-none"
                >
                  Steakakademie
                </span>
              </Link>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 text-text-primary hover:text-brand-fire transition-colors"
                aria-label="Suche öffnen"
              >
                <Search size={18} />
              </button>
              <Link
                href="/vergleich/fleischthermometer"
                className="hidden sm:block text-[11px] font-sans font-bold tracking-[0.12em] uppercase text-text-primary hover:text-brand-fire transition-colors px-2"
              >
                Tests
              </Link>
              <Link
                href="/diplome"
                className="hidden sm:flex items-center gap-1.5 bg-brand-gold text-white font-sans text-[11px] font-bold tracking-[0.12em] uppercase px-3 py-2 hover:bg-[#d4891a] transition-colors"
              >
                <Flame size={12} />
                Diplome
              </Link>
            </div>
          </div>
        </div>

        {/* Search bar */}
        {searchOpen && (
          <div className="border-t border-border-subtle bg-[#F7F4F0]">
            <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-3">
              <form onSubmit={handleSearch} className="flex items-center gap-3">
                <Search size={16} className="text-text-muted shrink-0" />
                <input
                  ref={searchRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Brisket, Thermometer, Reverse Sear …"
                  className="flex-1 bg-transparent text-sm font-sans text-text-primary placeholder:text-text-muted outline-none border-b border-border-subtle pb-1 focus:border-brand-fire transition-colors"
                />
                <button
                  type="submit"
                  className="text-[11px] font-bold tracking-[0.12em] uppercase font-sans text-brand-fire hover:text-[#912e00] transition-colors"
                >
                  Suchen
                </button>
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="text-text-muted hover:text-text-primary transition-colors"
                >
                  <X size={16} />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Category nav — desktop */}
        <nav className="border-t border-border-subtle hidden md:block" aria-label="Hauptnavigation">
          <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8">
            <ul className="flex items-center justify-center">
              {NAV_CATEGORIES.map((cat) => {
                const isActive =
                  pathname === `/kategorie/${cat.slug}` ||
                  pathname.startsWith(`/kategorie/${cat.slug}/`);
                return (
                  <li key={cat.slug} className="group relative">
                    <Link
                      href={`/kategorie/${cat.slug}`}
                      className={cn(
                        'flex items-center gap-1 px-3 py-3 text-[11px] font-sans font-bold tracking-[0.1em] uppercase transition-colors duration-150 border-b-2',
                        isActive
                          ? 'text-brand-fire border-brand-fire'
                          : 'text-text-primary border-transparent hover:text-brand-fire'
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
                      <div className="absolute top-full left-0 bg-white border border-border-subtle shadow-lg min-w-[200px] z-50 opacity-0 invisible pointer-events-none group-hover:opacity-100 group-hover:visible group-hover:pointer-events-auto transition-all duration-150 translate-y-1 group-hover:translate-y-0">
                        {cat.sub.map((sub) => (
                          <Link
                            key={sub}
                            href={`/kategorie/${cat.slug}`}
                            className="block px-4 py-2.5 text-xs font-sans text-text-secondary hover:text-brand-fire hover:bg-surface-base transition-colors border-b border-border-subtle/50 last:border-0"
                          >
                            {sub}
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
        <div className="fixed inset-0 z-40 bg-white overflow-y-auto md:hidden pt-16">
          <div className="p-6">
            <p className="text-[10px] font-sans font-bold tracking-[0.15em] uppercase text-text-muted mb-4">
              Kategorien
            </p>
            <ul className="space-y-0">
              {NAV_CATEGORIES.map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/kategorie/${cat.slug}`}
                    className="block py-4 border-b border-border-subtle font-serif text-xl text-text-primary hover:text-brand-fire transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-8 space-y-4">
              <Link
                href="/vergleich/fleischthermometer"
                className="block text-sm font-sans font-semibold text-text-secondary hover:text-brand-fire transition-colors"
              >
                Produkttests &amp; Vergleiche
              </Link>
              <Link
                href="/diplome"
                className="inline-flex items-center gap-2 bg-brand-gold text-white font-sans text-sm font-bold tracking-wide uppercase px-5 py-3 hover:bg-[#d4891a] transition-colors"
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
