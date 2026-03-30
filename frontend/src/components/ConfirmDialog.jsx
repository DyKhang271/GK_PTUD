import { useState, useCallback, createContext, useContext } from 'react';

const ConfirmContext = createContext();

export function useConfirm() {
  return useContext(ConfirmContext);
}

export function ConfirmProvider({ children }) {
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Xác nhận',
    cancelText: 'Hủy',
    type: 'danger', // 'danger' or 'warning'
    onConfirm: null,
    onCancel: null,
  });

  const showConfirm = useCallback(({ title, message, confirmText, cancelText, type }) => {
    return new Promise((resolve) => {
      setConfirmState({
        isOpen: true,
        title: title || 'Xác nhận',
        message: message || 'Bạn có chắc chắn?',
        confirmText: confirmText || 'Xác nhận',
        cancelText: cancelText || 'Hủy',
        type: type || 'danger',
        onConfirm: () => {
          setConfirmState((prev) => ({ ...prev, isOpen: false }));
          resolve(true);
        },
        onCancel: () => {
          setConfirmState((prev) => ({ ...prev, isOpen: false }));
          resolve(false);
        },
      });
    });
  }, []);

  return (
    <ConfirmContext.Provider value={{ showConfirm }}>
      {children}
      {confirmState.isOpen && (
        <div className="confirm-backdrop" onClick={confirmState.onCancel}>
          <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <div className={`confirm-icon-wrapper confirm-icon-${confirmState.type}`}>
              {confirmState.type === 'danger' ? '⚠️' : '❓'}
            </div>
            <h3 className="confirm-title">{confirmState.title}</h3>
            <p className="confirm-message">{confirmState.message}</p>
            <div className="confirm-actions">
              <button
                className="btn btn-ghost"
                onClick={confirmState.onCancel}
              >
                {confirmState.cancelText}
              </button>
              <button
                className={`btn ${confirmState.type === 'danger' ? 'btn-danger' : 'btn-primary'}`}
                onClick={confirmState.onConfirm}
              >
                {confirmState.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}
