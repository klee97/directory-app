import { describe, it, expect, vi, beforeEach } from "vitest";

// next/cache's unstable_cache just wraps the fn in these tests — we care
// about the fallback control flow, not Next's caching behavior itself.
vi.mock("next/cache", () => ({
  unstable_cache: (fn: (...args: unknown[]) => unknown) => fn,
}));

vi.mock("@/lib/env/env", () => ({
  shouldIncludeTestVendors: vi.fn(() => false),
}));

vi.mock("@/lib/vendor/testVendors", () => ({
  filterTestVendors: vi.fn((data: unknown[]) => data),
}));

vi.mock("@/types/vendor", async () => {
  const actual = await vi.importActual<typeof import("@/types/vendor")>("@/types/vendor");
  return {
    ...actual,
    transformBackendVendorToFrontend: vi.fn((v: unknown) => v),
  };
});

const rpcMock = vi.fn();
const ilikeMock = vi.fn();
const notMock = vi.fn();
const selectMock = vi.fn();
const fromMock = vi.fn();

vi.mock("@/lib/supabase/clients/staticClient", () => ({
  supabaseStaticClient: {
    rpc: (...args: unknown[]) => rpcMock(...args),
    from: (...args: unknown[]) => fromMock(...args),
  },
}));

import {
  getVendorsByDistance,
  getVendorsByDistanceWithFallback,
  getVendorsByState,
  getVendorsByCountry,
} from "@/features/directory/api/fetchVendorsByLocation";
import { SEARCH_RESULTS_MINIMUM } from "@/types/location";

function makeVendors(n: number) {
  return Array.from({ length: n }, (_, i) => ({ id: `v${i}` }));
}

beforeEach(() => {
  vi.clearAllMocks();

  // Chainable query builder mock for the by-state / by-country path
  notMock.mockReturnValue({ ilike: ilikeMock });
  selectMock.mockReturnValue({ not: notMock, ilike: ilikeMock });
  fromMock.mockReturnValue({ select: selectMock });
});

describe("getVendorsByDistanceWithFallback", () => {
  it("returns radius results directly when the first attempt meets the minimum, without touching country", async () => {
    rpcMock.mockResolvedValue({ data: makeVendors(SEARCH_RESULTS_MINIMUM), error: null });

    const results = await getVendorsByDistanceWithFallback(42.36, -71.06, "United States");

    expect(rpcMock).toHaveBeenCalledTimes(1);
    expect(results).toHaveLength(SEARCH_RESULTS_MINIMUM);
    expect(ilikeMock).not.toHaveBeenCalled(); // getVendorsByCountry's query path never ran
  });

  it("expands radius up to 3 attempts before giving up on distance search", async () => {
    rpcMock.mockResolvedValue({ data: [], error: null });
    ilikeMock.mockResolvedValue({ data: makeVendors(2), error: null });

    await getVendorsByDistanceWithFallback(42.36, -71.06, "United States");

    expect(rpcMock).toHaveBeenCalledTimes(3);
  });

  it("falls back to getVendorsByCountry when distance search never reaches the minimum", async () => {
    rpcMock.mockResolvedValue({ data: [], error: null });
    ilikeMock.mockResolvedValue({ data: makeVendors(5), error: null });

    const results = await getVendorsByDistanceWithFallback(1.35, 103.8, "Singapore");

    expect(ilikeMock).toHaveBeenCalledWith("country", "Singapore");
    expect(results).toHaveLength(5);
  });

  it("returns an empty array (not a throw) when falling back with no country provided", async () => {
    rpcMock.mockResolvedValue({ data: [], error: null });

    const results = await getVendorsByDistanceWithFallback(1.35, 103.8, undefined);

    expect(ilikeMock).not.toHaveBeenCalled();
    expect(results).toEqual([]);
  });

  it("returns an empty array when falling back with country = null", async () => {
    rpcMock.mockResolvedValue({ data: [], error: null });

    const results = await getVendorsByDistanceWithFallback(1.35, 103.8, null);

    expect(results).toEqual([]);
  });
});

describe("getVendorsByDistance", () => {
  it("swallows RPC errors and returns an empty array", async () => {
    rpcMock.mockResolvedValue({ data: null, error: { message: "boom" } });
    const result = await getVendorsByDistance(0, 0);
    expect(result).toEqual([]);
  });

  it("swallows a null-data-no-error case and returns an empty array", async () => {
    rpcMock.mockResolvedValue({ data: null, error: null });
    const result = await getVendorsByDistance(0, 0);
    expect(result).toEqual([]);
  });
});

describe("getVendorsByState", () => {
  it("returns [] and warns without querying when state is undefined", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => { });
    const result = await getVendorsByState(undefined);
    expect(result).toEqual([]);
    expect(ilikeMock).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalled();
  });

  it("returns [] when state is null", async () => {
    const result = await getVendorsByState(null);
    expect(result).toEqual([]);
  });

  it("queries by state when a state string is provided", async () => {
    ilikeMock.mockResolvedValue({ data: makeVendors(3), error: null });
    const result = await getVendorsByState("California");
    expect(ilikeMock).toHaveBeenCalledWith("state", "California");
    expect(result).toHaveLength(3);
  });
});

describe("getVendorsByCountry", () => {
  it("returns [] without querying when country is undefined", async () => {
    const result = await getVendorsByCountry(undefined);
    expect(result).toEqual([]);
    expect(ilikeMock).not.toHaveBeenCalled();
  });

  it("queries by country when a country string is provided", async () => {
    ilikeMock.mockResolvedValue({ data: makeVendors(4), error: null });
    const result = await getVendorsByCountry("Canada");
    expect(ilikeMock).toHaveBeenCalledWith("country", "Canada");
    expect(result).toHaveLength(4);
  });

  it("swallows query errors and returns []", async () => {
    ilikeMock.mockResolvedValue({ data: null, error: { message: "fail" } });
    const result = await getVendorsByCountry("Canada");
    expect(result).toEqual([]);
  });
});