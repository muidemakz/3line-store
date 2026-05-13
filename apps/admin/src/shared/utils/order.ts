import { capitalize } from './string';

export type OrderStatus = 'pending' | 'approved' | 'cancelled';

export function orderStatusLabel(status: OrderStatus): string {
  return capitalize(status);
}

export function orderStatusClass(status: OrderStatus): string {
  if (status === 'approved') return 'statusBadge statusBadge--active';
  if (status === 'pending') return 'statusBadge statusBadge--upcoming';
  return 'statusBadge'; // cancelled
}
