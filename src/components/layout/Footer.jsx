export default function Footer() {
  return (
    <footer className="flex items-center justify-between flex-wrap gap-4 py-6 mt-2 text-xs text-[var(--color-dim)] border-t border-[var(--color-border)]" aria-label="Site footer">
      <span>Xero Reconciliation Assistant · v{__APP_VERSION__}</span>
      <span className="flex items-center gap-3">
        <a href="https://developer.xero.com/documentation/api/accounting/overview" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-muted)] transition-colors" aria-label="Xero API Docs (opens in new tab)">
          API Docs
        </a>
        <span aria-hidden="true">·</span>
        <a href="https://developer.xero.com/app/manage" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-muted)] transition-colors" aria-label="Xero Developer Portal (opens in new tab)">
          Developer Portal
        </a>
      </span>
    </footer>
  );
}
