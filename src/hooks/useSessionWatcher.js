import { useCallback, useEffect, useState } from 'react';
import { useAuthStore } from '../lib/store.js';

// Compute minsLeft directly in render (avoids setState-in-effect); a ticker
// forces re-renders every 30s so the value stays current.
export function useSessionExpiry() {
  const expiresAt = useAuthStore(s => s.expiresAt);
  const [, tick]  = useState(0);

  useEffect(() => {
    if (!expiresAt) return;
    const id = setInterval(() => tick(n => n + 1), 30_000);
    return () => clearInterval(id);
  }, [expiresAt]);

  if (!expiresAt) return null;
  const mins = Math.round((expiresAt - Date.now()) / 60_000);
  return mins > 0 && mins <= 10 ? mins : null;
}

export function useOnlineStatus() {
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const on  = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online',  on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);
  return online;
}

export function useSwUpdate() {
  const [updateReady, setUpdateReady] = useState(false);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker.ready.then(reg => {
      if (reg.waiting) { setUpdateReady(true); return; }

      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        newWorker?.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            setUpdateReady(true);
          }
        });
      });
    });
  }, []);

  const applyUpdate = useCallback(() => {
    navigator.serviceWorker.ready.then(reg => {
      reg.waiting?.postMessage('SKIP_WAITING');
      window.location.reload();
    });
  }, []);

  return { updateReady, applyUpdate };
}
