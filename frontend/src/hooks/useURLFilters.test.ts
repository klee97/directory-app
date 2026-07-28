import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useURLFilters } from './useURLFilters';
import {
  TRAVEL_PARAM,
  SKILL_PARAM,
  SERVICE_PARAM,
  LATITUDE_PARAM,
  LONGITUDE_PARAM,
} from '@/lib/constants';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  useSearchParams: vi.fn(),
}));

function setLocation(url: string) {
  const parsed = new URL(url);
  // @ts-expect-error - intentional override for test control
  delete window.location;
  window.location = parsed as unknown as string & Location;
}

describe('useURLFilters', () => {
  const replaceMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as ReturnType<typeof vi.fn>).mockReturnValue({
      replace: replaceMock,
      push: vi.fn(),
    });
  });

  function mockSearchParamsFrom(search: string) {
    const params = new URLSearchParams(search);
    (useSearchParams as ReturnType<typeof vi.fn>).mockReturnValue(params);
    return params;
  }

  describe('getParam / getAllParams', () => {
    it('reads a single service param value', () => {
      mockSearchParamsFrom(`${SERVICE_PARAM}=Makeup`);
      setLocation(`https://example.com/vendors?${SERVICE_PARAM}=Makeup`);

      const { result } = renderHook(() => useURLFilters());
      expect(result.current.getParam(SERVICE_PARAM)).toBe('Makeup');
    });

    it('returns null for a missing param', () => {
      mockSearchParamsFrom('');
      setLocation('https://example.com/vendors');

      const { result } = renderHook(() => useURLFilters());
      expect(result.current.getParam(SKILL_PARAM)).toBeNull();
    });

    it('reads all values for a repeated skill param', () => {
      mockSearchParamsFrom(`${SKILL_PARAM}=Thai+Makeup&${SKILL_PARAM}=South+Asian+Makeup`);
      setLocation(`https://example.com/vendors?${SKILL_PARAM}=Thai+Makeup&${SKILL_PARAM}=South+Asian+Makeup`);

      const { result } = renderHook(() => useURLFilters());
      expect(result.current.getAllParams(SKILL_PARAM)).toEqual(['Thai Makeup', 'South Asian Makeup']);
    });
  });

  describe('paramsString', () => {
    it('mirrors the current searchParams as a string', () => {
      mockSearchParamsFrom(`${SKILL_PARAM}=Thai+Makeup&${LATITUDE_PARAM}=40.7127`);
      setLocation(`https://example.com/vendors?${SKILL_PARAM}=Thai+Makeup&${LATITUDE_PARAM}=40.7127`);

      const { result } = renderHook(() => useURLFilters());
      expect(result.current.paramsString).toBe(`${SKILL_PARAM}=Thai+Makeup&${LATITUDE_PARAM}=40.7127`);
    });

    it('is an empty string when there are no params', () => {
      mockSearchParamsFrom('');
      setLocation('https://example.com/vendors');

      const { result } = renderHook(() => useURLFilters());
      expect(result.current.paramsString).toBe('');
    });
  });

  describe('setParams', () => {
    it('adds a new skill filter while preserving an existing location filter', () => {
      mockSearchParamsFrom(`${LATITUDE_PARAM}=40.7127&${LONGITUDE_PARAM}=-74.006`);
      setLocation(`https://example.com/vendors?${LATITUDE_PARAM}=40.7127&${LONGITUDE_PARAM}=-74.006`);

      const { result } = renderHook(() => useURLFilters());
      act(() => {
        result.current.setParams({ [SKILL_PARAM]: 'Thai Makeup' });
      });

      expect(replaceMock).toHaveBeenCalledOnce();
      const [calledUrl, options] = replaceMock.mock.calls[0];
      const url = new URL(calledUrl, 'https://example.com');
      expect(url.pathname).toBe('/vendors');
      expect(url.searchParams.get(LATITUDE_PARAM)).toBe('40.7127');
      expect(url.searchParams.get(LONGITUDE_PARAM)).toBe('-74.006');
      expect(url.searchParams.get(SKILL_PARAM)).toBe('Thai Makeup');
      expect(options).toEqual({ scroll: false });
    });

    it('removes a service param when value is null', () => {
      mockSearchParamsFrom(`${SERVICE_PARAM}=Hair&${LATITUDE_PARAM}=40.7127`);
      setLocation(`https://example.com/vendors?${SERVICE_PARAM}=Hair&${LATITUDE_PARAM}=40.7127`);

      const { result } = renderHook(() => useURLFilters());
      act(() => {
        result.current.setParams({ [SERVICE_PARAM]: null });
      });

      const [calledUrl] = replaceMock.mock.calls[0];
      const url = new URL(calledUrl, 'https://example.com');
      expect(url.searchParams.has(SERVICE_PARAM)).toBe(false);
      expect(url.searchParams.get(LATITUDE_PARAM)).toBe('40.7127');
    });

    it('overwrites an existing travel param value', () => {
      mockSearchParamsFrom(`${TRAVEL_PARAM}=false`);
      setLocation(`https://example.com/vendors?${TRAVEL_PARAM}=false`);

      const { result } = renderHook(() => useURLFilters());
      act(() => {
        result.current.setParams({ [TRAVEL_PARAM]: 'true' });
      });

      const [calledUrl] = replaceMock.mock.calls[0];
      const url = new URL(calledUrl, 'https://example.com');
      expect(url.searchParams.get(TRAVEL_PARAM)).toBe('true');
    });

    it('produces a bare pathname (no trailing "?") when the last param is cleared', () => {
      mockSearchParamsFrom(`${SKILL_PARAM}=Thai+Makeup`);
      setLocation(`https://example.com/vendors?${SKILL_PARAM}=Thai+Makeup`);

      const { result } = renderHook(() => useURLFilters());
      act(() => {
        result.current.setParams({ [SKILL_PARAM]: null });
      });

      const [calledUrl] = replaceMock.mock.calls[0];
      expect(calledUrl).toBe('/vendors');
    });

    it('reads from window.location.search at call time, not from a stale searchParams closure', () => {
      // Simulates the production race: React's searchParams hasn't caught up yet
      // (still shows only the skill filter), but the browser's actual URL has
      // already moved on to include a location, from a prior replace() that
      // hasn't triggered a re-render yet.
      mockSearchParamsFrom(`${SKILL_PARAM}=Thai+Makeup`); // stale value React still has
      setLocation(`https://example.com/vendors?${SKILL_PARAM}=Thai+Makeup&${LATITUDE_PARAM}=40.7127&${LONGITUDE_PARAM}=-74.006`); // actual current URL

      const { result } = renderHook(() => useURLFilters());
      act(() => {
        result.current.setParams({ [SERVICE_PARAM]: 'Makeup' });
      });

      const [calledUrl] = replaceMock.mock.calls[0];
      const url = new URL(calledUrl, 'https://example.com');
      // lat/lon should be preserved because they came from window.location, not stale searchParams
      expect(url.searchParams.get(LATITUDE_PARAM)).toBe('40.7127');
      expect(url.searchParams.get(LONGITUDE_PARAM)).toBe('-74.006');
      expect(url.searchParams.get(SKILL_PARAM)).toBe('Thai Makeup');
      expect(url.searchParams.get(SERVICE_PARAM)).toBe('Makeup');
    });

    it('uses router.replace, not router.push', () => {
      mockSearchParamsFrom('');
      setLocation('https://example.com/vendors');

      const { result } = renderHook(() => useURLFilters());
      act(() => {
        result.current.setParams({ [SKILL_PARAM]: 'Thai Makeup' });
      });

      expect(replaceMock).toHaveBeenCalledOnce();
    });
  });

  describe('setParam', () => {
    it('delegates to setParams with a single key', () => {
      mockSearchParamsFrom(`${LATITUDE_PARAM}=40.7127`);
      setLocation(`https://example.com/vendors?${LATITUDE_PARAM}=40.7127`);

      const { result } = renderHook(() => useURLFilters());
      act(() => {
        result.current.setParam(SERVICE_PARAM, 'Hair');
      });

      const [calledUrl] = replaceMock.mock.calls[0];
      const url = new URL(calledUrl, 'https://example.com');
      expect(url.searchParams.get(SERVICE_PARAM)).toBe('Hair');
      expect(url.searchParams.get(LATITUDE_PARAM)).toBe('40.7127');
    });
  });

  describe('setArrayParam', () => {
    it('sets multiple skill values as repeated params', () => {
      mockSearchParamsFrom('');
      setLocation('https://example.com/vendors');

      const { result } = renderHook(() => useURLFilters());
      act(() => {
        result.current.setArrayParam(SKILL_PARAM, ['Thai Makeup', 'South Asian Makeup']);
      });

      const [calledUrl] = replaceMock.mock.calls[0];
      const url = new URL(calledUrl, 'https://example.com');
      expect(url.searchParams.getAll(SKILL_PARAM)).toEqual(['Thai Makeup', 'South Asian Makeup']);
    });

    it('removes all instances of the skill param when values is null', () => {
      mockSearchParamsFrom(`${SKILL_PARAM}=Thai+Makeup&${SKILL_PARAM}=South+Asian+Makeup&${LATITUDE_PARAM}=40.7127`);
      setLocation(`https://example.com/vendors?${SKILL_PARAM}=Thai+Makeup&${SKILL_PARAM}=South+Asian+Makeup&${LATITUDE_PARAM}=40.7127`);

      const { result } = renderHook(() => useURLFilters());
      act(() => {
        result.current.setArrayParam(SKILL_PARAM, null);
      });

      const [calledUrl] = replaceMock.mock.calls[0];
      const url = new URL(calledUrl, 'https://example.com');
      expect(url.searchParams.getAll(SKILL_PARAM)).toEqual([]);
      expect(url.searchParams.get(LATITUDE_PARAM)).toBe('40.7127');
    });

    it('removes all instances of the skill param when values is an empty array', () => {
      mockSearchParamsFrom(`${SKILL_PARAM}=Thai+Makeup&${SKILL_PARAM}=South+Asian+Makeup`);
      setLocation(`https://example.com/vendors?${SKILL_PARAM}=Thai+Makeup&${SKILL_PARAM}=South+Asian+Makeup`);

      const { result } = renderHook(() => useURLFilters());
      act(() => {
        result.current.setArrayParam(SKILL_PARAM, []);
      });

      const [calledUrl] = replaceMock.mock.calls[0];
      const url = new URL(calledUrl, 'https://example.com');
      expect(url.searchParams.getAll(SKILL_PARAM)).toEqual([]);
    });

    it('replaces existing repeated skill values rather than appending to them', () => {
      mockSearchParamsFrom(`${SKILL_PARAM}=Thai+Makeup&${SKILL_PARAM}=South+Asian+Makeup`);
      setLocation(`https://example.com/vendors?${SKILL_PARAM}=Thai+Makeup&${SKILL_PARAM}=South+Asian+Makeup`);

      const { result } = renderHook(() => useURLFilters());
      act(() => {
        result.current.setArrayParam(SKILL_PARAM, ['South Asian Makeup']);
      });

      const [calledUrl] = replaceMock.mock.calls[0];
      const url = new URL(calledUrl, 'https://example.com');
      expect(url.searchParams.getAll(SKILL_PARAM)).toEqual(['South Asian Makeup']);
    });

    it('removing one skill from a multi-skill selection preserves the others as separate params (not comma-joined)', () => {
      mockSearchParamsFrom(`${SKILL_PARAM}=Thai+Makeup&${SKILL_PARAM}=South+Asian+Makeup`);
      setLocation(`https://example.com/vendors?${SKILL_PARAM}=Thai+Makeup&${SKILL_PARAM}=South+Asian+Makeup`);

      const { result } = renderHook(() => useURLFilters());
      act(() => {
        result.current.setArrayParam(SKILL_PARAM, ['South Asian Makeup']);
      });

      const [calledUrl] = replaceMock.mock.calls[0];
      const url = new URL(calledUrl, 'https://example.com');
      // Guards against the comma-join bug (?skill=South Asian Makeup,Thai Makeup as one value)
      expect(url.searchParams.getAll(SKILL_PARAM)).toEqual(['South Asian Makeup']);
      expect(url.searchParams.getAll(SKILL_PARAM)).not.toContain('Thai Makeup,South Asian Makeup');
    });
  });
});