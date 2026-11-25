import { Info, Play, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Movie } from '../types/movie';
import { MovieImage } from './MovieImage';

interface HeroSectionProps {
  featuredMovies: Movie[];
  onWatchMovie: (movie: Movie) => void;
  onSelectMovie: (movieId: string) => void;
}

export function HeroSection({
  featuredMovies,
  onWatchMovie,
  onSelectMovie,
}: HeroSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [featuredMovies.length]);

  useEffect(() => {
    if (featuredMovies.length <= 1) return;
    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % featuredMovies.length);
    }, 8000);
    return () => window.clearInterval(timer);
  }, [featuredMovies.length]);

  if (featuredMovies.length === 0) {
    return (
      <section className="relative flex min-h-[420px] items-center border-b border-white/10 bg-[#0D0D10] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-medium tracking-wider text-[#E50914] uppercase">
            Featured Premiere
          </p>
          <h1 className="mt-2 max-w-2xl font-display text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
            Curated Cinema, Managed Seamlessly
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-neutral-300">
            Browse the catalog below or sign in to the Admin Studio to publish featured films.
          </p>
        </div>
      </section>
    );
  }

  const activeMovie = featuredMovies[activeIndex] ?? featuredMovies[0];
  const heroSrc = activeMovie.backdrop || activeMovie.poster;

  return (
    <section className="relative overflow-hidden border-b border-white/10 bg-[#08080A]">
      <div className="relative min-h-[520px] w-full sm:min-h-[580px] lg:min-h-[620px]">
        {/* Background Image */}
        <div className="absolute inset-0">
          <MovieImage
            src={heroSrc}
            alt={`${activeMovie.title} featured backdrop`}
            title={activeMovie.title}
            className="h-full w-full object-cover object-center transition-opacity duration-500"
          />
          {/* Measured Scrims ensuring >= 4.5:1 text contrast */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#08080A] via-[#08080A]/80 to-[#08080A]/25" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#08080A] via-transparent to-[#08080A]/50" />
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 mx-auto flex min-h-[520px] max-w-7xl flex-col justify-end px-4 pb-12 pt-20 sm:min-h-[580px] sm:px-6 sm:pb-16 lg:min-h-[620px] lg:px-8">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-2.5 text-sm font-medium text-neutral-300">
              <span className="font-semibold text-[#E50914]">Featured Selection</span>
              <span aria-hidden="true" className="text-neutral-600">
                ·
              </span>
              <span>{activeMovie.genre}</span>
              <span aria-hidden="true" className="text-neutral-600">
                ·
              </span>
              <span className="font-mono tabular-nums">{activeMovie.releaseYear}</span>
              <span aria-hidden="true" className="text-neutral-600">
                ·
              </span>
              <span className="inline-flex items-center gap-1 font-mono tabular-nums text-amber-400">
                <Star className="h-3.5 w-3.5 fill-amber-400" />
                {activeMovie.rating.toFixed(1)}
              </span>
            </div>

            <h1
              className="mt-3 font-display font-extrabold tracking-tight text-white"
              style={{
                fontSize: 'clamp(2.25rem, 4.5vw, 4rem)',
                lineHeight: 1.05,
                textWrap: 'balance',
              }}
            >
              {activeMovie.title}
            </h1>

            <p className="mt-4 line-clamp-3 max-w-xl text-base leading-relaxed text-neutral-300">
              {activeMovie.description}
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => onWatchMovie(activeMovie)}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-md bg-[#E50914] px-6 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-[#F41B26] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E50914]"
              >
                <Play className="h-4 w-4 fill-white" />
                Watch Feature
              </button>

              <button
                type="button"
                onClick={() => onSelectMovie(activeMovie._id)}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-md border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-colors duration-150 hover:bg-white/20 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-white"
              >
                <Info className="h-4 w-4" />
                More Details
              </button>
            </div>
          </div>

          {featuredMovies.length > 1 && (
            <div className="mt-8 flex items-center gap-2" aria-label="Featured film selector">
              {featuredMovies.map((item, idx) => (
                <button
                  key={item._id}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  aria-label={`Select featured movie: ${item.title}`}
                  className={`h-1.5 rounded-sm transition-all duration-200 ${
                    idx === activeIndex ? 'w-10 bg-[#E50914]' : 'w-4 bg-white/30 hover:bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
