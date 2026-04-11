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

  test('Edit Profile button links to profile editor', async ({ page }) => {
    const editProfileButton = page.getByRole('link', { name: 'Edit Profile' });
    await expect(editProfileButton).toBeVisible();
    await editProfileButton.click();
    await expect(page).toHaveURL('/partner/dashboard/profile');
  });

  test('profile checklist shows expected items', async ({ page }) => {
    await expect(page.getByText('Basic Business Info')).toBeVisible();
    await expect(page.getByText('Detailed Bio')).toBeVisible();
    await expect(page.getByText('Client Photo')).toBeVisible();
  });

  test('dashboard shows Edit Your Profile card with title link', async ({ page }) => {
    const editProfileLink = page.getByRole('link', { name: 'Edit Your Profile' });
    await expect(editProfileLink).toBeVisible();
    await expect(editProfileLink).toHaveAttribute('href', '/partner/dashboard/profile');
  });

  test('dashboard shows Badge Toolkit card', async ({ page }) => {
    await expect(page.getByText('Badge Toolkit')).toBeVisible();
  });
});
