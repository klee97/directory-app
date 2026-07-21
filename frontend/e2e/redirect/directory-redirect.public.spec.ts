import { test, expect } from '@playwright/test';

test('old Reddit-style homepage link redirects to filtered directory', async ({ page }) => {
  const response = await page.goto('/?lat=40.7127&lon=-74.006');

  expect(response?.status()).toBe(200); // final response after following redirect
  expect(page.url()).toContain('/vendors?lat=40.7127&lon=-74.006');

  // Confirm the directory page actually applied the filter, not just that the URL looks right
  await expect(page.getByText("Wedding Beauty Artists found near New York City")).toBeVisible();
});

test('homepage without filter params does not redirect', async ({ page }) => {
  await page.goto('/');
  expect(page.url()).not.toContain('/vendors');
});

test('directory page itself is not redirected', async ({ page }) => {
  await page.goto('/vendors?lat=40.7127&lon=-74.006');
  expect(page.url()).toContain('/vendors?lat=40.7127&lon=-74.006');
});