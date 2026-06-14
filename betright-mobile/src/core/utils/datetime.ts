/**
 * Lightweight date helpers for fixture display. Avoids pulling a date library for
 * the FE phase; swap for date-fns/Day.js if formatting needs grow.
 */
const TIME_FMT = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
const DAY_FMT = new Intl.DateTimeFormat('en-GB', { weekday: 'short' });

export function formatKickoffTime(iso: string): string {
  try {
    return TIME_FMT.format(new Date(iso));
  } catch {
    return '';
  }
}

export function formatKickoffDay(iso: string): string {
  try {
    return DAY_FMT.format(new Date(iso));
  } catch {
    return '';
  }
}

export function formatKickoffLabel(iso: string): string {
  const day = formatKickoffDay(iso);
  const time = formatKickoffTime(iso);
  return `${day} ${time}`.trim();
}
