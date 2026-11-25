import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export type AppRoute =
  | { name: 'home'; section?: 'trending' | 'catalog' }
  | { name: 'movie'; id: string }
  | { name: 'admin' };

interface NavbarProps {
  route: AppRoute;
  onNavigate: (route: AppRoute) => void;
}

export function Navbar({ route, onNavigate }: NavbarProps) {
  const { isAuthenticated } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const goTo = (target: AppRoute) => {
    setMobileOpen(false);
    onNavigate(target);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#08080A]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#home"
          onClick={(e) => {
            e.preventDefault();
            goTo({ name: 'home' });
          }}
          className="font-display text-2xl font-extrabold tracking-tight text-white whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#E50914]"
        >
          MOVIE<span className="text-[#E50914]">FLIX</span>
        </a>

        {/* Zone 2: Concise single-line navigation links */}
        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-neutral-300"
        >
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              goTo({ name: 'home' });
            }}
            className={`whitespace-nowrap shrink-0 border-b-2 py-1 transition-colors duration-150 ${
              route.name === 'home' && !route.section
                ? 'border-[#E50914] text-white'
                : 'border-transparent hover:border-white/40 hover:text-white'
            }`}
          >
            Home
          </a>
          <a
            href="#trending"
            onClick={(e) => {
              e.preventDefault();
              goTo({ name: 'home', section: 'trending' });
            }}
            className={`whitespace-nowrap shrink-0 border-b-2 py-1 transition-colors duration-150 ${
              route.name === 'home' && route.section === 'trending'
                ? 'border-[#E50914] text-white'
                : 'border-transparent hover:border-white/40 hover:text-white'
            }`}
          >
            Trending
          </a>
          <a
            href="#catalog"
            onClick={(e) => {
              e.preventDefault();
              goTo({ name: 'home', section: 'catalog' });
            }}
            className={`whitespace-nowrap shrink-0 border-b-2 py-1 transition-colors duration-150 ${
              route.name === 'home' && route.section === 'catalog'
                ? 'border-[#E50914] text-white'
                : 'border-transparent hover:border-white/40 hover:text-white'
            }`}
          >
            Catalog
          </a>
          <a
            href="#admin"
            onClick={(e) => {
              e.preventDefault();
              goTo({ name: 'admin' });
            }}
            className={`whitespace-nowrap shrink-0 border-b-2 py-1 transition-colors duration-150 ${
              route.name === 'admin'
                ? 'border-[#E50914] text-white'
                : 'border-transparent hover:border-white/40 hover:text-white'
            }`}
          >
            Admin
          </a>
        </nav>

        {/* Zone 3: Single primary action button */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => goTo({ name: 'admin' })}
            className="hidden sm:inline-flex items-center justify-center rounded-md bg-[#E50914] px-4 py-2 text-xs font-semibold text-white transition-colors duration-150 hover:bg-[#F41B26] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E50914]"
          >
            {isAuthenticated ? 'Studio Console' : 'Admin Sign In'}
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-white/10 text-neutral-200 transition-colors hover:bg-white/5 hover:text-white md:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="border-t border-white/10 bg-[#0D0D10] px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-1">
            <button
              type="button"
              onClick={() => goTo({ name: 'home' })}
              className="flex min-h-[44px] items-center rounded-md px-3 text-left text-sm font-medium text-neutral-200 hover:bg-white/5 hover:text-white"
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => goTo({ name: 'home', section: 'trending' })}
              className="flex min-h-[44px] items-center rounded-md px-3 text-left text-sm font-medium text-neutral-200 hover:bg-white/5 hover:text-white"
            >
              Trending
            </button>
            <button
              type="button"
              onClick={() => goTo({ name: 'home', section: 'catalog' })}
              className="flex min-h-[44px] items-center rounded-md px-3 text-left text-sm font-medium text-neutral-200 hover:bg-white/5 hover:text-white"
            >
              Catalog
            </button>
            <button
              type="button"
              onClick={() => goTo({ name: 'admin' })}
              className="mt-2 flex min-h-[44px] items-center justify-center rounded-md bg-[#E50914] px-4 text-sm font-semibold text-white hover:bg-[#F41B26]"
            >
              {isAuthenticated ? 'Studio Console' : 'Admin Sign In'}
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
