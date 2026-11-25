import { Play, Star } from 'lucide-react';
import type { Movie } from '../types/movie';
import { MovieImage } from './MovieImage';

interface MovieCardProps {
  movie: Movie;
  onSelect: (movieId: string) => void;
}

export function MovieCard({ movie, onSelect }: MovieCardProps) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-lg border border-white/10 bg-[#111115] transition-colors duration-200 hover:border-white/25">
      <button
        type="button"
        onClick={() => onSelect(movie._id)}
        className="relative aspect-[3/4] w-full overflow-hidden bg-[#18181F] text-left focus-visible:outline-2 focus-visible:outline-[#E50914]"
        aria-label={`View details for ${movie.title}`}
      >
        <MovieImage
          src={movie.poster}
          alt={`${movie.title} poster`}
          title={movie.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 transition-opacity duration-200 group-hover:opacity-90" />

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#E50914] text-white shadow-xl">
            <Play className="h-5 w-5 translate-x-0.5 fill-white" />
          </span>
        </div>
      </button>

      <div className="flex flex-1 flex-col justify-between p-4">
        <div>
          <button
            type="button"
            onClick={() => onSelect(movie._id)}
            className="line-clamp-1 text-left font-display text-xl font-bold tracking-tight text-white transition-colors hover:text-[#E50914]"
          >
            {movie.title}
          </button>

          <div className="mt-1.5 flex items-center gap-2 text-xs font-medium text-neutral-400">
            <span className="truncate">{movie.genre}</span>
            <span aria-hidden="true" className="text-neutral-600">
              ·
            </span>
            <span className="font-mono tabular-nums">{movie.releaseYear}</span>
            <span aria-hidden="true" className="text-neutral-600">
              ·
            </span>
            <span className="inline-flex items-center gap-1 font-mono tabular-nums text-amber-400">
              <Star className="h-3 w-3 fill-amber-400" />
              {movie.rating.toFixed(1)}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
