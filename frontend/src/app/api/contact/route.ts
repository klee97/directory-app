import { NextRequest } from 'next/server';
import { verifyRecaptchaToken } from '@/lib/security/recaptchaVerification';
import { HUBSPOT_FORM_PREFIX } from '@/lib/hubspot/constants';
import { apiError, apiSuccess } from '@/lib/api/respond';

export async function POST(req: NextRequest) {
  const { firstname, lastname, email, reason, message, recaptchaToken } = await req.json();

  if (!firstname || !lastname || !email || !reason || !message) {
    return apiError('All fields are required.', 400);
  }

  const isHuman: { success: boolean } = await verifyRecaptchaToken(recaptchaToken);
  if (!isHuman.success) {
    return apiError('CAPTCHA verification failed.', 400);
  }

  const hubspotUrl = `${HUBSPOT_FORM_PREFIX}/${process.env.HUBSPOT_FORM_GUID}`;

  const response = await fetch(hubspotUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fields: [
        { name: 'firstname', value: firstname },
        { name: 'lastname', value: lastname },
        { name: 'email', value: email },
        { name: 'reason', value: reason },
        { name: 'message', value: message },
      ],
    }),
  });

  if (!response.ok) {
    console.error('Failed to submit to HubSpot:', response.statusText);
    return apiError('Failed to send contact message.', 502);
  }

  return apiSuccess({ success: true });
}