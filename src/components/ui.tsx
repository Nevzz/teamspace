import { type ReactNode, useEffect } from 'react';
import { X, WifiOff } from 'lucide-react';
import { initials } from '../lib/helpers';

export function Avatar({ name, color, size = 24 }: { name: string; color?: string; size?: number }) {
  return (
    <div
      className="rounded-full flex items-center justify-center text-white font-medium shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.4, backgroundColor: color || '#8E8E93' }}
    >
      {initials(name || '?')}
    </div>
  );
}

export function StatusPill({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <span
      className="inline-flex items-center px-2 py-[3px] rounded-full text-[11.5px] font-medium"
      style={{ color, backgroundColor: bg }}
    >
      {label}
    </span>
  );
}

export function PriorityDot({ color }: { color: string }) {
  return <span className="inline-block w-[6px] h-[6px] rounded-full shrink-0" style={{ backgroundColor: color }} />;
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton rounded-sm2 ${className}`} />;
}

export function CardSkeleton() {
  return (
    <div className="rounded-card border border-border bg-card p-5 space-y-3">
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-3 w-1/3" />
      <Skeleton className="h-2 w-full" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
}

export function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-6">
      <div className="w-12 h-12 rounded-full bg-bg-tertiary flex items-center justify-center mb-4">
        <WifiOff size={20} className="text-text-secondary" />
      </div>
      <h3 className="text-[16px] font-semibold text-text mb-1">Couldn't connect</h3>
      <p className="text-[13.5px] text-text-secondary max-w-xs mb-5">
        We couldn't reach the team database. Check your connection and try again.
      </p>
      <button
        onClick={onRetry}
        className="px-4 py-2 rounded-sm2 bg-accent-blue text-white text-[13.5px] font-medium hover:opacity-90 transition-opacity"
      >
        Try again
      </button>
    </div>
  );
}

export function EmptyState({ icon, title, subtitle, action }: { icon?: ReactNode; title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      {icon && <div className="w-11 h-11 rounded-full bg-bg-tertiary flex items-center justify-center mb-3.5 text-text-tertiary">{icon}</div>}
      <h3 className="text-[14.5px] font-medium text-text mb-1">{title}</h3>
      {subtitle && <p className="text-[13px] text-text-secondary max-w-xs mb-4">{subtitle}</p>}
      {action}
    </div>
  );
}

export function Modal({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: string; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px] animate-in" onClick={onClose} />
      <div
        className={`relative bg-card border border-border rounded-t-card sm:rounded-card shadow-popover w-full ${wide ? 'sm:max-w-xl' : 'sm:max-w-md'} max-h-[88vh] overflow-y-auto animate-in`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-card">
          <h3 className="text-[15px] font-semibold text-text">{title}</h3>
          <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center text-text-secondary hover:bg-bg-tertiary transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block mb-3.5">
      <span className="block text-[12.5px] font-medium text-text-secondary mb-1.5">{label}</span>
      {children}
    </label>
  );
}

export const inputClass =
  'w-full px-3 py-2 rounded-sm2 bg-bg-secondary border border-border text-[13.5px] text-text placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent-blue/40 focus:border-accent-blue transition-colors';
