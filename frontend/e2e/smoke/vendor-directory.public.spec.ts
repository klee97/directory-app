import { test, expect } from '@playwright/test';
import { refreshVendors } from '../fixtures/devToolHelpers';

/**
 * Vendor directory e2e tests — runs as unauthenticated guest.
 *
 * Depends on test fixture vendors inserted by supabase/seed.sql:
 *   - TEST-E2E-001 "Test Glamour Studio"   slug: test-glamour-studio
 *       tags: Thai Makeup (skill, style=default), Hair (service, style=primary)
 *   - TEST-E2E-002 "Test Bridal Beauty Co" slug: test-bridal-beauty-co
 *       tags: Hair (service, style=primary)
 */

test.describe('Vendor directory — guest', () => {
  test.beforeAll(async ({ browser }) => {
    // After supabase db reset the Next.js unstable_cache is stale.
    // Click the DevTools "Refresh Vendors" button (dev-only) to revalidate it
    // so the test vendors from seed.sql are visible when the tests run.
    const page = await browser.newPage();
    await page.goto('/');
    await refreshVendors(page);
    await page.close();
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait until the result-count line renders, confirming vendors are loaded
    await expect(page.getByText(/4 Wedding Beauty Artists found/)).toBeVisible({ timeout: 15_000 });
  });

  test('filter by skill and click vendor card', async ({ page }) => {
    // Expand the Skills accordion
    await page.getByRole('button', { name: 'Skills' }).click();

    // Select the Thai Makeup skill (style=default → appears in Skills filter)
    await page.locator('label').filter({ hasText: 'Thai Makeup' }).click();

    // Only the vendor with this skill should be visible
    await expect(page.getByText(/1 Wedding Beauty Artist found/)).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText('Test Glamour Studio')).toBeVisible();
    await expect(page.getByText('Test Bridal Beauty Co')).not.toBeVisible();

    // Both tags should appear as chips on the vendor card
    const glamourCard = page.locator('[href*="test-glamour-studio"]');
    await expect(glamourCard.getByText('Thai Makeup')).toBeVisible();
    await expect(glamourCard.getByText('Hair', { exact: true })).toBeVisible();

    // Click the vendor card and confirm navigation to the vendor profile
    await page.getByText('Test Glamour Studio').first().click();
    await expect(page).toHaveURL(/\/vendors\/test-glamour-studio/);

    // Both tags should appear as chips on the vendor profile page
    await expect(page.getByText('Thai Makeup')).toBeVisible();
    await expect(page.getByText('Hair', { exact: true })).toBeVisible();
  });

  test('filter by service and click vendor card', async ({ page }) => {
    // Expand the Services accordion
    await page.getByRole('button', { name: 'Services' }).click();

    // Select the Hair service (style=primary → appears in Services filter)
    // Use exact regex to avoid matching "Bridal Hair" in the label text
    await page.locator('label').filter({ hasText: /^Hair$/ }).click();

    // Both test vendors offer this service
    await expect(page.getByText(/2 Wedding Beauty Artists found/)).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText('Test Glamour Studio')).toBeVisible();
    await expect(page.getByText('Test Bridal Beauty Co')).toBeVisible();

    // The service tag chip should appear on the clicked vendor's card
    const bridalCard = page.locator('[href*="test-bridal-beauty-co"]');
    await expect(bridalCard.getByText('Hair', { exact: true })).toBeVisible();

    // Click one of the vendor cards and confirm navigation
    await page.getByText('Test Bridal Beauty Co').first().click();
    await expect(page).toHaveURL(/\/vendors\/test-bridal-beauty-co/);

    // The service tag chip should appear on the vendor profile page
    await expect(page.getByText('Hair', { exact: true })).toBeVisible();
  });

  test('search by vendor name and click vendor card', async ({ page }) => {
    // Type in the artist-name search input (500 ms debounce)
    await page.getByPlaceholder('Artist Name').fill('Test Glamour');

    // Wait for the debounced filter to apply and the matching card to appear
    await expect(page.getByText(/1 Wedding Beauty Artist found/)).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText('Test Glamour Studio')).toBeVisible({ timeout: 3_000 });
    await expect(page.getByText('Test Bridal Beauty Co')).not.toBeVisible();

    // Both tags should appear as chips on the vendor card
    const glamourCard = page.locator('[href*="test-glamour-studio"]');
    await expect(glamourCard.getByText('Thai Makeup')).toBeVisible();
    await expect(glamourCard.getByText('Hair', { exact: true })).toBeVisible();

    // Click the vendor card and confirm navigation to the vendor profile
    await page.getByText('Test Glamour Studio').first().click();
    await expect(page).toHaveURL(/\/vendors\/test-glamour-studio/);

    // Both tags should appear as chips on the vendor profile page
    await expect(page.getByText('Thai Makeup')).toBeVisible();
    await expect(page.getByText('Hair', { exact: true })).toBeVisible();
  });
});
