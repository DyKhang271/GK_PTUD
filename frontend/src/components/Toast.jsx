import { useState, useEffect, useCallback, createContext, useContext } from 'react';

const ToastContext = createContext();

export function useToast() {
  return useContext(ToastContext);
}

function ToastItem({ toast, onRemove }) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onRemove(toast.id), 400);
    }, 3000);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  const typeClass = `toast-${toast.type}`;

  const icons = {
    success: '✅',
    error: '❌',
    info: '🔵',
  };

  return (
    <div className={`toast-item ${typeClass} ${isExiting ? 'toast-exit' : 'toast-enter'}`}>
      <span className="toast-icon">{icons[toast.type] || '✅'}</span>
      <span className="toast-message">{toast.message}</span>
      <button
        className="toast-close-btn"
        onClick={() => {
          setIsExiting(true);
          setTimeout(() => onRemove(toast.id), 400);
        }}
      >
        ×
      </button>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'success') => {
    // TODO: Nên sử dụng `crypto.randomUUID()` thay thế để đảm bảo tính unique (duy nhất) tuyệt đối.
    // Việc dùng Math.random() + Date.now() vẫn có rủi ro trùng lặp trong một số trường hợp.
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-container">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
