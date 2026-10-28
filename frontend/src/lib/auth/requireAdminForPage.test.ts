import { describe, it, expect, vi, beforeEach } from "vitest";


const { mockRedirect, mockRequireAdmin } = vi.hoisted(() => ({
  mockRedirect: vi.fn((path: string) => {
    // next/navigation's redirect() works by throwing internally; a plain throw
    // here is enough to let us assert on both the thrown value and that
    // nothing after the call site in requireAdminForPage runs.
    throw new Error(`REDIRECT:${path}`);
  }),
  mockRequireAdmin: vi.fn(),
}));

vi.mock("next/navigation", () => ({ redirect: mockRedirect }));

vi.mock("./requireAdmin", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./requireAdmin")>();
  return { ...actual, requireAdmin: mockRequireAdmin };
});

import { UnauthorizedError, ForbiddenError, type AdminAuthResult } from "./requireAdmin";
import { requireAdminForPage } from "./requireAdminForPage";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("requireAdminForPage", () => {
  it("redirects to /login with the current path as redirectTo when signed out", async () => {
    mockRequireAdmin.mockRejectedValue(new UnauthorizedError());
    await expect(requireAdminForPage("/admin/create")).rejects.toThrow(
      "REDIRECT:/login?redirectTo=%2Fadmin%2Fcreate"
    );
  });

  it("redirects to /unauthorized when signed in but not an admin", async () => {
    mockRequireAdmin.mockRejectedValue(new ForbiddenError());
    await expect(requireAdminForPage("/admin")).rejects.toThrow("REDIRECT:/unauthorized");
  });

  it("returns the admin result on success without redirecting", async () => {
    const result: AdminAuthResult = {
      user: { id: "u1", email: null },
      supabase: {} as AdminAuthResult["supabase"],
    };
    mockRequireAdmin.mockResolvedValue(result);

    await expect(requireAdminForPage("/admin")).resolves.toBe(result);
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it("rethrows unexpected errors instead of redirecting", async () => {
    mockRequireAdmin.mockRejectedValue(new Error("boom"));
    await expect(requireAdminForPage("/admin")).rejects.toThrow("boom");
    expect(mockRedirect).not.toHaveBeenCalled();
  });
});