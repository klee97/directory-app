/**
 * Runs once before any mobile authenticated test suite.
 */

import { test as setup } from '@playwright/test';
import path from 'path';
import { loginAndSaveSession } from './auth.helpers';

const SESSION_FILE = path.join(import.meta.dirname, '.auth/mobile-session.json');

setup('authenticate via Supabase', async ({ page }) => {
  const email = process.env.TEST_USER_EMAIL;
  const password = process.env.TEST_USER_PASSWORD;
  await loginAndSaveSession(page, SESSION_FILE, email, password, '/login', '/');
});