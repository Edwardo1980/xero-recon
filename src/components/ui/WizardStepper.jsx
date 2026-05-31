import { Fragment } from 'react';
import { cn } from '@/lib/utils';

export default function WizardStepper({ step }) {
  const steps = ['Setup', 'Connect', 'Done'];
  return (
    <div className="flex items-center gap-2 mb-8" aria-label="Setup progress">
      {steps.map((label, i) => {
        const n = i + 1;
        const done   = n < step;
        const active = n === step;
        return (
          <Fragment key={label}>
            <div className={cn('flex items-center gap-2', done && 'opacity-60')}>
              <span
                className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-mono transition-all',
                  active && 'bg-[var(--color-primary)] text-[var(--color-primary-foreground)]',
                  done && 'bg-[rgba(0,229,160,0.15)] text-[var(--color-primary)]',
                  !active && !done && 'bg-[rgba(255,255,255,0.06)] text-[var(--color-dim)]'
                )}
                aria-current={active ? 'step' : undefined}
              >
                {done ? '✓' : n}
              </span>
              <span className={cn('text-xs font-medium', active ? 'text-[var(--color-foreground)]' : 'text-[var(--color-dim)]')}>{label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={cn('flex-1 h-px', n < step ? 'bg-[var(--color-primary)] opacity-30' : 'bg-[var(--color-border)]')} />
            )}
          </Fragment>
        );
      })}
    </div>
  );
}
