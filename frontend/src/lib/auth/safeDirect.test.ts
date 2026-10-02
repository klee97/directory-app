import { describe, it, expect } from "vitest";
import { safeRedirectPath } from "./safeRedirect";

describe("safeRedirectPath", () => {
  it.each([
    "/",
    "/admin",
    "/admin/create",
    "/admin/create?x=1&y=2",
    "/partner/dashboard",
    "/page#section",
  ])("accepts same-origin path %j", (value) => {
    expect(safeRedirectPath(value)).toBe(value);
  });

  it.each([
    ["absolute https URL", "https://evil.com"],
    ["absolute http URL", "http://evil.com/path"],
    ["protocol-relative", "//evil.com"],
    ["backslash variant", "/\\evil.com"],
    ["tab smuggling", "/\t/evil.com"],
    ["newline smuggling", "/\n/evil.com"],
    ["carriage return smuggling", "/\r/evil.com"],
    ["javascript: scheme", "javascript:alert(1)"],
    ["data: scheme", "data:text/html,<script>alert(1)</script>"],
    ["bare hostname", "evil.com"],
    ["leading space", " /admin"],
    ["empty string", ""],
  ])("rejects %s", (_label, value) => {
    expect(safeRedirectPath(value)).toBeNull();
  });

  it("returns null for null and undefined", () => {
    expect(safeRedirectPath(null)).toBeNull();
    expect(safeRedirectPath(undefined)).toBeNull();
  });
});