import { test, expect, Page } from "@playwright/test";

/**
 * These tests exercise the real Supabase test DB seeded via seed.sql
 * (TEST-E2E-* fixtures). The only thing mocked is the app's own
 * `/api/search/reverse` route, which wraps the external Photon call —
 * that's the one genuinely-external dependency in this flow, and mocking
 * it lets us deterministically choose what coordinates "resolve" to
 * without depending on Photon's live index.
 *
 * Everything downstream (vendor radius search, country fallback) hits the
 * real seeded rows, so assertions are against actual fixture business
 * names rather than intercepted response bodies.
 *
 * Fixtures used (see seed.sql):
 *  - TEST-E2E-001..006: US vendors (New York, LA, Boston, Houston, Chicago)
 *  - TEST-E2E-ES: "Test Madrid Beauty", Spain (non-precise country)
 */

async function mockReverseGeocode(page: Page, response: unknown, status = 200) {
  await page.route("**/api/search/reverse**", async (route) => {
    await route.fulfill({
      status,
      contentType: "application/json",
      body: JSON.stringify({ ok: status >= 200 && status < 300, data: response }),
    });
  });
}

test.describe("location resolution — loading state", () => {
  test("spinner clears when reverse-geocode resolves to a real, seeded-nearby location", async ({ page }) => {
    // Coordinates near the New York fixture (TEST-E2E-001).
    await mockReverseGeocode(page, {
      display_name: "New York, New York",
      lat: 40.7128,
      lon: -74.006,
      address: { city: "New York", state: "New York", country: "United States" },
      type: "city",
    });

    await page.goto("/vendors?lat=40.7128&lon=-74.006");

    const progressBar = page.getByText("Loading artists...");
    await expect(progressBar).toBeVisible();
    await expect(progressBar).toBeHidden({ timeout: 10_000 });
    await expect(page.getByText("Test Glamour Studio")).toBeVisible();
  });

  test("spinner clears (does not spin forever) when reverse-geocode finds nothing, e.g. open ocean coords", async ({ page }) => {
    await mockReverseGeocode(page, { error: "Not Found" }, 404);

    await page.goto("/vendors?lat=0&lon=-160");

    // Regression guard: before the fix, a resolved-to-null location was
    // indistinguishable from "still resolving," so the spinner never cleared.
    const progressBar = page.getByText("Loading artists...");
    await expect(progressBar).toBeHidden({ timeout: 10_000 });
    // With no location resolved, the page falls back to the full,
    // unfiltered vendor list — all seeded include_in_directory vendors,
    // not an empty result set.
    await expect(page.getByText("Test Glamour Studio")).toBeVisible();
    await expect(page.getByText("Test Bridal Beauty Co")).toBeVisible();
  });

  test("spinner clears when the reverse-geocode request errors out (network failure)", async ({ page }) => {
    await page.route("**/api/search/reverse**", (route) => route.abort("failed"));

    await page.goto("/vendors?lat=12.3&lon=45.6");


    const progressBar = page.getByText("Loading artists...");
    await expect(progressBar).toBeHidden({ timeout: 10_000 });
  });
});

test.describe("country-level fallback for sparse, non-precise countries", () => {
  test("falls back to country-wide vendors when nearby-radius search is empty in a non-precise country", async ({ page }) => {
    // Resolves to a country-level result (no city/state) for Spain, at
    // coordinates far enough from TEST-E2E-ES (Madrid) that radius search
    // (even after expansion) comes up empty, forcing the country fallback.
    // Almería, in the south of Spain — ~250mi from Madrid.
    await mockReverseGeocode(page, {
      display_name: "Spain",
      lat: 36.8381,
      lon: -2.4597,
      address: { country: "Spain" },
      type: "country",
    });

    await page.goto("/vendors?lat=36.8381&lon=-2.4597");


    const progressBar = page.getByText("Loading artists...");
    await expect(progressBar).toBeHidden({ timeout: 10_000 });
    await expect(page.getByText("Test Madrid Beauty")).toBeVisible();
    // Shouldn't be showing the broaden-search empty state alongside a
    // successful country-level fallback.
    await expect(page.getByText(/broaden your search/i)).not.toBeVisible();
  });

  test("does NOT fall back to country-wide results for a precise country (US) with no vendors nearby", async ({ page }) => {
    // Rural Wyoming — far from every seeded US fixture (NY, LA, Boston,
    // Houston, Chicago), but still resolves to a real US city/state via
    // Photon, so this exercises the "radius search empty in a precise
    // country" path specifically, not a geocoding edge case.
    await mockReverseGeocode(page, {
      display_name: "Casper, Wyoming",
      lat: 42.8666,
      lon: -106.313,
      address: { city: "Casper", state: "Wyoming", country: "United States" },
      type: "city",
    });

    await page.goto("/vendors?lat=42.8666&lon=-106.313");


    const progressBar = page.getByText("Loading artists...");
    await expect(progressBar).toBeHidden({ timeout: 10_000 });
    // Precise-country + empty radius result should show the genuine empty
    // state (see FilterableVendorTableContent's "broaden your search"
    // prompt), not silently broaden to every US vendor in the country.
    await expect(page.getByText(/broaden your search/i)).toBeVisible();
    await expect(page.getByText("Test Glamour Studio")).not.toBeVisible();
  });
});