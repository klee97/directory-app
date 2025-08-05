import { LocationResult } from "@/types/location";

export async function resolveLocationFromDisplayName(
  displayName: string
): Promise<LocationResult> {
  const encodedName = encodeURIComponent(displayName.trim());
  try {
    const response = await fetch(`/api/geocode?q=${encodedName}`);
    if (!response.ok) {
      throw new Error(`Geocoding failed: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Location resolution failed:', displayName, error);
    // Return minimal location object as fallback
    return { display_name: displayName } as LocationResult;
  }
}