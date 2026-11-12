import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RecommendationForm from '@/features/recommendations/components/RecommendationForm';

const mocks = vi.hoisted(() => ({
  createRecommendation: vi.fn(),
  addNotification: vi.fn(),
  executeAsync: vi.fn(),
  reset: vi.fn(),
  isDevOrPreview: vi.fn(),
}));

vi.mock('@/features/recommendations/api/createRecommendation', () => ({
  createRecommendation: mocks.createRecommendation,
}));
vi.mock('@/contexts/NotificationContext', () => ({
  useNotification: () => ({ addNotification: mocks.addNotification }),
}));
vi.mock('@/lib/env/env', () => ({ isDevOrPreview: mocks.isDevOrPreview }));
vi.mock('@/components/security/ReCaptcha', async () => {
  const React = await import('react');
  return {
    default: React.forwardRef<unknown>(function MockReCaptcha(_props, ref) {
      React.useImperativeHandle(ref, () => ({
        executeAsync: mocks.executeAsync,
        reset: mocks.reset,
      }));
      return null;
    }),
  };
});

const field = (name: RegExp) => screen.getByRole('textbox', { name });
const submitButton = () => screen.getByRole('button', { name: /submit recommendation/i });

async function fillRequired() {
  await userEvent.type(field(/artist or business name/i), 'Glam by Jane');
  await userEvent.type(field(/location/i), 'Los Angeles, CA');
}

beforeEach(() => {
  Object.values(mocks).forEach((m) => m.mockReset());
  mocks.createRecommendation.mockResolvedValue({ id: 'rec_1' });
  mocks.executeAsync.mockResolvedValue('token-123');
  mocks.isDevOrPreview.mockReturnValue(false);
  vi.spyOn(console, 'error').mockImplementation(() => { });
});

describe('RecommendationForm: required fields', () => {
  it('blocks submit and shows errors when business name and location are empty', async () => {
    render(<RecommendationForm />);

    await userEvent.click(submitButton());

    expect(screen.getByText('Business name is required')).toBeInTheDocument();
    expect(screen.getByText('Location is required')).toBeInTheDocument();
    expect(mocks.createRecommendation).not.toHaveBeenCalled();
    expect(mocks.executeAsync).not.toHaveBeenCalled();
  });

  it('treats whitespace-only values as empty', async () => {
    render(<RecommendationForm />);
    await userEvent.type(field(/artist or business name/i), '   ');
    await userEvent.type(field(/location/i), '   ');

    await userEvent.click(submitButton());

    expect(screen.getByText('Business name is required')).toBeInTheDocument();
    expect(screen.getByText('Location is required')).toBeInTheDocument();
    expect(mocks.createRecommendation).not.toHaveBeenCalled();
  });
});

describe('RecommendationForm: email', () => {
  it('submits with no email and sends an empty string', async () => {
    render(<RecommendationForm />);
    await fillRequired();

    await userEvent.click(submitButton());

    await waitFor(() => expect(mocks.createRecommendation).toHaveBeenCalledTimes(1));
    expect(mocks.createRecommendation.mock.calls[0][0].recommended_by).toBe('');
  });

  it.each([
    ['consecutive dots in domain', 'jane@example..com'],
    ['consecutive dots in local part', 'ja..ne@example.com'],
    ['no TLD', 'jane@example'],
  ])('blocks submit and shows an error for invalid email (%s)', async (_label, email) => {
    render(<RecommendationForm />);
    await fillRequired();
    await userEvent.type(field(/your email/i), email);

    await userEvent.click(submitButton());

    expect(screen.getByText('Enter a valid email address')).toBeInTheDocument();
    expect(mocks.createRecommendation).not.toHaveBeenCalled();
    expect(mocks.executeAsync).not.toHaveBeenCalled();
  });

  it('normalizes the email as the user types and submits the normalized value', async () => {
    render(<RecommendationForm />);
    await fillRequired();
    await userEvent.type(field(/your email/i), 'Jane@Example.COM');

    expect(field(/your email/i)).toHaveValue('jane@example.com');

    await userEvent.click(submitButton());

    await waitFor(() => expect(mocks.createRecommendation).toHaveBeenCalledTimes(1));
    expect(mocks.createRecommendation.mock.calls[0][0].recommended_by).toBe('jane@example.com');
  });
});

