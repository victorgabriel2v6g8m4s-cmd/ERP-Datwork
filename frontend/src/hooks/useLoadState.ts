import { useCallback, useState } from 'react';

export type LoadStatus = 'loading' | 'success' | 'error';

export function useLoadState(initialStatus: LoadStatus = 'loading') {
  const [status, setStatus] = useState<LoadStatus>(initialStatus);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const beginLoading = useCallback(() => {
    setStatus('loading');
    setErrorMessage(null);
  }, []);

  const markLoaded = useCallback(() => {
    setStatus('success');
    setErrorMessage(null);
  }, []);

  const markFailed = useCallback((message: string) => {
    setStatus('error');
    setErrorMessage(message);
  }, []);

  return {
    status,
    isLoading: status === 'loading',
    errorMessage,
    beginLoading,
    markLoaded,
    markFailed
  };
}
