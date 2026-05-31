import { forwardRef } from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-background)] disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
  {
    variants: {
      variant: {
        default: 'bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:bg-[var(--color-primary-hover)] font-semibold shadow-sm',
        secondary: 'bg-[var(--color-secondary)] text-[var(--color-secondary-foreground)] border border-[var(--color-border)] hover:border-[var(--color-border-strong)] hover:bg-[rgba(255,255,255,0.06)]',
        ghost: 'text-[var(--color-muted)] hover:text-[var(--color-foreground)] hover:bg-[rgba(255,255,255,0.05)] border border-transparent hover:border-[var(--color-border)]',
        destructive: 'bg-[var(--color-destructive)] text-white hover:bg-[rgba(255,112,67,0.85)]',
        outline: 'border border-[var(--color-border)] text-[var(--color-foreground)] hover:border-[var(--color-border-strong)] hover:bg-[rgba(255,255,255,0.04)]',
        link: 'text-[var(--color-primary)] underline-offset-4 hover:underline p-0 h-auto',
      },
      size: {
        default: 'h-10 px-5 py-2',
        sm: 'h-8 px-4 text-xs',
        lg: 'h-11 px-7 text-base',
        icon: 'h-9 w-9 rounded-lg',
        xs: 'h-7 px-3 text-xs',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
);

const Button = forwardRef(({ className, variant, size, loading, children, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(buttonVariants({ variant, size }), loading && 'opacity-70 pointer-events-none', className)}
    {...props}
  >
    {loading && (
      <span className="inline-block w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" aria-hidden="true" />
    )}
    {children}
  </button>
));
Button.displayName = 'Button';

export { Button, buttonVariants };
