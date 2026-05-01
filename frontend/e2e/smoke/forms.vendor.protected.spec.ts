import { login } from '../fixtures/auth.helpers';
import { test, expect } from '../fixtures/fixtures';
import { mockAirtable } from '../fixtures/mockAirtable';
import { vendorSubmittedInterestAccount } from '../fixtures/testUsers';

// eslint-disable-next-line react-hooks/rules-of-hooks
test.use({ storageState: ({ vendorWorkerStorageState }, use) => use(vendorWorkerStorageState) });

test.beforeEach(async ({ page }) => {
  await mockAirtable(page);
  await page.route('**/api/airtable/website-interest**', (route) =>
    route.fulfill({ status: 200, json: { ok: true } })
  );
  await page.route('**/api/airtable/premium-interest**', (route) =>
    route.fulfill({ status: 200, json: { ok: true } })
  );
});

test.describe('Website Interest Card', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/partner/dashboard');
  });

  test('renders card with initial state', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Get a Business Website' })).toBeVisible();
    await expect(page.getByText('Interested in a professional website?')).toBeVisible();
    await expect(page.getByTestId('priority-select')).not.toBeVisible();
    await expect(page.getByRole('button', { name: 'Submit' })).not.toBeVisible();
  });

  test('reveals priority dropdown and submit button when checkbox is checked', async ({ page }) => {
    await page.getByLabel("Yes, I'm interested").check();
    await expect(page.getByTestId('priority-select')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Submit' })).toBeVisible();
  });

  test('hides priority dropdown when checkbox is unchecked', async ({ page }) => {
    await page.getByLabel("Yes, I'm interested").check();
    await expect(page.getByTestId('priority-select')).toBeVisible();
    await page.getByLabel("Yes, I'm interested").check();
    await expect(page.getByTestId('priority-select')).not.toBeVisible();
    await expect(page.getByRole('button', { name: 'Submit' })).not.toBeVisible();
  });

  test('submits without priority selected', async ({ page }) => {
    await page.getByLabel("Yes, I'm interested").check();
    await page.getByRole('button', { name: 'Submit' }).click();
    await expect(page.getByText("Thanks for your interest! We'll be in touch soon.")).toBeVisible({ timeout: 15_000 });
  });

  test('submits with priority selected', async ({ page }) => {
    await page.getByLabel("Yes, I'm interested").check();
    await page.getByTestId('priority-select').click();
    await page.getByRole('option', { name: 'Getting found on Google or AI search' }).click();
    await page.getByRole('button', { name: 'Submit' }).click();
    await expect(page.getByText("Thanks for your interest! We'll be in touch soon.")).toBeVisible({ timeout: 15_000 });
  });

  test('shows error state when submission fails', async ({ page }) => {
    await page.route('**/api/airtable/website-interest**', (route) =>
      route.fulfill({ status: 502, json: { error: 'Failed to submit.' } })
    );
    await page.getByLabel("Yes, I'm interested").check();
    await page.getByRole('button', { name: 'Submit' }).click();
    await expect(page.getByText('Something went wrong. Please try again.')).toBeVisible({ timeout: 15_000 });
  });
});

test.describe('Website Interest Card — already submitted', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  const { email, password } = vendorSubmittedInterestAccount;

  test.beforeEach(async ({ page }) => {
    await login(page, email, password, '/partner/login', '/partner/dashboard');
  });

  test('shows success state immediately if already submitted', async ({ page }) => {
    await page.goto('/partner/dashboard');
    await expect(page.getByText("Thanks for your interest! We'll be in touch soon.")).toBeVisible();
    await expect(page.getByLabel("Yes, I'm interested")).not.toBeVisible();
  });
});

test.describe('Premium Waitlist Card', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/partner/dashboard');
  });

  test('renders card with initial state', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Join Premium' })).toBeVisible();
    await expect(page.getByText("We're working on Premium profiles")).toBeVisible();
    await expect(page.getByRole('button', { name: 'Join Waitlist' })).toBeVisible();
  });

  test('submits and shows success state', async ({ page }) => {
    await page.getByRole('button', { name: 'Join Waitlist' }).scrollIntoViewIfNeeded();
    await page.getByRole('button', { name: 'Join Waitlist' }).click();
    await expect(page.getByText("You're on the list!")).toBeVisible({ timeout: 15_000 });
  });

  test('shows error state when submission fails', async ({ page }) => {
    await page.route('**/api/airtable/premium-interest**', (route) =>
      route.fulfill({ status: 502, json: { error: 'Failed to submit.' } })
    );
    await page.getByRole('button', { name: 'Join Waitlist' }).click();
    await expect(page.getByText('Something went wrong. Please try again.')).toBeVisible({ timeout: 15_000 });
  });
});

test.describe('Premium Waitlist Card — already submitted', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  const { email, password } = vendorSubmittedInterestAccount;

  test.beforeEach(async ({ page }) => {
    await login(page, email, password, '/partner/login', '/partner/dashboard');
  });

  test('shows success state immediately if already submitted', async ({ page }) => {
    await page.goto('/partner/dashboard');
    await expect(page.getByText("You're on the list!")).toBeVisible();
    await expect(page.getByRole('button', { name: 'Join Waitlist' })).not.toBeVisible();
  });
});