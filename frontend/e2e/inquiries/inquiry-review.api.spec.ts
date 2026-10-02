import { test, expect } from '../fixtures/adminAuth';
import { supabaseTestClient } from '../utils/supabaseTestClient';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000';
const TEST_VENDOR_ID = 'TEST-E2E-INQUIRY'; // reuse whatever vendor your other tests seed against

// Far older than anything real or any other test seeds (they use new Date()),
// so these rows sit at the very front of the queue.
const OLD_TIMESTAMP = '2000-01-01T00:00:00.000Z';

async function createPendingReviewInquiries(vendorId: string, count: number, submittedAt: string) {
  const runId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const rows = Array.from({ length: count }, (_, i) => ({
    vendor_id: vendorId,
    inquiry_status: 'pending_review',
    submitted_at: submittedAt,
    is_test_record: true,
    bride_first_name: 'Playwright',
    bride_last_name: `Pagination${i}`,
    bride_email: `playwright-page-${runId}-${i}@example.com`,
    message: 'Playwright-seeded pagination test inquiry',
  }));

  const { data, error } = await supabaseTestClient.from('inquiries').insert(rows).select('id');
  if (error || !data) {
    throw new Error(`Failed to seed test inquiries: ${error?.message}`);
  }
  return data.map((r) => r.id as string);
}

async function deleteInquiries(ids: string[]) {
  await supabaseTestClient.from('inquiries').delete().in('id', ids);
}



test.describe('Admin inquiry review API', () => {
  test('GET /api/admin/inquiries requires admin auth', async ({ request }) => {
    const res = await request.get(`${BASE_URL}/api/admin/inquiries`);
    expect(res.status()).toBe(401);
  });


  test('admin can fetch the pending_review queue', async ({ request, adminCookie }) => {
    // Distinct from the pagination tests' timestamp (2000-01-01) so the two
    // groups don't interleave if they run in parallel. Still older than any
    // real data, so it sits near the front of the queue.
    const [seededId] = await createPendingReviewInquiries(
      'TEST-E2E-INQUIRY',
      1,
      '2000-01-02T00:00:00.000Z'
    );

    try {
      const res = await request.get(`${BASE_URL}/api/admin/inquiries?limit=200`, {
        headers: { Cookie: adminCookie },
      });
      expect(res.status(), await res.text()).toBe(200);

      const body = await res.json();
      expect(body.ok).toBe(true);

      const { inquiries, has_more, next_cursor } = body.data;
      expect(Array.isArray(inquiries)).toBe(true);
      expect(typeof has_more).toBe('boolean');
      // The continuation fields must agree with each other.
      if (has_more) {
        expect(typeof next_cursor).toBe('string');
      } else {
        expect(next_cursor).toBeNull();
      }

      // Everything returned is actually pending, and our seeded row is in it.
      for (const row of inquiries) {
        expect(row.inquiry_status).toBe('pending_review');
      }
      expect(inquiries.map((i: { id: string }) => i.id)).toContain(seededId);
    } finally {
      await deleteInquiries([seededId]);
    }
  });

  test('approving a pending_review inquiry moves it to available', async ({ request, adminCookie }) => {
    const vendorId = 'TEST-E2E-INQUIRY';
    const [inquiryId] = await createPendingReviewInquiries(vendorId, 1, new Date().toISOString());

    try {
      const res = await request.patch(`${BASE_URL}/api/admin/inquiries/${inquiryId}`, {
        headers: { Cookie: adminCookie },
        data: { action: 'approve' },
      });

      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.data.inquiry_status).toBe('available');
      expect(body.data.expires_at).toBeTruthy();
    } finally {
      await deleteInquiries([inquiryId]);
    }
  });

  test('two simultaneous approvals of the same inquiry: exactly one succeeds', async ({ request, adminCookie }) => {
    const vendorId = 'TEST-E2E-INQUIRY';
    const [inquiryId] = await createPendingReviewInquiries(vendorId, 1, new Date().toISOString());

    try {
      const [resA, resB] = await Promise.all([
        request.patch(`${BASE_URL}/api/admin/inquiries/${inquiryId}`, {
          headers: { Cookie: adminCookie },
          data: { action: 'approve' },
        }),
        request.patch(`${BASE_URL}/api/admin/inquiries/${inquiryId}`, {
          headers: { Cookie: adminCookie },
          data: { action: 'approve' },
        }),
      ]);

      const statuses = [resA.status(), resB.status()].sort();
      // Exactly one 200 and one 409 — never two 200s (double-processed) and
      // never two failures (the legitimate request should always win).
      expect(statuses).toEqual([200, 409]);
    } finally {
      await deleteInquiries([inquiryId]);
    }
  });
});


