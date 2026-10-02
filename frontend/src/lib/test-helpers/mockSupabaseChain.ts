import { Mock, vi } from "vitest";


type QueryResult<T> = { data: T | null; error: unknown };

export interface MockChain<T = unknown> extends PromiseLike<QueryResult<T>> {
  select: Mock<() => MockChain<T>>;
  update: Mock<() => MockChain<T>>;
  eq: Mock<() => MockChain<T>>;
  order: Mock<() => MockChain<T>>;
  single: Mock<() => MockChain<T>>;
  maybeSingle: Mock<() => MockChain<T>>;
}

/**
 * Minimal stand-in for a Supabase PostgrestFilterBuilder chain.
 *
 * Every chain method (select/update/eq/order/single/maybeSingle) returns the
 * SAME object, and that object is itself thenable — awaiting at ANY point in
 * the chain resolves to `result`, matching how the real supabase-js builder
 * behaves (it's a thenable at every step, not just after a terminal call).
 *
 * This only exercises call-site logic in route handlers (which methods got
 * called, with what args, and how the handler reacts to data/error) — it
 * does not model real Postgrest query semantics like actual filtering.
 */
export function createChainable<T>(result: QueryResult<T>): MockChain<T> {
  const chain: MockChain<T> = {
    select: vi.fn(() => chain),
    update: vi.fn(() => chain),
    eq: vi.fn(() => chain),
    order: vi.fn(() => chain),
    single: vi.fn(() => chain),
    maybeSingle: vi.fn(() => chain),
    then: <R1 = QueryResult<T>, R2 = never>(
      onFulfilled?: ((value: QueryResult<T>) => R1 | PromiseLike<R1>) | null,
      onRejected?: ((reason: unknown) => R2 | PromiseLike<R2>) | null,
    ) => Promise.resolve(result).then(onFulfilled, onRejected),
  };
  return chain;
}

/**
 * A `.from()` mock that returns a different pre-built chain on each
 * successive call, in order. Use this for handlers that issue more than one
 * query per request — e.g. the approve route's update, then a follow-up
 * select only when the update matches zero rows.
 */
export function createMockSupabaseFrom(...chains: MockChain<unknown>[]) {
  const from = vi.fn();
  chains.forEach((chain) => from.mockReturnValueOnce(chain));
  return from;
}