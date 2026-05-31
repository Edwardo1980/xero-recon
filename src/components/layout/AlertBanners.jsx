import { useEffect, useRef } from 'react';
import { useSessionExpiry, useOnlineStatus, useSwUpdate } from '../../hooks/useSessionWatcher.js';
import { doRefreshToken } from '../../lib/auth.js';
import { useToast } from '../../contexts/ToastContext.jsx';

export default function AlertBanners() {
  const minsLeft = useSessionExpiry();
  const online   = useOnlineStatus();
  const { updateReady, applyUpdate } = useSwUpdate();
  const toast    = useToast();

  const hasBanner = minsLeft !== null || !online || updateReady;

  useEffect(() => {
    document.body.classList.toggle('has-banner', hasBanner);
    return () => { if (!hasBanner) document.body.classList.remove('has-banner'); };
  }, [hasBanner]);

  // Skip initial mount — only toast when status changes from offline → online
  const mountedRef = useRef(false);
  useEffect(() => {
    if (!mountedRef.current) { mountedRef.current = true; return; }
    if (online) toast('Back online', 'success');
  }, [online, toast]);

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
            type="button"
            onClick={() => doRefreshToken().then(() => toast('Session refreshed', 'success')).catch(() => {})}
            className="btn btn-ghost"
            style={{ padding: '4px 10px', fontSize: 10, marginLeft: 4 }}
          >
            Refresh session
          </button>
        </div>
      )}
      {updateReady && (
        <div className="alert-banner session show" role="alert" aria-live="polite">
          <span aria-hidden="true">🆕</span>
          <span>A new version is available —</span>
          <button
            type="button"
            onClick={applyUpdate}
            className="btn btn-ghost"
            style={{ padding: '4px 10px', fontSize: 10, marginLeft: 4 }}
          >
            Reload to update
          </button>
        </div>
      )}
    </>
  );
}
