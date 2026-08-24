import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ContactUs from '@/app/(public)/contact/page';
import { ContactReason } from '@/features/contact/components/EmailForm';

// The contact page is a server component: await it, then render the returned tree.
async function renderContactPage(searchParams: { reason?: string }) {
  render(await ContactUs({ searchParams: Promise.resolve(searchParams) }));
  return screen.getByRole('combobox', { name: /reason for contacting/i });
}

describe('contact page reason link param', () => {
  it('pre-selects the reason from a ?reason= link', async () => {
    const select = await renderContactPage({ reason: ContactReason.CLAIM });

    expect(select).toHaveTextContent('Claim a Listing');
    expect(document.querySelector('input[name="reason"]')).toHaveValue(
      ContactReason.CLAIM
    );
  });

  it.each(Object.values(ContactReason))(
    'pre-selects %s from the link',
    async (reason) => {
      await renderContactPage({ reason });

      expect(document.querySelector('input[name="reason"]')).toHaveValue(reason);
    }
  );

  it('leaves the reason empty when the link has no reason param', async () => {
    const select = await renderContactPage({});

    expect(select).not.toHaveTextContent(/\w/);
    expect(document.querySelector('input[name="reason"]')).toHaveValue('');
  });

  it('ignores a reason value that is not a ContactReason', async () => {
    await renderContactPage({ reason: 'not-a-real-reason' });

    expect(document.querySelector('input[name="reason"]')).toHaveValue('');
  });
});
