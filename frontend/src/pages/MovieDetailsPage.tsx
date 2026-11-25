import { ArrowLeft, Pencil, Play, Star, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import { MovieCard } from '../components/MovieCard';
import { MovieFormModal } from '../components/MovieFormModal';
import { MovieImage } from '../components/MovieImage';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import type { Category, Movie, MovieFormData } from '../types/movie';

interface MovieDetailsPageProps {
  movieId: string;
  onBack: () => void;
  onSelectMovie: (movieId: string) => void;
  onWatchMovie: (movie: Movie) => void;
}

export function MovieDetailsPage({
  movieId,
  onBack,
  onSelectMovie,
  onWatchMovie,
}: MovieDetailsPageProps) {
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [movie, setMovie] = useState<Movie | null>(null);
  const [relatedMovies, setRelatedMovies] = useState<Movie[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editOpen, setEditOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadMovie = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [detailRes, catRes] = await Promise.all([
        api.getMovieById(movieId),
        api.getCategories(),
      ]);
      setMovie(detailRes.movie);
      setRelatedMovies(detailRes.relatedMovies);
      setCategories(catRes.categories);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load movie details.');
    } finally {
      setLoading(false);
    }
  }, [movieId]);

  useEffect(() => {
    loadMovie();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [loadMovie]);

  const handleUpdate = async (data: MovieFormData) => {
    if (!movie) return;
    setIsSaving(true);
    try {
      const res = await api.updateMovie(movie._id, data);
      setMovie(res.movie);
      setEditOpen(false);
      showToast(res.message || 'Movie updated successfully.', 'success');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update movie.';
      showToast(message, 'error');
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!movie) return;
    setIsDeleting(true);
    try {
      const res = await api.deleteMovie(movie._id);
      showToast(res.message || 'Movie deleted.', 'success');
      setDeleteOpen(false);
      onBack();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to delete movie.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="h-8 w-36 animate-pulse rounded bg-white/10" />
        <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-12">
          <div className="aspect-[3/4] animate-pulse rounded-lg bg-[#111115] md:col-span-4" />
          <div className="space-y-4 md:col-span-8">
            <div className="h-12 w-2/3 animate-pulse rounded bg-white/10" />
            <div className="h-5 w-1/3 animate-pulse rounded bg-white/5" />
            <div className="h-28 w-full animate-pulse rounded bg-white/5" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl font-bold text-white">Movie Unavailable</h1>
        <p className="mt-3 text-sm text-neutral-400">
          {error ?? 'The requested title could not be found in the catalog.'}
        </p>
        <button
          type="button"
          onClick={onBack}
          className="mt-6 inline-flex min-h-[42px] items-center gap-2 rounded-md bg-[#E50914] px-5 py-2 text-xs font-semibold text-white hover:bg-[#F41B26]"
        >
          <ArrowLeft className="h-4 w-4" />
          Return to Catalog
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Cinematic Backdrop Header */}
      <div className="relative overflow-hidden border-b border-white/10 bg-[#08080A]">
        <div className="absolute inset-0">
          <MovieImage
            src={movie.backdrop || movie.poster}
            alt={`${movie.title} backdrop`}
            title={movie.title}
            className="h-full w-full object-cover opacity-35 blur-[2px]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#08080A] via-[#08080A]/85 to-[#08080A]/65" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex min-h-[40px] items-center gap-2 rounded-md border border-white/15 bg-black/50 px-3.5 py-1.5 text-xs font-semibold text-neutral-200 backdrop-blur-sm transition-colors hover:border-white/30 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Catalog
          </button>

          <div className="mt-8 grid grid-cols-1 items-start gap-8 md:grid-cols-12 lg:gap-12">
            <div className="md:col-span-4 lg:col-span-3">
              <div className="aspect-[3/4] overflow-hidden rounded-lg border border-white/15 bg-[#111115] shadow-2xl">
                <MovieImage
                  src={movie.poster}
                  alt={`${movie.title} poster`}
                  title={movie.title}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            <div className="md:col-span-8 lg:col-span-9">
              <div className="flex flex-wrap items-center gap-2.5 text-sm font-medium text-neutral-300">
                <span className="text-[#E50914] font-semibold">{movie.genre}</span>
                <span aria-hidden="true" className="text-neutral-600">
                  ·
                </span>
                <span className="font-mono tabular-nums">{movie.releaseYear}</span>
                <span aria-hidden="true" className="text-neutral-600">
                  ·
                </span>
                <span className="inline-flex items-center gap-1 font-mono tabular-nums text-amber-400">
                  <Star className="h-3.5 w-3.5 fill-amber-400" />
                  {movie.rating.toFixed(1)} / 10
                </span>
                {movie.featured && (
                  <>
                    <span aria-hidden="true" className="text-neutral-600">
                      ·
                    </span>
                    <span className="text-neutral-300">Featured</span>
                  </>
                )}
                {movie.trending && (
                  <>
                    <span aria-hidden="true" className="text-neutral-600">
                      ·
                    </span>
                    <span className="text-neutral-300">Trending</span>
                  </>
                )}
              </div>

              <h1
                className="mt-3 font-display font-extrabold tracking-tight text-white"
                style={{
                  fontSize: 'clamp(2.25rem, 4vw, 3.75rem)',
                  lineHeight: 1.05,
                  textWrap: 'balance',
                }}
              >
                {movie.title}
              </h1>

              <p className="mt-5 max-w-3xl text-base leading-relaxed text-neutral-200">
                {movie.description}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => onWatchMovie(movie)}
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-md bg-[#E50914] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#F41B26]"
                >
                  <Play className="h-4 w-4 fill-white" />
                  Watch Feature
                </button>

                {isAuthenticated && (
                  <>
                    <button
                      type="button"
                      onClick={() => setEditOpen(true)}
                      className="inline-flex min-h-[44px] items-center gap-2 rounded-md border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/20"
                    >
                      <Pencil className="h-4 w-4" />
                      Edit Movie
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeleteOpen(true)}
                      className="inline-flex min-h-[44px] items-center gap-2 rounded-md border border-red-500/40 bg-red-950/40 px-4 py-2.5 text-sm font-semibold text-red-200 transition-colors hover:bg-red-900/60"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete Movie
                    </button>
                  </>
                )}
              </div>

              <dl className="mt-10 grid grid-cols-2 gap-6 border-t border-white/10 pt-6 sm:grid-cols-4">
                <div>
                  <dt className="text-xs text-neutral-400">Genre</dt>
                  <dd className="mt-1 text-sm font-semibold text-white">{movie.genre}</dd>
                </div>
                <div>
                  <dt className="text-xs text-neutral-400">Release Year</dt>
                  <dd className="mt-1 font-mono text-sm font-semibold tabular-nums text-white">
                    {movie.releaseYear}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-neutral-400">Audience Score</dt>
                  <dd className="mt-1 font-mono text-sm font-semibold tabular-nums text-white">
                    {movie.rating.toFixed(1)} / 10
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-neutral-400">Catalog Added</dt>
                  <dd className="mt-1 font-mono text-sm font-semibold tabular-nums text-white">
                    {new Date(movie.createdAt).toLocaleDateString()}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Related Movies */}
      {relatedMovies.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl font-bold tracking-tight text-white">
            More in {movie.genre}
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {relatedMovies.map((item) => (
              <MovieCard key={item._id} movie={item} onSelect={onSelectMovie} />
            ))}
          </div>
        </section>
      )}

      <MovieFormModal
        isOpen={editOpen}
        editingMovie={movie}
        categories={categories}
        isSubmitting={isSaving}
        onClose={() => setEditOpen(false)}
        onSubmit={handleUpdate}
      />

      <DeleteConfirmModal
        isOpen={deleteOpen}
        title="Delete Movie"
        itemName={movie.title}
        description="Are you sure you want to permanently remove"
        confirmLabel="Delete Movie"
        isDeleting={isDeleting}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
