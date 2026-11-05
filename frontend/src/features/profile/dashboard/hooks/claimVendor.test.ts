import { describe, it, expect, vi, beforeEach } from "vitest";
import { createChainable, type MockChain } from "@/lib/test-helpers/mockSupabaseChain";

const mocks = vi.hoisted(() => ({
  from: vi.fn(),
  createUser: vi.fn(),
  deleteUser: vi.fn(),
  revalidateVendor: vi.fn(),
  isClaimProfileEnabled: vi.fn(),
}));

vi.mock("@/lib/supabase/clients/adminClient", () => ({
  supabaseAdminClient: {
    from: (...args: unknown[]) => mocks.from(...args),
    auth: { admin: { createUser: mocks.createUser, deleteUser: mocks.deleteUser } },
  },
}));
vi.mock("@/lib/actions/revalidate", () => ({ revalidateVendor: mocks.revalidateVendor }));
vi.mock("@/lib/env/env", () => ({ isClaimProfileEnabled: mocks.isClaimProfileEnabled }));

import { signUpAndClaimVendor } from "./claimVendor";

type Chain = MockChain<unknown>;

const EMAIL = "vendor@acme.com";
const iso = (offsetMs: number) => new Date(Date.now() + offsetMs).toISOString();

const vendorRow = (validUntil: string | null = iso(60_000)) => ({
  id: "v1",
  slug: "acme",
  email: EMAIL,
  access_token_valid_until: validUntil,
});

const ok = (data: unknown): Chain => createChainable<unknown>({ data, error: null });
const fail = (message: string): Chain =>
  createChainable<unknown>({ data: null, error: { message } });

/**
 * signUpAndClaimVendor issues its queries in a fixed order. Each step has a
 * happy-path default; a test overrides only the step it wants to break.
 */
interface Flow {
  lookup: Chain; // signUp: vendors by token
  existingClaim: Chain; // signUp: profiles by vendor_id
  claimLookup: Chain; // claimVendor: vendors by token
  claimExistingClaim: Chain; // claimVendor: profiles by vendor_id
  claimExistingProfile: Chain; // claimVendor: profiles by user id
  claimProfileUpdate: Chain; // claimVendor: profiles update
  finalUpdate: Chain; // signUp: vendors update (clear token, set verified_at)
}

function queueFlow(overrides: Partial<Flow> = {}): Flow {
  const flow: Flow = {
    lookup: ok(vendorRow()),
    existingClaim: ok(null),
    claimLookup: ok(vendorRow()),
    claimExistingClaim: ok(null),
    claimExistingProfile: ok({ vendor_id: null }),
    claimProfileUpdate: ok([{ id: "u1" }]),
    finalUpdate: ok(null),
    ...overrides,
  };
  [
    flow.lookup,
    flow.existingClaim,
    flow.claimLookup,
    flow.claimExistingClaim,
    flow.claimExistingProfile,
    flow.claimProfileUpdate,
    flow.finalUpdate,
  ].forEach((c) => mocks.from.mockReturnValueOnce(c));
  return flow;
}

const errorSpy = vi.spyOn(console, "error").mockImplementation(() => { });

beforeEach(() => {
  Object.values(mocks).forEach((m) => m.mockReset());
  errorSpy.mockClear();

  mocks.isClaimProfileEnabled.mockReturnValue(true);
  mocks.createUser.mockResolvedValue({ data: { user: { id: "u1" } }, error: null });
  mocks.deleteUser.mockResolvedValue({ error: null });
  mocks.revalidateVendor.mockResolvedValue(undefined);
});

