import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { PaginationInfo } from '../types/movie';

interface PaginationProps {
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
}

export function Pagination({ pagination, onPageChange }: PaginationProps) {
  const { page, totalPages, total, limit } = pagination;
  if (totalPages <= 1) return null;

  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  const pages: number[] = [];
  for (let i = 1; i <= totalPages; i += 1) {
    pages.push(i);
  }

  return (
    <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row">
      <p className="text-xs text-neutral-400 tabular-nums">
        Showing <span className="font-semibold text-white">{startItem}</span>–
        <span className="font-semibold text-white">{endItem}</span> of{' '}
        <span className="font-semibold text-white">{total}</span> titles
      </p>

      <nav aria-label="Catalog pagination" className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/10 bg-[#111115] text-neutral-300 transition-colors hover:border-white/25 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {pages.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            aria-current={p === page ? 'page' : undefined}
            className={`inline-flex h-10 min-w-[40px] items-center justify-center rounded-md px-3 font-mono text-xs font-semibold tabular-nums transition-colors ${
              p === page
                ? 'bg-[#E50914] text-white'
                : 'border border-white/10 bg-[#111115] text-neutral-300 hover:border-white/25 hover:text-white'
            }`}
          >
            {p}
          </button>
        ))}

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/10 bg-[#111115] text-neutral-300 transition-colors hover:border-white/25 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </nav>
    </div>
  );
}
