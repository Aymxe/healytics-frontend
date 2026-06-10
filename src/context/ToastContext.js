import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
};

const ICONS = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
  warning: '⚠',
};

const COLORS = {
  success: 'bg-green-500',
  error: 'bg-red-500',
  info: 'bg-blue-500',
  warning: 'bg-amber-500',
};

const ToastContainer = ({ toasts, onDismiss }) => (
  <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
    {toasts.map((t) => (
      <div
        key={t.id}
        className="pointer-events-auto flex items-center gap-3 bg-white border shadow-lg rounded-xl px-4 py-3 min-w-[260px] max-w-xs animate-slide-in"
        style={{ animation: 'slideIn 0.2s ease-out' }}
      >
        <div className={`w-6 h-6 rounded-full ${COLORS[t.type]} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
          {ICONS[t.type]}
        </div>
        <span className="text-sm text-gray-800 flex-1">{t.message}</span>
        <button
          onClick={() => onDismiss(t.id)}
          className="text-gray-400 hover:text-gray-600 text-lg leading-none flex-shrink-0"
        >
          ×
        </button>
      </div>
    ))}
  </div>
);

export const useToast = () => useContext(ToastContext);
