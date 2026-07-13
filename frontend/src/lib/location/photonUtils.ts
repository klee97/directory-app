import { LocationResult } from "@/types/location";
import { retryFetch } from "@/utils/retryFetch";

const PHOTON_TIMEOUT_MS = 5000;
const PHOTON_RETRY_ATTEMPTS = 2;

async function fetchWithTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error("Photon API timeout")), timeoutMs)),
  ]);
}

export async function fetchPhotonResults(
  fetchFunction: () => Promise<LocationResult[]>
): Promise<LocationResult[]> {
  return retryFetch(() => fetchWithTimeout(fetchFunction(), PHOTON_TIMEOUT_MS), PHOTON_RETRY_ATTEMPTS);
}

export async function fetchPhotonResult(
  fetchFunction: () => Promise<LocationResult | null>
): Promise<LocationResult | null> {
  return retryFetch(() => fetchWithTimeout(fetchFunction(), PHOTON_TIMEOUT_MS), PHOTON_RETRY_ATTEMPTS);
}
