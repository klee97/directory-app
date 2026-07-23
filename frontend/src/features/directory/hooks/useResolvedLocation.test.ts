import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import useResolvedLocation from "@/features/directory/hooks/useResolvedLocation";
import { LOCATION_TYPE_CITY, LocationResult } from "@/types/location";

const getParamMock = vi.fn();
vi.mock("@/contexts/URLFiltersContext", () => ({
  useURLFiltersContext: () => ({ getParam: getParamMock }),
}));

const fetchApiMock = vi.fn();
vi.mock("@/lib/api/client", () => ({
  fetchApi: (...args: unknown[]) => fetchApiMock(...args),
}));

const cacheStore = new Map<string, LocationResult>();
vi.mock("@/features/directory/components/reverseGeocodeCache", () => ({
  __esModule: true,
  default: {
    get: (key: string) => cacheStore.get(key) ?? null,
    set: (key: string, value: LocationResult) => cacheStore.set(key, value),
  },
  createGeocodeKey: (lat: number, lon: number) => `${lat},${lon}`,
}));

function setParams(lat: string | null, lon: string | null) {
  getParamMock.mockImplementation((key: string) => {
    if (key === "lat") return lat;
    if (key === "lon") return lon;
    return null;
  });
}

const sampleLocation: LocationResult = {
  display_name: "Boston, Massachusetts",
  lat: 42.36,
  lon: -71.06,
  address: { city: "Boston", state: "Massachusetts", country: "United States" },
  type: LOCATION_TYPE_CITY,
};

beforeEach(() => {
  vi.clearAllMocks();
  cacheStore.clear();
  setParams(null, null);
});

describe("useResolvedLocation — synchronous cases", () => {
  it("returns immediateLocation synchronously when explicitly provided (including null)", () => {
    const { result } = renderHook(() =>
      useResolvedLocation({ preselectedLocation: null, immediateLocation: null })
    );
    expect(result.current).toBeNull();
  });

  it("returns preselectedLocation synchronously when set", () => {
    const { result } = renderHook(() =>
      useResolvedLocation({ preselectedLocation: sampleLocation, immediateLocation: undefined })
    );
    expect(result.current).toEqual(sampleLocation);
  });

  it("returns null synchronously when there are no coords at all", () => {
    setParams(null, null);
    const { result } = renderHook(() =>
      useResolvedLocation({ preselectedLocation: null, immediateLocation: undefined })
    );
    expect(result.current).toBeNull();
  });

  it("returns a cached reverse-geocode result synchronously without fetching", () => {
    setParams("42.36", "-71.06");
    cacheStore.set("42.36,-71.06", sampleLocation);

    const { result } = renderHook(() =>
      useResolvedLocation({ preselectedLocation: null, immediateLocation: undefined })
    );

    expect(result.current).toEqual(sampleLocation);
    expect(fetchApiMock).not.toHaveBeenCalled();
  });
});

describe("useResolvedLocation — async fetch cases", () => {
  it("returns undefined (loading) while the reverse-geocode fetch is in flight, then resolves to the location", async () => {
    setParams("1.35", "103.8");
    let resolveFetch!: (value: unknown) => void;
    fetchApiMock.mockReturnValue(new Promise((res) => (resolveFetch = res)));

    const { result } = renderHook(() =>
      useResolvedLocation({ preselectedLocation: null, immediateLocation: undefined })
    );

    expect(result.current).toBeUndefined();

    resolveFetch({ ok: true, data: sampleLocation });

    await waitFor(() => expect(result.current).toEqual(sampleLocation));
  });

  it("settles to null (not undefined) when the API responds with a 404 / not-ok", async () => {
    setParams("0", "0"); // e.g. open ocean
    fetchApiMock.mockResolvedValue({ ok: false, error: "Not Found" });

    const { result } = renderHook(() =>
      useResolvedLocation({ preselectedLocation: null, immediateLocation: undefined })
    );

    expect(result.current).toBeUndefined();

    // This is the regression this test guards against: before the fix,
    // a non-ok response threw and left the hook stuck at `undefined`
    // (perpetual loading) instead of settling to a terminal `null`.
    await waitFor(() => expect(result.current).toBeNull());
  });

  it("settles to null when the fetch throws (network error)", async () => {
    setParams("5", "5");
    fetchApiMock.mockRejectedValue(new Error("network down"));

    const { result } = renderHook(() =>
      useResolvedLocation({ preselectedLocation: null, immediateLocation: undefined })
    );

    await waitFor(() => expect(result.current).toBeNull());
  });

  it("does not issue a second fetch for the same coords once already resolving", async () => {
    setParams("10", "10");
    fetchApiMock.mockReturnValue(new Promise(() => { })); // never resolves

    const { rerender } = renderHook(() =>
      useResolvedLocation({ preselectedLocation: null, immediateLocation: undefined })
    );
    rerender();
    rerender();

    expect(fetchApiMock).toHaveBeenCalledTimes(1);
  });

  it("caches a successful fetch result under the coords key for future synchronous reads", async () => {
    setParams("42.36", "-71.06");
    fetchApiMock.mockResolvedValue({ ok: true, data: sampleLocation });

    const { result } = renderHook(() =>
      useResolvedLocation({ preselectedLocation: null, immediateLocation: undefined })
    );

    await waitFor(() => expect(result.current).toEqual(sampleLocation));
    expect(cacheStore.get("42.36,-71.06")).toEqual(sampleLocation);
  });
});