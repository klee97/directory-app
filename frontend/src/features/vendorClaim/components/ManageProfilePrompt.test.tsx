import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
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
    const openDialogAndSend = async () => {
      render(<ManageProfilePrompt {...PROPS} />);
      await userEvent.click(
        screen.getByRole("button", { name: "Is this your business? Manage this profile." })
      );
      await userEvent.click(screen.getByRole("button", { name: "Send me a link" }));
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

    it("still toasts errors that carry no cooldown", async () => {
      mockRequestClaimLink.mockResolvedValue({ success: false, error: "Missing vendor." });

      await openDialogAndSend();

      expect(mockAddNotification).toHaveBeenCalledWith("Missing vendor.", "error");
    });
  });
});
