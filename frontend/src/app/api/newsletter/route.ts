import { NextRequest, NextResponse } from 'next/server';
import { verifyRecaptchaToken } from '@/lib/security/recaptchaVerification';

export async function POST(req: NextRequest) {
  const { email, recaptchaToken } = await req.json();

  if (!email) {
    return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
  }

  const isHuman = await verifyRecaptchaToken(recaptchaToken);
  if (!isHuman) {
    return NextResponse.json({ error: 'CAPTCHA verification failed.' }, { status: 400 });
  }

  const hubspotUrl = `https://api.hsforms.com/submissions/v3/integration/submit/${process.env.HUBSPOT_PORTAL_ID}/${process.env.HUBSPOT_FORM_NEWSLETTER_GUID}`;

  const response = await fetch(hubspotUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fields: [{ name: 'email', value: email }],
    }),
  });

  if (!response.ok) {
    console.error('Failed to submit newsletter to HubSpot:', response.statusText);
    return NextResponse.json({ error: 'Failed to submit to HubSpot.' }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}