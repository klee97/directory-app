import { describe, it, expect, vi, beforeEach } from "vitest";
import { createChainable } from "@/lib/test-helpers/mockSupabaseChain";

const { mockRequireAdmin } = vi.hoisted(() => ({
  mockRequireAdmin: vi.fn(),
}));
// Keep authErrorResponse and the error classes REAL — only requireAdmin's
// I/O (the DB round trip) is mocked. This way a 401/403 assertion here is
// actually exercising the real error-mapping code, not a re-implementation
// of it inside the test.
vi.mock("@/lib/auth/requireAdmin", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/auth/requireAdmin")>();
  return { ...actual, requireAdmin: mockRequireAdmin };
});

import { UnauthorizedError } from "@/lib/auth/requireAdmin";
import { GET } from "./route";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/admin/inquiries", () => {
  it("returns the real 401 mapping when requireAdmin rejects", async () => {
    mockRequireAdmin.mockRejectedValue(new UnauthorizedError());
    const res = await GET();
    expect(res.status).toBe(401);
    expect((await res.json()).code).toBe("unauthorized");
  });

  it("returns queue_fetch_failed when the query errors", async () => {
    const chain = createChainable({ data: null, error: new Error("db down") });
    const supabase = { from: vi.fn(() => chain) };
    mockRequireAdmin.mockResolvedValue({ user: { id: "admin1" }, supabase });

    const res = await GET();
    const body = await res.json();
    expect(res.status).toBe(500);
    expect(body.code).toBe("queue_fetch_failed");
  });

  it("returns the pending_review queue, filtered and ordered oldest-first", async () => {
    const rows = [{ id: "1" }, { id: "2" }];
    const chain = createChainable({ data: rows, error: null });
    const supabase = { from: vi.fn(() => chain) };
    mockRequireAdmin.mockResolvedValue({ user: { id: "admin1" }, supabase });

    const res = await GET();
    const body = await res.json();

    expect(body).toEqual({ ok: true, data: { inquiries: rows } });
    expect(supabase.from).toHaveBeenCalledWith("inquiries");
    expect(chain.eq).toHaveBeenCalledWith("inquiry_status", "pending_review");
    expect(chain.order).toHaveBeenCalledWith("submitted_at", { ascending: true });
  });
});