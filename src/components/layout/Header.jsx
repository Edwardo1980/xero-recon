import { useTheme } from '../../hooks/useTheme.js';
import { useAuthStore } from '../../lib/store.js';

export default function Header() {
  const { light, toggle } = useTheme();
  const tenantName = useAuthStore(s => s.tenantName);
  const accessToken = useAuthStore(s => s.accessToken);

  return (
    <header className="site-header">
      <div className="logo" role="img" aria-label="Xero Reconciliation">🔄</div>
      <div className="site-title">
        <h1>Xero Reconciliation</h1>
        <p>Official OAuth2 API · No password stored</p>
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
