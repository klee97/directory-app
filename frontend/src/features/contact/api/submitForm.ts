import { fetchApi } from '@/lib/api/client';
import type { ApiResponse, EmptyResponse } from '@/types/api';

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
}): Promise<ApiResponse<EmptyResponse>> {
  return fetchApi<EmptyResponse>('/api/contact', {
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
}): Promise<ApiResponse<EmptyResponse>> {
  return fetchApi<EmptyResponse>('/api/newsletter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, recaptchaToken }),
  });
}