test.describe('Admin inquiry queue pagination', () => {
  test('queue respects the default page size', async ({ request, adminCookie }) => {
    const res = await request.get(`${BASE_URL}/api/admin/inquiries`, {
      headers: { Cookie: adminCookie },
    });
    expect(res.status(), await res.text()).toBe(200);
    const { inquiries } = (await res.json()).data;
    expect(inquiries.length).toBeLessThanOrEqual(50);
  });

  test('pages through the queue with a cursor, using id as the tiebreaker', async ({ request, adminCookie }) => {
    // All three share ONE submitted_at, so ordering depends entirely on the
    // id tiebreaker. That's the case a (submitted_at)-only cursor would get wrong.
    const seeded = await createPendingReviewInquiries(TEST_VENDOR_ID, 3, OLD_TIMESTAMP);
    const expectedOrder = [...seeded].sort(); // uuid text order matches Postgres uuid order

    try {
      // Page 1
      const res1 = await request.get(`${BASE_URL}/api/admin/inquiries?limit=2`, {
        headers: { Cookie: adminCookie },
      });
      expect(res1.status(), await res1.text()).toBe(200);
      const page1 = (await res1.json()).data;

      expect(page1.inquiries.map((i: { id: string }) => i.id)).toEqual(expectedOrder.slice(0, 2));
      expect(page1.has_more).toBe(true);
      expect(typeof page1.next_cursor).toBe('string');

      // Page 2: continues exactly where page 1 stopped
      const res2 = await request.get(
        `${BASE_URL}/api/admin/inquiries?limit=2&cursor=${encodeURIComponent(page1.next_cursor)}`,
        { headers: { Cookie: adminCookie } }
      );
      expect(res2.status(), await res2.text()).toBe(200);
      const page2 = (await res2.json()).data;

      const page2Ids = page2.inquiries.map((i: { id: string }) => i.id);
      expect(page2Ids[0]).toBe(expectedOrder[2]); // third seeded row comes first
      expect(page2Ids).not.toContain(expectedOrder[0]); // no duplicates across pages
      expect(page2Ids).not.toContain(expectedOrder[1]);

      // If nothing else is pending in this DB, page 2 is the last page.
      // (Other pending rows would legitimately make has_more true.)
      if (page2.inquiries.length === 1) {
        expect(page2.has_more).toBe(false);
        expect(page2.next_cursor).toBeNull();
      }
    } finally {
      await deleteInquiries(seeded);
    }
  });

  test('a cursor survives rows being approved mid-pagination', async ({ request, adminCookie }) => {
    const seeded = await createPendingReviewInquiries(TEST_VENDOR_ID, 3, OLD_TIMESTAMP);
    const expectedOrder = [...seeded].sort();

    try {
      const res1 = await request.get(`${BASE_URL}/api/admin/inquiries?limit=1`, {
        headers: { Cookie: adminCookie },
      });
      expect(res1.status(), await res1.text()).toBe(200);
      const page1 = (await res1.json()).data;
      expect(page1.inquiries[0].id).toBe(expectedOrder[0]);

      // Approve the row we just saw: it leaves the pending set.
      const approve = await request.patch(`${BASE_URL}/api/admin/inquiries/${expectedOrder[0]}`, {
        headers: { Cookie: adminCookie },
        data: { action: 'approve' },
      });
      expect(approve.status(), await approve.text()).toBe(200);

      // An offset-based approach would now skip a row. A keyset cursor must not.
      const res2 = await request.get(
        `${BASE_URL}/api/admin/inquiries?limit=1&cursor=${encodeURIComponent(page1.next_cursor)}`,
        { headers: { Cookie: adminCookie } }
      );
      expect(res2.status(), await res2.text()).toBe(200);
      const page2 = (await res2.json()).data;
      expect(page2.inquiries[0].id).toBe(expectedOrder[1]);
    } finally {
      await deleteInquiries(seeded);
    }
  });

  test('rejects an invalid cursor', async ({ request, adminCookie }) => {
    const res = await request.get(`${BASE_URL}/api/admin/inquiries?cursor=not-a-real-cursor`, {
      headers: { Cookie: adminCookie },
    });
    expect(res.status(), await res.text()).toBe(400);
  });

  for (const limit of ['0', '201', 'abc']) {
    test(`rejects invalid limit=${limit}`, async ({ request, adminCookie }) => {
      const res = await request.get(`${BASE_URL}/api/admin/inquiries?limit=${limit}`, {
        headers: { Cookie: adminCookie },
      });
      expect(res.status(), await res.text()).toBe(400);
    });
  }
});