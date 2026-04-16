/**
 * Runs once before any test suite.
 * Resets the local Supabase DB (re-runs migrations + seed.sql)
 * so every test run starts from a clean, predictable state.
 *
 * Picked up automatically by the 'supabase-setup' project in playwright.config.ts
 */

import { test as setup } from '@playwright/test';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const SESSION_DIR = path.join(import.meta.dirname, '.auth');

setup('reset local supabase db', async () => {
  if (process.env.CI === 'true') {
    console.log('CI detected — skipping db reset (handled by workflow)');
    return;
  }
  execSync('npx supabase db reset', { stdio: 'inherit' });

  // Clear cached session files — DB reset invalidates all refresh tokens,
  // so auth fixtures must re-login on the next run.
  if (fs.existsSync(SESSION_DIR)) {
    for (const file of fs.readdirSync(SESSION_DIR)) {
      if (file.endsWith('.json')) {
        fs.unlinkSync(path.join(SESSION_DIR, file));
      }
    }
  }
});

setup.setTimeout(60_000);