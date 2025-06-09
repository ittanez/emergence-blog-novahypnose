import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

interface PrefetchConfig {
  queryKey: string[];
  queryFn: () => Promise<unknown>;
  staleTime?: number;
  enabled?: boolean;
}

export const useSmartPrefetch = (configs: PrefetchConfig[]) => {
  const queryClient = useQueryClient();
  const prefetchedRef = useRef(new Set<string>());

  useEffect(() => {
    const prefetchWithDelay = () => {
      configs.forEach(({ queryKey, queryFn, staleTime = 30000, enabled = true }) => {
        if (!enabled) return;
        
        const keyString = JSON.stringify(queryKey);
        
        // Avoid duplicate prefetches
        if (prefetchedRef.current.has(keyString)) return;
        
        // Check if data is already cached and fresh
        const cachedData = queryClient.getQueryData(queryKey);
        const queryState = queryClient.getQueryState(queryKey);
        
        if (cachedData && queryState?.dataUpdatedAt && 
            Date.now() - queryState.dataUpdatedAt < staleTime) {
          return;
        }

        // Prefetch when browser is idle
        if (window.requestIdleCallback) {
          window.requestIdleCallback(() => {
            queryClient.prefetchQuery({
              queryKey,
              queryFn,
              staleTime
            });
            prefetchedRef.current.add(keyString);
          });
        } else {
          // Fallback for browsers without requestIdleCallback
          setTimeout(() => {
            queryClient.prefetchQuery({
              queryKey,
              queryFn,
              staleTime
            });
            prefetchedRef.current.add(keyString);
          }, 100);
        }
      });
    };

    // Delay prefetch to avoid blocking main thread
    const timeoutId = setTimeout(prefetchWithDelay, 1000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [configs, queryClient]);
};

export const useHoverPrefetch = (
  element: HTMLElement | null,
  queryKey: string[],
  queryFn: () => Promise<unknown>
) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!element) return;

    let prefetchTimeout: NodeJS.Timeout;

    const handleMouseEnter = () => {
      // Delay prefetch slightly to avoid unnecessary requests
      prefetchTimeout = setTimeout(() => {
        queryClient.prefetchQuery({
          queryKey,
          queryFn,
          staleTime: 60000 // 1 minute
        });
      }, 200);
    };

    const handleMouseLeave = () => {
      if (prefetchTimeout) {
        clearTimeout(prefetchTimeout);
      }
    };

    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      if (prefetchTimeout) {
        clearTimeout(prefetchTimeout);
      }
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [element, queryKey, queryFn, queryClient]);
};

export default useSmartPrefetch;