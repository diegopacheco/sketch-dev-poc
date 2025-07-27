import React, { createContext, useContext, useState, ReactNode } from 'react';
import Toast, { ToastProps } from '../components/Toast';

interface ToastContextType {
  showToast: (message: string, type?: 'success' | 'error' | 'info', duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<(ToastProps & { id: string })[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success', duration: number = 3000) => {
    const id = Date.now().toString();
    const newToast = {
      id,
      message,
      type,
      duration,
      onClose: removeToast,
    };

    setToasts(prev => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div style={{ position: 'fixed', top: 0, right: 0, zIndex: 1000 }}>
        {toasts.map((toast, index) => (
          <div
            key={toast.id}
            style={{
              position: 'relative',
              top: `${index * 80}px`,
            }}
          >
            <Toast {...toast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
