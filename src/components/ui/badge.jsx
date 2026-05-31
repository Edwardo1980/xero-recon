import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-[var(--color-primary)] text-[var(--color-primary-foreground)]',
        secondary: 'bg-[var(--color-secondary)] text-[var(--color-muted)] border border-[var(--color-border)]',
        destructive: 'bg-[var(--color-destructive-bg)] text-[var(--color-destructive)] border border-[rgba(255,112,67,0.25)]',
        success: 'bg-[var(--color-success-bg)] text-[var(--color-success)] border border-[rgba(0,229,160,0.25)]',
        outline: 'border border-[var(--color-border)] text-[var(--color-muted)]',
        info: 'bg-[var(--color-info-bg)] text-[var(--color-info)] border border-[rgba(56,189,248,0.2)]',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

function Badge({ className, variant, ...props }) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
