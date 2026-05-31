import { useCallback, useEffect, useState } from 'react';

function getInitialTheme() {
  const saved = localStorage.getItem('xero_theme');
  if (saved) return saved === 'light';
  return window.matchMedia('(prefers-color-scheme: light)').matches;
}

export function useTheme() {
  const [light, setLight] = useState(getInitialTheme);

  // Apply theme to DOM
  useEffect(() => {
    document.body.classList.toggle('light-mode', light);
    document.getElementById('metaThemeColor')?.setAttribute('content', light ? '#00c285' : '#00e5a0');
  }, [light]);

  // Follow system preference changes; handler checks localStorage each time so
  // once the user explicitly toggles the preference is respected immediately.
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: light)');
    const handler = e => {
      if (!localStorage.getItem('xero_theme')) setLight(e.matches);
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const toggle = useCallback(() => {
    setLight(l => {
      const next = !l;
      localStorage.setItem('xero_theme', next ? 'light' : 'dark');
      return next;
    });
  }, []);

  return { light, toggle };
}
