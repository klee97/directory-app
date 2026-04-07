/**
 * Runs once before any mobile vendor-authenticated test suite.
 */

import { test as setup } from '@playwright/test';
import path from 'path';
import { loginAndSaveSession } from './auth.helpers';

export const VENDOR_SESSION_FILE = path.join(import.meta.dirname, '.auth/vendor-mobile-session.json');

setup('authenticate as vendor via Supabase', async ({ page }) => {
  const email = process.env.TEST_VENDOR_EMAIL;
  const password = process.env.TEST_VENDOR_PASSWORD;
  await loginAndSaveSession(page, VENDOR_SESSION_FILE, email, password, '/partner/login', '/partner/dashboard');
});