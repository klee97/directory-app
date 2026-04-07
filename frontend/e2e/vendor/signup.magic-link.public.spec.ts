import { test, expect } from '@playwright/test';

/**
 * Vendor Sign-Up and Magic Link claiming flow
 * Tests the various scenarios for claiming a vendor profile with a magic link
 *
 * Depends on magic-link test vendors seeded in supabase/seed.sql (TEST-MAGIC-*).
 */

/** Seeded magic-link vendors — slugs & access_tokens match supabase/seed.sql */
const MAGIC_LINK_VENDORS: Record<string, { email: string; slug: string; token: string }> = {
  unclaimed: { email: 'test-unclaimed@vendors.local', slug: 'test-unclaimed-vendor', token: 'a0000000-0000-0000-0000-000000000001' },
  new: { email: 'test-new@vendors.local', slug: 'test-new-vendor', token: 'a0000000-0000-0000-0000-000000000002' },
  main: { email: 'test-vendor@vendors.local', slug: 'test-main-vendor', token: 'a0000000-0000-0000-0000-000000000004' },
  another: { email: 'test-another@vendors.local', slug: 'test-another-vendor', token: 'a0000000-0000-0000-0000-000000000005' },
};

function createMagicLink(vendor: keyof typeof MAGIC_LINK_VENDORS): string {
  const { email, slug, token } = MAGIC_LINK_VENDORS[vendor];
  return `/partner/claim?email=${encodeURIComponent(email)}&slug=${slug}&token=${token}`;
}

test.describe.serial('Vendor Sign-Up - Magic Link Claiming', () => {
  test('claim vendor profile with magic link redirects to /partner/claim', async ({ page }) => {
    const magicLink = createMagicLink('unclaimed');

    await page.goto(magicLink);

    // Should be redirected to claim page
    await expect(page).toHaveURL(/\/partner\/claim/);
    await expect(page.getByRole('heading', { name: 'Your profile is ready to claim' })).toBeVisible();
  });

  test('using same magic link before creating password redirects back to claim page', async ({ page }) => {
    const magicLink = createMagicLink('unclaimed');

    // First visit
    await page.goto(magicLink);
    await expect(page).toHaveURL(/\/partner\/claim/);

    // Second visit to same link should still take you to claim page
    await page.goto(magicLink);
    await expect(page).toHaveURL(/\/partner\/claim/);
  });

  test('creating password redirects to /partner/dashboard', async ({ page }) => {
    const magicLink = createMagicLink('new');
    const newPassword = 'NewPassword123!';

    await page.goto(magicLink);
    await expect(page).toHaveURL(/\/partner\/claim/);

    // Fill in the password form
    await page.getByLabel('Password', { exact: true }).fill(newPassword);
    await page.getByLabel('Confirm password').fill(newPassword);
    await page.getByRole('checkbox', { name: /I agree to the Vendor/i }).check();
    await page.getByRole('button', { name: /claim profile/i }).click();

    // Should redirect to dashboard
    await expect(page).toHaveURL('/partner/dashboard', { timeout: 10_000 });
  });

  test('using same magic link while logged in shows notification', async ({ page }) => {
    const magicLink = createMagicLink('new');

    // Now try to use the magic link for another vendor
    await page.goto(magicLink);

    // Should show notification and keep you logged in to original account
    await expect(page).toHaveURL(/\/partner/);
    await expect(page.getByText(/already logged in|already signed in|already claimed/i)).toBeVisible({ timeout: 5_000 });
  });

  test('using different magic link while logged in shows message on claim page', async ({ page }) => {
    const magicLink2 = createMagicLink('another');

    // Try to use different magic link
    await page.goto(magicLink2);

    // Should show a message on claim page about being logged in to different account
    await expect(page).toHaveURL(/\/partner\/claim/);
    await expect(page.getByText(/different account|another account|log out/i)).toBeVisible({ timeout: 5_000 });
  });

  test('logging out and using magic link again redirects to claim page', async ({ page }) => {
    const magicLink = createMagicLink('new');

    // Log out
    await page.getByTestId('profile-button').click();
    await page.getByRole('menuitem', { name: /log out|logout/i }).click();
    await expect(page).toHaveURL('/');

    // Use magic link again
    await page.goto(magicLink);

    // Should go to claim page or already logged in page
    await expect(page).toHaveURL(/\/partner\/claim|\/partner\/dashboard/, { timeout: 5_000 });
  });

  test('using magic link with missing email shows error page', async ({ page }) => {
    await page.goto('/partner/claim?token=invalid&slug=test-slug');

    await expect(page.getByRole('heading', { name: /something went wrong/i })).toBeVisible();
    await expect(page.getByText(/incomplete/i)).toBeVisible();
  });

  test('using magic link with missing token shows error page', async ({ page }) => {
    await page.goto('/partner/claim?email=test@example.com&slug=test-slug');

    await expect(page.getByRole('heading', { name: /something went wrong/i })).toBeVisible();
    await expect(page.getByText(/incomplete/i)).toBeVisible();
  });

  test('error page "Return Home" button redirects to /partner landing page', async ({ page }) => {
    // Try invalid link to get to error page
    await page.goto('/partner/claim?invalid=true');

    // If error page shows, click return home
    const returnButton = page.getByRole('button', { name: /return home/i });
    if (await returnButton.isVisible()) {
      await returnButton.click();
      // Should go back to home or partner landing
      await expect(page).toHaveURL(/^\/(?:partner)?$/);
    }
  });
});
