export default function Footer() {
  return (
    <footer className="site-footer" aria-label="Site footer">
      <span>Xero Reconciliation Assistant · v{__APP_VERSION__}</span>
      <span>
        <a href="https://developer.xero.com/documentation/api/accounting/overview" target="_blank" rel="noopener noreferrer">
          Xero API Docs
        </a>
        {' · '}
        <a href="https://developer.xero.com/app/manage" target="_blank" rel="noopener noreferrer">
          Developer Portal
        </a>
      </span>
    </footer>
  );
}
