import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const alertVariants = cva(
  'relative flex items-start gap-3 rounded-xl border p-4 text-sm leading-relaxed',
  {
    variants: {
      variant: {
        info: 'bg-[var(--color-info-bg)] border-[rgba(56,189,248,0.2)] text-[var(--color-info)]',
        warn: 'bg-[var(--color-warn-bg)] border-[rgba(255,112,67,0.2)] text-[var(--color-warn)]',
        success: 'bg-[var(--color-success-bg)] border-[rgba(0,229,160,0.2)] text-[var(--color-success)]',
        error: 'bg-[var(--color-destructive-bg)] border-[rgba(255,112,67,0.25)] text-[var(--color-destructive)]',
      },
    },
    defaultVariants: { variant: 'info' },
  }
);

const ICONS = {
  info: <svg width="15" height="15" viewBox="0 0 15 15" fill="currentColor" aria-hidden="true" className="flex-shrink-0 mt-px"><path d="M7.5 1a6.5 6.5 0 100 13A6.5 6.5 0 007.5 1zm0 1a5.5 5.5 0 110 11A5.5 5.5 0 017.5 2zM7.5 5a.75.75 0 100 1.5A.75.75 0 007.5 5zm-.5 2.5v4h1v-4h-1z"/></svg>,
  warn: <svg width="15" height="15" viewBox="0 0 15 15" fill="currentColor" aria-hidden="true" className="flex-shrink-0 mt-px"><path d="M7.5 1.5L1 13h13L7.5 1.5zm0 1.8l5.5 9.2H2L7.5 3.3zM7 7v2.5h1V7H7zm0 3.5V12h1v-1.5H7z"/></svg>,
  success: <svg width="15" height="15" viewBox="0 0 15 15" fill="currentColor" aria-hidden="true" className="flex-shrink-0 mt-px"><path d="M7.5 1a6.5 6.5 0 100 13A6.5 6.5 0 007.5 1zm0 1a5.5 5.5 0 110 11A5.5 5.5 0 017.5 2zm2.85 3.65l-3.6 3.6-1.6-1.6-.7.7 2.3 2.3 4.3-4.3-.7-.7z"/></svg>,
  error: <svg width="15" height="15" viewBox="0 0 15 15" fill="currentColor" aria-hidden="true" className="flex-shrink-0 mt-px"><path d="M7.5 1a6.5 6.5 0 100 13A6.5 6.5 0 007.5 1zm0 1a5.5 5.5 0 110 11A5.5 5.5 0 017.5 2zM5.15 5.15l.7-.7 1.65 1.65 1.65-1.65.7.7-1.65 1.65 1.65 1.65-.7.7L7.5 8.5l-1.65 1.65-.7-.7 1.65-1.65-1.65-1.65z"/></svg>,
};

function Alert({ className, variant = 'info', children, ...props }) {
  return (
    <div role="alert" className={cn(alertVariants({ variant }), className)} {...props}>
      {ICONS[variant]}
      <div>{children}</div>
    </div>
  );
}

export { Alert };
