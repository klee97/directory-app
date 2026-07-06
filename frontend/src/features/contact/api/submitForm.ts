import { callApi } from '@/lib/api/client';
import type { ApiResponse } from '@/types/api';

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
}): Promise<ApiResponse<{ success: true }>> {
  return callApi('/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ firstname, lastname, email, reason, message, recaptchaToken }),
  });
}

export async function submitNewsletterForm({
  email, recaptchaToken,
}: {
  email: string;
  recaptchaToken: string;
}): Promise<ApiResponse<{ success: true }>> {
  return callApi('/api/newsletter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, recaptchaToken }),
  });
}