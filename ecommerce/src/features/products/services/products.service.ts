import { axiosInstance } from '@/shared/api/axios';
import type { Product, ProductsResponse } from '@/features/products/types/products.types';

export const productsKeys = {
  all: ['products'] as const,
  list: () => [...productsKeys.all, 'list'] as const
};

export async function getProducts(): Promise<Product[]> {
  const { data } = await axiosInstance.get<ProductsResponse>('/products');
  return data.products;
}