describe('RecommendationForm: submission', () => {
  it('sends the form data plus the reCAPTCHA token, then resets the form', async () => {
    render(<RecommendationForm />);
    await fillRequired();
    await userEvent.type(field(/instagram/i), '@glambyjane');
    await userEvent.type(field(/why do you recommend/i), 'Amazing with sensitive skin.');

    await userEvent.click(submitButton());

    await waitFor(() => expect(mocks.createRecommendation).toHaveBeenCalledTimes(1));
    expect(mocks.createRecommendation).toHaveBeenCalledWith(
      expect.objectContaining({
        business_name: 'Glam by Jane',
        region: 'Los Angeles, CA',
        ig_handle: '@glambyjane',
        notes: 'Amazing with sensitive skin.',
        status: 'pending',
        recaptchaToken: 'token-123',
      })
    );
    expect(mocks.addNotification).toHaveBeenCalledWith(
      'Thank you! Your recommendation has been submitted.'
    );
    expect(mocks.reset).toHaveBeenCalledTimes(1);
    expect(field(/artist or business name/i)).toHaveValue('');
    expect(field(/location/i)).toHaveValue('');
  });

  it('disables the button and shows progress while submitting', async () => {
    let resolve!: (v: { id: string }) => void;
    mocks.createRecommendation.mockReturnValue(new Promise((r) => (resolve = r)));
    render(<RecommendationForm />);
    await fillRequired();

    await userEvent.click(submitButton());

    const busy = await screen.findByRole('button', { name: /submitting/i });
    expect(busy).toBeDisabled();

    resolve({ id: 'rec_1' });
    expect(await screen.findByRole('button', { name: /submit recommendation/i })).toBeEnabled();
  });

  it('shows an error and does not submit when reCAPTCHA returns no token', async () => {
    mocks.executeAsync.mockResolvedValue(null);
    render(<RecommendationForm />);
    await fillRequired();

    await userEvent.click(submitButton());

    await waitFor(() =>
      expect(mocks.addNotification).toHaveBeenCalledWith(
        'CAPTCHA verification failed. Please try again.',
        'error'
      )
    );
    expect(mocks.createRecommendation).not.toHaveBeenCalled();
    // Form is left intact so the user can retry.
    expect(field(/artist or business name/i)).toHaveValue('Glam by Jane');
  });

  it("falls back to 'test-bypass' in dev/preview when the widget returns nothing", async () => {
    mocks.executeAsync.mockResolvedValue(undefined);
    mocks.isDevOrPreview.mockReturnValue(true);
    render(<RecommendationForm />);
    await fillRequired();

    await userEvent.click(submitButton());

    await waitFor(() => expect(mocks.createRecommendation).toHaveBeenCalledTimes(1));
    expect(mocks.createRecommendation.mock.calls[0][0].recaptchaToken).toBe('test-bypass');
  });

  it('shows an error notification and keeps the form when the response has no id', async () => {
    mocks.createRecommendation.mockResolvedValue({});
    render(<RecommendationForm />);
    await fillRequired();

    await userEvent.click(submitButton());

    await waitFor(() =>
      expect(mocks.addNotification).toHaveBeenCalledWith(
        'Failed to submit recommendation',
        'error'
      )
    );
    expect(mocks.reset).not.toHaveBeenCalled();
    expect(field(/artist or business name/i)).toHaveValue('Glam by Jane');
  });

  it("surfaces the server's error message when createRecommendation throws", async () => {
    mocks.createRecommendation.mockRejectedValue(new Error('Rate limited'));
    render(<RecommendationForm />);
    await fillRequired();

    await userEvent.click(submitButton());

    await waitFor(() =>
      expect(mocks.addNotification).toHaveBeenCalledWith('Rate limited', 'error')
    );
    expect(submitButton()).toBeEnabled();
  });
});