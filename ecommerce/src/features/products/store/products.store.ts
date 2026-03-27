import { create } from 'zustand';

interface ProductsStoreState {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
}

export const useProductsStore = create<ProductsStoreState>((set) => ({
  selectedCategory: 'all',
  setSelectedCategory: (selectedCategory) => set({ selectedCategory })
}));
