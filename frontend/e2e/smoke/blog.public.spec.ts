import { test, expect } from '@playwright/test';

/**
 * Blog e2e tests.
 *
 * In CI, Contentful credentials are unavailable. The Next.js server is
 * configured (via CONTENTFUL_GRAPHQL_ENDPOINT) to hit a mock API route
 * at /api/test/contentful-mock that returns deterministic test posts.
 *
 * Mock posts:
 *   1. "Test Featured Wedding Guide"      — featured, wedding-inspo, chinese, california
 *   2. "Test Bridal Makeup Tips"           — cultural-history, korean, new-york
 *   3. "Test Traditional Ceremony Styles"  — wedding-inspo, chinese, new-york
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
    await searchInput.fill('Bridal');

    // Only the matching post should remain
    await expect(page.getByText('Test Bridal Makeup Tips')).toBeVisible();
    await expect(page.getByText('Test Traditional Ceremony Styles')).not.toBeVisible();
  });

  test('search shows no results message for unmatched query', async ({ page }) => {
    await page.getByPlaceholder('Search posts...').fill('xyznonexistent12345');
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
    // Only post 1 is in California
    await expect(page.getByText('Test Featured Wedding Guide')).toBeVisible();
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
