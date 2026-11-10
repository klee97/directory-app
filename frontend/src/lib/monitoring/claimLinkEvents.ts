import { after } from "next/server";

// Minimum viable launch monitoring: no storage. Every outcome is logged (so it
// is searchable in Vercel logs while they last) and the broken ones ping Slack
// right away, with a timestamp to search the logs by
type Severity = "success" | "warning" | "error";

const OUTCOMES = {
  // success
  claimed: { severity: "success", alert: true },
  sent_claim_email: { severity: "success", alert: false },

  // expected / user-caused / degraded-but-delivered
  cooldown: { severity: "warning", alert: false },
  race_lost: { severity: "warning", alert: false },
  vendor_not_found: { severity: "warning", alert: false },
  already_claimed: { severity: "warning", alert: false },
  no_email: { severity: "warning", alert: false },
  recaptcha_failed: { severity: "warning", alert: false },
  invalid_token: { severity: "warning", alert: false },
  expired_claim_link: { severity: "warning", alert: false },
  revalidate_failed: { severity: "warning", alert: true },
  email_exists: { severity: "warning", alert: true },
  email_mismatch: { severity: "warning", alert: true },

  // something on our side broke
  claimed_with_error: { severity: "error", alert: true },
  vendor_update_failed: { severity: "error", alert: true },
  rollback_failed: { severity: "error", alert: true },
  email_failed: { severity: "error", alert: true },
  db_lookup_error: { severity: "error", alert: true },
  token_update_error: { severity: "error", alert: true },
  create_failed: { severity: "error", alert: true },
  claim_failed: { severity: "error", alert: true },
} as const satisfies Record<string, { severity: Severity; alert: boolean }>;

const SEVERITY_CONSOLE = {
  success: "log",
  warning: "warn",
  error: "error",
} as const satisfies Record<Severity, "log" | "warn" | "error">;

const SEVERITY_EMOJI = {
  success: "✅",
  warning: "⚠️",
  error: "🚨",
} as const satisfies Record<Severity, string>;

const FLOW_LABEL = {
  request: "Claim link request",
  claim: "Claim completion",
} as const satisfies Record<ClaimLinkFlow, string>;

export type ClaimLinkOutcome = keyof typeof OUTCOMES;

export type ClaimLinkFlow = "request" | "claim";

export async function recordClaimLinkOutcome(
  outcome: ClaimLinkOutcome,
  slug: string | null,
  flow: ClaimLinkFlow = "request",
) {
  const def = OUTCOMES[outcome] ?? { severity: "error", alert: true };
  const { severity, alert } = def;
  const at = new Date().toISOString();

  console[SEVERITY_CONSOLE[severity]](
    JSON.stringify({ event: "claim_link_outcome", severity, flow, outcome, slug, at }),
  );

  const webhook = process.env.SLACK_WEBHOOK_URL;
  if (!alert || !webhook) return;

  after(async () => {
    try {
      const res = await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: `${SEVERITY_EMOJI[severity]} ${FLOW_LABEL[flow]}: \`${outcome}\` (slug: \`${slug ?? "unknown"}\`) at ${at}`,
        }),
        signal: AbortSignal.timeout(3000),
      });
      if (!res.ok) console.error(`slack alert failed with status ${res.status}`);
    } catch (e) {
      console.error("slack alert failed:", e);
    }
  });
}