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
});

test.describe('Website Interest Card', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/partner/dashboard');
  });

  test('renders card with initial state', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Get a Business Website' })).toBeVisible();
    await expect(page.getByText('Interested in a professional website?')).toBeVisible();
    await expect(page.getByLabel("Yes, I'm interested")).toBeVisible();
    await expect(page.getByRole('button', { name: 'Submit' })).not.toBeVisible();
  });

  test('reveals priority options and submit button when checkbox is checked', async ({ page }) => {
    await page.getByLabel("Yes, I'm interested").check();
    await expect(page.getByText("What's most important to you?")).toBeVisible();
    await expect(page.getByText('Getting found on Google or AI search')).toBeVisible();
    await expect(page.getByText('Showcasing my portfolio and services')).toBeVisible();
    await expect(page.getByText('Looking more professional')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Submit' })).toBeVisible();
  });

  test('hides priority options when checkbox is unchecked', async ({ page }) => {
    await page.getByLabel("Yes, I'm interested").check();
    await expect(page.getByText("What's most important to you?")).toBeVisible();
    await page.getByLabel("Yes, I'm interested").uncheck();
    await expect(page.getByText("What's most important to you?")).not.toBeVisible();
    await expect(page.getByRole('button', { name: 'Submit' })).not.toBeVisible();
  });

  test('submits without priority selected', async ({ page }) => {
    await page.getByLabel("Yes, I'm interested").check();
    await page.getByRole('button', { name: 'Submit' }).click();
    await expect(page.getByText("Thanks! We'll be in touch soon.")).toBeVisible({ timeout: 15_000 });
  });

  test('submits with priority selected', async ({ page }) => {
    await page.getByLabel("Yes, I'm interested").check();
    await page.getByText('Getting found on Google or AI search').click();
    await page.getByRole('button', { name: 'Submit' }).click();
    await expect(page.getByText("Thanks! We'll be in touch soon.")).toBeVisible({ timeout: 15_000 });
  });

  test('deselects priority when clicked again', async ({ page }) => {
    await page.getByLabel("Yes, I'm interested").check();
    await page.getByText('Getting found on Google or AI search').click();
    await page.getByText('Getting found on Google or AI search').click();
    // can still submit without priority
    await page.getByRole('button', { name: 'Submit' }).click();
    await expect(page.getByText("Thanks! We'll be in touch soon.")).toBeVisible({ timeout: 15_000 });
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
    await expect(page.getByText("Thanks! We'll be in touch soon.")).toBeVisible();
    await expect(page.getByLabel("Yes, I'm interested")).not.toBeVisible();
  });
});