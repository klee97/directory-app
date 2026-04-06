import { NextRequest, NextResponse } from 'next/server';
import { verifyRecaptchaToken } from '@/lib/security/recaptchaVerification';
import { HUBSPOT_FORM_PREFIX } from '@/lib/hubspot/constants';

export async function POST(req: NextRequest) {
  const { email, recaptchaToken } = await req.json();

  if (!email) {
    return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
  }

  const isHuman = await verifyRecaptchaToken(recaptchaToken);
  if (!isHuman) {
    return NextResponse.json({ error: 'CAPTCHA verification failed.' }, { status: 400 });
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
    return NextResponse.json({ error: 'Failed to sign up for newsletter.' }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}