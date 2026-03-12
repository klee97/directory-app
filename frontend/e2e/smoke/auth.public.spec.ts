import { test, expect } from '@playwright/test';

test('login page renders', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByLabel('Email Address')).toBeVisible();
  await expect(page.getByLabel('Password')).toBeVisible();
});