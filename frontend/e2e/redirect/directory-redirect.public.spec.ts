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

test('filters can be cleared after landing via the directory redirect', async ({ page }) => {
  // Arrive via the redirect path (simulating an old Reddit link)
  await page.goto('/?lat=40.7127&lon=-74.006&skill=Thai+Makeup');
  await expect(page).toHaveURL(/\/vendors\?.*skill=Thai\+Makeup/);


  // Confirm the skill filter chip is rendered
  const activeFilters = page.getByTestId('active-filters');
  const skillChip = activeFilters.locator('.MuiChip-root', { hasText: 'Thai Makeup' });
  await expect(skillChip).toBeVisible();

  // Clear it via the chip's delete icon
  await skillChip.getByTestId('CancelIcon').click();

  // URL param should be gone
  await expect(page).not.toHaveURL(/skill=Thai\+Makeup/);

  // Chip should disappear
  await expect(skillChip).not.toBeVisible();
});

test('filters can be cleared on a direct /vendors visit (no redirect)', async ({ page }) => {
  await page.goto('/vendors?skill=Thai+Makeup');

  const activeFilters = page.getByTestId('active-filters');
  const skillChip = activeFilters.locator('.MuiChip-root', { hasText: 'Thai Makeup' });

  await skillChip.getByTestId('CancelIcon').click();

  await expect(page).not.toHaveURL(/skill=Thai\+Makeup/);
  await expect(skillChip).not.toBeVisible();
});