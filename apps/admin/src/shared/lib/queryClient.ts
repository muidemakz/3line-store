import { QueryClient } from '@tanstack/react-query';
import { notifyError } from '@/shared/lib/toast';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 60_000,
      refetchOnWindowFocus: false
    },
    mutations: {
      onError: (error) => {
        const message = error instanceof Error ? error.message : 'Unable to complete request';
        notifyError(message);
      }
    }
  }
});
