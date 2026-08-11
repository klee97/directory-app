import { Resend } from "resend";

const CLAIM_LINK_TEMPLATE_ID = process.env.RESEND_CLAIM_LINK_TEMPLATE_ID;

type SendClaimLinkEmailParams = {
  email: string;
  businessName: string;
  claimUrl: string;
};

/**
 * Sends the vendor claim-link email via a Resend template.
 * Variable names must match the template configured in the Resend dashboard exactly (case-sensitive).
 */
export async function sendClaimLinkEmail({
  email,
  businessName,
  claimUrl,
}: SendClaimLinkEmailParams): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.error("sendClaimLinkEmail: RESEND_API_KEY is not configured");
    return false;
  }

  if (!CLAIM_LINK_TEMPLATE_ID) {
    console.error("sendClaimLinkEmail: RESEND_CLAIM_LINK_TEMPLATE_ID is not configured");
    return false;
  }

  const resend = new Resend(apiKey);

  const { error } = await resend.emails.send({
    to: [email],
    template: {
      id: CLAIM_LINK_TEMPLATE_ID,
      variables: {
        VENDOR_BUSINESS_NAME: businessName,
        CLAIM_URL: claimUrl,
      },
    },
  });

  if (error) {
    console.error(`sendClaimLinkEmail: failed to send claim link to "${email}":`, error.message);
    return false;
  }

  return true;
}
