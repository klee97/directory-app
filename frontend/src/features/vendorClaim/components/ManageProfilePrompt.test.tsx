import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { UserRole } from "@/lib/auth/userRole";
import ManageProfilePrompt from "./ManageProfilePrompt";

const { mockPush, mockUseAuth, mockAddNotification, mockRequestClaimLink } = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockUseAuth: vi.fn(),
  mockAddNotification: vi.fn(),
  mockRequestClaimLink: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/contexts/AuthContext", () => ({ useAuth: () => mockUseAuth() }));

vi.mock("@/contexts/NotificationContext", () => ({
  useNotification: () => ({ addNotification: mockAddNotification }),
}));

vi.mock("@/features/vendorClaim/actions/requestClaimLink", () => ({
  requestClaimLink: (args: unknown) => mockRequestClaimLink(args),
}));

// The real component renders an invisible reCAPTCHA widget that needs a script.
vi.mock("@/components/security/ReCaptcha", () => ({
  default: () => null,
}));

const VENDOR_ID = "vendor-1";
const SLUG = "test-vendor";

const PROPS = {
  slug: SLUG,
  vendorId: VENDOR_ID,
  businessName: "Katrina's Makeup",
  isClaimed: false,
  hasEmail: true,
  emailHint: "k•••••a@gmail.com",
};

/** Auth state for a viewer; `vendorId` null means "not a vendor". */
const authAs = (role: UserRole, vendorId: string | null = null) =>
  mockUseAuth.mockReturnValue({
    user: null,
    isLoggedIn: role !== UserRole.USER,
    isLoading: false,
    isRoleLoading: false,
    role,
    vendorId,
  });

describe("ManageProfilePrompt", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authAs(UserRole.USER);
    mockRequestClaimLink.mockResolvedValue({ success: true });
  });

  it("shows the claim link to a logged-out visitor", () => {
    render(<ManageProfilePrompt {...PROPS} />);

    expect(
      screen.getByRole("button", { name: "Is this your business? Manage this profile." })
    ).toBeInTheDocument();
  });

  it("sends the owner straight to their edit page", async () => {
    authAs(UserRole.VENDOR, VENDOR_ID);
    render(<ManageProfilePrompt {...PROPS} isClaimed />);

    await userEvent.click(screen.getByRole("button", { name: "Edit your profile." }));

    expect(mockPush).toHaveBeenCalledWith("/partner/dashboard/profile");
  });

  it("renders nothing for a vendor viewing someone else's listing", () => {
    authAs(UserRole.VENDOR, "some-other-vendor");
    const { container } = render(<ManageProfilePrompt {...PROPS} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing until the viewer's role has resolved", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isLoggedIn: true,
      isLoading: false,
      isRoleLoading: true,
      role: UserRole.USER,
      vendorId: null,
    });
    const { container } = render(<ManageProfilePrompt {...PROPS} />);

    expect(container).toBeEmptyDOMElement();
  });

  describe("rate limiting", () => {
    // The countdown is wall-clock driven, so pin the clock: a slow CI run must
    // not be able to tick it before the assertions look. Only the clock and the
    // interval are faked — userEvent and MUI transitions still need setTimeout.
    beforeEach(() => {
      vi.useFakeTimers({ toFake: ["Date", "setInterval", "clearInterval"] });
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    const openDialogAndSend = async () => {
      const user = userEvent.setup();
      render(<ManageProfilePrompt {...PROPS} />);
      await user.click(
        screen.getByRole("button", { name: "Is this your business? Manage this profile." })
      );
      await user.click(screen.getByRole("button", { name: "Send me a link" }));
    };

    it("shows the countdown inline and disables sending instead of toasting", async () => {
      mockRequestClaimLink.mockResolvedValue({
        success: false,
        error: "Request a new link in 4 minutes.",
        retryAfterSeconds: 240,
      });

      await openDialogAndSend();

      expect(screen.getByText(/Request a\s+new link in 4:00\./)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Send me a link \(4:00\)/ })).toBeDisabled();
      expect(mockAddNotification).not.toHaveBeenCalled();
    });

    it("ticks the countdown down and re-enables sending once it runs out", async () => {
      mockRequestClaimLink.mockResolvedValue({
        success: false,
        error: "Request a new link in 2 seconds.",
        retryAfterSeconds: 2,
      });

      await openDialogAndSend();
      expect(screen.getByRole("button", { name: /Send me a link \(0:02\)/ })).toBeDisabled();

      await act(() => vi.advanceTimersByTimeAsync(1000));
      expect(screen.getByRole("button", { name: /Send me a link \(0:01\)/ })).toBeDisabled();

      await act(() => vi.advanceTimersByTimeAsync(1000));
      expect(screen.getByRole("button", { name: "Send me a link" })).toBeEnabled();
    });

    it("still toasts errors that carry no cooldown", async () => {
      mockRequestClaimLink.mockResolvedValue({ success: false, error: "Missing vendor." });

      await openDialogAndSend();

      expect(mockAddNotification).toHaveBeenCalledWith("Missing vendor.", "error");
    });
  });
});
