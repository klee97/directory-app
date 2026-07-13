const EASTERN_FORMATTER = new Intl.DateTimeFormat('sv-SE', {
  timeZone: 'America/New_York',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
});

/**
 * Check if a post is published based on Eastern Time
 * Compares the published date against the current time in Eastern Time zone
 */
export function isPublishedInEasternTime(publishedDate: string | Date | null | undefined): boolean {
  if (!publishedDate) return false; // no date = not published
  const postDate = new Date(publishedDate);
  if (Number.isNaN(postDate.getTime())) return false;
  const postEastern = EASTERN_FORMATTER.format(postDate);
  const nowEastern = EASTERN_FORMATTER.format(new Date());
  return postEastern <= nowEastern;
}