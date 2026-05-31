import { useTheme } from '../../hooks/useTheme.js';
import { useAuthStore } from '../../lib/store.js';

export default function Header() {
  const { light, toggle } = useTheme();
  const tenantName = useAuthStore(s => s.tenantName);
  const accessToken = useAuthStore(s => s.accessToken);

  return (
    <header className="site-header">
      <div className="logo" role="img" aria-label="Xero Reconciliation">
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
          <path d="M11 2L4 6.5V15.5L11 20L18 15.5V6.5L11 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
          <path d="M7.5 11H14.5M11 7.5V14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </div>
      <div className="site-title">
        <h1>Xero Reconciliation</h1>
        <p>Bank reconciliation · Powered by Xero</p>
      </div>
      <div
        className={`status-pill${accessToken ? ' connected' : ''}`}
        id="statusPill"
        role="status"
        aria-live="polite"
      >
        <div className="dot" aria-hidden="true" />
        <span>{accessToken ? (tenantName ?? 'Connected') : 'Not connected'}</span>
      </div>
      <button
        type="button"
        className="theme-toggle"
        onClick={toggle}
        aria-label={light ? 'Switch to dark mode' : 'Switch to light mode'}
        title={light ? 'Switch to dark mode' : 'Switch to light mode'}
      >
        {light ? '🌙' : '☀️'}
      </button>
    </header>
  );
}
