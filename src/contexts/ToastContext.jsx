import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const activeKeys = useRef(new Set());

  const toast = useCallback((message, type = 'info', duration = 4000) => {
    const key = `${type}:${message}`;
    if (activeKeys.current.has(key)) return;
    activeKeys.current.add(key);
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => {
      activeKeys.current.delete(key);
      setToasts(t => t.filter(x => x.id !== id));
    }, duration);
  }, []);

  const dismiss = useCallback((id) => {
    setToasts(prev => {
      const t = prev.find(x => x.id === id);
      if (t) activeKeys.current.delete(`${t.type}:${t.message}`);
      return prev.filter(x => x.id !== id);
    });
  }, []);

  const ICONS = { success: '✓', error: '⚠', warn: '⚠', info: 'ℹ' };
  const TYPE_STYLES = {
    success: 'bg-[var(--color-success-bg)] border-[rgba(0,229,160,0.25)] text-[var(--color-success)]',
    error:   'bg-[var(--color-destructive-bg)] border-[rgba(255,112,67,0.3)] text-[var(--color-destructive)]',
    warn:    'bg-[var(--color-warn-bg)] border-[rgba(255,112,67,0.25)] text-[var(--color-warn)]',
    info:    'bg-[var(--color-info-bg)] border-[rgba(56,189,248,0.2)] text-[var(--color-info)]',
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div
        className="fixed bottom-5 right-5 z-[200] flex flex-col gap-2 max-w-xs w-full pointer-events-none"
        id="toastContainer"
        aria-label="Notifications"
      >
        {toasts.map(t => (
          <div
            key={t.id}
            className={cn(
              'flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-medium cursor-pointer pointer-events-auto shadow-lg',
              'transition-all duration-200',
              TYPE_STYLES[t.type] || TYPE_STYLES.info
            )}
            role={t.type === 'error' ? 'alert' : 'status'}
            onClick={() => dismiss(t.id)}
          >
            <span className="text-xs font-bold" aria-hidden="true">{ICONS[t.type]}</span>
            <span className="flex-1">{t.message}</span>
            <span className="opacity-40 text-xs" aria-hidden="true">✕</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
