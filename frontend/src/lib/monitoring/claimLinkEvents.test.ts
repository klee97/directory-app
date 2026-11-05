import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { recordClaimLinkOutcome, type ClaimLinkOutcome } from "./claimLinkEvents";

const SHOULD_ALERT = {
  // log-only
  sent: false,
  invalid_token: false,
  expired_claim_link: false,
  cooldown: false,
  race_lost: false,
  vendor_not_found: false,
  already_claimed: false,
  no_email: false,
  recaptcha_failed: false,
  // alert
  claimed: true,
  claimed_with_error: true,
  vendor_update_failed: true,
  rollback_failed: true,
  email_failed: true,
  db_lookup_error: true,
  token_update_error: true,
  revalidate_failed: true,
  email_exists: true,
  create_failed: true,
  claim_failed: true,
  email_mismatch: true,
} satisfies Record<ClaimLinkOutcome, boolean>;

describe("recordClaimLinkOutcome", () => {
  const fetchMock = vi.fn();
  const logSpy = vi.spyOn(console, "log").mockImplementation(() => { });
  const errorSpy = vi.spyOn(console, "error").mockImplementation(() => { });

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("SLACK_WEBHOOK_URL", "https://hooks.slack.test/x");
    fetchMock.mockReset();
    fetchMock.mockResolvedValue({ ok: true, status: 200 });
    logSpy.mockClear();
    errorSpy.mockClear();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("logs one structured JSON line, with flow defaulting to 'request'", async () => {
    await recordClaimLinkOutcome("sent", "acme");

    expect(logSpy).toHaveBeenCalledTimes(1);
    const entry = JSON.parse(logSpy.mock.calls[0][0] as string);
    expect(entry).toMatchObject({
      event: "claim_link_outcome",
      flow: "request",
      outcome: "sent",
      slug: "acme",
    });
    expect(Number.isNaN(Date.parse(entry.at))).toBe(false);
  });

  it("logs the flow it is given", async () => {
    await recordClaimLinkOutcome("claimed", "acme", "claim");
    const entry = JSON.parse(logSpy.mock.calls[0][0] as string);
    expect(entry.flow).toBe("claim");
  });

  it("logs a null slug as null", async () => {
    await recordClaimLinkOutcome("invalid_token", null, "claim");
    const entry = JSON.parse(logSpy.mock.calls[0][0] as string);
    expect(entry.slug).toBeNull();
  });

  it.each(Object.entries(SHOULD_ALERT))("%s → alerts: %s", async (outcome, alerts) => {
    await recordClaimLinkOutcome(outcome as ClaimLinkOutcome, "acme", "claim");

    expect(logSpy).toHaveBeenCalledTimes(1); // every outcome is logged
    expect(fetchMock).toHaveBeenCalledTimes(alerts ? 1 : 0);
  });

  it("posts flow, outcome and slug to Slack with a timeout signal", async () => {
    await recordClaimLinkOutcome("email_failed", "acme", "request");

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://hooks.slack.test/x");
    expect(init.method).toBe("POST");
    expect(init.headers).toMatchObject({ "Content-Type": "application/json" });
    expect(JSON.parse(init.body).text).toMatch(/request.*email_failed.*acme/);
    expect(init.signal).toBeInstanceOf(AbortSignal);
  });

  it("says 'unknown' in Slack when the slug is null", async () => {
    await recordClaimLinkOutcome("create_failed", null, "claim");
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).text).toContain("unknown");
  });

  it("still logs, and skips fetch, when no webhook is configured", async () => {
    vi.stubEnv("SLACK_WEBHOOK_URL", "");
    await recordClaimLinkOutcome("email_failed", "acme");

    expect(logSpy).toHaveBeenCalledTimes(1);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("never throws when the Slack request rejects", async () => {
    fetchMock.mockRejectedValue(new Error("network down"));

    await expect(recordClaimLinkOutcome("email_failed", "acme")).resolves.toBeUndefined();
    expect(errorSpy).toHaveBeenCalled();
  });

  // Requires `if (!res.ok) console.error(...)` in the recorder: fetch does not
  // reject on 4xx/5xx, so a revoked webhook would otherwise fail silently.
  it("reports a non-2xx Slack response without throwing", async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 404 });

    await expect(recordClaimLinkOutcome("email_failed", "acme")).resolves.toBeUndefined();
    expect(errorSpy).toHaveBeenCalled();
  });
});