import type { AppRoute } from './Navbar';

interface FooterProps {
  onNavigate: (route: AppRoute) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="border-t border-white/10 bg-[#060608]">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div>
          <span className="font-display text-xl font-extrabold tracking-tight text-white">
            MOVIE<span className="text-[#E50914]">FLIX</span>
          </span>
          <p className="mt-1 text-xs text-neutral-400">
            Curated cinema catalog and MongoDB studio management.
          </p>
        </div>

        <nav className="flex flex-wrap items-center gap-6 text-xs font-medium text-neutral-400">
          <button
            type="button"
            onClick={() => onNavigate({ name: 'home' })}
            className="hover:text-white transition-colors"
          >
            Home
          </button>
          <button
            type="button"
            onClick={() => onNavigate({ name: 'home', section: 'trending' })}
            className="hover:text-white transition-colors"
          >
            Trending
          </button>
          <button
            type="button"
            onClick={() => onNavigate({ name: 'home', section: 'catalog' })}
            className="hover:text-white transition-colors"
          >
            Catalog
          </button>
          <button
            type="button"
            onClick={() => onNavigate({ name: 'admin' })}
            className="hover:text-white transition-colors"
          >
            Admin Studio
          </button>
        </nav>

        <p className="text-xs text-neutral-500">
          &copy; {new Date().getFullYear()} MOVIEFLIX. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