describe("signUpAndClaimVendor: one outcome per exit", () => {
  interface Case {
    name: string;
    arrange: () => void;
    expected: Record<string, unknown>;
  }

  const cases: Case[] = [
    {
      name: "unknown token",
      arrange: () => queueFlow({ lookup: ok(null) }),
      expected: { success: false, type: "invalid_token" },
    },
    {
      name: "vendor lookup hits a DB error (not the same as an unknown token)",
      arrange: () => queueFlow({ lookup: fail("connection reset") }),
      expected: { success: false, type: "claim_failed" },
    },
    {
      name: "claimVendor's re-lookup hits a DB error, rollback ok",
      arrange: () => queueFlow({ claimLookup: fail("connection reset") }),
      expected: { success: false, type: "claim_failed" },
    },
    {
      name: "expired token",
      arrange: () => queueFlow({ lookup: ok(vendorRow(iso(-1_000))) }),
      expected: { success: false, type: "invalid_token" },
    },
    {
      name: "NULL expiry counts as expired",
      arrange: () => queueFlow({ lookup: ok(vendorRow(null)) }),
      expected: { success: false, type: "invalid_token" },
    },
    {
      name: "already claimed",
      arrange: () =>
        queueFlow({ existingClaim: ok({ id: "p9", vendor_id: "v1" }) }),
      expected: { success: false, type: "already_claimed" },
    },
    {
      name: "email already registered",
      arrange: () => {
        queueFlow();
        mocks.createUser.mockResolvedValue({
          data: { user: null },
          error: { message: "User already registered" },
        });
      },
      expected: { success: false, type: "email_exists" },
    },
    {
      name: "createUser fails for another reason",
      arrange: () => {
        queueFlow();
        mocks.createUser.mockResolvedValue({
          data: { user: null },
          error: { message: "boom" },
        });
      },
      expected: { success: false, type: "create_failed" },
    },
    {
      name: "createUser returns no user",
      arrange: () => {
        queueFlow();
        mocks.createUser.mockResolvedValue({ data: { user: null }, error: null });
      },
      expected: { success: false, type: "create_failed" },
    },
    {
      name: "claim fails on a race (someone claimed it in between), rollback ok",
      arrange: () =>
        queueFlow({ claimExistingClaim: ok({ id: "someone-else", vendor_id: "v1" }) }),
      expected: { success: false, type: "already_claimed" },
    },
    {
      name: "claim fails on the profile update, rollback ok",
      arrange: () => queueFlow({ claimProfileUpdate: fail("db down") }),
      expected: { success: false, type: "claim_failed" },
    },
    {
      name: "claim throws something that isn't a ClaimError",
      arrange: () => {
        mocks.from
          .mockReturnValueOnce(ok(vendorRow())) // signUp lookup
          .mockReturnValueOnce(ok(null)) // signUp existing claim
          .mockImplementationOnce(() => {
            throw new Error("unexpected");
          }); // claimVendor blows up
      },
      expected: { success: false, type: "claim_failed" },
    },
    {
      name: "claim fails AND orphan-user rollback fails",
      arrange: () => {
        queueFlow({ claimProfileUpdate: fail("db down") });
        mocks.deleteUser.mockResolvedValue({ error: { message: "nope" } });
      },
      expected: { success: false, type: "claim_failed" },
    },
    {
      name: "final vendor update fails",
      arrange: () => queueFlow({ finalUpdate: fail("db down") }),
      expected: { success: false, type: "vendor_update_failed" },
    },
    {
      name: "revalidate throws after a successful claim",
      arrange: () => {
        queueFlow();
        mocks.revalidateVendor.mockRejectedValue(new Error("cache down"));
      },
      expected: { success: true, type: "created", userId: "u1" },
    },
    {
      name: "happy path",
      arrange: () => queueFlow(),
      expected: { success: true, type: "created", userId: "u1" },
    },
    {
      name: "profile update matches zero rows (profile missing), rollback ok",
      arrange: () => queueFlow({ claimProfileUpdate: ok([]) }),
      expected: { success: false, type: "claim_failed" },
    },
    {
      name: "pre-check claim lookup hits a DB error",
      arrange: () => queueFlow({ existingClaim: fail("connection reset") }),
      expected: { success: false, type: "claim_failed" },
    },
    {
      name: "claimVendor's claim re-check hits a DB error, rollback ok",
      arrange: () => queueFlow({ claimExistingClaim: fail("connection reset") }),
      expected: { success: false, type: "claim_failed" },
    },
    {
      name: "claimVendor's profile lookup hits a DB error, rollback ok",
      arrange: () => queueFlow({ claimExistingProfile: fail("connection reset") }),
      expected: { success: false, type: "claim_failed" },
    },
    {
      name: "profile row is missing, rollback ok",
      arrange: () => queueFlow({ claimExistingProfile: ok(null) }),
      expected: { success: false, type: "claim_failed" },
    },
  ];

  it.each(cases)("$name → records $outcome exactly once", async (c) => {
    c.arrange();

    const result = await signUpAndClaimVendor(EMAIL, "tok", "pw");

    expect(result).toMatchObject(c.expected);
  });
});

