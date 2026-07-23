import { test, expect } from '@playwright/test';

/**
 * Runs against the local Supabase instance, which the 'supabase-setup'
 * Playwright project resets (migrations + seed.sql) once before the
 * whole suite runs. That means:
 *   - No per-test cleanup needed — every run starts from the same
 *     known seeded state regardless of what earlier tests inserted.
 *   - Vendor and tag ids below come straight from seed.sql.
 */

const HAIR_TAG_ID = 'e2e00000-0000-0000-0000-000000000001';
const MAKEUP_TAG_ID = 'e2e00000-0000-0000-0000-000000000003';

test.describe('POST /api/inquiries (local Supabase)', () => {
  test('creates a real inquiry row end-to-end', async ({ request }) => {
    const response = await request.post('/api/inquiries', {
      data: {
        vendor_id: 'TEST-E2E-002',
        isTestRecord: true,
        firstName: 'Playwright',
        lastName: 'Test',
        email: 'playwright-test@example.com',
        additionalDetails: 'Automated Phase 0 e2e check.',
        weddingDate: '2027-06-12',
        flexibleDate: false,
        location: 'Boston, MA',
        budget: '500',
        peopleCount: '4',
        flexibleCount: false,
        services: [HAIR_TAG_ID, MAKEUP_TAG_ID],
        makeupStyles: ["Natural"],
      },
    });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.ok).toBe(true);
    expect(typeof body.data.id).toBe('string');
  });

  test('returns 500 for invalid inquiry, like an unknown vendor_id', async ({ request }) => {
    const response = await request.post('/api/inquiries', {
      data: {
        vendor_id: 'definitely-not-a-real-vendor-id',
        isTestRecord: true,
        firstName: 'Playwright',
        lastName: 'Test',
        email: 'playwright-test@example.com',
        additionalDetails: 'Automated Phase 0 e2e check.',
        location: 'Boston, MA',
        budget: '500',
        peopleCount: '4',
        services: [HAIR_TAG_ID],
      },
    });

    expect(response.status()).toBe(422);
    const body = await response.json();
    expect(body).toEqual({
      ok: false,
      error: 'Vendor could not be found',
      code: 'INVALID_VENDOR',
    });
  });

  test('returns 422 for an invalid payload', async ({ request }) => {
    const response = await request.post('/api/inquiries', {
      data: {
        vendor_id: 'TEST-E2E-002',
        isTestRecord: true,
        firstName: '',
        lastName: 'Test',
        email: 'not-an-email',
        additionalDetails: '',
        location: '',
        budget: '-1',
        peopleCount: '0',
        services: [],
      },
    });

    expect(response.status()).toBe(422);
    const body = await response.json();
    expect(body.ok).toBe(false);
    expect(body.code).toBe('VALIDATION_ERROR');
  });
});