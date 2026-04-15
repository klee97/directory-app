import { test, expect } from '../fixtures/fixtures';

/**
 * Vendor Dashboard e2e tests — runs as authenticated vendor.
 *
 * Tests the dashboard page rendering, welcome section, profile checklist,
 * and card layout. All tests are read-only (no state mutation).
 *
 * Depends on test fixture vendors from supabase/seed.sql:
 *   - TEST-E2E-001 "Test Glamour Studio"  (vendor for worker 0, verified, has inquiries)
 *   - TEST-E2E-002 "Test Bridal Beauty Co" (vendor for worker 1)
 *   - TEST-E2E-003 "Test Vendor 3" (worker 2)
 *   - TEST-E2E-004 "Test Vendor 4" (worker 3)
 */

// eslint-disable-next-line react-hooks/rules-of-hooks
test.use({ storageState: ({ vendorWorkerStorageState }, use) => use(vendorWorkerStorageState) });

test.describe('Vendor Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/partner/dashboard');
  });

  test('dashboard renders with welcome heading', async ({ page }) => {
    await expect(page.getByText(/Welcome,.*!/)).toBeVisible();
  });

  test('dashboard shows link to view public profile', async ({ page }) => {
    await expect(page.getByText('See how your profile looks to clients')).toBeVisible();
  });

  test.fixme('Edit Profile button links to profile editor', async ({ page }) => {
    const editProfileButton = page.getByRole('link', { name: 'Edit Profile' });
    await expect(editProfileButton).toBeVisible();
    await editProfileButton.click();
    await expect(page).toHaveURL('/partner/dashboard/profile');
  });

  test('profile checklist shows expected items', async ({ page }) => {
    await expect(page.getByText('Basic Business Info')).toBeVisible();
    await expect(page.getByText('Detailed Bio')).toBeVisible();
    await expect(page.getByText('Client Photo', { exact: true })).toBeVisible();
  });

  test('dashboard shows Edit Your Profile card with title link', async ({ page }) => {
    const editProfileLink = page.getByRole('link', { name: 'Edit Your Profile' });
    await expect(editProfileLink).toBeVisible();
    await expect(editProfileLink).toHaveAttribute('href', '/partner/dashboard/profile');
  });

  test('dashboard shows Badge Toolkit card', async ({ page }) => {
    await expect(page.getByText('Badge Toolkit')).toBeVisible();
  });

  test('dashboard shows Performance Stats card with coming soon', async ({ page }) => {
    await expect(page.getByText('Performance Stats')).toBeVisible();
    await expect(page.getByText('Coming Soon...')).toBeVisible();
  });
});

/**
 * Bridal Inquiries card — tests both enrollment states by toggling
 * approved_inquiries_at via the settings page switch, then verifying
 * the dashboard card content. Runs serially because the second test
 * depends on state set by the first.
 */
test.describe.serial('Bridal Inquiries card — both enrollment states', () => {
  let initiallyChecked: boolean;

  test('shows not-enrolled message and Settings link when disabled', async ({ page }) => {
    // Record initial state, then ensure inquiries are OFF
    await page.goto('/partner/settings');
    const switchRoot = page.locator('.MuiSwitch-root');
    const switchInput = page.locator('.MuiSwitch-input');
    await expect(switchRoot).toBeVisible();

    initiallyChecked = await switchInput.isChecked();

    if (initiallyChecked) {
      await switchRoot.click();
      await expect(page.getByText('Bridal inquiries disabled')).toBeVisible({ timeout: 5_000 });
    }

    // Verify dashboard shows not-enrolled state
    await page.goto('/partner/dashboard');
    await expect(page.getByRole('heading', { name: 'Bridal Inquiries' })).toBeVisible();
    await expect(page.getByText('You are not yet enrolled in bridal inquiries')).toBeVisible();
    const settingsLink = page.getByRole('link', { name: 'Settings' });
    await expect(settingsLink).toBeVisible();
    await expect(settingsLink).toHaveAttribute('href', '/partner/settings');
  });

  test('shows approved message when enabled, then restores state', async ({ page }) => {
    // Enable inquiries (currently OFF from previous test)
    await page.goto('/partner/settings');
    const switchRoot = page.locator('.MuiSwitch-root');
    await expect(switchRoot).toBeVisible();
    await switchRoot.click();
    await expect(page.getByText('Bridal inquiries enabled')).toBeVisible({ timeout: 5_000 });

    // Verify dashboard shows approved state
    await page.goto('/partner/dashboard');
    await expect(page.getByRole('heading', { name: 'Bridal Inquiries' })).toBeVisible();
    await expect(page.getByText('New inquiries are sent directly to your email')).toBeVisible();

    // Restore original state
    if (!initiallyChecked) {
      await page.goto('/partner/settings');
      await page.locator('.MuiSwitch-root').click();
      await expect(page.getByText('Bridal inquiries disabled')).toBeVisible({ timeout: 5_000 });
    }
  });
});
