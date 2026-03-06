import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

/**
 * Playwright config for directory-app
 * Next.js (App Router) + Supabase session-based auth
 *
 * Docs: https://playwright.dev/docs/test-configuration
 */

// Only load .env.test locally — in CI, env vars are injected directly
if (process.env.CI !== 'true') {
  dotenv.config({ path: path.resolve(process.cwd(), '.env.test') });
}

export default defineConfig({
  // Directory where your E2E tests live
  testDir: './e2e',

  // Run all tests in parallel
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in source
  forbidOnly: !!process.env.CI,

  // Retry failed tests once on CI, never locally
  retries: process.env.CI ? 1 : 0,

  // Limit parallel workers on CI to avoid resource contention
  workers: process.env.CI ? 2 : undefined,

  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['list'],
  ],

  use: {
    baseURL: 'http://localhost:3000',

    // Collect traces for failed tests only (great for debugging CI failures)
    trace: 'on-first-retry',

    // Screenshot on failure
    screenshot: 'only-on-failure',

    // How long a single action (click, fill, etc.) can take
    actionTimeout: 10_000,

    // How long to wait for navigation
    navigationTimeout: 30_000,
  },

  projects: [
    // -----------------------------------------------------------------
    // Auth setup — runs once, logs in via Supabase, saves session cookie
    // so authenticated tests don't repeat the login flow every time.
    // -----------------------------------------------------------------
    {
      name: 'auth-setup',
      testMatch: '**/e2e/fixtures/auth.setup.ts',
    },

    // -----------------------------------------------------------------
    // Authenticated tests — depend on auth-setup running first
    // -----------------------------------------------------------------
    {
      name: 'chromium:authenticated',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/fixtures/.auth/session.json',
      },
      dependencies: ['auth-setup'],
      testMatch: '**/e2e/**/*.auth.spec.ts',
    },

    // -----------------------------------------------------------------
    // Public/unauthenticated tests — no login needed
    // -----------------------------------------------------------------
    {
      name: 'chromium:public',
      use: { ...devices['Desktop Chrome'] },
      testMatch: '**/e2e/**/*.public.spec.ts',
    },
  ],

  // Starts the Next.js dev server before tests run
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      NODE_ENV: 'test',
    },
  },
});