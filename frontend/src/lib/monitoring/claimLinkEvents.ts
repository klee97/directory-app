// Minimum viable launch monitoring: no storage. Every outcome is logged (so it
// is searchable in Vercel logs while they last) and the broken ones ping Slack
// right away, with a timestamp to search the logs by.

export type ClaimLinkOutcome =
  | "claimed" | "claimed_with_error" | "sent"
  | "invalid_token" | "expired_claim_link" | "vendor_update_failed"
  | "cooldown" | "race_lost" | "vendor_not_found"
  | "already_claimed" | "no_email" | "recaptcha_failed" | "revalidate_failed"
  | "email_failed" | "rollback_failed" | "db_lookup_error" | "token_update_error"
  // new, for the claim flow
  | "email_exists" | "create_failed" | "claim_failed" | "email_mismatch";

export type ClaimLinkFlow = "request" | "claim";

// Needs a human. Everything else is expected/user-driven and is log-only.
const ALERT_OUTCOMES: ReadonlySet<ClaimLinkOutcome> = new Set([
  "claimed_with_error", "vendor_update_failed", "rollback_failed",
  "email_failed", "db_lookup_error", "token_update_error", "revalidate_failed",
  "create_failed", "claim_failed", "email_exists", "email_mismatch",
]);

export async function recordClaimLinkOutcome(
  outcome: ClaimLinkOutcome,
  slug: string | null,
  flow: ClaimLinkFlow = "request",
) {
  const at = new Date().toISOString();
  console.log(JSON.stringify({ event: "claim_link_outcome", flow, outcome, slug, at }));

  if (!ALERT_OUTCOMES.has(outcome) || !process.env.SLACK_WEBHOOK_URL) return;

  try {
    const res = await fetch(process.env.SLACK_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: `🚨 Claim ${flow}: ${outcome} (slug: ${slug ?? "unknown"}) at ${at}` }),
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) {
      console.error(`recordClaimLinkOutcome: slack alert failed with status ${res.status}`);
    }
  } catch (e) {
    console.error("recordClaimLinkOutcome: slack alert failed:", e);
  }
}