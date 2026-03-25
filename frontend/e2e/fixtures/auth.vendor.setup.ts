/**
 * Runs once before any vendor-authenticated test suite.
 * Logs in as a vendor user, saves session to a separate file.
 */

import { test as setup, expect } from '@playwright/test';
import path from 'path';

export const VENDOR_SESSION_FILE = path.join(import.meta.dirname, '.auth/vendor-session.json');

setup('authenticate as vendor via Supabase', async ({ page }) => {
  const email = process.env.TEST_VENDOR_EMAIL;
  const password = process.env.TEST_VENDOR_PASSWORD;

  if (!email || !password) {
    throw new Error(
      'Missing TEST_VENDOR_EMAIL or TEST_VENDOR_PASSWORD env vars.\n' +
      'Add them to your .env.test file (see .env.test.example).'
    );
  }

  await page.goto('/partner/login');

  await page.getByLabel('Email Address').fill(email);
  await page.getByLabel('Password').fill(password);
  const submitButton = page.getByTestId('login-submit');
  await expect(submitButton).toBeEnabled();
  await submitButton.click();

  await page.waitForURL((url) => url.pathname.includes('/partner/dashboard'), { timeout: 10_000 });

  await expect(page.getByTestId('profile-button')).toBeVisible();

  await page.context().storageState({ path: VENDOR_SESSION_FILE });
});