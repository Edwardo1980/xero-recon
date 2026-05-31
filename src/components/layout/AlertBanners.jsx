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
    return () => document.body.classList.remove('has-banner');
  }, [hasBanner]);

  // Track actual banner stack height so .wrap padding-top stays exact
  const wrapRef = useRef(null);
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const sync = () => document.body.style.setProperty('--banner-height', `${el.getBoundingClientRect().height}px`);
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => { ro.disconnect(); document.body.style.removeProperty('--banner-height'); };
  }, []);

  // Skip initial mount — only toast when status changes from offline → online
  const mountedRef = useRef(false);
  useEffect(() => {
    if (!mountedRef.current) { mountedRef.current = true; return; }
    if (online) toast('Back online', 'success');
  }, [online, toast]);

  return (
    <div className="alert-banners-wrap" ref={wrapRef}>
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
            onClick={() => doRefreshToken().then(() => toast('Session refreshed', 'success')).catch(() => toast('Session refresh failed — please reconnect.', 'error'))}
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
    </div>
  );
}
