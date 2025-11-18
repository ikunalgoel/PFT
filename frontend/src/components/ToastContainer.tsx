import React from 'react';
import { Toast, ToastProps } from './Toast';

interface ToastContainerProps {
  toasts: Omit<ToastProps, 'onClose'>[];
  onClose: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onClose }) => {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <div className="pointer-events-auto">
        {toasts.map((toast) => (
          <div key={toast.id} className="mb-2">
            <Toast {...toast} onClose={onClose} />
          </div>
        ))}
      </div>
    </div>
  );
};
