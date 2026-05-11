const dateFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  timeZone: 'UTC',
});

export function formatDateUTC(date: string | Date): string {
  return dateFormatter.format(new Date(date));
}
