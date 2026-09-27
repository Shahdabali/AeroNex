/** "18:30" from an IST ISO string such as 2026-10-06T18:30:00+05:30 (the API always emits IST). */
export const clock = (iso: string) => iso.slice(11, 16);

/** Calendar date (YYYY-MM-DD, IST) of an ISO string from the API. */
export const dayOf = (iso: string) => iso.slice(0, 10);

export const durationLabel = (min: number) => `${Math.floor(min / 60)}h ${String(min % 60).padStart(2, '0')}m`;

export const dateLabel = (iso: string) =>
  new Date(dayOf(iso) + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
