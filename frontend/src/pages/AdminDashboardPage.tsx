import { Eye, LogOut, Pencil, Plus, Search, Star, Trash2 } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import { MovieFormModal } from '../components/MovieFormModal';
import { MovieImage } from '../components/MovieImage';
import { Pagination } from '../components/Pagination';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import type {
  CatalogStats,
  Category,
  Movie,
  MovieFormData,
  PaginationInfo,
} from '../types/movie';

interface AdminDashboardPageProps {
  onSelectMovie: (movieId: string) => void;
}

export function AdminDashboardPage({ onSelectMovie }: AdminDashboardPageProps) {
  const { admin, logout } = useAuth();
  const { showToast } = useToast();

  const [movies, setMovies] = useState<Movie[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<CatalogStats>({
    totalMovies: 0,
    averageRating: 0,
    featuredCount: 0,
    trendingCount: 0,
  });
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterGenre, setFilterGenre] = useState('All');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [isSavingMovie, setIsSavingMovie] = useState(false);

  const [movieToDelete, setMovieToDelete] = useState<Movie | null>(null);
  const [isDeletingMovie, setIsDeletingMovie] = useState(false);

  const [newCategoryName, setNewCategoryName] = useState('');
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [isDeletingCategory, setIsDeletingCategory] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 250);
    return () => window.clearTimeout(timer);
  }, [search]);

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [moviesRes, categoriesRes] = await Promise.all([
        api.getMovies({
          search: debouncedSearch,
          genre: filterGenre,
          page,
          limit: 10,
          sort: 'newest',
        }),
        api.getCategories(),
      ]);
      setMovies(moviesRes.movies);
      setPagination(moviesRes.pagination);
      setStats(moviesRes.stats);
      setCategories(categoriesRes.categories);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Unable to load dashboard data.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, filterGenre, page, showToast]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleOpenAddModal = () => {
    setEditingMovie(null);
    setFormOpen(true);
  };

  const handleOpenEditModal = (movie: Movie) => {
    setEditingMovie(movie);
    setFormOpen(true);
  };

  const handleSaveMovie = async (data: MovieFormData) => {
    setIsSavingMovie(true);
    try {
      if (editingMovie) {
        const res = await api.updateMovie(editingMovie._id, data);
        showToast(res.message || 'Movie updated.', 'success');
      } else {
        const res = await api.createMovie(data);
        showToast(res.message || 'Movie created.', 'success');
      }
      setFormOpen(false);
      setEditingMovie(null);
      await loadDashboardData();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save movie.';
      showToast(msg, 'error');
      throw err;
    } finally {
      setIsSavingMovie(false);
    }
  };

  const handleConfirmDeleteMovie = async () => {
    if (!movieToDelete) return;
    setIsDeletingMovie(true);
    try {
      const res = await api.deleteMovie(movieToDelete._id);
      showToast(res.message || 'Movie deleted.', 'success');
      setMovieToDelete(null);
      await loadDashboardData();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to delete movie.', 'error');
    } finally {
      setIsDeletingMovie(false);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;
    setIsCreatingCategory(true);
    try {
      const res = await api.createCategory(trimmed);
      showToast(res.message || 'Category created.', 'success');
      setNewCategoryName('');
      await loadDashboardData();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to add category.', 'error');
    } finally {
      setIsCreatingCategory(false);
    }
  };

  const handleConfirmDeleteCategory = async () => {
    if (!categoryToDelete) return;
    setIsDeletingCategory(true);
    try {
      const res = await api.deleteCategory(categoryToDelete._id);
      showToast(res.message || 'Category deleted.', 'success');
      setCategoryToDelete(null);
      if (filterGenre.toLowerCase() === categoryToDelete.name.toLowerCase()) {
        setFilterGenre('All');
      }
      await loadDashboardData();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to delete category.', 'error');
      setCategoryToDelete(null);
    } finally {
      setIsDeletingCategory(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Studio Header */}
      <div className="flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-wider text-[#E50914] uppercase">
            Admin Studio
          </p>
          <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Catalog Management
          </h1>
          {admin && (
            <p className="mt-1 text-sm text-neutral-400">
              Signed in as <span className="font-medium text-neutral-200">{admin.name}</span> (
              {admin.email})
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="inline-flex min-h-[42px] items-center gap-2 rounded-md bg-[#E50914] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#F41B26] whitespace-nowrap shrink-0"
          >
            <Plus className="h-4 w-4" />
            Add Movie
          </button>

          <button
            type="button"
            onClick={() => {
              logout();
              showToast('Signed out of Admin Studio.', 'success');
            }}
            className="inline-flex min-h-[42px] items-center gap-2 rounded-md border border-white/15 bg-[#111115] px-4 py-2 text-xs font-semibold text-neutral-300 transition-colors hover:border-white/30 hover:text-white whitespace-nowrap shrink-0"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Summary Metric Strip */}
      <div className="mt-8 grid grid-cols-2 divide-y divide-white/10 overflow-hidden rounded-lg border border-white/10 bg-[#111115] sm:grid-cols-4 sm:divide-x sm:divide-y-0">
        <div className="p-5">
          <p className="text-xs font-medium text-neutral-400">Total Movies</p>
          <p className="mt-2 font-mono text-3xl font-bold tabular-nums text-white">
            {stats.totalMovies}
          </p>
        </div>
        <div className="p-5">
          <p className="text-xs font-medium text-neutral-400">Categories</p>
          <p className="mt-2 font-mono text-3xl font-bold tabular-nums text-white">
            {categories.length}
          </p>
        </div>
        <div className="p-5">
          <p className="text-xs font-medium text-neutral-400">Featured Titles</p>
          <p className="mt-2 font-mono text-3xl font-bold tabular-nums text-white">
            {stats.featuredCount}
          </p>
        </div>
        <div className="p-5">
          <p className="text-xs font-medium text-neutral-400">Average Rating</p>
          <p className="mt-2 font-mono text-3xl font-bold tabular-nums text-amber-400">
            {stats.averageRating.toFixed(1)}
          </p>
        </div>
      </div>

      {/* Movies Table Section */}
      <section className="mt-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-display text-2xl font-bold text-white">Movies Inventory</h2>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search title..."
                aria-label="Search movies in dashboard"
                className="h-10 w-full rounded-md border border-white/15 bg-[#111115] pl-9 pr-3 text-sm text-white placeholder-neutral-500 focus:border-[#E50914] focus:outline-none"
              />
            </div>

            <select
              value={filterGenre}
              onChange={(e) => {
                setFilterGenre(e.target.value);
                setPage(1);
              }}
              aria-label="Filter dashboard movies by category"
              className="h-10 rounded-md border border-white/15 bg-[#111115] px-3 text-sm text-white focus:border-[#E50914] focus:outline-none"
            >
              <option value="All">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto rounded-lg border border-white/10 bg-[#111115]">
          <table className="w-full min-w-[760px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-[#0D0D10] text-xs font-semibold text-neutral-400">
                <th className="px-4 py-3.5">Movie</th>
                <th className="px-4 py-3.5">Genre</th>
                <th className="px-4 py-3.5 text-right">Year</th>
                <th className="px-4 py-3.5 text-right">Rating</th>
                <th className="px-4 py-3.5">Placement</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {loading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx}>
                    <td className="px-4 py-3.5" colSpan={6}>
                      <div className="h-10 w-full animate-pulse rounded bg-white/5" />
                    </td>
                  </tr>
                ))
              ) : movies.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-neutral-400">
                    No movies match the current filter. Click &ldquo;Add Movie&rdquo; to publish a new title.
                  </td>
                </tr>
              ) : (
                movies.map((movie) => {
                  const flags = [
                    movie.featured ? 'Featured' : null,
                    movie.trending ? 'Trending' : null,
                  ].filter(Boolean);

                  return (
                    <tr
                      key={movie._id}
                      className="transition-colors hover:bg-white/[0.03]"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-9 shrink-0 overflow-hidden rounded border border-white/10 bg-[#08080A]">
                            <MovieImage
                              src={movie.poster}
                              alt={movie.title}
                              title={movie.title}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-white">{movie.title}</p>
                            <p className="max-w-xs truncate text-xs text-neutral-400">
                              {movie.description}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-neutral-300">{movie.genre}</td>
                      <td className="px-4 py-3 text-right font-mono tabular-nums text-neutral-300">
                        {movie.releaseYear}
                      </td>
                      <td className="px-4 py-3 text-right font-mono tabular-nums text-amber-400">
                        <span className="inline-flex items-center justify-end gap-1">
                          <Star className="h-3.5 w-3.5 fill-amber-400" />
                          {movie.rating.toFixed(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-neutral-400">
                        {flags.length > 0 ? flags.join(' · ') : 'Catalog'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onSelectMovie(movie._id)}
                            title="View movie page"
                            aria-label={`View ${movie.title}`}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/10 text-neutral-300 transition-colors hover:border-white/30 hover:text-white"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(movie)}
                            title="Edit movie"
                            aria-label={`Edit ${movie.title}`}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/10 text-neutral-300 transition-colors hover:border-white/30 hover:text-white"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setMovieToDelete(movie)}
                            title="Delete movie"
                            aria-label={`Delete ${movie.title}`}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-red-500/30 text-red-400 transition-colors hover:bg-red-950/60 hover:text-red-200"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <Pagination pagination={pagination} onPageChange={setPage} />
      </section>

      {/* Category Management Section */}
      <section className="mt-12 border-t border-white/10 pt-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 className="font-display text-2xl font-bold text-white">Manage Categories</h2>
            <p className="mt-1.5 text-sm text-neutral-400">
              Create genres for organizing the catalog. Categories with zero assigned movies can be removed.
            </p>

            <form onSubmit={handleAddCategory} className="mt-5 flex gap-2.5">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="New category name (e.g. Sci-Fi)"
                aria-label="New category name"
                required
                minLength={2}
                maxLength={50}
                className="h-11 flex-1 rounded-md border border-white/15 bg-[#111115] px-3.5 text-sm text-white placeholder-neutral-500 focus:border-[#E50914] focus:outline-none"
              />
              <button
                type="submit"
                disabled={isCreatingCategory}
                className="min-h-[44px] rounded-md bg-[#E50914] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#F41B26] disabled:opacity-50 whitespace-nowrap shrink-0"
              >
                {isCreatingCategory ? 'Adding...' : 'Add Category'}
              </button>
            </form>
          </div>

          <div className="lg:col-span-7">
            <div className="overflow-hidden rounded-lg border border-white/10 bg-[#111115]">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-[#0D0D10] text-xs font-semibold text-neutral-400">
                    <th className="px-4 py-3">Category Name</th>
                    <th className="px-4 py-3 text-right">Assigned Movies</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {categories.map((cat) => (
                    <tr key={cat._id} className="hover:bg-white/[0.02]">
                      <td className="px-4 py-3 font-medium text-white">{cat.name}</td>
                      <td className="px-4 py-3 text-right font-mono tabular-nums text-neutral-300">
                        {cat.movieCount}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => setCategoryToDelete(cat)}
                          className="inline-flex h-8 items-center gap-1 rounded-md border border-red-500/30 px-2.5 text-xs font-semibold text-red-400 transition-colors hover:bg-red-950/50 hover:text-red-200"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <MovieFormModal
        isOpen={formOpen}
        editingMovie={editingMovie}
        categories={categories}
        isSubmitting={isSavingMovie}
        onClose={() => {
          setFormOpen(false);
          setEditingMovie(null);
        }}
        onSubmit={handleSaveMovie}
      />

      <DeleteConfirmModal
        isOpen={Boolean(movieToDelete)}
        title="Confirm Movie Deletion"
        itemName={movieToDelete?.title ?? ''}
        description="This will permanently delete the movie record from MongoDB. Are you sure you want to remove"
        confirmLabel="Delete Movie"
        isDeleting={isDeletingMovie}
        onCancel={() => setMovieToDelete(null)}
        onConfirm={handleConfirmDeleteMovie}
      />

      <DeleteConfirmModal
        isOpen={Boolean(categoryToDelete)}
        title="Confirm Category Deletion"
        itemName={categoryToDelete?.name ?? ''}
        description="Are you sure you want to remove the category"
        confirmLabel="Delete Category"
        isDeleting={isDeletingCategory}
        onCancel={() => setCategoryToDelete(null)}
        onConfirm={handleConfirmDeleteCategory}
      />
    </div>
  );
}
