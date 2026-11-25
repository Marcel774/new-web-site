import { ExternalLink, Film, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Movie } from '../types/movie';
import { MovieImage } from './MovieImage';

interface MoviePlayerModalProps {
  movie: Movie | null;
  onClose: () => void;
}

function getYouTubeEmbedUrl(rawUrl: string): string | null {
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return null;

    if (parsed.hostname === 'youtu.be') {
      const videoId = parsed.pathname.slice(1).split('/')[0];
      return videoId ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?autoplay=1` : null;
    }

    if (
      parsed.hostname === 'www.youtube.com' ||
      parsed.hostname === 'youtube.com' ||
      parsed.hostname === 'm.youtube.com'
    ) {
      const v = parsed.searchParams.get('v');
      if (v) {
        return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(v)}?autoplay=1`;
      }
      if (parsed.pathname.startsWith('/embed/')) {
        const embedId = parsed.pathname.replace('/embed/', '').split('/')[0];
        return embedId ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(embedId)}?autoplay=1` : null;
      }
    }
    return null;
  } catch {
    return null;
  }
}

export function MoviePlayerModal({ movie, onClose }: MoviePlayerModalProps) {
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    setVideoError(false);
  }, [movie?._id]);

  useEffect(() => {
    if (!movie) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [movie, onClose]);

  if (!movie) return null;

  const youtubeEmbed = getYouTubeEmbedUrl(movie.videoUrl);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="player-modal-title"
    >
      <div className="relative w-full max-w-5xl overflow-hidden rounded-xl border border-white/15 bg-[#0D0D10] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5">
          <div>
            <h2 id="player-modal-title" className="font-display text-2xl font-bold text-white">
              {movie.title}
            </h2>
            <p className="text-xs text-neutral-400">
              {movie.genre} · {movie.releaseYear} · ★ {movie.rating.toFixed(1)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close video player"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/10 text-neutral-300 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="relative aspect-video w-full bg-black">
          {youtubeEmbed ? (
            <iframe
              src={youtubeEmbed}
              title={`${movie.title} video player`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full border-0"
            />
          ) : !videoError ? (
            <video
              key={movie.videoUrl}
              src={movie.videoUrl}
              poster={movie.backdrop || movie.poster}
              controls
              autoPlay
              playsInline
              onError={() => setVideoError(true)}
              className="h-full w-full bg-black object-contain"
            />
          ) : (
            <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden p-6 text-center">
              <div className="absolute inset-0 opacity-30">
                <MovieImage
                  src={movie.backdrop || movie.poster}
                  alt={movie.title}
                  title={movie.title}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="relative z-10 max-w-md rounded-lg border border-white/15 bg-[#0D0D10]/90 p-6 backdrop-blur-md">
                <Film className="mx-auto mb-3 h-8 w-8 text-[#E50914]" />
                <h3 className="font-display text-xl font-bold text-white">
                  Stream Preview Unavailable in Sandbox
                </h3>
                <p className="mt-2 text-sm text-neutral-300">
                  The configured stream URL could not be reached from this preview environment.
                </p>
                <a
                  href={movie.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 rounded-md bg-[#E50914] px-4 py-2 text-xs font-semibold text-white hover:bg-[#F41B26]"
                >
                  Open Source Stream
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
