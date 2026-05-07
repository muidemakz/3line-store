import { axiosInstance } from '@/shared/api/axios';
import type { Product, ProductsListResponse } from '@/shared/types/api.entities';

export const storeKeys = {
  all: ['store', 'catalog'] as const,
  list: () => [...storeKeys.all, 'list'] as const
};

export async function getCatalog(): Promise<Product[]> {
  const { data } = await axiosInstance.get<ProductsListResponse>('/products');
  return data.products;
}
