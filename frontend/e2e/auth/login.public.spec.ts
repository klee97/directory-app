import { test, expect } from '@playwright/test';
import { DESKTOP_ONLY_DESCRIPTION, MOBILE_ONLY_DESCRIPTION } from '../constants';
import { adminWorkerAccounts, userWorkerAccounts } from '../fixtures/testUsers';

const EXTERNAL_TARGETS = [
  ['absolute URL', 'https://evil.com'],
  ['protocol-relative URL', '//evil.com'],
  ['backslash variant', '/\\evil.com'],
] as const;

const { email, password } = userWorkerAccounts[0];

test.describe('Login — guest', { tag: '@mobile' }, () => {
  test('login page renders with email, password, and submit button', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByLabel('Email Address')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByTestId('login-submit')).toBeVisible();
  });

  test('desktop navbar shows Login button when not logged in', async ({ page, isMobile }) => {
    test.skip(isMobile, DESKTOP_ONLY_DESCRIPTION);
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'Log in' })).toBeVisible();
  });

  test('mobile menu shows Login option when not logged in', async ({ page, isMobile }) => {
    test.skip(!isMobile, MOBILE_ONLY_DESCRIPTION);
    await page.goto('/');
    await page.getByRole('button', { name: 'open navigation menu' }).click();
    await expect(page.getByRole('menuitem', { name: 'Log in' })).toBeVisible();
  });

  test('successful login redirects to home and shows profile button', async ({ page, isMobile }) => {
    test.skip(isMobile, DESKTOP_ONLY_DESCRIPTION);
    await page.goto('/login');
    await page.getByLabel('Email Address').fill(email);
    await page.getByLabel('Password').fill(password);
    await page.getByTestId('login-submit').click();

    await page.waitForURL('/', { timeout: 15_000 });
    await expect(page.getByTestId('profile-button')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Log in' })).not.toBeVisible();
  });

  test('after login, mobile menu shows profile options including Log Out', async ({ page, isMobile }) => {
    test.skip(!isMobile, MOBILE_ONLY_DESCRIPTION);
    await page.goto('/login');
    await page.getByLabel('Email Address').fill(email);
    await page.getByLabel('Password').fill(password);
    await page.getByTestId('login-submit').click();
    await page.waitForURL('/', { timeout: 15_000 });

    await page.getByRole('button', { name: 'open navigation menu' }).click();
    await expect(page.getByRole('menuitem', { name: 'Log Out' })).toBeVisible();
    await expect(page.getByRole('menuitem', { name: 'Settings' })).toBeVisible();
    await expect(page.getByRole('menuitem', { name: 'My Favorites' })).toBeVisible();
  });

  test('mobile menu closes after navigating to login page', async ({ page, isMobile }) => {
    test.skip(!isMobile, MOBILE_ONLY_DESCRIPTION);
    await page.goto('/');
    await page.getByRole('button', { name: 'open navigation menu' }).click();
    await expect(page.getByRole('menuitem', { name: 'Log in' })).toBeVisible();

    await page.getByRole('menuitem', { name: 'Log in' }).click();
    await expect(page).toHaveURL('/login');
    await expect(page.getByRole('menuitem', { name: 'Log in' })).not.toBeVisible();
  });
});

test.describe('login redirectTo handling', () => {
  for (const [label, target] of EXTERNAL_TARGETS) {
    test(`ignores external redirectTo (${label}) and lands on home`, async ({ page, baseURL }, workerInfo) => {
      const { email, password } = userWorkerAccounts[workerInfo.parallelIndex];

      // Don't depend on real network access if the app does misbehave
      await page.route(/evil\.com/, (route) => route.abort());

      await page.goto(`/login?redirectTo=${encodeURIComponent(target)}`);
      await page.getByLabel('Email Address').fill(email);
      await page.getByLabel('Password').fill(password);
      await page.getByTestId('login-submit').click();

      await page.waitForURL('/', { timeout: 15_000 });
      expect(new URL(page.url()).origin).toBe(new URL(baseURL!).origin);
      await expect(page.getByTestId('profile-button')).toBeVisible();
    });
  }

  test('honors a valid internal redirectTo', async ({ page }, workerInfo) => {
    const { email, password } = adminWorkerAccounts[workerInfo.parallelIndex];

    await page.goto(`/login?redirectTo=${encodeURIComponent('/admin')}`);
    await page.getByLabel('Email Address').fill(email);
    await page.getByLabel('Password').fill(password);
    await page.getByTestId('login-submit').click();

    await page.waitForURL('/admin', { timeout: 15_000 });
    await expect(page.getByRole('heading', { name: 'Admin Dashboard' })).toBeVisible();
  });
});