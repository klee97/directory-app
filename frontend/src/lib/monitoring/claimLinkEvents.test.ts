import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { recordClaimLinkOutcome, type ClaimLinkOutcome } from "./claimLinkEvents";

// `after()` throws outside a request scope, so replace it with a version that
// runs the callback immediately and remembers the promise. Tests call
// `flushAfter()` to wait for the "background" work, the way the platform would.
const { pending } = vi.hoisted(() => ({ pending: [] as Promise<unknown>[] }));
vi.mock("next/server", () => ({
  after: (fn: () => unknown) => {
    pending.push(Promise.resolve(fn()));
  },
}));
const flushAfter = () => Promise.all(pending.splice(0));

type Severity = "success" | "warning" | "error";

// Deliberately duplicated from the source table: this is the change detector.
// Reclassifying an outcome should force a conscious test edit.
const EXPECTED = {
  // success
  claimed: { severity: "success", alert: true },
  sent_claim_email: { severity: "success", alert: false },

  // warning, log-only
  cooldown: { severity: "warning", alert: false },
  race_lost: { severity: "warning", alert: false },
  recaptcha_failed: { severity: "warning", alert: false },
  expired_claim_link: { severity: "warning", alert: false },

  // warning, alert
  vendor_not_found: { severity: "warning", alert: true },
  already_claimed: { severity: "warning", alert: true },
  no_email: { severity: "warning", alert: true },
  invalid_token: { severity: "warning", alert: true },
  revalidate_failed: { severity: "warning", alert: true },
  email_exists: { severity: "warning", alert: true },
  email_mismatch: { severity: "warning", alert: true },

  // error (always alert)  
  claimed_with_error: { severity: "error", alert: true },
  vendor_update_failed: { severity: "error", alert: true },
  rollback_failed: { severity: "error", alert: true },
  email_failed: { severity: "error", alert: true },
  db_lookup_error: { severity: "error", alert: true },
  token_update_error: { severity: "error", alert: true },
  create_failed: { severity: "error", alert: true },
  claim_failed: { severity: "error", alert: true },
} satisfies Record<ClaimLinkOutcome, { severity: Severity; alert: boolean }>;

const CONSOLE_METHOD = { success: "log", warning: "warn", error: "error" } as const;
const EMOJI = { success: "✅", warning: "⚠️", error: "🚨" } as const;

