import { QueryClient } from '@tanstack/react-query';

/**
 * React Query client configuration
 * Optimized for caching and performance
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes
      staleTime: 5 * 60 * 1000,

      // Keep unused data in cache for 10 minutes
      gcTime: 10 * 60 * 1000,

      // Refetch on window focus for fresh data
      refetchOnWindowFocus: true,

      // Retry failed requests once
      retry: 1,

      // Don't refetch on mount if data is fresh
      refetchOnMount: false,
    },
    mutations: {
      // Retry mutations once on failure
      retry: 1,
    },
  },
});
