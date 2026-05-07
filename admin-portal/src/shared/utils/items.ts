import type { StoreItem } from '@/shared/store/data.store';

export function resolveItemMeta(itemId: string, items: StoreItem[]): { title: string; unit: string } {
  const item = items.find(i => i.id === itemId);
  return {
    title: item?.title ?? `Item #${itemId}`,
    unit: item?.unit ?? '—',
  };
}
