import { useCallback } from 'react';
import { useToast } from '../contexts/ToastContext';
import { getErrorMessage } from '../lib/axios';

export const useApiError = () => {
  const { showError } = useToast();

  const handleError = useCallback(
    (error: unknown, customMessage?: string) => {
      const message = customMessage || getErrorMessage(error);
      showError(message);
      console.error('API Error:', error);
    },
    [showError]
  );

  return { handleError };
};
