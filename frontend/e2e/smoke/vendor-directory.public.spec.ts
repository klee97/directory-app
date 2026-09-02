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


test.beforeAll(async ({ browser }) => {
  const page = await browser.newPage();
  await page.goto('/');
  await refreshVendors(page);
  await page.close();
});

test.describe('Vendor directory — guest', { tag: '@mobile' }, () => {
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
    await page.goto('/vendors');
    // Wait until the result-count line renders, confirming vendors are loaded
    await expect(page.getByText(/5 Wedding Beauty Artists found/)).toBeVisible({ timeout: 15_000 });
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
    await expect(page).toHaveURL(/\/vendors\/test-glamour-studio/, { timeout: 20_000 });

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
    await expect(page).toHaveURL(/\/vendors\/test-bridal-beauty-co/, { timeout: 20_000 });

    // The service tag chip should appear on the vendor profile page
    await expect(page.getByText('Hair', { exact: true })).toBeVisible();
  });

  test('search by vendor name and click vendor card', async ({ page }) => {
    // Type in the artist-name search input (500 ms debounce)
    await page.getByPlaceholder('Artist Name').pressSequentially('Test Glamour', { delay: 100 });

    // Wait for the debounced filter to apply and the matching card to appear
    await expect(page.getByText(/1 Wedding Beauty Artist found/)).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText('Test Glamour Studio')).toBeVisible();
    await expect(page.getByText('Test Bridal Beauty Co')).not.toBeVisible();

    // Both tags should appear as chips on the vendor card
    const glamourCard = page.locator('[href*="test-glamour-studio"]');
    await expect(glamourCard.getByText('Thai Makeup')).toBeVisible();
    await expect(glamourCard.getByText('Hair', { exact: true })).toBeVisible();

    // Click the vendor card and confirm navigation to the vendor profile
    await page.getByText('Test Glamour Studio').first().click();
    await expect(page).toHaveURL(/\/vendors\/test-glamour-studio/, { timeout: 20_000 });

    // Both tags should appear as chips on the vendor profile page
    await expect(page.getByText('Thai Makeup')).toBeVisible();
    await expect(page.getByText('Hair', { exact: true })).toBeVisible();
  });

  test('remove a skill filter via chip and see full vendor list restored', async ({ page }) => {
    await page.getByRole('button', { name: 'Skills' }).click();
    await page.locator('label').filter({ hasText: 'Thai Makeup' }).click();

    await expect(page.getByText(/1 Wedding Beauty Artist found/)).toBeVisible({ timeout: 15_000 });
    await expect(page).toHaveURL(/skill=Thai\+Makeup/);

    const chip = page.getByTestId('filter-chip-skill-Thai Makeup');
    await expect(chip).toBeVisible();

    await chip.getByTestId('CancelIcon').click();

    // Both the chip and the URL param should be gone, and the full vendor list restored
    await expect(chip).not.toBeVisible();
    await expect(page).not.toHaveURL(/skill=/);
    await expect(page.getByText(/5 Wedding Beauty Artists found/)).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText('Test Bridal Beauty Co')).toBeVisible();
  });

  test('removing a filter chip works after a hard page load, not just client-side nav', async ({ page }) => {
    // Regression test for the bug where router.push silently no-op'd on
    // search-param-only navigation on a statically rendered page — this
    // only reproduced in production builds after a hard navigation, not
    // during in-app client-side navigation, so the test needs to start
    // from a direct URL load rather than clicking through the UI.
    await page.goto('/vendors?skill=Thai+Makeup');
    await expect(page.getByText(/1 Wedding Beauty Artist found/)).toBeVisible({ timeout: 15_000 });

    const chip = page.getByTestId('filter-chip-skill-Thai Makeup');
    await expect(chip).toBeVisible();

    await chip.getByTestId('CancelIcon').click();

    await expect(chip).not.toBeVisible();
    await expect(page).not.toHaveURL(/skill=/);
    await expect(page.getByText(/5 Wedding Beauty Artists found/)).toBeVisible({ timeout: 15_000 });
  });

  test('filter state stays in sync with browser back/forward', async ({ page }) => {
    await page.getByRole('button', { name: 'Skills' }).click();
    await page.locator('label').filter({ hasText: 'Thai Makeup' }).click();
    await expect(page).toHaveURL(/skill=Thai\+Makeup/);
    await expect(page.getByText(/1 Wedding Beauty Artist found/)).toBeVisible({ timeout: 15_000 });

    await page.goBack();
    await expect(page).not.toHaveURL(/skill=/);
    await expect(page.getByText(/5 Wedding Beauty Artists found/)).toBeVisible({ timeout: 15_000 });

    await page.goForward();
    await expect(page).toHaveURL(/skill=Thai\+Makeup/);
    await expect(page.getByText(/1 Wedding Beauty Artist found/)).toBeVisible({ timeout: 15_000 });
  });

  test('a filter param loaded with different casing than the tag data still matches on hard refresh', async ({ page }) => {
    // Regression test for the case-mismatch bug: loading a URL with a
    // differently-cased value than the canonical tag ("hair" vs "Hair")
    // used to produce a chip in the wrong casing with its checkbox
    // unchecked, even though the vendor list was still (correctly) filtered.
    await page.goto('/vendors?service=hair');
    await expect(page.getByText(/2 Wedding Beauty Artists found/)).toBeVisible({ timeout: 15_000 });

    // Chip renders with the canonical casing, not the raw URL casing
    const chip = page.getByTestId('filter-chip-service-Hair');
    await expect(chip).toBeVisible();
    await expect(page.getByTestId('filter-chip-service-hair')).not.toBeVisible();

    // Checkbox reflects the same canonical match
    await page.getByRole('button', { name: 'Services' }).click();
    await expect(page.locator('label').filter({ hasText: /^Hair$/ }).locator('input')).toBeChecked();
  });

  test('an unrecognized filter value in the URL is dropped, not rendered as a phantom chip', async ({ page }) => {
    await page.goto('/vendors?service=nonsense');

    // Full, unfiltered vendor list — the invalid value should not have
    // been applied as a filter
    await expect(page.getByText(/5 Wedding Beauty Artists found/)).toBeVisible({ timeout: 15_000 });

    // No chip for the garbage value, and no filter-pills row at all
    // since there's nothing valid selected
    await expect(page.getByTestId('filter-chip-service-nonsense')).not.toBeVisible();
  });
});

test.describe('Vendor profile — nearby vendors', { tag: '@mobile' }, () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/vendors/test-glamour-studio');
  });

  test('nearby vendors carousel streams in below the fold', async ({ page }) => {
    // Fold content (hero/profile) should be visible immediately
    await expect(page.getByRole('heading', { name: 'Test Glamour Studio' })).toBeVisible();

    // Carousel title renders once resolvedLocation is known — no fetch wait needed
    // for the heading itself, only the cards inside it
    await expect(page.getByText(/More wedding makeup artists for Asian features near/)).toBeVisible();

    // The other seeded vendor should appear as a nearby card once streamed
    const carousel = page.locator('[href*="test-vendor-3"]');
    await expect(carousel).toBeVisible();
  });
});