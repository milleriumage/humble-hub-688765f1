import { useState, useCallback } from 'react';

interface ToastOptions {
  title: string;
  description?: string;
}

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastOptions[]>([]);

  const toast = useCallback((options: ToastOptions) => {
    // Simple implementation - just show an alert for now
    // In a production app, you'd want a proper toast component
    alert(`${options.title}\n${options.description || ''}`);
    setToasts(prev => [...prev, options]);
  }, []);

  return { toast, toasts };
};
