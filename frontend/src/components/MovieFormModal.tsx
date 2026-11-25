import { Upload, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import type { Category, Movie, MovieFormData } from '../types/movie';
import { MovieImage } from './MovieImage';

interface MovieFormModalProps {
  isOpen: boolean;
  editingMovie: Movie | null;
  categories: Category[];
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (data: MovieFormData) => Promise<void>;
}

const DEFAULT_FORM: MovieFormData = {
  title: '',
  description: '',
  genre: 'Action',
  releaseYear: new Date().getFullYear(),
  rating: 8.0,
  poster: '',
  backdrop: '',
  videoUrl: '',
  featured: false,
  trending: false,
};

export function MovieFormModal({
  isOpen,
  editingMovie,
  categories,
  isSubmitting,
  onClose,
  onSubmit,
}: MovieFormModalProps) {
  const [form, setForm] = useState<MovieFormData>(DEFAULT_FORM);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    if (editingMovie) {
      setForm({
        title: editingMovie.title,
        description: editingMovie.description,
        genre: editingMovie.genre,
        releaseYear: editingMovie.releaseYear,
        rating: editingMovie.rating,
        poster: editingMovie.poster,
        backdrop: editingMovie.backdrop ?? '',
        videoUrl: editingMovie.videoUrl,
        featured: editingMovie.featured,
        trending: editingMovie.trending,
      });
    } else {
      setForm({
        ...DEFAULT_FORM,
        genre: categories[0]?.name ?? 'Action',
      });
    }
  }, [isOpen, editingMovie, categories]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Poster upload must be a JPG, PNG, or WEBP image.');
      return;
    }

    if (file.size > 1_500_000) {
      setError('Uploaded poster image must be smaller than 1.5 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setError(null);
        setForm((prev) => ({ ...prev, poster: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.title.trim()) {
      setError('Movie title is required.');
      return;
    }
    if (form.description.trim().length < 10) {
      setError('Description must be at least 10 characters.');
      return;
    }
    if (!form.poster.trim()) {
      setError('Please provide a poster image URL or upload an image.');
      return;
    }
    if (!form.videoUrl.trim()) {
      setError('Video URL is required.');
      return;
    }

    try {
      await onSubmit({
        ...form,
        title: form.title.trim(),
        description: form.description.trim(),
        genre: form.genre.trim(),
        poster: form.poster.trim(),
        backdrop: form.backdrop.trim(),
        videoUrl: form.videoUrl.trim(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save movie.');
    }
  };

  const availableGenres = Array.from(
    new Set([
      ...categories.map((c) => c.name),
      ...(form.genre ? [form.genre] : []),
    ])
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/85 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="movie-form-title"
    >
      <div className="my-8 w-full max-w-3xl overflow-hidden rounded-xl border border-white/15 bg-[#111115] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <h2 id="movie-form-title" className="font-display text-2xl font-bold text-white">
            {editingMovie ? `Edit Movie: ${editingMovie.title}` : 'Add New Movie'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close form"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/10 text-neutral-400 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-5 rounded-md border border-red-500/40 bg-[#1E0C10] px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Poster Preview Column */}
            <div className="md:col-span-1">
              <span className="block text-xs font-medium text-neutral-400">Poster Preview</span>
              <div className="mt-2 aspect-[3/4] w-full overflow-hidden rounded-lg border border-white/10 bg-[#08080A]">
                <MovieImage
                  src={form.poster}
                  alt={form.title || 'Poster preview'}
                  title={form.title || 'MOVIEFLIX'}
                  className="h-full w-full object-cover"
                />
              </div>

              <label className="mt-3 flex min-h-[42px] cursor-pointer items-center justify-center gap-2 rounded-md border border-white/15 bg-[#18181E] px-3 py-2 text-xs font-semibold text-neutral-200 transition-colors hover:border-white/30 hover:text-white">
                <Upload className="h-3.5 w-3.5" />
                Upload Poster Image
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleFileUpload}
                  className="sr-only"
                />
              </label>
              <p className="mt-1.5 text-center text-[11px] text-neutral-500">
                JPG, PNG, or WEBP up to 1.5 MB
              </p>
            </div>

            {/* Form Fields Column */}
            <div className="space-y-4 md:col-span-2">
              <div>
                <label htmlFor="movie-title" className="block text-xs font-medium text-neutral-300">
                  Movie Title
                </label>
                <input
                  id="movie-title"
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Obsidian Protocol"
                  className="mt-1.5 h-11 w-full rounded-md border border-white/15 bg-[#08080A] px-3.5 text-sm text-white placeholder-neutral-500 focus:border-[#E50914] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label htmlFor="movie-genre" className="block text-xs font-medium text-neutral-300">
                    Genre
                  </label>
                  <select
                    id="movie-genre"
                    value={form.genre}
                    onChange={(e) => setForm((prev) => ({ ...prev, genre: e.target.value }))}
                    className="mt-1.5 h-11 w-full rounded-md border border-white/15 bg-[#08080A] px-3 text-sm text-white focus:border-[#E50914] focus:outline-none"
                  >
                    {availableGenres.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="movie-year" className="block text-xs font-medium text-neutral-300">
                    Release Year
                  </label>
                  <input
                    id="movie-year"
                    type="number"
                    min={1888}
                    max={2100}
                    required
                    value={form.releaseYear}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, releaseYear: Number(e.target.value) }))
                    }
                    className="mt-1.5 h-11 w-full rounded-md border border-white/15 bg-[#08080A] px-3.5 font-mono text-sm tabular-nums text-white focus:border-[#E50914] focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="movie-rating" className="block text-xs font-medium text-neutral-300">
                    Rating (0–10)
                  </label>
                  <input
                    id="movie-rating"
                    type="number"
                    min={0}
                    max={10}
                    step={0.1}
                    required
                    value={form.rating}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, rating: Number(e.target.value) }))
                    }
                    className="mt-1.5 h-11 w-full rounded-md border border-white/15 bg-[#08080A] px-3.5 font-mono text-sm tabular-nums text-white focus:border-[#E50914] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="movie-poster" className="block text-xs font-medium text-neutral-300">
                  Poster Image URL
                </label>
                <input
                  id="movie-poster"
                  type="text"
                  required
                  value={form.poster}
                  onChange={(e) => setForm((prev) => ({ ...prev, poster: e.target.value }))}
                  placeholder="https://... or upload an image on the left"
                  className="mt-1.5 h-11 w-full rounded-md border border-white/15 bg-[#08080A] px-3.5 text-sm text-white placeholder-neutral-500 focus:border-[#E50914] focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="movie-backdrop" className="block text-xs font-medium text-neutral-300">
                  Backdrop Image URL (optional, for Hero banner)
                </label>
                <input
                  id="movie-backdrop"
                  type="text"
                  value={form.backdrop}
                  onChange={(e) => setForm((prev) => ({ ...prev, backdrop: e.target.value }))}
                  placeholder="https://... (defaults to poster if left blank)"
                  className="mt-1.5 h-11 w-full rounded-md border border-white/15 bg-[#08080A] px-3.5 text-sm text-white placeholder-neutral-500 focus:border-[#E50914] focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="movie-video" className="block text-xs font-medium text-neutral-300">
                  Video / Trailer URL
                </label>
                <input
                  id="movie-video"
                  type="url"
                  required
                  value={form.videoUrl}
                  onChange={(e) => setForm((prev) => ({ ...prev, videoUrl: e.target.value }))}
                  placeholder="https://example.com/trailer.mp4 or YouTube URL"
                  className="mt-1.5 h-11 w-full rounded-md border border-white/15 bg-[#08080A] px-3.5 text-sm text-white placeholder-neutral-500 focus:border-[#E50914] focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="movie-description" className="block text-xs font-medium text-neutral-300">
                  Synopsis / Description
                </label>
                <textarea
                  id="movie-description"
                  rows={3}
                  required
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Write a concise, compelling synopsis..."
                  className="mt-1.5 w-full rounded-md border border-white/15 bg-[#08080A] p-3.5 text-sm text-white placeholder-neutral-500 focus:border-[#E50914] focus:outline-none"
                />
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-1">
                <label className="inline-flex cursor-pointer items-center gap-2.5 text-sm text-neutral-200">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => setForm((prev) => ({ ...prev, featured: e.target.checked }))}
                    className="h-4 w-4 rounded border-white/25 bg-[#08080A] accent-[#E50914]"
                  />
                  Featured on Hero
                </label>

                <label className="inline-flex cursor-pointer items-center gap-2.5 text-sm text-neutral-200">
                  <input
                    type="checkbox"
                    checked={form.trending}
                    onChange={(e) => setForm((prev) => ({ ...prev, trending: e.target.checked }))}
                    className="h-4 w-4 rounded border-white/25 bg-[#08080A] accent-[#E50914]"
                  />
                  Show in Trending
                </label>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3 border-t border-white/10 pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="min-h-[42px] rounded-md border border-white/15 px-5 py-2 text-sm font-semibold text-neutral-300 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="min-h-[42px] rounded-md bg-[#E50914] px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#F41B26] disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : editingMovie ? 'Save Changes' : 'Publish Movie'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
