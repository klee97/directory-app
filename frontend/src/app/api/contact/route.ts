import { NextRequest, NextResponse } from 'next/server';
import { verifyRecaptchaToken } from '@/lib/security/recaptchaVerification';

export async function POST(req: NextRequest) {
  const { firstname, lastname, email, reason, message, recaptchaToken } = await req.json();

  if (!firstname || !lastname || !email || !reason || !message) {
    return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
  }

  const isHuman = await verifyRecaptchaToken(recaptchaToken);
  if (!isHuman) {
    return NextResponse.json({ error: 'CAPTCHA verification failed.' }, { status: 400 });
  }

  const hubspotUrl = `https://api.hsforms.com/submissions/v3/integration/submit/${process.env.HUBSPOT_PORTAL_ID}/${process.env.HUBSPOT_FORM_GUID}`;

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
    return NextResponse.json({ error: 'Failed to submit to HubSpot.' }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}