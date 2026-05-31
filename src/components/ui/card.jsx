import { cn } from '@/lib/utils';

function Card({ className, children, ...props }) {
  return (
    <div
      className={cn(
        'relative rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-8 shadow-[var(--shadow-card)]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function CardHeader({ className, ...props }) {
  return <div className={cn('mb-6', className)} {...props} />;
}

function CardTitle({ className, ...props }) {
  return <h2 className={cn('text-lg font-bold text-[var(--color-foreground)]', className)} {...props} />;
}

function CardDescription({ className, ...props }) {
  return <p className={cn('text-sm text-[var(--color-muted)] leading-relaxed', className)} {...props} />;
}

function CardContent({ className, ...props }) {
  return <div className={cn('', className)} {...props} />;
}

function CardFooter({ className, ...props }) {
  return <div className={cn('mt-6 flex items-center gap-3', className)} {...props} />;
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
