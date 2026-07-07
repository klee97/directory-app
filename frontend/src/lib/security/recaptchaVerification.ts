import { isDevOrPreview } from "@/lib/env/env";

// Function to verify reCAPTCHA token with Google
export async function verifyRecaptchaToken(token: string): Promise<{ success: boolean }> {
  if (isDevOrPreview() && token === 'test-fail') {
    return { success: false };
  }
  if (isDevOrPreview() && token === 'test-bypass') {
    return { success: true };
  }
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${secretKey}&response=${token}`,
    });
    clearTimeout(timeout);
    return await response.json();
  } catch (error) {
    console.error('CAPTCHA verification request failed:', error);
    return { success: false };
  }
}