import { useEffect, useState } from 'react';
import { useAuthStore } from '../lib/store.js';

export function useSessionExpiry() {
  const expiresAt    = useAuthStore(s => s.expiresAt);
  const [minsLeft, setMinsLeft] = useState(null);

  useEffect(() => {
    if (!expiresAt) { setMinsLeft(null); return; }

    const check = () => {
      const mins = Math.round((expiresAt - Date.now()) / 60_000);
      setMinsLeft(mins > 0 && mins <= 10 ? mins : null);
    };

    check();
    const id = setInterval(check, 30_000);
    return () => clearInterval(id);
  }, [expiresAt]);

  return minsLeft;
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
