import { type Page, type Locator } from '@playwright/test';
import { test, expect } from '../fixtures/fixtures';
import { logout } from '../fixtures/auth.helpers';
import { refreshVendors } from '../fixtures/devToolHelpers';

/**
 * Favorites e2e tests — runs as authenticated user.
 *
 * Uses test.describe.serial to avoid parallel DB conflicts when adding/removing
 * favorites for the same test vendor.
 *
 * Depends on test fixture vendors from supabase/seed.sql:
 *   - TEST-E2E-001 "Test Glamour Studio"   slug: test-glamour-studio
 *   - TEST-E2E-002 "Test Bridal Beauty Co" slug: test-bridal-beauty-co
 */

const GLAMOUR_SLUG = 'test-glamour-studio';
const BRIDAL_SLUG = 'test-bridal-beauty-co';
const GLAMOUR_NAME = 'Test Glamour Studio';
const BRIDAL_NAME = 'Test Bridal Beauty Co';

/**
 * Click a favorite button and wait for the upsert server action to persist.
 *
 * FavoriteButton fires upsertUserFavorite (a Next.js server action) without
 * awaiting it. waitForLoadState('networkidle') can resolve before the POST is
 * even dispatched, causing page.goto() to cancel the in-flight request.
 * Using Promise.all ensures we intercept the response before navigating.
 *
 * Relies on callers draining any prior server-action POST (e.g. Directory's or
 * VendorProfile's getFavoriteVendorIds) before calling this function, so no
 * stale next-action response is caught instead of the upsertUserFavorite one.
 */
async function clickFavoriteAndPersist(page: Page, button: Locator): Promise<void> {
  await Promise.all([
    page.waitForResponse(r => r.request().method() === 'POST' && !!r.request().headers()['next-action']),
    button.scrollIntoViewIfNeeded(),
    button.click(),
  ]);
}

// eslint-disable-next-line react-hooks/rules-of-hooks
test.use({ storageState: ({ userWorkerStorageState }, use) => use(userWorkerStorageState) });

