import { test, expect } from '../fixtures/fixtures';
import { DESKTOP_ONLY_DESCRIPTION } from '../constants';

/**
 * Vendor Profile Edit e2e tests — runs as authenticated vendor.
 *
 * Tests the profile editor menu, section navigation, form fields,
 * and preview. Mostly read-only UI tests (no saves to DB).
 *
 * Section order from SECTIONS array:
 *   1. Business info   2. Bio   3. Website & Socials
 *   4. Services & Skills   5. Pricing   6. Client photo
 */

// eslint-disable-next-line react-hooks/rules-of-hooks
test.use({ storageState: ({ vendorWorkerStorageState }, use) => use(vendorWorkerStorageState) });

test.describe('Vendor Profile Editor', () => {
  test.beforeEach(async ({ page, isMobile }) => {
    // Dismiss the "Use desktop for best experience" overlay on mobile
    // before it can block interactions. The overlay checks sessionStorage,
    // so setting the key before navigation prevents it from appearing.
    if (isMobile) {
      await page.addInitScript(() => {
        sessionStorage.setItem('desktop-prompt-dismissed', 'dismissed');
      });
    }
    await page.goto('/partner/dashboard/profile');
  });

  test('profile editor loads with 6 sections in menu', async ({ page }) => {
    await expect(page.getByText('Edit your artist profile')).toBeVisible();

    // Each menu item is a ListItemButton with the section name + status text.
    // Use getByRole('button') to target the sidebar menu items specifically,
    // avoiding collisions with section headings or form labels.
    await expect(page.getByRole('button', { name: /Business info/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /^Bio/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Website & Socials/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Services & Skills/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Pricing/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Client photo/ })).toBeVisible();
  });

  test('sections show status indicators', async ({ page }) => {
    // Each section shows one of: "Complete", "In progress", "Not started"
    // At least one of these should be present on the page
    const completeCount = await page.getByText('Complete', { exact: true }).count();
    const inProgressCount = await page.getByText('In progress', { exact: true }).count();
    const notStartedCount = await page.getByText('Not started', { exact: true }).count();

    expect(completeCount + inProgressCount + notStartedCount).toBe(6);
  });

  test.describe('Business info section', () => {
    test('clicking Business info shows form with expected fields', async ({ page }) => {
      // On mobile the menu drawer is already open on load (smallScreenMenuOpen defaults to true),
      // so no need to click the hamburger — menu items are directly accessible.
      await page.getByRole('button', { name: /Business info/ }).click();

      await expect(page.getByText('Business Name')).toBeVisible();
      await expect(page.getByText('Location')).toBeVisible();
      await expect(page.getByText('Travels Worldwide')).toBeVisible();
    });

    test('clicking back returns to menu', async ({ page }) => {
      await page.getByRole('button', { name: /Business info/ }).click();
      await expect(page.getByText('Business Name')).toBeVisible();

      // Click back arrow
      await page.locator('button:has([data-testid="ArrowBackIcon"])').click();

      // Menu should be visible again
      await expect(page.getByText('Edit your artist profile')).toBeVisible();
    });
  });

  test.describe('Bio section', () => {
    test('Bio section shows textarea and word count', async ({ page }) => {
      await page.getByRole('button', { name: /^Bio/ }).click();

      await expect(page.getByText('Artist Bio')).toBeVisible();
      await expect(page.getByText(/Length: \d+ words/)).toBeVisible();
    });
  });

  test.describe('Website & Socials section', () => {
    test('shows URL and social handle fields', async ({ page }) => {
      await page.getByRole('button', { name: /Website & Socials/ }).click();

      await expect(page.getByText('Website', { exact: true })).toBeVisible();
      await expect(page.getByText('Instagram Handle')).toBeVisible();
      await expect(page.getByText('Google Maps Link')).toBeVisible();
    });
  });

  test.describe('Services & Skills section', () => {
    test('shows service and skill tag selectors', async ({ page }) => {
      await page.getByRole('button', { name: /Services & Skills/ }).click();

      await expect(page.getByText('Services offered')).toBeVisible();
      await expect(page.getByText('Additional skills')).toBeVisible();
    });
  });

  test.describe('Pricing section', () => {
    test('shows price fields with dollar prefix', async ({ page }) => {
      await page.getByRole('button', { name: /Pricing/ }).click();

      // All vendor workers have at least one service tag, so at least one price field should show
      // Price fields have '$' adornment — check for at least one price-related label
      await expect(page.getByText(/Bridal.*Price/)).toBeVisible();
      await expect(page.locator('text=$').first()).toBeVisible();
    });
  });

  test.describe('Client photo section', () => {
    test('shows upload area', async ({ page }) => {
      await page.getByRole('button', { name: /Client photo/ }).click();

      await expect(page.getByText('Upload a client photo')).toBeVisible();
    });
  });

  test.describe('Preview and save state', () => {
    test('preview banner shows "All changes saved" initially', async ({ page, isMobile }) => {
      test.fixme(isMobile, DESKTOP_ONLY_DESCRIPTION);
      await expect(page.getByText('All changes saved')).toBeVisible();
    });

    test('Save Changes button is disabled when no changes', async ({ page }) => {
      // Navigate into a section to see the Save button
      await page.getByRole('button', { name: /^Bio/ }).click();

      const saveButton = page.getByRole('button', { name: /Save Changes|Saving/ });
      await expect(saveButton).toBeVisible();
      await expect(saveButton).toBeDisabled();
    });
  });
});
