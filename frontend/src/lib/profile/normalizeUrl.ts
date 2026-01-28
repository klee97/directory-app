export const normalizeUrl = (url: string): string => {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  
  // Check if it already has a protocol
  if (trimmed.match(/^[a-zA-Z][a-zA-Z\d+\-.]*:/)) {
    return trimmed;
  }
  
  // Add https:// if missing
  return `https://${trimmed}`;
};