import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchReconciliationData } from '../lib/xero.js';
import { CACHE_STALE_MS } from '../lib/constants.js';

export const RECON_KEY = ['reconciliation'];

export function useReconciliation() {
  return useQuery({
    queryKey: RECON_KEY,
    queryFn:  fetchReconciliationData,
    staleTime: CACHE_STALE_MS,
    retry(failureCount, error) {
      if (error.message === 'NOT_AUTHENTICATED') return false;
      if (error.message.includes('403'))          return false;
      if (error.message === 'NO_TENANT')          return false;
      return failureCount < 2;
    },
    retryDelay: attempt => attempt * 1500,
  });
}

export function useForceRefresh() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: RECON_KEY });
}
