import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import BackButton from "./BackButton";

const { mockBack, mockPush, mockUseSearchParams } = vi.hoisted(() => ({
  mockBack: vi.fn(),
  mockPush: vi.fn(),
  mockUseSearchParams: vi.fn(() => new URLSearchParams()),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ back: mockBack, push: mockPush }),
  useSearchParams: mockUseSearchParams,
}));

function setReferrer(value: string) {
  Object.defineProperty(document, "referrer", {
    value,
    configurable: true,
  });
}

describe("BackButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setReferrer("");
    mockUseSearchParams.mockReturnValue(new URLSearchParams());

  });

  it("renders the back button", () => {
    render(<BackButton />);
    expect(screen.getByRole("button", { name: /back/i })).toBeInTheDocument();
  });

  describe("when a same-origin referrer exists", () => {
    beforeEach(() => {
      setReferrer(`${window.location.origin}/some-page`);
    });

    it("calls router.back()", async () => {
      const user = userEvent.setup();
      render(<BackButton />);

      await user.click(screen.getByRole("button", { name: /back/i }));

      expect(mockBack).toHaveBeenCalledTimes(1);
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe("when there is no referrer", () => {
    it("calls router.push() with the fallback href", async () => {
      const user = userEvent.setup();
      render(<BackButton fallbackHref="/dashboard" />);

      await user.click(screen.getByRole("button", { name: /back/i }));

      expect(mockPush).toHaveBeenCalledWith("/dashboard");
      expect(mockBack).not.toHaveBeenCalled();
    });

    it("uses '/' as the default fallback href", async () => {
      const user = userEvent.setup();
      render(<BackButton />);

      await user.click(screen.getByRole("button", { name: /back/i }));

      expect(mockPush).toHaveBeenCalledWith("/");
      expect(mockBack).not.toHaveBeenCalled();
    });
  });

  describe("when referrer is a different origin", () => {
    beforeEach(() => {
      setReferrer("https://google.com/some-page");
    });

    it("calls router.push() with the fallback instead of router.back()", async () => {
      const user = userEvent.setup();
      render(<BackButton />);

      await user.click(screen.getByRole("button", { name: /back/i }));

      expect(mockPush).toHaveBeenCalledWith("/");
      expect(mockBack).not.toHaveBeenCalled();
    });
  });

  describe("when there is no referrer and a 'back' param exists", () => {
    beforeEach(() => {
      mockUseSearchParams.mockReturnValue(new URLSearchParams("back=/favorites"));
    });

    it("navigates to the 'back' param path", async () => {
      const user = userEvent.setup();
      render(<BackButton />);

      await user.click(screen.getByRole("button", { name: /back/i }));

      expect(mockPush).toHaveBeenCalledWith("/favorites");
      expect(mockBack).not.toHaveBeenCalled();
    });
  });

  describe("when there is no referrer and search params exist", () => {
    beforeEach(() => {
      mockUseSearchParams.mockReturnValue(
        new URLSearchParams({
          service: "Makeup",
          skill: "South Asian Makeup",
          travelsWorldwide: "true",
          query: "Bea",
          lat: "40.7127",
          lon: "-74.006",
        })
      );
    });

    it("appends search params to the fallback href", async () => {
      const user = userEvent.setup();
      render(<BackButton fallbackHref="/" />);

      await user.click(screen.getByRole("button", { name: /back/i }));

      expect(mockPush).toHaveBeenCalledWith(
        "/?service=Makeup&skill=South+Asian+Makeup&travelsWorldwide=true&query=Bea&lat=40.7127&lon=-74.006"
      );
      expect(mockBack).not.toHaveBeenCalled();
    });
  });
});