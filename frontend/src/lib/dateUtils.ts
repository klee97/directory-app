/**
 * Check if a post is published based on Eastern Time
 * Compares the published date against the current time in Eastern Time zone
 */
export function isPublishedInEasternTime(publishedDate: string | Date): boolean {
  const postDate = new Date(publishedDate);

  // Get current time in Eastern Time
  const now = new Date();
  const easternTimeString = now.toLocaleString('en-US', {
    timeZone: 'America/New_York',
  });
  const easternNow = new Date(easternTimeString);

  return postDate <= easternNow;
}
