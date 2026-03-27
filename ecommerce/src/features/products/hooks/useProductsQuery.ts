import { useQuery } from '@tanstack/react-query';
import { getProducts, productsKeys } from '@/features/products/services/products.service';

export function useProductsQuery() {
  return useQuery({
    queryKey: productsKeys.list(),
    queryFn: getProducts
  });
}
