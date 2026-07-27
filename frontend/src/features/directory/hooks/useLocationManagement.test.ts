import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocationManagement } from '@/features/directory/hooks/useLocationManagement';
import { LocationResult } from '@/types/location';

const mockPush = vi.fn();
const mockSetParams = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock('@/contexts/URLFiltersContext', () => ({
  useURLFiltersContext: () => ({
    setParams: mockSetParams,
    getParam: vi.fn(() => null),
  }),
}));

// Keep suggestion search inert for these tests — behavior under test
// is filter/selection state, not the suggestion list itself.
vi.mock('./useLocationSearch', () => ({
  useLocationSearch: () => ({
    instantLocations: [],
    detailedLocations: [],
    isInstantLoading: false,
    isDetailedLoading: false,
  }),
}));

const mockLocation: LocationResult = {
  display_name: 'New York, NY',
  type: 'city',
  lat: 40.7128,
  lon: -74.006,
};

describe('useLocationManagement', () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockSetParams.mockClear();
  });

  it('starts with no selected location when nothing is preselected', () => {
    const { result } = renderHook(() =>
      useLocationManagement({ preselectedLocation: null })
    );

    expect(result.current.selectedLocation).toBeNull();
    expect(result.current.locationInputValue).toBe('');
  });

  it('sets selectedLocation and URL params when a location is selected', () => {
    const { result } = renderHook(() =>
      useLocationManagement({ preselectedLocation: null })
    );

    act(() => {
      result.current.handleSelectLocation(mockLocation);
    });

    expect(result.current.selectedLocation).toEqual(mockLocation);
    expect(result.current.locationInputValue).toBe(mockLocation.display_name);
    expect(mockSetParams).toHaveBeenCalledWith(
      expect.objectContaining({
        lat: String(mockLocation.lat),
        lon: String(mockLocation.lon),
      })
    );
  });

  it('clears selectedLocation and URL params when handleSelectLocation(null) is called', () => {
    const { result } = renderHook(() =>
      useLocationManagement({ preselectedLocation: null })
    );

    act(() => {
      result.current.handleSelectLocation(mockLocation);
    });
    act(() => {
      result.current.handleSelectLocation(null);
    });

    expect(result.current.selectedLocation).toBeNull();
    expect(mockSetParams).toHaveBeenCalledWith(
      expect.objectContaining({ lat: null, lon: null })
    );
  });

  it('lets locationInputValue diverge from selectedLocation via inputOverride (partial deletion case)', () => {
    const { result } = renderHook(() =>
      useLocationManagement({ preselectedLocation: null })
    );

    act(() => {
      result.current.handleSelectLocation(mockLocation);
    });
    act(() => {
      // Simulate partial deletion: text changes but selection is untouched
      result.current.handleLocationInputChange('New York, N');
    });

    expect(result.current.locationInputValue).toBe('New York, N');
    expect(result.current.selectedLocation).toEqual(mockLocation); // unchanged
  });

  it('drops inputOverride so locationInputValue follows the new selection after handleSelectLocation', () => {
    const { result } = renderHook(() =>
      useLocationManagement({ preselectedLocation: null })
    );

    act(() => {
      result.current.handleLocationInputChange('bos');
    });
    act(() => {
      result.current.handleSelectLocation(mockLocation);
    });

    expect(result.current.locationInputValue).toBe(mockLocation.display_name);
  });
});