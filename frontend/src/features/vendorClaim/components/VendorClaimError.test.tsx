import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import VendorClaimError from "./VendorClaimError";

const { mockPush } = vi.hoisted(() => ({ mockPush: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

const SLUG = "test-claim-vendor";

const clickPrimary = async (name: string | RegExp) => {
  await userEvent.click(screen.getByRole("button", { name }));
};

describe("VendorClaimError", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("NEXT_PUBLIC_FEATURE_CLAIM_PROFILE_ENABLED", "true");
  });

  describe("invalid_link, claim profile enabled", () => {
    it("says the link may have expired", () => {
      render(<VendorClaimError errorType="invalid_link" slug={SLUG} hasEmailOnFile />);

      expect(screen.getByText("Invalid or expired claim link")).toBeInTheDocument();
      expect(screen.getByText(/has expired/)).toBeInTheDocument();
    });

    it("sends a vendor with an email on file to the listing's claim dialog", async () => {
      render(<VendorClaimError errorType="invalid_link" slug={SLUG} hasEmailOnFile />);

      await clickPrimary("Request a new link");

      expect(mockPush).toHaveBeenCalledWith(`/vendors/${SLUG}?claim=1`);
    });

    it("sends a vendor with no email on file to the listing without auto-opening", async () => {
      render(<VendorClaimError errorType="invalid_link" slug={SLUG} hasEmailOnFile={false} />);

      await clickPrimary("Request a new link");

      expect(mockPush).toHaveBeenCalledWith(`/vendors/${SLUG}`);
    });

    it("keeps the login button for an already-claimed listing", async () => {
      render(<VendorClaimError errorType="invalid_link" slug={SLUG} hasEmailOnFile isClaimed />);

      expect(screen.queryByRole("button", { name: "Request a new link" })).toBeNull();
      await clickPrimary("Log in");

      expect(mockPush).toHaveBeenCalledWith("/partner/login");
    });

    it("falls back to login when the link carried no slug", async () => {
      render(<VendorClaimError errorType="invalid_link" hasEmailOnFile />);

      await clickPrimary("Log in");

      expect(mockPush).toHaveBeenCalledWith("/partner/login");
    });
  });

  it("keeps the original copy and button when the flag is off", async () => {
    vi.stubEnv("NEXT_PUBLIC_FEATURE_CLAIM_PROFILE_ENABLED", "false");
    render(<VendorClaimError errorType="invalid_link" slug={SLUG} hasEmailOnFile />);

    expect(screen.getByText("Invalid claim link")).toBeInTheDocument();
    await clickPrimary("Log in");

    expect(mockPush).toHaveBeenCalledWith("/partner/login");
  });

  it("leaves the other error states untouched", async () => {
    render(<VendorClaimError errorType="missing_params" slug={SLUG} hasEmailOnFile />);

    expect(screen.getByText("Incomplete claim link")).toBeInTheDocument();
    await clickPrimary("Log in");

    expect(mockPush).toHaveBeenCalledWith("/partner/login");
  });
});
