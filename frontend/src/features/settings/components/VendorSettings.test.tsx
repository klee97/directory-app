import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VendorSettings } from './VendorSettings';

const mocks = vi.hoisted(() => ({
  // Stable object: the component has `router` in a useEffect dep array.
  router: { push: vi.fn() },
  addNotification: vi.fn(),
  useAuth: vi.fn(),
  updatePassword: vi.fn(),
  updateEmail: vi.fn(),
  updateInquiryAvailability: vi.fn(),
  revalidateVendor: vi.fn(),
}));

vi.mock('next/navigation', () => ({ useRouter: () => mocks.router }));
vi.mock('next/link', async () => {
  const React = await import('react');
  return {
    default: React.forwardRef<HTMLAnchorElement, React.ComponentProps<'a'>>(
      function MockLink({ href, children, ...rest }, ref) {
        return <a ref={ref} href={href} {...rest}>{children}</a>;
      },
    ),
  };
});
vi.mock('@/contexts/NotificationContext', () => ({
  useNotification: () => ({ addNotification: mocks.addNotification }),
}));
vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => mocks.useAuth() }));
vi.mock('@/features/settings/api/updatePassword', () => ({ updatePassword: mocks.updatePassword }));
vi.mock('@/features/settings/api/updateEmail', () => ({ updateEmail: mocks.updateEmail }));
vi.mock('@/features/settings/api/updateInquiryAvailability', () => ({
  updateInquiryAvailability: mocks.updateInquiryAvailability,
}));
vi.mock('@/lib/actions/revalidate', () => ({ revalidateVendor: mocks.revalidateVendor }));

// The dialog has its own tests; here we only care how VendorSettings wires it up.
vi.mock('./ChangePasswordDialog', () => ({
  default: ({ open, onClose, onSubmit }: {
    open: boolean;
    onClose: () => void;
    onSubmit: (cur: string, next: string, confirm: string) => void;
  }) =>
    open ? (
      <div data-testid="password-dialog">
        <button onClick={() => onSubmit('old-pw', 'new-pw', 'new-pw')}>submit-matching</button>
        <button onClick={() => onSubmit('old-pw', 'new-pw', 'different')}>submit-mismatched</button>
        <button onClick={onClose}>close-password</button>
      </div>
    ) : null,
}));

const USER_EMAIL = 'vendor@acme.com';
const baseProps = { userEmail: USER_EMAIL, vendorId: 'HMUA-1', vendorSlug: 'acme' };

function setup(props: Partial<React.ComponentProps<typeof VendorSettings>> = {}) {
  const user = userEvent.setup();
  const utils = render(<VendorSettings {...baseProps} {...props} />);
  const getSwitch = () => utils.container.querySelector('input[type="checkbox"]') as HTMLInputElement;
  return { user, getSwitch, ...utils };
}

const deferred = <T,>() => {
  let resolve!: (v: T) => void;
  const promise = new Promise<T>((r) => { resolve = r; });
  return { promise, resolve };
};

async function openEmailDialog(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: /change email/i }));
  return screen.getByRole('dialog');
}

const currentPasswordField = () => screen.getByLabelText(/current password/i);
const newEmailField = () => screen.getByLabelText(/new email address/i);
const updateEmailButton = () => screen.getByRole('button', { name: /update email|updating/i });

beforeEach(() => {
  Object.values(mocks).forEach((m) => {
    if (typeof m === 'function') m.mockReset();
  });
  mocks.router.push.mockReset();
  mocks.useAuth.mockReturnValue({ isLoggedIn: true, isLoading: false });
  mocks.updateInquiryAvailability.mockResolvedValue({ error: null });
  mocks.updateEmail.mockResolvedValue({ error: null });
  mocks.updatePassword.mockResolvedValue({ error: null });
  mocks.revalidateVendor.mockResolvedValue(undefined);
});

describe('VendorSettings: rendering and auth redirect', () => {
  it('renders every settings option', () => {
    setup();
    expect(screen.getByRole('heading', { name: 'Account Settings' })).toBeInTheDocument();
    expect(screen.getByText('Bridal Inquiries')).toBeInTheDocument();
    expect(screen.getByText('Change Email')).toBeInTheDocument();
    expect(screen.getByText('Change Password')).toBeInTheDocument();
    expect(screen.getByText('Delete Account')).toBeInTheDocument();
  });

  it('links Delete Account to the contact page', () => {
    setup();
    expect(screen.getByRole('link', { name: /delete account/i })).toHaveAttribute('href', '/partner/contact');
  });

  it('redirects to login when logged out', () => {
    mocks.useAuth.mockReturnValue({ isLoggedIn: false, isLoading: false });
    setup();
    expect(mocks.router.push).toHaveBeenCalledWith('/partner/login');
  });

  it('does not redirect while auth is still loading', () => {
    mocks.useAuth.mockReturnValue({ isLoggedIn: false, isLoading: true });
    setup();
    expect(mocks.router.push).not.toHaveBeenCalled();
  });

  it('does not redirect when logged in', () => {
    setup();
    expect(mocks.router.push).not.toHaveBeenCalled();
  });
});

