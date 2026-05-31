import { createContext, useCallback, useContext, useRef, useState } from 'react';

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

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toast-container" id="toastContainer" aria-label="Notifications">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type}`} role={t.type === 'error' ? 'alert' : 'status'} onClick={() => dismiss(t.id)}>
            <span aria-hidden="true">{t.type === 'success' ? '✓' : t.type === 'error' ? '⚠' : 'ℹ'}</span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
