import { Page } from '@playwright/test';

// Mock all Airtable API routes so e2e tests never hit the real Airtable API.
// Mirrors the pattern used for HubSpot form mocks (mockRecaptcha + route stubs).
export async function mockAirtable(page: Page) {
  await page.route('**/api/airtable/leads**', (route) =>
    route.fulfill({ status: 200, json: { ok: true } })
  );
  await page.route('**/api/airtable/partial-leads**', (route) =>
    route.fulfill({ status: 200, json: { ok: true } })
  );
  await page.route('**/api/airtable/vendor-feedback**', (route) =>
    route.fulfill({ status: 200, json: { ok: true } })
  );
}
