import { NextRequest } from 'next/server';
import { verifyRecaptchaToken } from '@/lib/security/recaptchaVerification';
import { HUBSPOT_FORM_PREFIX } from '@/lib/hubspot/constants';
import { apiError, apiSuccess } from '@/lib/api/respond';

export async function POST(req: NextRequest) {
  const { email, recaptchaToken } = await req.json();

  if (!email) {
    return apiError('Email is required.', 400);
  }

  const isHuman: { success: boolean } = await verifyRecaptchaToken(recaptchaToken);
  if (!isHuman.success) {
    return apiError('CAPTCHA verification failed.', 400);
  }

  const hubspotUrl = `${HUBSPOT_FORM_PREFIX}/${process.env.HUBSPOT_FORM_NEWSLETTER_GUID}`;

  const response = await fetch(hubspotUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fields: [{ name: 'email', value: email }],
    }),
  });

  if (!response.ok) {
    console.error('Failed to submit newsletter to HubSpot:', response.statusText);
    return apiError('Failed to sign up for newsletter.', 502);
  }

  return apiSuccess({});
}