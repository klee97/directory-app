import { test, expect } from '@playwright/test';

/**
 * Blog e2e tests.
 *
 * In CI, Contentful credentials are unavailable. The Next.js server is
 * configured (via CONTENTFUL_GRAPHQL_ENDPOINT) to hit a mock API route
 * at /api/test/contentful-mock that returns deterministic test posts.
 *
 * Mock posts:
 *   1. "Test Featured Wedding Guide"      — featured, wedding-inspo, chinese, california  (landscape 800x600)
 *   2. "Test Bridal Makeup Tips"           — cultural-history, korean, new-york             (landscape 800x600)
 *   3. "Test Traditional Ceremony Styles"  — wedding-inspo, chinese, new-york               (landscape 800x600)
 *   4. "Test Portrait Bridal Shoot"        — wedding-inspo, vietnamese, california           (portrait 600x900)
 */

test.describe('Blog page layout', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/blog');
    await expect(page.getByRole('heading', { name: 'Blog', level: 1 })).toBeVisible();
  });

  test('displays blog title and featured post', async ({ page }) => {
    await expect(page.getByText('Featured', { exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: /Read Post/ })).toBeVisible();
  });

  test('displays search bar and filter dropdowns', async ({ page }) => {
    await expect(page.getByPlaceholder('Search posts...')).toBeVisible();
    await expect(page.getByLabel('Category')).toBeVisible();
    await expect(page.getByLabel('Culture')).toBeVisible();
    await expect(page.getByLabel('Location')).toBeVisible();
  });

  test('search filters posts by title', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search posts...');
    await searchInput.scrollIntoViewIfNeeded();
    await searchInput.click();
    await searchInput.fill('Bridal');

    // Posts with "Bridal" in the title should remain (posts 2 and 4)
    await expect(page.getByText('Test Bridal Makeup Tips')).toBeVisible();
    await expect(page.getByText('Test Portrait Bridal Shoot')).toBeVisible();
    await expect(page.getByText('Test Traditional Ceremony Styles')).not.toBeVisible();
  });

  test('search shows no results message for unmatched query', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search posts...');
    await searchInput.scrollIntoViewIfNeeded();
    await searchInput.click();
    await searchInput.fill('xyznonexistent12345');
    await expect(page.getByText('No posts found for this filter.')).toBeVisible();
  });

  test('category dropdown filters posts', async ({ page }) => {
    await page.getByLabel('Category').click();

    // Should have "All" + at least one real category
    const menuItems = page.getByRole('option');
    expect(await menuItems.count()).toBeGreaterThan(1);

    // Select "Cultural History" (from mock post 2)
    await page.getByRole('option', { name: 'Cultural History' }).click();

    // Featured post should be hidden when filtering
    await expect(page.getByText('Featured', { exact: true })).not.toBeVisible();

    // Only post 2 has cultural-history
    await expect(page.getByText('Test Bridal Makeup Tips')).toBeVisible();
    await expect(page.getByText('Test Traditional Ceremony Styles')).not.toBeVisible();
  });

  test('culture dropdown filters posts', async ({ page }) => {
    await page.getByLabel('Culture').click();
    await page.getByRole('option', { name: 'Korean' }).click();

    await expect(page.getByText('Featured', { exact: true })).not.toBeVisible();
    await expect(page.getByText('Test Bridal Makeup Tips')).toBeVisible();
    await expect(page.getByText('Test Featured Wedding Guide')).not.toBeVisible();
  });

  test('location dropdown filters posts', async ({ page }) => {
    await page.getByLabel('Location').click();
    await page.getByRole('option', { name: 'California' }).click();

    await expect(page.getByText('Featured', { exact: true })).not.toBeVisible();
    // Posts 1 and 4 are in California
    await expect(page.getByText('Test Featured Wedding Guide')).toBeVisible();
    await expect(page.getByText('Test Portrait Bridal Shoot')).toBeVisible();
    await expect(page.getByText('Test Bridal Makeup Tips')).not.toBeVisible();
  });

  test('resetting filter to "All" restores featured post', async ({ page }) => {
    // Apply a filter
    await page.getByLabel('Category').click();
    await page.getByRole('option', { name: 'Cultural History' }).click();
    await expect(page.getByText('Featured', { exact: true })).not.toBeVisible();

    // Reset to "All"
    await page.getByRole('combobox', { name: 'Category' }).click();
    await page.getByRole('option', { name: 'All' }).click();

    await expect(page.getByText('Featured', { exact: true })).toBeVisible();
  });

  test('combining filters narrows results', async ({ page }) => {
    // Filter by culture: Chinese (posts 1 and 3)
    await page.getByLabel('Culture').click();
    await page.getByRole('option', { name: 'Chinese' }).click();

    // Both Chinese posts should be visible
    await expect(page.getByText('Test Featured Wedding Guide')).toBeVisible();
    await expect(page.getByText('Test Traditional Ceremony Styles')).toBeVisible();

    // Add location filter: New York (only post 3 is Chinese + New York)
    await page.getByLabel('Location').click();
    await page.getByRole('option', { name: 'New York' }).click();

    await expect(page.getByText('Test Traditional Ceremony Styles')).toBeVisible();
    await expect(page.getByText('Test Featured Wedding Guide')).not.toBeVisible();
  });

  test('"Clear all" button resets filters and restores featured post', async ({ page }) => {
    // Apply a category filter
    await page.getByLabel('Category').click();
    await page.getByRole('option', { name: 'Cultural History' }).click();
    await expect(page.getByText('Featured', { exact: true })).not.toBeVisible();

    // "Clear all" button should appear
    const clearButton = page.getByRole('button', { name: 'Clear all' });
    await expect(clearButton).toBeVisible();
    await clearButton.click();

    // Featured post and all posts should be restored
    await expect(page.getByText('Featured', { exact: true })).toBeVisible();
    await expect(clearButton).not.toBeVisible();
  });

  test('"Clear all" button resets search and filters together', async ({ page }) => {
    // Apply a search
    const searchInput = page.getByPlaceholder('Search posts...');
    await searchInput.scrollIntoViewIfNeeded();
    await searchInput.click();
    await searchInput.fill('Bridal');

    // Also apply a filter
    await page.getByLabel('Culture').click();
    await page.getByRole('option', { name: 'Korean' }).click();

    const clearButton = page.getByRole('button', { name: 'Clear all' });
    await expect(clearButton).toBeVisible();
    await clearButton.click();

    // Search input should be cleared
    await expect(searchInput).toHaveValue('');
    // Featured post should reappear
    await expect(page.getByText('Featured', { exact: true })).toBeVisible();
    // All posts visible again
    await expect(page.getByText('Test Bridal Makeup Tips')).toBeVisible();
    await expect(page.getByText('Test Traditional Ceremony Styles')).toBeVisible();
  });

  test('search filters include featured post in results when matching', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search posts...');
    await searchInput.scrollIntoViewIfNeeded();
    await searchInput.click();
    await searchInput.fill('Wedding Guide');

    // Featured chip disappears when filtering, but the post itself should appear in results
    await expect(page.getByText('Test Featured Wedding Guide')).toBeVisible();
    await expect(page.getByText('Test Bridal Makeup Tips')).not.toBeVisible();
  });

  test('blog post cards display comma-separated labels', async ({ page }) => {
    // Post 2 has "Cultural History, Korean, New York" labels
    const post2Card = page.locator('a[href="/blog/test-bridal-makeup-tips"]');
    await expect(post2Card).toBeVisible();
    await expect(post2Card.locator('text=Cultural History, Korean, New York')).toBeVisible();
  });

  test('filter dropdowns do not show "Uncategorized" or "General"', async ({ page }) => {
    await page.getByLabel('Category').click();
    await expect(page.getByRole('option', { name: /uncategorized/i })).not.toBeVisible();
    await page.keyboard.press('Escape');

    await page.getByLabel('Culture').click();
    await expect(page.getByRole('option', { name: /uncategorized/i })).not.toBeVisible();
    await expect(page.getByRole('option', { name: /^General$/i })).not.toBeVisible();
    await page.keyboard.press('Escape');

    await page.getByLabel('Location').click();
    await expect(page.getByRole('option', { name: /uncategorized/i })).not.toBeVisible();
    await page.keyboard.press('Escape');
  });
});

