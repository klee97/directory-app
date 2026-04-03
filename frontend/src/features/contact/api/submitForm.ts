"use server";

import { verifyRecaptchaToken } from '@/lib/security/recaptchaVerification';

export async function submitForm({
  firstname,
  lastname,
  email,
  reason,
  message,
  recaptchaToken,
}: {
  firstname: string,
  lastname: string,
  email: string,
  reason: string,
  message: string,
  recaptchaToken: string
}) {
  const isHuman = await verifyRecaptchaToken(recaptchaToken);
  if (!isHuman) {
    return { ok: false, error: 'CAPTCHA verification failed.' };
  }

  try {
    const HUBSPOT_PORTAL_ID = process.env.HUBSPOT_PORTAL_ID;
    const HUBSPOT_FORM_GUID = process.env.HUBSPOT_FORM_GUID;

    const hubspotUrl = `https://api.hsforms.com/submissions/v3/integration/submit/${HUBSPOT_PORTAL_ID}/${HUBSPOT_FORM_GUID}`;

    const response = await fetch(hubspotUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fields: [
          { name: "firstname", value: firstname },
          { name: "lastname", value: lastname },
          { name: "email", value: email },
          { name: "reason", value: reason },
          { name: "message", value: message },
        ],
      }),
    });

    if (!response.ok) {
      console.error("Failed to submit to HubSpot:", response.statusText);
      return { ok: false, error: "Failed to submit to HubSpot" };
    }

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred',
    };
  }
}

export async function submitNewsletterForm({
  email,
  recaptchaToken,
}: {
  email: string,
  recaptchaToken: string
}) {
  const isHuman = await verifyRecaptchaToken(recaptchaToken);
  if (!isHuman) {
    return { ok: false, error: 'CAPTCHA verification failed.' };
  }
  try {
    const HUBSPOT_PORTAL_ID = process.env.HUBSPOT_PORTAL_ID;
    const HUBSPOT_FORM_NEWSLETTER_GUID = process.env.HUBSPOT_FORM_NEWSLETTER_GUID;

    const hubspotUrl = `https://api.hsforms.com/submissions/v3/integration/submit/${HUBSPOT_PORTAL_ID}/${HUBSPOT_FORM_NEWSLETTER_GUID}`;

    const response = await fetch(hubspotUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fields: [
          { name: "email", value: email }
        ],
      }),
    });

    if (!response.ok) {
      console.error("Failed to submit to HubSpot:", response.statusText);
      return { ok: false, error: "Failed to submit to HubSpot" };
    }
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred',
    };
  }
}