describe('VendorSettings: bridal inquiries toggle', () => {
  it('starts on when the vendor has not opted out', () => {
    const { getSwitch } = setup({ inquiriesOptedOutAt: null });
    expect(getSwitch()).toBeChecked();
  });

  it('starts off when the vendor has opted out', () => {
    const { getSwitch } = setup({ inquiriesOptedOutAt: '2026-01-01T00:00:00Z' });
    expect(getSwitch()).not.toBeChecked();
  });

  it('disables inquiries, revalidates the vendor page, and notifies', async () => {
    const { user, getSwitch } = setup();
    await user.click(getSwitch());

    await waitFor(() => expect(mocks.updateInquiryAvailability).toHaveBeenCalledWith('HMUA-1', false));
    expect(mocks.revalidateVendor).toHaveBeenCalledWith('acme');
    expect(mocks.addNotification).toHaveBeenCalledWith('Bridal inquiries disabled');
    expect(getSwitch()).not.toBeChecked();
  });

  it('enables inquiries for an opted-out vendor', async () => {
    const { user, getSwitch } = setup({ inquiriesOptedOutAt: '2026-01-01T00:00:00Z' });
    await user.click(getSwitch());

    await waitFor(() => expect(mocks.updateInquiryAvailability).toHaveBeenCalledWith('HMUA-1', true));
    expect(mocks.addNotification).toHaveBeenCalledWith('Bridal inquiries enabled');
    expect(getSwitch()).toBeChecked();
  });

  it('skips revalidation when there is no slug', async () => {
    const { user, getSwitch } = setup({ vendorSlug: undefined });
    await user.click(getSwitch());

    await waitFor(() => expect(mocks.addNotification).toHaveBeenCalledWith('Bridal inquiries disabled'));
    expect(mocks.revalidateVendor).not.toHaveBeenCalled();
  });

  it('reverts the switch and shows the error when the update fails', async () => {
    mocks.updateInquiryAvailability.mockResolvedValue({ error: 'nope' });
    const { user, getSwitch } = setup();
    await user.click(getSwitch());

    await waitFor(() => expect(mocks.addNotification).toHaveBeenCalledWith('nope', 'error'));
    expect(getSwitch()).toBeChecked();
    expect(mocks.revalidateVendor).not.toHaveBeenCalled();
  });

  it('is disabled while the update is in flight', async () => {
    const d = deferred<{ error: null }>();
    mocks.updateInquiryAvailability.mockReturnValue(d.promise);
    const { user, getSwitch } = setup();
    await user.click(getSwitch());

    expect(getSwitch()).toBeDisabled();
    d.resolve({ error: null });
    await waitFor(() => expect(getSwitch()).not.toBeDisabled());
  });
});

