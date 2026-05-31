import { cn } from '@/lib/utils';

function Label({ className, ...props }) {
  return (
    <label
      className={cn('block text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wide mb-1.5', className)}
      {...props}
    />
  );
}

export { Label };
