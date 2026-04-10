import { expect, Page } from "@playwright/test";
import { MUI_MD_BREAKPOINT } from "../constants";

/**
 * Clicks the DevTools "Refresh Vendors" button to revalidate Next.js cache after a
 * db change
 */
export async function refreshVendors(page: Page) {
  const isSmallScreen = (page.viewportSize()?.width ?? 0) < MUI_MD_BREAKPOINT;

  if (isSmallScreen) {
    await page.getByRole('button', { name: 'open navigation menu' }).click();
  }

  await expect(page.getByRole('button', { name: 'Refresh Vendors' })).toBeVisible();
  await page.getByRole('button', { name: 'Refresh Vendors' }).click();
  await expect(page.getByRole('button', { name: 'Refreshed!' })).toBeVisible({ timeout: 10_000 });

  if (isSmallScreen) {
    await page.keyboard.press('Escape');
  }
}