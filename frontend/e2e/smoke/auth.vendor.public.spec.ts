import { test, expect } from '@playwright/test';

/**
 * Unauthenticated vendor login tests
 */
test('vendor login page renders', async ({ page }) => {
  await page.goto('/partner/login');
  await expect(page.getByLabel('Email Address')).toBeVisible();
  await expect(page.getByLabel('Password')).toBeVisible();
});

test('unauthenticated user accessing vendor dashboard is redirected to login with redirectTo param', async ({ page }) => {
  await page.goto('/partner/dashboard');
  await expect(page).toHaveURL(/\/login\?redirectTo=\/partner\/dashboard/, { timeout: 15_000 });
});

test('vendor login with no redirectTo lands on partner dashboard', async ({ page }) => {
  await page.goto('/partner/login');

  await page.getByLabel('Email Address').fill(process.env.TEST_VENDOR_EMAIL!);
  await page.getByLabel('Password').fill(process.env.TEST_VENDOR_PASSWORD!);
  await page.getByTestId('login-submit').click();

  await expect(page).toHaveURL('/partner/dashboard', { timeout: 15_000 });
});

test('vendor login with redirectTo respects the param', async ({ page }) => {
  await page.goto('/partner/login?redirectTo=/partner/settings');

  await page.getByLabel('Email Address').fill(process.env.TEST_VENDOR_EMAIL!);
  await page.getByLabel('Password').fill(process.env.TEST_VENDOR_PASSWORD!);
  await page.getByTestId('login-submit').click();

  await expect(page).toHaveURL('/partner/settings', { timeout: 15_000 });
});

test('regular user logging in via vendor login page is redirected to /', async ({ page }) => {
  await page.goto('/partner/login');

  await page.getByLabel('Email Address').fill(process.env.TEST_USER_EMAIL!);
  await page.getByLabel('Password').fill(process.env.TEST_USER_PASSWORD!);
  await page.getByTestId('login-submit').click();

  await expect(page).toHaveURL('/', { timeout: 15_000 });
});

test('unauthenticated vendor accessing deep vendor route is redirected to login then back after login', async ({ page }) => {
  // 1. Try to access a deep vendor route
  await page.goto('/partner/dashboard/profile');

  // 2. Should land on login with correct redirectTo
  await expect(page).toHaveURL(/\/login\?redirectTo=\/partner\/dashboard\/profile/);

  // 3. Log in as vendor
  await page.getByLabel('Email Address').fill(process.env.TEST_VENDOR_EMAIL!);
  await page.getByLabel('Password').fill(process.env.TEST_VENDOR_PASSWORD!);
  await page.getByTestId('login-submit').click();

  // 4. Should land on the originally requested page
  await expect(page).toHaveURL('/partner/dashboard/profile', { timeout: 15_000 });
});