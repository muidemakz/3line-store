import { capitalize } from './string';

export type SessionStatus = 'upcoming' | 'active' | 'completed';

export function deriveSessionStatus(startDate: string, endDate: string): SessionStatus {
  const now = new Date();
  if (now < new Date(startDate)) return 'upcoming';
  if (now > new Date(endDate)) return 'completed';
  return 'active';
}

export function sessionStatusLabel(status: SessionStatus): string {
  return capitalize(status);
}

export function sessionStatusClass(status: SessionStatus): string {
  if (status === 'active') return 'statusBadge statusBadge--active';
  if (status === 'upcoming') return 'statusBadge statusBadge--upcoming';
  return 'statusBadge';
}
