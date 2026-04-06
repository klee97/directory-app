import { test, expect } from '@playwright/test';
import { MOBILE_ONLY_DESCRIPTION } from '../constants';
import { refreshVendors } from '../fixtures/devToolHelpers';

/**
 * Favorites e2e tests — runs as unauthenticated guest.
 *
 * Depends on test fixture vendors from supabase/seed.sql:
 *   - TEST-E2E-001 "Test Glamour Studio"   slug: test-glamour-studio
 *   - TEST-E2E-002 "Test Bridal Beauty Co" slug: test-bridal-beauty-co
 */

const GLAMOUR_SLUG = 'test-glamour-studio';

test.describe('Favorites — guest', () => {
  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    await page.goto('/');
    await refreshVendors(page);
    await page.close();
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText(/2 Wedding Beauty Artists found/)).toBeVisible({ timeout: 15_000 });
  });

  test('clicking heart on vendor card shows login prompt', async ({ page }) => {
    await page.getByTestId(`vendor-card-${GLAMOUR_SLUG}`).getByRole('button', { name: 'Add to favorites' }).click();

    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('Log in to favorite this vendor.')).toBeVisible();
  });

  test('closing login prompt stays on homepage', async ({ page }) => {
    await page.getByTestId(`vendor-card-${GLAMOUR_SLUG}`).getByRole('button', { name: 'Add to favorites' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    await page.getByRole('button', { name: 'Close', exact: true }).click();

    await expect(page).toHaveURL('/');
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('clicking heart on vendor profile page shows login prompt', async ({ page }) => {
    await page.goto(`/vendors/${GLAMOUR_SLUG}`);
    await page.getByRole('button', { name: 'Add to favorites' }).click();

    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('Log in to favorite this vendor.')).toBeVisible();
  });

  test('/favorites redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/favorites');
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
  });

  test('/settings redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/settings');
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
  });

  test('mobile: clicking heart on vendor card shows login prompt', async ({ page, isMobile }) => {
    test.skip(!isMobile, MOBILE_ONLY_DESCRIPTION);
    await page.getByTestId(`vendor-card-${GLAMOUR_SLUG}`).getByRole('button', { name: 'Add to favorites' }).click();

    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('Log in to favorite this vendor.')).toBeVisible();
  });

  test('mobile: clicking heart on vendor profile page shows login prompt', async ({ page, isMobile }) => {
    test.skip(!isMobile, MOBILE_ONLY_DESCRIPTION);
    await page.goto(`/vendors/${GLAMOUR_SLUG}`);
    await page.getByRole('button', { name: 'Add to favorites' }).click();

    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('Log in to favorite this vendor.')).toBeVisible();
  });
});
