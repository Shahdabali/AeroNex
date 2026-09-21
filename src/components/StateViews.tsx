import type { ReactNode } from 'react';
import { AlertCircle, Inbox, RefreshCw } from 'lucide-react';

/** Consistent loading / error / empty states so every data surface behaves the same way. */

export function LoadingBlock({ label = 'Loading…', className = '' }: { label?: string; className?: string }) {
  return (
    <div role="status" aria-live="polite" className={`flex flex-col items-center justify-center gap-2 py-8 text-zinc-400 ${className}`}>
      <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      <span className="text-xs">{label}</span>
    </div>
  );
}

export function ErrorBlock({
  error,
  onRetry,
  title = "Couldn't load this data",
  className = '',
}: {
  error?: unknown;
  onRetry?: () => void;
  title?: string;
  className?: string;
}) {
  const message = error instanceof Error && error.message ? error.message : 'Something went wrong. Please try again.';
  return (
    <div role="alert" className={`flex flex-col items-center justify-center gap-2 py-8 text-center px-4 ${className}`}>
      <AlertCircle size={22} className="text-rose-400" />
      <p className="text-sm font-semibold text-white">{title}</p>
      <p className="text-xs text-zinc-400 max-w-sm">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-xs font-semibold text-white cursor-pointer transition-colors"
        >
          <RefreshCw size={12} /> Try again
        </button>
      )}
    </div>
  );
}

export function EmptyBlock({
  title,
  description,
  action,
  className = '',
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col items-center justify-center gap-1.5 py-8 text-center px-4 ${className}`}>
      <Inbox size={22} className="text-zinc-500" />
      <p className="text-sm font-semibold text-white">{title}</p>
      {description && <p className="text-xs text-zinc-400 max-w-sm">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
