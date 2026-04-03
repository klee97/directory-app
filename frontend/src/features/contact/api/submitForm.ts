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
  const response = await fetch('/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ firstname, lastname, email, reason, message, recaptchaToken }),
  });

  return response;
}

export async function submitNewsletterForm({
  email, recaptchaToken,
}: {
  email: string;
  recaptchaToken: string;
}) {
  return fetch('/api/newsletter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, recaptchaToken }),
  });
}