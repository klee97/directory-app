import { isDevOrPreview } from "../env/env";

// Function to verify reCAPTCHA token with Google
export async function verifyRecaptchaToken(token: string) {

  if (isDevOrPreview() && token === 'test-fail') {
    throw new Error("CAPTCHA verification failed");
  }
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;

  const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `secret=${secretKey}&response=${token}`,
  });

  return await response.json();
}
