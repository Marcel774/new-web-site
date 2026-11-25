import { Film } from 'lucide-react';
import { useEffect, useState } from 'react';

interface MovieImageProps {
  src?: string;
  alt: string;
  title: string;
  className?: string;
}

export function MovieImage({ src, alt, title, className = '' }: MovieImageProps) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  if (!src || hasError) {
    return (
      <div
        className={`flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#18181F] via-[#101014] to-[#1D0B0E] p-4 text-center ${className}`}
      >
        <Film className="mb-2 h-8 w-8 text-[#E50914]/80" />
        <span className="line-clamp-2 font-display text-lg font-bold tracking-wide text-neutral-200">
          {title}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
      loading="lazy"
    />
  );
}