describe('VendorSettings: change email dialog', () => {
  it('shows the current email', async () => {
    const { user } = setup();
    const dialog = await openEmailDialog(user);
    expect(dialog).toHaveTextContent(`Current email: ${USER_EMAIL}`);
  });

  it('disables Update Email until a new email is entered', async () => {
    const { user } = setup();
    await openEmailDialog(user);
    expect(updateEmailButton()).toBeDisabled();
  });

  it.each(['VENDOR@acme.com', '  vendor@acme.com  ', ' Vendor@ACME.com\n'])(
    'treats %j as the same as the current email',
    async (typed) => {
      const { user } = setup();
      await openEmailDialog(user);
      await user.type(newEmailField(), typed);

      expect(screen.getByText('New email address must be different from current email')).toBeInTheDocument();
      expect(updateEmailButton()).toBeDisabled();
    },
  );

  it('flags a malformed email and disables submit', async () => {
    const { user } = setup();
    await openEmailDialog(user);
    await user.type(newEmailField(), 'not-an-email');

    expect(screen.getByText('Enter a valid email address')).toBeInTheDocument();
    expect(updateEmailButton()).toBeDisabled();
  });

  it('submits the normalized email and confirms with it', async () => {
    const { user } = setup();
    await openEmailDialog(user);
    await user.type(currentPasswordField(), 'secret-pw');
    await user.type(newEmailField(), '  New.Vendor@Acme.COM ');
    await user.click(updateEmailButton());

    await waitFor(() =>
      expect(mocks.updateEmail).toHaveBeenCalledWith(USER_EMAIL, 'secret-pw', 'new.vendor@acme.com', true),
    );
    expect(mocks.addNotification).toHaveBeenCalledWith(
      'Check your inbox to verify your new vendor account email address: new.vendor@acme.com',
      'success',
    );
  });

  it('closes the dialog on success', async () => {
    const { user } = setup();
    await openEmailDialog(user);
    await user.type(currentPasswordField(), 'secret-pw');
    await user.type(newEmailField(), 'new@acme.com');
    await user.click(updateEmailButton());

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('keeps the dialog open and shows the error when updateEmail fails', async () => {
    mocks.updateEmail.mockResolvedValue({ error: 'Invalid password. Please check your password and try again.' });
    const { user } = setup();
    await openEmailDialog(user);
    await user.type(currentPasswordField(), 'wrong');
    await user.type(newEmailField(), 'new@acme.com');
    await user.click(updateEmailButton());

    await waitFor(() =>
      expect(mocks.addNotification).toHaveBeenCalledWith(
        'Invalid password. Please check your password and try again.',
        'error',
      ),
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(mocks.addNotification).not.toHaveBeenCalledWith(expect.stringContaining('Check your inbox'), 'success');
  });

  it('shows "Updating..." and disables the button while submitting', async () => {
    const d = deferred<{ error: null }>();
    mocks.updateEmail.mockReturnValue(d.promise);
    const { user } = setup();
    await openEmailDialog(user);
    await user.type(currentPasswordField(), 'secret-pw');
    await user.type(newEmailField(), 'new@acme.com');
    await user.click(updateEmailButton());

    expect(screen.getByRole('button', { name: 'Updating...' })).toBeDisabled();
    d.resolve({ error: null });
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('clears the fields when cancelled', async () => {
    const { user } = setup();
    await openEmailDialog(user);
    await user.type(currentPasswordField(), 'secret-pw');
    await user.type(newEmailField(), 'new@acme.com');
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

    await openEmailDialog(user);
    expect(currentPasswordField()).toHaveValue('');
    expect(newEmailField()).toHaveValue('');
    expect(mocks.updateEmail).not.toHaveBeenCalled();
  });

  it('toggles password visibility', async () => {
    const { user } = setup();
    const dialog = await openEmailDialog(user);
    expect(currentPasswordField()).toHaveAttribute('type', 'password');

    // The visibility toggle is the only unlabeled button inside the dialog.
    const toggle = Array.from(dialog.querySelectorAll('button')).find((b) => !b.textContent?.trim())!;
    await user.click(toggle);
    expect(currentPasswordField()).toHaveAttribute('type', 'text');
  });
});

describe('VendorSettings: change password', () => {
  it('opens the password dialog', async () => {
    const { user } = setup();
    expect(screen.queryByTestId('password-dialog')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /change password/i }));
    expect(screen.getByTestId('password-dialog')).toBeInTheDocument();
  });

  it('rejects mismatched passwords without calling the API', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: /change password/i }));
    await user.click(screen.getByText('submit-mismatched'));

    expect(mocks.addNotification).toHaveBeenCalledWith('New passwords do not match', 'error');
    expect(mocks.updatePassword).not.toHaveBeenCalled();
  });

  it('updates the password and closes the dialog', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: /change password/i }));
    await user.click(screen.getByText('submit-matching'));

    await waitFor(() => expect(mocks.updatePassword).toHaveBeenCalledWith(USER_EMAIL, 'old-pw', 'new-pw'));
    expect(mocks.addNotification).toHaveBeenCalledWith('Password updated successfully');
    expect(screen.queryByTestId('password-dialog')).not.toBeInTheDocument();
  });

  it('keeps the dialog open and shows the error on failure', async () => {
    mocks.updatePassword.mockResolvedValue({ error: 'Wrong current password' });
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: /change password/i }));
    await user.click(screen.getByText('submit-matching'));

    await waitFor(() => expect(mocks.addNotification).toHaveBeenCalledWith('Wrong current password', 'error'));
    expect(screen.getByTestId('password-dialog')).toBeInTheDocument();
  });
});