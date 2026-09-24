import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { forwardRef, useImperativeHandle } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import VendorClaimContent from "./VendorClaimContent";

const { mockUseAuth, mockVerify, mockSignOut, mockExecuteAsync, mockPush } = vi.hoisted(() => ({
  mockUseAuth: vi.fn(),
  mockVerify: vi.fn(),
  mockSignOut: vi.fn(),
  mockExecuteAsync: vi.fn(),
  mockPush: vi.fn(),
}));

// The error and already-logged-in screens both call useRouter.
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: mockPush }) }));

vi.mock("@/contexts/AuthContext", () => ({ useAuth: () => mockUseAuth() }));

vi.mock("@/features/profile/common/api/magicLink", () => ({
  verifyVendorMagicLink: (...args: unknown[]) => mockVerify(...args),
}));

vi.mock("@/lib/supabase/clients/browserClient", () => ({
  createBrowserClient: () => ({ auth: { signOut: mockSignOut } }),
}));

// Stands in for the invisible widget: the point of the mock is that the ref
// only resolves if the component is actually mounted.
vi.mock("@/components/security/ReCaptcha", () => {
  const MockReCaptcha = forwardRef<unknown, unknown>((_props, ref) => {
    useImperativeHandle(ref, () => ({
      executeAsync: mockExecuteAsync,
      reset: vi.fn(),
      getValue: () => null,
    }));
    return null;
  });
  MockReCaptcha.displayName = "MockReCaptcha";
  return { default: MockReCaptcha };
});

// Not under test, and it drags in its own Supabase/notification dependencies.
vi.mock("@/features/vendorClaim/components/VendorClaimForm", () => ({
  default: () => <div>Set a password below to claim your profile</div>,
}));

const SLUG = "katrinas-makeup";
const EMAIL = "artist+TEST1@gmail.com";
const TOKEN = "80e337c7-701f-4caa-96b4-6d3f6ebc078c";

const PARAMS = { slug: SLUG, email: EMAIL, token: TOKEN };

const VERIFIED = {
  success: true,
  hasEmailOnFile: true,
  isClaimed: false,
  recaptchaFailed: false,
  vendorEmail: EMAIL,
  vendorBusinessName: "Katrina's Makeup",
};

const loggedOut = {
  user: null,
  isLoggedIn: false,
  isLoading: false,
  isRoleLoading: false,
  role: "user",
  vendorId: null,
};

const loggedInAs = (email: string) => ({ ...loggedOut, user: { email }, isLoggedIn: true });

const claimForm = () => screen.findByText("Set a password below to claim your profile");

describe("VendorClaimContent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("NEXT_PUBLIC_FEATURE_CLAIM_PROFILE_ENABLED", "true");
    mockUseAuth.mockReturnValue(loggedOut);
    mockVerify.mockResolvedValue(VERIFIED);
    mockExecuteAsync.mockResolvedValue("captcha-abc");
    mockSignOut.mockResolvedValue({ error: null });
  });

  it("verifies the link from its props and shows the claim form", async () => {
    render(<VendorClaimContent {...PARAMS} />);

    expect(await claimForm()).toBeInTheDocument();
  });

  it("passes a live reCAPTCHA token, proving the widget is mounted", async () => {
    render(<VendorClaimContent {...PARAMS} />);
    await claimForm();

    expect(mockVerify).toHaveBeenCalledWith(SLUG, EMAIL, TOKEN, "captcha-abc");
  });

  it("reports an incomplete link only when a param is genuinely absent", async () => {
    render(<VendorClaimContent {...PARAMS} token="" />);

    expect(await screen.findByText("Incomplete claim link")).toBeInTheDocument();
    expect(mockVerify).not.toHaveBeenCalled();
  });

  it("offers a retry when the bot check fails, not an invalid-link error", async () => {
    mockVerify.mockResolvedValue({ ...VERIFIED, success: false, recaptchaFailed: true });

    render(<VendorClaimContent {...PARAMS} />);

    expect(await screen.findByText("Security verification failed")).toBeInTheDocument();
  });

  it("clears an earlier error once a later run succeeds", async () => {
    const { rerender } = render(<VendorClaimContent {...PARAMS} token="" />);
    expect(await screen.findByText("Incomplete claim link")).toBeInTheDocument();

    rerender(<VendorClaimContent {...PARAMS} />);

    expect(await claimForm()).toBeInTheDocument();
    expect(screen.queryByText("Incomplete claim link")).toBeNull();
  });

  describe("signing out to claim as someone else", () => {
    it("verifies the link in place instead of stranding a stale error", async () => {
      mockUseAuth.mockReturnValue(loggedInAs("bride@example.com"));
      const { rerender } = render(<VendorClaimContent {...PARAMS} />);

      expect(await screen.findByText("You're already logged in")).toBeInTheDocument();

      // Signing out flips the auth context, which reruns verification.
      mockUseAuth.mockReturnValue(loggedOut);
      await userEvent.click(screen.getByRole("button", { name: "Log out" }));
      rerender(<VendorClaimContent {...PARAMS} />);

      await waitFor(() => expect(mockSignOut).toHaveBeenCalled());
      expect(await claimForm()).toBeInTheDocument();
      expect(screen.queryByText("Incomplete claim link")).toBeNull();
      expect(screen.queryByText("Something went wrong")).toBeNull();
    });
  });
});
