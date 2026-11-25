import { Film, RotateCcw } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { CategoryFilterBar, type SortOption } from '../components/CategoryFilterBar';
import { HeroSection } from '../components/HeroSection';
import { MovieCard } from '../components/MovieCard';
import { Pagination } from '../components/Pagination';
import { api } from '../services/api';
import type { Category, Movie, PaginationInfo } from '../types/movie';

interface HomePageProps {
  initialSection?: 'trending' | 'catalog';
  onSelectMovie: (movieId: string) => void;
  onWatchMovie: (movie: Movie) => void;
}

export function HomePage({
  initialSection,
  onSelectMovie,
  onWatchMovie,
}: HomePageProps) {
  const [featuredMovies, setFeaturedMovies] = useState<Movie[]>([]);
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [catalogMovies, setCatalogMovies] = useState<Movie[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 8,
    total: 0,
    totalPages: 1,
  });

  const [selectedGenre, setSelectedGenre] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [currentPage, setCurrentPage] = useState(1);

  const [loadingHighlights, setLoadingHighlights] = useState(true);
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const trendingRef = useRef<HTMLElement | null>(null);
  const catalogRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 250);
    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (initialSection === 'trending' && trendingRef.current) {
      trendingRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (initialSection === 'catalog' && catalogRef.current) {
      catalogRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [initialSection]);

  const loadHighlights = useCallback(async () => {
    setLoadingHighlights(true);
    try {
      const [featuredRes, trendingRes, categoriesRes] = await Promise.all([
        api.getMovies({ featured: true, limit: 5, sort: 'rating' }),
        api.getMovies({ trending: true, limit: 4, sort: 'rating' }),
        api.getCategories(),
      ]);

      setFeaturedMovies(featuredRes.movies);
      setTrendingMovies(trendingRes.movies);
      setCategories(categoriesRes.categories);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load featured catalog.');
    } finally {
      setLoadingHighlights(false);
    }
  }, []);

  const loadCatalog = useCallback(async () => {
    setLoadingCatalog(true);
    setError(null);
    try {
      const res = await api.getMovies({
        search: debouncedSearch,
        genre: selectedGenre,
        sort: sortBy,
        page: currentPage,
        limit: 8,
      });
      setCatalogMovies(res.movies);
      setPagination(res.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load movies.');
    } finally {
      setLoadingCatalog(false);
    }
  }, [debouncedSearch, selectedGenre, sortBy, currentPage]);

  useEffect(() => {
    loadHighlights();
  }, [loadHighlights]);

  useEffect(() => {
    loadCatalog();
  }, [loadCatalog]);

  const handleGenreSelect = (genre: string) => {
    setSelectedGenre(genre);
    setCurrentPage(1);
  };

  const handleSortChange = (sort: SortOption) => {
    setSortBy(sort);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSelectedGenre('All');
    setSearchQuery('');
    setDebouncedSearch('');
    setSortBy('newest');
    setCurrentPage(1);
  };

  return (
    <div>
      {loadingHighlights ? (
        <div className="h-[520px] w-full animate-pulse border-b border-white/10 bg-[#111115]" />
      ) : (
        <HeroSection
          featuredMovies={featuredMovies.length > 0 ? featuredMovies : catalogMovies.slice(0, 3)}
          onWatchMovie={onWatchMovie}
          onSelectMovie={onSelectMovie}
        />
      )}

      {/* Trending Movies Row */}
      {(loadingHighlights || trendingMovies.length > 0) && (
        <section
          ref={trendingRef}
          id="trending"
          className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8"
        >
          <div className="mb-6 flex items-baseline justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Trending Now
              </h2>
              <p className="mt-1 text-sm text-neutral-400">
                Most-watched films across the catalog this week.
              </p>
            </div>
          </div>

          {loadingHighlights ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div
                  key={idx}
                  className="aspect-[3/4] animate-pulse rounded-lg border border-white/10 bg-[#111115]"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {trendingMovies.map((movie) => (
                <MovieCard key={movie._id} movie={movie} onSelect={onSelectMovie} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Full Searchable & Filterable Catalog */}
      <section
        ref={catalogRef}
        id="catalog"
        className="mx-auto max-w-7xl border-t border-white/10 px-4 py-12 sm:px-6 lg:px-8"
      >
        <div className="mb-6">
          <h2 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Browse All Movies
          </h2>
          <p className="mt-1 text-sm text-neutral-400">
            Search by title or filter across curated cinema genres.
          </p>
        </div>

        <CategoryFilterBar
          categories={categories}
          selectedGenre={selectedGenre}
          onSelectGenre={handleGenreSelect}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortBy={sortBy}
          onSortChange={handleSortChange}
        />

        {error && (
          <div className="mt-8 rounded-lg border border-red-500/40 bg-[#1A0D10] p-6 text-center">
            <p className="text-sm font-medium text-red-200">{error}</p>
            <button
              type="button"
              onClick={loadCatalog}
              className="mt-4 inline-flex items-center gap-2 rounded-md bg-[#E50914] px-4 py-2 text-xs font-semibold text-white hover:bg-[#F41B26]"
            >
              Retry
            </button>
          </div>
        )}

        {!error && loadingCatalog && (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div
                key={idx}
                className="flex flex-col overflow-hidden rounded-lg border border-white/10 bg-[#111115]"
              >
                <div className="aspect-[3/4] animate-pulse bg-[#18181F]" />
                <div className="space-y-2 p-4">
                  <div className="h-5 w-3/4 animate-pulse rounded bg-white/10" />
                  <div className="h-3.5 w-1/2 animate-pulse rounded bg-white/5" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!error && !loadingCatalog && catalogMovies.length === 0 && (
          <div className="mt-10 rounded-xl border border-white/10 bg-[#111115] px-6 py-16 text-center">
            <Film className="mx-auto h-10 w-10 text-neutral-500" />
            <h3 className="mt-4 font-display text-2xl font-bold text-white">
              No matching movies found
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-neutral-400">
              No titles matched your current search or category selection. Try clearing your filters to view the complete collection.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="mt-6 inline-flex min-h-[42px] items-center gap-2 rounded-md bg-[#E50914] px-5 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#F41B26]"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset Filters
            </button>
          </div>
        )}

        {!error && !loadingCatalog && catalogMovies.length > 0 && (
          <>
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {catalogMovies.map((movie) => (
                <MovieCard key={movie._id} movie={movie} onSelect={onSelectMovie} />
              ))}
            </div>
            <Pagination pagination={pagination} onPageChange={setCurrentPage} />
          </>
        )}
      </section>
    </div>
  );
}
