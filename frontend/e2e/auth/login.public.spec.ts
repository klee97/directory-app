import { test, expect } from '@playwright/test';

const MOBILE_VIEWPORT = { width: 390, height: 844 };

test.describe('Login — guest', () => {
  test('login page renders with email, password, and submit button', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByLabel('Email Address')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByTestId('login-submit')).toBeVisible();
  });

  test('desktop navbar shows Login button when not logged in', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
  });

  test('mobile menu shows Login option when not logged in', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto('/');
    await page.getByRole('button', { name: 'account of current user' }).click();
    await expect(page.getByRole('menuitem', { name: 'Login' })).toBeVisible();
  });

  test('successful login redirects to home and shows profile button', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email Address').fill(process.env.TEST_USER_EMAIL!);
    await page.getByLabel('Password').fill(process.env.TEST_USER_PASSWORD!);
    await page.getByTestId('login-submit').click();

    await page.waitForURL('/', { timeout: 15_000 });
    await expect(page.getByTestId('profile-button')).toBeVisible();
    // Desktop Login button is hidden when logged in
    await expect(page.getByRole('button', { name: 'Login' })).not.toBeVisible();
  });

  test('after login, mobile menu shows profile options including Log Out', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email Address').fill(process.env.TEST_USER_EMAIL!);
    await page.getByLabel('Password').fill(process.env.TEST_USER_PASSWORD!);
    await page.getByTestId('login-submit').click();
    await page.waitForURL('/', { timeout: 15_000 });

    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.getByRole('button', { name: 'account of current user' }).click();
    await expect(page.getByRole('menuitem', { name: 'Log Out' })).toBeVisible();
    await expect(page.getByRole('menuitem', { name: 'Settings' })).toBeVisible();
    await expect(page.getByRole('menuitem', { name: 'My Favorites' })).toBeVisible();
  });

  // Regression: mobile menu should close after navigating to login (not stay open)
  test('mobile menu closes after navigating to login page', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto('/');
    await page.getByRole('button', { name: 'account of current user' }).click();
    await expect(page.getByRole('menuitem', { name: 'Login' })).toBeVisible();

    await page.getByRole('menuitem', { name: 'Login' }).click();
    await expect(page).toHaveURL('/login');
    await expect(page.getByRole('menuitem', { name: 'Login' })).not.toBeVisible();
  });
});
