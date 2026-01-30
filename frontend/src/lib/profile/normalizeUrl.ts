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


export const isValidUrl = (url: string): boolean => {
  if (!url) return true; // Empty is valid (optional field)

  const normalized = normalizeUrl(url);

  try {
    const urlObj = new URL(normalized);

    // Check for valid protocol
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return false;
    }

    // Check for valid hostname (has at least one dot or is localhost)
    const hostname = urlObj.hostname;
    if (hostname === 'localhost' || hostname.includes('.')) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
};

export const getUrlErrorMessage = (url: string): string | null => {
  if (!url) return null;

  if (!isValidUrl(url)) {
    return 'Please enter a valid URL';
  }

  return null;
};

export const isValidGoogleMapsUrl = (url: string): boolean => {
  if (!url) return true; // Empty is valid (optional field)

  const normalized = normalizeUrl(url);

  try {
    const urlObj = new URL(normalized);

    // Check if it's a Google Maps domain
    const validDomains = [
      'google.com',
      'www.google.com',
      'maps.google.com',
      'goo.gl', // Short links
      'maps.app.goo.gl' // New short links
    ];

    const hostname = urlObj.hostname;
    const isGoogleDomain = validDomains.some(domain =>
      hostname === domain || hostname.endsWith(`.${domain}`)
    );

    if (!isGoogleDomain) {
      return false;
    }

    // Check for maps-related paths
    const path = urlObj.pathname;
    const validPaths = ['/maps', '/place', '/search'];
    const hasValidPath = validPaths.some(p => path.startsWith(p)) || hostname.includes('goo.gl');

    return hasValidPath;
  } catch {
    return false;
  }
};

export const getGoogleMapsErrorMessage = (url: string): string | null => {
  if (!url) return null;

  // First check if it's a valid URL at all
  if (!isValidUrl(url)) {
    return 'Please enter a valid URL';
  }

  // Then check if it's specifically a Google Maps URL
  if (!isValidGoogleMapsUrl(url)) {
    return 'Please enter a valid Google Maps link';
  }

  return null;
};