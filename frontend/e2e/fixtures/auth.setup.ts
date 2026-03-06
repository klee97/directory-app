/**
 * Runs once before any authenticated test suite.
 * Logs in via Supabase, saves session cookies to a file so every
 * authenticated test can reuse them without re-logging in.
 *
 * Picked up automatically by the 'auth-setup' project in playwright.config.ts
 */

import { test as setup, expect } from '@playwright/test';
import path from 'path';

const SESSION_FILE = path.join(import.meta.dirname, '.auth/session.json');

setup('authenticate via Supabase', async ({ page }) => {
  const email = process.env.TEST_USER_EMAIL;
  const password = process.env.TEST_USER_PASSWORD;

  if (!email || !password) {
    throw new Error(
      'Missing TEST_USER_EMAIL or TEST_USER_PASSWORD env vars.\n' +
      'Add them to your .env.test file (see .env.test.example).'
    );
  }

  // Navigate to your login page
  await page.goto('/login');

  // Fill in credentials — update selectors to match your login form
  await page.getByLabel('Email Address').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByTestId('login-submit').click();

  // Sanity check — assert something only visible when logged in
  await expect(page.getByTestId('profile-button')).toBeVisible();

  // Save full browser storage state (cookies + localStorage)
  // This captures Supabase sb-access-token and sb-refresh-token cookies
  await page.context().storageState({ path: SESSION_FILE });
});