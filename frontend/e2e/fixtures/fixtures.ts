import { test as base } from '@playwright/test';
import path from 'path';
import { userWorkerAccounts, vendorWorkerAccounts } from './testUsers';
import { loginAndSaveSession } from './auth.helpers';

const SESSION_DIR = path.join(import.meta.dirname, '.auth');


/**
 * Custom Playwright test fixtures for worker-scoped authentication.
 *
 * This module extends Playwright's base `test` object with two worker-scoped
 * fixtures — `userWorkerStorageState` and `vendorWorkerStorageState` — that
 * handle session management for parallel test execution.
 *
 * How it works:
 * - Each Playwright worker is assigned a dedicated test account (user or vendor)
 *   based on its `parallelIndex`, ensuring no two workers share credentials.
 * - On first use, the fixture launches a browser, logs in via the appropriate
 *   login route, and persists the session to a JSON file under `.auth/`.
 * - On subsequent runs (or across tests within the same worker), the cached
 *   session file is reused, skipping the login step entirely.
 *
 * Usage:
 *   Import `test` from this file instead of `@playwright/test`, then pass the
 *   storage state path to `browser.newContext()` in your test setup:
 *
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export const test = base.extend<{}, {
  userWorkerStorageState: string,
  vendorWorkerStorageState: string
}>({
  userWorkerStorageState: [async ({ browser }, use, workerInfo) => {
    const account = userWorkerAccounts[workerInfo.parallelIndex];
    if (!account) {
      throw new Error(`No userWorkerAccount for parallelIndex ${workerInfo.parallelIndex}.`);
    }
    const sessionFile = path.join(SESSION_DIR, `worker-${workerInfo.parallelIndex}.json`);

    // Only log in if session doesn't already exist for this worker
    const fs = await import('fs');
    if (!fs.existsSync(sessionFile)) {
      const context = await browser.newContext({
        baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000',
      });
      const page = await context.newPage();
      await loginAndSaveSession(page, sessionFile, account.email, account.password, '/login', '/');
      await page.close();
    }

    await use(sessionFile);
  }, { scope: 'worker' }],

  vendorWorkerStorageState: [async ({ browser }, use, workerInfo) => {
    const account = vendorWorkerAccounts[workerInfo.parallelIndex];
    if (!account) {
      throw new Error(`No vendorWorkerAccount for parallelIndex ${workerInfo.parallelIndex}.`);
    }
    const sessionFile = path.join(SESSION_DIR, `vendor-worker-${workerInfo.parallelIndex}.json`);

    const fs = await import('fs');
    if (!fs.existsSync(sessionFile)) {
      const context = await browser.newContext({
        baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000',
      });
      const page = await context.newPage();
      await loginAndSaveSession(page, sessionFile, account.email, account.password, '/partner/login', '/partner/dashboard');
      await page.close();
    }

    await use(sessionFile);
  }, { scope: 'worker' }]
});


export { expect } from '@playwright/test';