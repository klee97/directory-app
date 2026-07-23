import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useVendorFiltering } from "@/features/directory/hooks/useVendorFiltering";
import { LOCATION_TYPE_CITY, LOCATION_TYPE_COUNTRY, LocationResult } from "@/types/location";
import { VendorByDistance } from "@/types/vendor";

const getParamMock = vi.fn(() => null);
vi.mock("@/contexts/URLFiltersContext", () => ({
  useURLFiltersContext: () => ({ getParam: getParamMock }),
}));

const getVendorsByLocationMock = vi.fn();
vi.mock("@/features/directory/api/fetchVendorsByLocation", () => ({
  getVendorsByLocation: (...args: unknown[]) => getVendorsByLocationMock(...args),
}));

vi.mock("@/features/directory/api/searchVendors", () => ({
  filterVendorsByLocation: vi.fn((_loc, vendors) => vendors),
  isCountrySelection: (loc: LocationResult | null) => loc?.type === LOCATION_TYPE_COUNTRY,
  isStateSelection: () => false,
  searchVendors: vi.fn((_q, vendors) => vendors),
}));

// Minimal-but-real shape: getVendorPriority (used by the default sort)
// reads vendor.images.length, and the filter/sort pipeline reads
// is_premium, verified_at, tags, travels_world_wide, bridal_makeup_price,
// distance_miles. A plain {id} object only "works" by accident for
// single-element arrays, since Array.prototype.sort skips the comparator
// entirely when there's nothing to compare — it breaks the moment a test
// uses 2+ items (which is exactly what happened here).
function makeVendor(overrides: Partial<VendorByDistance> = {}): VendorByDistance {
  return {
    id: "vendor",
    images: [],
    is_premium: false,
    verified_at: null,
    tags: [],
    travels_world_wide: false,
    bridal_makeup_price: null,
    distance_miles: null,
    ...overrides,
  } as unknown as VendorByDistance;
}

const allVendors: VendorByDistance[] = [makeVendor({ id: "a" }), makeVendor({ id: "b" })];

const cityLocation: LocationResult = {
  display_name: "Boston, Massachusetts",
  lat: 42.36,
  lon: -71.06,
  address: { city: "Boston" },
  type: LOCATION_TYPE_CITY,
};

function setup(overrides: Partial<Parameters<typeof useVendorFiltering>[0]> = {}) {
  return renderHook(() =>
    useVendorFiltering({
      vendors: allVendors,
      selectedLocation: null,
      isLocationResolving: false,
      travelsWorldwide: false,
      selectedSkills: [],
      selectedServices: [],
      searchQuery: "",
      ...overrides,
    })
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  getParamMock.mockReturnValue(null);
});

describe("useVendorFiltering — isLocationResolving contract", () => {
  it("stays in a loading state and does not fetch while isLocationResolving is true, even with selectedLocation null", () => {
    const { result } = setup({ isLocationResolving: true, selectedLocation: null });

    expect(result.current.loading).toBe(true);
    expect(getVendorsByLocationMock).not.toHaveBeenCalled();
  });

  it("shows the default vendor list once resolution completes to null (terminal 'not found', not loading)", async () => {
    const { result } = setup({ isLocationResolving: false, selectedLocation: null });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.vendorsInRadius).toEqual(allVendors);
    expect(getVendorsByLocationMock).not.toHaveBeenCalled();
  });

  it("fetches vendors by location once resolution completes to a real city location", async () => {
    const nearby = makeVendor({ id: "nearby" });
    getVendorsByLocationMock.mockResolvedValue([nearby]);

    const { result } = setup({ isLocationResolving: false, selectedLocation: cityLocation });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(getVendorsByLocationMock).toHaveBeenCalledWith(cityLocation);
    expect(result.current.vendorsInRadius).toEqual([nearby]);
  });

  it("falls back to the full vendor list if getVendorsByLocation rejects", async () => {
    getVendorsByLocationMock.mockRejectedValue(new Error("fetch failed"));

    const { result } = setup({ isLocationResolving: false, selectedLocation: cityLocation });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.vendorsInRadius).toEqual(allVendors);
  });

  it("transitions loading true -> false as isLocationResolving flips from true to false", async () => {
    const { result, rerender } = renderHook(
      (props: { isLocationResolving: boolean; selectedLocation: LocationResult | null }) =>
        useVendorFiltering({
          vendors: allVendors,
          travelsWorldwide: false,
          selectedSkills: [],
          selectedServices: [],
          searchQuery: "",
          ...props,
        }),
      { initialProps: { isLocationResolving: true, selectedLocation: null } }
    );

    expect(result.current.loading).toBe(true);

    rerender({ isLocationResolving: false, selectedLocation: null });

    await waitFor(() => expect(result.current.loading).toBe(false));
  });
});