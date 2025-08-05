import { rawPhotonFetch } from "@/lib/location/geocode";
import { fetchPhotonResults } from "@/lib/location/photonUtils";
import { LocationResult } from "@/types/location";
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';


// Popular wedding destinations to geocode
const DESTINATIONS_TO_GEOCODE = [
  // Top searches
  'New York City, NY, United States',
  'San Francisco, CA, United States',
  'Toronto, Canada',
  'Boston, MA, United States',
  'Los Angeles, CA, United States',

  // Major Cities
  'Chicago, IL, United States',
  'Houston, TX, United States',
  'Seattle, WA, United States',
  'Washington DC, DC, United States',
  'Philadelphia, PA, United States',
  'San Antonio, TX, United States',
  'San Diego, CA, United States',
  'Dallas, TX, United States',
  'Jacksonville, FL, United States',
  'Austin, TX, United States',
  'Fort Worth, TX, United States',
  'San Jose, CA, United States',
  'Columbus, OH, United States',
  'Charlotte, NC, United States',
  'Indianapolis, IN, United States',
  'Denver, CO, United States',
  'Oklahoma City, OK, United States',
  'Fremont, CA, United States',
  'Phoenix, AZ, United States',
  'Sacramento, CA, United States',
  'San Gabriel, CA, United States',
  'Miami, FL, United States',
  'Manassas, VA, United States',
  'Fairfax, VA, United States',
  'Sterling, VA, United States',
  'Atlanta, GA, United States',
  'Raleigh, NC, United States',
  'Pittsburgh, PA, United States',
  'Cleveland, OH, United States',
  'Detroit, MI, United States',
  'Minneapolis, MN, United States',
  'Portland, OR, United States',
  'North Reading, MA, United States',
  'Nashville, TN, United States',
  'Orlando, FL, United States',
  'Tampa, FL, United States',
  'St. Louis, MO, United States',
  'Baltimore, MD, United States',
  'Richmond, VA, United States',
  'Cincinnati, OH, United States',

  'Vancouver, Canada',
  'Montreal, Canada',
  'Ontario, Canada',
  'Brampton, Ontario, Canada',
  'Calgary, Canada',
  'Paris, France',
  'London, United Kingdom',
  'Elsinore, United Kingdom',

  'Lisbon, Portugal',
  'Barcelona, Spain',


  // States
  'California, United States',
  'Texas, United States',
  'Florida, United States',
  'New York, United States',
  'Pennsylvania, United States',
  'Illinois, United States',
  'Ohio, United States',
  'Georgia, United States',
  'North Carolina, United States',
  'Michigan, United States',
  'New Jersey, United States',
  'Virginia, United States',
  'Washington, United States',
  'Arizona, United States',
  'Tennessee, United States',
  'Massachusetts, United States',
  'Indiana, United States',
  'Missouri, United States',
  'Maryland, United States',
  'Wisconsin, United States',
  'Colorado, United States',
  'Minnesota, United States',
  'South Carolina, United States',
  'Alabama, United States',
  'Louisiana, United States',
  'Kentucky, United States',
  'Oregon, United States',
  'Oklahoma, United States',
  'Connecticut, United States',
  'Utah, United States',
  'Iowa, United States',
  'Nevada, United States',
  'Arkansas, United States',
  'Mississippi, United States',
  'New Mexico, United States',
  'Nebraska, United States',
  'Idaho, United States',
  'West Virginia, United States',
  'Hawaii, United States',
  'New Hampshire, United States',
  'Maine, United States',
  'Montana, United States',
  'Rhode Island, United States',
  'Delaware, United States',
  'South Dakota, United States',
  'North Dakota, United States',
  'Alaska, United States',
  'Vermont, United States',
  'Wyoming, United States',

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
  'Portugal',
  'Italy',
  'Switzerland',
  'Norway'
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
    const results = await fetchPhotonResults(() => rawPhotonFetch(query));

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

export const POPULATED_LOCATIONS: LocationResult[] = [
${successfulCode}
];

// Failed geocoding (requires manual coordinates):
${failedQueries.length > 0 ? `// ${failedQueries.join('\n// ')}` : '// All locations successfully geocoded!'}

export function findLocationByName(name: string): LocationResult | undefined {
  return POPULATED_LOCATIONS.find(
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