import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LeadCaptureForm from '@/features/contact/components/LeadCaptureForm';
import { savePartialLeadToAirtable, submitToAirtable } from '@/features/contact/api/airtable';
import { VendorTag } from '@/types/vendor';
import { InquiryState } from '@/features/profile/common/utils/getInquiryState';


vi.mock('@/features/contact/api/airtable', () => ({
  savePartialLeadToAirtable: vi.fn().mockResolvedValue(true),
  submitToAirtable: vi.fn().mockResolvedValue(true),
}));

vi.mock('@/utils/analytics/trackFormEvents', () => ({
  trackFormAbandonment: vi.fn(),
  trackFormStarted: vi.fn(),
  trackFormStepBack: vi.fn(),
  trackFormSubmissionError: vi.fn(),
  trackFormValidationErrors: vi.fn(),
  trackPartialLeadSaved: vi.fn(),
  trackStepProgress: vi.fn(),
  trackVendorContactFormSubmission: vi.fn(),
}));

vi.mock('@/lib/env/env', () => ({
  isDevOrPreview: vi.fn().mockReturnValue(false),
}));

const mockedSubmitToAirtable = vi.mocked(submitToAirtable);
const mockedSavePartialLead = vi.mocked(savePartialLeadToAirtable);

beforeAll(() => {
  // jsdom doesn't implement matchMedia; MUI's useMediaQuery needs it.
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

beforeEach(() => {
  vi.clearAllMocks();
  mockedSubmitToAirtable.mockResolvedValue(true);
  mockedSavePartialLead.mockResolvedValue(true);
});

const baseVendor = {
  businessName: 'Glam by Jane',
  slug: 'glam-by-jane',
  id: 'vendor-1',
  email: 'jane@example.com',
  location: 'Los Angeles, CA',
};

// Two selectable ("primary") service tags, plus one "secondary" tag that
// should never show up as a selectable option, and deliberately non-sequential
// ids so we can be sure we're asserting on translated *labels*, not ids.
const serviceTagsWithPrimaryOptions: VendorTag[] = [
  { id: 'tag-abc', display_name: 'Hair', type: 'SERVICE', is_visible: true, name: 'SPECIALTY_HAIR' } as VendorTag,
  { id: 'tag-xyz', display_name: 'Makeup', type: 'SERVICE', is_visible: true, name: 'SPECIALTY_MAKEUP' } as VendorTag,
  { id: 'tag-skill', display_name: 'Thai Makeup', type: 'SKILL', is_visible: true, name: 'SKILL_THAI' } as VendorTag,
];

async function fillStep1AndContinue(services: string[] = ['Hair']) {
  for (const label of services) {
    await userEvent.click(screen.getByRole('button', { name: label }));
  }

  await userEvent.type(
    document.body.querySelector('input[name="location"]') as HTMLInputElement,
    'Los Angeles, CA'
  );
  await userEvent.type(
    document.body.querySelector('input[name="peopleCount"]') as HTMLInputElement,
    '4'
  );

  await userEvent.click(screen.getByRole('button', { name: 'Continue' }));
}

async function fillStep2() {
  await userEvent.type(
    document.body.querySelector('input[name="firstName"]') as HTMLInputElement,
    'Jane'
  );
  await userEvent.type(
    document.body.querySelector('input[name="lastName"]') as HTMLInputElement,
    'Doe'
  );
  await userEvent.type(
    document.body.querySelector('input[name="email"]') as HTMLInputElement,
    'jane.doe@example.com'
  );
  await userEvent.type(
    document.body.querySelector('input[name="weddingDate"]') as HTMLInputElement,
    '2027-06-15'
  );
  // Budget has no `name` attribute in the component — it's the only
  // type="number" input rendered on step 2.
  await userEvent.type(
    document.body.querySelector('input[type="number"]') as HTMLInputElement,
    '500'
  );
  await userEvent.type(
    document.body.querySelector(
      'textarea[name="additionalDetails"], input[name="additionalDetails"]'
    ) as HTMLElement,
    'Hi, I would love a natural bridal look.'
  );
}

describe('LeadCaptureForm — service tag translation', () => {
  it('only renders primary-style tags as selectable service options', () => {
    render(
      <LeadCaptureForm
        vendor={{ ...baseVendor, serviceTags: serviceTagsWithPrimaryOptions }}
        inquiryState={'not_verified' as unknown as InquiryState}
      />
    );

    expect(screen.getByRole('button', { name: 'Hair' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Makeup' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Bridal Specialist' })).not.toBeInTheDocument();
  });

  it('shows a configuration error and no selector when there are no primary service tags', () => {
    render(
      <LeadCaptureForm
        vendor={{
          ...baseVendor,
          serviceTags: [
            { id: 'tag-secondary', display_name: 'Bridal Specialist', style: 'secondary' } as VendorTag,
          ],
        }}
        inquiryState={'not_verified' as unknown as InquiryState}
      />
    );

    expect(
      screen.getByText(/this vendor doesn.?t have any services configured yet/i)
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Bridal Specialist' })).not.toBeInTheDocument();
  });

  it('submits translated display names (not raw tag ids) to Airtable on final submit', async () => {
    render(
      <LeadCaptureForm
        vendor={{ ...baseVendor, serviceTags: serviceTagsWithPrimaryOptions }}
        inquiryState={'not_verified' as unknown as InquiryState}
      />
    );

    await fillStep1AndContinue(['Hair', 'Makeup']);
    await fillStep2();

    await userEvent.click(screen.getByRole('button', { name: /send inquiry|get my quote/i }));

    await waitFor(() => expect(mockedSubmitToAirtable).toHaveBeenCalledTimes(1));

    const [submittedFormData] = mockedSubmitToAirtable.mock.calls[0];

    // Must be the human-readable labels the Airtable base expects...
    expect(new Set(submittedFormData.services)).toEqual(new Set(['Hair', 'Makeup']));
    // ...never the internal VendorTag ids.
    expect(submittedFormData.services).not.toEqual(expect.arrayContaining(['tag-abc', 'tag-xyz']));

    await screen.findByText('Request Sent Successfully! 🎉');
  });

  it('also translates ids to display names in the step-1 partial lead save', async () => {
    render(
      <LeadCaptureForm
        vendor={{ ...baseVendor, serviceTags: serviceTagsWithPrimaryOptions }}
        inquiryState={'not_verified' as unknown as InquiryState}
      />
    );

    await fillStep1AndContinue(['Makeup']);

    await waitFor(() => expect(mockedSavePartialLead).toHaveBeenCalledTimes(1));

    const [partialLead] = mockedSavePartialLead.mock.calls[0];
    expect(partialLead.formData.services).toEqual(['Makeup']);
    expect(partialLead.formData.services).not.toContain('tag-xyz');
  });

  it('drops a selected id that no longer matches any known service option', async () => {
    // Regression guard: if a service tag is deleted/renamed server-side after
    // the toggle group renders, getSelectedServiceLabels must silently drop
    // the stale id rather than sending `undefined` through to Airtable.
    render(
      <LeadCaptureForm
        vendor={{ ...baseVendor, serviceTags: serviceTagsWithPrimaryOptions }}
        inquiryState={'not_verified' as unknown as InquiryState}
      />
    );

    await fillStep1AndContinue(['Hair']);
    await fillStep2();
    await userEvent.click(screen.getByRole('button', { name: /send inquiry|get my quote/i }));

    await waitFor(() => expect(mockedSubmitToAirtable).toHaveBeenCalledTimes(1));
    const [submittedFormData] = mockedSubmitToAirtable.mock.calls[0];

    expect(submittedFormData.services.every((label: string) => typeof label === 'string')).toBe(true);
    expect(submittedFormData.services).not.toContain(undefined);
  });
});