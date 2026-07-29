// frontend/src/lib/vendor/fetchVendors.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockFetchAllVendors = vi.fn();
vi.mock('@/lib/supabase/clients/staticClient', () => ({ supabaseStaticClient: {} }));
vi.mock('next/cache', () => ({
  unstable_cache: (fn: any) => fn, // bypass caching, test the logic directly
}));

// re-mock fetchAllVendors's internals as needed, or import and spy on the module

describe('getDirectoryPageVendors', () => {
  it('propagates errors instead of returning an empty vendors list', async () => {
    // arrange fetchAllVendors (or the supabase query) to reject
    // assert getDirectoryPageVendors() rejects, not resolves to { vendors: [] }
  });

  it('produces a different cache key/result when the seed changes', async () => {
    // call with two different seeds, assert shuffledVendors order differs
    // (or, if mocking unstable_cache to a spy, assert it was called with distinct args per seed)
  });
});