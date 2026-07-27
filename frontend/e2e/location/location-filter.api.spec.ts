import { test, expect } from '@playwright/test';

test.describe('Vendor directory — location filter deletion behavior', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/vendors');
  });

  test('selecting a location filters the vendor grid', async ({ page }) => {
    const locationInput = page.getByPlaceholder('Search for a city, state, or country');
    await locationInput.click();

    const text = 'New York City';
    await locationInput.fill(text);
    const dropdown = page.getByTestId('autocomplete-suggestions');
    await dropdown.getByTestId('autocomplete-suggestion-item').filter({ hasText: text }).first().click();

    await expect(locationInput).toHaveValue(/New York City/);
    // URL should reflect the selected coordinates
    await expect(page).toHaveURL(/lat=/);
    await expect(page).toHaveURL(/lon=/);
  });

  test('partial deletion keeps the previous filter active', async ({ page }) => {
    const locationInput = page.getByPlaceholder('Search for a city, state, or country');
    await locationInput.click();

    const text = 'New York City';
    await locationInput.fill(text);
    const dropdown = page.getByTestId('autocomplete-suggestions');
    const item = dropdown.getByTestId('autocomplete-suggestion-item').filter({ hasText: text }).first();

    await Promise.all([
      page.waitForURL(/lat=/),
      item.click(),
    ]);

    // Backspace a few characters — this is "partial deletion"
    await locationInput.click();
    await locationInput.press('End');
    await locationInput.press('Backspace');
    await locationInput.press('Backspace');

    // Filter should NOT have cleared: URL still has lat/lon
    await expect(page).toHaveURL(/lat=/);
    await expect(page).toHaveURL(/lon=/);
  });

  test('fully deleting the location text clears the filter', async ({ page }) => {
    const locationInput = page.getByPlaceholder('Search for a city, state, or country');
    await locationInput.click();

    const text = 'New York City';
    await locationInput.fill(text);
    const dropdown = page.getByTestId('autocomplete-suggestions');
    const item = dropdown.getByTestId('autocomplete-suggestion-item').filter({ hasText: text }).first();

    await Promise.all([
      page.waitForURL(/lat=/),
      item.click(),
    ]);
    await expect(page).toHaveURL(/lat=/);

    // Select-all + delete to fully clear the field
    await locationInput.click();
    await locationInput.fill('');

    await expect(locationInput).toHaveValue('');
    await expect(page).not.toHaveURL(/lat=/);
    await expect(page).not.toHaveURL(/lon=/);
  });

  test('clicking the X button clears the filter, same as full deletion', async ({ page }) => {
    const locationInput = page.getByPlaceholder('Search for a city, state, or country');
    await locationInput.click();

    const text = 'New York City';
    await locationInput.fill(text);
    const dropdown = page.getByTestId('autocomplete-suggestions');
    const item = dropdown.getByTestId('autocomplete-suggestion-item').filter({ hasText: text }).first();

    await Promise.all([
      page.waitForURL(/lat=/),
      item.click(),
    ]);

    await page.getByLabel('clear input').click();

    await expect(locationInput).toHaveValue('');
    await expect(page).not.toHaveURL(/lat=/);
  });

  test('selecting a new location after partial deletion updates the filter', async ({ page }) => {
    const locationInput = page.getByPlaceholder('Search for a city, state, or country');
    await locationInput.click();

    const text = 'New York City';
    await locationInput.fill(text);
    const dropdown = page.getByTestId('autocomplete-suggestions');
    const item = dropdown.getByTestId('autocomplete-suggestion-item').filter({ hasText: text }).first();

    await Promise.all([
      page.waitForURL(/lat=/),
      item.click(),
    ]);

    // Partially delete, then type toward a different city
    await locationInput.click();
    await locationInput.press('Control+A');
    await locationInput.fill('Boston');

    const bostonItem = dropdown.getByTestId('autocomplete-suggestion-item').filter({ hasText: 'Boston' }).first();
    await Promise.all([
      page.waitForURL(/lat=/),
      bostonItem.click(),
    ]);

    await expect(locationInput).toHaveValue(/Boston/);
  });
});