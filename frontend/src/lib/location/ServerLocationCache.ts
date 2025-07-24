import { LocationCacheEntry, LocationResult } from '@/types/location';
import { LRUCache } from 'lru-cache';

class ServerLocationCache {
  private geocodeCache: LRUCache<string, LocationCacheEntry>;
  
  constructor() {
    this.geocodeCache = new LRUCache({
      max: 10000, // Store up to 10k locations
      ttl: 1000 * 60 * 60 * 24 * 30, // 30 days TTL
      updateAgeOnGet: true, // Refresh TTL on access
    });
  }

  private normalizeKey(displayName: string): string {
    return displayName.toLowerCase().trim();
  }

  get(displayName: string): LocationResult | null {
    const key = this.normalizeKey(displayName);
    const entry = this.geocodeCache.get(key);
    
    if (entry) {
      console.debug('Location cache hit:', displayName);
      return entry.location;
    }
    
    return null;
  }

  set(displayName: string, location: LocationResult, source: LocationCacheEntry['source'] = 'geocoding') {
    const key = this.normalizeKey(displayName);
    const entry: LocationCacheEntry = {
      location,
      timestamp: Date.now(),
      source
    };
    
    this.geocodeCache.set(key, entry);
    console.debug('Location cached:', displayName, 'source:', source);
  }

  // Pre-populate with known locations
  preload(locations: Array<{ displayName: string; location: LocationResult }>) {
    locations.forEach(({ displayName, location }) => {
      this.set(displayName, location, 'preloaded');
    });
    console.debug('Pre-loaded', locations.length, 'locations into cache');
  }

  getStats() {
    return {
      size: this.geocodeCache.size,
      calculatedSize: this.geocodeCache.calculatedSize,
    };
  }
}

// Create singleton instance
export const serverLocationCache = new ServerLocationCache();
