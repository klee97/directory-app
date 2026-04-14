import { test, expect } from '@playwright/test';
import { mockRecaptcha } from '../fixtures/mockRecaptcha';
import { mockAirtable } from '../fixtures/mockAirtable';
import { fillField } from '../fixtures/formHelpers';

test.beforeEach(async ({ page }) => {
  await mockRecaptcha(page);
  await mockAirtable(page);
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

    await fillField(page.getByLabel('Artist or Business Name'), 'Test Artist');
    await fillField(page.getByLabel('Location'), 'New York, NY');
    await page.getByRole('button', { name: 'Submit Recommendation' }).click();

    await expect(page.getByText('Business name is required')).not.toBeVisible();
    await expect(page.getByText('Location is required')).not.toBeVisible();
  });

  test('submits form and shows success notification', async ({ page }) => {
    await page.goto('/recommend');

    await fillField(page.getByLabel('Artist or Business Name'), 'E2E Test Artist');
    await fillField(page.getByLabel('Location'), 'New York, NY');

    const submitButton = page.getByRole('button', { name: 'Submit Recommendation' });
    await submitButton.scrollIntoViewIfNeeded();
    await submitButton.click();

    await expect(page.getByText('Thank you! Your recommendation has been submitted.')).toBeVisible({
      timeout: 15_000,
    });
  });
});

test.describe('/contact page', () => {
  test('renders page and form fields', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.getByRole('heading', { name: 'Contact Us' })).toBeVisible();
    const form = page.getByTestId('email-form');
    await expect(form.getByLabel('First Name')).toBeVisible();
    await expect(form.getByLabel('Last Name')).toBeVisible();
    await expect(form.getByLabel('Your Email')).toBeVisible();
    await expect(form.getByLabel('Reason for Contacting')).toBeVisible();
    await expect(form.getByLabel('Message')).toBeVisible();
    await expect(form.getByRole('button', { name: 'Submit' })).toBeVisible();
  });

  test('submits form and shows success message', async ({ page }) => {
    await page.goto('/contact');
    const form = page.getByTestId('email-form');

    await fillField(form.getByLabel('First Name'), 'Jane');
    await fillField(form.getByLabel('Last Name'), 'Smith');
    await fillField(form.getByLabel('Your Email'), 'jane@example.com');

    await form.getByLabel('Reason for Contacting').click();
    await page.getByRole('option', { name: 'General Inquiry' }).click();

    await fillField(form.getByLabel('Message'), 'This is a smoke test message.');

    const submitButton = form.getByRole('button', { name: 'Submit' });
    await submitButton.scrollIntoViewIfNeeded();
    await submitButton.click();

    await expect(page.getByText("Thank you! We'll get back to you soon.")).toBeVisible({
      timeout: 15_000,
    });
  });
});

test.describe('/partner/contact page', () => {
  test('renders page and form fields', async ({ page }) => {
    await page.goto('/partner/contact');
    await expect(page.getByRole('heading', { name: 'Contact Us' })).toBeVisible();
    const form = page.getByTestId('email-form');
    await expect(form.getByLabel('First Name')).toBeVisible();
    await expect(form.getByLabel('Last Name')).toBeVisible();
    await expect(form.getByLabel('Your Email')).toBeVisible();
    await expect(form.getByLabel('Reason for Contacting')).toBeVisible();
    await expect(form.getByLabel('Message')).toBeVisible();
    await expect(form.getByRole('button', { name: 'Submit' })).toBeVisible();
  });

  test('submits form and shows success message', async ({ page }) => {
    await page.goto('/partner/contact');
    const form = page.getByTestId('email-form');

    await fillField(form.getByLabel('First Name'), 'Jane');
    await fillField(form.getByLabel('Last Name'), 'Smith');
    await fillField(form.getByLabel('Your Email'), 'jane@example.com');

    await form.getByLabel('Reason for Contacting').click();
    await page.getByRole('option', { name: 'General Inquiry' }).click();

    await fillField(form.getByLabel('Message'), 'This is a smoke test message.');

    const submitButton = form.getByRole('button', { name: 'Submit' });
    await submitButton.scrollIntoViewIfNeeded();
    await submitButton.click();

    await expect(page.getByText("Thank you! We'll get back to you soon.")).toBeVisible({
      timeout: 15_000,
    });
  });
});