describe("recordClaimLinkOutcome", () => {
  const fetchMock = vi.fn();
  const spies = {
    log: vi.spyOn(console, "log").mockImplementation(() => { }),
    warn: vi.spyOn(console, "warn").mockImplementation(() => { }),
    error: vi.spyOn(console, "error").mockImplementation(() => { }),
  };

  /** Structured outcome lines across all console methods (ignores other logs). */
  function outcomeEntries() {
    return Object.values(spies)
      .flatMap((spy) => spy.mock.calls.map((c) => c[0]))
      .filter((a): a is string => typeof a === "string" && a.startsWith("{"))
      .map((a) => JSON.parse(a))
      .filter((e) => e.event === "claim_link_outcome");
  }

  const slackText = () => JSON.parse(fetchMock.mock.calls[0][1].body).text as string;

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("SLACK_WEBHOOK_URL", "https://hooks.slack.test/x");
    fetchMock.mockReset();
    fetchMock.mockResolvedValue({ ok: true, status: 200 });
    Object.values(spies).forEach((spy) => spy.mockClear());
    pending.length = 0;
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  describe("logging", () => {
    it("logs one structured JSON line, with flow defaulting to 'request'", async () => {
      await recordClaimLinkOutcome("sent_claim_email", "acme");

      const entries = outcomeEntries();
      expect(entries).toHaveLength(1);
      expect(entries[0]).toMatchObject({
        event: "claim_link_outcome",
        severity: "success",
        flow: "request",
        outcome: "sent_claim_email",
        slug: "acme",
      });
      expect(Number.isNaN(Date.parse(entries[0].at))).toBe(false);
    });

    it("logs the flow it is given", async () => {
      await recordClaimLinkOutcome("claimed", "acme", "claim");
      await flushAfter();
      expect(outcomeEntries()[0].flow).toBe("claim");
    });

    it("logs a null slug as null", async () => {
      await recordClaimLinkOutcome("invalid_token", null, "claim");
      expect(outcomeEntries()[0].slug).toBeNull();
    });

    it("still logs, and skips fetch, when no webhook is configured", async () => {
      vi.stubEnv("SLACK_WEBHOOK_URL", "");
      await recordClaimLinkOutcome("email_failed", "acme");
      await flushAfter();

      expect(outcomeEntries()).toHaveLength(1);
      expect(fetchMock).not.toHaveBeenCalled();
    });
  });

  describe.each(Object.entries(EXPECTED))("%s", (outcome, { severity, alert }) => {
    it(`logs at ${severity} via console.${CONSOLE_METHOD[severity]}`, async () => {
      await recordClaimLinkOutcome(outcome as ClaimLinkOutcome, "acme", "claim");
      await flushAfter();

      expect(outcomeEntries()).toHaveLength(1);
      expect(outcomeEntries()[0].severity).toBe(severity);

      // Only the matching console method got the outcome line.
      for (const [method, spy] of Object.entries(spies)) {
        const lines = spy.mock.calls.filter(
          (c) => typeof c[0] === "string" && c[0].includes('"claim_link_outcome"'),
        );
        expect(lines).toHaveLength(method === CONSOLE_METHOD[severity] ? 1 : 0);
      }
    });

    it(`${alert ? "alerts" : "does not alert"} Slack`, async () => {
      await recordClaimLinkOutcome(outcome as ClaimLinkOutcome, "acme", "claim");
      await flushAfter();

      expect(fetchMock).toHaveBeenCalledTimes(alert ? 1 : 0);
      if (alert) expect(slackText().startsWith(EMOJI[severity])).toBe(true);
    });
  });

  describe("Slack message", () => {
    it("posts a readable message with a timeout signal", async () => {
      await recordClaimLinkOutcome("email_failed", "acme", "request");
      await flushAfter();

      const [url, init] = fetchMock.mock.calls[0];
      expect(url).toBe("https://hooks.slack.test/x");
      expect(init.method).toBe("POST");
      expect(init.headers).toMatchObject({ "Content-Type": "application/json" });
      expect(init.signal).toBeInstanceOf(AbortSignal);

      expect(slackText()).toMatch(
        /^🚨 Claim link request: `email_failed` \(slug: `acme`\) at \d{4}-\d{2}-\d{2}T/,
      );
    });

    it("uses a human label for each flow, never 'Claim claim'", async () => {
      await recordClaimLinkOutcome("claimed", "acme", "claim");
      await flushAfter();

      expect(slackText()).toContain("Claim completion:");
      expect(slackText()).not.toContain("Claim claim");
    });

    it("uses the severity emoji", async () => {
      await recordClaimLinkOutcome("claimed", "acme", "claim"); // success
      await recordClaimLinkOutcome("revalidate_failed", "acme"); // warning
      await recordClaimLinkOutcome("email_failed", "acme"); // error
      await flushAfter();

      const texts = fetchMock.mock.calls.map((c) => JSON.parse(c[1].body).text as string);
      expect(texts[0]).toMatch(/^✅/);
      expect(texts[1]).toMatch(/^⚠️/);
      expect(texts[2]).toMatch(/^🚨/);
    });

    it("says 'unknown' when the slug is null", async () => {
      await recordClaimLinkOutcome("create_failed", null, "claim");
      await flushAfter();
      expect(slackText()).toContain("`unknown`");
    });
  });

  describe("resilience", () => {
    it("does not make the caller wait for Slack", async () => {
      let release!: () => void;
      fetchMock.mockReturnValue(
        new Promise((resolve) => {
          release = () => resolve({ ok: true, status: 200 });
        }),
      );

      // Resolves even though the Slack request is still in flight.
      await expect(recordClaimLinkOutcome("email_failed", "acme")).resolves.toBeUndefined();
      expect(fetchMock).toHaveBeenCalledTimes(1);

      release();
      await flushAfter();
    });

    it("never throws when the Slack request rejects", async () => {
      fetchMock.mockRejectedValue(new Error("network down"));

      await expect(recordClaimLinkOutcome("email_failed", "acme")).resolves.toBeUndefined();
      await expect(flushAfter()).resolves.toBeDefined();
      expect(spies.error).toHaveBeenCalledWith(
        expect.stringContaining("slack alert failed"),
        expect.any(Error),
      );
    });

    // fetch does not reject on 4xx/5xx, so a revoked webhook would otherwise
    // fail silently. Requires `if (!res.ok) console.error(...)` in the recorder.
    it("reports a non-2xx Slack response without throwing", async () => {
      fetchMock.mockResolvedValue({ ok: false, status: 404 });

      await expect(recordClaimLinkOutcome("email_failed", "acme")).resolves.toBeUndefined();
      await flushAfter();
      expect(spies.error).toHaveBeenCalledWith(expect.stringContaining("status 404"));
    });

    // Only keep this if you added the `?? { severity: "error", alert: true }`
    // fallback. It guards against an untyped caller passing a bad outcome.
    it("treats an unknown outcome as an alerting error instead of throwing", async () => {
      await expect(
        recordClaimLinkOutcome("not_a_real_outcome" as ClaimLinkOutcome, "acme"),
      ).resolves.toBeUndefined();
      await flushAfter();

      expect(outcomeEntries()[0].severity).toBe("error");
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });
  });
});