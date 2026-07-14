import { test, expect } from '@playwright/test';

// Landing page ("/") — public, unauthenticated.
// The vendor and blog sections only render when the seeded DB / CMS return
// results, so those assertions are guarded with visibility checks.
test.describe('Landing page — guest', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('hero section renders heading, intro, and CTAs', async ({ page }) => {
    await expect(
      page.getByRole('heading', {
        name: 'The Best Wedding Makeup Artists for Asian Features',
        level: 1,
      })
    ).toBeVisible();

    await expect(
      page.getByText('As Asian Americans, we know how hard it is')
    ).toBeVisible();

    // "Search all artists" appears in the hero and (conditionally) the vendors
    // section, so scope the hero assertion to the first occurrence.
    await expect(
      page.getByRole('link', { name: 'Search all artists' }).first()
    ).toBeVisible();
    await expect(page.getByRole('link', { name: 'Our Story' })).toBeVisible();
  });

  test('hero "Search all artists" navigates to the directory', async ({ page }) => {
    await page.getByRole('link', { name: 'Search all artists' }).first().click();
    await expect(page).toHaveURL('/directory');
  });

  test('hero "Our Story" navigates to the about page', async ({ page }) => {
    await page.getByRole('link', { name: 'Our Story' }).click();
    await expect(page).toHaveURL('/about');
  });

  test('verified vendors section shows vendor cards when present', async ({ page }) => {
    const heading = page.getByRole('heading', {
      name: 'Discover the Best Makeup Artists for Asian Features',
    });

    // Section is conditional on there being verified vendors with cover images.
    if (!(await heading.isVisible())) {
      test.skip(true, 'No verified vendors seeded');
    }

    await expect(heading).toBeVisible();
    await expect(
      page.locator('[data-testid^="vendor-card-"]').first()
    ).toBeVisible();
  });

  test('blog section renders and "View all blog posts" navigates to /blog', async ({ page }) => {
    const heading = page.getByRole('heading', {
      name: 'From Our Blog: Vendor Stories & Cultural Wedding Inspo',
    });

    // Section is conditional on there being published featured posts.
    if (!(await heading.isVisible())) {
      test.skip(true, 'No blog posts seeded');
    }

    await expect(heading).toBeVisible();

    const viewAll = page.getByRole('link', { name: 'View all blog posts' });
    await expect(viewAll).toBeVisible();
    await viewAll.click();
    await expect(page).toHaveURL('/blog');
  });

  test('carousel scroll arrow advances content when overflowing', async ({ page }) => {
    // The generic Carousel exposes arrows via aria-label. They only appear when
    // content overflows (blog posts, and vendors on small screens).
    const scrollRight = page.getByRole('button', { name: 'Scroll right' }).first();

    if (!(await scrollRight.isVisible())) {
      test.skip(true, 'No overflowing carousel on this viewport / dataset');
    }

    await scrollRight.click();
    // After scrolling right, the left-scroll affordance should appear.
    await expect(
      page.getByRole('button', { name: 'Scroll left' }).first()
    ).toBeVisible();
  });
});
