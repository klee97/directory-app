import { fetchPhotonResults } from "@/lib/location/geocode";
import { LocationResult } from "@/types/location";
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';


// Popular wedding destinations to geocode
const DESTINATIONS_TO_GEOCODE = [
  // Major Cities
  'New York City, NY, USA',
  'Los Angeles, CA, USA',
  'San Francisco, CA,  USA',
  'Fremont, CA, USA',
  'San Diego, CA, USA',
  'San Jose, CA, USA',
  'Sacramento, CA, USA',
  'San Gabriel, CA, USA',
  'Chicago, IL, USA',
  'Miami, FL, USA',
  'Manassas, VA, USA',
  'Seattle, WA, USA',
  'Austin, TX, USA',
  'Houston, TX, USA',
  'Dallas, TX, USA',
  'Atlanta, GA, USA',
  'Boston, MA, USA',
  'Philadelphia, PA, USA',
  'Pittsburgh, PA, USA',
  'Cleveland, OH, USA',
  'Detroit, MI, USA',
  'Minneapolis, MN, USA',
  'Denver, CO, USA',
  'Portland, OR, USA',
  'Phoenix, AZ, USA',
  'Washington DC, USA',
  'Toronto, Canada',
  'Vancouver, Canada',
  'Montreal, Canada',
  'Ontario, Canada',
  'Calgary, Canada',
  'Paris, France',
  'London, United Kingdom',
  'Lisbon, Portugal',
  // 'Sydney, Australia',
  // 'Melbourne, Australia',


  // States
  'California, United States',
  'Texas, United States',
  'Florida, United States',
  'Connecticut, United States',
  'Massachusetts, United States',
  'Illinois, United States',
  'Washington, United States',
  'Virginia, United States',
  'New Jersey, United States',
  'Pennsylvania, United States',
  'New York, United States',
  'Oklahoma, United States',
  'Hawaii, United States',
  'British Columbia, Canada',
  'Quebec, Canada',
  'Ontario, Canada',

  // Countries
  'France',
  'United Kingdom',
  'Canada',
  'United States',
  'Australia',
  'Spain',
  'Portugal'
];

interface PopulatedLocation extends LocationResult {
  search_query: string;
  photon_success: boolean;
  error?: string;
}

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function geocodeLocation(query: string): Promise<PopulatedLocation> {
  console.log(`Geocoding: ${query}`);

  try {
    const results = await fetchPhotonResults(query);

    if (results.length === 0) {
      console.warn(`  ❌ No results for: ${query}`);
      return {
        display_name: query.split(',')[0], // Use city name only
        search_query: query,
        photon_success: false,
        error: 'No results found'
      };
    }

    const best = results[0]; // Take the first (usually best) result
    console.log(`  ✅ Found: ${best.display_name} (${best.lat}, ${best.lon})`);

    return {
      display_name: best.display_name,
      lat: best.lat,
      lon: best.lon,
      type: best.type,
      address: best.address,
      search_query: query,
      photon_success: true
    };

  } catch (error) {
    const errorMessage = typeof error === 'object' && error !== null && 'message' in error
      ? (error as { message: string }).message
      : String(error);
    console.error(`  ❌ Error geocoding ${query}:`, errorMessage);
    return {
      display_name: query.split(',')[0],
      search_query: query,
      photon_success: false,
      error: errorMessage
    };
  }
}

async function main() {
  console.log(`Starting geocoding of ${DESTINATIONS_TO_GEOCODE.length} locations...\n`);

  const results: PopulatedLocation[] = [];
  let successCount = 0;
  let failureCount = 0;

  for (const query of DESTINATIONS_TO_GEOCODE) {
    const result = await geocodeLocation(query);
    results.push(result);

    if (result.photon_success) {
      successCount++;
    } else {
      failureCount++;
    }

    // Rate limit - wait 1 second between requests to be nice to Photon API
    await delay(1000);
  }

  console.log(`\n📊 Summary:`);
  console.log(`✅ Successfully geocoded: ${successCount}`);
  console.log(`❌ Failed: ${failureCount}`);

  // Separate successful and failed results
  const successful = results.filter(r => r.photon_success);
  const failed = results.filter(r => !r.photon_success);

  // Save successful results
  const outputPath = path.join(process.cwd(), 'data', 'populated-locations.json');
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, JSON.stringify(successful, null, 2));
  console.log(`\n💾 Saved ${successful.length} successful locations to: ${outputPath}`);

  // Save TypeScript constants file
  const tsOutputPath = path.join(process.cwd(), 'src', 'lib', 'location', 'populated-cities.ts');
  const tsContent = generateTSFile(successful, failed);
  await fs.mkdir(path.dirname(tsOutputPath), { recursive: true });
  await fs.writeFile(tsOutputPath, tsContent);
  console.log(`📝 Generated TypeScript file: ${tsOutputPath}`);

  if (failed.length > 0) {
    console.log(`\n❌ Failed locations that need manual review:`);
    failed.forEach(f => console.log(`  - ${f.search_query}: ${f.error}`));
  }
}

function generateTSFile(successful: PopulatedLocation[], failed: PopulatedLocation[]): string {
  const successfulCode = successful.map(location => {
    const { search_query, photon_success, error, ...cleanLocation } = location;
    return `  ${JSON.stringify(cleanLocation)}`;
  }).join(',\n');

  const failedQueries = failed.map(f => f.search_query);

  return `// Auto-generated by populate-location-coordinates.ts
// Generated on: ${new Date().toISOString()}
// Successfully geocoded: ${successful.length}/${successful.length + failed.length} locations

import { LocationResult } from '@/types/location';

export const POPULATED_WEDDING_DESTINATIONS: LocationResult[] = [
${successfulCode}
];

// Failed geocoding (requires manual coordinates):
${failedQueries.length > 0 ? `// ${failedQueries.join('\n// ')}` : '// All locations successfully geocoded!'}

export function findLocationByName(name: string): LocationResult | undefined {
  return POPULATED_WEDDING_DESTINATIONS.find(
    location => location.display_name.toLowerCase().includes(name.toLowerCase()) ||
                location.address?.city?.toLowerCase().includes(name.toLowerCase())
  );
}

export function getLocationCoordinates(name: string): { lat: number; lon: number } | null {
  const location = findLocationByName(name);
  return location?.lat && location?.lon ? { lat: location.lat, lon: location.lon } : null;
}
`;
}

// Run the script
const isMain = process.argv[1] === fileURLToPath(import.meta.url);

if (isMain) {
  main().catch(console.error);
}