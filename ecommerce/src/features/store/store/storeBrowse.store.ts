import { create } from 'zustand';

interface StoreBrowseState {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
}

export const useStoreBrowseStore = create<StoreBrowseState>((set) => ({
  selectedCategory: 'all',
  setSelectedCategory: (selectedCategory) => set({ selectedCategory })
}));
