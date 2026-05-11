import { test, expect } from '@playwright/test';

test('login page renders', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByLabel('Email Address')).toBeVisible();
  await expect(page.getByLabel('Password')).toBeVisible();
});

test('signup page renders', async ({ page }) => {
  await page.goto('/signup');
  await expect(page.getByLabel('Email Address')).toBeVisible();
  await expect(page.locator('#password')).toBeVisible();
  await expect(page.locator('#confirmPassword')).toBeVisible();
});

test('unauthenticated user visiting /auth/reset-password gets redirected to /login', async ({ page }) => {
  await page.goto('/auth/reset-password');
  await expect(page).toHaveURL('/login');
});