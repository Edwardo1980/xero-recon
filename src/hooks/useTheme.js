import { useCallback, useEffect, useState } from 'react';

function getInitialTheme() {
  const saved = localStorage.getItem('xero_theme');
  if (saved) return saved === 'light';
  return window.matchMedia('(prefers-color-scheme: light)').matches;
}

export function useTheme() {
  const [light, setLight] = useState(getInitialTheme);

  useEffect(() => {
    document.body.classList.toggle('light-mode', light);
    document.getElementById('metaThemeColor')?.setAttribute('content', light ? '#00c285' : '#00e5a0');
    localStorage.setItem('xero_theme', light ? 'light' : 'dark');
  }, [light]);

  const toggle = useCallback(() => setLight(l => !l), []);

  return { light, toggle };
}