test.describe('Featured post image layout', () => {
  test('featured post with landscape image uses column layout on mobile', async ({ page }) => {
    // Set a mobile viewport
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/blog');
    await expect(page.getByRole('heading', { name: 'Blog', level: 1 })).toBeVisible();

    // The featured card should exist with the image
    const featuredCard = page.locator('a[href="/blog/test-featured-wedding-guide"]').locator('.MuiCard-root');
    await expect(featuredCard).toBeVisible();

    // Landscape featured card should stack vertically (column) on mobile
    const flexDirection = await featuredCard.evaluate((el) => getComputedStyle(el).flexDirection);
    expect(flexDirection).toBe('column');
  });

  test('featured post with landscape image uses row layout on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/blog');
    await expect(page.getByRole('heading', { name: 'Blog', level: 1 })).toBeVisible();

    const featuredCard = page.locator('a[href="/blog/test-featured-wedding-guide"]').locator('.MuiCard-root');
    await expect(featuredCard).toBeVisible();

    // Landscape featured card should be side-by-side (row) on desktop
    const flexDirection = await featuredCard.evaluate((el) => getComputedStyle(el).flexDirection);
    expect(flexDirection).toBe('row');
  });

  test('portrait post card displays image correctly in grid', async ({ page }) => {
    await page.goto('/blog');
    await expect(page.getByRole('heading', { name: 'Blog', level: 1 })).toBeVisible();

    // Portrait post should be visible in the grid
    const portraitCard = page.locator('a[href="/blog/test-portrait-bridal-shoot"]');
    await expect(portraitCard).toBeVisible();

    // The image should be rendered
    const image = portraitCard.locator('img');
    await expect(image).toBeVisible();
  });
});

test.describe('Blog post detail page', () => {
  test('navigating to a blog post shows post content', async ({ page }) => {
    await page.goto('/blog');
    await expect(page.getByRole('heading', { name: 'Blog', level: 1 })).toBeVisible();

    // Click on a non-featured post card
    const postCard = page.locator('a[href="/blog/test-bridal-makeup-tips"]');
    await expect(postCard).toBeVisible();
    await postCard.click();

    await expect(page).toHaveURL(/\/blog\/test-bridal-makeup-tips/);
    await expect(page.getByRole('heading', { name: 'Test Bridal Makeup Tips' })).toBeVisible();
    await expect(page.getByRole('link', { name: /Back/ })).toBeVisible();
  });
});
