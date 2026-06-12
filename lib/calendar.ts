// Lightweight date helpers for the schedule calendar.
// No external date library — the project ships none, so we keep it to plain Date.

export const HEBREW_MONTHS = [
  "ינואר",
  "פברואר",
  "מרץ",
  "אפריל",
  "מאי",
  "יוני",
  "יולי",
  "אוגוסט",
  "ספטמבר",
  "אוקטובר",
  "נובמבר",
  "דצמבר",
] as const;

// Week starts on Sunday (index 0) — the Israeli convention.
export const HEBREW_WEEKDAYS_SHORT = ["א", "ב", "ג", "ד", "ה", "ו", "ש"] as const;
export const HEBREW_WEEKDAYS_LONG = [
  "ראשון",
  "שני",
  "שלישי",
  "רביעי",
  "חמישי",
  "שישי",
  "שבת",
] as const;

/** YYYY-MM-DD in local time — our canonical key for a calendar day. */
export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function fromISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function addMonths(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

export function addDays(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount);
}

/** Sunday-anchored start of the week containing `date`. */
export function startOfWeek(date: Date): Date {
  return addDays(date, -date.getDay());
}

export function endOfWeek(date: Date): Date {
  return addDays(startOfWeek(date), 6);
}

/**
 * A 6×7 grid of days covering the month of `date`, padded with the
 * trailing/leading days of the neighbouring months — exactly like Google
 * Calendar's month view.
 */
export function getMonthGrid(date: Date): Date[] {
  const firstCell = startOfWeek(startOfMonth(date));
  return Array.from({ length: 42 }, (_, i) => addDays(firstCell, i));
}

export function formatMonthTitle(date: Date): string {
  return `${HEBREW_MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

/** "6 ביוני" — a single day, no year. */
export function formatDayShort(date: Date): string {
  return `${date.getDate()} ב${HEBREW_MONTHS[date.getMonth()]}`;
}

/** "31 במאי – 6 ביוני" — the selected day range, smallest first. */
export function formatDayRange(start: Date, end: Date): string {
  return `${formatDayShort(start)} – ${formatDayShort(end)}`;
}

export function formatDayLong(date: Date): string {
  return `יום ${HEBREW_WEEKDAYS_LONG[date.getDay()]}, ${date.getDate()} ב${HEBREW_MONTHS[date.getMonth()]}`;
}

/** Inclusive day count between two ISO dates. */
export function daysBetweenInclusive(startISO: string, endISO: string): number {
  const start = fromISODate(startISO).getTime();
  const end = fromISODate(endISO).getTime();
  return Math.round(Math.abs(end - start) / 86_400_000) + 1;
}
