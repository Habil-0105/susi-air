export function getUtcDateOnly(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

export function formatUtcDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function addDaysUtc(date: Date, days: number): Date {
  const newDate = new Date(date.getTime());
  newDate.setUTCDate(date.getUTCDate() + days);
  return newDate;
}

export function diffDaysUtc(d1: Date, d2: Date): number {
  return Math.floor((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
}
