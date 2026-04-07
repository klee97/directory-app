import { test, expect } from '@playwright/test';

// Use vendor session for all tests in this file
test.use({ storageState: 'e2e/fixtures/.auth/vendor-session.json' });

test('authenticated vendor user visiting /partner/login is redirected to dashboard', async ({ page }) => {
  await page.goto('/partner/login');
  await expect(page).toHaveURL('/partner/dashboard');
});

test('authenticated vendor user can access partner dashboard', async ({ page }) => {
  await page.goto('/partner/dashboard');
  await expect(page).toHaveURL('/partner/dashboard');
  // Not redirected to login
  await expect(page).not.toHaveURL(/\/login/);
});

test('authenticated vendor user cannot access admin', async ({ page }) => {
  await page.goto('/admin');
  await expect(page).toHaveURL('/unauthorized');
});