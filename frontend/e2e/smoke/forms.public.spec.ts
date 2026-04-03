import { test, expect } from '@playwright/test';
import { mockRecaptcha } from '../fixtures/mockRecaptcha';

test.beforeEach(async ({ page }) => {
  await mockRecaptcha(page);
  await page.route('**/api/contact**', (route) =>
    route.fulfill({ status: 200, json: { ok: true } })
  );
  await page.route('**/api/newsletter**', (route) =>
    route.fulfill({ status: 200, json: { ok: true } })
  );
});

test.describe('/recommend page', () => {
  test('renders page and form fields', async ({ page }) => {
    await page.goto('/recommend');
    await expect(page.getByRole('heading', { name: 'Suggest an Artist' })).toBeVisible();
    await expect(page.getByLabel('Artist or Business Name')).toBeVisible();
    await expect(page.getByLabel('Location')).toBeVisible();
    await expect(page.getByLabel('Website')).toBeVisible();
    await expect(page.getByLabel('Instagram')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Submit Recommendation' })).toBeVisible();
  });

  test('shows validation errors when required fields are empty', async ({ page }) => {
    await page.goto('/recommend');
    await page.getByRole('button', { name: 'Submit Recommendation' }).click();
    await expect(page.getByText('Business name is required')).toBeVisible();
    await expect(page.getByText('Location is required')).toBeVisible();
  });

  test('clears validation errors when required fields are filled', async ({ page }) => {
    await page.goto('/recommend');
    await page.getByRole('button', { name: 'Submit Recommendation' }).click();
    await expect(page.getByText('Business name is required')).toBeVisible();

    await page.getByLabel('Artist or Business Name').fill('Test Artist');
    await page.getByLabel('Location').fill('New York, NY');
    await page.getByRole('button', { name: 'Submit Recommendation' }).click();

    await expect(page.getByText('Business name is required')).not.toBeVisible();
    await expect(page.getByText('Location is required')).not.toBeVisible();
  });

  test('submits form and shows success notification', async ({ page }) => {

    await page.goto('/recommend');

    await page.getByLabel('Artist or Business Name').fill('E2E Test Artist');
    await page.getByLabel('Location').fill('New York, NY');

    await page.getByRole('button', { name: 'Submit Recommendation' }).click();

    // reCAPTCHA executes invisibly; wait for the server action to complete
    await expect(page.getByText('Thank you! Your recommendation has been submitted.')).toBeVisible({
      timeout: 15_000,
    });
  });
});

test.describe('/contact page', () => {
  test.beforeEach(async ({ page }) => {
    // Mock the HubSpot submission API so no real requests are sent
    await page.route('**/api.hsforms.com/**', (route) =>
      route.fulfill({ status: 200, json: { inlineMessage: 'Form submitted' } })
    );
  });

  test('renders page and form fields', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.getByRole('heading', { name: 'Contact Us' })).toBeVisible();
    // Filter to the contact form specifically — the newsletter form on the same
    // page also has a "Your Email" field, so we scope by unique text.
    const form = page.locator('form').filter({ hasText: 'First Name' });
    await expect(form.getByLabel('First Name')).toBeVisible();
    await expect(form.getByLabel('Last Name')).toBeVisible();
    await expect(form.getByLabel('Your Email')).toBeVisible();
    await expect(form.getByLabel('Reason for Contacting')).toBeVisible();
    await expect(form.getByLabel('Message')).toBeVisible();
    await expect(form.getByRole('button', { name: 'Submit' })).toBeVisible();
  });

  test('submits form and shows success message', async ({ page }) => {
    await page.goto('/contact');
    const form = page.locator('form').filter({ hasText: 'First Name' });

    await form.getByLabel('First Name').fill('Jane');
    await form.getByLabel('Last Name').fill('Smith');
    await form.getByLabel('Your Email').fill('jane@example.com');

    // Open MUI select dropdown and pick a reason
    await form.getByLabel('Reason for Contacting').click();
    await page.getByRole('option', { name: 'General Inquiry' }).click();

    await form.getByLabel('Message').fill('This is a smoke test message.');

    await form.getByRole('button', { name: 'Submit' }).click();

    await expect(page.getByText("Thank you! We'll get back to you soon.")).toBeVisible();
  });
});

test.describe('/partner/contact page', () => {
  test.beforeEach(async ({ page }) => {
    // Mock the HubSpot submission API so no real requests are sent
    await page.route('**/api.hsforms.com/**', (route) =>
      route.fulfill({ status: 200, json: { inlineMessage: 'Form submitted' } })
    );
  });

  test('renders page and form fields', async ({ page }) => {
    await page.goto('/partner/contact');
    await expect(page.getByRole('heading', { name: 'Contact Us' })).toBeVisible();
    const form = page.locator('form').filter({ hasText: 'First Name' });
    await expect(form.getByLabel('First Name')).toBeVisible();
    await expect(form.getByLabel('Last Name')).toBeVisible();
    await expect(form.getByLabel('Your Email')).toBeVisible();
    await expect(form.getByLabel('Reason for Contacting')).toBeVisible();
    await expect(form.getByLabel('Message')).toBeVisible();
    await expect(form.getByRole('button', { name: 'Submit' })).toBeVisible();
  });

  test('submits form and shows success message', async ({ page }) => {
    await page.goto('/partner/contact');
    const form = page.locator('form').filter({ hasText: 'First Name' });

    await form.getByLabel('First Name').fill('Jane');
    await form.getByLabel('Last Name').fill('Smith');
    await form.getByLabel('Your Email').fill('jane@example.com');

    await form.getByLabel('Reason for Contacting').click();
    await page.getByRole('option', { name: 'General Inquiry' }).click();

    await form.getByLabel('Message').fill('This is a smoke test message.');

    await form.getByRole('button', { name: 'Submit' }).click();

    await expect(page.getByText("Thank you! We'll get back to you soon.")).toBeVisible();
  });
});