describe("signUpAndClaimVendor: side effects", () => {
  it("does not create a user when the vendor lookup fails", async () => {
    queueFlow({ lookup: fail("no rows") });
    await signUpAndClaimVendor(EMAIL, "tok", "pw");
    expect(mocks.createUser).not.toHaveBeenCalled();
  });

  it("does not create a user when the vendor is already claimed", async () => {
    queueFlow({ existingClaim: ok({ id: "p9", vendor_id: "v1" }) });
    await signUpAndClaimVendor(EMAIL, "tok", "pw");
    expect(mocks.createUser).not.toHaveBeenCalled();
  });

  it("creates the user pre-confirmed", async () => {
    queueFlow();
    await signUpAndClaimVendor(EMAIL, "tok", "pw");

    expect(mocks.createUser).toHaveBeenCalledWith({
      email: EMAIL,
      password: "pw",
      email_confirm: true,
    });
  });

  it("deletes the new user when the claim fails, and skips finalize + revalidate", async () => {
    queueFlow({ claimProfileUpdate: fail("db down") });
    await signUpAndClaimVendor(EMAIL, "tok", "pw");

    expect(mocks.deleteUser).toHaveBeenCalledWith("u1");
    expect(mocks.revalidateVendor).not.toHaveBeenCalled();
  });

  it("links the profile to the vendor with the vendor role", async () => {
    const flow = queueFlow();
    await signUpAndClaimVendor(EMAIL, "tok", "pw");

    expect(flow.claimProfileUpdate.update).toHaveBeenCalledWith(
      expect.objectContaining({ vendor_id: "v1", role: expect.anything() })
    );
    expect(flow.claimProfileUpdate.select).toHaveBeenCalledWith("id");
    expect(flow.claimProfileUpdate.eq).toHaveBeenCalledWith("id", "u1");
  });

  it("clears the token and stamps verified_at on success", async () => {
    const flow = queueFlow();
    await signUpAndClaimVendor(EMAIL, "tok", "pw");

    expect(flow.finalUpdate.update).toHaveBeenCalledWith(
      expect.objectContaining({
        access_token: null,
        access_token_valid_until: null,
        verified_at: expect.any(String),
      })
    );
    expect(flow.finalUpdate.eq).toHaveBeenCalledWith("id", "v1");
    expect(mocks.revalidateVendor).toHaveBeenCalledWith("acme");
  });

  it("leaves the token alone when the claim fails", async () => {
    const flow = queueFlow({ claimProfileUpdate: fail("db down") });
    await signUpAndClaimVendor(EMAIL, "tok", "pw");

    expect(flow.finalUpdate.update).not.toHaveBeenCalled();
  });

  it("does not create a user when the claim pre-check fails", async () => {
    queueFlow({ existingClaim: fail("connection reset") });
    await signUpAndClaimVendor(EMAIL, "tok", "pw");
    expect(mocks.createUser).not.toHaveBeenCalled();
  });
});

describe("signUpAndClaimVendor: expiry rule", () => {
  it("only enforces expiry while the claim-profile flag is on", async () => {
    mocks.isClaimProfileEnabled.mockReturnValue(false);
    queueFlow({
      lookup: ok(vendorRow(iso(-1_000))),
      claimLookup: ok(vendorRow(iso(-1_000))),
    });

    const result = await signUpAndClaimVendor(EMAIL, "tok", "pw");

    expect(result).toMatchObject({ success: true });
  });

  it("rejects a token that expires between page load and submit (claimVendor re-checks)", async () => {
    // Passes the first check, expired by the time claimVendor reads it.
    queueFlow({ claimLookup: ok(vendorRow(iso(-1_000))) });

    const result = await signUpAndClaimVendor(EMAIL, "tok", "pw");

    expect(result).toMatchObject({ success: false, type: "invalid_token" });
    expect(mocks.deleteUser).toHaveBeenCalledWith("u1");
  });
});

describe("signUpAndClaimVendor: email must match the vendor on file", () => {
  it("rejects a different email before creating any user", async () => {
    queueFlow();

    const result = await signUpAndClaimVendor("attacker@evil.test", "tok", "pw");

    expect(result).toMatchObject({ success: false, type: "invalid_token" });
    expect(mocks.createUser).not.toHaveBeenCalled();
  });

  it("accepts the same email regardless of case or surrounding whitespace", async () => {
    queueFlow();

    const result = await signUpAndClaimVendor("  Vendor@ACME.com ", "tok", "pw");

    expect(result).toMatchObject({ success: true });
  });
});