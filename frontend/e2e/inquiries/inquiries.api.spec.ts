import { supabaseAdminClient } from '@/lib/supabase/clients/adminClient';
import { test, expect } from '@playwright/test';

/**
 * Runs against the local Supabase instance, which the 'supabase-setup'
 * Playwright project resets (migrations + seed.sql) once before the
 * whole suite runs. That means:
 *   - No per-test cleanup needed — every run starts from the same
 *     known seeded state regardless of what earlier tests inserted.
 *   - Vendor and tag ids below come straight from seed.sql.
 */
test.describe('POST /api/inquiries (local Supabase)', () => {
  test('creates a real inquiry row end-to-end', async ({ request }) => {
    const response = await request.post('/api/inquiries', {
      timeout: 20_000,
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
        services: ['Hair', 'Makeup'],
        makeupStyles: ['Natural'],
        airtable_record_id: 'rec_e2e_test',
      },
    });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.ok).toBe(true);
    expect(typeof body.data.id).toBe('string');
  });

  test('persists services and airtable_record_id exactly as submitted', async ({
    request,
  }) => {
    const response = await request.post('/api/inquiries', {
      data: {
        vendor_id: 'TEST-E2E-002',
        isTestRecord: true,
        firstName: 'Playwright',
        lastName: 'Test',
        email: 'playwright-test@example.com',
        additionalDetails: 'Automated Phase 0 e2e check.',
        location: 'Boston, MA',
        budget: '500',
        peopleCount: '4',
        services: ['Hair'],
        airtable_record_id: 'rec_e2e_readback',
      },
    });
    expect(response.status()).toBe(201);
    const { data } = await response.json();

    const { data: inquiry, error } = await supabaseAdminClient
      .from('inquiries')
      .select('services, airtable_record_id')
      .eq('id', data.id)
      .single();

    expect(error).toBeNull();
    expect(inquiry?.services).toEqual(['Hair']);
    expect(inquiry?.airtable_record_id).toBe('rec_e2e_readback');
  });

  test('returns 422 for an unknown vendor_id', async ({ request }) => {
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
        services: ['Hair'],
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