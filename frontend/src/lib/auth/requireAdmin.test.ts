import { describe, it, expect, vi, beforeEach } from "vitest";
import { createChainable } from "@/lib/test-helpers/mockSupabaseChain";

const mockCreateServerClient = vi.fn();

vi.mock("@/lib/supabase/clients/serverClient", () => ({
  createServerClient: (...args: unknown[]) => mockCreateServerClient(...args),
}));

// Mocked wholesale: requireAdmin's own logic (does it call getUserRole/
// isAdminRole and branch on the result?) is what this file tests, not
// getUserRole's internals, which belong to their own test elsewhere.
const mockGetUserRole = vi.fn();
const mockIsAdminRole = vi.fn();
vi.mock("@/lib/auth/userRole", () => ({
  getUserRole: (...args: unknown[]) => mockGetUserRole(...args),
  isAdminRole: (...args: unknown[]) => mockIsAdminRole(...args),
}));

import { requireAdmin, UnauthorizedError, ForbiddenError } from "./requireAdmin";

function buildSupabase({
  user,
  profile,
  profileError = null as unknown,
}: {
  user: { id: string; email?: string } | null;
  profile: { role: string; vendor_id: string | null } | null;
  profileError?: unknown;
}) {
  const profileChain = createChainable({ data: profile, error: profileError });
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user },
        error: user ? null : new Error("no session"),
      }),
    },
    from: vi.fn(() => profileChain),
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("requireAdmin", () => {
  it("throws UnauthorizedError when there is no session", async () => {
    mockCreateServerClient.mockResolvedValue(buildSupabase({ user: null, profile: null }));
    await expect(requireAdmin()).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it("throws ForbiddenError when the user has no profile row", async () => {
    mockCreateServerClient.mockResolvedValue(
      buildSupabase({
        user: { id: "u1" },
        profile: null,
        profileError: new Error("no rows"),
      })
    );
    await expect(requireAdmin()).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("throws ForbiddenError when the profile's role is not admin", async () => {
    mockCreateServerClient.mockResolvedValue(
      buildSupabase({ user: { id: "u1" }, profile: { role: "vendor", vendor_id: "v1" } })
    );
    mockIsAdminRole.mockReturnValue(false);

    await expect(requireAdmin()).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("returns the user and the authenticated supabase client when role is admin", async () => {
    const supabase = buildSupabase({
      user: { id: "u1", email: "a@b.com" },
      profile: { role: "admin", vendor_id: null },
    });
    mockCreateServerClient.mockResolvedValue(supabase);
    mockIsAdminRole.mockReturnValue(true);

    const result = await requireAdmin();

    expect(result.user).toEqual({ id: "u1", email: "a@b.com" });
    expect(result.supabase).toBe(supabase); // reused, not a second client
  });

  it("defaults email to null when the auth user has none", async () => {
    const supabase = buildSupabase({
      user: { id: "u1" },
      profile: { role: "admin", vendor_id: null },
    });
    mockCreateServerClient.mockResolvedValue(supabase);
    mockIsAdminRole.mockReturnValue(true);

    const result = await requireAdmin();
    expect(result.user.email).toBeNull();
  });
});