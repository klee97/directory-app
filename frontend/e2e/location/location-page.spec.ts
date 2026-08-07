import { test, expect } from '@playwright/test';

const NYC_SLUG = 'new-york-new-york-united-states';         // TEST-E2E-001, verified, Hair + Thai Makeup
const LA_SLUG = 'los-angeles-california-united-states';      // TEST-E2E-002, unverified, Hair only
const BOSTON_SLUG = 'boston-massachusetts-united-states';    // TEST-E2E-003, unverified, Makeup only
const HOUSTON_SLUG = 'houston-texas-united-states';          // TEST-E2E-004, unverified, Makeup only

test.describe('Location page SEO content', () => {
  test('renders vendor names in the initial server response (not just after hydration)', async ({ request }) => {
    const response = await request.get(`/${NYC_SLUG}`);
    const html = await response.text();
    expect(html).toContain('Test Glamour Studio');
  });

  test('renders a location intro sentence with real vendor count', async ({ page }) => {
    await page.goto(`/${NYC_SLUG}`);
    const intro = page.getByText(/Asian wedding makeup/i).first();
    await expect(intro).toBeVisible();
    await expect(intro).toContainText(/\d+ Asian wedding makeup artist/);
  });

  test('renders FAQ section with location-specific questions', async ({ page }) => {
    await page.goto(`/${NYC_SLUG}`);
    await expect(page.getByText(/Frequently Asked Questions/i)).toBeVisible();
    await expect(page.getByText(/Are there makeup artists near/i)).toBeVisible();
  });

  test('emits valid FAQPage JSON-LD', async ({ page }) => {
    await page.goto(`/${NYC_SLUG}`);
    const jsonLdText = await page.locator('script[type="application/ld+json"]').last().textContent();
    expect(jsonLdText).toBeTruthy();
    const parsed = JSON.parse(jsonLdText!);
    expect(parsed['@type']).toBe('FAQPage');
    expect(parsed.mainEntity.length).toBeGreaterThan(0);
  });

  test('ItemList JSON-LD includes address/geo for vendors with coordinates', async ({ page }) => {
    await page.goto(`/${NYC_SLUG}`);
    const scripts = await page.locator('script[type="application/ld+json"]').allTextContents();
    const parsedScripts = scripts.map(s => JSON.parse(s));
    const itemList = parsedScripts.flatMap(s => s['@graph'] ?? [s]).find(node => node['@type'] === 'ItemList');
    expect(itemList).toBeTruthy();
    const item = itemList.itemListElement[0].item;
    expect(item.address.addressLocality).toBe('New York');
    expect(item.geo.latitude).toBeCloseTo(40.7128, 3);
  });

  test('location with zero verified vendors still renders FAQ without breaking (LA fixture)', async ({ page }) => {
    await page.goto(`/${LA_SLUG}`);
    await expect(page.getByText(/Frequently Asked Questions/i)).toBeVisible();
    await expect(page.getByText(/undefined/i)).not.toBeVisible();
  });

  test('location with makeup-only vendor still renders hair/makeup breakdown correctly (Boston fixture)', async ({ page }) => {
    await page.goto(`/${BOSTON_SLUG}`);
    const intro = page.getByText(/Asian wedding makeup/i).first();
    await expect(intro).toContainText(/1 .*makeup/i);
    await expect(intro).not.toContainText(/hair/i);
  });

  test('Houston page renders independently from Boston despite identical tag profile', async ({ request }) => {
    const html = await (await request.get(`/${HOUSTON_SLUG}`)).text();
    expect(html).toContain('Test Vendor 4');
    expect(html).not.toContain('Test Vendor 3');
  });
});

test.describe('Breadcrumb location linking', () => {
  test('NYC vendor breadcrumb links to a country page containing itself', async ({ page, request }) => {
    await page.goto('/vendors/test-glamour-studio');
    const countryCrumb = page.locator('nav[aria-label="breadcrumb"] a', { hasText: 'United States' });
    const href = await countryCrumb.getAttribute('href');
    expect(href).toBeTruthy();

    const countryPageHtml = await (await request.get(href!)).text();
    expect(countryPageHtml).toContain('Test Glamour Studio');
  });

  test('NYC and Boston vendors share the same country breadcrumb link', async ({ page }) => {
    await page.goto('/vendors/test-glamour-studio');
    const nycCountryHref = await page
      .locator('nav[aria-label="breadcrumb"] a', { hasText: 'United States' })
      .getAttribute('href');

    await page.goto('/vendors/test-vendor-3');
    const bostonCountryHref = await page
      .locator('nav[aria-label="breadcrumb"] a', { hasText: 'United States' })
      .getAttribute('href');

    expect(nycCountryHref).toBe(bostonCountryHref);
    expect(nycCountryHref).toBe('/united-states');
  });

  test('country page lists vendors from multiple cities', async ({ request }) => {
    const html = await (await request.get('/united-states')).text();
    expect(html).toContain('Test Glamour Studio'); // NYC
    expect(html).toContain('Test Vendor 3');        // Boston
  });
});