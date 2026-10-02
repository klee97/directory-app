import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createChainable, createMockSupabaseFrom } from "@/lib/test-helpers/mockSupabaseChain";

const { mockRequireAdmin } = vi.hoisted(() => ({
  mockRequireAdmin: vi.fn(),
}));
vi.mock("@/lib/auth/requireAdmin", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/auth/requireAdmin")>();
  return { ...actual, requireAdmin: mockRequireAdmin };
});

import { UnauthorizedError, ForbiddenError } from "@/lib/auth/requireAdmin";
import { INQUIRY_STATUS } from "@/lib/inquiries/status";
import { INQUIRY_UNLOCK_WINDOW_DAYS } from "@/lib/inquiries/config";
import { PATCH } from "./route";

const VALID_ID = "123e4567-e89b-42d3-a456-426614174000";
const NOW = new Date("2026-01-01T00:00:00.000Z");

function makeRequest(body: unknown) {
  return new Request("http://localhost/api/admin/inquiries/x", {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

function makeParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
});

afterEach(() => {
  vi.useRealTimers();
});

describe("PATCH /api/admin/inquiries/[id]", () => {
  it("rejects a non-UUID id before ever checking admin auth", async () => {
    const res = await PATCH(makeRequest({ action: "approve" }), makeParams("not-a-uuid"));
    expect(res.status).toBe(404);
    expect(mockRequireAdmin).not.toHaveBeenCalled();
  });

  it("returns the real 401 mapping when requireAdmin rejects with UnauthorizedError", async () => {
    mockRequireAdmin.mockRejectedValue(new UnauthorizedError());
    const res = await PATCH(makeRequest({ action: "approve" }), makeParams(VALID_ID));
    expect(res.status).toBe(401);
  });

  it("returns the real 403 mapping when requireAdmin rejects with ForbiddenError", async () => {
    mockRequireAdmin.mockRejectedValue(new ForbiddenError());
    const res = await PATCH(makeRequest({ action: "approve" }), makeParams(VALID_ID));
    expect(res.status).toBe(403);
  });

  it("rejects a body whose action isn't the single allowed value", async () => {
    mockRequireAdmin.mockResolvedValue({ user: { id: "admin1" }, supabase: {} });
    const res = await PATCH(makeRequest({ action: "reject" }), makeParams(VALID_ID));
    expect(res.status).toBe(400);
    expect((await res.json()).code).toBe("invalid_body");
  });

  it("rejects unparseable JSON bodies", async () => {
    mockRequireAdmin.mockResolvedValue({ user: { id: "admin1" }, supabase: {} });
    const badRequest = new Request("http://localhost/x", { method: "PATCH", body: "not json" });
    const res = await PATCH(badRequest, makeParams(VALID_ID));
    expect(res.status).toBe(400);
    expect((await res.json()).code).toBe("invalid_body");
  });

  it("returns update_failed when the update query errors", async () => {
    const chain = createChainable({ data: null, error: new Error("db down") });
    const supabase = { from: vi.fn(() => chain) };
    mockRequireAdmin.mockResolvedValue({ user: { id: "admin1" }, supabase });

    const res = await PATCH(makeRequest({ action: "approve" }), makeParams(VALID_ID));
    expect(res.status).toBe(500);
    expect((await res.json()).code).toBe("update_failed");
  });

  it("returns not_found when the update matches no row and the id genuinely doesn't exist", async () => {
    const updateChain = createChainable({ data: null, error: null });
    const followupChain = createChainable({ data: null, error: null });
    const supabase = { from: createMockSupabaseFrom(updateChain, followupChain) };
    mockRequireAdmin.mockResolvedValue({ user: { id: "admin1" }, supabase });

    const res = await PATCH(makeRequest({ action: "approve" }), makeParams(VALID_ID));
    expect(res.status).toBe(404);
    expect((await res.json()).code).toBe("not_found");
  });

  it("returns already_reviewed when the update matches no row because another request got there first", async () => {
    const updateChain = createChainable({ data: null, error: null });
    const followupChain = createChainable({ data: { inquiry_status: "unlocked" }, error: null });
    const supabase = { from: createMockSupabaseFrom(updateChain, followupChain) };
    mockRequireAdmin.mockResolvedValue({ user: { id: "admin1" }, supabase });

    const res = await PATCH(makeRequest({ action: "approve" }), makeParams(VALID_ID));
    const body = await res.json();
    expect(res.status).toBe(409);
    expect(body.code).toBe("already_reviewed");
    expect(body.error).toContain("unlocked");
  });

  it("approves successfully and writes the atomic guard + review metadata + expiry in one update", async () => {
    const updatedRow = {
      id: VALID_ID,
      inquiry_status: INQUIRY_STATUS.Available,
      expires_at: "2026-01-15T00:00:00.000Z",
    };
    const chain = createChainable({ data: updatedRow, error: null });
    const supabase = { from: vi.fn(() => chain) };
    mockRequireAdmin.mockResolvedValue({ user: { id: "admin1" }, supabase });

    const res = await PATCH(makeRequest({ action: "approve" }), makeParams(VALID_ID));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ ok: true, data: updatedRow });

    // The concurrency guard: THIS is the test that should fail if someone
    // "simplifies" the handler back into a separate read-then-write — both
    // filters must land on the SAME update call.
    expect(chain.eq).toHaveBeenCalledWith("id", VALID_ID);
    expect(chain.eq).toHaveBeenCalledWith("inquiry_status", INQUIRY_STATUS.PendingReview);
    expect(supabase.from).toHaveBeenCalledTimes(1); // one query, not a read then a write

    const expectedExpiry = new Date(
      NOW.getTime() + INQUIRY_UNLOCK_WINDOW_DAYS * 24 * 60 * 60 * 1000
    ).toISOString();

    expect(chain.update).toHaveBeenCalledWith(
      expect.objectContaining({
        inquiry_status: INQUIRY_STATUS.Available,
        reviewed_by: "admin1",
        reviewed_at: NOW.toISOString(),
        expires_at: expectedExpiry,
      })
    );
  });
});