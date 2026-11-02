import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';


const CONFIRM_PATH = '/api/auth/confirm';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY!;

const admin = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});


async function mintTokenHash(email: string) {
  const { data, error } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email: email,
  });
  if (error) throw error;
  return data.properties.hashed_token;
}

const confirmUrl = (token: string, extra = '') =>
  `${CONFIRM_PATH}?token_hash=${token}&type=email${extra}`;

test('a valid token sets session cookies and no-store headers on the redirect', async ({ request }) => {
  const res = await request.get(confirmUrl(await mintTokenHash("test-confirm-user@example.com")), { maxRedirects: 0 });

  expect(res.status()).toBe(307);
  // Fail with a useful message if we landed on the error page
  expect(new URL(res.headers()['location'], 'http://localhost:3000').pathname).not.toMatch(/auth-code-error/);

  const setCookies = res.headersArray().filter((h) => h.name.toLowerCase() === 'set-cookie');
  expect(setCookies.map((h) => h.value).join('\n')).toMatch(/sb-.*-auth-token/);
  expect(res.headers()['cache-control']).toContain('no-store');
});

test('the cookies from the confirm redirect actually authenticate the user', async ({ page }) => {
  await page.goto(confirmUrl(await mintTokenHash("test-confirm-user2@example.com")));
  // Logged-in users get bounced away from /login by the middleware, which proves
  // the cookie set by the route is readable by getClaims().
  await page.goto('/login');
  await expect(page).not.toHaveURL(/\/login/);
});

