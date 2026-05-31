import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

const Input = forwardRef(({ className, type, ...props }, ref) => (
  <input
    type={type}
    ref={ref}
    className={cn(
      'flex h-10 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm text-[var(--color-foreground)] placeholder:text-[var(--color-dim)] transition-colors',
      'focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[rgba(0,229,160,0.15)]',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'font-[var(--font-sans)]',
      className
    )}
    {...props}
  />
));
Input.displayName = 'Input';

export { Input };
