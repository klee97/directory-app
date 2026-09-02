import { describe, it, expect, beforeEach, afterEach, vi, type MockInstance } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSearchParams, usePathname } from 'next/navigation';
import { useURLFilters } from './useURLFilters';

vi.mock('next/navigation', () => ({
  useSearchParams: vi.fn(),
  usePathname: vi.fn(),
}));

function mockParams(query: string) {
  (useSearchParams as ReturnType<typeof vi.fn>).mockReturnValue(new URLSearchParams(query));
}

describe('useURLFilters', () => {
  let pushStateSpy: MockInstance;

  beforeEach(() => {
    pushStateSpy = vi.spyOn(window.history, 'pushState').mockImplementation(() => { });
    (usePathname as ReturnType<typeof vi.fn>).mockReturnValue('/vendors');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getParam / getAllParams (raw, unsanitized)', () => {
    it('returns values as-is, including invalid ones', () => {
      mockParams('service=nonsense&service=Makeup');
      const { result } = renderHook(() => useURLFilters());
      expect(result.current.getParam('service')).toBe('nonsense');
      expect(result.current.getAllParams('service')).toEqual(['nonsense', 'Makeup']);
    });
  });

  describe('getSanitizedParam', () => {
    it('normalizes casing to the canonical value', () => {
      mockParams('service=makeup');
      const { result } = renderHook(() => useURLFilters());
      expect(result.current.getSanitizedParam('service', ['Makeup', 'Hair'])).toBe('Makeup');
    });

    it('returns null for a value with no match', () => {
      mockParams('service=nonsense');
      const { result } = renderHook(() => useURLFilters());
      expect(result.current.getSanitizedParam('service', ['Makeup', 'Hair'])).toBeNull();
    });

    it('returns null when the param is absent', () => {
      mockParams('');
      const { result } = renderHook(() => useURLFilters());
      expect(result.current.getSanitizedParam('service', ['Makeup', 'Hair'])).toBeNull();
    });
  });

  describe('getSanitizedArrayParam', () => {
    it('normalizes casing, drops invalid values, and dedupes', () => {
      mockParams('skill=makeup&skill=MAKEUP&skill=Hair&skill=nonsense');
      const { result } = renderHook(() => useURLFilters());
      expect(result.current.getSanitizedArrayParam('skill', ['Makeup', 'Hair'])).toEqual(['Makeup', 'Hair']);
    });

    it('returns an empty array when nothing matches', () => {
      mockParams('skill=nonsense');
      const { result } = renderHook(() => useURLFilters());
      expect(result.current.getSanitizedArrayParam('skill', ['Makeup', 'Hair'])).toEqual([]);
    });
  });

  describe('getBooleanParam', () => {
    it.each([
      ['true', true],
      ['True', true],
      ['TRUE', true],
      ['false', false],
      ['1', false],
      ['', false],
    ])('travel=%s -> %s', (value, expected) => {
      mockParams(value ? `travel=${value}` : '');
      const { result } = renderHook(() => useURLFilters());
      expect(result.current.getBooleanParam('travel')).toBe(expected);
    });

    it('returns false when the param is absent', () => {
      mockParams('');
      const { result } = renderHook(() => useURLFilters());
      expect(result.current.getBooleanParam('travel')).toBe(false);
    });
  });

  describe('setParam / setParams', () => {
    it('updates the URL via history.pushState, not router.push', () => {
      mockParams('foo=bar');
      const { result } = renderHook(() => useURLFilters());

      act(() => {
        result.current.setParam('q', 'hello');
      });

      expect(pushStateSpy).toHaveBeenCalledTimes(1);
      const url = pushStateSpy.mock.calls[0][2];
      expect(url).toBe('/vendors?foo=bar&q=hello');
    });

    it('removes a param when set to null', () => {
      mockParams('foo=bar&q=hello');
      const { result } = renderHook(() => useURLFilters());

      act(() => {
        result.current.setParam('q', null);
      });

      expect(pushStateSpy.mock.calls[0][2]).toBe('/vendors?foo=bar');
    });

    it('omits the "?" entirely when no params remain', () => {
      mockParams('q=hello');
      const { result } = renderHook(() => useURLFilters());

      act(() => {
        result.current.setParam('q', null);
      });

      expect(pushStateSpy.mock.calls[0][2]).toBe('/vendors');
    });

    it('applies multiple updates in one push via setParams', () => {
      mockParams('');
      const { result } = renderHook(() => useURLFilters());

      act(() => {
        result.current.setParams({ skill: 'Hair', service: null, travel: 'true' });
      });

      expect(pushStateSpy).toHaveBeenCalledTimes(1);
      expect(pushStateSpy.mock.calls[0][2]).toBe('/vendors?skill=Hair&travel=true');
    });
  });

  describe('setArrayParam', () => {
    it('writes repeated keys for each value', () => {
      mockParams('');
      const { result } = renderHook(() => useURLFilters());

      act(() => {
        result.current.setArrayParam('skill', ['Hair', 'Makeup']);
      });

      expect(pushStateSpy.mock.calls[0][2]).toBe('/vendors?skill=Hair&skill=Makeup');
    });

    it('clears the param entirely when passed an empty array', () => {
      mockParams('skill=Hair&skill=Makeup');
      const { result } = renderHook(() => useURLFilters());

      act(() => {
        result.current.setArrayParam('skill', []);
      });

      expect(pushStateSpy.mock.calls[0][2]).toBe('/vendors');
    });
  });

  describe('SSR safety', () => {
    it('does not throw when window is unavailable', () => {
      mockParams('');
      const { result } = renderHook(() => useURLFilters());

      const originalWindow = global.window;
      // @ts-expect-error simulating SSR
      delete global.window;

      expect(() => act(() => result.current.setParam('q', 'x'))).not.toThrow();

      global.window = originalWindow;
    });
  });
});