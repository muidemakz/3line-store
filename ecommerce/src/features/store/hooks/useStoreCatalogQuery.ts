import { useQuery } from '@tanstack/react-query';
import { getCatalog, storeKeys } from '@/features/store/services/store.service';

export function useStoreCatalogQuery() {
  return useQuery({
    queryKey: storeKeys.list(),
    queryFn: getCatalog
  });
}
