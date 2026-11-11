import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const { mockLeadsCreate, mockVendorsFirstPage } = vi.hoisted(() => ({
  mockLeadsCreate: vi.fn(),
  mockVendorsFirstPage: vi.fn(),
}));

vi.mock('@/lib/airtable/constants', () => ({
  getLeadsTable: () => ({ create: mockLeadsCreate }),
  getVendorsTable: () => ({ select: () => ({ firstPage: mockVendorsFirstPage }) }),
}));

import { POST } from './route';

const baseFormData = {
  isTestRecord: true,
  services: ['Hair'],
  peopleCount: '4',
  flexibleCount: false,
  firstName: 'Jane',
  lastName: 'Doe',
  email: 'jane@example.com',
  phone: '',
  location: 'Boston, MA',
  weddingDate: '2027-06-12',
  flexibleDate: false,
  budget: '500',
  flexibleBudget: false,
  additionalDetails: 'Hi',
  makeupStyles: ['Natural'],
};

const vendor = { businessName: 'Glam by Jane', slug: 'glam-by-jane', id: 'vendor-1' };

function postLead(formData: typeof baseFormData) {
  return POST(
    new NextRequest('http://localhost/api/airtable/leads', {
      method: 'POST',
      body: JSON.stringify({ formData, vendor }),
    })
  );
}

function submittedFields() {
  const [[records]] = mockLeadsCreate.mock.calls;
  return records[0].fields;
}

beforeEach(() => {
  vi.clearAllMocks();
  mockVendorsFirstPage.mockResolvedValue([{ id: 'recVendor' }]);
  mockLeadsCreate.mockResolvedValue([{ id: 'recLead' }]);
});

describe('POST /api/airtable/leads — flexible flags', () => {
  it.each([true, false])('maps flexible flags = %s to Airtable checkbox columns', async (flag) => {
    const res = await postLead({
      ...baseFormData,
      flexibleDate: flag,
      flexibleBudget: flag,
      flexibleCount: flag,
    });

    expect(res.status).toBe(200);
    expect(submittedFields()).toMatchObject({
      'Is Flexible Date?': flag,
      'Is Flexible Budget?': flag,
      'Is Flexible Count?': flag,
    });
  });
});
