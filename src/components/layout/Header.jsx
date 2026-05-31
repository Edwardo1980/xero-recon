import { useAuthStore } from '../../lib/store.js';

export default function Header() {
  const tenantName  = useAuthStore(s => s.tenantName);
  const accessToken = useAuthStore(s => s.accessToken);

  return (
    <header className="flex items-center gap-4 py-5 mb-2">
      <div className="text-[var(--color-primary)]" role="img" aria-label="Xero Reconciliation">
        <svg width="28" height="28" viewBox="0 0 22 22" fill="none" aria-hidden="true">
          <path d="M11 2L4 6.5V15.5L11 20L18 15.5V6.5L11 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
          <path d="M7.5 11H14.5M11 7.5V14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </div>
      <div className="flex-1">
        <h1 className="text-base font-bold text-[var(--color-foreground)] leading-none mb-0.5">Xero Reconciliation</h1>
        <p className="text-xs text-[var(--color-dim)]">Bank reconciliation · Powered by Xero</p>
      </div>
      <div
        className={[
          'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border',
          accessToken
            ? 'bg-[rgba(0,229,160,0.08)] border-[rgba(0,229,160,0.2)] text-[var(--color-primary)]'
            : 'bg-[rgba(255,255,255,0.04)] border-[var(--color-border)] text-[var(--color-dim)]'
        ].join(' ')}
        role="status"
        aria-live="polite"
      >
        <span className={['w-1.5 h-1.5 rounded-full', accessToken ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-dim)]'].join(' ')} aria-hidden="true" />
        {accessToken ? (tenantName ?? 'Connected') : 'Not connected'}
      </div>
    </header>
  );
}
