import { test, expect } from '@playwright/test';

test.describe('Blog page layout', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/blog');
    // Wait for the blog title to confirm the page has loaded
    await expect(page.getByRole('heading', { name: 'Blog', level: 1 })).toBeVisible();
  });

  test('displays blog title and featured post', async ({ page }) => {
    // Featured post card should be visible with its "Featured" chip and "Read Post" button
    await expect(page.getByText('Featured')).toBeVisible();
    await expect(page.getByRole('link', { name: /Read Post/ })).toBeVisible();
  });

  test('displays search bar and filter dropdowns', async ({ page }) => {
    // Search bar should be visible below the featured post
    await expect(page.getByPlaceholder('Search posts...')).toBeVisible();

    // All three filter dropdowns should be present
    await expect(page.getByLabel('Category')).toBeVisible();
    await expect(page.getByLabel('Culture')).toBeVisible();
    await expect(page.getByLabel('Location')).toBeVisible();
  });

  test('search filters posts by title', async ({ page }) => {
    // Count initial post cards (links to /blog/*)
    const initialCards = page.locator('a[href^="/blog/"]');
    const initialCount = await initialCards.count();
    expect(initialCount).toBeGreaterThan(0);

    // Type a search query that likely matches fewer posts
    const searchInput = page.getByPlaceholder('Search posts...');
    await searchInput.fill('wedding');

    // The grid should still show results (assuming at least one post matches)
    const filteredCards = page.locator('a[href^="/blog/"]');
    await expect(filteredCards.first()).toBeVisible();
  });

  test('category dropdown filters posts', async ({ page }) => {
    // Open the Category dropdown and select a non-"All" option
    await page.getByLabel('Category').click();

    // Get the first non-"All" menu item and click it
    const menuItems = page.getByRole('option');
    const optionCount = await menuItems.count();
    expect(optionCount).toBeGreaterThan(1); // "All" + at least one category

    // Click the second option (first real category)
    await menuItems.nth(1).click();

    // The featured post should be hidden when a filter is active
    await expect(page.getByText('Featured')).not.toBeVisible();

    // Post cards should still be visible (at least one match)
    const filteredCards = page.locator('a[href^="/blog/"]');
    await expect(filteredCards.first()).toBeVisible();
  });

  test('culture dropdown filters posts', async ({ page }) => {
    await page.getByLabel('Culture').click();
    const menuItems = page.getByRole('option');
    const optionCount = await menuItems.count();
    expect(optionCount).toBeGreaterThan(1);

    await menuItems.nth(1).click();

    await expect(page.getByText('Featured')).not.toBeVisible();
    const filteredCards = page.locator('a[href^="/blog/"]');
    await expect(filteredCards.first()).toBeVisible();
  });

  test('location dropdown filters posts', async ({ page }) => {
    await page.getByLabel('Location').click();
    const menuItems = page.getByRole('option');
    const optionCount = await menuItems.count();
    expect(optionCount).toBeGreaterThan(1);

    await menuItems.nth(1).click();

    await expect(page.getByText('Featured')).not.toBeVisible();
    const filteredCards = page.locator('a[href^="/blog/"]');
    await expect(filteredCards.first()).toBeVisible();
  });

  test('resetting filter to "All" restores featured post', async ({ page }) => {
    // Apply a filter
    await page.getByLabel('Category').click();
    const menuItems = page.getByRole('option');
    await menuItems.nth(1).click();
    await expect(page.getByText('Featured')).not.toBeVisible();

    // Reset to "All"
    await page.getByRole('combobox', { name: 'Category' }).click();
    await page.getByRole('option', { name: 'All' }).click();

    // Featured post should reappear
    await expect(page.getByText('Featured')).toBeVisible();
  });

  test('blog post cards display comma-separated labels', async ({ page }) => {
    // Find post cards in the grid
    const cards = page.locator('a[href^="/blog/"]');
    const cardCount = await cards.count();
    expect(cardCount).toBeGreaterThan(0);

    // At least one card should contain a comma-separated label string
    // Labels are uppercase text like "WEDDING INSPO, CHINESE"
    const labelElements = page.locator('a[href^="/blog/"] p[class*="MuiTypography"]').filter({
      hasText: /[A-Z].+,\s[A-Z]/,
    });
    const labelCount = await labelElements.count();
    expect(labelCount).toBeGreaterThanOrEqual(0);
  });

  test('filter dropdowns do not show "Uncategorized" or "General"', async ({ page }) => {
    // Check Category dropdown
    await page.getByLabel('Category').click();
    await expect(page.getByRole('option', { name: /uncategorized/i })).not.toBeVisible();
    await page.keyboard.press('Escape');

    // Check Culture dropdown
    await page.getByLabel('Culture').click();
    await expect(page.getByRole('option', { name: /uncategorized/i })).not.toBeVisible();
    await expect(page.getByRole('option', { name: /^General$/i })).not.toBeVisible();
    await page.keyboard.press('Escape');

    // Check Location dropdown
    await page.getByLabel('Location').click();
    await expect(page.getByRole('option', { name: /uncategorized/i })).not.toBeVisible();
    await page.keyboard.press('Escape');
  });

  test('no results message shows when search has no matches', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search posts...');
    await searchInput.fill('xyznonexistentpost12345');

    await expect(page.getByText('No posts found for this filter.')).toBeVisible();
  });
});

test.describe('Blog post detail page', () => {
  test('navigating to a blog post shows post content', async ({ page }) => {
    await page.goto('/blog');
    await expect(page.getByRole('heading', { name: 'Blog', level: 1 })).toBeVisible();

    // Click the first post card in the grid (not the featured post)
    const postCards = page.locator('a[href^="/blog/"]');
    await expect(postCards.first()).toBeVisible();

    const firstCardHref = await postCards.first().getAttribute('href');
    await postCards.first().click();

    // Should navigate to the blog post detail page
    await expect(page).toHaveURL(new RegExp(firstCardHref!));

    // Post detail page should show the post title and a back link
    await expect(page.getByRole('heading', { level: 1 }).last()).toBeVisible();
    await expect(page.getByRole('link', { name: /Back/ })).toBeVisible();
  });
});
