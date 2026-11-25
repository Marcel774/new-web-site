import { Search, X } from 'lucide-react';
import type { Category } from '../types/movie';

export type SortOption = 'newest' | 'rating' | 'year' | 'title';

interface CategoryFilterBarProps {
  categories: Category[];
  selectedGenre: string;
  onSelectGenre: (genre: string) => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  sortBy: SortOption;
  onSortChange: (value: SortOption) => void;
}

export function CategoryFilterBar({
  categories,
  selectedGenre,
  onSelectGenre,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
}: CategoryFilterBarProps) {
  const categoryNames = ['All', ...categories.map((c) => c.name)];

  return (
    <div className="flex flex-col gap-4 border-b border-white/10 pb-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Search Bar */}
        <div className="relative w-full lg:max-w-md">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search movies by title..."
            aria-label="Search movies by title"
            className="h-11 w-full rounded-md border border-white/15 bg-[#111115] pl-10 pr-10 text-sm text-white placeholder-neutral-500 transition-colors focus:border-[#E50914] focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label="Clear search query"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-neutral-400 hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Sort Selector */}
        <div className="flex items-center gap-3">
          <label htmlFor="catalog-sort" className="text-xs font-medium text-neutral-400 whitespace-nowrap">
            Sort by
          </label>
          <select
            id="catalog-sort"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="h-11 rounded-md border border-white/15 bg-[#111115] px-3 text-sm text-white focus:border-[#E50914] focus:outline-none"
          >
            <option value="newest">Recently Added</option>
            <option value="rating">Highest Rated</option>
            <option value="year">Release Year</option>
            <option value="title">Title (A–Z)</option>
          </select>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div
        role="tablist"
        aria-label="Filter movies by category"
        className="flex flex-wrap items-center gap-2"
      >
        {categoryNames.map((genre) => {
          const isActive = selectedGenre.toLowerCase() === genre.toLowerCase();
          return (
            <button
              key={genre}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onSelectGenre(genre)}
              className={`min-h-[40px] rounded-md px-4 py-1.5 text-xs font-semibold transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#E50914] ${
                isActive
                  ? 'bg-[#E50914] text-white'
                  : 'border border-white/10 bg-[#111115] text-neutral-300 hover:border-white/25 hover:text-white'
              }`}
            >
              {genre}
            </button>
          );
        })}
      </div>
    </div>
  );
}
