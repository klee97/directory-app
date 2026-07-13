import { LocationResult } from "@/types/location";

const PHOTON_TIMEOUT_MS = 5000;

async function fetchWithTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error("Photon API timeout")), timeoutMs)),
  ]);
}


export async function fetchPhotonResults(
  fetchFunction: () => Promise<LocationResult[]>,
  attempts = 2
): Promise<LocationResult[]> {
  let lastError: unknown;

  for (let i = 0; i < attempts; i++) {
    try {
      return await fetchWithTimeout(fetchFunction(), PHOTON_TIMEOUT_MS);
    } catch (err) {
      lastError = err;
      console.warn(`Photon API attempt ${i + 1}/${attempts} failed:`, err);
    }
  }

  throw lastError;
}

export async function fetchPhotonResult(
  fetchFunction: () => Promise<LocationResult | null>
): Promise<LocationResult | null> {
  const tryFetch = async () => await fetchWithTimeout(fetchFunction(), PHOTON_TIMEOUT_MS);

  try {
    return await tryFetch();
  } catch (err) {
    console.warn("Photon API failed, retrying once:", err);
    try {
      return await tryFetch();
    } catch (retryErr) {
      console.error("Photon retry failed:", retryErr);
      return null;
    }
  }
}

