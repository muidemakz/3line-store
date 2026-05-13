import { create } from 'zustand';
import type { Product } from '@/shared/types/api.entities';

export interface CartLine {
  product: Product;
  quantity: number;
}

interface CartState {
  lines: CartLine[];
  add: (product: Product, quantity?: number) => void;
  remove: (productId: string | number) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  lines: [],
  add: (product, quantity = 1) => {
    const lines = get().lines;
    const existing = lines.find((l) => String(l.product.id) === String(product.id));
    if (existing) {
      set({
        lines: lines.map((l) =>
          String(l.product.id) === String(product.id)
            ? { ...l, quantity: l.quantity + quantity }
            : l
        )
      });
    } else {
      set({ lines: [...lines, { product, quantity }] });
    }
  },
  remove: (productId) =>
    set({ lines: get().lines.filter((l) => String(l.product.id) !== String(productId)) }),
  clear: () => set({ lines: [] })
}));
