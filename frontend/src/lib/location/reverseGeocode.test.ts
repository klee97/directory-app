import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { rawReversePhotonFetch } from "@/lib/location/reverseGeocode";
import { LOCATION_TYPE_CITY, LOCATION_TYPE_STATE, LOCATION_TYPE_COUNTRY } from "@/types/location";


vi.mock("@/lib/location/locationNames", () => ({
  getDisplayName: vi.fn(
    (city?: string, state?: string, country?: string) =>
      [city, state, country].filter(Boolean).join(", ")
  ),
}));

function mockPhotonResponse(features: unknown[], ok = true, status = 200) {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
    ok,
    status,
    json: async () => ({ features }),
  }));
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

// Distinct from houseFeature: represents Photon's nearest feature being the
// country boundary itself (no house/city/state nearby at all) — the shape
// that drives the precise-vs-non-precise-country fallback branch.
function countryFeature(overrides: Record<string, unknown> = {}) {
  return {
    type: "Feature",
    properties: {
      osm_type: "R",
      osm_id: 2,
      type: LOCATION_TYPE_COUNTRY,
      country: "United States",
      countrycode: "US",
      ...overrides,
    },
    geometry: { type: "Point", coordinates: [-98.35, 39.5] },
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

  it("returns null when the nearest feature has neither city, state, nor country", async () => {
    // NOTE: previously this test also left `country` at houseFeature's
    // default ("United States") while expecting a null result. That
    // stopped being valid once the country-level fallback landed: a
    // feature with country="United States" but no countrycode is treated
    // as non-precise (no code to check against PRECISE_COUNTRY_CODES), so
    // it would now return a country-level result instead of null. This
    // test explicitly clears `country` too, to isolate the true
    // nothing-usable-at-all case.
    mockPhotonResponse([
      houseFeature({ city: undefined, state: undefined, country: undefined }),
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

  // ── Country-level fallback (PRECISE_COUNTRY_CODES) ──────────────────────

  it("returns null for a rural/unindexed area in a PRECISE country (US) with no city or state", async () => {
    mockPhotonResponse([
      countryFeature({ country: "United States", countrycode: "US" }),
    ]);

    const result = await rawReversePhotonFetch(44.0, -110.0);

    expect(result).toBeNull();
  });

  it("returns null for a rural/unindexed area in a PRECISE country (Canada) with no city or state", async () => {
    mockPhotonResponse([
      countryFeature({ country: "Canada", countrycode: "CA" }),
    ]);

    const result = await rawReversePhotonFetch(60.0, -100.0);

    expect(result).toBeNull();
  });

  it("falls back to a country-level result for a NON-precise country (Spain) with no city or state", async () => {
    mockPhotonResponse([
      countryFeature({ country: "Spain", countrycode: "ES" }),
    ]);

    const result = await rawReversePhotonFetch(40.0, -4.0);

    expect(result).not.toBeNull();
    expect(result!.type).toBe(LOCATION_TYPE_COUNTRY);
    expect(result!.address).toEqual({ country: "Spain" });
    expect(result!.address?.city).toBeUndefined();
    expect(result!.address?.state).toBeUndefined();
  });

  it("treats country codes case-insensitively when checking PRECISE_COUNTRY_CODES", async () => {
    mockPhotonResponse([
      countryFeature({ country: "United States", countrycode: "us" }), // lowercase, as some providers send it
    ]);

    const result = await rawReversePhotonFetch(44.0, -110.0);

    // Should still be treated as precise -> null, not a country-level fallback
    expect(result).toBeNull();
  });

  it("uses the feature's own `name` for country when it IS the country-type feature and has no `country` prop", async () => {
    mockPhotonResponse([
      countryFeature({ country: undefined, name: "Spain", countrycode: "ES" }),
    ]);

    const result = await rawReversePhotonFetch(40.0, -4.0);

    expect(result?.address?.country).toBe("Spain");
  });

  it("returns null when there's no city/state/country and no countrycode to evaluate", async () => {
    mockPhotonResponse([
      { type: "Feature", properties: { type: "unknown" }, geometry: { type: "Point", coordinates: [0, 0] } },
    ]);

    const result = await rawReversePhotonFetch(0, 0);

    expect(result).toBeNull();
  });
});