test.describe.serial('Favorites — authenticated', () => {
  test.beforeAll(async ({ browser, userWorkerStorageState }) => {
    const context = await browser.newContext({
      storageState: userWorkerStorageState,
      baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000',
    });
    const page = await context.newPage();
    await page.goto('/');
    await refreshVendors(page);
    await context.close(); // closes the page too
  });

  test.beforeEach(async ({ page }) => {
    // Set up the listener before navigation so it's active when Directory's
    // getFavoriteVendorIds useEffect fires. Draining this response before returning
    // ensures no stale next-action POST to '/' is in flight when a subsequent test
    // calls clickFavoriteAndPersist (whose waitForResponse would catch it instead).
    const favoritesLoaded = page.waitForResponse(
      r => r.request().method() === 'POST' && !!r.request().headers()['next-action'],
      { timeout: 10_000 }
    );
    await page.goto('/');
    await expect(page.getByText(/Wedding Beauty Artist/).first()).toBeVisible({ timeout: 15_000 });
    // If getFavoriteVendorIds doesn't fire (e.g. user is logged out after a test),
    // ignore the timeout and continue.
    await favoritesLoaded.catch(() => { });
  });

  test.fixme('add favorite on homepage — heart fills and vendor appears on favorites page', async ({ page }) => {
    const glamourCard = page.getByTestId(`vendor-card-${GLAMOUR_SLUG}`);
    await clickFavoriteAndPersist(page, glamourCard.getByRole('button', { name: 'Add to favorites' }));
    await expect(glamourCard.getByRole('button', { name: 'Remove from favorites' })).toBeVisible();

    await page.goto('/favorites');
    await expect(page.getByText(GLAMOUR_NAME)).toBeVisible();

    // Cleanup
    await page.goto('/');
    await expect(page.getByText(/Wedding Beauty Artist/).first()).toBeVisible({ timeout: 15_000 });
    await clickFavoriteAndPersist(
      page,
      page.getByTestId(`vendor-card-${GLAMOUR_SLUG}`).getByRole('button', { name: 'Remove from favorites' })
    );
  });

  test.fixme('add favorite on homepage — heart is filled when navigating to vendor profile', async ({ page }) => {
    const glamourCard = page.getByTestId(`vendor-card-${GLAMOUR_SLUG}`);
    await clickFavoriteAndPersist(page, glamourCard.getByRole('button', { name: 'Add to favorites' }));
    await expect(glamourCard.getByRole('button', { name: 'Remove from favorites' })).toBeVisible();

    // Set up listener BEFORE navigation so it catches VendorProfile's
    // getFavoriteVendorIds server action that fires on mount.
    const vendorFavoritesLoaded = page.waitForResponse(
      r => r.request().method() === 'POST' && !!r.request().headers()['next-action'],
      { timeout: 15_000 }
    );
    await page.goto(`/vendors/${GLAMOUR_SLUG}`);
    // Wait for VendorProfile's fetchFavoriteStatus to complete before asserting.
    await vendorFavoritesLoaded.catch(() => { });

    await expect(page.getByRole('button', { name: 'Remove from favorites' })).toBeVisible({ timeout: 10_000 });

    // Cleanup
    await clickFavoriteAndPersist(page, page.getByRole('button', { name: 'Remove from favorites' }));
  });

  test.fixme('add favorite on vendor profile — heart is filled on homepage', async ({ page }) => {
    // Set up listener BEFORE navigation to drain VendorProfile's
    // getFavoriteVendorIds server action that fires on mount, so
    // clickFavoriteAndPersist's waitForResponse only catches the upsert.
    const vendorFavoritesLoaded = page.waitForResponse(
      r => r.request().method() === 'POST' && !!r.request().headers()['next-action'],
      { timeout: 15_000 }
    );
    // Navigate via client-side link click (not page.goto) so the AuthContext
    // initialised during beforeEach is preserved — a full navigation would
    // reinitialise it and race with the click.
    await page.getByTestId(`vendor-card-${GLAMOUR_SLUG}`).getByText(GLAMOUR_NAME).click();
    await page.waitForURL(`**/vendors/${GLAMOUR_SLUG}**`);
    await vendorFavoritesLoaded.catch(() => { });

    await clickFavoriteAndPersist(page, page.getByRole('button', { name: 'Add to favorites' }));
    await expect(page.getByRole('button', { name: 'Remove from favorites' })).toBeVisible();

    // Navigate back via client-side link (not page.goto) to preserve AuthContext —
    // a full navigation reinitialises the session and can lose the logged-in state.
    await page.getByRole('img', { name: 'logo' }).first().click();
    await expect(page.getByText(/Wedding Beauty Artist/).first()).toBeVisible({ timeout: 15_000 });
    // favoriteVendorIds is loaded asynchronously in Directory's useEffect — wait for it
    const glamourCard = page.getByTestId(`vendor-card-${GLAMOUR_SLUG}`);
    await expect(glamourCard.getByRole('button', { name: 'Remove from favorites' })).toBeVisible({ timeout: 10_000 });

    // Cleanup — button is already confirmed visible above, so it's safe to click
    await clickFavoriteAndPersist(page, glamourCard.getByRole('button', { name: 'Remove from favorites' }));
  });

  test('remove favorite on homepage — heart becomes outline and vendor removed from favorites page', async ({ page }) => {
    const glamourCard = page.getByTestId(`vendor-card-${GLAMOUR_SLUG}`);
    await clickFavoriteAndPersist(page, glamourCard.getByRole('button', { name: 'Add to favorites' }));
    await expect(glamourCard.getByRole('button', { name: 'Remove from favorites' })).toBeVisible();

    await clickFavoriteAndPersist(page, glamourCard.getByRole('button', { name: 'Remove from favorites' }));
    await expect(glamourCard.getByRole('button', { name: 'Add to favorites' })).toBeVisible();

    await page.goto('/favorites');
    await expect(page.getByText(GLAMOUR_NAME)).not.toBeVisible();
  });

  test('remove favorite on homepage — heart becomes outline on vendor profile', async ({ page }) => {
    const glamourCard = page.getByTestId(`vendor-card-${GLAMOUR_SLUG}`);
    await clickFavoriteAndPersist(page, glamourCard.getByRole('button', { name: 'Add to favorites' }));
    await expect(glamourCard.getByRole('button', { name: 'Remove from favorites' })).toBeVisible();

    await clickFavoriteAndPersist(page, glamourCard.getByRole('button', { name: 'Remove from favorites' }));
    await expect(glamourCard.getByRole('button', { name: 'Add to favorites' })).toBeVisible();

    await page.goto(`/vendors/${GLAMOUR_SLUG}`);
    await expect(page.getByRole('button', { name: 'Add to favorites' })).toBeVisible();
  });

  test.fixme('remove favorite on vendor profile — heart becomes outline on homepage', async ({ page }) => {
    const glamourCard = page.getByTestId(`vendor-card-${GLAMOUR_SLUG}`);
    await clickFavoriteAndPersist(page, glamourCard.getByRole('button', { name: 'Add to favorites' }));
    await expect(glamourCard.getByRole('button', { name: 'Remove from favorites' })).toBeVisible();

    // Drain VendorProfile's getFavoriteVendorIds server action before asserting.
    const vendorFavoritesLoaded = page.waitForResponse(
      r => r.request().method() === 'POST' && !!r.request().headers()['next-action'],
      { timeout: 15_000 }
    );
    await page.goto(`/vendors/${GLAMOUR_SLUG}`);
    await vendorFavoritesLoaded.catch(() => { });

    await expect(page.getByRole('button', { name: 'Remove from favorites' })).toBeVisible({ timeout: 10_000 });
    await clickFavoriteAndPersist(page, page.getByRole('button', { name: 'Remove from favorites' }));
    await expect(page.getByRole('button', { name: 'Add to favorites' })).toBeVisible();

    await page.goto('/');
    await expect(page.getByText(/Wedding Beauty Artist/).first()).toBeVisible({ timeout: 15_000 });
    await expect(
      page.getByTestId(`vendor-card-${GLAMOUR_SLUG}`).getByRole('button', { name: 'Add to favorites' })
    ).toBeVisible();
  });

  test.fixme('multiple favorites are sorted alphabetically on favorites page', async ({ page }) => {
    const glamourCard = page.getByTestId(`vendor-card-${GLAMOUR_SLUG}`);
    const bridalCard = page.getByTestId(`vendor-card-${BRIDAL_SLUG}`);

    await clickFavoriteAndPersist(page, glamourCard.getByRole('button', { name: 'Add to favorites' }));
    await expect(glamourCard.getByRole('button', { name: 'Remove from favorites' })).toBeVisible();

    await clickFavoriteAndPersist(page, bridalCard.getByRole('button', { name: 'Add to favorites' }));
    await expect(bridalCard.getByRole('button', { name: 'Remove from favorites' })).toBeVisible();

    // Narrow viewport so cards stack 1-per-row (MUI xs:12 below 900px),
    // making Y-position a reliable proxy for alphabetical order.
    await page.setViewportSize({ width: 600, height: 800 });
    await page.goto('/favorites');
    await expect(page.getByText(GLAMOUR_NAME)).toBeVisible();
    await expect(page.getByText(BRIDAL_NAME)).toBeVisible();

    // Test Bridal Beauty Co (B) should appear before Test Glamour Studio (G)
    const glamourBounds = await page.getByText(GLAMOUR_NAME).first().boundingBox();
    const bridalBounds = await page.getByText(BRIDAL_NAME).first().boundingBox();
    expect(bridalBounds!.y).toBeLessThan(glamourBounds!.y);

    // Cleanup
    await page.goto('/');
    await expect(page.getByText(/Wedding Beauty Artist/).first()).toBeVisible({ timeout: 15_000 });
    await clickFavoriteAndPersist(
      page,
      page.getByTestId(`vendor-card-${GLAMOUR_SLUG}`).getByRole('button', { name: 'Remove from favorites' })
    );
    await clickFavoriteAndPersist(
      page,
      page.getByTestId(`vendor-card-${BRIDAL_SLUG}`).getByRole('button', { name: 'Remove from favorites' })
    );
  });

  test('logging out resets filled hearts to outline', async ({ page, isMobile }) => {
    const glamourCard = page.getByTestId(`vendor-card-${GLAMOUR_SLUG}`);

    await clickFavoriteAndPersist(page, glamourCard.getByRole('button', { name: 'Add to favorites' }));
    await expect(glamourCard.getByRole('button', { name: 'Remove from favorites' })).toBeVisible();

    // Log out via desktop or mobile profile menu
    await logout(page, isMobile);

    // Make sure log in is visible
    if (isMobile) {
      await page.getByRole('button', { name: 'open navigation menu' }).click();
      await expect(page.getByRole('menuitem', { name: 'Log in' })).toBeVisible({ timeout: 15_000 });
      await page.keyboard.press('Escape');
    } else {
      await expect(page.getByRole('button', { name: 'Log in' })).toBeVisible({ timeout: 15_000 });
    }

    await expect(page.getByText(/Wedding Beauty Artist/).first()).toBeVisible({ timeout: 15_000 });

    // Heart should now show as outline since user is logged out
    await expect(glamourCard.getByRole('button', { name: 'Add to favorites' })).toBeVisible();
  });
});
