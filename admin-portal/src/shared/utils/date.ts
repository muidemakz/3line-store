/**
 * Formats an ISO date string for display (e.g. "01/10/2025").
 * Falls back to the raw value if parsing fails.
 */
export function formatDate(iso: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
