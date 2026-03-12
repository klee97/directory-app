/**
 * Runs once before any test suite.
 * Resets the local Supabase DB (re-runs migrations + seed.sql)
 * so every test run starts from a clean, predictable state.
 *
 * Picked up automatically by the 'supabase-setup' project in playwright.config.ts
 */

import { test as setup } from '@playwright/test';
import { execSync } from 'child_process';

setup('reset local supabase db', async () => {
  if (process.env.CI === 'true') {
    console.log('CI detected — skipping db reset (handled by workflow)');
    return;
  }
  execSync('npx supabase db reset', { stdio: 'inherit' });
});

setup.setTimeout(60_000);