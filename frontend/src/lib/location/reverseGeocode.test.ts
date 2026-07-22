import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { rawReversePhotonFetch } from "@/lib/location/reverseGeocode";
import { LOCATION_TYPE_CITY, LOCATION_TYPE_STATE } from "@/types/location";


vi.mock("@/lib/location/locationNames", () => ({
  getDisplayName: vi.fn(
    (city?: string, state?: string, country?: string) =>
      [city, state, country].filter(Boolean).join(", ")
  ),
}));

function mockPhotonResponse(features: unknown[], ok = true, status = 200) {
  global.fetch = vi.fn().mockResolvedValue({
    ok,
    status,
    json: async () => ({ features }),
  }) as unknown as typeof fetch;
}

function houseFeature(overrides: Record<string, unknown> = {}) {
  return {
    type: "Feature",
    properties: {
      osm_type: "N",
      osm_id: 1,
      type: "house",
      city: "San Francisco",
      state: "California",
      country: "United States",
      ...overrides,
    },
    geometry: { type: "Point", coordinates: [-122.4189539, 37.7748879] },
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("rawReversePhotonFetch", () => {
  it("resolves via a nearby non-city feature that carries city/state properties (the SF regression case)", async () => {
    // This is the exact shape of the real Photon response that previously
    // caused SF to fail: nearest feature is a house, not a city, but it
    // carries city/state/country properties directly.
    mockPhotonResponse([houseFeature()]);

    const result = await rawReversePhotonFetch(37.774929, -122.419);

    expect(result).not.toBeNull();
    expect(result!.address?.city).toBe("San Francisco");
    expect(result!.address?.state).toBe("California");
    expect(result!.type).toBe(LOCATION_TYPE_CITY);
  });

  it("falls back to state when the nearest feature has no city", async () => {
    mockPhotonResponse([
      houseFeature({ city: undefined, state: "Wyoming", type: "house" }),
    ]);

    const result = await rawReversePhotonFetch(43.0, -107.5);

    expect(result).not.toBeNull();
    expect(result!.address?.city).toBeUndefined();
    expect(result!.address?.state).toBe("Wyoming");
    expect(result!.type).toBe(LOCATION_TYPE_STATE);
  });

  it("uses the feature's own name when it IS a city but has no separate city property", async () => {
    mockPhotonResponse([
      houseFeature({ type: LOCATION_TYPE_CITY, name: "Paris", city: undefined, state: "Île-de-France" }),
    ]);

    const result = await rawReversePhotonFetch(48.8566, 2.3522);

    expect(result).not.toBeNull();
    expect(result!.address?.city).toBe("Paris");
    expect(result!.type).toBe(LOCATION_TYPE_CITY);
  });

  it("uses the feature's own name when it IS a state but has no separate state property", async () => {
    mockPhotonResponse([
      houseFeature({ type: LOCATION_TYPE_STATE, name: "California", city: undefined, state: undefined }),
    ]);

    const result = await rawReversePhotonFetch(37.0, -119.0);

    expect(result).not.toBeNull();
    expect(result!.address?.state).toBe("California");
    expect(result!.type).toBe(LOCATION_TYPE_STATE);
  });

  it("returns null when Photon returns zero features (e.g. open ocean)", async () => {
    mockPhotonResponse([]);

    const result = await rawReversePhotonFetch(0, -140);

    expect(result).toBeNull();
  });

  it("returns null when the nearest feature has neither city nor state", async () => {
    mockPhotonResponse([
      houseFeature({ city: undefined, state: undefined }),
    ]);

    const result = await rawReversePhotonFetch(10, 10);

    expect(result).toBeNull();
  });

  it("throws when Photon responds with a non-ok status", async () => {
    mockPhotonResponse([], false, 503);

    await expect(rawReversePhotonFetch(37.7749, -122.4194)).rejects.toThrow(
      "Photon API error: 503"
    );
  });

  it("requests without a layer filter and with limit=1", async () => {
    mockPhotonResponse([houseFeature()]);

    await rawReversePhotonFetch(37.774929, -122.419);

    const calledUrl = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
    expect(calledUrl).toContain("limit=1");
    expect(calledUrl).not.toContain("layer=");
  });

  it("returns the nearest feature's own coordinates, not a city centroid", async () => {
    mockPhotonResponse([houseFeature()]);

    const result = await rawReversePhotonFetch(37.774929, -122.419);

    expect(result!.lat).toBe(37.7748879);
    expect(result!.lon).toBe(-122.4189539);
  });
});