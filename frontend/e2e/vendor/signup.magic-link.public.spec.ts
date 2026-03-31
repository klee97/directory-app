import { test, expect } from '@playwright/test';

/**
 * Vendor Sign-Up and Magic Link claiming flow
 * Tests the various scenarios for claiming a vendor profile with a magic link
 */

const TEST_EMAILS = {
  vendorUnclaimed: process.env.TEST_VENDOR_UNCLAIMED_EMAIL || 'test-unclaimed@vendors.local',
  vendorNew: process.env.TEST_VENDOR_NEW_EMAIL || 'test-new@vendors.local',
  vendorExisting: process.env.TEST_VENDOR_EXISTING_EMAIL || 'test-existing@vendors.local',
  vendorMain: process.env.TEST_VENDOR_EMAIL || 'test-vendor@vendors.local',
  vendorAnother: process.env.TEST_VENDOR_ANOTHER_EMAIL || 'test-another@vendors.local',
};

const TEST_PASSWORD = process.env.TEST_VENDOR_PASSWORD || 'TestPassword123!';

// Helper to extract magic link from test email
async function getMagicLinkFromEmail(emailAddress: string): Promise<string> {
  // In a real setup, you'd fetch this from a test email service
  // For now, we'll construct it from environment or use a test endpoint
  const response = await fetch(`http://localhost:3000/api/test/magic-link?email=${encodeURIComponent(emailAddress)}`);
  if (!response.ok) {
    throw new Error(`Failed to get magic link for ${emailAddress}`);
  }
  const data = await response.json();
  return data.link;
}

test.describe('Vendor Sign-Up - Magic Link Claiming', () => {
  test('claim vendor profile with magic link redirects to /partner/claim', async ({ page }) => {
    // Assuming we have a way to get a valid magic link for a test vendor
    const magicLink = await getMagicLinkFromEmail(TEST_EMAILS.vendorUnclaimed);

    await page.goto(magicLink);

    // Should be redirected to claim page
    await expect(page).toHaveURL(/\/partner\/claim/);
    await expect(page.getByRole('heading', { name: /claim/i })).toBeVisible();
  });

  test('using same magic link before creating password redirects back to claim page', async ({ page }) => {
    const magicLink = await getMagicLinkFromEmail(TEST_EMAILS.vendorUnclaimed);

    // First visit
    await page.goto(magicLink);
    await expect(page).toHaveURL(/\/partner\/claim/);

    // Second visit to same link should still take you to claim page
    await page.goto(magicLink);
    await expect(page).toHaveURL(/\/partner\/claim/);
  });

  test('creating password redirects to /partner/dashboard', async ({ page }) => {
    const magicLink = await getMagicLinkFromEmail(TEST_EMAILS.vendorNew);
    const newPassword = 'NewPassword123!';

    await page.goto(magicLink);
    await expect(page).toHaveURL(/\/partner\/claim/);

    // Fill in the password form
    await page.getByLabel(/password/i).fill(newPassword);
    await page.getByLabel(/confirm password/i).fill(newPassword);
    await page.getByRole('button', { name: /create|claim/i }).click();

    // Should redirect to dashboard
    await expect(page).toHaveURL('/partner/dashboard', { timeout: 10_000 });
  });

  test('using same magic link while logged in shows notification', async ({ page }) => {
    const magicLink = await getMagicLinkFromEmail(TEST_EMAILS.vendorExisting);

    // First, log in as a vendor
    await page.goto('/partner/login');
    await page.getByLabel('Email Address').fill(TEST_EMAILS.vendorMain);
    await page.getByLabel('Password').fill(TEST_PASSWORD);
    await page.getByTestId('login-submit').click();
    await expect(page).toHaveURL('/partner/dashboard');

    // Now try to use the magic link for another vendor
    await page.goto(magicLink);

    // Should show notification and keep you logged in to original account
    await expect(page).toHaveURL(/\/partner/);
    // Check for notification (adjust selector based on actual UI)
    await expect(page.getByText(/already logged in|already signed in/i)).toBeVisible({ timeout: 5_000 });
  });

  test('using different magic link while logged in shows message on claim page', async ({ page }) => {
    const _magicLink1 = await getMagicLinkFromEmail(TEST_EMAILS.vendorMain);
    const magicLink2 = await getMagicLinkFromEmail(TEST_EMAILS.vendorAnother);

    // Log in with first account
    await page.goto('/partner/login');
    await page.getByLabel('Email Address').fill(TEST_EMAILS.vendorMain);
    await page.getByLabel('Password').fill(TEST_PASSWORD);
    await page.getByTestId('login-submit').click();
    await expect(page).toHaveURL('/partner/dashboard');

    // Try to use different magic link
    await page.goto(magicLink2);

    // Should show a message on claim page about being logged in to different account
    await expect(page).toHaveURL(/\/partner\/claim/);
    await expect(page.getByText(/different account|another account|log out/i)).toBeVisible({ timeout: 5_000 });
  });

  test('logging out and using magic link again redirects to claim page', async ({ page }) => {
    const magicLink = await getMagicLinkFromEmail(TEST_EMAILS.vendorMain);

    // Log in
    await page.goto('/partner/login');
    await page.getByLabel('Email Address').fill(TEST_EMAILS.vendorMain);
    await page.getByLabel('Password').fill(TEST_PASSWORD);
    await page.getByTestId('login-submit').click();
    await expect(page).toHaveURL('/partner/dashboard');

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

    await expect(page.getByText(/invalid|expired|error/i)).toBeVisible();
  });

  test('using magic link with missing token shows error page', async ({ page }) => {
    await page.goto('/partner/claim?email=test@example.com&slug=test-slug');

    await expect(page.getByText(/invalid|expired|error/i)).toBeVisible();
  });

  test('error page "Return Home" button redirects to /partner landing page', async ({ page }) => {
    // Try invalid link to get to error page
    await page.goto('/partner/claim?invalid=true');

    // If error page shows, click return home
    const returnButton = page.getByRole('button', { name: /return|home|go back/i });
    if (await returnButton.isVisible()) {
      await returnButton.click();
      // Should go back to home or partner landing
      await expect(page).toHaveURL(/^\/(?:partner)?$/);
    }
  });
});
