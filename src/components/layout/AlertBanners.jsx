import { useEffect } from 'react';
import { useSessionExpiry, useOnlineStatus } from '../../hooks/useSessionWatcher.js';
import { doRefreshToken } from '../../lib/auth.js';
import { useToast } from '../../contexts/ToastContext.jsx';

export default function AlertBanners() {
  const minsLeft = useSessionExpiry();
  const online   = useOnlineStatus();
  const toast    = useToast();

  const hasBanner = minsLeft !== null || !online;

  useEffect(() => {
    document.body.classList.toggle('has-banner', hasBanner);
    return () => { if (!hasBanner) document.body.classList.remove('has-banner'); };
  }, [hasBanner]);

  useEffect(() => {
    if (online) toast('Back online', 'success');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [online]);

  return (
    <>
      {!online && (
        <div className="alert-banner offline show" role="alert" aria-live="assertive">
          <span aria-hidden="true">⚡</span>
          No internet connection — showing cached data.
        </div>
      )}
      {minsLeft !== null && (
        <div className="alert-banner session show" role="alert" aria-live="polite">
          <span aria-hidden="true">⏱</span>
          <span>Your Xero session expires in {minsLeft} minute{minsLeft !== 1 ? 's' : ''} —</span>
          <button
            onClick={() => doRefreshToken().then(() => toast('Session refreshed', 'success')).catch(() => {})}
            className="btn btn-ghost"
            style={{ padding: '4px 10px', fontSize: 10, marginLeft: 4 }}
          >
            Refresh session
          </button>
        </div>
      )}
    </>
  );
}
