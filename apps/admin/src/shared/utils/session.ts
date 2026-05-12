import { capitalize } from './string';

export type SessionStatus = 'upcoming' | 'active' | 'completed' | 'deactivated';

/**
 * Derives the display status of a session.
 *
 * Rules (in priority order):
 *  1. isActive = true                        → 'active'
 *  2. isActive = false & endDate < now       → 'completed'
 *  3. isActive = false & startDate > now     → 'upcoming'
 *  4. isActive = false & in-date range       → 'deactivated'
 */
export function deriveSessionStatus(
  startDate: string,
  endDate: string,
  isActive?: boolean,
): SessionStatus {
  if (isActive) return 'active';
  const now = new Date();
  if (now > new Date(endDate)) return 'completed';
  if (now < new Date(startDate)) return 'upcoming';
  return 'deactivated';
}

export function sessionStatusLabel(status: SessionStatus): string {
  if (status === 'deactivated') return 'Deactivated';
  return capitalize(status);
}

export function sessionStatusClass(status: SessionStatus): string {
  if (status === 'active')      return 'statusBadge statusBadge--active';
  if (status === 'upcoming')    return 'statusBadge statusBadge--upcoming';
  if (status === 'deactivated') return 'statusBadge statusBadge--deactivated';
  return 'statusBadge statusBadge--completed';
}
