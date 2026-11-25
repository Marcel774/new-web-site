import { AlertTriangle, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  title: string;
  itemName: string;
  description: string;
  confirmLabel?: string;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
}

export function DeleteConfirmModal({
  isOpen,
  title,
  itemName,
  description,
  confirmLabel = 'Delete',
  isDeleting,
  onCancel,
  onConfirm,
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-confirm-title"
    >
      <div className="w-full max-w-md overflow-hidden rounded-xl border border-white/15 bg-[#111115] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="h-5 w-5 text-[#E50914]" />
            <h2 id="delete-confirm-title" className="font-display text-xl font-bold text-white">
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close confirmation dialog"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-neutral-400 hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5">
          <p className="text-sm leading-relaxed text-neutral-300">
            {description}{' '}
            <span className="font-semibold text-white">&ldquo;{itemName}&rdquo;</span>?
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-white/10 bg-[#0B0B0E] px-5 py-3.5">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="min-h-[40px] rounded-md border border-white/15 px-4 py-2 text-xs font-semibold text-neutral-300 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="min-h-[40px] rounded-md bg-[#E50914] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#F41B26] disabled:opacity-50"
          >
            {isDeleting ? 'Deleting...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
